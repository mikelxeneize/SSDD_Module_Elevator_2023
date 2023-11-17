const fs = require('fs');

const comunication = require('./comunication');

const pubBrokerAscensor = '/ascensores/publish';

const subscribeBrokerState = '/cambio/subscribe';

var pollBrokerState = '/cambio/poll';

var pubBrokerState = '/cambio/publish';

const clientmqtt = mqtt.connect("mqtt://test.mosquitto.org");

const topic = 'ssdd2023/ascensor'

const fileName = process.argv[2]; // 3er parametro que le paso al script, el archivo json con los datos del ascensor

const timeInFloor = 2000; // 2 segundos por piso

const timeAvilable = 30000 // 30 segundos disponible antes de ponerse oscioso

const timeBetweenPoll = 5000 // 5 segundo entre consulta y consulta 
//------------------------------------------------Probablemente este metodo se tenga que cambiar porque el otro grupo no manda un archivo -------------------------
var elevator = {};

if (fs.existsSync(fileName) && fs.lstatSync(fileName).isFile()) {
    const contenidoJSON = fs.readFileSync(fileName, 'utf8');
    elevator = JSON.parse(contenidoJSON);
} else {
    elevator = JSON.parse(fileName);
}
elevator.pisoNuevo = 0;
//elevator tiene los siguientes datos:
// id: id del ascensor
//nombre: nombre del ascensor
// pisos: pisos del ascensor
// estado: estado del ascensor
// pisoact: piso actual del ascensor
// pisotarget: piso al que se dirige el ascensor

//yo publico con solicitud false
clientmqtt.on('connect', () => {
    clientmqtt.subscribe(topic, (err) => {
        if (err) {
            console.error('No me suscribi al topico:', err);
        } else {
            console.log(`Me suscribi al topico ${topic}`);
        }
    });
});
comunication.sendDataSync(pubBrokerAscensor, elevator); // publico el ascensor en el broker
comunication.sendDataSync(subscribeBrokerState, elevator)// me suscribo al topic de estado del ascensor en el broker
    .then(async (result) => {
        const idSuscribeState = JSON.parse(result).id; //id de la suscripcion
        console.log("me suscribi al topic de estado del ascensor");
        console.log("id suscripcion:", idSuscribeState);
        pollBrokerState = pollBrokerState + `?id=${idSuscribeState}`; // agrego el id de la suscripcion a la url
        pubBrokerState = pubBrokerState + `?id=${idSuscribeState}`; // agrego el id de la suscripcion a la url
        while (true) {
            comunication.getDataSync(pollBrokerState) // hago un get al broker en el topico cambio de estado
                .then((resultGet) => {
                    console.log("respuesta:" + resultGet)
                    const arrayResult = JSON.parse(resultGet);
                    var elevatorReceive = null
                    for (const object of arrayResult) { //recorro el arreglo y lo transformo en un objeto al ultimo que tengo
                        if (elevator.id == object.idAscensor && object.solicitud == true) { // true para no pisarme, ya que yo mando siempre false
                            elevatorReceive = object //ascensor que recibo del get
                        }
                    }
                    if (elevatorReceive !== null) { // si es nulo, no tengo ningun cambio de estado solicitado
                        console.log("recibi un cambio de estado");
                        console.log(elevatorReceive);
                        comunication.sendDataSync(pubBrokerState, { // mando confirmacion del cambio de estado
                            "idAscensor": elevator.id,
                            "estado": elevatorReceive.estado,
                            "piso": elevatorReceive.piso,
                            "pisoNuevo": elevatorReceive.pisoNuevo,
                            "solicitud": false
                        })
                        console.log("se envio confirmacion de cambio de estado")
                        estadoRecividoMayuscula = elevatorReceive.estado.toUpperCase()
                        if (elevator.estado == 'OCIOSO' && estadoRecividoMayuscula == 'OCUPADO') {
                            elevator.pisoNuevo = elevatorReceive.pisoNuevo; // asigno al ascensor hasta que piso me voy a mover
                            elevator.estado = 'OCUPADO'
                            moveElevator(elevator, 0)
                                .then(result => {
                                    console.log("Elevador llegó a su destino:", result);
                                    elevator.estado = 'DISPONIBLE' // estoy disponible en el piso 0
                                    comunication.sendDataSync(pubBrokerState, {
                                        "idAscensor": elevator.id,
                                        "estado": elevator.estado,
                                        "piso": 0,
                                        "pisoNuevo": elevatorReceive.pisoNuevo,
                                        "solicitud": false
                                    })
                                })
                                .catch(error => {
                                    console.error("Error:", error);
                                    console.error("El elevador no llegó a su destino. (piso 0)");
                                });
                        }
                        else if (elevator.estado == 'DISPONIBLE' && estadoRecividoMayuscula == 'OCUPADO') {
                            var pisoFinal = elevator.pisoNuevo; // piso al que me voy a mover
                            elevator.estado = 'OCUPADO'
                            moveElevator(elevator, pisoFinal)
                                .then(result => {
                                    console.log("Elevador llegó a su destino:", result);
                                })
                                .catch(error => {
                                    console.error("Error:", error);
                                    console.error(`El elevador no llegó a su destino.piso ${pisoFinal}`);
                                });
                        }
                        else if (elevator.estado == 'OCUPADO' && estadoRecividoMayuscula == 'OCIOSO') {
                            elevator.estado = 'OCIOSO'
                            comunication.sendDataSync(pubBrokerState, {
                                "idAscensor": elevator.id,
                                "estado": elevator.estado,
                                "piso": elevator.pisoact,
                                "pisoNuevo": elevatorReceive.pisoNuevo,
                                "solicitud": false
                            })
                        }
                    }

                })
                .catch(error => {
                    if (error == 'Error 204')
                        console.log('No hay cambios nuevos');
                    else
                        console.error('Error:', error);
                });
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("esperando cambio de estado");
        }
    })
    .catch((err) => {
        console.log(err);
    });


function moveElevator(data, floorToGo) {
    return new Promise((resolve, reject) => {
        console.log('----------------Data:' + JSON.stringify(data));
        let aux;
        if (floorToGo == 0)
            aux = data.pisoact;
        else
            aux = floorToGo;

        function moveOneFloor() {
            if (aux > 0) {
                if (floorToGo == 0)
                    data.pisoact -= 1;
                else
                    data.pisoact += 1;

                comunication.sendDataSync(pubBrokerState, {
                    "idAscensor": data.id,
                    "estado": data.estado,
                    "piso": data.pisoact,
                    "pisoNuevo": data.pisoNuevo,
                    "solicitud": false
                }); // publico el estado del ascensor en el broker por cada piso que pasa

                console.log(`Ascensor ${data.id} en piso ${data.pisoact}`);

                aux--;
                setTimeout(moveOneFloor, 1000); // Espera 1 segundo antes de moverse al siguiente piso
            } else {
                resolve(data); // Resuelve la promesa cuando ha alcanzado todos los pisos
            }
        }

        moveOneFloor();
    });
}
