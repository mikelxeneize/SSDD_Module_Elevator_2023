const http = require('http');
const URL = require('url');
const selectorAscensorService = require('./SelectorAscensorService.js'); 


const requestHandler = (req, res) => {
    const { method, url } = req;
    console.log(method);

    switch (method) {
        case 'GET':
            getRequest(req, res , url);
            break;
        default:
            res.statusCode = 404;
            res.end();
            break;    
    }        
}

const getRequest = async (req, res, url) => {
    if (url.startsWith('/api/selectorAscensor')) {
        try {
            let parsedUrl = URL.parse(url, true);
            let piso = parsedUrl.query.piso;
            const respuesta = await selectorAscensorService.obtenerPiso(piso);
            res.setHeader('Content-Type', 'application/json'); // Devuelvo la respuesta con un header que indica que es JSON
            res.end(JSON.stringify(respuesta));
        } catch (err) {
            res.statusCode = 500; // Error interno del servidor
            res.setHeader('Content-Type', 'application/json'); 
            console.log(err.message)
            res.end(JSON.stringify({ error: err.message }));
        }
    }
};


//creo server, los requests se hace cargo request handler
const server = http.createServer((req, res) => {
  
    //CORS, necesario para que el browser no bloquee el request
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    const { url } = req; //de req extraigo url
    console.log(url);
    if (url.startsWith('/api/selectorAscensor')) {
        requestHandler(req, res);
        return;
    }

    //si esta aca es error
    res.statusCode = 404;
    res.end();
});


// Server escuchando en puerto 3001
server.listen(3001, () => {
    console.log('Server Gateway escuchando en puerto 3001');
});
