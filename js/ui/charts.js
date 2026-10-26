/**
 * Capa de UI (Gráficos Interactivos): Renderizado y actualización reactiva con Chart.js.
 * Incluye:
 * 1. Evolución Temporal (Día / Semana / Mes).
 * 2. Cuadrante de Rendimiento Cognitivo (Burbujas: % IA vs. Asimilación 1-5, tamaño = Duración).
 * 3. Impacto de IA por Materia (con clic interactivo para filtrar el Dashboard).
 * 4. Patrones por los 8 Tipos de Actividad y Picos por Hora del Día.
 */
(function (global) {
  const StudyTracker = (global.StudyTracker = global.StudyTracker || {});
  const {
    analizarPorHora,
    analizarPorMateria,
    analizarHabitos,
    analizarEvolucionTemporal,
    analizarMapaCalorCircadiano,
    analizarCuadranteIA,
    analizarInspectorMateria
  } = StudyTracker.RPG;

  let chartEvolucionInstance = null;
  let chartCuadranteInstance = null;
  let chartHoraInstance = null;
  let chartMateriaInstance = null;
  let chartActividadInstance = null;
  let chartFriccionInstance = null;
  let callbackSeleccionMateria = null;

  function t(key, params) {
    if (StudyTracker.I18n && typeof StudyTracker.I18n.t === "function") {
      return StudyTracker.I18n.t(key, params);
    }
    return key;
  }

  function trVal(cat, val) {
    if (StudyTracker.I18n && typeof StudyTracker.I18n.traducirValor === "function") {
      return StudyTracker.I18n.traducirValor(cat, val);
    }
    return val;
  }

  // Plugin ligero para dibujar las líneas divisorias del Cuadrante Cognitivo (X=35% IA, Y=3.0 Calidad)
  const pluginLineasCuadrante = {
    id: "lineasCuadrante",
    beforeDraw(chart) {
      const { ctx, chartArea, scales } = chart;
      if (!chartArea || !scales.x || !scales.y) return;

      const xMid = scales.x.getPixelForValue(35);
      const yMid = scales.y.getPixelForValue(3);

      ctx.save();
      ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 5]);

      // Línea vertical divisoria de IA (35%)
      if (xMid >= chartArea.left && xMid <= chartArea.right) {
        ctx.beginPath();
        ctx.moveTo(xMid, chartArea.top);
        ctx.lineTo(xMid, chartArea.bottom);
        ctx.stroke();
      }

      // Línea horizontal divisoria de Asimilación (3.0)
      if (yMid >= chartArea.top && yMid <= chartArea.bottom) {
        ctx.beginPath();
        ctx.moveTo(chartArea.left, yMid);
        ctx.lineTo(chartArea.right, yMid);
        ctx.stroke();
      }

      ctx.restore();
    }
  };

  /**
   * 1. Gráfico de Evolución Temporal (Día / Semana / Mes).
   */
  function actualizarGraficoEvolucion(datosEvo) {
    const canvas = document.getElementById("chartEvolucion");
    if (!canvas) return;

    const labels = datosEvo.clavesOrdenadas.length
      ? datosEvo.clavesOrdenadas
      : [t("chartNoData")];
    const dataMinutos = datosEvo.minutos.length ? datosEvo.minutos : [0];
    const dataCalidad = datosEvo.calidadPromedio.length ? datosEvo.calidadPromedio : [0];

    if (chartEvolucionInstance) {
      chartEvolucionInstance.data.labels = labels;
      chartEvolucionInstance.data.datasets[0].label = t("chartDsAssimilationAvg");
      chartEvolucionInstance.data.datasets[0].data = dataCalidad;
      chartEvolucionInstance.data.datasets[1].label = t("chartDsMinutesStudied");
      chartEvolucionInstance.data.datasets[1].data = dataMinutos;
      chartEvolucionInstance.options.scales.yMinEvo.title.text = t("chartAxisMinutes");
      chartEvolucionInstance.options.scales.yCalEvo.title.text = t("chartAxisAssimilation");
      chartEvolucionInstance.update();
      return;
    }

    const ctx = canvas.getContext("2d");
    chartEvolucionInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            type: "line",
            label: t("chartDsAssimilationAvg"),
            data: dataCalidad,
            borderColor: "#34d399",
            backgroundColor: "#34d399",
            borderWidth: 3,
            tension: 0.3,
            yAxisID: "yCalEvo"
          },
          {
            type: "bar",
            label: t("chartDsMinutesStudied"),
            data: dataMinutos,
            backgroundColor: "rgba(99, 102, 241, 0.72)",
            borderRadius: 6,
            yAxisID: "yMinEvo"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: "#cbd5e1" } } },
        scales: {
          x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(51,65,85,0.4)" } },
          yMinEvo: {
            type: "linear",
            position: "left",
            beginAtZero: true,
            title: { display: true, text: t("chartAxisMinutes"), color: "#94a3b8" },
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(51,65,85,0.4)" }
          },
          yCalEvo: {
            type: "linear",
            position: "right",
            min: 0,
            max: 5,
            title: { display: true, text: t("chartAxisAssimilation"), color: "#34d399" },
            ticks: { color: "#34d399", stepSize: 1 },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }

  /**
   * 2. Gráfico de Burbujas del Cuadrante de Rendimiento Cognitivo (% IA vs. Asimilación 1-5).
   */
  function actualizarGraficoCuadranteIA(datosCuadrante) {
    const canvas = document.getElementById("chartCuadranteIA");
    if (!canvas) return;

    const coloresPorDinamica = {
      "Generación Propia": { bg: "rgba(16, 185, 129, 0.75)", border: "#10b981" },
      "Andamiaje / Co-creación": { bg: "rgba(99, 102, 241, 0.78)", border: "#818cf8" },
      "Recepción Pasiva": { bg: "rgba(56, 189, 248, 0.72)", border: "#38bdf8" },
      "Delegación / Reproducción": { bg: "rgba(239, 68, 68, 0.75)", border: "#f87171" }
    };

    const dinamicas = [
      "Generación Propia",
      "Andamiaje / Co-creación",
      "Recepción Pasiva",
      "Delegación / Reproducción"
    ];
    const datasets = dinamicas.map((din) => {
      const puntosDin = datosCuadrante.puntos.filter(
        (p) => (p.dinamicaCognitiva || p.modoIA) === din
      );
      const col = coloresPorDinamica[din] || coloresPorDinamica["Andamiaje / Co-creación"];
      return {
        label: trVal("dinamicaCognitiva", din),
        data: puntosDin,
        backgroundColor: col.bg,
        borderColor: col.border,
        borderWidth: 2
      };
    });

    if (chartCuadranteInstance) {
      chartCuadranteInstance.data.datasets = datasets;
      chartCuadranteInstance.options.scales.x.title.text = t("chartAxisAiPct");
      chartCuadranteInstance.options.scales.y.title.text = t("chartAxisAssimilation");
      chartCuadranteInstance.update();
      return;
    }

    const ctx = canvas.getContext("2d");
    chartCuadranteInstance = new Chart(ctx, {
      type: "bubble",
      data: { datasets },
      plugins: [pluginLineasCuadrante],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: "#cbd5e1" } },
          tooltip: {
            callbacks: {
              label(context) {
                const raw = context.raw || {};
                const dinTrad = trVal(
                  "dinamicaCognitiva",
                  raw.dinamicaCognitiva || raw.modoIA || "Andamiaje / Co-creación"
                );
                const domTrad = trVal(
                  "dominioPrevio",
                  raw.dominioPrevio || "En construcción"
                );
                return [
                  `📚 ${raw.materia || ""} — ${raw.tema || ""}`,
                  `⭐️ ${t("thAssimilation")}: ${raw.calidadReal}/5 | 🤖 IA: ${raw.iaReal}%`,
                  `🔄 ${dinTrad} | 🌱 ${domTrad}`,
                  `⏱️ ${t("thDuration")}: ${raw.duracion} min (${raw.fecha || ""})`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            type: "linear",
            min: -4,
            max: 105,
            title: { display: true, text: t("chartAxisAiPct"), color: "#94a3b8" },
            ticks: {
              color: "#94a3b8",
              callback: (v) => (v >= 0 && v <= 100 ? `${v}%` : "")
            },
            grid: { color: "rgba(51,65,85,0.35)" }
          },
          y: {
            type: "linear",
            min: 0.5,
            max: 5.5,
            title: { display: true, text: t("chartAxisAssimilation"), color: "#10b981" },
            ticks: {
              color: "#10b981",
              stepSize: 1,
              callback: (v) => (v >= 1 && v <= 5 ? `⭐️ ${v}` : "")
            },
            grid: { color: "rgba(51,65,85,0.35)" }
          }
        }
      }
    });
  }

  /**
   * 3. Gráfico de rendimiento por hora del día.
   */
  function actualizarGraficoPorHora(datosHora) {
    const canvas = document.getElementById("chartPorHora");
    if (!canvas) return;

    const labels = datosHora.horasOrdenadas.length
      ? datosHora.horasOrdenadas
      : [t("chartNoData")];
    const dataCalidad = datosHora.calidadPorHora.length ? datosHora.calidadPorHora : [0];
    const dataMinutos = datosHora.minutosPorHora.length ? datosHora.minutosPorHora : [0];

    if (chartHoraInstance) {
      chartHoraInstance.data.labels = labels;
      chartHoraInstance.data.datasets[0].label = t("chartDsAssimilationAvg");
      chartHoraInstance.data.datasets[0].data = dataCalidad;
      chartHoraInstance.data.datasets[1].label = t("chartDsMinutesStudied");
      chartHoraInstance.data.datasets[1].data = dataMinutos;
      chartHoraInstance.options.scales.yMinutos.title.text = t("chartAxisMinutes");
      chartHoraInstance.options.scales.yCalidad.title.text = t("chartAxisAssimilation");
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
            label: t("chartDsAssimilationAvg"),
            data: dataCalidad,
            borderColor: "#10b981",
            backgroundColor: "#10b981",
            borderWidth: 3,
            tension: 0.3,
            yAxisID: "yCalidad"
          },
          {
            type: "bar",
            label: t("chartDsMinutesStudied"),
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
            title: { display: true, text: t("chartAxisMinutes"), color: "#94a3b8" },
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(51,65,85,0.4)" }
          },
          yCalidad: {
            type: "linear",
            position: "right",
            min: 0,
            max: 5,
            title: { display: true, text: t("chartAxisAssimilation"), color: "#10b981" },
            ticks: { color: "#10b981", stepSize: 1 },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }

  /**
   * 4. Gráfico de Impacto de IA y Aprendizaje por Materia (con clic para filtrar por materia).
   */
  function actualizarGraficoPorMateria(datosMateria) {
    const canvas = document.getElementById("chartPorMateria");
    if (!canvas) return;

    const labels = datosMateria.materiasLabels.length
      ? datosMateria.materiasLabels
      : [t("chartNoData")];
    const dataAprendizaje = datosMateria.minutosAprendizaje.length
      ? datosMateria.minutosAprendizaje
      : [0];
    const dataMecanico = datosMateria.minutosMecanicos.length
      ? datosMateria.minutosMecanicos
      : [0];
    const dataCalidad = datosMateria.calidadMateria.length ? datosMateria.calidadMateria : [0];

    if (chartMateriaInstance) {
      chartMateriaInstance.data.labels = labels;
      chartMateriaInstance.data.datasets[0].label = t("chartDsAssimilationShort");
      chartMateriaInstance.data.datasets[0].data = dataCalidad;
      chartMateriaInstance.data.datasets[1].label = t("chartDsMinLearning");
      chartMateriaInstance.data.datasets[1].data = dataAprendizaje;
      chartMateriaInstance.data.datasets[2].label = t("chartDsMinMechanical");
      chartMateriaInstance.data.datasets[2].data = dataMecanico;
      chartMateriaInstance.options.scales.yMin.title.text = t("chartAxisMinutes");
      chartMateriaInstance.options.scales.yCalMat.title.text = t("chartAxisAssimilation");
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
            label: t("chartDsAssimilationShort"),
            data: dataCalidad,
            borderColor: "#10b981",
            backgroundColor: "#10b981",
            borderWidth: 3,
            tension: 0.3,
            yAxisID: "yCalMat"
          },
          {
            type: "bar",
            label: t("chartDsMinLearning"),
            data: dataAprendizaje,
            backgroundColor: "rgba(59, 130, 246, 0.72)",
            borderRadius: 6,
            yAxisID: "yMin"
          },
          {
            type: "bar",
            label: t("chartDsMinMechanical"),
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
        onClick(evt, elements) {
          if (!elements || !elements.length || typeof callbackSeleccionMateria !== "function") {
            return;
          }
          const idx = elements[0].index;
          const materiaClick = chartMateriaInstance.data.labels[idx];
          if (materiaClick && materiaClick !== t("chartNoData")) {
            callbackSeleccionMateria(materiaClick);
          }
        },
        plugins: { legend: { labels: { color: "#cbd5e1" } } },
        scales: {
          x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(51,65,85,0.4)" } },
          yMin: {
            type: "linear",
            position: "left",
            beginAtZero: true,
            title: { display: true, text: t("chartAxisMinutes"), color: "#94a3b8" },
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(51,65,85,0.4)" }
          },
          yCalMat: {
            type: "linear",
            position: "right",
            min: 0,
            max: 5,
            title: { display: true, text: t("chartAxisAssimilation"), color: "#10b981" },
            ticks: { color: "#10b981", stepSize: 1 },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }

  /**
   * 5. Gráfico de hábitos (Minutos vs Calidad por Tipo de Actividad).
   */
  function actualizarGraficoPorActividad(datosHabitos) {
    const canvas = document.getElementById("chartPorActividad");
    if (!canvas) return;

    const labels = datosHabitos.actividadesLabels.length
      ? datosHabitos.actividadesLabels.map((act) => trVal("tipoActividad", act))
      : [t("chartNoData")];
    const dataMinutos = datosHabitos.minutosPorActividad.length
      ? datosHabitos.minutosPorActividad
      : [0];
    const dataCalidad = datosHabitos.calidadPorActividad.length
      ? datosHabitos.calidadPorActividad
      : [0];

    if (chartActividadInstance) {
      chartActividadInstance.data.labels = labels;
      chartActividadInstance.data.datasets[0].label = t("chartDsAssimilationAvg");
      chartActividadInstance.data.datasets[0].data = dataCalidad;
      chartActividadInstance.data.datasets[1].label = t("chartDsMinByActivity");
      chartActividadInstance.data.datasets[1].data = dataMinutos;
      chartActividadInstance.options.scales.yMinAct.title.text = t("chartAxisMinutes");
      chartActividadInstance.options.scales.yCalAct.title.text = t("chartAxisAssimilation");
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
            label: t("chartDsAssimilationAvg"),
            data: dataCalidad,
            borderColor: "#a855f7",
            backgroundColor: "#a855f7",
            borderWidth: 3,
            tension: 0.3,
            yAxisID: "yCalAct"
          },
          {
            type: "bar",
            label: t("chartDsMinByActivity"),
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
            title: { display: true, text: t("chartAxisMinutes"), color: "#94a3b8" },
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(51,65,85,0.4)" }
          },
          yCalAct: {
            type: "linear",
            position: "right",
            min: 0,
            max: 5,
            title: { display: true, text: t("chartAxisAssimilation"), color: "#a855f7" },
            ticks: { color: "#a855f7", stepSize: 1 },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }

  /**
   * 6. Gráfico de Matriz de Fricción (Barras Apiladas de 4 niveles por Complejidad y Dominio Previo).
   */
  function actualizarGraficoMatrizFriccion(datosHabitos) {
    const canvas = document.getElementById("chartMatrizFriccion");
    if (!canvas) return;

    const filas = Array.isArray(datosHabitos.matrizFriccion) ? datosHabitos.matrizFriccion : [];
    const labels = filas.map((f) =>
      f.tipo === "complejidad"
        ? trVal("complejidad", f.clave)
        : trVal("dominioPrevio", f.clave)
    );
    const dataFlujo = filas.map((f) => f.flujo ?? f.si);
    const dataLucha = filas.map((f) => f.lucha ?? 0);
    const dataFriccion = filas.map((f) => f.friccion ?? f.parcial);
    const dataParalisis = filas.map((f) => f.paralisis ?? f.no);

    if (chartFriccionInstance && chartFriccionInstance.data.datasets.length === 4) {
      chartFriccionInstance.data.labels = labels;
      chartFriccionInstance.data.datasets[0].label = t("frictionDsFlow");
      chartFriccionInstance.data.datasets[0].data = dataFlujo;
      chartFriccionInstance.data.datasets[1].label = t("frictionDsStruggle");
      chartFriccionInstance.data.datasets[1].data = dataLucha;
      chartFriccionInstance.data.datasets[2].label = t("frictionDsFriction");
      chartFriccionInstance.data.datasets[2].data = dataFriccion;
      chartFriccionInstance.data.datasets[3].label = t("frictionDsFreeze");
      chartFriccionInstance.data.datasets[3].data = dataParalisis;
      chartFriccionInstance.options.scales.y.title.text = t("frictionAxisSessions");
      chartFriccionInstance.update();
      return;
    }

    if (chartFriccionInstance) {
      chartFriccionInstance.destroy();
      chartFriccionInstance = null;
    }

    const ctxFric = canvas.getContext("2d");
    chartFriccionInstance = new Chart(ctxFric, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: t("frictionDsFlow"),
            data: dataFlujo,
            backgroundColor: "rgba(16, 185, 129, 0.78)",
            borderRadius: 5,
            stack: "friccion"
          },
          {
            label: t("frictionDsStruggle"),
            data: dataLucha,
            backgroundColor: "rgba(139, 92, 246, 0.82)",
            borderRadius: 5,
            stack: "friccion"
          },
          {
            label: t("frictionDsFriction"),
            data: dataFriccion,
            backgroundColor: "rgba(245, 158, 11, 0.82)",
            borderRadius: 5,
            stack: "friccion"
          },
          {
            label: t("frictionDsFreeze"),
            data: dataParalisis,
            backgroundColor: "rgba(239, 68, 68, 0.82)",
            borderRadius: 5,
            stack: "friccion"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: "#cbd5e1" } } },
        scales: {
          x: {
            stacked: true,
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(51,65,85,0.4)" }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            title: { display: true, text: t("frictionAxisSessions"), color: "#94a3b8" },
            ticks: { color: "#94a3b8", stepSize: 1 },
            grid: { color: "rgba(51,65,85,0.4)" }
          }
        }
      }
    });
  }

  /**
   * Renderiza todos los gráficos y devuelve los objetos analíticos procesados.
   */
  function renderizarGraficos(
    sesiones,
    { agrupacionTemporal = "dia", onSeleccionarMateria = null } = {}
  ) {
    callbackSeleccionMateria = onSeleccionarMateria;

    const datosEvolucion = analizarEvolucionTemporal(sesiones, agrupacionTemporal);
    const datosMapaCalor = analizarMapaCalorCircadiano(sesiones);
    const datosCuadrante = analizarCuadranteIA(sesiones);
    const datosHora = analizarPorHora(sesiones);
    const datosMateria = analizarPorMateria(sesiones);
    const datosHabitos = analizarHabitos(sesiones);
    const datosInspector = analizarInspectorMateria(sesiones);

    actualizarGraficoEvolucion(datosEvolucion);
    actualizarGraficoCuadranteIA(datosCuadrante);
    actualizarGraficoPorHora(datosHora);
    actualizarGraficoPorMateria(datosMateria);
    actualizarGraficoPorActividad(datosHabitos);
    actualizarGraficoMatrizFriccion(datosHabitos);

    return {
      datosEvolucion,
      datosMapaCalor,
      datosCuadrante,
      datosHora,
      datosMateria,
      datosHabitos,
      datosInspector
    };
  }

  /**
   * Redimensiona los gráficos activos cuando se cambia de pestaña analítica.
   */
  function refrescarTamanoGraficos() {
    [
      chartEvolucionInstance,
      chartCuadranteInstance,
      chartHoraInstance,
      chartMateriaInstance,
      chartActividadInstance,
      chartFriccionInstance
    ].forEach((inst) => {
      if (inst && typeof inst.resize === "function") {
        inst.resize();
      }
    });
  }

  StudyTracker.Charts = {
    renderizarGraficos,
    refrescarTamanoGraficos
  };
})(window);
