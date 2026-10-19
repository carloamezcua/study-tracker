/**
 * Capa de Dominio: Reglas de negocio puras del sistema RPG (curva exponencial de niveles
 * donde el Nivel 92 es la mitad del 99) y analítica de hábitos de estudio.
 * No tiene dependencias del DOM ni de almacenamiento externo.
 */
(function (global) {
  const StudyTracker = (global.StudyTracker = global.StudyTracker || {});

  // Curva exponencial estilo RuneScape: el XP requerido se duplica cada 7 niveles (2^((L-1)/7)).
  // Con ello, el Nivel 92 (2^13 - 1) es exactamente el 50% del XP del Nivel 99 (2^14 - 1).
  const XP_BASE_CURVA = 250;
  const NIVEL_MAXIMO = 99;

  const TRAMOS_RANGO = [
    { minNivel: 99, titulo: "Capa de Maestría (Nivel 99)" },
    { minNivel: 92, titulo: "Leyenda de la Mitad (Nv. 92+)" },
    { minNivel: 75, titulo: "Gran Maestro Cognitivo" },
    { minNivel: 60, titulo: "Sabio del Flujo Profundo" },
    { minNivel: 45, titulo: "Maestro de la Concentración" },
    { minNivel: 30, titulo: "Arquitecto del Estudio" },
    { minNivel: 20, titulo: "Guerrero Pomodoro" },
    { minNivel: 10, titulo: "Explorador de Datos" },
    { minNivel: 5, titulo: "Aprendiz Constante" },
    { minNivel: 1, titulo: "Novato del Enfoque" }
  ];

  const CONTEXTOS = [
    { valor: "Académico", icono: "🎓", etiqueta: "Académico" },
    { valor: "Certificación", icono: "🏅", etiqueta: "Certificación" },
    { valor: "Proyecto Propio", icono: "🚀", etiqueta: "Proyecto Propio" },
    { valor: "Externo", icono: "🤝", etiqueta: "Externo" }
  ];

  const TIPOS_ACTIVIDAD = [
    { valor: "Teoría / Docs", icono: "📖", etiqueta: "Teoría / Docs" },
    { valor: "Investigación / Diálogo", icono: "💬", etiqueta: "Investigación / Diálogo" },
    { valor: "Diseño / Apuntes", icono: "✍️", etiqueta: "Diseño / Apuntes" },
    { valor: "Desarrollo / Código", icono: "💻", etiqueta: "Desarrollo / Código" },
    { valor: "Práctica / Debugging", icono: "🧪", etiqueta: "Práctica / Debugging" },
    { valor: "Repaso / Simulacro", icono: "🔁", etiqueta: "Repaso / Simulacro" }
  ];

  const MODOS_IA = [
    {
      valor: "Autónomo",
      icono: "🧠",
      etiqueta: "Autónomo (Sin IA)",
      bonoXP: 0.05,
      ayuda: "100% por tu cuenta sin asistencia de IA (+5% XP por autonomía cognitiva)."
    },
    {
      valor: "Diálogo / Tutoría",
      icono: "💬",
      etiqueta: "Diálogo / Tutoría",
      bonoXP: 0.05,
      ayuda:
        "Alto valor cognitivo: debate de conceptos, preguntas de '¿por qué?' y refuerzo activo con IA (+5% XP)."
    },
    {
      valor: "Copiloto / Apoyo",
      icono: "🛠️",
      etiqueta: "Copiloto / Apoyo",
      bonoXP: 0,
      ayuda:
        "Apoyo puntual: consulta de sintaxis, documentación o desbloqueo de bugs entendiendo la solución (XP estándar)."
    },
    {
      valor: "Mecánico / Copy-Paste",
      icono: "🤖",
      etiqueta: "Mecánico / Copy-Paste",
      bonoXP: -0.15,
      ayuda:
        "Delegación mecánica: automatización directa o copiar/pegar para entregar rápido sin profundizar (-15% XP)."
    }
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
    {
      valor: "Sí",
      icono: "✅",
      etiqueta: "Sí (+10%)",
      bonoXP: 0.1,
      ayuda: "Meta lograda: completaste lo planeado para este bloque (+10% XP)."
    },
    {
      valor: "Parcial",
      icono: "⚠️",
      etiqueta: "Parcial (+5%)",
      bonoXP: 0.05,
      ayuda:
        "En progreso: hubo avance real y aprendizaje, pero continuará en otra sesión (+5% XP)."
    },
    {
      valor: "No",
      icono: "❌",
      etiqueta: "No (Bloqueo)",
      bonoXP: 0,
      ayuda:
        "Bloqueo o sin avance: te trabaste en un error, hubo distracción total o interrupción (0% bono, alerta de bloqueo)."
    }
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
    1: "Mecánico / Sin retención: Solo copié/pegué respuestas o estuve distraído; no asimilé el tema.",
    2: "Superficial / Pasivo: Seguí pasos o código generado entendiendo solo por encima; poca retención.",
    3: "Comprensión estándar: Entendí la lógica general de lo realizado y resolví partes por mi cuenta.",
    4: "Aprendizaje sólido: Razoné activamente el problema, comprendí el porqué y puedo replicarlo.",
    5: "Asimilación profunda: Esfuerzo mental propio al máximo; dominé el concepto a fondo y puedo explicarlo sin ayuda."
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
   * Devuelve el bono multiplicador por cumplimiento de objetivo (+10% Sí, +5% Parcial, 0% No).
   */
  function obtenerBonoObjetivo(objetivoCumplido) {
    const item = ESTADOS_OBJETIVO.find((o) => o.valor === objetivoCumplido);
    return item ? item.bonoXP : 0;
  }

  /**
   * Devuelve el bono/ajuste multiplicador según el Modo de Uso de IA (+5% Autónomo/Diálogo, 0% Copiloto, -15% Mecánico).
   */
  function obtenerBonoModoIA(modoIA) {
    const item = MODOS_IA.find((m) => m.valor === modoIA);
    return item ? item.bonoXP : 0;
  }

  /**
   * Calcula los puntos de experiencia (XP) en función de duración, calidad de asimilación (1-5),
   * complejidad (+10% desafiante, +20% muy difícil), objetivo (+10% Sí, +5% Parcial) y modo de IA.
   */
  function calcularXP(
    minutos,
    calidad,
    complejidad = "Fácil",
    objetivoCumplido = "No",
    modoIA = "Copiloto / Apoyo"
  ) {
    const min = Math.max(0, Number(minutos) || 0);
    const cal = Math.min(5, Math.max(1, Number(calidad) || 3));
    const bonoComp = obtenerBonoComplejidad(complejidad);
    const bonoObj = obtenerBonoObjetivo(objetivoCumplido);
    const bonoIA = obtenerBonoModoIA(modoIA);
    const multiplicador = Math.max(0.5, 1 + cal * 0.2 + bonoComp + bonoObj + bonoIA);
    return Math.round(min * multiplicador);
  }

  /**
   * Devuelve el XP total acumulado requerido para alcanzar un nivel determinado (1 a 99).
   * Sigue la ley exponencial de duplicación cada 7 niveles: XP(L) = round(250 * (2^((L-1)/7) - 1)).
   */
  function calcularXpRequeridoParaNivel(nivel) {
    const n = Math.max(1, Math.floor(Number(nivel) || 1));
    if (n <= 1) return 0;
    return Math.round(XP_BASE_CURVA * (Math.pow(2, (n - 1) / 7) - 1));
  }

  /**
   * Obtiene el título del rango RPG correspondiente al nivel actual.
   */
  function obtenerRangoPorNivel(nivel) {
    const tramo = TRAMOS_RANGO.find((t) => nivel >= t.minNivel);
    return tramo ? tramo.titulo : TRAMOS_RANGO[TRAMOS_RANGO.length - 1].titulo;
  }

  /**
   * Calcula el estado de progreso RPG exponencial a partir del XP total acumulado.
   */
  function calcularProgresoRPG(totalXP) {
    const xpSeguro = Math.max(0, Math.round(Number(totalXP) || 0));

    let nivel = 1;
    while (nivel < NIVEL_MAXIMO && xpSeguro >= calcularXpRequeridoParaNivel(nivel + 1)) {
      nivel += 1;
    }

    const xpInicioNivelActual = calcularXpRequeridoParaNivel(nivel);
    const xpMetaSiguienteNivel =
      nivel < NIVEL_MAXIMO ? calcularXpRequeridoParaNivel(nivel + 1) : xpInicioNivelActual;

    const xpEnNivelActual = xpSeguro - xpInicioNivelActual;
    const xpRequeridoTramoActual =
      nivel < NIVEL_MAXIMO ? Math.max(1, xpMetaSiguienteNivel - xpInicioNivelActual) : 1;

    const porcentajeBarra =
      nivel >= NIVEL_MAXIMO
        ? 100
        : Math.min(100, +((xpEnNivelActual / xpRequeridoTramoActual) * 100).toFixed(1));

    const rango = obtenerRangoPorNivel(nivel);

    return {
      nivel,
      rango,
      xpEnNivelActual,
      xpSiguienteNivel: nivel < NIVEL_MAXIMO ? xpRequeridoTramoActual : 0,
      xpMetaTotalSiguiente: xpMetaSiguienteNivel,
      porcentajeBarra,
      totalXP: xpSeguro,
      esNivelMaximo: nivel >= NIVEL_MAXIMO
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
    const bloqueosNo = lista.filter((s) => s.objetivoCumplido === "No").length;
    const tasaObjetivos = totalSesiones ? Math.round((cumplidosSi / totalSesiones) * 100) : 0;

    // Desglose por Modo de Uso de IA
    const iaAutonomo = lista.filter((s) => s.modoIA === "Autónomo").length;
    const iaDialogo = lista.filter((s) => s.modoIA === "Diálogo / Tutoría").length;
    const iaCopiloto = lista.filter((s) => s.modoIA === "Copiloto / Apoyo").length;
    const iaMecanico = lista.filter((s) => s.modoIA === "Mecánico / Copy-Paste").length;

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
      bloqueosNo,
      tasaObjetivos,
      iaAutonomo,
      iaDialogo,
      iaCopiloto,
      iaMecanico
    };
  }

  /**
   * Agrupa las sesiones por hora de inicio (HH:00) y determina la hora pico de asimilación.
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
   * Agrupa las sesiones por materia/proyecto contrastando:
   * - Minutos de Aprendizaje Real (Autónomo, Diálogo / Tutoría y Copiloto)
   * - Minutos de Uso Mecánico / Copy-Paste
   * - Calidad de Asimilación promedio (1-5)
   */
  function analizarPorMateria(sesiones) {
    const mapaMaterias = {};
    (Array.isArray(sesiones) ? sesiones : []).forEach((s) => {
      const mat = (s.materia || "General").trim() || "General";
      if (!mapaMaterias[mat]) {
        mapaMaterias[mat] = {
          minutos: 0,
          minutosAprendizaje: 0,
          minutosMecanicos: 0,
          sumaIA: 0,
          sumaCalidad: 0,
          conteo: 0
        };
      }
      const dur = Number(s.duracion) || 0;
      mapaMaterias[mat].minutos += dur;
      if (s.modoIA === "Mecánico / Copy-Paste") {
        mapaMaterias[mat].minutosMecanicos += dur;
      } else {
        mapaMaterias[mat].minutosAprendizaje += dur;
      }
      mapaMaterias[mat].sumaIA += Number(s.usoIA) || 0;
      mapaMaterias[mat].sumaCalidad += Number(s.calidad) || 0;
      mapaMaterias[mat].conteo += 1;
    });

    const materiasLabels = Object.keys(mapaMaterias);
    const minutosMateria = materiasLabels.map((m) => mapaMaterias[m].minutos);
    const minutosAprendizaje = materiasLabels.map((m) => mapaMaterias[m].minutosAprendizaje);
    const minutosMecanicos = materiasLabels.map((m) => mapaMaterias[m].minutosMecanicos);
    const iaMateria = materiasLabels.map((m) =>
      Math.round(mapaMaterias[m].sumaIA / mapaMaterias[m].conteo)
    );
    const calidadMateria = materiasLabels.map(
      (m) => +(mapaMaterias[m].sumaCalidad / mapaMaterias[m].conteo).toFixed(2)
    );

    return {
      materiasLabels,
      minutosMateria,
      minutosAprendizaje,
      minutosMecanicos,
      iaMateria,
      calidadMateria
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
      const act = s.tipoActividad || "Desarrollo / Código";
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

    // 3. Resumen por Contexto (Académico, Certificación, Proyecto Propio, Externo)
    const resumenContextos = CONTEXTOS.map((ctx) => {
      const filtradas = lista.filter((s) => (s.contexto || "Académico") === ctx.valor);
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
   * Devuelve el texto explicativo para un estado de Objetivo Cumplido (Sí, Parcial, No).
   */
  function obtenerTextoAyudaObjetivo(objetivoCumplido) {
    const item = ESTADOS_OBJETIVO.find((o) => o.valor === objetivoCumplido);
    return item ? item.ayuda : ESTADOS_OBJETIVO[0].ayuda;
  }

  /**
   * Devuelve el texto explicativo para un nivel de calidad de asimilación (1 al 5),
   * advirtiendo si se combina modo mecánico con calidad alta.
   */
  function obtenerTextoAyudaCalidad(calidad, modoIA = "", usoIA = 0) {
    const numCal = Number(calidad) || 3;
    const base = TEXTOS_CALIDAD[numCal] || TEXTOS_CALIDAD[3];
    if (modoIA === "Mecánico / Copy-Paste" && numCal >= 4) {
      return `${base} ⚠️ Nota: seleccionaste modo 'Mecánico / Copy-Paste'; si solo copiaste sin profundizar, considera nivel 1 o 2 (o cambia a 'Diálogo / Tutoría' si aprendiste debatiendo con la IA).`;
    }
    if (Number(usoIA) >= 75 && modoIA !== "Diálogo / Tutoría" && numCal >= 4) {
      return `${base} 💡 Con ${usoIA}% de IA, califica con 4-5 solo si hubo diálogo y comprensión profunda, no solo fluidez mecánica.`;
    }
    return base;
  }

  /**
   * Devuelve el texto explicativo según el Modo de Uso de IA y el porcentaje.
   */
  function obtenerTextoAyudaIA(usoIA, modoIA = "Copiloto / Apoyo") {
    const itemModo = MODOS_IA.find((m) => m.valor === modoIA);
    if (itemModo) {
      return itemModo.ayuda;
    }
    const val = Number(usoIA) || 0;
    if (val === 0) {
      return "Estudio 100% autónomo: lectura, código o ejercicios sin asistencia.";
    }
    if (val <= 50) {
      return "Apoyo puntual: estudio propio usando IA para aclarar dudas o depurar errores.";
    }
    return "Uso intensivo de IA: distingue arriba si fue por 'Diálogo / Tutoría' (aprendizaje) o 'Mecánico / Copy-Paste'.";
  }

  StudyTracker.RPG = {
    XP_BASE_CURVA,
    NIVEL_MAXIMO,
    TRAMOS_RANGO,
    CONTEXTOS,
    TIPOS_ACTIVIDAD,
    MODOS_IA,
    NIVELES_ENERGIA,
    NIVELES_COMPLEJIDAD,
    ESTADOS_OBJETIVO,
    calcularMinutos,
    calcularDiaSemana,
    calcularFranjaHoraria,
    obtenerBonoComplejidad,
    obtenerBonoObjetivo,
    obtenerBonoModoIA,
    calcularXP,
    calcularXpRequeridoParaNivel,
    calcularProgresoRPG,
    calcularKPIs,
    analizarPorHora,
    analizarPorMateria,
    analizarHabitos,
    obtenerTextoAyudaObjetivo,
    obtenerTextoAyudaCalidad,
    obtenerTextoAyudaIA
  };
})(window);

