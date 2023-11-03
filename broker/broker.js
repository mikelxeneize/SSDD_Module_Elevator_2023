//FALTA: Ver como llega el pisoActual al crear ascensor y luego modificarlo en el cambioEstado //facil

const http = require('http');
const url = require('url'); 
const crypto = require("crypto"); //para encriptar ID


const subscribersAscensor = []; // Clientes suscriptos a numero (id, ip y topic)
const subscribersCambioEstado = []; // Clientes suscriptos a cambio de estado (id, estado, piso, pisoAct)
const ascensores = []; //lista de ascensores para los nuevos suscriptores 

const requestHandlerAscensores = (req, res) => {  //reenvia las request
    const { method, url: requestUrl } = req;
    
    if (requestUrl.startsWith('/api/ascensores/subscribe') || requestUrl === '/api/ascensores/subscribe/' || requestUrl.startsWith('/api/ascensores/subscribe?')) {
      subscribeAscensor(req, res);
      return;
    }    
    else if (requestUrl.startsWith('/api/ascensores/publish') || requestUrl === '/api/ascensores/publish/' || requestUrl.startsWith('/api/ascensores/publish?')) {
      publishAscensor(req, res);
      return;
    }
    else if (requestUrl.startsWith('/api/ascensores/poll') || requestUrl === '/api/ascensores/poll/' || requestUrl.startsWith('/api/ascensores/poll?')) {
      const parsedUrl = url.parse(requestUrl, true); // Parsea la URL para obtener el ID
      const { id } = parsedUrl.query; // Extrae el valor del parámetro "id" del query
      pollAscensor(req, res, id);
      return;
    }  
}

const requestHandlerCambioEstado = (req, res) => {  
  const { method, url: requestUrl } = req;
    
    if (requestUrl.startsWith('/api/cambio/subscribe') || requestUrl === '/api/cambio/subscribe/' || requestUrl.startsWith('/api/cambio/subscribe?')) {
      console.log('entro a subscribe')
      subscribeCambioEstado(req, res);
      return;
    }    
    else if (requestUrl.startsWith('/api/cambio/publish') || requestUrl === '/api/cambio/publish/' || requestUrl.startsWith('/api/cambio/publish?')) {
      publishCambioEstado(req, res);
      return;
    }
    else if (requestUrl.startsWith('/api/cambio/poll') || requestUrl === '/api/cambio/poll/' || requestUrl.startsWith('/api/cambio/poll?')) {
      const parsedUrl = url.parse(requestUrl, true); // Parsea la URL para obtener el ID
      const { id } = parsedUrl.query; // Extrae el valor del parámetro "id" del query
      console.log('entro a poll')
      pollCambioEstado(req, res, id);
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
    messages = {
      id: subscriber.id,
      ascensores: ascensores,
    };
    res.end(JSON.stringify(messages));
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
            pisoact: data.pisoact,
          }
          
          ascensores.push(ascensor); //guarda en cache de broker el ascensor
          console.log(ascensor)
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


async function subscribeCambioEstado(req, res) {  
 
  try {
   const subscriber = {  
     id: crypto.randomBytes(16).toString("hex"),  
     cache: [],  
   };
  
   subscribersCambioEstado.push(subscriber);
  
   res.statusCode = 200;  
    messages = {
      id: subscriber.id,
    };
    res.end(JSON.stringify(messages));
    console.log('Subscribers: ', subscribersCambioEstado);

  } catch (error) {
   res.statusCode = 400;
   res.end('Invalid JSON data in the request');
  }

}


async function publishCambioEstado(req, res) {  
  let body = '';
  console.log("publicando cambio esatdo")
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      
      if (data) {  
        console.log('Recibido datos de cambio de estado del ascensor con id:', data.idAscensor)
        
        const cambioEstado = {
          idAscensor: data.idAscensor,
          estado: data.estado,
          piso: data.piso,      //piso actual donde esta
          pisoNuevo: data.pisoNuevo,  //piso al que se dirige
        }
        
        //cambio el ascensor en cache local por si alguien se sucribe, lo tiene actualizado
        const ascensor = ascensores.find((a) => a.id === cambioEstado.idAscensor);
        if (!ascensor) {
          res.statusCode = 400;
          res.end('Ascensor no encontrado');
          return;
        }

         ascensor.estado = cambioEstado.estado;
         ascensor.pisoact = cambioEstado.pisoNuevo;

        console.log(ascensores);
        //En ESTE CASO SE ENVIA A TODOS INCLUYENDO AL QUE LO PUBLICO !!!VER SI DECIDIMOS QUE NO SE ENVIE AL QUE LO PUBLICO!!!
        subscribersCambioEstado.forEach((s) => {s.cache.push(cambioEstado) });  
        
        res.statusCode = 200;
        res.end('Cambio de estado recibido correctamente');
        console.log(subscribersCambioEstado)
        
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

async function pollCambioEstado(req, res, id) {
    
  const subscriber = subscribersCambioEstado.find((s) => s.id === id);  //busca suscriptor con ese id aver si existe en la lista del topico
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
    cambioEstado: subscriber.cache,
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
    if (url.startsWith('/api/ascensores')) {
        requestHandlerAscensores(req, res);
        return;
    }
    else if (url.startsWith('/api/cambio')) {
      requestHandlerCambioEstado(req, res);
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