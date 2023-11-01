import { sendHttpRequest } from './request-utils.js';

const brokerIp = 'localhost'
const brokerPort = '3000'

const pollingIntervalAscensor = 100000;
const pollingIntervalCambioEstado = 100000;

const pathSuscribirAscensor = '/api/ascensores/subscribe';
const pathPollAscensor = '/api/ascensores/poll?id=';

const pathSuscribirCambioEstado = '/api/cambio/subscribe';
const pathPollCambioEstado = '/api/cambio/poll?id=';
const pathPublicarCambioEstado = '/api/cambio/ascensor';

/* 
- Add y edit ascensor son en relacion al html
*/
function addAscensor(ascensor){
    const ascensorElement = document.createElement("div");
    ascensorElement.id = ascensor.id;
    ascensorElement.innerHTML = `
        <h2>${ascensor.nombre}</h2>
        <p>Estado: ${ascensor.estado}</p>
        <p>Piso Actual: ${ascensor.pisoact}</p>
    `;
    ascensoresContainer.appendChild(ascensorElement);
}

function editAscensor(ascensor){
    const ascensorElement = document.getElementById(ascensor.id);
    ascensorElement.innerHTML = `
        <h2>${ascensor.nombre}</h2>
        <p>Estado: ${ascensor.estado}</p>
        <p>Piso Actual: ${ascensor.pisoact}</p>
    `;
}

/*
 --------- HANDLE ---------
- data es una array de len 2 donde data[1] = responseBody y data[0] = responseCode 
- responseBody es un array de ascensores
- responseCode siempre es un 20X
*/
function handlePollAscensor(data){
    resCode = data[0];
    resBody = data[1]
    if (resCode == 204){
        //nada --> cache vacia en el broker --> nada nuevo
    } else if (resCode == 200){
        const ascensores = JSON.parse(resBody);
        ascensores.forEach(ascensor => { //trabaja cada ascensor del responseBody
            addAscensor(ascensor);
            ascensor.push(ascensor)
        });
    }
}

//No importa el resCode 
function handlePollCambioEstado(data){
    resBody = data[1];
    const ascensores = JSON.parse(resBody);
    ascensores.forEach(ascensor => { //trabaja cada ascensor del responseBody
        editAscensor(ascensor)
    });
}


// =======================================================================================================================================

let ascensores = [];
let ascensoresContainer = document.getElementById("ascensores-container");

sendHttpRequest(brokerIp, brokerPort, pathSuscribirAscensor, 'POST')
.then((response) => {
    const resJson = JSON.parse(response[1]); //resBody parseado a json
    handlePollAscensor(resJson.ascensores); // manejo los ascensores ya existentes
    const idAscensor = resJson.id;
    consolelog(idAscensor)
    setInterval(() => {
        sendHttpRequest(brokerIp, brokerPort, pathPollAscensor + idAscensor, 'GET')
    }, pollingIntervalAscensor).then((response) => { 
        handlePollAscensor(response);
    })
})
.catch((error) => {
    console.error('Error en la solicitud:', error);
  });
sendHttpRequest(brokerIp, brokerPort, pathSuscribirCambioEstado, 'POST')
.then((idCambioEstado) => {
    setInterval(() => {
        sendHttpRequest(brokerIp, brokerPort, pathPollCambioEstado + idCambioEstado, 'GET')
    }, pollingIntervalCambioEstado).then((response) => { 
        handlePollCambioEstado(response);
    });
})
.catch((error) => {
    console.error('Error en la solicitud:', error);
  });
