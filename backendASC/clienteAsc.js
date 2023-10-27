const http = require('http');

//GUARDARIA DATOS DE ASCENSORES Y SUS ESTADOS PARA PODER OPERAR LOCALMENTE

var id = '';
const pollingInterval = 3;

function suscribirAscensores() {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'GET',
        hostname: 'localhost',
        port: 3000,
        path: '/api/subscribe/ascensor',
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
              id = match[1];
              console.log('Suscrito a ascensores con id para llamada: ', id);
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
      path: `/api/poll/ascensor?id=${id}`,
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
          console.log('Empty cache ', res.statusCode);
        }
        else {
          console.log('Error polling number: ', res.statusCode);
        }
      });
    
    });

    req.end();
}





suscribirAscensores().then(() => {  //si no se hace asi o no se espeera a suscribir numeros, EL ID NUNCA CAMBIA
    setInterval(pollAscensor, pollingInterval * 1000);  
  });
