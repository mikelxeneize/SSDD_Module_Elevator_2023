import Home from '../views/home.js';

let content = document.getElementById('root');  //donde se hara append de los elementos html importades desde views-


const router = async (route) =>  {          //Es async pq Naves y Peliculas son requests a una API y usan await 
    content.innerHTML=''; //limpia el content para evitar repetir

    switch (route) {
        case '#/': 
           return content.appendChild(Home());   //retorna el contenido de Home al id root de index.html
        default :
            return console.log('Error 404');       
    }       
}

export {router}; //EXPORTA FUNCION DE ROUTING