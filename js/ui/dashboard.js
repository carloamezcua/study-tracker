/**
 * Capa de UI (Dashboard): Renderizado seguro del DOM (prevención de XSS con textContent),
 * modo de edición en línea de sesiones, selectores rápidos de chips (1 clic),
 * actualización de KPIs, barra RPG y tabla.
 */
(function (global) {
  const StudyTracker = (global.StudyTracker = global.StudyTracker || {});
  const {
    calcularMinutos,
    calcularXP,
    calcularProgresoRPG,
    calcularKPIs,
    obtenerTextoAyudaCalidad,
    obtenerTextoAyudaIA
  } = StudyTracker.RPG;

  // Estado local de los chips seleccionados en el formulario (1 clic)
  const estadoChips = {
    tipoActividad: "Código / Práctica",
    energiaPrevia: "Media",
    complejidad: "Desafiante",
    objetivoCumplido: "Sí"
  };

  // ID de la sesión que se está editando actualmente (null si es registro nuevo)
  let sesionEditandoId = null;

  const ICONOS_ACTIVIDAD = {
    "Código / Práctica": "💻",
    "Lectura / Teoría": "📖",
    "Papel / A mano": "✍️",
    "Tarea / Entrega": "📝",
    "Repaso": "🔁"
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
   * Selecciona un chip dentro de su grupo y actualiza la vista previa de XP.
   */
  function seleccionarChip(grupo, valor) {
    if (!(grupo in estadoChips)) return;
    estadoChips[grupo] = valor;

    const contenedor = document.querySelector(`.chip-group[data-group="${grupo}"]`);
    if (contenedor) {
      contenedor.querySelectorAll(".chip-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.value === valor);
      });
    }

    actualizarPreview();
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
    document.getElementById("calidad").value = String(sesion.calidad);
    document.getElementById("usoIA").value = String(sesion.usoIA);
    document.getElementById("notas").value = sesion.notas || "";

    seleccionarChip("tipoActividad", sesion.tipoActividad || "Código / Práctica");
    seleccionarChip("energiaPrevia", sesion.energiaPrevia || "Media");
    seleccionarChip("complejidad", sesion.complejidad || "Desafiante");
    seleccionarChip("objetivoCumplido", sesion.objetivoCumplido || "Sí");

    actualizarAyudaCalidad();
    actualizarAyudaIA();
    actualizarPreview();

    const formPanel = document.getElementById("formPanel");
    const formTitle = document.getElementById("formTitle");
    const btnSubmit = document.getElementById("btnSubmitForm");
    const btnCancel = document.getElementById("btnCancelEdit");

    if (formPanel) formPanel.classList.add("panel-editing");
    if (formTitle) formTitle.textContent = "✏️ Editando Sesión";
    if (btnSubmit) btnSubmit.textContent = "💾 Actualizar Sesión y Sincronizar Excel";
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
    if (formTitle) formTitle.textContent = "➕ Registrar Sesión";
    if (btnSubmit) btnSubmit.textContent = "💾 Registrar Sesión y Sumar XP";
    if (btnCancel) btnCancel.style.display = "none";

    document.querySelectorAll("#tablaBody tr.row-editing").forEach((tr) => {
      tr.classList.remove("row-editing");
    });

    document.getElementById("notas").value = "";
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
      inputFecha.value = ahora.toISOString().split("T")[0];
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
      seleccionarChip(grupo, estadoChips[grupo]);
    });

    actualizarPreview();
    actualizarAyudaCalidad();
    actualizarAyudaIA();
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
   * Actualiza la caja de ayuda según la calidad seleccionada.
   */
  function actualizarAyudaCalidad() {
    const selectCalidad = document.getElementById("calidad");
    const boxAyuda = document.getElementById("ayudaCalidad");
    if (!selectCalidad || !boxAyuda) return;
    boxAyuda.textContent = obtenerTextoAyudaCalidad(selectCalidad.value);
  }

  /**
   * Actualiza la etiqueta y descripción de ayuda del deslizador de uso de IA.
   */
  function actualizarAyudaIA() {
    const inputIA = document.getElementById("usoIA");
    const labelIA = document.getElementById("iaLabel");
    const boxAyuda = document.getElementById("ayudaIA");
    if (!inputIA) return;

    const val = Number(inputIA.value);
    if (labelIA) labelIA.textContent = `${val}%`;
    if (boxAyuda) boxAyuda.textContent = obtenerTextoAyudaIA(val);
  }

  /**
   * Calcula y muestra la vista previa de minutos y XP (incluyendo bonos por complejidad y objetivo).
   */
  function actualizarPreview() {
    const horaInicio = document.getElementById("horaInicio")?.value;
    const horaFin = document.getElementById("horaFin")?.value;
    const calidad = Number(document.getElementById("calidad")?.value || 3);

    const min = calcularMinutos(horaInicio, horaFin);
    const xp = calcularXP(min, calidad, estadoChips.complejidad, estadoChips.objetivoCumplido);

    const bonosActivos = [];
    if (estadoChips.complejidad === "Desafiante") bonosActivos.push("+10% reto");
    if (estadoChips.complejidad === "Muy difícil") bonosActivos.push("+20% difícil");
    if (estadoChips.objetivoCumplido === "Sí") bonosActivos.push("+10% meta");

    const elDuracion = document.getElementById("previewDuracion");
    const elXP = document.getElementById("previewXP");
    if (elDuracion) {
      elDuracion.textContent = bonosActivos.length
        ? `⏱️ ${min} min (${bonosActivos.join(", ")})`
        : `⏱️ Duración: ${min} min`;
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
      title.textContent = `${item.icono} Energía ${item.etiqueta}:`;

      const val = document.createElement("strong");
      val.textContent = item.conteo
        ? `⭐️ ${item.calidadProm} (${item.conteo} ses.)`
        : "Sin registros";

      pill.append(title, val);
      contenedor.appendChild(pill);
    });
  }

  /**
   * Crea una fila <tr> segura para la tabla de historial con botones de Editar y Eliminar.
   */
  function crearFilaSesion(sesion, { onEditar, onEliminar }) {
    const tr = document.createElement("tr");
    tr.dataset.id = sesion.id;
    if (sesion.id === sesionEditandoId) {
      tr.classList.add("row-editing");
    }

    // Fecha + Día de la semana
    const tdFecha = document.createElement("td");
    const divFecha = document.createElement("div");
    divFecha.textContent = sesion.fecha;
    const subDia = document.createElement("small");
    subDia.className = "cell-sub";
    subDia.textContent = `${sesion.diaSemana || ""} · ${sesion.franjaHoraria || ""}`;
    tdFecha.append(divFecha, subDia);

    // Horario (Inicio - Fin)
    const tdHorario = document.createElement("td");
    tdHorario.textContent = `${sesion.horaInicio} - ${sesion.horaFin}`;

    // Materia
    const tdMateria = document.createElement("td");
    const strongMateria = document.createElement("strong");
    strongMateria.textContent = sesion.materia;
    tdMateria.appendChild(strongMateria);

    // Actividad
    const tdActividad = document.createElement("td");
    const iconoAct = ICONOS_ACTIVIDAD[sesion.tipoActividad] || "💻";
    tdActividad.textContent = `${iconoAct} ${sesion.tipoActividad || "Código / Práctica"}`;

    // Contexto (Energía + Complejidad + Objetivo)
    const tdContexto = document.createElement("td");
    const spanContexto = document.createElement("span");
    spanContexto.className = "context-badges";
    const icEnergia = ICONOS_ENERGIA[sesion.energiaPrevia] || "⚡";
    const icComp = ICONOS_COMPLEJIDAD[sesion.complejidad] || "🟡";
    const icObj = ICONOS_OBJETIVO[sesion.objetivoCumplido] || "✅";
    spanContexto.textContent = `${icEnergia} ${sesion.energiaPrevia} · ${icComp} ${sesion.complejidad} · ${icObj} ${sesion.objetivoCumplido}`;
    tdContexto.appendChild(spanContexto);

    // Duración
    const tdDuracion = document.createElement("td");
    tdDuracion.textContent = `${sesion.duracion} min`;

    // Calidad
    const tdCalidad = document.createElement("td");
    const badgeCalidad = document.createElement("span");
    const calSegura = Math.min(5, Math.max(1, Number(sesion.calidad) || 3));
    badgeCalidad.className = `badge badge-q${calSegura}`;
    badgeCalidad.textContent = `⭐️ ${calSegura} / 5`;
    tdCalidad.appendChild(badgeCalidad);

    // % Uso IA
    const tdIA = document.createElement("td");
    tdIA.textContent = `${sesion.usoIA}%`;

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
    btnEditar.title = "Editar esta sesión";
    btnEditar.textContent = "✏️";
    btnEditar.addEventListener("click", () => onEditar(sesion));

    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.className = "action-icon-btn delete-btn";
    btnEliminar.title = "Eliminar esta sesión";
    btnEliminar.textContent = "✖";
    btnEliminar.addEventListener("click", () => onEliminar(sesion.id));

    tdAcciones.append(btnEditar, btnEliminar);

    tr.append(
      tdFecha,
      tdHorario,
      tdMateria,
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
   * Renderiza toda la interfaz (Barra RPG, KPIs, Tabla de Historial y Gráficos) a partir de las sesiones.
   */
  function renderizarDashboard(sesiones, { onEditarSesion, onEliminarSesion } = {}) {
    const kpis = calcularKPIs(sesiones);
    const progreso = calcularProgresoRPG(kpis.totalXP);

    // 1. Barra RPG
    document.getElementById("uiNivel").textContent = progreso.nivel;
    document.getElementById("uiRango").textContent = progreso.rango;
    document.getElementById("uiXpActual").textContent = progreso.xpEnNivelActual;
    document.getElementById("uiXpSiguiente").textContent = progreso.xpSiguienteNivel;
    document.getElementById("uiXpBar").style.width = `${progreso.porcentajeBarra}%`;
    document.getElementById("uiXpTotalBadge").textContent = `${progreso.totalXP} XP`;

    // 2. Tarjetas KPI
    document.getElementById("kpiHoras").textContent = `${kpis.totalHoras} h`;
    document.getElementById("kpiMinutos").textContent = `${kpis.totalMinutos} minutos en total`;
    document.getElementById("kpiSesiones").textContent = kpis.totalSesiones;
    document.getElementById("kpiPromedioMin").textContent = kpis.totalSesiones
      ? `${kpis.promedioMinutos} min promedio / sesión`
      : "0 min promedio";
    document.getElementById("kpiCalidad").textContent = `${kpis.promedioCalidad} / 5`;
    document.getElementById("kpiIA").textContent = `${kpis.promedioIA}%`;

    const elKpiObjetivos = document.getElementById("kpiObjetivos");
    const elKpiObjetivosSub = document.getElementById("kpiObjetivosSub");
    if (elKpiObjetivos) elKpiObjetivos.textContent = `${kpis.tasaObjetivos}%`;
    if (elKpiObjetivosSub) {
      elKpiObjetivosSub.textContent = `${kpis.cumplidosSi} cumplidos · ${kpis.cumplidosParcial} parciales`;
    }

    // 3. Tabla de Historial (usando nodos seguros e IDs únicos)
    const tbody = document.getElementById("tablaBody");
    if (tbody) {
      tbody.replaceChildren();
      const fragment = document.createDocumentFragment();
      sesiones.forEach((s) => {
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
    const { datosHora, datosHabitos } = StudyTracker.Charts.renderizarGraficos(sesiones);
    renderizarResumenHabitos(datosHabitos);

    const elMejorHora = document.getElementById("kpiMejorHora");
    if (elMejorHora) {
      if (datosHora.mejorHora) {
        elMejorHora.textContent = `Pico de foco: ~${datosHora.mejorHora} (⭐️ ${datosHora.mejorCalidad.toFixed(1)})`;
      } else {
        elMejorHora.textContent = "Mejor hora: --:--";
      }
    }
  }

  StudyTracker.UI = {
    obtenerValoresChips,
    obtenerIdSesionEditando,
    seleccionarChip,
    cargarSesionEnFormulario,
    salirModoEdicion,
    inicializarFormulario,
    ponerHoraActual,
    actualizarAyudaCalidad,
    actualizarAyudaIA,
    actualizarPreview,
    actualizarEstadoArchivo,
    renderizarDashboard
  };
})(window);
