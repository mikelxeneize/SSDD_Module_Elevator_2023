import { sendHttpRequest } from './request-utils.js';

const brokerIp = 'localhost'
const brokerPort = '3000'

const pollingIntervalAscensor = 500;
const pollingIntervalCambioEstado = 500;

const pathSuscribirAscensor = '/api/ascensores/subscribe';
const pathPollAscensor = '/api/ascensores/poll?id=';

const pathSuscribirCambioEstado = '/api/cambio/subscribe';
const pathPollCambioEstado = '/api/cambio/poll?id=';
const pathPublicarCambioEstado = '/api/cambio/publish';

const estadoDisponible = 'DISPONIBLE';
const estadoOcupado = 'OCUPADO';
const estadoOcioso = 'OCIOSO';

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
        <div class="card mb-4 ">
            <div class="card-header bg-primary text-white text-center">
                <h5 class="card-title">${ascensor.nombre}</h5>
            </div>
            <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">Estado: ${ascensor.estado}</h6>
                <h6 class="card-subtitle mb-2 text-muted">Piso Actual: ${ascensor.pisoact}</h6>
            </div>
            <div class="card-footer d-flex justify-content-center">
                <button id="${ascensor.id}-cerrarPuertas" class="btn btn-success">Cerrar Puertas</button>
            </div>
        </div>
    `;
    return divAscensor;
}

/* 
Event listeners para cada ascensor
*/
function setupBotones(ascensor) {
    const botonCerrarPuertas = document.getElementById(`${ascensor.id}-cerrarPuertas`);
    botonCerrarPuertas.addEventListener("click", function () {
        let nuevoEstado = null;
        if (ascensor.estado == estadoDisponible && ascensor.pisoact == 0) {
            nuevoEstado = estadoOcupado;
        } else if (ascensor.estado == estadoOcupado && ascensor.pisoact == ascensor.pisoNuevo) {
            nuevoEstado = estadoOcioso;
        }
        if (nuevoEstado) {
            const body = {
                idAscensor: ascensor.id,
                estado: nuevoEstado,
                piso: ascensor.pisoact,
                pisoNuevo: ascensor.pisoNuevo,
                solicitud: true
            }
            sendHttpRequest(brokerIp, brokerPort, pathPublicarCambioEstado, 'POST', body);
        }
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
            if (cambioEstado.solicitud == false) {
                const ascensor = ascensoresArray.find(ascensor => ascensor.id == cambioEstado.idAscensor);
                ascensor.estado = cambioEstado.estado;
                ascensor.pisoact = cambioEstado.piso;
                ascensor.pisoNuevo = cambioEstado.pisoNuevo;
                editAscensor(ascensor);
            }
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
