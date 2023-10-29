const fs = require('fs');

const Ascensor = require('./elevatorClass');
 
const fileName = process.argv[2]; // 3er parametro que le paso al script, el archivo json con los datos del ascensor


fs.readFile(fileName, 'utf8', (err, data) => { // leo el archivo json
    if (err) {
        console.log("Error en la lectura del archivo",err);
        return;
    }
    var elevator = new Elevator(JSON.parse(data)) // parseo el json a objeto, creando un objeto Ascensor
    console.log(elevator);
})
