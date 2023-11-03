const fs = require('fs');

const comunication = require('./comunication');

const pubBrokerAscensor = 'http://localhost:3000/api/ascensores/publish';

const subscribeBrokerState = 'http://localhost:3000/api/cambio/subscribe';

const pollBrokerState = 'http://localhost:3000/api/cambio/poll';

const pubBrokerState = 'http://localhost:3000/api/cambio/publish';

const fileName = process.argv[2]; // 3er parametro que le paso al script, el archivo json con los datos del ascensor

const timeInFloor = 5000; // 5 segundos por piso

const timeAvilable = 30000 // 30 segundos disponible antes de ponerse oscioso

const timeBetweenPoll = 1000 // 1 segundo entre consulta y consulta 

var elevator = null; // objeto ascensor

fs.readFile(fileName, 'utf8', (err, data) => { // leo el archivo json
    if (err) {
        console.log("Error en la lectura del archivo",err);
        return;
    }
    elevator = JSON.parse(data) // parseo el json a objeto, creando un objeto Ascensor, creo que la clase ascensor esta al pedo
    console.log(elevator);
})

comunication.sendData(pubBrokerAscensor, elevator); // publico el ascensor en el broker
const idPublishElevator = comunication.sendData(subscribeBrokerState, elevator); // me suscribo al topic de estado del ascensor en el broker
while (true){ 
    waitInformation()
    .then ((result) => { // si recibo un cambio de estado
        elevator.state=result.estado
        elevator.pisoNuevo=result.pisoNuevo
        comunication.sendData(pubBrokerState, {
            "idAscensor": elevator.id,
            "estado": elevator.estado,
            "piso": result.piso,
            "pisoNuevo": result.pisoNuevo
        })
        moveElevator(result,0);// muevo el ascensor al 0, bajo
        elevator.state='DISPONIBLE'
        comunication.sendData(pubBrokerState, {
            "idAscensor": elevator.id,
            "estado": elevator.estado,
            "piso": 0,
            "pisoNuevo": result.pisoNuevo
        })
        waitInformation(timeAvilable)  // espera 30 segundos en el piso en estado disponible antes de ponerse oscioso
        .then((result) => { // si recibio un nuevo cambio de estado, de disponible a ocupado
            elevator.state=result.estado
            elevator.pisoNuevo=result.pisoNuevo
            comunication.sendData(pubBrokerState, {
                "idAscensor": elevator.id,
                "estado": elevator.estado,
                "piso": result.piso,
                "pisoNuevo": result.pisoNuevo
            })
            moveElevator(result,result.pisoNuevo) // muevo el ascensor al piso nuevo
        })
        .catch((err) => { // si no se recibio ningun cambio de estado en 30 segundos, el ascensor se va a oscioso
            elevator.state='OSCIOSO'
            comunication.sendData(pubBrokerState, {
                "idAscensor": elevator.id,
                "estado": elevator.estado,
                "piso": elevator.piso,
                "pisoNuevo": elevator.pisoNuevo
            })
        });
    })
}

async function moveElevator(data, floorToGo){
    let toGo = math.abs(data.piso - floorToGo); // cantidad de pisos que tiene que subir o bajar
    for (let i = 0; i < data.piso; i++) { // recorro los pisos
        await new Promise(resolve => setTimeout(resolve, timeInFloor)); // espera 5 segundos por piso
        if (floorToGo == 0)
            elevator.pisoact -= 1;
        else
            elevator.pisoact += 1;
        comunication.sendData(pubBrokerState,{
            "idAscensor": elevator.id,
            "estado": elevator.estado,
            "piso": elevator.pisoact,
            "pisoNuevo": elevator.pisoNuevo
        } ) // publico el estado del ascensor en el broker por cada piso que pasa
        console.log(`Ascensor ${elevator.id} en piso ${elevator.currentFloor}`);
    }
}

function waitInformation(timewait) { // funciona como un timeout, espera 30 segundos a que llegue un cambio de estado
    if (timewait == timeAvilable) { // me fijo si la actualizacion que busco es de disponible, o de cambio de estado
        return new Promise((resolve, reject) => {
        let cont = 0;
        const interval = setInterval(async () => {
            cont++;
            if (cont >= timewait/1000) {  // Verificar si ha pasado el tiempo límite (30 segundos)
                clearInterval(interval);
                reject(1);
            }
            actData=await comunication.getData(pollBrokerState)
            //aca tendria que ver como conectarlo con el broker mqtt del sensor
            if (actData!==null && actData.id == elevator.id){
                resolve(actData);
            }
        }, 1000); // Espera 1 segundo (1000 milisegundos) antes de verificar nuevamente
        });
    }
    else
    return new Promise((resolve, reject) => {
        let cont = 0;
        const interval = setInterval(async () => {
            var data = await comunication.getData(pollBrokerState); // hago un get al broker en el topico cambio de estado
            //console.log(data);
            if (data!==null && data.id == elevator.id){ //si es la data que necesito
                resolve(data);
            }
        }, 1000); // Espera 1 segundo (1000 milisegundos) antes de verificar nuevamente
        });
}

