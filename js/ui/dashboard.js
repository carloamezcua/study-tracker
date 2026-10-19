/**
 * Capa de UI (Dashboard): Renderizado seguro del DOM (prevención de XSS con textContent),
 * actualización de KPIs, barra RPG y manejo de eventos del formulario.
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

  /**
   * Inicializa los valores por defecto del formulario (fecha actual y bloque de 25 min).
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
   * Calcula y muestra la vista previa de minutos y XP antes de guardar la sesión.
   */
  function actualizarPreview() {
    const horaInicio = document.getElementById("horaInicio")?.value;
    const horaFin = document.getElementById("horaFin")?.value;
    const calidad = Number(document.getElementById("calidad")?.value || 3);

    const min = calcularMinutos(horaInicio, horaFin);
    const xp = calcularXP(min, calidad);

    const elDuracion = document.getElementById("previewDuracion");
    const elXP = document.getElementById("previewXP");
    if (elDuracion) elDuracion.textContent = `⏱️ Duración: ${min} min`;
    if (elXP) elXP.textContent = `+${xp} XP`;
  }

  /**
   * Actualiza el indicador visual del estado de conexión con Excel.
   */
  function actualizarEstadoArchivo(texto, conectado = false) {
    const status = document.getElementById("fileStatus");
    if (!status) return;
    status.textContent = texto;
    if (conectado) {
      status.classList.add("connected");
    } else {
      status.classList.remove("connected");
    }
  }

  /**
   * Crea una fila <tr> segura para la tabla de historial sin usar innerHTML con datos de usuario.
   */
  function crearFilaSesion(sesion, onEliminar) {
    const tr = document.createElement("tr");
    tr.dataset.id = sesion.id;

    const tdFecha = document.createElement("td");
    tdFecha.textContent = sesion.fecha;

    const tdInicio = document.createElement("td");
    tdInicio.textContent = sesion.horaInicio;

    const tdFin = document.createElement("td");
    tdFin.textContent = sesion.horaFin;

    const tdMateria = document.createElement("td");
    const strongMateria = document.createElement("strong");
    strongMateria.textContent = sesion.materia;
    tdMateria.appendChild(strongMateria);

    const tdDuracion = document.createElement("td");
    tdDuracion.textContent = `${sesion.duracion} min`;

    const tdCalidad = document.createElement("td");
    const badgeCalidad = document.createElement("span");
    const calSegura = Math.min(5, Math.max(1, Number(sesion.calidad) || 3));
    badgeCalidad.className = `badge badge-q${calSegura}`;
    badgeCalidad.textContent = `⭐️ ${calSegura} / 5`;
    tdCalidad.appendChild(badgeCalidad);

    const tdIA = document.createElement("td");
    tdIA.textContent = `${sesion.usoIA}%`;

    const tdXP = document.createElement("td");
    tdXP.className = "xp-cell";
    tdXP.textContent = `+${sesion.xp} XP`;

    const tdNotas = document.createElement("td");
    tdNotas.className = "notes-cell";
    tdNotas.textContent = sesion.notas || "-";

    const tdAcciones = document.createElement("td");
    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.className = "delete-btn";
    btnEliminar.title = "Eliminar fila";
    btnEliminar.textContent = "✖";
    btnEliminar.addEventListener("click", () => onEliminar(sesion.id));
    tdAcciones.appendChild(btnEliminar);

    tr.append(
      tdFecha,
      tdInicio,
      tdFin,
      tdMateria,
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
  function renderizarDashboard(sesiones, { onEliminarSesion } = {}) {
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

    // 3. Tabla de Historial (usando nodos seguros e IDs únicos)
    const tbody = document.getElementById("tablaBody");
    if (tbody) {
      tbody.replaceChildren();
      const fragment = document.createDocumentFragment();
      sesiones.forEach((s) => {
        fragment.appendChild(
          crearFilaSesion(s, (id) => {
            if (typeof onEliminarSesion === "function") {
              onEliminarSesion(id);
            }
          })
        );
      });
      tbody.appendChild(fragment);
    }

    // 4. Gráficos y mejor hora de enfoque
    const { datosHora } = StudyTracker.Charts.renderizarGraficos(sesiones);
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
    inicializarFormulario,
    ponerHoraActual,
    actualizarAyudaCalidad,
    actualizarAyudaIA,
    actualizarPreview,
    actualizarEstadoArchivo,
    renderizarDashboard
  };
})(window);

