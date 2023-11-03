import { sendHttpRequest } from './request-utils.js';

const brokerIp = 'localhost'
const brokerPort = '3000'

const pollingIntervalAscensor = 5000;
const pollingIntervalCambioEstado = 5000;

const pathSuscribirAscensor = '/api/ascensores/subscribe';
const pathPollAscensor = '/api/ascensores/poll?id=';

const pathSuscribirCambioEstado = '/api/cambio/subscribe';
const pathPollCambioEstado = '/api/cambio/poll?id=';
const pathPublicarCambioEstado = '/api/cambio/ascensor';

/* 
- Add y edit ascensor son en relacion al html
*/
function addAscensor(ascensor) {
    const ascensorElement = document.createElement("div");
    ascensorElement.id = ascensor.id;
    ascensorElement.innerHTML = `
        <h2>${ascensor.nombre}</h2>
        <p>Estado: ${ascensor.estado}</p>
        <p>Piso Actual: ${ascensor.pisoact}</p>
    `;
    ascensoresContainer.appendChild(ascensorElement);
}

function editAscensor(ascensor) {
    const ascensorElement = document.getElementById(ascensor.id);
    ascensorElement.innerHTML = `
        <h2>${ascensor.nombre}</h2>
        <p>Estado: ${ascensor.estado}</p>
        <p>Piso Actual: ${ascensor.pisoact}</p>
    `;
}

/*
 --------- HANDLE ---------
- recibe un arrray de objetos ascensor
- valida de ascensores no sea null
- aca se concentran todas las validaciones
*/
function handlePollAscensor(ascensores) {
    if (ascensores) {
        ascensores.forEach((ascensor) => {
            addAscensor(ascensor);
            ascensoresArray.push(ascensor);
        });
    }
}

function handlePollCambioEstado(cambiosEstado) {
    if (cambiosEstado) {
        cambiosEstado.forEach((cambioEstado) => {
            editAscensor(cambioEstado);
        });
    }
}


// =======================================================================================================================================

var ascensoresArray = [];
let ascensoresContainer = document.getElementById("ascensores-container");

sendHttpRequest(brokerIp, brokerPort, pathSuscribirAscensor, 'POST')
    .then((response) => {
        console.log(`sub ascensor ${response.id} - cant ${response.ascensores.length}`);
        const idAscensor = response.id;
        handlePollAscensor(response.ascensores); // manejo los ascensores ya existentes
        setInterval(() => {
            sendHttpRequest(brokerIp, brokerPort, pathPollAscensor + idAscensor, 'GET')
                .then((response) => {
                    
                    handlePollAscensor(response.ascensores);
                })
        }
            , pollingIntervalAscensor);
    })
    .catch((error) => {
        console.error('Error en la solicitud ascensor:', error);
    });

sendHttpRequest(brokerIp, brokerPort, pathSuscribirCambioEstado, 'POST')
    .then((response) => {
        console.log(`sub cambioEstado ${response.id}`);
        const idCambioEstado = response.id;
        setInterval(() => {
            sendHttpRequest(brokerIp, brokerPort, pathPollCambioEstado + idCambioEstado, 'GET')
                .then((response) => {
                    handlePollCambioEstado(response);
                })
        }
            , pollingIntervalCambioEstado);
    })
    .catch((error) => {
        console.error('Error en la solicitud cambioEstado:', error);
    });


    /* 
setInterval(() => {
    const jsonDummy = `[
        {
            "idAscensor": "1",
            "estado": "disponible",
            "piso": 2,
            "pisoNuevo": 2
        }
    ]`
    handlePollCambioEstado(JSON.parse(jsonDummy));
}
    , pollingIntervalCambioEstado * 1.5); */