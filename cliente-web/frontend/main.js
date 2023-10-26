import { router } from "./router/index.router.js" //Importa funcion ROUTER, PONER CON .JS ALFINAL!!

router(window.location.hash); //llama por primera vez

window.addEventListener('hashchange', () => {  //cada vez que cambia url llama a router
    router(window.location.hash);
});

if(window.location.hash === '')
     window.location.hash = '#/';
