const getPeliculas = async () => { //el html es string, si quiero q sea puro usar webpack -->Es mas carpetas y configuracion, aca esta muy limpio, nose si vale la pena.
    const response = await fetch('https://swapi.dev/api/films/');
    return await response.json();
}

export default async () => {
    const peliculas = await getPeliculas();
    console.log(peliculas);

    const views = `
          <h1 class='mt-5 text-center text-blue'>STAR WARS PELICULAS</h1>
          <p class='text-center h4 text-primary'>SW api</p>
          <div class="container mt-3">
              <div class="row">
                  ${peliculas.results.map(pelicula => `
                      <div class="col-md-4">
                          <div class="card mb-4">
                              <div class="card-body">
                                  <h5 class="card-title">${pelicula.title}</h5>
                                  <p class="card-text">Episodio: ${pelicula.episode_id}</p>
                                  <p class="card-text">Director: ${pelicula.director}</p>
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