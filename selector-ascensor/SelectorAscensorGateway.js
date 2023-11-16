const http = require('http');
const URL = require('url');
const selectorAscensorService = require('./SelectorAscensorService.js'); 
const puerto = 3001;

const requestHandler = (req, res) => {
    const { method, url } = req;
    console.log(method);

    switch (method) {
        case 'POST':
            postRequest(req, res , url);
            break;
        default:
            res.statusCode = 404;
            res.end();
            break;    
    }        
}

const postRequest = async (req, res, url) => {
    if (url.startsWith('/api/selectorAscensor')) {
        try {       
            let body =''
            let piso_destino
            let piso_origen
            req.on('data', (chunk) => {
                body += chunk.toString();
              });
            req.on('end', async () => {
                try {
                    piso_destino=JSON.parse(body).piso_destino
                    piso_origen=JSON.parse(body).piso_origen
                    console.log("PISO DESTINO: "+piso_destino)
                    console.log("PISO ORIGEN: "+piso_origen)
                    const respuesta = await selectorAscensorService.obtenerPiso(piso_destino);
                    if (respuesta.id == -999) {//CASO DE NO HABER ENCONTRADO NINGUNO
                        const errorResponse = {
                            cod_error: '409',
                            descripcion: 'No se encontró ningún ascensor'
                        };
                        res.statusCode = 409;
                        res.end(JSON.stringify(errorResponse));
                    }
                    else{
                        res.end(JSON.stringify(respuesta));
                        res.statusCode = 200;
                    }
                }
                catch (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    console.log(err.message);
                    res.end(JSON.stringify({ error: err.message }));
            }});
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
server.listen(puerto, () => {
    console.log('Server Gateway escuchando en puerto 3001');
});
