const http = require('http');

const sendHttpRequest = (ip, port, path, tipo, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: tipo,
      hostname: ip,
      port: port,
      path: path, // Concatena la URL con la ruta base
      headers: {
        'Content-Type': 'application/json', // Tipo de contenido que estás enviando (en este caso, JSON)
      },
    };
    
    console.log('Request: ',url,' ',tipo,' -- Path : ', options.path);

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const resCode = res.statusCode;
        if (resCode >= 200 && resCode < 300) {
          resolve([resCode,data]); // Resuelve la promesa con los datos recibidos
        } else {
          console.log('Error ', res.statusCode);
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

