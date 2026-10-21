/**
 * Capa de UI (Dashboard): Renderizado seguro del DOM (prevención de XSS con textContent),
 * filtro rápido por Contexto, autocompletado dinámico de Materia/Tema, modo de edición en línea,
 * selectores rápidos de chips (1 clic), actualización de KPIs, barra RPG exponencial y tabla.
 */
(function (global) {
  const StudyTracker = (global.StudyTracker = global.StudyTracker || {});
  const {
    CONTEXTOS,
    calcularMinutos,
    calcularXP,
    calcularProgresoRPG,
    calcularKPIs,
    filtrarSesionesAvanzado,
    obtenerTextoAyudaActividad,
    obtenerTextoAyudaObjetivo,
    obtenerTextoAyudaCalidad,
    obtenerTextoAyudaIA
  } = StudyTracker.RPG;

  // Estado local de los chips seleccionados en el formulario (1 clic)
  const estadoChips = {
    contexto: "Académico",
    tipoActividad: "Desarrollo / Código",
    energiaPrevia: "Media",
    complejidad: "Desafiante",
    objetivoCumplido: "Sí",
    modoIA: "Diálogo / Tutoría"
  };

  // ID de la sesión que se está editando actualmente (null si es registro nuevo)
  let sesionEditandoId = null;

  // Filtros globales combinables del Dashboard
  let filtroContextoActual = "Todos";
  let filtroPeriodoActual = "todo";
  let filtroMateriaActual = "Todas";

  // Estado de navegación analítica interactiva
  let pestanaAnaliticaActual = "tiempo";
  let agrupacionTemporalActual = "dia";
  let metricaHeatmapActual = "minutos";

  // Control de vista compacta de la tabla (por defecto muestra solo los últimos 5 registros)
  const LIMITE_HISTORIAL_RECIENTE = 5;
  let mostrarTodoHistorial = false;

  const ICONOS_CONTEXTO = {
    Académico: "🎓",
    Certificación: "🏅",
    "Proyecto Propio": "🚀",
    Externo: "🤝"
  };

  const ICONOS_ACTIVIDAD = {
    "Preparación / Contexto": "🗂️",
    "Clase / Cátedra": "👨‍🏫",
    "Teoría / Docs": "📖",
    "Investigación / Diálogo": "💬",
    "Diseño / Apuntes": "✍️",
    "Desarrollo / Código": "💻",
    "Práctica / Debugging": "🧪",
    "Repaso / Simulacro": "🔁"
  };

  const ICONOS_MODO_IA = {
    Autónomo: "🧠",
    "Diálogo / Tutoría": "💬",
    "Copiloto / Apoyo": "🛠️",
    "Mecánico / Copy-Paste": "🤖"
  };

  const ICONOS_ENERGIA = {
    Alta: "🔋",
    Media: "⚡",
    Baja: "🪫"
  };

  const ICONOS_COMPLEJIDAD = {
    Fácil: "🟢",
    Desafiante: "🟡",
    "Muy difícil": "🔴"
  };

  const ICONOS_OBJETIVO = {
    Sí: "✅",
    Parcial: "⚠️",
    No: "❌"
  };

  const MATERIAS_BASE = [
    "Base de Datos",
    "Snowflake",
    "Proyecto Rails",
    "PySpark",
    "Algoritmos",
    "StudyTracker"
  ];

  /**
   * Devuelve una copia de los valores seleccionados actualmente en los grupos de chips.
   */
  function obtenerValoresChips() {
    return { ...estadoChips };
  }

  /**
   * Devuelve el ID de la sesión que se está editando, o null si estamos creando una nueva.
   */
  function obtenerIdSesionEditando() {
    return sesionEditandoId;
  }

  /**
   * Cambia el filtro de contexto activo del Dashboard.
   */
  function cambiarFiltroContexto(nuevoContexto) {
    filtroContextoActual = nuevoContexto || "Todos";
    document.querySelectorAll("#contextFilterPills .filter-pill").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filtroContextoActual);
    });
    actualizarVisibilidadResetFiltros();
  }

  /**
   * Cambia el filtro de periodo temporal ("todo", "7d", "30d", "hoy").
   */
  function cambiarFiltroPeriodo(nuevoPeriodo) {
    filtroPeriodoActual = nuevoPeriodo || "todo";
    document.querySelectorAll("#periodFilterPills .period-pill").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.period === filtroPeriodoActual);
    });
    actualizarVisibilidadResetFiltros();
  }

  /**
   * Cambia el filtro de materia activa ("Todas" o el nombre de una materia).
   */
  function cambiarFiltroMateria(nuevaMateria) {
    filtroMateriaActual = nuevaMateria || "Todas";
    const select = document.getElementById("subjectFilterSelect");
    if (select && select.value !== filtroMateriaActual) {
      select.value = filtroMateriaActual;
    }
    actualizarVisibilidadResetFiltros();
  }

  /**
   * Restablece todos los filtros globales a sus valores por defecto.
   */
  function resetearFiltros() {
    cambiarFiltroContexto("Todos");
    cambiarFiltroPeriodo("todo");
    cambiarFiltroMateria("Todas");
  }

  function actualizarVisibilidadResetFiltros() {
    const btnReset = document.getElementById("btnResetFilters");
    if (!btnReset) return;
    const hayFiltroActivo =
      filtroContextoActual !== "Todos" ||
      filtroPeriodoActual !== "todo" ||
      filtroMateriaActual !== "Todas";
    btnReset.style.display = hayFiltroActivo ? "inline-flex" : "none";
  }

  /**
   * Cambia la pestaña activa del centro analítico ("tiempo", "ia", "habitos", "inspector").
   */
  function cambiarPestanaAnalitica(nuevaPestana) {
    pestanaAnaliticaActual = nuevaPestana || "tiempo";
    document.querySelectorAll("#analyticsTabsBar .analytics-tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === pestanaAnaliticaActual);
    });
    document.querySelectorAll(".analytics-tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `tabPanel-${pestanaAnaliticaActual}`);
    });
    if (StudyTracker.Charts && typeof StudyTracker.Charts.refrescarTamanoGraficos === "function") {
      setTimeout(() => StudyTracker.Charts.refrescarTamanoGraficos(), 30);
    }
  }

  /**
   * Cambia la agrupación del gráfico de evolución ("dia", "semana", "mes").
   */
  function cambiarAgrupacionTemporal(nuevaAgrupacion) {
    agrupacionTemporalActual = nuevaAgrupacion || "dia";
    document.querySelectorAll("#evoGroupingBtns .seg-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.group === agrupacionTemporalActual);
    });
  }

  /**
   * Cambia la métrica visualizada en el Mapa de Calor Circadiano ("minutos", "calidad", "energia").
   */
  function cambiarMetricaHeatmap(nuevaMetrica) {
    metricaHeatmapActual = nuevaMetrica || "minutos";
    document.querySelectorAll("#heatmapMetricBtns .seg-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.metric === metricaHeatmapActual);
    });
  }

  /**
   * Actualiza visualmente los botones de un grupo de chips sin disparar efectos colaterales.
   */
  function pintarGrupoChip(grupo, valor) {
    const contenedor = document.querySelector(`.chip-group[data-group="${grupo}"]`);
    if (contenedor) {
      contenedor.querySelectorAll(".chip-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.value === valor);
      });
    }
  }

  /**
   * Alterna entre mostrar solo los últimos 5 registros o el historial completo.
   */
  function alternarVistaHistorial() {
    mostrarTodoHistorial = !mostrarTodoHistorial;
    return mostrarTodoHistorial;
  }

  /**
   * Selecciona un chip dentro de su grupo y actualiza la vista previa de XP y ayudas.
   */
  function seleccionarChip(grupo, valor) {
    if (!(grupo in estadoChips)) return;
    estadoChips[grupo] = valor;
    pintarGrupoChip(grupo, valor);

    if (grupo === "tipoActividad") {
      if (valor === "Clase / Cátedra") {
        estadoChips.modoIA = "Autónomo";
        pintarGrupoChip("modoIA", "Autónomo");
        const inputIA = document.getElementById("usoIA");
        if (inputIA) inputIA.value = "0";
        actualizarAyudaIA({ desdeChip: true });
      }
      actualizarAyudaActividad();
      actualizarAyudaCalidad();
    }

    if (grupo === "objetivoCumplido") {
      actualizarAyudaObjetivo();
    }

    if (grupo === "modoIA") {
      const inputIA = document.getElementById("usoIA");
      if (inputIA) {
        if (valor === "Autónomo") {
          inputIA.value = "0";
        } else if (Number(inputIA.value) === 0) {
          inputIA.value = valor === "Mecánico / Copy-Paste" ? "75" : "25";
        }
      }
      actualizarAyudaIA({ desdeChip: true });
      actualizarAyudaCalidad();
    }

    actualizarPreview();
  }

  /**
   * Alimenta dinámicamente los <datalist> de Materia y Tema con el historial propio del usuario.
   */
  function actualizarAutocompletado(sesiones) {
    const dlMaterias = document.getElementById("listaMaterias");
    const dlTemas = document.getElementById("listaTemas");

    if (dlMaterias) {
      const materiasUnicas = new Set(MATERIAS_BASE);
      (Array.isArray(sesiones) ? sesiones : []).forEach((s) => {
        if (s.materia) materiasUnicas.add(s.materia.trim());
      });
      dlMaterias.replaceChildren();
      materiasUnicas.forEach((mat) => {
        const opt = document.createElement("option");
        opt.value = mat;
        dlMaterias.appendChild(opt);
      });
    }

    if (dlTemas) {
      const temasUnicos = new Set();
      (Array.isArray(sesiones) ? sesiones : []).forEach((s) => {
        if (s.tema && s.tema !== "General") temasUnicos.add(s.tema.trim());
      });
      dlTemas.replaceChildren();
      temasUnicos.forEach((tem) => {
        const opt = document.createElement("option");
        opt.value = tem;
        dlTemas.appendChild(opt);
      });
    }
  }

  function t(key, params) {
    if (StudyTracker.I18n && typeof StudyTracker.I18n.t === "function") {
      return StudyTracker.I18n.t(key, params);
    }
    return key;
  }

  function trVal(categoria, valor) {
    if (StudyTracker.I18n && typeof StudyTracker.I18n.traducirValor === "function") {
      return StudyTracker.I18n.traducirValor(categoria, valor);
    }
    return valor;
  }

  /**
   * Carga los datos de una sesión existente en el formulario para editarla.
   */
  function cargarSesionEnFormulario(sesion) {
    if (!sesion) return;
    sesionEditandoId = sesion.id;

    document.getElementById("fecha").value = sesion.fecha;
    document.getElementById("horaInicio").value = sesion.horaInicio;
    document.getElementById("horaFin").value = sesion.horaFin;
    document.getElementById("materia").value = sesion.materia;
    document.getElementById("tema").value = sesion.tema || "";
    document.getElementById("calidad").value = String(sesion.calidad);
    document.getElementById("usoIA").value = String(sesion.usoIA);
    document.getElementById("notas").value = sesion.notas || "";

    seleccionarChip("contexto", sesion.contexto || "Académico");
    seleccionarChip("tipoActividad", sesion.tipoActividad || "Desarrollo / Código");
    seleccionarChip("energiaPrevia", sesion.energiaPrevia || "Media");
    seleccionarChip("complejidad", sesion.complejidad || "Desafiante");
    seleccionarChip("objetivoCumplido", sesion.objetivoCumplido || "Sí");
    seleccionarChip(
      "modoIA",
      sesion.modoIA || (Number(sesion.usoIA) === 0 ? "Autónomo" : "Copiloto / Apoyo")
    );
    document.getElementById("usoIA").value = String(sesion.usoIA);

    actualizarAyudaActividad();
    actualizarAyudaObjetivo();
    actualizarAyudaIA({ desdeChip: true });
    actualizarAyudaCalidad();
    actualizarPreview();

    const formPanel = document.getElementById("formPanel");
    const formTitle = document.getElementById("formTitle");
    const btnSubmit = document.getElementById("btnSubmitForm");
    const btnCancel = document.getElementById("btnCancelEdit");

    if (formPanel) formPanel.classList.add("panel-editing");
    if (formTitle) formTitle.textContent = t("formTitleEdit");
    if (btnSubmit) btnSubmit.textContent = t("btnSubmitEdit");
    if (btnCancel) btnCancel.style.display = "inline-flex";

    // Resaltar fila activa en la tabla
    document.querySelectorAll("#tablaBody tr").forEach((tr) => {
      tr.classList.toggle("row-editing", tr.dataset.id === sesion.id);
    });

    if (formPanel) {
      formPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  /**
   * Sale del modo edición y restaura el formulario al modo de creación.
   */
  function salirModoEdicion() {
    sesionEditandoId = null;

    const formPanel = document.getElementById("formPanel");
    const formTitle = document.getElementById("formTitle");
    const btnSubmit = document.getElementById("btnSubmitForm");
    const btnCancel = document.getElementById("btnCancelEdit");

    if (formPanel) formPanel.classList.remove("panel-editing");
    if (formTitle) formTitle.textContent = t("formTitleNew");
    if (btnSubmit) btnSubmit.textContent = t("btnSubmitNew");
    if (btnCancel) btnCancel.style.display = "none";

    document.querySelectorAll("#tablaBody tr.row-editing").forEach((tr) => {
      tr.classList.remove("row-editing");
    });

    const inputTema = document.getElementById("tema");
    const inputNotas = document.getElementById("notas");
    if (inputTema) inputTema.value = "";
    if (inputNotas) inputNotas.value = "";
  }

  /**
   * Refresca los textos dinámicos del formulario (título modo edición/creación, ayudas y preview) al cambiar de idioma.
   */
  function refrescarTextosFormulario() {
    const formTitle = document.getElementById("formTitle");
    const btnSubmit = document.getElementById("btnSubmitForm");
    if (sesionEditandoId) {
      if (formTitle) formTitle.textContent = t("formTitleEdit");
      if (btnSubmit) btnSubmit.textContent = t("btnSubmitEdit");
    } else {
      if (formTitle) formTitle.textContent = t("formTitleNew");
      if (btnSubmit) btnSubmit.textContent = t("btnSubmitNew");
    }
    actualizarAyudaActividad();
    actualizarAyudaObjetivo();
    actualizarAyudaIA({ desdeChip: true });
    actualizarAyudaCalidad();
    actualizarPreview();
  }

  /**
   * Inicializa los valores por defecto del formulario (fecha actual, bloque de 25 min y chips).
   */
  function inicializarFormulario() {
    const ahora = new Date();
    const inputFecha = document.getElementById("fecha");
    const inputInicio = document.getElementById("horaInicio");
    const inputFin = document.getElementById("horaFin");

    if (inputFecha) {
      const y = ahora.getFullYear();
      const m = String(ahora.getMonth() + 1).padStart(2, "0");
      const d = String(ahora.getDate()).padStart(2, "0");
      inputFecha.value = `${y}-${m}-${d}`;
    }
    const hace25 = new Date(ahora.getTime() - 25 * 60000);
    if (inputInicio) {
      inputInicio.value = hace25.toTimeString().slice(0, 5);
    }
    if (inputFin) {
      inputFin.value = ahora.toTimeString().slice(0, 5);
    }

    // Sincronizar estado visual de los chips
    Object.keys(estadoChips).forEach((grupo) => {
      pintarGrupoChip(grupo, estadoChips[grupo]);
    });

    actualizarAyudaActividad();
    actualizarAyudaObjetivo();
    actualizarAyudaIA({ desdeChip: true });
    actualizarAyudaCalidad();
    actualizarPreview();
  }

  /**
   * Pone la hora actual del sistema en el campo indicado ('horaInicio' o 'horaFin').
   */
  function ponerHoraActual(idInput) {
    const el = document.getElementById(idInput);
    if (!el) return;
    el.value = new Date().toTimeString().slice(0, 5);
    actualizarPreview();
  }

  /**
   * Actualiza la caja de ayuda según el Tipo de Actividad seleccionado.
   */
  function actualizarAyudaActividad() {
    const boxAyuda = document.getElementById("ayudaActividad");
    if (!boxAyuda) return;
    if (StudyTracker.I18n) {
      const mapaKey = {
        "Preparación / Contexto": "helpActPrep",
        "Clase / Cátedra": "helpActClass",
        "Teoría / Docs": "helpActTheory",
        "Investigación / Diálogo": "helpActResearch",
        "Diseño / Apuntes": "helpActDesign",
        "Desarrollo / Código": "helpActDev",
        "Práctica / Debugging": "helpActPractice",
        "Repaso / Simulacro": "helpActReview"
      };
      boxAyuda.textContent = t(mapaKey[estadoChips.tipoActividad] || "helpActDev");
    } else if (typeof obtenerTextoAyudaActividad === "function") {
      boxAyuda.textContent = obtenerTextoAyudaActividad(estadoChips.tipoActividad);
    }
  }

  /**
   * Actualiza la caja de ayuda según el estado de Objetivo Cumplido seleccionado.
   */
  function actualizarAyudaObjetivo() {
    const boxAyuda = document.getElementById("ayudaObjetivo");
    if (!boxAyuda) return;
    if (StudyTracker.I18n) {
      const mapaKey = {
        Sí: "helpGoalYes",
        Parcial: "helpGoalPartial",
        No: "helpGoalNo"
      };
      boxAyuda.textContent = t(mapaKey[estadoChips.objetivoCumplido] || "helpGoalYes");
    } else {
      boxAyuda.textContent = obtenerTextoAyudaObjetivo(estadoChips.objetivoCumplido);
    }
  }

  /**
   * Actualiza la caja de ayuda según la calidad de asimilación seleccionada, la actividad y el modo de IA.
   */
  function actualizarAyudaCalidad() {
    const selectCalidad = document.getElementById("calidad");
    const boxAyuda = document.getElementById("ayudaCalidad");
    const inputIA = document.getElementById("usoIA");
    const labelCalidad = document.querySelector('label[for="calidad"]');
    if (!selectCalidad || !boxAyuda) return;
    const valIA = inputIA ? Number(inputIA.value) : 0;
    const esModoClase = estadoChips.tipoActividad === "Clase / Cátedra";

    if (labelCalidad && StudyTracker.I18n) {
      labelCalidad.textContent = t(esModoClase ? "labelQualityClass" : "labelQuality");
    }

    if (StudyTracker.I18n) {
      const nivel = Math.min(5, Math.max(1, Number(selectCalidad.value) || 3));
      let base = t(`helpQuality${nivel}`);
      if (esModoClase) {
        if (estadoChips.modoIA === "Mecánico / Copy-Paste") {
          base += t("helpQualityClassAiMech");
        } else if (valIA > 0 || estadoChips.modoIA !== "Autónomo") {
          base += t("helpQualityClassAiDialogue");
        } else {
          base += t("helpQualityClassNote");
        }
      } else if (estadoChips.modoIA === "Mecánico / Copy-Paste" && nivel >= 4) {
        base += t("helpQualityWarnMech");
      } else if (
        valIA >= 70 &&
        estadoChips.modoIA !== "Diálogo / Tutoría" &&
        nivel >= 4
      ) {
        base += t("helpQualityWarnHighAi", { ai: valIA });
      }
      boxAyuda.textContent = base;
    } else {
      boxAyuda.textContent = obtenerTextoAyudaCalidad(
        selectCalidad.value,
        estadoChips.modoIA,
        valIA
      );
    }
  }

  /**
   * Actualiza la etiqueta y descripción de ayuda del deslizador de uso de IA,
   * manteniendo coherencia con el chip de Modo de IA.
   */
  function actualizarAyudaIA({ desdeChip = false } = {}) {
    const inputIA = document.getElementById("usoIA");
    const labelIA = document.getElementById("iaLabel");
    const boxAyuda = document.getElementById("ayudaIA");
    if (!inputIA) return;

    const val = Number(inputIA.value);
    if (!desdeChip) {
      if (val === 0 && estadoChips.modoIA !== "Autónomo") {
        estadoChips.modoIA = "Autónomo";
        pintarGrupoChip("modoIA", "Autónomo");
      } else if (val > 0 && estadoChips.modoIA === "Autónomo") {
        estadoChips.modoIA = "Diálogo / Tutoría";
        pintarGrupoChip("modoIA", "Diálogo / Tutoría");
      }
      actualizarAyudaCalidad();
      actualizarPreview();
    }

    if (labelIA) labelIA.textContent = `${val}%`;
    if (boxAyuda) {
      if (StudyTracker.I18n) {
        const mapaModo = {
          Autónomo: "helpAiAuton",
          "Diálogo / Tutoría": "helpAiDialogue",
          "Copiloto / Apoyo": "helpAiCopilot",
          "Mecánico / Copy-Paste": "helpAiMech"
        };
        boxAyuda.textContent = t(mapaModo[estadoChips.modoIA] || "helpAiCopilot");
      } else {
        boxAyuda.textContent = obtenerTextoAyudaIA(val, estadoChips.modoIA);
      }
    }
  }

  /**
   * Calcula y muestra la vista previa de minutos y XP (incluyendo bonos por complejidad, objetivo y modo de IA).
   */
  function actualizarPreview() {
    const horaInicio = document.getElementById("horaInicio")?.value;
    const horaFin = document.getElementById("horaFin")?.value;
    const calidad = Number(document.getElementById("calidad")?.value || 3);

    const min = calcularMinutos(horaInicio, horaFin);
    const xp = calcularXP(
      min,
      calidad,
      estadoChips.complejidad,
      estadoChips.objetivoCumplido,
      estadoChips.modoIA
    );

    const bonosActivos = [];
    if (estadoChips.complejidad === "Desafiante") bonosActivos.push(t("bonusChallenge"));
    if (estadoChips.complejidad === "Muy difícil") bonosActivos.push(t("bonusHard"));
    if (estadoChips.objetivoCumplido === "Sí") bonosActivos.push(t("bonusGoalYes"));
    if (estadoChips.objetivoCumplido === "Parcial") bonosActivos.push(t("bonusGoalPartial"));
    if (estadoChips.modoIA === "Autónomo") bonosActivos.push(t("bonusAiAuton"));
    if (estadoChips.modoIA === "Diálogo / Tutoría") bonosActivos.push(t("bonusAiDialogue"));
    if (estadoChips.modoIA === "Mecánico / Copy-Paste") bonosActivos.push(t("bonusAiMech"));

    const elDuracion = document.getElementById("previewDuracion");
    const elXP = document.getElementById("previewXP");
    if (elDuracion) {
      elDuracion.textContent = bonosActivos.length
        ? t("previewDurationBonuses", { min, bonuses: bonosActivos.join(", ") })
        : t("previewDurationBase", { min });
    }
    if (elXP) elXP.textContent = `+${xp} XP`;
  }

  /**
   * Actualiza el indicador visual del estado de sincronización con Excel.
   * @param {string} texto
   * @param {"connected" | "warning" | "default"} tipoEstado
   */
  function actualizarEstadoArchivo(texto, tipoEstado = "default") {
    const status = document.getElementById("fileStatus");
    if (!status) return;
    status.textContent = texto;
    status.classList.remove("connected", "warning");
    if (tipoEstado === "connected" || tipoEstado === true) {
      status.classList.add("connected");
    } else if (tipoEstado === "warning") {
      status.classList.add("warning");
    }
  }

  /**
   * Actualiza los contadores de sesiones en la barra de filtro rápido por Contexto y el selector de Materia.
   */
  function actualizarContadoresFiltro(todasLasSesiones) {
    const lista = Array.isArray(todasLasSesiones) ? todasLasSesiones : [];
    const btnTodos = document.querySelector('#contextFilterBar .filter-pill[data-filter="Todos"]');
    if (btnTodos) {
      btnTodos.textContent = `${t("filterAll")} (${lista.length})`;
    }

    CONTEXTOS.forEach((ctx) => {
      const btn = document.querySelector(
        `#contextFilterBar .filter-pill[data-filter="${ctx.valor}"]`
      );
      if (btn) {
        const conteo = lista.filter((s) => (s.contexto || "Académico") === ctx.valor).length;
        const etiquetaTraducida = trVal("contexto", ctx.valor);
        btn.textContent = `${ctx.icono} ${etiquetaTraducida} (${conteo})`;
      }
    });

    // Actualizar selector desplegable de Materias
    const selectMateria = document.getElementById("subjectFilterSelect");
    if (selectMateria) {
      const conteoPorMateria = {};
      lista.forEach((s) => {
        const mat = (s.materia || "General").trim() || "General";
        conteoPorMateria[mat] = (conteoPorMateria[mat] || 0) + 1;
      });
      const materiasOrdenadas = Object.keys(conteoPorMateria).sort();
      if (filtroMateriaActual !== "Todas" && !conteoPorMateria[filtroMateriaActual]) {
        filtroMateriaActual = "Todas";
      }

      selectMateria.replaceChildren();
      const optTodas = document.createElement("option");
      optTodas.value = "Todas";
      optTodas.textContent = `${t("filterAllSubjects")} (${lista.length})`;
      selectMateria.appendChild(optTodas);

      materiasOrdenadas.forEach((mat) => {
        const opt = document.createElement("option");
        opt.value = mat;
        opt.textContent = `${mat} (${conteoPorMateria[mat]})`;
        selectMateria.appendChild(opt);
      });

      selectMateria.value = filtroMateriaActual;
    }

    actualizarVisibilidadResetFiltros();
  }

  /**
   * Renderiza los indicadores rápidos de Evolución Temporal (Racha, Días activos y Promedio/día).
   */
  function renderizarResumenEvolucion(datosEvolucion) {
    if (!datosEvolucion) return;
    const elStreak = document.getElementById("evoStreakBadge");
    const elActive = document.getElementById("evoActiveDaysBadge");
    const elAvg = document.getElementById("evoAvgDayBadge");

    if (elStreak) {
      elStreak.textContent = t("evoStreakBadgeText", {
        streak: datosEvolucion.rachaActual,
        best: datosEvolucion.mejorRacha
      });
    }
    if (elActive) {
      elActive.textContent = t("evoActiveDaysBadgeText", {
        days: datosEvolucion.diasActivos
      });
    }
    if (elAvg) {
      elAvg.textContent = t("evoAvgDayBadgeText", {
        min: datosEvolucion.promedioMinPorDiaActivo
      });
    }
  }

  /**
   * Renderiza el Mapa de Calor Circadiano (7 Días x 4 Franjas Horarias) con color dinámico.
   */
  function renderizarMapaCalorCircadiano(datosMapaCalor) {
    const contenedor = document.getElementById("heatmapCircadiano");
    const badgeGolden = document.getElementById("heatmapGoldenBadge");
    if (!contenedor || !datosMapaCalor) return;

    if (badgeGolden) {
      if (datosMapaCalor.mejorCelda) {
        const mc = datosMapaCalor.mejorCelda;
        badgeGolden.textContent = t("heatmapGoldenText", {
          day: trVal("diaSemana", mc.dia),
          slot: trVal("franjaHoraria", mc.franja),
          quality: mc.calidadProm,
          min: mc.minutos
        });
      } else {
        badgeGolden.textContent = t("heatmapGoldenEmpty");
      }
    }

    contenedor.replaceChildren();
    const tabla = document.createElement("table");
    tabla.className = "heatmap-table";

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    const thCorner = document.createElement("th");
    thCorner.textContent = t("heatmapCornerLabel");
    trHead.appendChild(thCorner);

    datosMapaCalor.ordenFranjas.forEach((franja) => {
      const th = document.createElement("th");
      th.textContent = trVal("franjaHoraria", franja);
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    tabla.appendChild(thead);

    const tbody = document.createElement("tbody");
    const maxMin = Math.max(1, datosMapaCalor.maxMinutosCelda || 60);

    datosMapaCalor.ordenDias.forEach((dia) => {
      const tr = document.createElement("tr");
      const tdDia = document.createElement("td");
      tdDia.className = "heatmap-day-cell";
      tdDia.textContent = trVal("diaSemana", dia);
      tr.appendChild(tdDia);

      datosMapaCalor.ordenFranjas.forEach((franja) => {
        const celda = datosMapaCalor.matriz[dia][franja];
        const td = document.createElement("td");
        td.className = "heatmap-val-cell";

        if (!celda || celda.sesiones === 0) {
          td.classList.add("heatmap-empty");
          td.textContent = "—";
        } else {
          let bg = "rgba(99, 102, 241, 0.25)";
          let textoPrincipal = `${celda.minutos}m`;
          let textoSecundario = `⭐️ ${celda.calidadProm}`;

          if (metricaHeatmapActual === "minutos") {
            const alpha = +(0.18 + Math.min(1, celda.minutos / maxMin) * 0.68).toFixed(2);
            bg = `rgba(99, 102, 241, ${alpha})`;
            textoPrincipal = `${celda.minutos} min`;
            textoSecundario = `⭐️ ${celda.calidadProm} · ${celda.sesiones}s`;
          } else if (metricaHeatmapActual === "calidad") {
            if (celda.calidadProm >= 4) {
              bg = "rgba(16, 185, 129, 0.45)";
            } else if (celda.calidadProm >= 3) {
              bg = "rgba(245, 158, 11, 0.38)";
            } else {
              bg = "rgba(239, 68, 68, 0.42)";
            }
            textoPrincipal = `⭐️ ${celda.calidadProm}`;
            textoSecundario = `${celda.minutos} min (${celda.sesiones}s)`;
          } else if (metricaHeatmapActual === "energia") {
            if (celda.energiaProm >= 2.5) {
              bg = "rgba(16, 185, 129, 0.42)";
              textoPrincipal = `🔋 ${celda.energiaProm}/3`;
            } else if (celda.energiaProm >= 1.7) {
              bg = "rgba(245, 158, 11, 0.36)";
              textoPrincipal = `⚡ ${celda.energiaProm}/3`;
            } else {
              bg = "rgba(239, 68, 68, 0.38)";
              textoPrincipal = `🪫 ${celda.energiaProm}/3`;
            }
            textoSecundario = `⭐️ ${celda.calidadProm} · ${celda.minutos}m`;
          }

          td.style.background = bg;
          const strong = document.createElement("strong");
          strong.textContent = textoPrincipal;
          const small = document.createElement("small");
          small.textContent = textoSecundario;
          td.append(strong, small);
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    tabla.appendChild(tbody);
    contenedor.appendChild(tabla);
  }

  /**
   * Renderiza los contadores de los 4 cuadrantes cognitivos de IA vs. Retención.
   */
  function renderizarBadgesCuadrante(datosCuadrante) {
    if (!datosCuadrante || !datosCuadrante.cuadrantes) return;
    const { qSinergia, qAutonomo, qMecanico, qFatiga } = datosCuadrante.cuadrantes;
    const elSyn = document.getElementById("quadBadgeSynergy");
    const elAut = document.getElementById("quadBadgeAuton");
    const elMech = document.getElementById("quadBadgeMech");
    const elFat = document.getElementById("quadBadgeFatigue");

    if (elSyn) elSyn.textContent = t("quadSynergyText", { count: qSinergia });
    if (elAut) elAut.textContent = t("quadAutonText", { count: qAutonomo });
    if (elMech) elMech.textContent = t("quadMechText", { count: qMecanico });
    if (elFat) elFat.textContent = t("quadFatigueText", { count: qFatiga });
  }

  /**
   * Renderiza el Balance Cognitivo (Preparación/Teoría vs. Producción/Práctica),
   * las tarjetas de Energía Previa y las de Complejidad.
   */
  function renderizarResumenHabitos(datosHabitos) {
    if (!datosHabitos) return;

    // 1. Barra de Balance Cognitivo
    const boxBalance = document.getElementById("balanceCognitivoBox");
    if (boxBalance && datosHabitos.balanceCognitivo) {
      const { minConsumo, minProduccion, pctConsumo, pctProduccion } =
        datosHabitos.balanceCognitivo;
      boxBalance.replaceChildren();

      const header = document.createElement("div");
      header.className = "balance-header";
      const spanCons = document.createElement("span");
      spanCons.textContent = t("balanceConsumeLabel", {
        min: minConsumo,
        pct: pctConsumo
      });
      const spanProd = document.createElement("span");
      spanProd.textContent = t("balanceProduceLabel", {
        min: minProduccion,
        pct: pctProduccion
      });
      header.append(spanCons, spanProd);

      const barTrack = document.createElement("div");
      barTrack.className = "balance-track";
      const fillCons = document.createElement("div");
      fillCons.className = "balance-fill-consume";
      fillCons.style.width = `${pctConsumo}%`;
      const fillProd = document.createElement("div");
      fillProd.className = "balance-fill-produce";
      fillProd.style.width = `${pctProduccion}%`;
      barTrack.append(fillCons, fillProd);

      boxBalance.append(header, barTrack);
    }

    // 2. Resumen por Energía Previa
    const contenedorEnergia = document.getElementById("resumenHabitosBar");
    if (contenedorEnergia) {
      contenedorEnergia.replaceChildren();
      datosHabitos.resumenEnergia.forEach((item) => {
        const pill = document.createElement("div");
        pill.className = "habit-stat-pill";

        const title = document.createElement("span");
        title.className = "habit-stat-title";
        const energiaTrad = trVal("energiaPrevia", item.etiqueta);
        title.textContent = `${item.icono} ${t("habitEnergyPrefix")} ${energiaTrad}:`;

        const val = document.createElement("strong");
        val.textContent = item.conteo
          ? `⭐️ ${item.calidadProm} (${item.conteo} ${t("habitSessionsShort")})`
          : t("habitNoRecords");

        pill.append(title, val);
        contenedorEnergia.appendChild(pill);
      });
    }

    // 3. Resumen por Complejidad
    const contenedorComp = document.getElementById("resumenComplejidadBar");
    if (contenedorComp && Array.isArray(datosHabitos.resumenComplejidad)) {
      contenedorComp.replaceChildren();
      datosHabitos.resumenComplejidad.forEach((item) => {
        const pill = document.createElement("div");
        pill.className = "habit-stat-pill";

        const title = document.createElement("span");
        title.className = "habit-stat-title";
        const compTrad = trVal("complejidad", item.etiqueta);
        title.textContent = `${item.icono} ${compTrad}:`;

        const val = document.createElement("strong");
        val.textContent = item.conteo
          ? `⭐️ ${item.calidadProm} · ${item.minutos}m (${item.conteo} ${t("habitSessionsShort")})`
          : t("habitNoRecords");

        pill.append(title, val);
        contenedorComp.appendChild(pill);
      });
    }
  }

  /**
   * Renderiza la Pestaña 4: Inspector de Subtemas y Bitácora de Notas.
   */
  function renderizarInspector(datosInspector, { onClickMateria } = {}) {
    const listaTemasEl = document.getElementById("inspectorSubtemasList");
    const listaNotasEl = document.getElementById("inspectorNotasList");
    if (!datosInspector) return;

    if (listaTemasEl) {
      listaTemasEl.replaceChildren();
      if (!datosInspector.subtemas.length) {
        const empty = document.createElement("div");
        empty.className = "inspector-empty";
        empty.textContent = t("habitNoRecords");
        listaTemasEl.appendChild(empty);
      } else {
        const maxMinTema = Math.max(1, datosInspector.subtemas[0].minutos);
        datosInspector.subtemas.forEach((st) => {
          const card = document.createElement("div");
          card.className = "topic-inspector-card";
          card.addEventListener("click", () => {
            if (typeof onClickMateria === "function") {
              onClickMateria(st.materia);
            }
          });

          const topRow = document.createElement("div");
          topRow.className = "topic-card-top";

          const titleWrap = document.createElement("div");
          const strongTema = document.createElement("strong");
          strongTema.textContent = st.tema;
          const subMat = document.createElement("small");
          subMat.className = "cell-sub";
          subMat.textContent = `📚 ${st.materia} · ${st.ultimaFecha}`;
          titleWrap.append(strongTema, subMat);

          const statsWrap = document.createElement("div");
          statsWrap.className = "topic-card-stats";
          statsWrap.textContent = `⏱️ ${st.minutos}m (${st.sesiones} ${t(
            "habitSessionsShort"
          )}) · ⭐️ ${st.calidadProm} · 🤖 ${st.iaProm}% · +${st.xp} XP`;

          topRow.append(titleWrap, statsWrap);

          const progressBg = document.createElement("div");
          progressBg.className = "topic-progress-bg";
          const progressFill = document.createElement("div");
          progressFill.className = "topic-progress-fill";
          progressFill.style.width = `${Math.round((st.minutos / maxMinTema) * 100)}%`;
          progressBg.appendChild(progressFill);

          card.append(topRow, progressBg);
          listaTemasEl.appendChild(card);
        });
      }
    }

    if (listaNotasEl) {
      listaNotasEl.replaceChildren();
      if (!datosInspector.bitacoraNotas.length) {
        const empty = document.createElement("div");
        empty.className = "inspector-empty";
        empty.textContent = t("inspectorNoNotes");
        listaNotasEl.appendChild(empty);
      } else {
        datosInspector.bitacoraNotas.slice(0, 15).forEach((s) => {
          const item = document.createElement("div");
          item.className = "note-log-card";

          const meta = document.createElement("div");
          meta.className = "note-log-meta";
          const icAct = ICONOS_ACTIVIDAD[s.tipoActividad] || "💻";
          meta.textContent = `${s.fecha} · 📚 ${s.materia} (${s.tema}) · ${icAct} ${trVal(
            "tipoActividad",
            s.tipoActividad
          )} · ⭐️ ${s.calidad}/5 · 🤖 ${s.usoIA}%`;

          const text = document.createElement("div");
          text.className = "note-log-text";
          text.textContent = `“${s.notas}”`;

          item.append(meta, text);
          listaNotasEl.appendChild(item);
        });
      }
    }
  }

  /**
   * Crea una fila <tr> segura para la tabla de historial con Materia, Tema, Contexto, Modo de IA y acciones CRUD.
   */
  function crearFilaSesion(sesion, { onEditar, onEliminar }) {
    const tr = document.createElement("tr");
    tr.dataset.id = sesion.id;
    if (sesion.id === sesionEditandoId) {
      tr.classList.add("row-editing");
    }

    // Fecha + Día de la semana y franja
    const tdFecha = document.createElement("td");
    const divFecha = document.createElement("div");
    divFecha.textContent = sesion.fecha;
    const subDia = document.createElement("small");
    subDia.className = "cell-sub";
    const diaTrad = trVal("diaSemana", sesion.diaSemana || "");
    const franjaTrad = trVal("franjaHoraria", sesion.franjaHoraria || "");
    subDia.textContent = `${diaTrad} · ${franjaTrad}`;
    tdFecha.append(divFecha, subDia);

    // Horario (Inicio - Fin)
    const tdHorario = document.createElement("td");
    tdHorario.textContent = `${sesion.horaInicio} - ${sesion.horaFin}`;

    // Materia + Contexto y Tema específico
    const tdMateriaTema = document.createElement("td");
    const strongMateria = document.createElement("strong");
    strongMateria.textContent = sesion.materia;
    const subTema = document.createElement("small");
    subTema.className = "cell-sub";
    const ctxVal = sesion.contexto || "Académico";
    const icCtx = ICONOS_CONTEXTO[ctxVal] || "🎓";
    subTema.textContent = `${icCtx} ${trVal("contexto", ctxVal)} · ${sesion.tema || "General"}`;
    tdMateriaTema.append(strongMateria, subTema);

    // Actividad
    const tdActividad = document.createElement("td");
    const actVal = sesion.tipoActividad || "Desarrollo / Código";
    const iconoAct = ICONOS_ACTIVIDAD[actVal] || "💻";
    tdActividad.textContent = `${iconoAct} ${trVal("tipoActividad", actVal)}`;

    // Contexto Operativo (Energía + Complejidad + Objetivo)
    const tdContexto = document.createElement("td");
    const spanContexto = document.createElement("span");
    spanContexto.className = "context-badges";
    const icEnergia = ICONOS_ENERGIA[sesion.energiaPrevia] || "⚡";
    const icComp = ICONOS_COMPLEJIDAD[sesion.complejidad] || "🟡";
    const icObj = ICONOS_OBJETIVO[sesion.objetivoCumplido] || "✅";
    spanContexto.textContent = `${icEnergia} ${trVal(
      "energiaPrevia",
      sesion.energiaPrevia
    )} · ${icComp} ${trVal("complejidad", sesion.complejidad)} · ${icObj} ${trVal(
      "objetivoCumplido",
      sesion.objetivoCumplido
    )}`;
    tdContexto.appendChild(spanContexto);

    // Duración
    const tdDuracion = document.createElement("td");
    tdDuracion.textContent = `${sesion.duracion} min`;

    // Asimilación / Calidad
    const tdCalidad = document.createElement("td");
    const badgeCalidad = document.createElement("span");
    const calSegura = Math.min(5, Math.max(1, Number(sesion.calidad) || 3));
    badgeCalidad.className = `badge badge-q${calSegura}`;
    badgeCalidad.textContent = `⭐️ ${calSegura} / 5`;
    tdCalidad.appendChild(badgeCalidad);

    // Modo de IA + % Uso IA
    const tdIA = document.createElement("td");
    const modoActual =
      sesion.modoIA || (Number(sesion.usoIA) === 0 ? "Autónomo" : "Copiloto / Apoyo");
    const icModoIA = ICONOS_MODO_IA[modoActual] || "🛠️";
    const divModoIA = document.createElement("div");
    divModoIA.className =
      modoActual === "Mecánico / Copy-Paste"
        ? "ia-mode-tag ia-mode-mecanico"
        : modoActual === "Diálogo / Tutoría" || modoActual === "Autónomo"
        ? "ia-mode-tag ia-mode-aprendizaje"
        : "ia-mode-tag";
    divModoIA.textContent = `${icModoIA} ${trVal("modoIA", modoActual)}`;
    const subPorcentajeIA = document.createElement("small");
    subPorcentajeIA.className = "cell-sub";
    subPorcentajeIA.textContent = t("tableAiSupportSub", { pct: sesion.usoIA });
    tdIA.append(divModoIA, subPorcentajeIA);

    // XP Ganados
    const tdXP = document.createElement("td");
    tdXP.className = "xp-cell";
    tdXP.textContent = `+${sesion.xp} XP`;

    // Notas
    const tdNotas = document.createElement("td");
    tdNotas.className = "notes-cell";
    tdNotas.textContent = sesion.notas || "-";

    // Acciones: Editar y Eliminar
    const tdAcciones = document.createElement("td");
    tdAcciones.className = "actions-cell";

    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.className = "action-icon-btn edit-btn";
    btnEditar.title = t("btnEditSessionTitle");
    btnEditar.textContent = "✏️";
    btnEditar.addEventListener("click", () => onEditar(sesion));

    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.className = "action-icon-btn delete-btn";
    btnEliminar.title = t("btnDeleteSessionTitle");
    btnEliminar.textContent = "✖";
    btnEliminar.addEventListener("click", () => onEliminar(sesion.id));

    tdAcciones.append(btnEditar, btnEliminar);

    tr.append(
      tdFecha,
      tdHorario,
      tdMateriaTema,
      tdActividad,
      tdContexto,
      tdDuracion,
      tdCalidad,
      tdIA,
      tdXP,
      tdNotas,
      tdAcciones
    );
    return tr;
  }

  /**
   * Renderiza toda la interfaz (Barra RPG Global, Filtro por Contexto, KPIs, Tabla y Gráficos).
   */
  function renderizarDashboard(todasLasSesiones, { onEditarSesion, onEliminarSesion } = {}) {
    const listaGlobal = Array.isArray(todasLasSesiones) ? todasLasSesiones : [];

    // Actualizar autocompletado y contadores de pestañas de filtro
    actualizarAutocompletado(listaGlobal);
    actualizarContadoresFiltro(listaGlobal);

    // 1. Barra RPG Exponencial (siempre refleja el XP y Nivel total del personaje)
    const kpisGlobales = calcularKPIs(listaGlobal);
    const progreso = calcularProgresoRPG(kpisGlobales.totalXP);

    document.getElementById("uiNivel").textContent = progreso.nivel;
    document.getElementById("uiRango").textContent = trVal("rango", progreso.rango);
    document.getElementById("uiXpActual").textContent = progreso.xpEnNivelActual;
    document.getElementById("uiXpSiguiente").textContent = progreso.esNivelMaximo
      ? t("rpgMaxLevel")
      : progreso.xpSiguienteNivel;
    document.getElementById("uiXpBar").style.width = `${progreso.porcentajeBarra}%`;
    document.getElementById("uiXpTotalBadge").textContent = `${progreso.totalXP} XP`;

    // Aplicar filtros globales combinados (Contexto + Periodo + Materia) para KPIs, Gráficos y Tabla
    const sesionesFiltradas = filtrarSesionesAvanzado(listaGlobal, {
      contexto: filtroContextoActual,
      periodo: filtroPeriodoActual,
      materia: filtroMateriaActual
    });

    const kpis = calcularKPIs(sesionesFiltradas);

    // 2. Tarjetas KPI (filtradas por el contexto seleccionado)
    document.getElementById("kpiHoras").textContent = `${kpis.totalHoras} h`;
    document.getElementById("kpiMinutos").textContent = t("kpiTotalMinutesSub", {
      min: kpis.totalMinutos
    });
    document.getElementById("kpiSesiones").textContent = kpis.totalSesiones;
    document.getElementById("kpiPromedioMin").textContent = kpis.totalSesiones
      ? t("kpiAvgMinSub", { min: kpis.promedioMinutos })
      : t("kpiAvgMinZero");
    document.getElementById("kpiCalidad").textContent = `${kpis.promedioCalidad} / 5`;
    document.getElementById("kpiIA").textContent = `${kpis.promedioIA}%`;

    const elKpiIASub = document.getElementById("kpiIASub");
    if (elKpiIASub) {
      elKpiIASub.textContent = t("kpiAiSub", {
        dial: kpis.iaDialogo,
        auton: kpis.iaAutonomo,
        mech: kpis.iaMecanico
      });
    }

    const elKpiObjetivos = document.getElementById("kpiObjetivos");
    const elKpiObjetivosSub = document.getElementById("kpiObjetivosSub");
    if (elKpiObjetivos) elKpiObjetivos.textContent = `${kpis.tasaObjetivos}%`;
    if (elKpiObjetivosSub) {
      elKpiObjetivosSub.textContent = t("kpiGoalsSub", {
        yes: kpis.cumplidosSi,
        partial: kpis.cumplidosParcial,
        no: kpis.bloqueosNo
      });
    }

    // 3. Tabla de Historial (ordenada de más reciente a más antigua y limitada a los últimos 5 por defecto)
    const sesionesOrdenadas = [...sesionesFiltradas].reverse();
    const totalFiltradas = sesionesOrdenadas.length;
    const hayMasDelLimite = totalFiltradas > LIMITE_HISTORIAL_RECIENTE;
    const sesionesVisibles =
      !mostrarTodoHistorial && hayMasDelLimite
        ? sesionesOrdenadas.slice(0, LIMITE_HISTORIAL_RECIENTE)
        : sesionesOrdenadas;

    const tbody = document.getElementById("tablaBody");
    if (tbody) {
      tbody.replaceChildren();
      const fragment = document.createDocumentFragment();
      sesionesVisibles.forEach((s) => {
        fragment.appendChild(
          crearFilaSesion(s, {
            onEditar: (sesionSeleccionada) => {
              if (typeof onEditarSesion === "function") {
                onEditarSesion(sesionSeleccionada);
              }
            },
            onEliminar: (id) => {
              if (typeof onEliminarSesion === "function") {
                onEliminarSesion(id);
              }
            }
          })
        );
      });
      tbody.appendChild(fragment);
    }

    const elFooter = document.getElementById("tableFooter");
    const elFooterInfo = document.getElementById("tableFooterInfo");
    const btnToggleHistorial = document.getElementById("btnToggleHistorial");
    if (elFooter && elFooterInfo && btnToggleHistorial) {
      if (totalFiltradas === 0) {
        elFooter.style.display = "none";
      } else {
        elFooter.style.display = "flex";
        if (hayMasDelLimite) {
          elFooterInfo.textContent = mostrarTodoHistorial
            ? t("historyShowingAll", { total: totalFiltradas })
            : t("historyShowingRecent", {
                shown: sesionesVisibles.length,
                total: totalFiltradas
              });
          btnToggleHistorial.style.display = "inline-flex";
          btnToggleHistorial.textContent = mostrarTodoHistorial
            ? t("btnShowRecentHistory")
            : t("btnShowAllHistory", { total: totalFiltradas });
        } else {
          elFooterInfo.textContent = t("historyShowingAll", { total: totalFiltradas });
          btnToggleHistorial.style.display = "none";
        }
      }
    }

    // 4. Gráficos, Mapa de Calor, Cuadrante IA, Hábitos e Inspector de Subtemas
    const manejarClickMateria = (materiaClick) => {
      const nueva = filtroMateriaActual === materiaClick ? "Todas" : materiaClick;
      cambiarFiltroMateria(nueva);
      renderizarDashboard(todasLasSesiones, { onEditarSesion, onEliminarSesion });
    };

    const {
      datosEvolucion,
      datosMapaCalor,
      datosCuadrante,
      datosHora,
      datosHabitos,
      datosInspector
    } = StudyTracker.Charts.renderizarGraficos(sesionesFiltradas, {
      agrupacionTemporal: agrupacionTemporalActual,
      onSeleccionarMateria: manejarClickMateria
    });

    renderizarResumenEvolucion(datosEvolucion);
    renderizarMapaCalorCircadiano(datosMapaCalor);
    renderizarBadgesCuadrante(datosCuadrante);
    renderizarResumenHabitos(datosHabitos);
    renderizarInspector(datosInspector, { onClickMateria: manejarClickMateria });

    const elMejorHora = document.getElementById("kpiMejorHora");
    if (elMejorHora) {
      if (datosHora.mejorHora) {
        elMejorHora.textContent = t("kpiBestHourPeak", {
          hour: datosHora.mejorHora,
          quality: datosHora.mejorCalidad.toFixed(1)
        });
      } else {
        elMejorHora.textContent = t("kpiBestHourNone");
      }
    }
  }

  StudyTracker.UI = {
    obtenerValoresChips,
    obtenerIdSesionEditando,
    cambiarFiltroContexto,
    cambiarFiltroPeriodo,
    cambiarFiltroMateria,
    resetearFiltros,
    cambiarPestanaAnalitica,
    cambiarAgrupacionTemporal,
    cambiarMetricaHeatmap,
    alternarVistaHistorial,
    seleccionarChip,
    cargarSesionEnFormulario,
    salirModoEdicion,
    refrescarTextosFormulario,
    inicializarFormulario,
    ponerHoraActual,
    actualizarAyudaActividad,
    actualizarAyudaObjetivo,
    actualizarAyudaCalidad,
    actualizarAyudaIA,
    actualizarPreview,
    actualizarEstadoArchivo,
    renderizarDashboard
  };
})(window);

