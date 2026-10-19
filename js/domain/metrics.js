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

  const CONTEXTOS = [
    { valor: "Escuela", icono: "🎓", etiqueta: "Escuela" },
    { valor: "Personal", icono: "🚀", etiqueta: "Personal" },
    { valor: "Externo", icono: "🤝", etiqueta: "Externo" }
  ];

  const TIPOS_ACTIVIDAD = [
    { valor: "Código / Práctica", icono: "💻", etiqueta: "Código / Práctica" },
    { valor: "Lectura / Teoría", icono: "📖", etiqueta: "Lectura / Teoría" },
    { valor: "Papel / A mano", icono: "✍️", etiqueta: "Papel / A mano" },
    { valor: "Repaso", icono: "🔁", etiqueta: "Repaso" }
  ];

  const NIVELES_ENERGIA = [
    { valor: "Alta", icono: "🔋", etiqueta: "Alta" },
    { valor: "Media", icono: "⚡", etiqueta: "Media" },
    { valor: "Baja", icono: "🪫", etiqueta: "Baja" }
  ];

  const NIVELES_COMPLEJIDAD = [
    { valor: "Fácil", icono: "🟢", etiqueta: "Fácil", bonoXP: 0 },
    { valor: "Desafiante", icono: "🟡", etiqueta: "Desafiante", bonoXP: 0.1 },
    { valor: "Muy difícil", icono: "🔴", etiqueta: "Muy difícil", bonoXP: 0.2 }
  ];

  const ESTADOS_OBJETIVO = [
    { valor: "Sí", icono: "✅", etiqueta: "Sí", bonoXP: 0.1 },
    { valor: "Parcial", icono: "⚠️", etiqueta: "Parcial", bonoXP: 0 },
    { valor: "No", icono: "❌", etiqueta: "No", bonoXP: 0 }
  ];

  const DIAS_SEMANA = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado"
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
   * Calcula automáticamente el nombre del día de la semana a partir de una fecha YYYY-MM-DD.
   */
  function calcularDiaSemana(fechaStr) {
    if (!fechaStr) return "Sin fecha";
    const partes = String(fechaStr).slice(0, 10).split("-").map(Number);
    if (partes.length !== 3 || partes.some(Number.isNaN)) return "Sin fecha";
    const fechaLocal = new Date(partes[0], partes[1] - 1, partes[2]);
    return DIAS_SEMANA[fechaLocal.getDay()] || "Sin fecha";
  }

  /**
   * Clasifica la hora de inicio (HH:MM) en su franja biológica del día.
   */
  function calcularFranjaHoraria(horaInicio) {
    if (!horaInicio) return "Mañana";
    const hora = Number(String(horaInicio).split(":")[0]);
    if (Number.isNaN(hora)) return "Mañana";
    if (hora >= 4 && hora < 8) return "Madrugada";
    if (hora >= 8 && hora < 13) return "Mañana";
    if (hora >= 13 && hora < 19) return "Tarde";
    return "Noche";
  }

  /**
   * Devuelve el bono multiplicador por complejidad del tema (0, 0.10 o 0.20).
   */
  function obtenerBonoComplejidad(complejidad) {
    const item = NIVELES_COMPLEJIDAD.find((c) => c.valor === complejidad);
    return item ? item.bonoXP : 0;
  }

  /**
   * Devuelve el bono multiplicador por cumplimiento de objetivo (0.10 si es "Sí", 0 en otro caso).
   */
  function obtenerBonoObjetivo(objetivoCumplido) {
    const item = ESTADOS_OBJETIVO.find((o) => o.valor === objetivoCumplido);
    return item ? item.bonoXP : 0;
  }

  /**
   * Calcula los puntos de experiencia (XP) en función de duración, calidad (1-5),
   * complejidad percibida (+10% desafiante, +20% muy difícil) y objetivo cumplido (+10%).
   */
  function calcularXP(minutos, calidad, complejidad = "Fácil", objetivoCumplido = "No") {
    const min = Math.max(0, Number(minutos) || 0);
    const cal = Math.min(5, Math.max(1, Number(calidad) || 3));
    const bonoComp = obtenerBonoComplejidad(complejidad);
    const bonoObj = obtenerBonoObjetivo(objetivoCumplido);
    const multiplicador = 1 + cal * 0.2 + bonoComp + bonoObj;
    return Math.round(min * multiplicador);
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

    const cumplidosSi = lista.filter((s) => s.objetivoCumplido === "Sí").length;
    const cumplidosParcial = lista.filter((s) => s.objetivoCumplido === "Parcial").length;
    const tasaObjetivos = totalSesiones ? Math.round((cumplidosSi / totalSesiones) * 100) : 0;

    return {
      totalSesiones,
      totalMinutos,
      totalHoras,
      totalXP,
      promedioMinutos,
      promedioCalidad,
      promedioIA,
      cumplidosSi,
      cumplidosParcial,
      tasaObjetivos
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
   * Agrupa las sesiones por materia/proyecto calculando minutos acumulados y % promedio de uso de IA.
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
   * Analiza los patrones de comportamiento por Tipo de Actividad, Contexto, Energía Previa y Objetivos.
   */
  function analizarHabitos(sesiones) {
    const lista = Array.isArray(sesiones) ? sesiones : [];

    // 1. Por Tipo de Actividad
    const mapaActividades = {};
    lista.forEach((s) => {
      const act = s.tipoActividad || "Código / Práctica";
      if (!mapaActividades[act]) {
        mapaActividades[act] = { minutos: 0, sumaCalidad: 0, sumaIA: 0, conteo: 0 };
      }
      mapaActividades[act].minutos += Number(s.duracion) || 0;
      mapaActividades[act].sumaCalidad += Number(s.calidad) || 0;
      mapaActividades[act].sumaIA += Number(s.usoIA) || 0;
      mapaActividades[act].conteo += 1;
    });

    const actividadesLabels = Object.keys(mapaActividades);
    const minutosPorActividad = actividadesLabels.map((a) => mapaActividades[a].minutos);
    const calidadPorActividad = actividadesLabels.map(
      (a) => +(mapaActividades[a].sumaCalidad / mapaActividades[a].conteo).toFixed(2)
    );

    // 2. Calidad promedio según Nivel de Energía Previa
    const resumenEnergia = NIVELES_ENERGIA.map((niv) => {
      const filtradas = lista.filter((s) => s.energiaPrevia === niv.valor);
      const conteo = filtradas.length;
      const calidadProm = conteo
        ? +(filtradas.reduce((acc, s) => acc + (Number(s.calidad) || 0), 0) / conteo).toFixed(1)
        : 0;
      return {
        ...niv,
        conteo,
        calidadProm
      };
    });

    // 3. Resumen por Contexto (Escuela, Personal, Externo)
    const resumenContextos = CONTEXTOS.map((ctx) => {
      const filtradas = lista.filter((s) => (s.contexto || "Escuela") === ctx.valor);
      const conteo = filtradas.length;
      const minutos = filtradas.reduce((acc, s) => acc + (Number(s.duracion) || 0), 0);
      return {
        ...ctx,
        conteo,
        minutos
      };
    });

    // 4. Resumen de Objetivos Cumplidos
    const resumenObjetivos = ESTADOS_OBJETIVO.map((est) => {
      const conteo = lista.filter((s) => s.objetivoCumplido === est.valor).length;
      return {
        ...est,
        conteo
      };
    });

    return {
      actividadesLabels,
      minutosPorActividad,
      calidadPorActividad,
      resumenEnergia,
      resumenContextos,
      resumenObjetivos
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
    CONTEXTOS,
    TIPOS_ACTIVIDAD,
    NIVELES_ENERGIA,
    NIVELES_COMPLEJIDAD,
    ESTADOS_OBJETIVO,
    calcularMinutos,
    calcularDiaSemana,
    calcularFranjaHoraria,
    obtenerBonoComplejidad,
    obtenerBonoObjetivo,
    calcularXP,
    calcularProgresoRPG,
    calcularKPIs,
    analizarPorHora,
    analizarPorMateria,
    analizarHabitos,
    obtenerTextoAyudaCalidad,
    obtenerTextoAyudaIA
  };
})(window);
