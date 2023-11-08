
const selectorAscensorClienteBroker = require('./SelectorAscensorClienteBroker.js'); 
/*const Ascensores=[
    { id: 1, nombre: "A1", pisos: [ 1, 3, 5 ],  estado: "Ocioso", piso_actual: 3},
    { id: 2, nombre: "A2", pisos: [ 2, 4, 7 ],  estado: "Disponible", piso_actual: 1},
    { id: 3, nombre: "A3", pisos: [ 1, 2, 3 ],  estado: "Disponible", piso_actual: 7},
    { id: 4, nombre: "A4", pisos: [ 4, 5, 6 ],  estado: "Disponible", piso_actual: 9}
] */
let Ascensores=[]
var idAscensor = '';
var idCambio = '';
const pollingInterval = 8;

const obtenerPiso = async (piso) => {
    let distancia=999
    let id=-999
    let ascensor
    let respuesta={id: -999, nombre: "No hay ascensores disponibles"}
    console.log("Ascensores" +Ascensores);
    Ascensores.forEach(function(elemento) {
        if (( elemento.estado.toLowerCase()=='ocioso' || elemento.estado.toLowerCase()=='oscioso')  && elemento.pisos.includes(parseInt(piso)) && elemento.pisoact<distancia ) {
            id=elemento.id
            distancia=elemento.distancia
            ascensor=elemento
        }
    });
    
    if(id!=-999){
      respuesta.id=id
      respuesta.nombre=ascensor.nombre
      const objetoAEnviar={
        idAscensor: ascensor.id,
        estado: 'Ocupado',
        piso: ascensor.pisoact,
        pisoNuevo: piso,
        solicitud: true
  
      }
      selectorAscensorClienteBroker.sendHttpRequest('/cambio/publish', 'POST',objetoAEnviar)
          .then(respuesta => {
              //quizas aqui vaya algo, habra que ver que resulta de todo esto
          })
          .catch(error => {
              console.error('Error:', error);
          });
    }
    return respuesta;
  }
const pollAscensor = async (piso) => {
  selectorAscensorClienteBroker.sendHttpRequest(`/ascensores/poll?id=${idAscensor}`, 'GET')
  .then(respuesta => {
      const respuestaObjeto = JSON.parse(respuesta);
      console.log(respuestaObjeto.toString());
      for (const objeto of respuestaObjeto.ascensores) {
        Ascensores.push(objeto);
    }
  
  })
  .catch(error => {
    if(error=='Error 204')
      console.log('No hay ascensores nuevos');
    else
      console.error('Error:', error);
    });
}

const pollCambios = async (piso) => {
  selectorAscensorClienteBroker.sendHttpRequest(`/cambio/poll?id=${idCambio}`, 'GET')
  .then(respuesta => {
      const respuestaObjeto = JSON.parse(respuesta);
      console.log(respuestaObjeto.toString());
      for(const objeto of respuestaObjeto){
        if(objeto.solicitud==false){
          for(const ascensor of Ascensores){
            if(ascensor.id==objeto.idAscensor){
              ascensor.estado=objeto.estado
              ascensor.pisoact=objeto.piso
            }
          }
        }
      }
      console.log(Ascensores)
  })
  .catch(error => {
    if (error=='Error 204')
      console.log('No hay cambios nuevos');
    else
      console.error('Error:', error);
    });
}

selectorAscensorClienteBroker.sendHttpRequest('/ascensores/subscribe', 'POST')
  .then(respuesta => {
    const respuestaObjeto = JSON.parse(respuesta);
    idAscensor = respuestaObjeto.id;
    for (const objeto of respuestaObjeto.ascensores) {
      Ascensores.push(objeto);
    }
    console.log(Ascensores);
    setInterval(pollAscensor, pollingInterval * 1000);  
  })
  .catch(error => {
    console.error('Error:', error);
  });



selectorAscensorClienteBroker.sendHttpRequest('/cambio/subscribe', 'POST')
  .then(respuesta => {
    const respuestaObjeto = JSON.parse(respuesta.toString());
    idCambio = respuestaObjeto.id;
    setInterval(pollCambios, pollingInterval * 1000);  
  })
  .catch(error => {
    console.error('Error:', error);
  });

module.exports = { obtenerPiso };