//el html es string, si quiero q sea puro usar webpack -->Es mas carpetas y configuracion, aca esta muy limpio, nose si vale la pena.
const getNaves = async () => {
  const response = await fetch('https://swapi.dev/api/starships/');
  return await response.json();
}

export default async () => {
    
    const naves = await getNaves();
    console.log(naves);

    const views = `
        <h1 class='mt-5 text-center text-blue'>STAR WARS NAVES</h1>
        <p class='text-center h4 text-primary'>SW api</p>
        <div class="container mt-3">
            <div class="row">
                ${naves.results.map(ship => `
                    <div class="col-md-4">
                        <div class="card mb-4">
                            <div class="card-body">
                                <h5 class="card-title">${ship.name}</h5>
                                <p class="card-text">Modelo: ${ship.model}</p>
                                <p class="card-text">Fabricante: ${ship.manufacturer}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    const divElement = document.createElement("div");
    divElement.innerHTML = views;

    return divElement;
}
