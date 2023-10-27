const http = require('http');

//LA LOGICA QUE LE DARIAMOS AL GRUPO DE ADMINISTRACION

function publicarAscensor() {
    
    const postData = JSON.stringify({
      id: 1,
      nombre: "ascensor1",
      pisos: [1,2,10],
      estado: "oscioso",
      //pisoact: 25,
    });
  
    const options = {
      method: 'POST',
      hostname: 'localhost',
      port: 3000,
      path: '/api/publish/ascensor',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    
    const req = http.request(options, (res) => {
      let data = '';
  
      res.on('data', (chunk) => {
        data += chunk; //almacena la respuesta del servidor 
      });
  
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('Ascensor publicado correctamente');
        } else {
          console.log('Error al publicar ascensor ', res.statusCode);
        }
      });
    });
  
    req.write(postData);
    req.end();
}

publicarAscensor();