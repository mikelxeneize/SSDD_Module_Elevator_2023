const http = require('http');
const url = require('url'); 
const crypto = require("crypto"); //para encriptar ID


const subscribersAscensor = []; // Clientes suscriptos a numero (id, ip y topic)


const requestHandler = (req, res) => {  //reenvia las request
    const { method, url: requestUrl } = req;
    console.log('llega request')
    
    if (requestUrl.startsWith('/api/subscribe/ascensor') || requestUrl === '/api/subscribe/ascensor/' || requestUrl.startsWith('/api/subscribe/ascensor?')) {
      console.log('llega sub ascensor')
      subscribeAscensor(req, res);
      return;
    }    
    else if (requestUrl.startsWith('/api/publish/ascensor') || requestUrl === '/api/publish/ascensor/' || requestUrl.startsWith('/api/publish/ascensor?')) {
      console.log('llega publish ascensor')
      publishAscensor(req, res);
      return;
    }
    else if (requestUrl.startsWith('/api/poll/ascensor') || requestUrl === '/api/poll/ascensor/' || requestUrl.startsWith('/api/poll/ascensor?')) {
      const parsedUrl = url.parse(requestUrl, true); // Parsea la URL para obtener el ID
      const { id } = parsedUrl.query; // Extrae el valor del parámetro "id" del query
      pollAscensor(req, res, id);
      return;
    }  
}

//quieren conocer cuando hay nuevo ascensor: CLIENTE WEB y SELECCION DE ASCENSOR
async function subscribeAscensor(req, res) {  
 
    try {
    //Crea suscriptor y le asigna un id unico para que haga short poll
    const subscriber = {  
      id: crypto.randomBytes(16).toString("hex"),  //Genera ID y lo retornara al cliente, para que se identifique
      cache: [],  //almacenara objeto ascensor nuevo
    };
    
    subscribersAscensor.push(subscriber);
  
    
    res.statusCode = 200;  
    res.end('Suscrito a topico ascensor. Su id es: ' + subscriber.id);  //le envia ID a cliente para short poll
   
    console.log('Subscribers: ', subscribersAscensor);
   } catch (error) {
    res.statusCode = 400;
    res.end('Invalid JSON data in the request');
   }

  }

//Solo publica un ascensor, no se sucribe el ascensor a este topico, no le interesan otros ascensores
async function publishAscensor(req, res) {  
    let body = '';
  
    req.on('data', (chunk) => {
      body += chunk;
    });
  
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        

        if (data) {  
          console.log('Recibido datos de nuevo ascensor con id:', data.id)
          
          const ascensor = {
            id: data.id,
            nombre: data.nombre,
            pisos: data.pisos,      //array
            estado: data.estado,
            //pisoact: data.pisoact,
          }
          
          subscribersAscensor.forEach((s) => {s.cache.push(ascensor) });  //mete objeto en cache para enviar en poll
          
          res.statusCode = 200;
          res.end('Ascensor recibido correctamente');
          console.log(subscribersAscensor)
          
        } else {
          res.statusCode = 400;
          res.end('Request invalida: No se recibio el ascensor o es invalido');
        }
      } catch (error) {
        res.statusCode = 400;
        res.end('Invalid JSON data in the request');
      }
    });
  }



async function pollAscensor(req, res, id) {
    
    const subscriber = subscribersAscensor.find((s) => s.id === id);  //busca suscriptor con ese id aver si existe en la lista del topico
    if (!subscriber) { //Valida si existe
      res.statusCode = 400;
      res.end('Invalid subscriber ID');
      return;
    }
    
    //Cheaquea si cache de suscriptor vacio
    if (subscriber.cache.length === 0) {
      res.statusCode = 204;
      res.end();  //cache vacio
      return;  //se va
    }
  
    // Si no esta vacio, envia los mensajes (puede ser mas de 1)
    const messages = {
      ascensores: subscriber.cache,
    }; 
    res.statusCode = 200;
    res.end(JSON.stringify(messages));

    //limpio cache de subscriber, asi no hay mensajes repetidos
    subscriber.cache = [];
}



//creo server, los requests se hace cargo request handler
const server = http.createServer((req, res) => {
  
    //CORS, necesario para que el browser no bloquee el request
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { url } = req; //de req extraigo url
    if (url.startsWith('/api')) {
        requestHandler(req, res);
        return;
    }

    //si esta aca es error
    res.statusCode = 404;
    res.end();
});


// Server escuchando en puerto 3000
server.listen(3000, () => {
    console.log('Server Gateway escuchando en puerto 3000');
});