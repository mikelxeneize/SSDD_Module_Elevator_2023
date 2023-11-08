const http = require('http');

const apiBaseUrl = 'http://localhost:3000/api'; // Reemplaza con la URL de tu API



const sendHttpRequest = (url, tipo, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: tipo,
      hostname: 'localhost',
      port: 3000,
      path: '/api' + url, // Concatena la URL con la ruta base
      headers: {
        'Content-Type': 'application/json', // Tipo de contenido que estás enviando (en este caso, JSON)
      },
    };
    
    console.log('Enviando request a broker ',url,' ',tipo,' -- Path : ', options.path);
    
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data); // Resuelve la promesa con los datos recibidos
        } else {
          reject('Error ' + res.statusCode); // Rechaza la promesa en caso de error
        }
      });
    });
    if(body!=undefined){
      console.log(JSON.stringify(body))
      req.write(JSON.stringify(body))
    }
    req.end();
  });
};


module.exports = { sendHttpRequest };

