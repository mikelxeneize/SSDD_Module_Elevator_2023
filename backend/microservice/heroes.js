const http = require('http');
const fs = require('fs');


const requestHandler = (req, res) => {
    const { method, url } = req;
    console.log(method);

    switch (method) {
        case 'GET':
            getRequest(req, res, url);
            break;
        default:
            res.statusCode = 404;
            res.end();
            break;    
    }        
}


const server = http.createServer((req, res) => {
     //CORS, necesario para que el browser no bloquee el request
     res.setHeader('Access-Control-Allow-Origin', '*');
     res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, DELETE');
     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
 
     const { url } = req; 
     
     if(url.startsWith('/api/heroes/') || url === '/api/heroes')
     {
         requestHandler(req, res);
         return;
     }
 
     //si esta aca es error
     res.statusCode = 404;
     res.end();
});


const getRequest = (req, res, url) => {
    console.log("llego 3");
    if (url === '/api/heroes') {                          // Leer el archivo heroes.json y enviar su contenido como respuesta
        fs.readFile('heroes.json', (err, data) => {
            if (err) {        //error
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al leer el archivo heroes.json' }));
            } else {
                try {
                    const heroesData = JSON.parse(data);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    console.log(heroesData);
                    res.end(JSON.stringify(heroesData));               //devuelve heroesData
                } catch (error) {     //error
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error al parsear los datos de heroes.json' }));
                }
            }
        });
    } else { //error de ruteo
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Ruta no válida para obtener héroes' }));
    }
};


server.listen(8080, () => {
    console.log(`Servidor de héroes: Levantado en el puerto 8080`);
});