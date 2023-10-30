const http = require('http');

// Define la URL de tu API
const apiBaseUrl = 'http://localhost:3001/api'; // Reemplaza con la URL de tu API

// Función para enviar la solicitud HTTP a tu API
const sendHttpRequest = () => {
    
    let piso= Math.floor(Math.random() * 10) + 1

    let options = {
        method: 'GET',
        hostname: 'localhost',
        port: 3001,
        path: `/api/selectorAscensor?piso=${piso}`,
      };
    
      

    return new Promise((resolve, reject) => {
    
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
                console.log('Error.');
              }
            } else {
              console.log('Error  ', res.statusCode);
            }
          });
        });
    
        req.end();
      });
};

// Establece un intervalo de 1 minuto (en milisegundos)
const IntervalSegundos = 10;
const intervalMilliseconds =  IntervalSegundos* 1000;

// Inicia el intervalo para enviar la solicitud HTTP
setInterval(sendHttpRequest, intervalMilliseconds);

console.log(`Enviando solicitudes HTTP a ${apiBaseUrl} cada ${IntervalSegundos} segundos...`);

