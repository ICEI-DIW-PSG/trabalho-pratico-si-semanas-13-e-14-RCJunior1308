const API_URL = "http://127.0.0.1:3000/obras";

function carregarAutor() {
  const autor = {
    nome: "Sidney Sheldon",
    bio: "Sidney Sheldon (1917-2007) foi um dos autores mais populares do século XX. Conhecido por romances de suspense repletos de reviravoltas, também foi roteirista vencedor do Oscar e Emmy."
  };

  document.getElementById("autor-nome").textContent = autor.nome;
  document.getElementById("autor-bio").textContent = autor.bio;
}

async function carregarObras() {
  const container = document.getElementById("lista-obras");
  container.innerHTML = `<p class="text-center text-muted">Carregando obras...</p>`;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Erro ao carregar obras");

    const obras = await response.json();
    container.innerHTML = "";

    obras.forEach(obra => {
      const idNum = Number(obra.id) || obra.id; 
      const card = document.createElement("div");
      card.className = "col-md-3 col-sm-6 mb-4";

      card.innerHTML = `
        <div class="card h-100 shadow-sm">
          <img src="${obra.imagem}" class="card-img-top" alt="${obra.titulo}" style="height: 300px; object-fit: cover;">
          <div class="card-body text-center d-flex flex-column justify-content-between">
            <div>
              <h5 class="card-title">${obra.titulo}</h5>
              <p class="text-muted small">${obra.descricao}</p>
              <p><small><strong>Ano:</strong> ${obra.ano}</small></p>
            </div>
            <div class="d-flex justify-content-center gap-2 mt-3">
              <a href="detalhes.html?id=${idNum}" class="btn btn-outline-secondary btn-sm">Ver</a>
              <button class="btn btn-outline-secondary btn-sm" onclick="editarObra('${idNum}')">Editar</button>
              <button class="btn btn-outline-secondary btn-sm" onclick="excluirObra('${idNum}')">Excluir</button>
            </div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (erro) {
    console.error(erro);
    container.innerHTML = `<p class="text-danger text-center">Erro ao carregar obras. Verifique se o JSON Server está ativo.</p>`;
  }
}

async function carregarDestaques() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Erro ao carregar destaques");

    const obras = await response.json();
    const destaques = obras.filter(o => o.destaque).slice(0, 5);
    const carouselInner = document.getElementById("carousel-inner-destaques");

    if (!carouselInner) return;
    carouselInner.innerHTML = "";

    destaques.forEach((obra, index) => {
      const item = document.createElement("div");
      item.className = `carousel-item ${index === 0 ? "active" : ""}`;

      item.innerHTML = `
        <div class="d-flex align-items-center bg-white rounded shadow-sm p-3" style="height: 400px;">
          <div class="flex-shrink-0" style="flex: 0 0 45%; text-align: center;">
            <img src="${obra.imagem}" alt="${obra.titulo}" 
              style="max-height: 360px; max-width: 100%; object-fit: contain;">
          </div>
          <div class="flex-grow-1 p-4">
            <h4 class="fw-bold">${obra.titulo}</h4>
            <p class="text-muted">${obra.descricao}</p>
            <p><small><strong>Ano:</strong> ${obra.ano}</small></p>
          </div>
        </div>
      `;
      carouselInner.appendChild(item);
    });

  } catch (erro) {
    console.error("Erro ao carregar destaques:", erro);
  }
}

async function adicionarObra(event) {
  event.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const ano = document.getElementById("ano").value.trim();
  const descricao = document.getElementById("descricao").value.trim();

  if (!titulo || !ano || !descricao) {
    alert("Preencha todos os campos!");
    return;
  }

  const novaObra = { 
    titulo, 
    ano: Number(ano), 
    descricao, 
    imagem: "assets/image/default.jpg" 
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaObra)
    });

    if (response.ok) {
      alert("Obra adicionada com sucesso!");
      document.getElementById("formNovaObra").reset();
      carregarObras();
      carregarDestaques();
    } else {
      throw new Error("Erro ao adicionar obra");
    }

  } catch (erro) {
    console.error("Erro ao adicionar obra:", erro);
  }
}

async function editarObra(id) {
  const novoTitulo = prompt("Digite o novo título:");
  if (!novoTitulo) return;

  try {
 
    const getRes = await fetch(`${API_URL}/${id}`);
    if (!getRes.ok) throw new Error("Obra não encontrada");
    const obraAtual = await getRes.json();
  
    obraAtual.titulo = novoTitulo;
  
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(obraAtual)
    });

    if (response.ok) {
      alert("Obra editada com sucesso!");
      carregarObras();
    } else {
      throw new Error("Erro ao atualizar obra");
    }

  } catch (erro) {
    console.error("Erro ao editar obra:", erro);
    alert("Erro ao editar obra. Veja o console.");
  }
}

async function excluirObra(id) {
  if (!confirm("Tem certeza que deseja excluir esta obra?")) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (response.ok) {
      alert("Obra excluída com sucesso!");
      carregarObras();
    } else {
      throw new Error("Erro ao excluir obra");
    }
  } catch (erro) {
    console.error("Erro ao excluir obra:", erro);
    alert("Erro ao excluir obra. Veja o console.");
  }
}

function configurarFormulario() {
  document.getElementById("formNovaObra").addEventListener("submit", adicionarObra);
}

document.addEventListener("DOMContentLoaded", () => {
  carregarAutor();
  carregarDestaques();
  carregarObras();
  configurarFormulario();
});
