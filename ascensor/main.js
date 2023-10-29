const fs = require('fs');

const Ascensor = require('./elevatorClass');

const comunication = require('./comunication');

const fileName = process.argv[2]; // 3er parametro que le paso al script, el archivo json con los datos del ascensor

fs.readFile(fileName, 'utf8', (err, data) => { // leo el archivo json
    if (err) {
        console.log("Error en la lectura del archivo",err);
        return;
    }
    var elevator = new Elevator(JSON.parse(data)) // parseo el json a objeto, creando un objeto Ascensor
    console.log(elevator);
})

while (true){
    const data = await comunication.getData('http://localhost:3000/api/ascensor/1'); // hago un get al broker, hay que definir a que topic se hace el get
    console.log(data);
    if (data.estado == 'Ocioso'){
        elevator.setState('Ocioso');
        
        elevator.moveToFloor(data.piso);
    }
}
//hilo infinito para los gets del broker

//hilo para los post al broker
