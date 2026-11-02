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
    analizarSaludCognitivaIA,
    analizarFSRSConsolidacion,
    analizarDimensionProfunda,
    analizarInspectorMateria
  } = StudyTracker.RPG;

  let chartEvolucionInstance = null;
  let chartCuadranteInstance = null;
  let chartHoraInstance = null;
  let chartMateriaInstance = null;
  let chartActividadInstance = null;
  let chartFriccionInstance = null;
  let chartDeudaInstance = null;
  let chartModoModalidadInstance = null;
  let chartCurvaOlvidoInstance = null;
  let chartDSRBurbujasInstance = null;
  let chartPracticaIntercaladaInstance = null;
  let chartInspectorDimensionInstance = null;
  let callbackSeleccionMateria = null;
  let callbackSeleccionInspector = null;

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

  // Plugin ligero para dibujar las líneas divisorias del Cuadrante Cognitivo (X=35% IA, Y=2.5 Calificación FSRS entre 1-2 y 3-4)
  const pluginLineasCuadrante = {
    id: "lineasCuadrante",
    beforeDraw(chart) {
      const { ctx, chartArea, scales } = chart;
      if (!chartArea || !scales.x || !scales.y) return;

      const xMid = scales.x.getPixelForValue(35);
      const yMid = scales.y.getPixelForValue(2.5);

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

      // Línea horizontal divisoria de Calificación FSRS (2.5: separa 1-2 de 3-4)
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
            max: 4.5,
            title: { display: true, text: t("chartAxisAssimilation"), color: "#34d399" },
            ticks: { color: "#34d399", stepSize: 1 },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }

  /**
   * 2. Gráfico de Burbujas del Cuadrante de Rendimiento Cognitivo (% IA vs. Calificación FSRS 1-4).
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
                const sesion = raw.rawSessionData || raw || {};
                const ia =
                  sesion.Porcentaje_IA ?? sesion.usoIA ?? raw.iaReal ?? context.parsed.x;
                const grade =
                  sesion.Calidad ?? sesion.calidad ?? raw.calidadReal ?? Math.round(context.parsed.y);
                const fluidezBruta =
                  sesion.Objetivo_Cumplido ||
                  sesion.objetivoCumplido ||
                  sesion.calidad_asimilacion_fluidez ||
                  raw.objetivoCumplido ||
                  "Flujo limpio";
                const asimilacionText = trVal("objetivoCumplido", fluidezBruta);
                const dinamicaBruta =
                  sesion.Dinamica_Cognitiva ||
                  sesion.dinamicaCognitiva ||
                  raw.dinamicaCognitiva ||
                  raw.modoIA ||
                  context.dataset.label ||
                  "Andamiaje / Co-creación";
                const dinamica = trVal("dinamicaCognitiva", dinamicaBruta);
                return [
                  `📚 ${raw.materia || sesion.materia || ""} — ${raw.tema || sesion.tema || ""}`,
                  `IA: ${ia}% | Grade FSRS: ⭐ ${grade}`,
                  `Dinámica: ${dinamica}`,
                  `Fluidez real: ${asimilacionText}`
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
            max: 4.5,
            title: { display: true, text: t("chartAxisAssimilation"), color: "#10b981" },
            ticks: {
              color: "#10b981",
              stepSize: 1,
              callback: (v) => (v >= 1 && v <= 4 ? "⭐️ " + v : "")
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
            max: 4.5,
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
            max: 4.5,
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
            max: 4.5,
            title: { display: true, text: t("chartAxisAssimilation"), color: "#a855f7" },
            ticks: { color: "#a855f7", stepSize: 1 },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }

  /**
   * 6. Gráfico de Matriz de Fricción (Barras Apiladas de 4 niveles por Dominio Previo y Estructura de Práctica).
   */
  function actualizarGraficoMatrizFriccion(datosHabitos) {
    const canvas = document.getElementById("chartMatrizFriccion");
    if (!canvas) return;

    const filas = Array.isArray(datosHabitos.matrizFriccion) ? datosHabitos.matrizFriccion : [];
    const labels = filas.map((f) =>
      f.tipo === "complejidad"
        ? trVal("complejidad", f.clave)
        : f.tipo === "estructuraPractica"
        ? trVal("estructuraPractica", f.clave)
        : f.tipo === "modalidadProcesamiento"
        ? trVal("modalidadProcesamiento", f.clave)
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
   * 7. Gráfico de Anillo (Doughnut) para Índice de Deuda Cognitiva (Pestaña 2).
   */
  function actualizarGraficoDeudaCognitiva(datosSaludIA) {
    const canvas = document.getElementById("chartDeudaCognitiva");
    if (!canvas) return;

    const cd = datosSaludIA.conteoDeuda || { Nulo: 0, Bajo: 0, Moderado: 0, Critico: 0 };
    const labels = [
      t("debtLevelNulo"),
      t("debtLevelBajo"),
      t("debtLevelModerado"),
      t("debtLevelCritico")
    ];
    const dataVals = [cd.Nulo || 0, cd.Bajo || 0, cd.Moderado || 0, cd.Critico || 0];

    if (chartDeudaInstance) {
      chartDeudaInstance.data.labels = labels;
      chartDeudaInstance.data.datasets[0].data = dataVals;
      chartDeudaInstance.update();
      return;
    }

    const ctx = canvas.getContext("2d");
    chartDeudaInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: dataVals,
            backgroundColor: [
              "rgba(16, 185, 129, 0.85)",
              "rgba(59, 130, 246, 0.85)",
              "rgba(245, 158, 11, 0.85)",
              "rgba(239, 68, 68, 0.85)"
            ],
            borderColor: ["#064e3b", "#1e3a8a", "#78350f", "#7f1d1d"],
            borderWidth: 1.5,
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#cbd5e1", boxWidth: 12, padding: 10, font: { size: 11 } }
          },
          tooltip: {
            callbacks: {
              label(context) {
                const val = Number(context.raw) || 0;
                const tot = Math.max(1, datosSaludIA.totalSesiones || 1);
                const pct = Math.round((val / tot) * 100);
                return `${context.label}: ${val} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * 8. Gráfico de Barras Apiladas: Modo Diseño IA × Modalidad de Procesamiento Efectiva (Pestaña 2).
   */
  function actualizarGraficoModoDisenoModalidad(datosSaludIA) {
    const canvas = document.getElementById("chartModoDisenoModalidad");
    if (!canvas) return;

    const rawLabels = datosSaludIA.modosDisenoLabels || [];
    const labels = rawLabels.map((m) => trVal("modoDisenoIA", m));
    const dExtr = datosSaludIA.serieExtraccion || [];
    const dReco = datosSaludIA.serieReconocimiento || [];
    const dCopia = datosSaludIA.serieCopia || [];

    if (chartModoModalidadInstance) {
      chartModoModalidadInstance.data.labels = labels;
      chartModoModalidadInstance.data.datasets[0].label = trVal(
        "modalidadProcesamiento",
        "Extraccion_Esforzada"
      );
      chartModoModalidadInstance.data.datasets[0].data = dExtr;
      chartModoModalidadInstance.data.datasets[1].label = trVal(
        "modalidadProcesamiento",
        "Reconocimiento_Fluido"
      );
      chartModoModalidadInstance.data.datasets[1].data = dReco;
      chartModoModalidadInstance.data.datasets[2].label = trVal(
        "modalidadProcesamiento",
        "Copia_Pasiva"
      );
      chartModoModalidadInstance.data.datasets[2].data = dCopia;
      chartModoModalidadInstance.update();
      return;
    }

    const ctx = canvas.getContext("2d");
    chartModoModalidadInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: trVal("modalidadProcesamiento", "Extraccion_Esforzada"),
            data: dExtr,
            backgroundColor: "rgba(16, 185, 129, 0.82)",
            borderRadius: 4,
            stack: "modalidad"
          },
          {
            label: trVal("modalidadProcesamiento", "Reconocimiento_Fluido"),
            data: dReco,
            backgroundColor: "rgba(56, 189, 248, 0.82)",
            borderRadius: 4,
            stack: "modalidad"
          },
          {
            label: trVal("modalidadProcesamiento", "Copia_Pasiva"),
            data: dCopia,
            backgroundColor: "rgba(239, 68, 68, 0.82)",
            borderRadius: 4,
            stack: "modalidad"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#cbd5e1", boxWidth: 11, padding: 8, font: { size: 10.5 } }
          }
        },
        scales: {
          x: {
            stacked: true,
            ticks: { color: "#94a3b8", font: { size: 10 } },
            grid: { color: "rgba(51,65,85,0.35)" }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: { color: "#94a3b8", stepSize: 1 },
            grid: { color: "rgba(51,65,85,0.35)" }
          }
        }
      }
    });
  }

  /**
   * 9. Curva Teórica del Olvido FSRS y Proyección de Retención a 30 días (Pestaña 3).
   */
  function actualizarGraficoCurvaOlvido(datosFSRS) {
    const canvas = document.getElementById("chartCurvaOlvido");
    if (!canvas) return;

    const co = datosFSRS.curvasOlvido || {
      diasLabels: ["0d", "7d", "14d", "30d"],
      curvaUsuario: [100, 90, 82, 70],
      umbral90: [90, 90, 90, 90],
      curvaGrade4: [100, 96, 93, 88],
      curvaGrade3: [100, 91, 84, 73],
      curvaGrade2: [100, 80, 68, 51],
      curvaGrade1: [100, 58, 41, 25]
    };

    const labelUsuario = t("forgettingUserCurve", {
      s: datosFSRS.estabilidadPromedioGlobal || 6.5
    });
    const labelUmbral = t("forgettingThreshold90");

    if (chartCurvaOlvidoInstance) {
      chartCurvaOlvidoInstance.data.labels = co.diasLabels;
      chartCurvaOlvidoInstance.data.datasets[0].label = labelUsuario;
      chartCurvaOlvidoInstance.data.datasets[0].data = co.curvaUsuario;
      chartCurvaOlvidoInstance.data.datasets[1].label = labelUmbral;
      chartCurvaOlvidoInstance.data.datasets[1].data = co.umbral90;
      chartCurvaOlvidoInstance.data.datasets[2].data = co.curvaGrade4;
      chartCurvaOlvidoInstance.data.datasets[3].data = co.curvaGrade3;
      chartCurvaOlvidoInstance.data.datasets[4].data = co.curvaGrade2;
      chartCurvaOlvidoInstance.data.datasets[5].data = co.curvaGrade1;
      chartCurvaOlvidoInstance.update();
      return;
    }

    const ctx = canvas.getContext("2d");
    chartCurvaOlvidoInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: co.diasLabels,
        datasets: [
          {
            label: labelUsuario,
            data: co.curvaUsuario,
            borderColor: "#38bdf8",
            backgroundColor: "rgba(56, 189, 248, 0.14)",
            fill: true,
            borderWidth: 3,
            pointRadius: 3.5,
            tension: 0.32
          },
          {
            label: labelUmbral,
            data: co.umbral90,
            borderColor: "rgba(244, 63, 94, 0.85)",
            borderDash: [6, 4],
            borderWidth: 1.8,
            pointRadius: 0,
            fill: false
          },
          {
            label: "4 · Easy (S=24d)",
            data: co.curvaGrade4,
            borderColor: "rgba(16, 185, 129, 0.65)",
            borderDash: [3, 3],
            borderWidth: 1.5,
            pointRadius: 2,
            tension: 0.32
          },
          {
            label: "3 · Good (S=9d)",
            data: co.curvaGrade3,
            borderColor: "rgba(139, 92, 246, 0.65)",
            borderDash: [3, 3],
            borderWidth: 1.5,
            pointRadius: 2,
            tension: 0.32
          },
          {
            label: "2 · Hard (S=3.2d)",
            data: co.curvaGrade2,
            borderColor: "rgba(245, 158, 11, 0.65)",
            borderDash: [3, 3],
            borderWidth: 1.5,
            pointRadius: 2,
            tension: 0.32
          },
          {
            label: "1 · Again (S=1.1d)",
            data: co.curvaGrade1,
            borderColor: "rgba(239, 68, 68, 0.65)",
            borderDash: [3, 3],
            borderWidth: 1.5,
            pointRadius: 2,
            tension: 0.32
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "#cbd5e1", boxWidth: 12, font: { size: 11 } }
          },
          tooltip: {
            callbacks: {
              label(context) {
                return `${context.dataset.label}: ${context.raw}%`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: t("forgettingAxisDays"), color: "#94a3b8" },
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(51,65,85,0.35)" }
          },
          y: {
            min: 0,
            max: 100,
            title: { display: true, text: t("forgettingAxisRetention"), color: "#94a3b8" },
            ticks: {
              color: "#94a3b8",
              callback(v) {
                return `${v}%`;
              }
            },
            grid: { color: "rgba(51,65,85,0.35)" }
          }
        }
      }
    });
  }

  /**
   * 10. Mapa de Consolidación DSR por Materia (Burbujas: Estabilidad S vs Dificultad D) (Pestaña 3).
   */
  function actualizarGraficoDSRBurbujas(datosFSRS) {
    const canvas = document.getElementById("chartDSRBurbujas");
    if (!canvas) return;

    const burbujas = Array.isArray(datosFSRS.burbujasDSR) ? datosFSRS.burbujasDSR : [];
    const coloresCtx = {
      Académico: { bg: "rgba(99, 102, 241, 0.72)", border: "#818cf8" },
      Certificación: { bg: "rgba(16, 185, 129, 0.72)", border: "#34d399" },
      "Proyecto Propio": { bg: "rgba(245, 158, 11, 0.72)", border: "#fbbf24" },
      Externo: { bg: "rgba(236, 72, 153, 0.72)", border: "#f472b6" }
    };

    const bgColors = burbujas.map(
      (b) => (coloresCtx[b.contexto] || coloresCtx.Académico).bg
    );
    const borderColors = burbujas.map(
      (b) => (coloresCtx[b.contexto] || coloresCtx.Académico).border
    );

    if (chartDSRBurbujasInstance) {
      chartDSRBurbujasInstance.data.datasets[0].data = burbujas;
      chartDSRBurbujasInstance.data.datasets[0].backgroundColor = bgColors;
      chartDSRBurbujasInstance.data.datasets[0].borderColor = borderColors;
      chartDSRBurbujasInstance.update();
      return;
    }

    const ctx = canvas.getContext("2d");
    chartDSRBurbujasInstance = new Chart(ctx, {
      type: "bubble",
      data: {
        datasets: [
          {
            label: "DSR Materias",
            data: burbujas,
            backgroundColor: bgColors,
            borderColor: borderColors,
            borderWidth: 1.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(context) {
                const raw = context.raw || {};
                return `${raw.materia || ""}: S=${raw.estabilidadS}d · D=${raw.dificultadD}/10 · R=${raw.retencionR}% (${raw.minutos} min)`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: { display: true, text: t("dsrAxisStability"), color: "#94a3b8" },
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(51,65,85,0.35)" }
          },
          y: {
            min: 1,
            max: 10,
            title: { display: true, text: t("dsrAxisDifficulty"), color: "#94a3b8" },
            ticks: { color: "#94a3b8", stepSize: 2 },
            grid: { color: "rgba(51,65,85,0.35)" }
          }
        }
      }
    });
  }

  /**
   * 11. Efectividad de Práctica Intercalada vs. Bloqueada (Pestaña 3).
   */
  function actualizarGraficoPracticaIntercalada(datosFSRS) {
    const canvas = document.getElementById("chartPracticaIntercalada");
    if (!canvas) return;

    const pi = datosFSRS.practicaIntercalada || {
      claves: ["Bloqueado", "Sin_Friccion", "Friccion_Productiva", "Confusion_Excesiva"],
      calidadPromedio: [0, 0, 0, 0],
      xpPorHora: [0, 0, 0, 0],
      sesiones: [0, 0, 0, 0]
    };

    const labels = [
      t("interleavedCatBlocked"),
      t("interleavedCatNoFric"),
      t("interleavedCatProdFric"),
      t("interleavedCatConf")
    ];

    if (chartPracticaIntercaladaInstance) {
      chartPracticaIntercaladaInstance.data.labels = labels;
      chartPracticaIntercaladaInstance.data.datasets[0].data = pi.calidadPromedio;
      chartPracticaIntercaladaInstance.data.datasets[1].data = pi.xpPorHora;
      chartPracticaIntercaladaInstance.update();
      return;
    }

    const ctx = canvas.getContext("2d");
    chartPracticaIntercaladaInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            type: "line",
            label: t("interleavedDsQuality"),
            data: pi.calidadPromedio,
            borderColor: "#34d399",
            backgroundColor: "rgba(52, 211, 153, 0.2)",
            yAxisID: "yCalInter",
            tension: 0.3,
            pointRadius: 4
          },
          {
            type: "bar",
            label: t("interleavedDsXpHour"),
            data: pi.xpPorHora,
            backgroundColor: [
              "rgba(99, 102, 241, 0.72)",
              "rgba(56, 189, 248, 0.72)",
              "rgba(16, 185, 129, 0.78)",
              "rgba(239, 68, 68, 0.75)"
            ],
            borderRadius: 5,
            yAxisID: "yXpInter"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#cbd5e1", boxWidth: 11, font: { size: 10.5 } }
          }
        },
        scales: {
          x: {
            ticks: { color: "#94a3b8", font: { size: 10 } },
            grid: { color: "rgba(51,65,85,0.35)" }
          },
          yXpInter: {
            type: "linear",
            position: "left",
            beginAtZero: true,
            title: { display: true, text: "XP / h", color: "#94a3b8" },
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(51,65,85,0.35)" }
          },
          yCalInter: {
            type: "linear",
            position: "right",
            min: 0,
            max: 4.5,
            ticks: { color: "#34d399", stepSize: 1 },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }

  /**
   * 12. Gráfico Comparativo de la Dimensión Activa en el Inspector Profundo (Pestaña 4).
   * Permite hacer clic en cualquier barra para aislar ese valor (Drill-down / Cross-filter).
   */
  function actualizarGraficoInspectorDimension(datosDimension) {
    const canvas = document.getElementById("chartInspectorDimension");
    if (!canvas) return;

    const cats = Array.isArray(datosDimension.categorias) ? datosDimension.categorias : [];
    const rawValues = cats.map((c) => c.valor);
    const labels = cats.map((c) => c.valor);
    const dataMin = cats.map((c) => c.minutos);
    const dataCal = cats.map((c) => c.calidadFSRS);
    const valorActivo = datosDimension.valorActivo || "Todos";

    const coloresPorDeuda = {
      Nulo: "rgba(16, 185, 129, 0.78)",
      Bajo: "rgba(59, 130, 246, 0.78)",
      Moderado: "rgba(245, 158, 11, 0.80)",
      Critico: "rgba(239, 68, 68, 0.80)"
    };

    const bgColors = cats.map((c) => {
      const base = coloresPorDeuda[c.deudaPredominante] || "rgba(99, 102, 241, 0.75)";
      if (valorActivo !== "Todos" && c.valor !== valorActivo) {
        return "rgba(71, 85, 105, 0.35)";
      }
      return base;
    });

    canvas._rawInspectorValues = rawValues;

    if (chartInspectorDimensionInstance) {
      chartInspectorDimensionInstance.data.labels = labels.length ? labels : [t("chartNoData")];
      chartInspectorDimensionInstance.data.datasets[0].label = t("chartDsQualityFSRS");
      chartInspectorDimensionInstance.data.datasets[0].data = dataCal.length ? dataCal : [0];
      chartInspectorDimensionInstance.data.datasets[1].label = t("chartDsMinutesStudied");
      chartInspectorDimensionInstance.data.datasets[1].data = dataMin.length ? dataMin : [0];
      chartInspectorDimensionInstance.data.datasets[1].backgroundColor = bgColors.length
        ? bgColors
        : ["rgba(99, 102, 241, 0.75)"];
      chartInspectorDimensionInstance.update();
      return;
    }

    const ctx = canvas.getContext("2d");
    chartInspectorDimensionInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels.length ? labels : [t("chartNoData")],
        datasets: [
          {
            type: "line",
            label: t("chartDsQualityFSRS"),
            data: dataCal.length ? dataCal : [0],
            borderColor: "#38bdf8",
            backgroundColor: "rgba(56, 189, 248, 0.2)",
            yAxisID: "yCalInsp",
            tension: 0.3,
            pointRadius: 4
          },
          {
            type: "bar",
            label: t("chartDsMinutesStudied"),
            data: dataMin.length ? dataMin : [0],
            backgroundColor: bgColors.length ? bgColors : ["rgba(99, 102, 241, 0.75)"],
            borderRadius: 6,
            yAxisID: "yMinInsp"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick(event, elements) {
          if (!elements || elements.length === 0) return;
          const idx = elements[0].index;
          const rawVals = canvas._rawInspectorValues || [];
          const valClickeado = rawVals[idx];
          if (valClickeado && typeof callbackSeleccionInspector === "function") {
            callbackSeleccionInspector(valClickeado);
          }
        },
        plugins: {
          legend: { labels: { color: "#cbd5e1" } },
          tooltip: {
            callbacks: {
              afterBody(items) {
                const idx = items[0]?.dataIndex;
                const cat = cats[idx];
                if (!cat) return "";
                return `Sesiones: ${cat.sesiones} · IA: ${cat.iaProm}% · Deuda: ${cat.deudaPredominante} · +${cat.xpTotal} XP`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(51,65,85,0.35)" }
          },
          yMinInsp: {
            type: "linear",
            position: "left",
            beginAtZero: true,
            title: { display: true, text: t("chartAxisMinutes"), color: "#94a3b8" },
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(51,65,85,0.35)" }
          },
          yCalInsp: {
            type: "linear",
            position: "right",
            min: 0,
            max: 4.5,
            title: { display: true, text: "FSRS (1-4)", color: "#38bdf8" },
            ticks: { color: "#38bdf8", stepSize: 1 },
            grid: { drawOnChartArea: false }
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
    {
      agrupacionTemporal = "dia",
      inspectorDimension = "Materia",
      inspectorValor = "Todos",
      onSeleccionarMateria = null,
      onSeleccionarValorInspector = null
    } = {}
  ) {
    callbackSeleccionMateria = onSeleccionarMateria;
    callbackSeleccionInspector = onSeleccionarValorInspector;

    const datosEvolucion = analizarEvolucionTemporal(sesiones, agrupacionTemporal);
    const datosMapaCalor = analizarMapaCalorCircadiano(sesiones);
    const datosCuadrante = analizarCuadranteIA(sesiones);
    const datosSaludIA = analizarSaludCognitivaIA(sesiones);
    const datosFSRS = analizarFSRSConsolidacion(sesiones);
    const datosDimension = analizarDimensionProfunda(sesiones, inspectorDimension, inspectorValor);
    const datosHora = analizarPorHora(sesiones);
    const datosMateria = analizarPorMateria(sesiones);
    const datosHabitos = analizarHabitos(sesiones);
    const datosInspector = analizarInspectorMateria(sesiones);

    actualizarGraficoEvolucion(datosEvolucion);
    actualizarGraficoDeudaCognitiva(datosSaludIA);
    actualizarGraficoModoDisenoModalidad(datosSaludIA);
    actualizarGraficoCuadranteIA(datosCuadrante);
    actualizarGraficoPorHora(datosHora);
    actualizarGraficoPorMateria(datosMateria);
    actualizarGraficoCurvaOlvido(datosFSRS);
    actualizarGraficoDSRBurbujas(datosFSRS);
    actualizarGraficoPracticaIntercalada(datosFSRS);
    actualizarGraficoPorActividad(datosHabitos);
    actualizarGraficoMatrizFriccion(datosHabitos);
    actualizarGraficoInspectorDimension(datosDimension);

    return {
      datosEvolucion,
      datosMapaCalor,
      datosCuadrante,
      datosSaludIA,
      datosFSRS,
      datosDimension,
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
      chartDeudaInstance,
      chartModoModalidadInstance,
      chartCuadranteInstance,
      chartHoraInstance,
      chartMateriaInstance,
      chartCurvaOlvidoInstance,
      chartDSRBurbujasInstance,
      chartPracticaIntercaladaInstance,
      chartActividadInstance,
      chartFriccionInstance,
      chartInspectorDimensionInstance
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
