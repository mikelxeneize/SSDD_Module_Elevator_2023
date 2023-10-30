
const selectorAscensorClienteBroker = require('./SelectorAscensorClienteBroker.js'); 
/*const Ascensores=[
    { id: 1, nombre: "A1", pisos: [ 1, 3, 5 ],  estado: "Ocioso", piso_actual: 3},
    { id: 2, nombre: "A2", pisos: [ 2, 4, 7 ],  estado: "Disponible", piso_actual: 1},
    { id: 3, nombre: "A3", pisos: [ 1, 2, 3 ],  estado: "Disponible", piso_actual: 7},
    { id: 4, nombre: "A4", pisos: [ 4, 5, 6 ],  estado: "Disponible", piso_actual: 9}
] */
let Ascensores=[]
let Identificadores=[]
const pollingInterval = 8;

const obtenerPiso = async (piso) => {
    let distancia=999
    let id=-999
    
    Ascensores.forEach(function(elemento) {
        console.log('elemento: ',elemento)
        if ((elemento.estado=='Disponible' || elemento.estado=='Ocioso' )  && elemento.pisos.includes(parseInt(piso)) && elemento.piso_actual<distancia ) {
            id=elemento.id
            distancia=elemento.distancia
        }
    });
    selectorAscensorClienteBroker.sendHttpRequest('/publisher/cambiarEstadoAscensor', 'POST',{id:id,estado: 'Ocioso'})
        .then(respuesta => {
            //quizas aqui vaya algo, habra que ver que resulta de todo esto
        })
        .catch(error => {
            console.error('Error:', error);
        });
    console.log(id);
    return id;
};

const pollAscensor = async (piso) => {
    const body=Identificadores[0];
    selectorAscensorClienteBroker.sendHttpRequest('/subscribe/nuevoAscensor', 'GET',body)
    .then(respuesta => {
        const respuestaObjeto = JSON.parse(respuesta);
        Ascensores.push(respuestaObjeto)
    
    })
    .catch(error => {
        console.error('Error:', error);
      });
}

selectorAscensorClienteBroker.sendHttpRequest('/subscribe/nuevoAscensor', 'POST')
  .then(respuesta => {
    const respuestaObjeto = JSON.parse(respuesta);
    Identificadores = Identificadores.concat(respuestaObjeto.id_subscripcion);
    Ascensores= Ascensores.concat(respuestaObjeto.ascensores_activos);
    setInterval(pollAscensor, pollingInterval * 1000);  
  })
  .catch(error => {
    console.error('Error:', error);
  });

selectorAscensorClienteBroker.sendHttpRequest('/subscribe/estados', 'POST')
  .then(respuesta => {
    const respuestaObjeto = JSON.parse(respuesta);
    Identificadores = Identificadores.concat(respuestaObjeto.id_subscripcion);
    setInterval(pollAscensor, pollingInterval * 1000);  
  })
  .catch(error => {
    console.error('Error:', error);
  });


module.exports = { obtenerPiso };