const http = require('http');

//GUARDARIA DATOS DE ASCENSORES Y SUS ESTADOS PARA PODER OPERAR LOCALMENTE

var idAscensor = '';
var idCambio = '';
const pollingInterval = 3;
var ascensores = [];

function suscribirAscensores() {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      hostname: 'localhost',
      port: 3000,
      path: '/api/ascensores/subscribe',
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;          //almacena la respuesta del servidor 
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log("llegue");
          const responseData = JSON.parse(data.toString());
          idAscensor = responseData.id;
          ascensores = responseData.ascensores;
          console.log('Suscrito a ascensores con id para llamada: ', idAscensor);
          console.log('Ascensores: ', ascensores)
          resolve(); // Resuelve la promesa una vez que se obtiene el ID
        } else {
          console.log('Error subscribing to topic: ', res.statusCode);
          reject(`Error subscribing to topic: ${res.statusCode}`);
        }
      });
    });

    req.end();
  });
}



function pollAscensor() {
    const options = {
      method: 'GET',
      hostname: 'localhost',
      port: 3000,
      path: `/api/ascensores/poll?id=${idAscensor}`,
    };

    const req = http.request(options, (res) => {
      let data = '';
  
      res.on('data', (chunk) => {
        data += chunk; //almacena la respuesta del servidor 
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          const messages = JSON.parse(data.toString());
          
         // Extract the numbers and state from the JSON data
         const ascensores = messages.ascensores;
         console.log(ascensores);

        } else if (res.statusCode === 204) {
          console.log('Empty cache Ascensores', res.statusCode);
        }
        else {
          console.log('Error polling number: ', res.statusCode);
        }
      });
    
    });

    req.end();
}


function suscribirCambioEstado() {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'GET',
        hostname: 'localhost',
        port: 3000,
        path: '/api/cambio/subscribe',
      };
  
      const req = http.request(options, (res) => {
        let data = '';
  
        res.on('data', (chunk) => {
          data += chunk;          //almacena la respuesta del servidor 
        });
  
        res.on('end', () => {
          if (res.statusCode === 200) {
              const responseData = JSON.parse(data.toString());
              idCambio = responseData.id;
              console.log('Suscrito a Cambios de Estados con id para llamada: ', idCambio);
              resolve(); // Resuelve la promesa una vez que se obtiene el ID
            } else {
            console.log('Error subscribing to topic: ', res.statusCode);
            reject(`Error subscribing to topic: ${res.statusCode}`);
          }
        });
      });
  
      req.end();
    });
}



function pollCambioEstado() {
    const options = {
      method: 'GET',
      hostname: 'localhost',
      port: 3000,
      path: `/api/cambio/poll?id=${idCambio}`,
    };

    const req = http.request(options, (res) => {
      let data = '';
  
      res.on('data', (chunk) => {
        data += chunk; //almacena la respuesta del servidor 
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          const messages = JSON.parse(data.toString());
          
         // Extract the numbers and state from the JSON data
         const cambioEstado = messages.cambioEstado;
         console.log(cambioEstado);

        } else if (res.statusCode === 204) {
          console.log('Empty cache Estado ', res.statusCode);
        }
        else {
          console.log('Error polling number: ', res.statusCode);
        }
      });
    
    });

    req.end();
}



/*suscribirCambioEstado().then(() => {
    setInterval(pollCambioEstado, pollingInterval * 1000);
  });*/

suscribirAscensores().then(() => {
    suscribirCambioEstado().then(() => {
      setInterval(pollAscensor, pollingInterval * 1000);
      setInterval(pollCambioEstado, pollingInterval * 1000);
    });
  });