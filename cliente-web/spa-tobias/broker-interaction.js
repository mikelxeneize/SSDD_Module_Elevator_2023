const http = require('http');

const pollingIntervalAscensor = 1000;
const pollingIntervalCambioEstado = 1000;



function suscribirAscensor(ip, port) {
  let topicPath = '/api/suscribe/ascensor'

  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      hostname: ip,
      port: port,
      path: topicPath,
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log(topicPath + jsonData);
            var idAscensor = "idAscensorDummy"
            resolve(jsonData);
          } catch (e) {
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


function pollAscensor(ip, port) {
  const topicPath = `/api/ascensores/poll?id=${idAscensor}`;
  const options = {
    method: 'GET',
    hostname: ip,
    port: port,
    path: topicPath,
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk; 
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        const messages = JSON.parse(data.toString());
        console.log(messages);

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

function suscribirCambioEstado(ip,port) {
  let topicPath = '/api/cambio/subscribe';
  
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      hostname: ip,
      port: port,
      path: topicPath,
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;          //almacena la respuesta del servidor 
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log(topicPath + jsonData);
            resolve(jsonData);
          } catch (e) {
            console.error('Error al parsear el body: ', error);
            reject('Error al parsear el body');
          }
        } else {
          reject(`Response no exitosa: ${res.statusCode}`);
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



function publicarCambioAscensor(ip, port) {
  topicPath = '/api/cambio/ascensor'
  
  const postData = JSON.stringify({
    idAscensor: 1,
    estado: "ocupado",
    piso: 25,
    pisoNuevo: 0,
  });

  const options = {
    method: 'POST',
    hostname: ip,
    port: port,
    path: topicPath,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk; 
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('Cambio de estado de ascensor publicado correctamente');
      } else {
        console.log('Error al publicar Cambio de estado de ascensor ', res.statusCode);
      }
    });
  });

  req.write(postData);
  req.end();
}

//Suscripcion doble
suscribirAscensor().then(() => {
  suscribirCambioEstado().then(() => {
    setInterval(pollAscensor, pollingIntervalAscensor);
    setInterval(pollCambioEstado, pollingIntervalCambioEstado);
  });
});
