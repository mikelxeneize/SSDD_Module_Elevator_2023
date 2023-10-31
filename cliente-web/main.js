import { router } from "./router/index.router.js" //Importa funcion ROUTER, PONER CON .JS ALFINAL!!
const requestUtils = require('./request-utils.js');

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

let ascensores = []
const ascensoresContainer = document.getElementById("ascensores-container");

requestUtils.sendHttpRequest(ip, port, pathSuscribirAscensor, 'POST').then((response) => {
    const resJson = JSON.parse(response[1]); //resBody parseado a json
    handlePollAscensor(resJson.ascensores); // manejo los ascensores ya existentes
    const idAscensor = resJson.id;
    setInterval(requestUtils.sendHttpRequest(ip, port, pathPollAscensor + idAscensor, 'GET'), pollingIntervalAscensor).then((response) => { 
        handlePollAscensor(response);
    })
});
requestUtils.sendHttpRequest(ip, port, pathSuscribirCambioEstado, 'POST').then((idCambioEstado) => {
    setInterval(requestUtils.sendHttpRequest(ip, port, pathPollCambioEstado + idCambioEstado, 'GET'), pollingIntervalCambioEstado).then((response) => { 
        handlePollCambioEstado(response);
    });
});



router(window.location.hash); //llama por primera vez

window.addEventListener('hashchange', () => {  //cada vez que cambia url llama a router
    router(window.location.hash);
});

if (window.location.hash === '')
    window.location.hash = '#/';