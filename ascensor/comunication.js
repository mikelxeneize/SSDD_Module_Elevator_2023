const http = require('http');

const sendData = async (url, data) => {
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
    });
    if (response.status === 200) {
        // Si el código de estado es 200 (OK), parsea y devuelve la respuesta como JSON.
        return await response.json();
    } else {
        // Si el código de estado no es 200, lanza un error con el código de estado y el texto de la respuesta.
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
}

const getData = async (url) => {
    const response = await fetch(url,{
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (response.status === 200) {
        // Si el código de estado es 200 (OK), parsea y devuelve la respuesta como JSON.
        return await response.json();
    } else {
        // Si el código de estado no es 200, lanza un error con el código de estado y el texto de la respuesta.
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
}

module.exports = {
    sendData,
    getData
}


//const heroesService = require('./service/heroesService'); // aca deberia ir a donde me conecto con el broker
/*
const requestHandler = (req, res) => {
    const { method, url } = req;
    console.log(method); // GET, POST, PUT, DELETE

    switch (method) {
        case 'GET':
            getRequest(req, res , url);
            break;
        case 'POST':
            postRequest(req, res, url);
        default:
            res.statusCode = 404;
            res.end();
            break;    
    }        
}

const getRequest = async (req, res, url) => {
    console.log(url);
    if (url.startsWith('/api/heroes/') || url === '/api/heroes' || url.startsWith('/api/heroes?')) {
        try {
            const respuesta = await heroesService.getMethod(url);
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

*/