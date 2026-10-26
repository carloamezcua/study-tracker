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
      objetivoCumplido: "Sí",
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
      objetivoCumplido: "Sí",
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
      objetivoCumplido: "Parcial",
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
   * migrando nombres antiguos e inyectando campos automáticos (diaSemana y franjaHoraria).
   */
  function normalizarSesion(raw) {
    const fecha = String(raw.fecha || "").slice(0, 10);
    const horaInicio = String(raw.horaInicio || "").slice(0, 5);
    const horaFin = String(raw.horaFin || "").slice(0, 5);
    const materia = String(raw.materia || "General").trim() || "General";
    const calidad = Math.min(5, Math.max(1, Number(raw.calidad) || 3));

    const ctxCandidato = MAPA_MIGRACION_CONTEXTO[raw.contexto] || raw.contexto;
    const contexto = VALORES_CONTEXTO.has(ctxCandidato) ? ctxCandidato : "Académico";

    const tipoActividad = migrarTipoActividad(raw.tipoActividad);

    let usoIA = raw.usoIA !== undefined ? Number(raw.usoIA) : 0;
    if (Number.isNaN(usoIA)) usoIA = 0;
    usoIA = Math.min(100, Math.max(0, Math.round(usoIA)));

    const dinamicaCognitiva = migrarDinamicaCognitiva(
      raw.dinamicaCognitiva,
      raw.produccion,
      raw.modoIA,
      usoIA
    );

    const dominioPrevio = migrarDominioPrevio(
      raw.dominioPrevio || raw.familiaridad,
      tipoActividad
    );

    const energiaPrevia = VALORES_ENERGIA.has(raw.energiaPrevia)
      ? raw.energiaPrevia
      : "Media";

    const complejidad = VALORES_COMPLEJIDAD.has(raw.complejidad)
      ? raw.complejidad
      : "Desafiante";

    const objetivoCumplido = VALORES_OBJETIVO.has(raw.objetivoCumplido)
      ? raw.objetivoCumplido
      : "Sí";

    const notasUnificadas = formatearNotasConTema(raw.notas || "", raw.tema || "");
    const { subtema } = extraerSubtemaDeNotas(notasUnificadas, raw.tema || "");

    const duracionCalculada = calcularMinutos(horaInicio, horaFin);
    const duracion =
      raw.duracion !== undefined && Number(raw.duracion) > 0 && !raw.recalcularDuracion
        ? Number(raw.duracion)
        : duracionCalculada;

    const xp = calcularXP(
      duracion,
      calidad,
      complejidad,
      objetivoCumplido,
      dinamicaCognitiva,
      usoIA
    );

    return {
      id: raw.id ? String(raw.id) : generarId(),
      fecha,
      diaSemana: calcularDiaSemana(fecha),
      horaInicio,
      horaFin,
      franjaHoraria: calcularFranjaHoraria(horaInicio),
      contexto,
      materia,
      tema: subtema,
      tipoActividad,
      dinamicaCognitiva,
      produccion: dinamicaCognitiva, // Alias retrocompatible
      modoIA: dinamicaCognitiva, // Alias retrocompatible
      dominioPrevio,
      energiaPrevia,
      complejidad,
      objetivoCumplido,
      duracion,
      calidad,
      usoIA,
      xp,
      notas: notasUnificadas
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
})(window);
