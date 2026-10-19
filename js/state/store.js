/**
 * Capa de Estado (Store): Gestión centralizada de sesiones, IDs únicos,
 * validación de esquema, persistencia en LocalStorage y patrón Pub/Sub.
 */
(function (global) {
  const StudyTracker = (global.StudyTracker = global.StudyTracker || {});
  const { calcularMinutos, calcularXP } = StudyTracker.RPG;

  const STORAGE_KEY = "study_tracker_sesiones";

  // Datos iniciales de ejemplo cuando no existe historial previo en LocalStorage
  const DATOS_INICIALES = [
    {
      fecha: "2026-10-18",
      horaInicio: "10:00",
      horaFin: "11:30",
      materia: "Base de Datos",
      duracion: 90,
      calidad: 4,
      usoIA: 25,
      xp: 162,
      notas: "Repaso de normalización"
    },
    {
      fecha: "2026-10-18",
      horaInicio: "14:00",
      horaFin: "16:15",
      materia: "PySpark",
      duracion: 135,
      calidad: 5,
      usoIA: 50,
      xp: 270,
      notas: "Práctica de DataFrames"
    },
    {
      fecha: "2026-10-18",
      horaInicio: "18:00",
      horaFin: "18:45",
      materia: "Repaso general",
      duracion: 45,
      calidad: 3,
      usoIA: 0,
      xp: 72,
      notas: "Lectura de apuntes"
    }
  ];

  /**
   * Genera un identificador único para cada sesión (compatible con contextos file:// y https://).
   */
  function generarId() {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return global.crypto.randomUUID();
    }
    return "ses_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
  }

  /**
   * Normaliza y garantiza la integridad de una sesión de estudio.
   */
  function normalizarSesion(raw) {
    const fecha = String(raw.fecha || "").slice(0, 10);
    const horaInicio = String(raw.horaInicio || "").slice(0, 5);
    const horaFin = String(raw.horaFin || "").slice(0, 5);
    const materia = String(raw.materia || "General").trim() || "General";
    const calidad = Math.min(5, Math.max(1, Number(raw.calidad) || 3));

    let usoIA = raw.usoIA !== undefined ? Number(raw.usoIA) : 0;
    if (Number.isNaN(usoIA)) usoIA = 0;
    usoIA = Math.min(100, Math.max(0, Math.round(usoIA)));

    const duracionCalculada = calcularMinutos(horaInicio, horaFin);
    const duracion =
      raw.duracion !== undefined && Number(raw.duracion) > 0
        ? Number(raw.duracion)
        : duracionCalculada;

    const xp =
      raw.xp !== undefined && Number(raw.xp) > 0
        ? Number(raw.xp)
        : calcularXP(duracion, calidad);

    return {
      id: raw.id ? String(raw.id) : generarId(),
      fecha,
      horaInicio,
      horaFin,
      materia,
      duracion,
      calidad,
      usoIA,
      xp,
      notas: String(raw.notas || "").trim()
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
     * Registra un oyente que se ejecutará cada vez que cambie el estado.
     */
    subscribe(listener) {
      if (typeof listener === "function") {
        this._listeners.add(listener);
      }
      return () => this._listeners.delete(listener);
    }

    /**
     * Agrega una nueva sesión calculando automáticamente su duración, XP e ID único.
     */
    agregarSesion(datosFormulario) {
      const duracion = calcularMinutos(datosFormulario.horaInicio, datosFormulario.horaFin);
      const calidad = Number(datosFormulario.calidad) || 3;
      const xp = calcularXP(duracion, calidad);

      const nueva = normalizarSesion({
        ...datosFormulario,
        duracion,
        calidad,
        xp
      });

      this._sesiones.push(nueva);
      this._persistir();
      this._notificar({ origen: "agregar", sesion: nueva });
      return nueva;
    }

    /**
     * Elimina una sesión de forma segura usando su ID único (evita errores al filtrar/ordenar).
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
     * Reemplaza toda la colección de sesiones (por ejemplo, al importar desde un Excel).
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
        console.error("No se pudo guardar en LocalStorage:", err);
      }
    }

    _notificar(meta = {}) {
      const snapshot = this.getSesiones();
      this._listeners.forEach((listener) => {
        try {
          listener(snapshot, meta);
        } catch (err) {
          console.error("Error en suscriptor del Store:", err);
        }
      });
    }
  }

  StudyTracker.store = new StudyStore();
  StudyTracker.normalizarSesion = normalizarSesion;
})(window);

