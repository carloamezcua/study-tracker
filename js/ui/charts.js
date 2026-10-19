/**
 * Capa de UI (Gráficos): Renderizado y actualización reactiva de gráficos con Chart.js.
 * Reutiliza las instancias existentes mediante chart.update() en lugar de recrear el canvas.
 */
(function (global) {
  const StudyTracker = (global.StudyTracker = global.StudyTracker || {});
  const { analizarPorHora, analizarPorMateria, analizarHabitos } = StudyTracker.RPG;

  let chartHoraInstance = null;
  let chartMateriaInstance = null;
  let chartActividadInstance = null;

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
   * Actualiza o inicializa el gráfico de Impacto de IA y Aprendizaje por Materia:
   * Contrasta Minutos de Aprendizaje (Autónomo / Diálogo / Copiloto) vs. Minutos Mecánicos (Copy-Paste)
   * junto con la línea de Calidad de Asimilación Promedio (1-5).
   */
  function actualizarGraficoPorMateria(datosMateria) {
    const canvas = document.getElementById("chartPorMateria");
    if (!canvas) return;

    const labels = datosMateria.materiasLabels.length ? datosMateria.materiasLabels : ["Sin datos"];
    const dataAprendizaje = datosMateria.minutosAprendizaje.length
      ? datosMateria.minutosAprendizaje
      : [0];
    const dataMecanico = datosMateria.minutosMecanicos.length
      ? datosMateria.minutosMecanicos
      : [0];
    const dataCalidad = datosMateria.calidadMateria.length ? datosMateria.calidadMateria : [0];

    if (chartMateriaInstance) {
      chartMateriaInstance.data.labels = labels;
      chartMateriaInstance.data.datasets[0].data = dataCalidad;
      chartMateriaInstance.data.datasets[1].data = dataAprendizaje;
      chartMateriaInstance.data.datasets[2].data = dataMecanico;
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
            type: "line",
            label: "Asimilación (1-5)",
            data: dataCalidad,
            borderColor: "#10b981",
            backgroundColor: "#10b981",
            borderWidth: 3,
            tension: 0.3,
            yAxisID: "yCalMat"
          },
          {
            type: "bar",
            label: "Min. Aprendizaje (Autónomo / Diálogo / Copiloto)",
            data: dataAprendizaje,
            backgroundColor: "rgba(59, 130, 246, 0.72)",
            borderRadius: 6,
            yAxisID: "yMin"
          },
          {
            type: "bar",
            label: "Min. Mecánico (Copy-Paste IA)",
            data: dataMecanico,
            backgroundColor: "rgba(239, 68, 68, 0.75)",
            borderRadius: 6,
            yAxisID: "yMin"
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
          yCalMat: {
            type: "linear",
            position: "right",
            min: 0,
            max: 5,
            title: { display: true, text: "Asimilación (1-5)", color: "#10b981" },
            ticks: { color: "#10b981", stepSize: 1 },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }

  /**
   * Actualiza o inicializa el gráfico de hábitos (Minutos vs Calidad por Tipo de Actividad).
   */
  function actualizarGraficoPorActividad(datosHabitos) {
    const canvas = document.getElementById("chartPorActividad");
    if (!canvas) return;

    const labels = datosHabitos.actividadesLabels.length
      ? datosHabitos.actividadesLabels
      : ["Sin datos"];
    const dataMinutos = datosHabitos.minutosPorActividad.length
      ? datosHabitos.minutosPorActividad
      : [0];
    const dataCalidad = datosHabitos.calidadPorActividad.length
      ? datosHabitos.calidadPorActividad
      : [0];

    if (chartActividadInstance) {
      chartActividadInstance.data.labels = labels;
      chartActividadInstance.data.datasets[0].data = dataCalidad;
      chartActividadInstance.data.datasets[1].data = dataMinutos;
      chartActividadInstance.update();
      return;
    }

    const ctxAct = canvas.getContext("2d");
    chartActividadInstance = new Chart(ctxAct, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            type: "line",
            label: "Calidad Promedio (1-5)",
            data: dataCalidad,
            borderColor: "#a855f7",
            backgroundColor: "#a855f7",
            borderWidth: 3,
            tension: 0.3,
            yAxisID: "yCalAct"
          },
          {
            type: "bar",
            label: "Minutos por Actividad",
            data: dataMinutos,
            backgroundColor: "rgba(16, 185, 129, 0.65)",
            borderRadius: 6,
            yAxisID: "yMinAct"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: "#cbd5e1" } } },
        scales: {
          x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(51,65,85,0.4)" } },
          yMinAct: {
            type: "linear",
            position: "left",
            beginAtZero: true,
            title: { display: true, text: "Minutos", color: "#94a3b8" },
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(51,65,85,0.4)" }
          },
          yCalAct: {
            type: "linear",
            position: "right",
            min: 0,
            max: 5,
            title: { display: true, text: "Calidad (1-5)", color: "#a855f7" },
            ticks: { color: "#a855f7", stepSize: 1 },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }

  /**
   * Renderiza los tres gráficos a partir de la lista de sesiones y devuelve los análisis.
   */
  function renderizarGraficos(sesiones) {
    const datosHora = analizarPorHora(sesiones);
    const datosMateria = analizarPorMateria(sesiones);
    const datosHabitos = analizarHabitos(sesiones);

    actualizarGraficoPorHora(datosHora);
    actualizarGraficoPorMateria(datosMateria);
    actualizarGraficoPorActividad(datosHabitos);

    return { datosHora, datosMateria, datosHabitos };
  }

  StudyTracker.Charts = {
    renderizarGraficos
  };
})(window);
