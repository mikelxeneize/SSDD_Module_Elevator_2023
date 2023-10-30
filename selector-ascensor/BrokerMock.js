const http = require('http');

const requestHandler = (req, res) => {
    const { method, url } = req;
    console.log(method);

    switch (method) {
        case 'GET':
            getRequest(req, res , url);
            break;
        case 'POST':
            postRequest(req, res , url);
            break;
        default:
            res.statusCode = 404;
            res.end();
            break;    
    }        
}

const getRequest = async (req, res, url) => {
    console.log(url);
    let respuesta 
    if (url.startsWith('/api/subscribe/nuevoAscensor') ) {
        respuesta = {id: 5, nombre: "A5", pisos: [ 1, 4, 6 ], estado: "Ocioso", piso_actual: 3}  
    }
    if (url.startsWith('/api/publisher/cambiarEstadoAscensor')) {
         respuesta = 'OK!'
    }
    if (url.startsWith('/api/subscribe/estados')) {
        respuesta = {id: 5, nombre: "A5", pisos: [ 1, 4, 6 ], estado: "Ocioso", piso_actual: 3}  
   }
    try {
            
            res.setHeader('Content-Type', 'application/json'); // Devuelvo la respuesta con un header que indica que es JSON
            res.end(JSON.stringify(respuesta));
        } catch (err) {
            res.statusCode = 500; // Error interno del servidor
            res.setHeader('Content-Type', 'application/json'); 
            console.log(err.message)
            res.end(JSON.stringify({ error: err.message }));
        }
    
};

const postRequest = async (req, res, url) => {
    console.log(url);
    let respuesta 
    if (url.startsWith('/api/subscribe/nuevoAscensor') ) {
         respuesta = {  id_subscripcion: "A1234", respuesta: "Subscripcion exitosa",ascensores_activos: [{id: 1,nombre: "A1",pisos: [ 1, 3, 5 ], estado: "Disponible",piso_actual: 3}]
    }
    }
    if (url.startsWith('/api/publisher/cambiarEstadoAscensor')) {
         respuesta = {id: 5, nombre: "A5", pisos: [ 1, 4, 6 ], estado: "Ocioso", piso_actual: 3}  
    }
    if (url.startsWith('/api/subscribe/estados')) {
        respuesta = {id: 5, nombre: "A5", pisos: [ 1, 4, 6 ], estado: "Ocioso", piso_actual: 3}  
   }
    try {
            
            res.setHeader('Content-Type', 'application/json'); // Devuelvo la respuesta con un header que indica que es JSON
            res.end(JSON.stringify(respuesta));
        } catch (err) {
            res.statusCode = 500; // Error interno del servidor
            res.setHeader('Content-Type', 'application/json'); 
            console.log(err.message)
            res.end(JSON.stringify({ error: err.message }));
        }
    
};
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
