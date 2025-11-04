document.addEventListener("DOMContentLoaded", async () => {
  const calendarEl = document.getElementById("calendar");
  const graficoEl = document.getElementById("graficoCategorias");
  const API_URL = "http://localhost:3000/obras";

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Erro ao carregar obras.");
    const obras = await response.json();

    // --- Anos ---
    const anos = obras.map(o => o.ano);
    const menorAno = Math.min(...anos);
    const maiorAno = Math.max(...anos);

    // --- Eventos ---
    const eventos = obras.map(obra => ({
      title: obra.titulo,
      start: obra.dataLancamento || `${obra.ano}-01-01`,
      extendedProps: {
        descricao: obra.descricao,
        ano: obra.ano,
        imagem: obra.imagem,
        destaque: obra.destaque,
        categoria: obra.categoria
      },
      classNames: obra.destaque ? ["event-destaque"] : []
    }));

    // --- Inicializa calendário ---
    const calendar = new FullCalendar.Calendar(calendarEl, {
      themeSystem: "bootstrap5",
      locale: "pt-br",
      initialView: "dayGridMonth",
      headerToolbar: {
        left: "prev,next",
        center: "title",
        right: "dayGridMonth,listYear"
      },
      buttonText: { month: "Mês", list: "Lista/ano" },
      contentHeight: "auto",
      aspectRatio: 1.25,
      validRange: { start: `${menorAno}-01-01`, end: `${maiorAno}-12-31` },
      events: eventos,
      eventDidMount: (info) => {
        const { descricao, ano, imagem, categoria } = info.event.extendedProps;
        const html = `
          <strong>${info.event.title}</strong><br>
          <span class="text-muted">Ano: ${ano}</span><br>
          <small>${descricao}</small><br>
          <em class="text-secondary">${categoria || "Categoria não informada"}</em>
          ${imagem ? `<br><img src="${imagem}" alt="${info.event.title}" style="width:100%;border-radius:6px;margin-top:5px;">` : ""}
        `;
        new bootstrap.Tooltip(info.el, {
          title: html,
          html: true,
          placement: "bottom",
          trigger: "hover",
          container: "body"
        });
      }
    });

    calendar.render();

    // --- Contagem de categorias ---
    const contagemCategorias = {};
    obras.forEach(o => {
      if (o.categoria) {
        contagemCategorias[o.categoria] = (contagemCategorias[o.categoria] || 0) + 1;
      }
    });

    const cores = [
      "#ff6fa0", "#ffd166", "#06d6a0", "#118ab2", "#ef476f",
      "#8ecae6", "#c77dff", "#f9844a", "#8338ec", "#3a86ff",
      "#ffb703", "#219ebc", "#fb8500", "#b5179e", "#7209b7"
    ];

    // --- Plugin: mostra texto e lista no centro do gráfico ---
    const centerContentPlugin = {
      id: "centerContent",
      afterDraw(chart) {
        const { ctx, chartArea: { width, height } } = chart;
        const active = chart._activeCategory;

        ctx.save();
        ctx.font = "bold 16px 'Poppins', sans-serif";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (!active) {
          ctx.fillText("Clique em uma categoria", width / 2, height / 2);
        } else {
          // Nome da categoria e quantidade
          ctx.fillText(active.label, width / 2, height / 2 - 30);
          ctx.font = "13px 'Poppins', sans-serif";
          ctx.fillStyle = "#666";
          ctx.fillText(`${active.count} obra${active.count > 1 ? "s" : ""}`, width / 2, height / 2 - 10);

          // Lista de obras
          ctx.font = "11px 'Poppins', sans-serif";
          ctx.fillStyle = "#222";
          const maxLines = 4; // mostra até 4 obras no centro
          const obrasTexto = active.titulos.slice(0, maxLines);
          obrasTexto.forEach((titulo, i) => {
            const y = height / 2 + 12 + i * 14;
            ctx.fillText(titulo, width / 2, y);
          });

          // Indicador se houver mais obras
          if (active.titulos.length > maxLines) {
            ctx.fillStyle = "#999";
            ctx.font = "10px 'Poppins', sans-serif";
            ctx.fillText("... ver mais", width / 2, height / 2 + 12 + maxLines * 14);
          }
        }

        ctx.restore();
      }
    };

    // --- Criação do gráfico ---
    const chart = new Chart(graficoEl, {
      type: "doughnut",
      data: {
        labels: Object.keys(contagemCategorias),
        datasets: [{
          data: Object.values(contagemCategorias),
          backgroundColor: cores.slice(0, Object.keys(contagemCategorias).length),
          borderWidth: 0
        }]
      },
      options: {
        plugins: {
          legend: { position: "bottom", labels: { color: "#333", font: { size: 13 } } }
        },
        cutout: "65%",
        onClick: (e, elements) => {
          if (elements.length > 0) {
            const i = elements[0].index;
            const categoria = chart.data.labels[i];
            const obrasDaCategoria = obras.filter(o => o.categoria === categoria);

            // Atualiza o texto e a lista central
            chart._activeCategory = {
              label: categoria,
              count: obrasDaCategoria.length,
              titulos: obrasDaCategoria.map(o => `${o.titulo} (${o.ano})`)
            };

            chart.update();
          }
        }
      },
      plugins: [centerContentPlugin]
    });

  } catch (error) {
    console.error("Erro ao carregar o calendário:", error);
    calendarEl.innerHTML = `<p class="text-danger">Erro ao carregar o calendário.</p>`;
  }
});
