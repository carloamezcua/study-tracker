/**
 * Capa de Estado (Store): Gestión centralizada de sesiones (CRUD completo),
 * IDs únicos, validación y migración de esquema a v3 (18 columnas), enriquecimiento automático,
 * persistencia en LocalStorage y patrón Pub/Sub.
 */
(function (global) {
  const StudyTracker = (global.StudyTracker = global.StudyTracker || {});
  const {
    CONTEXTOS,
    NIVELES_ENERGIA,
    NIVELES_COMPLEJIDAD,
    ESTADOS_OBJETIVO,
    migrarTipoActividad,
    migrarDominioPrevio,
    migrarDinamicaCognitiva,
    migrarEstadoObjetivo,
    formatearNotasConTema,
    extraerSubtemaDeNotas,
    calcularMinutos,
    calcularDiaSemana,
    calcularFranjaHoraria,
    calcularXP
  } = StudyTracker.RPG;

  const STORAGE_KEY = "study_tracker_sesiones";

  const VALORES_CONTEXTO = new Set(CONTEXTOS.map((c) => c.valor));
  const VALORES_ENERGIA = new Set(NIVELES_ENERGIA.map((e) => e.valor));
  const VALORES_COMPLEJIDAD = new Set(NIVELES_COMPLEJIDAD.map((c) => c.valor));
  const VALORES_OBJETIVO = new Set(ESTADOS_OBJETIVO.map((o) => o.valor));

  const MAPA_MIGRACION_CONTEXTO = {
    Escuela: "Académico",
    Personal: "Proyecto Propio"
  };

  // Datos iniciales de ejemplo cuando no existe historial previo en LocalStorage ni en CSV
  const DATOS_INICIALES = [
    {
      fecha: "2026-10-18",
      horaInicio: "10:00",
      horaFin: "11:30",
      contexto: "Académico",
      materia: "Base de Datos",
      tipoActividad: "Síntesis / Documentación",
      dinamicaCognitiva: "Andamiaje / Co-creación",
      usoIA: 25,
      dominioPrevio: "En construcción",
      energiaPrevia: "Alta",
      complejidad: "Desafiante",
      objetivoCumplido: "Flujo limpio",
      duracion: 90,
      calidad: 4,
      notas: "[Normalización 3FN y Modelo ER] Diseño de modelo entidad-relación y debate de reglas 3FN"
    },
    {
      fecha: "2026-10-18",
      horaInicio: "14:00",
      horaFin: "16:15",
      contexto: "Certificación",
      materia: "Snowflake",
      tipoActividad: "Estudio Teórico / Conceptual",
      dinamicaCognitiva: "Andamiaje / Co-creación",
      usoIA: 30,
      dominioPrevio: "Nuevo",
      energiaPrevia: "Media",
      complejidad: "Muy difícil",
      objetivoCumplido: "Flujo limpio",
      duracion: 135,
      calidad: 5,
      notas: "[Arquitectura de Virtual Warehouses] Estudio para certificación SnowPro Core reforzando conceptos con preguntas"
    },
    {
      fecha: "2026-10-18",
      horaInicio: "18:00",
      horaFin: "18:45",
      contexto: "Externo",
      materia: "Proyecto Rails",
      tipoActividad: "Desarrollo / Código",
      dinamicaCognitiva: "Andamiaje / Co-creación",
      usoIA: 50,
      dominioPrevio: "En construcción",
      energiaPrevia: "Baja",
      complejidad: "Desafiante",
      objetivoCumplido: "Con fricción",
      duracion: 45,
      calidad: 3,
      notas: "[Rutas y Controladores MVC] Configuración inicial de endpoints para proyecto en equipo"
    }
  ];

  /**
   * Genera un identificador único para cada sesión (compatible con contextos file:// y http://).
   */
  function generarId() {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return global.crypto.randomUUID();
    }
    return "ses_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
  }

  /**
   * Normaliza y garantiza la integridad de una sesión de estudio,
   * migrando nombres antiguos, inyectando campos automáticos (diaSemana y franjaHoraria)
   * y soportando las 4 nuevas variables del Puente v3.2 -> v4.0.
   */
  function normalizarSesion(raw) {
    const fecha = String(raw.fecha || raw.Fecha || "").slice(0, 10);
    const horaInicio = String(raw.horaInicio || raw.Hora_Inicio || "").slice(0, 5);
    const horaFin = String(raw.horaFin || raw.Hora_Fin || "").slice(0, 5);
    const materia = String(raw.materia || raw.Materia || "General").trim() || "General";
    // Calidad FSRS 1 a 4 (topado en 4 si viene 5 de sesiones históricas)
    const calidad = Math.min(4, Math.max(1, Number(raw.calidad || raw.Calidad) || 3));

    const rawCtx = raw.contexto || raw.Contexto;
    const ctxCandidato = MAPA_MIGRACION_CONTEXTO[rawCtx] || rawCtx;
    const contexto = VALORES_CONTEXTO.has(ctxCandidato) ? ctxCandidato : (rawCtx || "General");

    const tipoActividad = migrarTipoActividad(raw.tipoActividad || raw.Tipo_Actividad);

    let usoIA = raw.usoIA !== undefined ? raw.usoIA : (raw.Uso_IA_Porcentaje !== undefined ? raw.Uso_IA_Porcentaje : 0);
    usoIA = Number(usoIA);
    if (Number.isNaN(usoIA)) usoIA = 0;
    usoIA = Math.min(100, Math.max(0, Math.round(usoIA)));

    const dinamicaCognitiva = migrarDinamicaCognitiva(
      raw.dinamicaCognitiva || raw.Dinamica_Cognitiva,
      raw.produccion || raw.Produccion_Propia,
      raw.modoIA || raw.Modo_IA,
      usoIA
    );

    const dominioPrevio = migrarDominioPrevio(
      raw.dominioPrevio || raw.Dominio_Previo || raw.familiaridad,
      tipoActividad
    );

    // Fallbacks para campos ocultos en la UI
    const rawEnergia = raw.energiaPrevia !== undefined ? raw.energiaPrevia : raw.Energia_Previa;
    let energiaPrevia = "Media";
    if (VALORES_ENERGIA.has(rawEnergia)) {
      energiaPrevia = rawEnergia;
    } else if (rawEnergia === 1 || rawEnergia === "1" || rawEnergia === "Baja") {
      energiaPrevia = "Baja";
    } else if (rawEnergia === 2 || rawEnergia === "2" || rawEnergia === 3 || rawEnergia === "3" || rawEnergia === "Media") {
      energiaPrevia = "Media";
    } else if (rawEnergia === "Alta") {
      energiaPrevia = "Alta";
    }

    const rawComplejidad = raw.complejidad !== undefined ? raw.complejidad : raw.Complejidad;
    let complejidad = "Desafiante";
    if (VALORES_COMPLEJIDAD.has(rawComplejidad)) {
      complejidad = rawComplejidad;
    } else if (rawComplejidad === 1 || rawComplejidad === "1" || rawComplejidad === "Fácil") {
      complejidad = "Fácil";
    } else if (rawComplejidad === 2 || rawComplejidad === "2" || rawComplejidad === 3 || rawComplejidad === "3" || rawComplejidad === "Desafiante") {
      complejidad = "Desafiante";
    } else if (rawComplejidad === "Muy difícil") {
      complejidad = "Muy difícil";
    }

    const objetivoCumplido = migrarEstadoObjetivo(raw.objetivoCumplido || raw.Objetivo_Cumplido);

    const notasUnificadas = formatearNotasConTema(raw.notas || raw.Notas || "", raw.tema || raw.Tema || "");
    const { subtema } = extraerSubtemaDeNotas(notasUnificadas, raw.tema || raw.Tema || "");

    const duracionCalculada = calcularMinutos(horaInicio, horaFin);
    const duracion =
      (raw.duracion !== undefined && Number(raw.duracion) > 0 && !raw.recalcularDuracion)
        ? Number(raw.duracion)
        : ((raw.Duracion_Minutos !== undefined && Number(raw.Duracion_Minutos) > 0)
          ? Number(raw.Duracion_Minutos)
          : duracionCalculada);

    // --- 4 Propiedades Nuevas (Puente v3.2 -> v4.0) ---
    const estructuraPractica = raw.Estructura_Practica || raw.estructuraPractica || "Bloqueado";
    const modoDisenoIA = raw.Modo_Diseno_IA || raw.modoDisenoIA || raw.modoDisenoIa || "Sin_IA";
    const modalidadProcesamiento =
      raw.Modalidad_Procesamiento_Efectiva ||
      raw.modalidadProcesamiento ||
      raw.modalidadProcesamientoEfectiva ||
      "Extraccion_Esforzada";
    const friccionIntercalada =
      estructuraPractica === "Intercalado"
        ? (raw.Friccion_Discriminacion_Intercalada ||
           raw.friccionIntercalada ||
           raw.friccionDiscriminacionIntercalada ||
           "Sin_Friccion")
        : "";

    const xp = calcularXP(
      duracion,
      calidad,
      complejidad,
      objetivoCumplido,
      dinamicaCognitiva,
      usoIA,
      friccionIntercalada
    );

    return {
      id: raw.id ? String(raw.id) : generarId(),
      fecha,
      Fecha: fecha,
      diaSemana: calcularDiaSemana(fecha),
      Dia_Semana: calcularDiaSemana(fecha),
      horaInicio,
      Hora_Inicio: horaInicio,
      horaFin,
      Hora_Fin: horaFin,
      franjaHoraria: calcularFranjaHoraria(horaInicio),
      Franja_Horaria: calcularFranjaHoraria(horaInicio),
      contexto,
      Contexto: raw.Contexto || contexto || "General",
      materia,
      Materia: materia,
      tema: subtema,
      tipoActividad,
      Tipo_Actividad: tipoActividad,
      dinamicaCognitiva,
      Dinamica_Cognitiva: dinamicaCognitiva,
      produccion: dinamicaCognitiva, // Alias retrocompatible
      modoIA: dinamicaCognitiva, // Alias retrocompatible
      dominioPrevio,
      Dominio_Previo: dominioPrevio,
      energiaPrevia,
      Energia_Previa: Number(raw.Energia_Previa) || 3,
      complejidad,
      Complejidad: Number(raw.Complejidad) || 3,
      objetivoCumplido,
      Objetivo_Cumplido: objetivoCumplido,
      duracion,
      Duracion_Minutos: duracion,
      calidad,
      Calidad: calidad,
      usoIA,
      Uso_IA_Porcentaje: usoIA,
      xp,
      XP_Ganados: xp,
      notas: notasUnificadas,
      Notas: notasUnificadas,
      // Columnas 19-22
      Estructura_Practica: estructuraPractica,
      Modo_Diseno_IA: modoDisenoIA,
      Modalidad_Procesamiento_Efectiva: modalidadProcesamiento,
      Friccion_Discriminacion_Intercalada: friccionIntercalada,
      estructuraPractica,
      modoDisenoIA,
      modoDisenoIa: modoDisenoIA,
      modalidadProcesamiento,
      modalidadProcesamientoEfectiva: modalidadProcesamiento,
      friccionIntercalada,
      friccionDiscriminacionIntercalada: friccionIntercalada
    };
  }

  class StudyStore {
    constructor() {
      this._sesiones = [];
      this._listeners = new Set();
    }

    /**
     * Inicializa el Store leyendo desde LocalStorage o cargando los datos semilla.
     */
    init() {
      try {
        const guardado = localStorage.getItem(STORAGE_KEY);
        if (guardado) {
          const parsed = JSON.parse(guardado);
          if (Array.isArray(parsed)) {
            this._sesiones = parsed.map(normalizarSesion);
            this._persistir();
            this._notificar({ origen: "init" });
            return;
          }
        }
      } catch (err) {
        console.warn("Error leyendo LocalStorage, usando datos iniciales:", err);
      }

      this._sesiones = DATOS_INICIALES.map(normalizarSesion);
      this._persistir();
      this._notificar({ origen: "init" });
    }

    /**
     * Devuelve una copia inmutable de las sesiones actuales.
     */
    getSesiones() {
      return this._sesiones.map((s) => ({ ...s }));
    }

    obtenerSesiones() {
      return this.getSesiones();
    }

    /**
     * Busca y devuelve una sesión por su ID único.
     */
    obtenerSesionPorId(id) {
      const encontrada = this._sesiones.find((s) => s.id === id);
      return encontrada ? { ...encontrada } : null;
    }

    /**
     * Registra un oyente que se ejecutará cada vez que cambie el estado.
     */
    subscribe(listener) {
      if (typeof listener === "function") {
        this._listeners.add(listener);
      }
      return () => this._listeners.delete(listener);
    }

    /**
     * Agrega una nueva sesión calculando automáticamente su duración, día, franja, XP e ID único.
     */
    agregarSesion(datosFormulario) {
      const nueva = normalizarSesion({ ...datosFormulario, recalcularDuracion: true });
      this._sesiones.push(nueva);
      this._persistir();
      this._notificar({ origen: "agregar", sesion: nueva });
      return nueva;
    }

    // Alias en inglés para compatibilidad
    addSession(datosFormulario) {
      return this.agregarSesion(datosFormulario);
    }

    /**
     * Actualiza una sesión existente por su ID único y recalcula su duración, día, franja y XP.
     */
    actualizarSesionPorId(id, datosActualizados) {
      const idx = this._sesiones.findIndex((s) => s.id === id);
      if (idx === -1) return null;

      // Si se edita notas directamente sin campo tema explícito, no arrastrar el tema antiguo si ya está en notas
      const copiaBase = { ...this._sesiones[idx] };
      if (datosActualizados.notas !== undefined && datosActualizados.tema === undefined) {
        delete copiaBase.tema;
      }

      const actualizada = normalizarSesion({
        ...copiaBase,
        ...datosActualizados,
        id,
        recalcularDuracion: true
      });

      this._sesiones[idx] = actualizada;
      this._persistir();
      this._notificar({ origen: "editar", sesion: actualizada, id });
      return actualizada;
    }

    // Alias en inglés para compatibilidad
    updateSession(id, datosActualizados) {
      return this.actualizarSesionPorId(id, datosActualizados);
    }

    /**
     * Elimina una sesión de forma segura usando su ID único.
     */
    eliminarSesionPorId(id) {
      const longitudAnterior = this._sesiones.length;
      this._sesiones = this._sesiones.filter((s) => s.id !== id);
      if (this._sesiones.length !== longitudAnterior) {
        this._persistir();
        this._notificar({ origen: "eliminar", id });
      }
    }

    /**
     * Reemplaza toda la colección de sesiones (por ejemplo, al cargar desde el servidor o importar CSV).
     */
    reemplazarSesiones(nuevasSesiones, origen = "importar") {
      this._sesiones = (Array.isArray(nuevasSesiones) ? nuevasSesiones : []).map(normalizarSesion);
      this._persistir();
      this._notificar({ origen });
    }

    cargarSesiones(nuevasSesiones, origen = "importar") {
      return this.reemplazarSesiones(nuevasSesiones, origen);
    }

    /**
     * Vacía todas las sesiones registradas.
     */
    vaciarSesiones() {
      this._sesiones = [];
      this._persistir();
      this._notificar({ origen: "vaciar" });
    }

    _persistir() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._sesiones));
      } catch (err) {
        console.warn("No se pudo guardar en LocalStorage:", err);
      }
    }

    _notificar(evento = {}) {
      const copia = this.getSesiones();
      this._listeners.forEach((fn) => fn(copia, evento));
    }
  }

  StudyTracker.store = new StudyStore();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = StudyTracker.store;
  }
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));
