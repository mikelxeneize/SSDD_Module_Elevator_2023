const getHeroes = async () => {
  const response = await fetch("http://localhost:3000/api/heroes");
  return await response.json();
};

export default async () => {
  const response = await getHeroes();
  const heroes = JSON.parse(response);

  const views = `
    <h1 class='mt-5 ms-5 text-blue'>STAR WARS HEROES</h1>
    <p class='ms-5 h4 text-primary'>Backend</p>
    <div class='d-flex justify-content-between'>
        <div class="container mt-3">
        <h3>Heroes</h3>
            <div class="row">
                ${heroes
                  .map(
                    (hero) => `
                    <div class="col-md-4">
                        <div class="card mb-4">
                            <div class="card-body">
                                <h5 class="card-title">${
                                  hero.nombreCompleto
                                }</h5>
                                <p class="card-text">Categoría: ${
                                  hero.categoria
                                }</p>
                                ${
                                  hero.colorArma
                                    ? `<p class="card-text">Color del arma: ${hero.colorArma}</p>`
                                    : ""
                                }
                            </div>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
        <div class="container mt-3">
            <h3>Agregar Héroe</h3>
            <form id="heroForm">
                <div class="mb-3">
                    <label for="nombre">Nombre</label>
                    <input type="text" class="form-control" id="nombre" name="nombre" required>
                </div>
                <div class="mb-3">
                    <label for="categoria">Categoría</label>
                    <select class="form-control" id="categoria" name="categoria" required>
                        <option value="Jedi">Jedi</option>
                        <option value="Sith">Sith</option>
                        <option value="Soldado">Soldado</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Enviar</button>
            </form>
        </div>
    </div>
`;

  const divElement = document.createElement("div");
  divElement.innerHTML = views;

  return divElement;
};
