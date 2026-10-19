/**
 * Capa de Dominio: Reglas de negocio puras del sistema RPG y analítica de estudio.
 * No tiene dependencias del DOM ni de almacenamiento externo.
 */
(function (global) {
  const StudyTracker = (global.StudyTracker = global.StudyTracker || {});

  const XP_POR_NIVEL = 500;

  const RANGOS = [
    "Novato del Enfoque",
    "Explorador de Datos",
    "Guerrero Pomodoro",
    "Maestro de la Concentración",
    "Señor del Flujo Profundo"
  ];

  const TEXTOS_CALIDAD = {
    1: "Distraído todo el tiempo, procrastinación constante, baja retención.",
    2: "Costó mucho mantener el foco, interrupciones frecuentes.",
    3: "Sesión estándar: se avanzó lo planeado con distracciones menores.",
    4: "Buen ritmo de trabajo, comprensión sólida y pocas distracciones.",
    5: "Concentración profunda (flujo total), el tiempo pasó volando."
  };

  /**
   * Calcula la diferencia en minutos entre dos horas (HH:MM), soportando cruce de medianoche.
   */
  function calcularMinutos(horaInicio, horaFin) {
    if (!horaInicio || !horaFin) return 0;
    const partesInicio = String(horaInicio).split(":").map(Number);
    const partesFin = String(horaFin).split(":").map(Number);
    if (partesInicio.length < 2 || partesFin.length < 2) return 0;

    const [h1, m1] = partesInicio;
    const [h2, m2] = partesFin;
    if (Number.isNaN(h1) || Number.isNaN(m1) || Number.isNaN(h2) || Number.isNaN(m2)) {
      return 0;
    }

    let diff = h2 * 60 + m2 - (h1 * 60 + m1);
    if (diff < 0) diff += 1440; // Cruce de medianoche
    return diff;
  }

  /**
   * Calcula los puntos de experiencia (XP) en función de la duración y la calidad (1-5).
   */
  function calcularXP(minutos, calidad) {
    const min = Math.max(0, Number(minutos) || 0);
    const cal = Math.min(5, Math.max(1, Number(calidad) || 3));
    return Math.round(min * (1 + cal * 0.2));
  }

  /**
   * Calcula el estado de progreso RPG a partir del XP total acumulado.
   */
  function calcularProgresoRPG(totalXP) {
    const xpSeguro = Math.max(0, Number(totalXP) || 0);
    const nivel = Math.floor(xpSeguro / XP_POR_NIVEL) + 1;
    const xpEnNivelActual = xpSeguro % XP_POR_NIVEL;
    const porcentajeBarra = Math.min(100, (xpEnNivelActual / XP_POR_NIVEL) * 100);
    const rango = RANGOS[Math.min(nivel - 1, RANGOS.length - 1)];

    return {
      nivel,
      rango,
      xpEnNivelActual,
      xpSiguienteNivel: XP_POR_NIVEL,
      porcentajeBarra,
      totalXP: xpSeguro
    };
  }

  /**
   * Calcula los indicadores clave de rendimiento (KPIs) de una lista de sesiones.
   */
  function calcularKPIs(sesiones) {
    const lista = Array.isArray(sesiones) ? sesiones : [];
    const totalSesiones = lista.length;
    const totalMinutos = lista.reduce((acc, s) => acc + (Number(s.duracion) || 0), 0);
    const totalHoras = (totalMinutos / 60).toFixed(1);
    const totalXP = lista.reduce((acc, s) => acc + (Number(s.xp) || 0), 0);
    const promedioMinutos = totalSesiones ? Math.round(totalMinutos / totalSesiones) : 0;
    const promedioCalidad = totalSesiones
      ? (lista.reduce((acc, s) => acc + (Number(s.calidad) || 0), 0) / totalSesiones).toFixed(1)
      : "0.0";
    const promedioIA = totalSesiones
      ? Math.round(lista.reduce((acc, s) => acc + (Number(s.usoIA) || 0), 0) / totalSesiones)
      : 0;

    return {
      totalSesiones,
      totalMinutos,
      totalHoras,
      totalXP,
      promedioMinutos,
      promedioCalidad,
      promedioIA
    };
  }

  /**
   * Agrupa las sesiones por hora de inicio (HH:00) y determina la hora pico de concentración.
   */
  function analizarPorHora(sesiones) {
    const mapaHoras = {};
    (Array.isArray(sesiones) ? sesiones : []).forEach((s) => {
      if (!s.horaInicio) return;
      const horaStr = String(s.horaInicio).slice(0, 2) + ":00";
      if (!mapaHoras[horaStr]) {
        mapaHoras[horaStr] = { minutos: 0, sumaCalidad: 0, conteo: 0 };
      }
      mapaHoras[horaStr].minutos += Number(s.duracion) || 0;
      mapaHoras[horaStr].sumaCalidad += Number(s.calidad) || 0;
      mapaHoras[horaStr].conteo += 1;
    });

    const horasOrdenadas = Object.keys(mapaHoras).sort();
    const minutosPorHora = horasOrdenadas.map((h) => mapaHoras[h].minutos);
    const calidadPorHora = horasOrdenadas.map(
      (h) => +(mapaHoras[h].sumaCalidad / mapaHoras[h].conteo).toFixed(2)
    );

    let mejorHora = null;
    let mejorCalidad = 0;
    horasOrdenadas.forEach((h) => {
      const prom = mapaHoras[h].sumaCalidad / mapaHoras[h].conteo;
      if (prom >= mejorCalidad) {
        mejorCalidad = prom;
        mejorHora = h;
      }
    });

    return {
      horasOrdenadas,
      minutosPorHora,
      calidadPorHora,
      mejorHora,
      mejorCalidad: mejorHora ? +mejorCalidad.toFixed(1) : null
    };
  }

  /**
   * Agrupa las sesiones por materia calculando minutos acumulados y % promedio de uso de IA.
   */
  function analizarPorMateria(sesiones) {
    const mapaMaterias = {};
    (Array.isArray(sesiones) ? sesiones : []).forEach((s) => {
      const mat = (s.materia || "General").trim() || "General";
      if (!mapaMaterias[mat]) {
        mapaMaterias[mat] = { minutos: 0, sumaIA: 0, conteo: 0 };
      }
      mapaMaterias[mat].minutos += Number(s.duracion) || 0;
      mapaMaterias[mat].sumaIA += Number(s.usoIA) || 0;
      mapaMaterias[mat].conteo += 1;
    });

    const materiasLabels = Object.keys(mapaMaterias);
    const minutosMateria = materiasLabels.map((m) => mapaMaterias[m].minutos);
    const iaMateria = materiasLabels.map((m) =>
      Math.round(mapaMaterias[m].sumaIA / mapaMaterias[m].conteo)
    );

    return {
      materiasLabels,
      minutosMateria,
      iaMateria
    };
  }

  /**
   * Devuelve el texto explicativo para un nivel de calidad (1 al 5).
   */
  function obtenerTextoAyudaCalidad(calidad) {
    return TEXTOS_CALIDAD[Number(calidad)] || TEXTOS_CALIDAD[3];
  }

  /**
   * Devuelve el texto explicativo según el porcentaje de uso de IA (0 a 100).
   */
  function obtenerTextoAyudaIA(usoIA) {
    const val = Number(usoIA) || 0;
    if (val === 0) {
      return "Estudio 100% autónomo: lectura, código o ejercicios sin asistencia.";
    }
    if (val <= 50) {
      return "Modo híbrido: estudio propio usando IA para aclarar dudas puntuales o depurar errores.";
    }
    return "Dependencia alta: la IA resolvió la mayor parte del ejercicio o generó la respuesta.";
  }

  StudyTracker.RPG = {
    XP_POR_NIVEL,
    RANGOS,
    calcularMinutos,
    calcularXP,
    calcularProgresoRPG,
    calcularKPIs,
    analizarPorHora,
    analizarPorMateria,
    obtenerTextoAyudaCalidad,
    obtenerTextoAyudaIA
  };
})(window);

