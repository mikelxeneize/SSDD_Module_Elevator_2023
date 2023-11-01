const fs = require('fs');

const comunication = require('./comunication');

const pubBrokerAscensor = 'http://localhost:3000/api/ascensores/publish';

const subscribeBrokerState = 'http://localhost:3000/api/cambio/subscribe';

const pollBrokerState = 'http://localhost:3000/api/cambio/poll';

const pubBrokerState = 'http://localhost:3000/api/cambio/publish';

const fileName = process.argv[2]; // 3er parametro que le paso al script, el archivo json con los datos del ascensor

const timeInFloor = 5000; // 5 segundos por piso

const timeAvilable = 10000 // 10 segundos disponible antes de ponerse oscioso

fs.readFile(fileName, 'utf8', (err, data) => { // leo el archivo json
    if (err) {
        console.log("Error en la lectura del archivo",err);
        return;
    }
    var elevator = JSON.parse(data) // parseo el json a objeto, creando un objeto Ascensor, creo que la clase ascensor esta al pedo
    console.log(elevator);
})

comunication.sendData(pubBrokerAscensor, elevator); // publico el ascensor en el broker
comunication.sendData(subscribeBrokerState, elevator); // me suscribo al topic de estado del ascensor en el broker
while (true){
    const data = await comunication.getData(pollBrokerState); // hago un get al broker, hay que definir a que topic se hace el get
    //console.log(data);
    if (data!==null || data.id != elevator.id){
        const floorsToMove = Math.abs(data.floor - elevator.currentFloor); // calculo la distancia por recorrer
        elevator.state='ocupado'
        comunication.sendData(pubBrokerState, elevator)
        for (let i = 0; i < floorsToMove; i++) { // recorro los pisos
            await new Promise(resolve => setTimeout(resolve, timeInFloor)); // espera 5 segundos por piso
            elevator.currentFloor = elevator.currentFloor + 1;
            comunication.sendData(pubBrokerState, elevator) // publico el estado del ascensor en el broker por cada piso que pasa
            console.log(`Ascensor ${elevator.id} en piso ${elevator.currentFloor}`);
        }
        elevator.state='disponible'
        comunication.sendData(pubBrokerState, elevator)
        await new Promise(resolve => setTimeout(resolve, timeAvilable)); // espera 10 segundos por piso antes de ponerse oscioso
        elevator.state='oscioso'
        comunication.sendData(pubBrokerState, elevator)
    }
}
//hilo infinito para los gets del broker

//hilo para los post al broker
