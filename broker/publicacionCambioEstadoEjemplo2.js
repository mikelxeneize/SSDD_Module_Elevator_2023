const http = require('http');

function publicarCambioAscensor() {
    
    const postData = JSON.stringify({
      idAscensor: "pepe2",
      estado: "OCUPADO",
      piso: 5,
      pisoNuevo: 3,
      solicitud: true
    });
  
    const options = {
      method: 'POST',
      hostname: 'localhost',
      port: 3000,
      path: '/api/cambio/publish',
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
          console.log('Cambio de estado de ascensor publicado correctamente');
        } else {
          console.log('Error al publicar Cambio de estado de ascensor ', res.statusCode);
        }
      });
    });
  
    req.write(postData);
    req.end();
  }

publicarCambioAscensor();