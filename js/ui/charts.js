/**
 * Capa de UI (Gráficos): Renderizado y actualización reactiva de gráficos con Chart.js.
 * Reutiliza las instancias existentes mediante chart.update() en lugar de recrear el canvas.
 */
(function (global) {
  const StudyTracker = (global.StudyTracker = global.StudyTracker || {});
  const { analizarPorHora, analizarPorMateria } = StudyTracker.RPG;

  let chartHoraInstance = null;
  let chartMateriaInstance = null;

  /**
   * Actualiza o inicializa el gráfico de rendimiento por hora del día.
   */
  function actualizarGraficoPorHora(datosHora) {
    const canvas = document.getElementById("chartPorHora");
    if (!canvas) return;

    const labels = datosHora.horasOrdenadas.length ? datosHora.horasOrdenadas : ["Sin datos"];
    const dataCalidad = datosHora.calidadPorHora.length ? datosHora.calidadPorHora : [0];
    const dataMinutos = datosHora.minutosPorHora.length ? datosHora.minutosPorHora : [0];

    if (chartHoraInstance) {
      chartHoraInstance.data.labels = labels;
      chartHoraInstance.data.datasets[0].data = dataCalidad;
      chartHoraInstance.data.datasets[1].data = dataMinutos;
      chartHoraInstance.update();
      return;
    }

    const ctxHora = canvas.getContext("2d");
    chartHoraInstance = new Chart(ctxHora, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            type: "line",
            label: "Calidad Promedio (1-5)",
            data: dataCalidad,
            borderColor: "#10b981",
            backgroundColor: "#10b981",
            borderWidth: 3,
            tension: 0.3,
            yAxisID: "yCalidad"
          },
          {
            type: "bar",
            label: "Minutos Estudiados",
            data: dataMinutos,
            backgroundColor: "rgba(99, 102, 241, 0.65)",
            borderRadius: 6,
            yAxisID: "yMinutos"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: "#cbd5e1" } } },
        scales: {
          x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(51,65,85,0.4)" } },
          yMinutos: {
            type: "linear",
            position: "left",
            beginAtZero: true,
            title: { display: true, text: "Minutos", color: "#94a3b8" },
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(51,65,85,0.4)" }
          },
          yCalidad: {
            type: "linear",
            position: "right",
            min: 0,
            max: 5,
            title: { display: true, text: "Calidad (1-5)", color: "#10b981" },
            ticks: { color: "#10b981", stepSize: 1 },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }

  /**
   * Actualiza o inicializa el gráfico de tiempo vs. % uso de IA por materia.
   */
  function actualizarGraficoPorMateria(datosMateria) {
    const canvas = document.getElementById("chartPorMateria");
    if (!canvas) return;

    const labels = datosMateria.materiasLabels.length ? datosMateria.materiasLabels : ["Sin datos"];
    const dataMinutos = datosMateria.minutosMateria.length ? datosMateria.minutosMateria : [0];
    const dataIA = datosMateria.iaMateria.length ? datosMateria.iaMateria : [0];

    if (chartMateriaInstance) {
      chartMateriaInstance.data.labels = labels;
      chartMateriaInstance.data.datasets[0].data = dataMinutos;
      chartMateriaInstance.data.datasets[1].data = dataIA;
      chartMateriaInstance.update();
      return;
    }

    const ctxMat = canvas.getContext("2d");
    chartMateriaInstance = new Chart(ctxMat, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Minutos Totales",
            data: dataMinutos,
            backgroundColor: "rgba(59, 130, 246, 0.7)",
            borderRadius: 6,
            yAxisID: "yMin"
          },
          {
            label: "% Uso IA Promedio",
            data: dataIA,
            backgroundColor: "rgba(245, 158, 11, 0.75)",
            borderRadius: 6,
            yAxisID: "yIA"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: "#cbd5e1" } } },
        scales: {
          x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(51,65,85,0.4)" } },
          yMin: {
            type: "linear",
            position: "left",
            beginAtZero: true,
            title: { display: true, text: "Minutos", color: "#94a3b8" },
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(51,65,85,0.4)" }
          },
          yIA: {
            type: "linear",
            position: "right",
            min: 0,
            max: 100,
            title: { display: true, text: "% Uso IA", color: "#f59e0b" },
            ticks: { color: "#f59e0b" },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }

  /**
   * Renderiza ambos gráficos a partir de la lista de sesiones y devuelve el análisis por hora.
   */
  function renderizarGraficos(sesiones) {
    const datosHora = analizarPorHora(sesiones);
    const datosMateria = analizarPorMateria(sesiones);

    actualizarGraficoPorHora(datosHora);
    actualizarGraficoPorMateria(datosMateria);

    return { datosHora, datosMateria };
  }

  StudyTracker.Charts = {
    renderizarGraficos
  };
})(window);

