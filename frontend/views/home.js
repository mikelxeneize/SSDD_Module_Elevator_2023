export default () => {     //el html es string, si quiero q sea puro usar webpack -->Es mas carpetas y configuracion, aca esta muy limpio, nose si vale la pena.
    const views = 
    `
    <div>
    </div>
    `;
    const divElement = document.createElement("div");
    divElement.innerHTML = views;

    return divElement;
} 

