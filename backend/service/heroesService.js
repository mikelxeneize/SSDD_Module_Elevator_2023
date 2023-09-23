const http = require('http');

const enviroment_heroes_port = '8080' ;
const enviroment_heroes_host = 'http://localhost:';

const requestHost = '127.0.0.1'; //para el request


//METODO GET
const getMethod = (endpoint) => {
    console.log(enviroment_heroes_port + enviroment_heroes_host + endpoint)
    return new Promise((resolve,reject) => {
        http.get(enviroment_heroes_host + enviroment_heroes_port + endpoint).once('response', (response) => 
        {
            response.once('data', (data) => {
                respuesta = data.toString();
                console.log(respuesta)
                if(response.statusCode == 200)
                    resolve(respuesta)
                else
                    reject(respuesta)
            })
            response.once('error', () =>{
                reject('ERROR: en la respuesta desde: ' + endpoint)
            })
        }).once('error', (err) => {reject("ERROR: en la respuesta de: " + endpoint)});
    })  
}


module.exports = {getMethod : getMethod}