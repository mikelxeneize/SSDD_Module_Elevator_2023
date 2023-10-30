const http = require('http');

//GUARDARIA DATOS DE ASCENSORES Y SUS ESTADOS PARA PODER OPERAR LOCALMENTE

var idAscensor = '';
var idCambio = '';
const pollingInterval = 3;

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
            const match = data.match(/Su id es: (.+)/);
            if (match) {
              idAscensor = match[1];
              console.log('Suscrito a ascensores con id para llamada: ', idAscensor);
              resolve(); // Resuelve la promesa una vez que se obtiene el ID
            } else {
              console.log('Unable to retrieve the ID from the response.');
              reject('Unable to retrieve the ID');
            }
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
            const match = data.match(/Su id es: (.+)/);
            if (match) {
              idCambio = match[1];
              console.log('Suscrito a cambio de estados con id para llamada: ', idCambio);
              resolve(); // Resuelve la promesa una vez que se obtiene el ID
            } else {
              console.log('Unable to retrieve the ID from the response.');
              reject('Unable to retrieve the ID');
            }
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


//Esta es solo para 1 suscripcion
/*suscribirCambioEstado().then(() => {
    setInterval(pollCambioEstado, pollingInterval * 1000);
  });*/

//Suscripcion doble
suscribirAscensores().then(() => {
    suscribirCambioEstado().then(() => {
      setInterval(pollAscensor, pollingInterval * 1000);
      setInterval(pollCambioEstado, pollingInterval * 1000);
    });
  });