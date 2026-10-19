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

  // Filtro activo en el Dashboard ("Todos" o uno de los 4 contextos)
  let filtroContextoActual = "Todos";

  const ICONOS_CONTEXTO = {
    Académico: "🎓",
    Certificación: "🏅",
    "Proyecto Propio": "🚀",
    Externo: "🤝"
  };

  const ICONOS_ACTIVIDAD = {
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
    document.querySelectorAll("#contextFilterBar .filter-pill").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filtroContextoActual);
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
   * Selecciona un chip dentro de su grupo y actualiza la vista previa de XP y ayudas.
   */
  function seleccionarChip(grupo, valor) {
    if (!(grupo in estadoChips)) return;
    estadoChips[grupo] = valor;
    pintarGrupoChip(grupo, valor);

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
   * Actualiza la caja de ayuda según la calidad de asimilación seleccionada y el modo de IA.
   */
  function actualizarAyudaCalidad() {
    const selectCalidad = document.getElementById("calidad");
    const boxAyuda = document.getElementById("ayudaCalidad");
    const inputIA = document.getElementById("usoIA");
    if (!selectCalidad || !boxAyuda) return;
    const valIA = inputIA ? Number(inputIA.value) : 0;

    if (StudyTracker.I18n) {
      const nivel = Math.min(5, Math.max(1, Number(selectCalidad.value) || 3));
      let base = t(`helpQuality${nivel}`);
      if (estadoChips.modoIA === "Mecánico / Copy-Paste" && nivel >= 4) {
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
   * Actualiza los contadores de sesiones en la barra de filtro rápido por Contexto.
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
  }

  /**
   * Renderiza las tarjetas de resumen de Energía Previa vs Calidad en el panel de hábitos.
   */
  function renderizarResumenHabitos(datosHabitos) {
    const contenedor = document.getElementById("resumenHabitosBar");
    if (!contenedor || !datosHabitos) return;
    contenedor.replaceChildren();

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
      contenedor.appendChild(pill);
    });
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

    // Aplicar filtro de Contexto para KPIs, Gráficos y Tabla
    const sesionesFiltradas =
      filtroContextoActual === "Todos"
        ? listaGlobal
        : listaGlobal.filter((s) => (s.contexto || "Académico") === filtroContextoActual);

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

    // 3. Tabla de Historial (usando nodos seguros e IDs únicos)
    const tbody = document.getElementById("tablaBody");
    if (tbody) {
      tbody.replaceChildren();
      const fragment = document.createDocumentFragment();
      sesionesFiltradas.forEach((s) => {
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

    // 4. Gráficos, resumen de hábitos y mejor hora de enfoque
    const { datosHora, datosHabitos } = StudyTracker.Charts.renderizarGraficos(sesionesFiltradas);
    renderizarResumenHabitos(datosHabitos);

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
    seleccionarChip,
    cargarSesionEnFormulario,
    salirModoEdicion,
    refrescarTextosFormulario,
    inicializarFormulario,
    ponerHoraActual,
    actualizarAyudaObjetivo,
    actualizarAyudaCalidad,
    actualizarAyudaIA,
    actualizarPreview,
    actualizarEstadoArchivo,
    renderizarDashboard
  };
})(window);

