import { sendHttpRequest } from './request-utils.js';

const brokerIp = 'localhost'
const brokerPort = '3000'

const pollingIntervalAscensor = 5000;
const pollingIntervalCambioEstado = 5000;

const pathSuscribirAscensor = '/api/ascensores/subscribe';
const pathPollAscensor = '/api/ascensores/poll?id=';

const pathSuscribirCambioEstado = '/api/cambio/subscribe';
const pathPollCambioEstado = '/api/cambio/poll?id=';
const pathPublicarCambioEstado = '/api/cambio/publish';

/* 
- template del contenido del div html del ascensor
*/
function crearDivAscensor(ascensor) {
    // Crea un nuevo elemento div con las clases y el ID
    const divAscensor = document.createElement("div");
    divAscensor.id = ascensor.id;
    divAscensor.className = "col-lg-4 col-md-6 col-sm-12";
    // Crea el contenido interno del div
    divAscensor.innerHTML = `
      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h5 class="card-title">${ascensor.nombre}</h5>
        </div>
        <div class="card-body">
          <h6 class="card-subtitle mb-2 text-muted">Estado: ${ascensor.estado}</h6>
          <p class="card-text">Piso Actual: ${ascensor.pisoact}</p>
        </div>
        <div class="card-footer d-flex justify-content-between">
          <button id="${ascensor.id}-cerrarPuertas" class="btn btn-success">Cerrar Puertas</button>
          <button id="${ascensor.id}-detenerAscensor" class="btn btn-danger">Detener Ascensor</button>
        </div>
      </div>
    `;
    return divAscensor;
}

/* 
Event listeners para cada ascensor
*/
function setupBotones(ascensor){
    const botonDetenerAscensor = document.getElementById(`${ascensor.id}-detenerAscensor`);
    botonDetenerAscensor.addEventListener("click", function () {
        alert("A quien vas a parar vo' anda palla");
    });

    const botonCerrarPuertas = document.getElementById(`${ascensor.id}-cerrarPuertas`);
    botonCerrarPuertas.addEventListener("click", function () {
        const body = {
            idAscensor: 1,
            estado: "disponible",
            piso: 233,
            pisoNuevo: 0
        }
        sendHttpRequest(brokerIp, brokerPort, pathPublicarCambioEstado, 'POST', body);
    });
}

/* 
- Add y edit ascensor son en relacion al html
*/
function addAscensor(ascensor) {
    ascensoresContainer.appendChild(crearDivAscensor(ascensor));
    setupBotones(ascensor);
}

function editAscensor(ascensor) {
    const ascensorElement = document.getElementById(ascensor.id);
    ascensorElement.replaceWith(crearDivAscensor(ascensor));
    setupBotones(ascensor);
}

/*
 --------- HANDLE ---------
- recibe un arrray de objetos 
- aca se concentran todas las validaciones
- se editan variables del funcionamiento interno
*/
function handlePollAscensor(ascensores) {
    if (ascensores) {
        ascensores.forEach((ascensor) => {
            ascensoresArray.push(ascensor);
            addAscensor(ascensor);
        });
    }
}

/* 
edita el ascensor y despues se lo pasa por parametro 
*/
function handlePollCambioEstado(cambiosEstado) {
    if (cambiosEstado) {
        cambiosEstado.forEach((cambioEstado) => {
            const ascensor = ascensoresArray.find(ascensor => ascensor.id == cambioEstado.idAscensor);
            ascensor.estado = cambioEstado.estado;
            ascensor.pisoact = cambioEstado.piso;
            editAscensor(ascensor);
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
                    handlePollAscensor(response);
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