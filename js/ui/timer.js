/**
 * Capa de UI (Cronómetro y Pomodoro):
 * Medidor de tiempo en vivo libre de anuncios integrado con el formulario de estudio.
 * - Modo 1 (Por defecto): Cronómetro progresivo (cuenta hacia adelante desde 00:00:00).
 * - Modo 2: Temporizador Pomodoro (cuenta regresiva con presets de enfoque y descanso).
 * - Registra automáticamente la Fecha, Hora de Inicio y Hora de Fin en el formulario.
 * - Usa marcas de tiempo reales (Date.now) y persistencia en LocalStorage para no perder
 *   precisión aunque la pestaña pase a segundo plano o se recargue la página.
 */
(function (global) {
  const StudyTracker = (global.StudyTracker = global.StudyTracker || {});

  const TIMER_STORAGE_KEY = "study_tracker_timer_state";
  const TITULO_ORIGINAL = document.title || "StudyTracker — Analytics & Excel Sync";

  // Estado interno del medidor de tiempo
  let estado = {
    modo: "cronometro", // "cronometro" | "pomodoro"
    fasePomodoro: "enfoque", // "enfoque" | "descanso"
    minutosPomodoro: 25,
    corriendo: false,
    enPausa: false,
    inicioTimestampMs: null, // Momento exacto en que se dio clic al último Iniciar/Reanudar
    acumuladoMs: 0, // Tiempo acumulado previo a la última pausa
    horaInicioCapturada: null, // "HH:MM" del primer inicio de la sesión
    horaFinCapturada: null, // "HH:MM" del momento en que se terminó
    fechaCapturada: null, // "YYYY-MM-DD" del inicio de la sesión
    sonidoActivo: true
  };

  let intervaloId = null;

  /**
   * Formatea un objeto Date a "YYYY-MM-DD" en hora local del usuario.
   */
  function formatearFechaLocal(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  /**
   * Formatea un objeto Date a "HH:MM" en hora local del usuario.
   */
  function formatearHoraLocal(date = new Date()) {
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${min}`;
  }

  /**
   * Suma minutos a una hora "HH:MM" y devuelve el nuevo "HH:MM".
   */
  function sumarMinutosAHora(horaStr, minutosASumar) {
    if (!horaStr) return formatearHoraLocal();
    const [h, m] = horaStr.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return formatearHoraLocal();
    const total = (h * 60 + m + minutosASumar + 1440) % 1440;
    const nh = String(Math.floor(total / 60)).padStart(2, "0");
    const nm = String(total % 60).padStart(2, "0");
    return `${nh}:${nm}`;
  }

  /**
   * Devuelve el tiempo total transcurrido en milisegundos.
   */
  function obtenerTranscurridoMs() {
    if (!estado.corriendo || !estado.inicioTimestampMs) {
      return estado.acumuladoMs;
    }
    return estado.acumuladoMs + Math.max(0, Date.now() - estado.inicioTimestampMs);
  }

  /**
   * Formatea milisegundos en texto digital (HH:MM:SS o MM:SS).
   */
  function formatearTiempoDigital(ms, incluirHorasSiempre = false) {
    const totalSegundos = Math.max(0, Math.floor(ms / 1000));
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    const mStr = String(minutos).padStart(2, "0");
    const sStr = String(segundos).padStart(2, "0");

    if (incluirHorasSiempre || horas > 0) {
      const hStr = String(horas).padStart(2, "0");
      return `${hStr}:${mStr}:${sStr}`;
    }
    return `${mStr}:${sStr}`;
  }

  /**
   * Reproduce un aviso acústico suave usando Web Audio API (sin anuncios ni archivos externos).
   */
  function reproducirSonidoFin() {
    if (!estado.sonidoActivo) return;
    try {
      const AudioCtx = global.AudioContext || global.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notas = [523.25, 659.25, 783.99, 1046.5]; // Do5, Mi5, Sol5, Do6
      notas.forEach((frecuencia, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(frecuencia, ctx.currentTime + idx * 0.16);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + idx * 0.16 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.16 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.16);
        osc.stop(ctx.currentTime + idx * 0.16 + 0.36);
      });
    } catch (_) {
      // Ignorar si el navegador bloquea el audio antes de interacción
    }
  }

  /**
   * Guarda el estado del cronómetro/pomodoro en LocalStorage para sobrevivir recargas.
   */
  function guardarEstadoLocal() {
    try {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(estado));
    } catch (_) {
      // Ignorar errores de cuota
    }
  }

  /**
   * Restaura el estado desde LocalStorage si había una sesión en curso.
   */
  function restaurarEstadoLocal() {
    try {
      const raw = localStorage.getItem(TIMER_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        estado = {
          ...estado,
          ...parsed
        };
      }
    } catch (_) {
      // Ignorar errores de parseo
    }
  }

  /**
   * Aplica fecha, horaInicio y (opcionalmente) horaFin a los inputs del formulario
   * y actualiza la vista previa de duración y XP.
   */
  function sincronizarInputsFormulario({ resaltar = false } = {}) {
    // En fase de descanso del Pomodoro no alteramos las horas de estudio del formulario
    if (estado.modo === "pomodoro" && estado.fasePomodoro === "descanso") {
      return;
    }

    const inputFecha = document.getElementById("fecha");
    const inputInicio = document.getElementById("horaInicio");
    const inputFin = document.getElementById("horaFin");

    if (estado.fechaCapturada && inputFecha) {
      inputFecha.value = estado.fechaCapturada;
    }
    if (estado.horaInicioCapturada && inputInicio) {
      inputInicio.value = estado.horaInicioCapturada;
    }
    if (estado.horaFinCapturada && inputFin) {
      inputFin.value = estado.horaFinCapturada;
    }

    if (StudyTracker.UI && typeof StudyTracker.UI.actualizarPreview === "function") {
      StudyTracker.UI.actualizarPreview();
    }

    if (resaltar) {
      [inputInicio, inputFin].forEach((el) => {
        if (!el) return;
        el.classList.remove("input-captured-flash");
        void el.offsetWidth; // Forzar reflow para reiniciar animación
        el.classList.add("input-captured-flash");
      });
    }
  }

  /**
   * Actualiza todos los elementos visuales del widget de Cronómetro / Pomodoro.
   */
  function renderizarWidget() {
    const displayEl = document.getElementById("timerDisplay");
    const statusTextEl = document.getElementById("timerStatusText");
    const progressFillEl = document.getElementById("timerProgressFill");
    const badgeInicioEl = document.getElementById("timerBadgeInicio");
    const badgeFinEl = document.getElementById("timerBadgeFin");
    const btnStartPause = document.getElementById("btnTimerStartPause");
    const btnFinish = document.getElementById("btnTimerFinish");
    const btnReset = document.getElementById("btnTimerReset");
    const btnMute = document.getElementById("btnTimerMute");
    const pomodoroControls = document.getElementById("pomodoroControls");
    const inputMinutosCustom = document.getElementById("pomodoroCustomMin");
    const timerCard = document.getElementById("timerWidgetCard");

    if (!displayEl) return;

    // 1. Pestañas de modo (Cronómetro vs Pomodoro)
    document.querySelectorAll(".timer-mode-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.mode === estado.modo);
    });

    if (pomodoroControls) {
      pomodoroControls.style.display = estado.modo === "pomodoro" ? "flex" : "none";
    }

    // Presets de Pomodoro activos
    if (estado.modo === "pomodoro") {
      document.querySelectorAll(".pomo-preset-btn").forEach((btn) => {
        const minBtn = Number(btn.dataset.minutes);
        const faseBtn = btn.dataset.phase || "enfoque";
        const activo =
          estado.minutosPomodoro === minBtn && estado.fasePomodoro === faseBtn;
        btn.classList.toggle("active", activo);
      });
      if (inputMinutosCustom && document.activeElement !== inputMinutosCustom) {
        inputMinutosCustom.value = String(estado.minutosPomodoro);
      }
    }

    // 2. Cálculo de tiempo a mostrar y barra de progreso
    const transcurridoMs = obtenerTranscurridoMs();
    let textoReloj = "00:00:00";
    let porcentajeBarra = 0;

    if (estado.modo === "cronometro") {
      textoReloj = formatearTiempoDigital(transcurridoMs, true);
      // En modo cronómetro la barra completa un ciclo visual cada 60 minutos
      porcentajeBarra = Math.min(100, ((transcurridoMs / 1000) % 3600) / 36);
    } else {
      const totalPomodoroMs = estado.minutosPomodoro * 60 * 1000;
      const restanteMs = Math.max(0, totalPomodoroMs - transcurridoMs);
      textoReloj = formatearTiempoDigital(restanteMs, false);
      porcentajeBarra =
        totalPomodoroMs > 0
          ? Math.min(100, (transcurridoMs / totalPomodoroMs) * 100)
          : 0;
    }

    displayEl.textContent = textoReloj;

    if (progressFillEl) {
      progressFillEl.style.width = `${porcentajeBarra.toFixed(1)}%`;
      progressFillEl.classList.toggle(
        "break-mode",
        estado.modo === "pomodoro" && estado.fasePomodoro === "descanso"
      );
    }

    if (timerCard) {
      timerCard.classList.toggle("timer-running", estado.corriendo);
      timerCard.classList.toggle("timer-paused", estado.enPausa);
      timerCard.classList.toggle(
        "timer-break",
        estado.modo === "pomodoro" && estado.fasePomodoro === "descanso"
      );
    }

    // 3. Texto de estado y título de la pestaña del navegador
    if (estado.corriendo) {
      const iconoTitulo =
        estado.modo === "cronometro"
          ? "⏱️"
          : estado.fasePomodoro === "descanso"
          ? "☕"
          : "🍅";
      document.title = `(${textoReloj}) ${iconoTitulo} StudyTracker`;

      if (statusTextEl) {
        if (estado.modo === "cronometro") {
          statusTextEl.textContent = "En curso...";
        } else if (estado.fasePomodoro === "descanso") {
          statusTextEl.textContent = `Descanso en curso (${estado.minutosPomodoro} min)`;
        } else {
          statusTextEl.textContent = `Enfoque en curso (${estado.minutosPomodoro} min)`;
        }
      }
    } else if (estado.enPausa) {
      document.title = `(Pausado ${textoReloj}) StudyTracker`;
      if (statusTextEl) {
        statusTextEl.textContent = "En pausa";
      }
    } else {
      document.title = TITULO_ORIGINAL;
      if (statusTextEl) {
        if (estado.horaInicioCapturada && estado.horaFinCapturada) {
          statusTextEl.textContent = "Horario aplicado al formulario";
        } else if (estado.modo === "cronometro") {
          statusTextEl.textContent = "Listo para iniciar";
        } else if (estado.fasePomodoro === "descanso") {
          statusTextEl.textContent = `Descanso · ${estado.minutosPomodoro} min`;
        } else {
          statusTextEl.textContent = `Enfoque · ${estado.minutosPomodoro} min`;
        }
      }
    }

    // 4. Badges de Hora Inicio y Hora Fin capturadas
    if (badgeInicioEl) {
      badgeInicioEl.textContent = estado.horaInicioCapturada
        ? `🟢 Inicio: ${estado.horaInicioCapturada}`
        : "🟢 Inicio: --:--";
      badgeInicioEl.classList.toggle("captured", Boolean(estado.horaInicioCapturada));
    }
    if (badgeFinEl) {
      badgeFinEl.textContent = estado.horaFinCapturada
        ? `🏁 Fin: ${estado.horaFinCapturada}`
        : estado.corriendo
        ? "🏁 Fin: en curso..."
        : "🏁 Fin: --:--";
      badgeFinEl.classList.toggle("captured", Boolean(estado.horaFinCapturada));
    }

    // 5. Botones de acción
    if (btnStartPause) {
      if (estado.corriendo) {
        btnStartPause.textContent = "⏸️ Pausar";
        btnStartPause.className = "btn timer-btn timer-btn-pause";
      } else if (estado.enPausa) {
        btnStartPause.textContent = "▶️ Reanudar";
        btnStartPause.className = "btn timer-btn timer-btn-start";
      } else {
        btnStartPause.textContent =
          estado.modo === "pomodoro" && estado.fasePomodoro === "descanso"
            ? "▶️ Iniciar Descanso"
            : "▶️ Iniciar Sesión";
        btnStartPause.className = "btn timer-btn timer-btn-start";
      }
    }

    const hayTiempoCorrido = transcurridoMs > 0 || estado.corriendo || estado.enPausa;
    if (btnFinish) {
      btnFinish.disabled = !hayTiempoCorrido;
      btnFinish.title =
        estado.modo === "pomodoro" && estado.fasePomodoro === "descanso"
          ? "Terminar descanso"
          : "Detiene el reloj y registra la Hora de Fin en el formulario";
    }
    if (btnReset) {
      btnReset.disabled = !hayTiempoCorrido && !estado.horaInicioCapturada;
    }

    if (btnMute) {
      btnMute.textContent = estado.sonidoActivo ? "🔔" : "🔕";
      btnMute.title = estado.sonidoActivo
        ? "Sonido al finalizar activo (clic para silenciar)"
        : "Sonido silenciado (clic para activar)";
    }
  }

  /**
   * Ciclo de actualización cada 250ms mientras el reloj está activo.
   */
  function tick() {
    const transcurridoMs = obtenerTranscurridoMs();

    // Si es modo estudio (no descanso), actualizamos en vivo la hora fin proyectada cada minuto
    if (
      estado.corriendo &&
      !(estado.modo === "pomodoro" && estado.fasePomodoro === "descanso")
    ) {
      const horaActual = formatearHoraLocal();
      const inputFin = document.getElementById("horaFin");
      if (inputFin && inputFin.value !== horaActual) {
        inputFin.value = horaActual;
        if (StudyTracker.UI && typeof StudyTracker.UI.actualizarPreview === "function") {
          StudyTracker.UI.actualizarPreview();
        }
      }
    }

    // Verificar si el Pomodoro llegó a 00:00
    if (estado.modo === "pomodoro") {
      const totalPomodoroMs = estado.minutosPomodoro * 60 * 1000;
      if (transcurridoMs >= totalPomodoroMs) {
        reproducirSonidoFin();
        finalizarMedicion({ automaticoPorPomodoro: true });
        return;
      }
    }

    renderizarWidget();
  }

  function asegurarIntervalo() {
    if (intervaloId) clearInterval(intervaloId);
    if (estado.corriendo) {
      intervaloId = setInterval(tick, 250);
    } else {
      intervaloId = null;
    }
  }

  /**
   * Inicia o reanuda la medición del tiempo.
   * Si es un nuevo inicio de estudio, captura automáticamente Fecha y Hora de Inicio.
   */
  function iniciarOReanudar() {
    if (estado.corriendo) {
      // Pausar
      estado.acumuladoMs = obtenerTranscurridoMs();
      estado.inicioTimestampMs = null;
      estado.corriendo = false;
      estado.enPausa = true;
      asegurarIntervalo();
      guardarEstadoLocal();
      renderizarWidget();
      return;
    }

    // Si el usuario estaba editando una sesión antigua en la tabla, salimos del modo edición
    if (
      StudyTracker.UI &&
      typeof StudyTracker.UI.obtenerIdSesionEditando === "function" &&
      StudyTracker.UI.obtenerIdSesionEditando()
    ) {
      StudyTracker.UI.salirModoEdicion();
    }

    const ahora = new Date();
    const esDescanso = estado.modo === "pomodoro" && estado.fasePomodoro === "descanso";

    // Si es el primer arranque de la sesión (no venía de pausa), capturamos Fecha y Hora Inicio
    if (!estado.enPausa && !esDescanso) {
      estado.fechaCapturada = formatearFechaLocal(ahora);
      estado.horaInicioCapturada = formatearHoraLocal(ahora);
      estado.horaFinCapturada = null;
      estado.acumuladoMs = 0;

      // Sincronizar de inmediato con el formulario (Fecha y Hora Inicio)
      const inputFecha = document.getElementById("fecha");
      const inputInicio = document.getElementById("horaInicio");
      const inputFin = document.getElementById("horaFin");

      if (inputFecha) inputFecha.value = estado.fechaCapturada;
      if (inputInicio) {
        inputInicio.value = estado.horaInicioCapturada;
        inputInicio.classList.remove("input-captured-flash");
        void inputInicio.offsetWidth;
        inputInicio.classList.add("input-captured-flash");
      }
      if (inputFin) {
        inputFin.value = estado.horaInicioCapturada;
      }
      if (StudyTracker.UI && typeof StudyTracker.UI.actualizarPreview === "function") {
        StudyTracker.UI.actualizarPreview();
      }
    }

    estado.inicioTimestampMs = Date.now();
    estado.corriendo = true;
    estado.enPausa = false;

    asegurarIntervalo();
    guardarEstadoLocal();
    renderizarWidget();
  }

  /**
   * Finaliza la medición actual y vuelca automáticamente Hora de Inicio y Hora de Fin al formulario.
   */
  function finalizarMedicion({ automaticoPorPomodoro = false } = {}) {
    const transcurridoMs = obtenerTranscurridoMs();
    if (transcurridoMs <= 0 && !estado.corriendo && !estado.enPausa) return;

    estado.acumuladoMs = transcurridoMs;
    estado.inicioTimestampMs = null;
    estado.corriendo = false;
    estado.enPausa = false;
    asegurarIntervalo();

    const esDescanso = estado.modo === "pomodoro" && estado.fasePomodoro === "descanso";

    if (!esDescanso) {
      const ahora = new Date();
      if (!estado.fechaCapturada) {
        estado.fechaCapturada = formatearFechaLocal(ahora);
      }
      if (!estado.horaInicioCapturada) {
        const inicioEstimado = new Date(ahora.getTime() - transcurridoMs);
        estado.horaInicioCapturada = formatearHoraLocal(inicioEstimado);
      }

      let horaFin = formatearHoraLocal(ahora);

      // Si fue un bloque Pomodoro completado o si el reloj corrió y coincide en el mismo minuto (ej. prueba rápida),
      // garantizamos que Hora Fin refleje al menos 1 minuto (o los minutos del Pomodoro si hubo pausas).
      if (automaticoPorPomodoro && estado.modo === "pomodoro") {
        const minReales = StudyTracker.RPG.calcularMinutos(
          estado.horaInicioCapturada,
          horaFin
        );
        if (minReales === 0) {
          horaFin = sumarMinutosAHora(
            estado.horaInicioCapturada,
            estado.minutosPomodoro
          );
        }
      } else if (
        horaFin === estado.horaInicioCapturada &&
        transcurridoMs >= 1000
      ) {
        const minTranscurridos = Math.max(1, Math.round(transcurridoMs / 60000));
        horaFin = sumarMinutosAHora(estado.horaInicioCapturada, minTranscurridos);
      }

      estado.horaFinCapturada = horaFin;
      sincronizarInputsFormulario({ resaltar: true });
    } else {
      // Si terminó un descanso, volvemos a dejar listo el modo enfoque de 25 min
      estado.acumuladoMs = 0;
    }

    guardarEstadoLocal();
    renderizarWidget();
  }

  /**
   * Reinicia el cronómetro/temporizador a cero.
   */
  function reiniciarTimer() {
    estado.corriendo = false;
    estado.enPausa = false;
    estado.inicioTimestampMs = null;
    estado.acumuladoMs = 0;
    estado.horaInicioCapturada = null;
    estado.horaFinCapturada = null;
    estado.fechaCapturada = null;

    asegurarIntervalo();
    guardarEstadoLocal();
    renderizarWidget();
  }

  /**
   * Cambia entre "cronometro" y "pomodoro".
   */
  function cambiarModo(nuevoModo) {
    if (nuevoModo !== "cronometro" && nuevoModo !== "pomodoro") return;
    if (estado.modo === nuevoModo) return;

    // Si estaba corriendo, pausamos o reiniciamos el contador para cambiar de modo limpiamente
    estado.corriendo = false;
    estado.enPausa = false;
    estado.inicioTimestampMs = null;
    estado.acumuladoMs = 0;
    estado.modo = nuevoModo;

    asegurarIntervalo();
    guardarEstadoLocal();
    renderizarWidget();
  }

  /**
   * Selecciona un preset de Pomodoro (ej. 25 min enfoque, 50 min enfoque, 5 min descanso).
   */
  function configurarPomodoro(minutos, fase = "enfoque") {
    const minSeguros = Math.min(180, Math.max(1, Math.round(Number(minutos) || 25)));
    estado.modo = "pomodoro";
    estado.minutosPomodoro = minSeguros;
    estado.fasePomodoro = fase === "descanso" ? "descanso" : "enfoque";
    estado.corriendo = false;
    estado.enPausa = false;
    estado.inicioTimestampMs = null;
    estado.acumuladoMs = 0;

    asegurarIntervalo();
    guardarEstadoLocal();
    renderizarWidget();
  }

  function alternarSonido() {
    estado.sonidoActivo = !estado.sonidoActivo;
    guardarEstadoLocal();
    renderizarWidget();
  }

  /**
   * Se invoca cuando el usuario guarda la sesión en el formulario.
   * Si el cronómetro aún estaba corriendo, captura la hora final antes de guardar;
   * y deja el cronómetro limpio para la siguiente sesión.
   */
  function prepararAntesDeGuardarFormulario() {
    if (estado.corriendo || estado.enPausa) {
      finalizarMedicion();
    }
  }

  function limpiarDespuesDeGuardarFormulario() {
    reiniciarTimer();
  }

  /**
   * Inicializa el widget de Cronómetro y Pomodoro y vincula sus eventos DOM.
   */
  function init() {
    restaurarEstadoLocal();

    // Si había una sesión corriendo o capturada, sincronizar con el formulario
    if (estado.horaInicioCapturada) {
      sincronizarInputsFormulario();
    }

    // Pestañas Cronómetro / Pomodoro
    document.querySelectorAll(".timer-mode-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        cambiarModo(tab.dataset.mode);
      });
    });

    // Presets de Pomodoro (25m, 50m, Descanso 5m, Descanso 15m)
    document.querySelectorAll(".pomo-preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        configurarPomodoro(Number(btn.dataset.minutes), btn.dataset.phase);
      });
    });

    // Input personalizado de minutos para Pomodoro
    const inputCustomMin = document.getElementById("pomodoroCustomMin");
    if (inputCustomMin) {
      inputCustomMin.addEventListener("change", () => {
        configurarPomodoro(Number(inputCustomMin.value), estado.fasePomodoro);
      });
    }

    // Botones principales: Iniciar/Pausar, Terminar, Reiniciar y Sonido
    const btnStartPause = document.getElementById("btnTimerStartPause");
    const btnFinish = document.getElementById("btnTimerFinish");
    const btnReset = document.getElementById("btnTimerReset");
    const btnMute = document.getElementById("btnTimerMute");

    if (btnStartPause) {
      btnStartPause.addEventListener("click", iniciarOReanudar);
    }
    if (btnFinish) {
      btnFinish.addEventListener("click", () => finalizarMedicion());
    }
    if (btnReset) {
      btnReset.addEventListener("click", reiniciarTimer);
    }
    if (btnMute) {
      btnMute.addEventListener("click", alternarSonido);
    }

    asegurarIntervalo();
    renderizarWidget();
  }

  StudyTracker.Timer = {
    init,
    iniciarOReanudar,
    finalizarMedicion,
    reiniciarTimer,
    cambiarModo,
    configurarPomodoro,
    prepararAntesDeGuardarFormulario,
    limpiarDespuesDeGuardarFormulario,
    formatearFechaLocal,
    formatearHoraLocal
  };
})(window);

