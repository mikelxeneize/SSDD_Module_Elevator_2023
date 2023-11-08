const fs = require('fs');

const comunication = require('./comunication');

//const comunication2 = require('./SelectorAscensorClienteBroker');

const pubBrokerAscensor = '/ascensores/publish';

const subscribeBrokerState = '/cambio/subscribe';

var pollBrokerState = '/cambio/poll';

var pubBrokerState = '/cambio/publish';

const fileName = process.argv[2]; // 3er parametro que le paso al script, el archivo json con los datos del ascensor

const timeInFloor = 2000; // 2 segundos por piso

const timeAvilable = 30000 // 30 segundos disponible antes de ponerse oscioso

const timeBetweenPoll = 1000 // 1 segundo entre consulta y consulta 

//lectura del archivo json sincronico
const contenidoJSON = fs.readFileSync(fileName, 'utf8');
var elevator = JSON.parse(contenidoJSON);
// hasta aca sabemos que funciona

comunication.sendDataSync(pubBrokerAscensor, elevator); // publico el ascensor en el broker
comunication.sendDataSync(subscribeBrokerState, elevator)// me suscribo al topic de estado del ascensor en el broker
    .then(async (result) => {
        const idSuscribeState = JSON.parse(result).id;
        console.log("me suscribi al topic de estado del ascensor");
        console.log("id suscripcion:", idSuscribeState);
        pollBrokerState = pollBrokerState + `?id=${idSuscribeState}`;
        pubBrokerState = pubBrokerState + `?id=${idSuscribeState}`;
        while (true) {
            comunication.getDataSync(pollBrokerState) // hago un get al broker en el topico cambio de estado
                .then((data) => {
                    console.log("respuesta:" + data)
                    const respuestaObjeto = JSON.parse(data);
                    var ascensor = null
                    for (const objeto of respuestaObjeto) {
                        if (elevator.id == objeto.idAscensor && objeto.solicitud == true) {
                            ascensor = objeto
                        }
                    }
                    console.log(respuestaObjeto.toString());
                    if (ascensor !== null) { // si es nulo, no tengo ningun cambio de estado solicitado
                        console.log("recibi un cambio de estado");
                        console.log(ascensor);
                        comunication.sendDataSync(pubBrokerState, { // mando confirmacion del cambio de estadp
                            "idAscensor": elevator.id,
                            "estado": ascensor.estado,
                            "piso": ascensor.piso,
                            "pisoNuevo": ascensor.pisoNuevo,
                            "solicitud": false
                        })
                        console.log("se envio cambio de estado")
                        if (elevator.estado == 'OCIOSO' && ascensor.estado == 'OCUPADO') {    
                            elevator.pisoNuevo = ascensor.pisoNuevo
                            elevator.estado = 'OCUPADO'
                            moveElevator(elevator, 0);// muevo el ascensor al 0, bajo
                            elevator.estado = 'DISPONIBLE'
                            comunication.sendDataSync(pubBrokerState, {
                                "idAscensor": elevator.id,
                                "estado": elevator.estado,
                                "piso": 0,
                                "pisoNuevo": ascensor.pisoNuevo,
                                "solicitud": false
                            })
                        }
                        else if (elevator.estado == 'DISPONIBLE' && ascensor.estado == 'OCUPADO') {
                            console.log("se envio cambio de estado")
                            moveElevator(elevator, ascensor.pisoNuevo);// muevo el ascensor al 0, bajo
                            elevator.estado = 'OCUPADO'
                            comunication.sendDataSync(pubBrokerState, {
                                "idAscensor": elevator.id,
                                "estado": elevator.estado,
                                "piso": 0,
                                "pisoNuevo": ascensor.pisoNuevo,
                                "solicitud": false
                            })
                        }

                        // aca me tengo que fijar si hay un ocupado si yo estoy disponible en el brker
                        /*waitInformation(timeAvilable)
                            .then(async (result) => { // si recibio un nuevo cambio de estado, de disponible a ocupado
                                elevator.state = result.estado
                                elevator.pisoNuevo = result.pisoNuevo
                                comunication.sendDataSync(pubBrokerState,{
                                    "idAscensor": elevator.id,
                                    "estado": elevator.estado,
                                    "piso": result.piso,
                                    "pisoNuevo": result.pisoNuevo,
                                    "solicitud": false
                                })
                                moveElevator(result, result.pisoNuevo) // muevo el ascensor al piso nuevo
                            })
                            .catch((err) => { // si no se recibio ningun cambio de estado en 30 segundos, el ascensor se va a oscioso
                                elevator.state = 'OCIOSO'
                                comunication.sendDataSync(pubBrokerState,{
                                    "idAscensor": elevator.id,
                                    "estado": elevator.estado,
                                    "piso": elevator.piso,
                                    "pisoNuevo": elevator.pisoNuevo,
                                    "solicitud": false
                                })
                            });*/
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
        }//
    })
    .catch((err) => {
        console.log(err);
    });


function moveElevator(data, floorToGo) {
    let toGo = Math.abs(data.pisoact - floorToGo); // cantidad de pisos que tiene que subir o bajar
    let aux = data.pisoact;
    for (let i = 0; i < aux; i++) { // recorro los pisos
        new Promise(resolve => setTimeout(resolve, timeInFloor)); // espera 5 segundos por piso
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
        }) // publico el estado del ascensor en el broker por cada piso que pasa
        console.log(`Ascensor ${elevator.id} en piso ${data.pisoact}`); // no existe currentFloor
    }
}

async function waitInformation(timewait) { // funciona como un timeout, espera 30 segundos a que llegue un cambio de estado
    if (timewait == timeAvilable) { // me fijo si la actualizacion que busco es de disponible, o de cambio de estado
        return new Promise((resolve, reject) => {
            let cont = 0;
            const interval = setInterval(async () => {
                cont++;
                if (cont >= timewait / 1000) {  // Verificar si ha pasado el tiempo límite (30 segundos)
                    clearInterval(interval);
                    reject(1);
                }
                comunication.getDataSync(pollBrokerState)
                    .then(actData => {
                        var valornuevo = null
                        actData = JSON.parse(actData)
                        for (const objeto of actData) {
                            if (elevator.id == objeto.idAscensor && objeto.solicitud == true) {
                                valornuevo = objeto
                            }
                        }
                        //aca tendria que ver como conectarlo con el broker mqtt del sensor
                        if (valornuevo !== null) {
                            resolve(valornuevo);
                        }
                    })
                    .catch(error => {
                        if (error == 'Error 204')
                            console.log('No hay cambios nuevos');
                        else
                            console.error('Error:', error);
                    });
            }, 1000); // Espera 1 segundo (1000 milisegundos) antes de verificar nuevamente
        });
    }
}
