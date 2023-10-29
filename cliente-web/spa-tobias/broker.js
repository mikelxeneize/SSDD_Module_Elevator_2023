const http = require('http');

function suscribir(ip, port, topic) {
  topicPath = '/api/suscribe/'

  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      hostname: ip,
      port: port,
      path: topicPath + topic,
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try{
            const jsonData = JSON.parse(data);
            console.log(jsonData);
            resolve(jsonData);
          }catch(e){
            console.error('Error al parsear el body: ', error);
            reject('Error al parsear el body');
          }
          
        } else {
          reject(`Response no exitosa: ${res.statusCode}`);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error en la request: ', error);
      reject('Error en la request');
    });

    req.end();
  })
}


