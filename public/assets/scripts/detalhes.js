document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));

  const container = document.getElementById("detalhe-obra");

  try {

    const resposta = await fetch(`http://localhost:3000/obras/${id}`);

    if (!resposta.ok) {
      throw new Error("Obra não encontrada");
    }

    const obra = await resposta.json();

    let galeriaHTML = "";

    if (obra.fotos && obra.fotos.length > 0) {
      galeriaHTML = `
        <div id="carouselFotos" class="carousel slide mb-4" data-bs-ride="carousel" data-bs-interval="2000">
          <div class="carousel-inner">
            ${obra.fotos.map((foto, index) => `
              <div class="carousel-item ${index === 0 ? "active" : ""}">
                <img src="${foto}" class="d-block w-100 rounded" alt="Imagem extra ${index + 1}"
                     style="width: 100%; height: 250px; object-fit: contain; background: #fff;">
              </div>
            `).join("")}
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#carouselFotos" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Anterior</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#carouselFotos" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Próxima</span>
          </button>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="row g-4 align-items-start">
        <div class="col-md-4 text-center">
          <img src="${obra.imagem}" 
               class="img-fluid rounded shadow-sm" 
               alt="${obra.titulo}" 
               style="max-height:400px; object-fit:contain; background:#fff; padding:10px;">
        </div>

        <div class="col-md-8">
          <h2>${obra.titulo} <small class="text-muted">(${obra.ano})</small></h2>
          <p><strong>Descrição:</strong> ${obra.descricao}</p>
          <p><strong>Resumo:</strong> ${obra.resumo}</p>
          ${galeriaHTML}
        </div>
      </div>
    `;
  } catch (erro) {
    console.error("Erro ao carregar a obra:", erro);
    container.innerHTML = `<p class="text-danger">Erro ao carregar os detalhes da obra.</p>`;
  }
});
