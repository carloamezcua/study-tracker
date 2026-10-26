/**
 * Capa de Dominio: Reglas de negocio puras del sistema RPG (curva exponencial de niveles
 * donde el Nivel 92 es la mitad del 99), taxonomía cognitiva v3 y analítica de hábitos de estudio.
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

  // 6 Tipos de Actividad limpios (fusión de Teoría + Investigación en Estudio Teórico / Conceptual)
  const TIPOS_ACTIVIDAD = [
    {
      valor: "Clase / Cátedra",
      icono: "👨‍🏫",
      etiqueta: "Clase / Cátedra",
      ayuda:
        "👨‍🏫 Clase / Cátedra: Sesión en vivo guiada por un profesor o ponente. Por defecto preselecciona Recepción Pasiva y 0% IA, pero puedes cambiarlo si interactuaste o hiciste ejercicios."
    },
    {
      valor: "Estudio Teórico / Conceptual",
      icono: "📖",
      etiqueta: "Estudio Teórico / Conceptual",
      ayuda:
        "📖 Estudio Teórico / Conceptual: Comprender un tema o artículo (leer documentación, papers, libros, ver cursos grabados o investigar dudas conceptuales y debatir el '¿por qué?' con IA)."
    },
    {
      valor: "Síntesis / Documentación",
      icono: "✍️",
      etiqueta: "Síntesis / Documentación",
      ayuda:
        "✍️ Síntesis / Documentación: Estructurar y destilar conocimiento (redactar apuntes, cheatsheets a mano o en PC, hacer resúmenes, mapas conceptuales o diagramas de arquitectura)."
    },
    {
      valor: "Desarrollo / Código",
      icono: "💻",
      etiqueta: "Desarrollo / Código",
      ayuda:
        "💻 Desarrollo / Código: Construir e implementar (escribir código, notebooks, consultas SQL, scripts o desarrollar funcionalidades de un proyecto o entregable)."
    },
    {
      valor: "Práctica / Debugging",
      icono: "🧪",
      etiqueta: "Práctica / Debugging",
      ayuda:
        "🧪 Práctica / Debugging: Resolver ejercicios prácticos, laboratorios o depurar errores (debugging) hasta aislar y corregir la causa raíz."
    },
    {
      valor: "Repaso / Simulacro",
      icono: "🔁",
      etiqueta: "Repaso / Simulacro",
      ayuda:
        "🔁 Repaso / Simulacro: Consolidar memoria sobre lo ya visto (repasar tus propios apuntes, flashcards, explicar en voz alta sin apoyo o resolver exámenes de práctica)."
    }
  ];

  // Dinámica Cognitiva (Unifica el antiguo Nivel de Producción Propia y Modo de Uso de IA en 4 chips claros)
  const DINAMICAS_COGNITIVAS = [
    {
      valor: "Recepción Pasiva",
      icono: "👀",
      etiqueta: "👀 Recepción Pasiva",
      bonoXP: 0,
      ayuda:
        "👀 Recepción Pasiva (0% ajuste XP): Leíste, viste o escuchaste explicaciones (clase, video, documentación o resumen generado por IA) sin redactar ni producir material propio aún."
    },
    {
      valor: "Delegación / Reproducción",
      icono: "🤖",
      etiqueta: "🤖 Delegación / Reproducción",
      bonoXP: -0.15,
      ayuda:
        "🤖 Delegación / Reproducción (-15% XP si IA ≥ 50%, 0% si < 50%): Escribiste o programaste transcribiendo, copiando o siguiendo soluciones ya masticadas por una fuente o la IA para salir del paso."
    },
    {
      valor: "Andamiaje / Co-creación",
      icono: "🔄",
      etiqueta: "🔄 Andamiaje / Co-creación",
      bonoXP: 0.05,
      ayuda:
        "🔄 Andamiaje / Co-creación (+5% XP): Diálogo e iteración activa con la IA (tú propones tus ideas o código, la IA corrige tus conceptos o desbloquea dudas y aprendes de tus errores)."
    },
    {
      valor: "Generación Propia",
      icono: "🧠",
      etiqueta: "🧠 Generación Propia",
      bonoXP: 0.1,
      ayuda:
        "🧠 Generación Propia (+10% XP autónomo / +5% con consulta mínima): Redactaste o programaste con TUS palabras y TU lógica enfrentando los obstáculos tú mismo. Máxima retención."
    }
  ];

  // Dominio Previo con Prueba Objetiva (Cero dudas existenciales)
  const NIVELES_DOMINIO = [
    {
      valor: "Nuevo",
      icono: "🌱",
      etiqueta: "🌱 Nuevo",
      ayuda:
        "🌱 Nuevo (0 contactos previos): Nunca has estudiado este concepto o herramienta específica. Si te pidieran explicarlo o escribir código de esto ahorita mismo, no sabrías por dónde empezar."
    },
    {
      valor: "En construcción",
      icono: "🌿",
      etiqueta: "🌿 En construcción",
      ayuda:
        "🌿 En construcción (Necesitas apoyo / consulta): Ya lo viste antes (en clase, ayer o en el Pomodoro pasado), pero todavía necesitas mirar tus apuntes, la documentación o apoyarte en la IA para avanzar sin trabarte."
    },
    {
      valor: "Consolidado",
      icono: "🌳",
      etiqueta: "🌳 Consolidado",
      ayuda:
        "🌳 Consolidado (Autónomo): Puedes explicarlo, resolver problemas o programar sobre esto sin mirar el manual ni depender de la IA, o solo estás haciendo un bloque de repaso/mantenimiento veloz."
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
      valor: "Flujo limpio",
      icono: "✅",
      etiqueta: "Flujo limpio (+10%)",
      bonoXP: 0.1,
      ayuda:
        "✅ Flujo limpio (+10% XP): Avanzaste a buen ritmo en este bloque. Aplica también si tuviste que retirarte antes por un factor externo pero tu foco fue bueno."
    },
    {
      valor: "Lucha productiva",
      icono: "🧠",
      etiqueta: "Lucha productiva (+10%)",
      bonoXP: 0.1,
      ayuda:
        "🧠 Lucha productiva (+10% XP): Batallaste con un reto difícil, probaste hipótesis y descartaste caminos sin llegar al resultado final. ¡Aprendizaje por ensayo y error!"
    },
    {
      valor: "Con fricción",
      icono: "⚠️",
      etiqueta: "Con fricción (+5%)",
      bonoXP: 0.05,
      ayuda:
        "⚠️ Con fricción (+5% XP): Hubo avance, pero accidentado por distracciones, interrupciones o prisa de entrega de última hora."
    },
    {
      valor: "Parálisis / Abandono",
      icono: "🔴",
      etiqueta: "Parálisis / Abandono (0%)",
      bonoXP: 0,
      ayuda:
        "🔴 Parálisis / Abandono (0% bono): Sesión en blanco: bloqueo pasivo, procrastinación o abandono sin procesamiento mental activo."
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

  const VALORES_ACTIVIDAD_SET = new Set(TIPOS_ACTIVIDAD.map((a) => a.valor));
  const VALORES_DINAMICA_SET = new Set(DINAMICAS_COGNITIVAS.map((d) => d.valor));
  const VALORES_DOMINIO_SET = new Set(NIVELES_DOMINIO.map((d) => d.valor));
  const VALORES_OBJETIVO_SET = new Set(ESTADOS_OBJETIVO.map((o) => o.valor));

  /**
   * Migra nombres antiguos de Tipo de Actividad al catálogo v3 de 6 opciones.
   */
  function migrarTipoActividad(actividadRaw) {
    const val = String(actividadRaw || "").trim();
    if (VALORES_ACTIVIDAD_SET.has(val)) return val;
    if (val === "Teoría / Docs" || val === "Investigación / Diálogo") {
      return "Estudio Teórico / Conceptual";
    }
    if (val === "Diseño / Apuntes") {
      return "Síntesis / Documentación";
    }
    return "Desarrollo / Código";
  }

  /**
   * Migra valores antiguos de Dominio Previo ("Con lagunas", "Con base", "Dominado") al catálogo objetivo v3.
   */
  function migrarDominioPrevio(dominioRaw, tipoActividad = "") {
    const val = String(dominioRaw || "").trim();
    if (VALORES_DOMINIO_SET.has(val)) return val;
    if (val === "Nuevo") return "Nuevo";
    if (val === "Con lagunas" || val === "Con base") return "En construcción";
    if (val === "Dominado") return "Consolidado";
    if (tipoActividad === "Repaso / Simulacro") return "Consolidado";
    return "En construcción";
  }

  /**
   * Unifica los antiguos campos Produccion_Propia + Modo_IA en la nueva Dinamica_Cognitiva.
   */
  function migrarDinamicaCognitiva(dinamicaRaw, produccionLegacy, modoIALegacy, usoIA = 0) {
    const din = String(dinamicaRaw || "").trim();
    if (VALORES_DINAMICA_SET.has(din)) return din;

    const prod = String(produccionLegacy || "").trim();
    const modo = String(modoIALegacy || "").trim();
    const pctIA = Number(usoIA) || 0;

    // 1. Si era Consumo -> Recepción Pasiva
    if (prod === "Consumo" || din === "Consumo") {
      return "Recepción Pasiva";
    }
    // 2. Si el modo explícito era Diálogo / Tutoría -> Andamiaje / Co-creación (ej. sesión de GANs)
    if (modo === "Diálogo / Tutoría" || din === "Diálogo / Tutoría") {
      return "Andamiaje / Co-creación";
    }
    // 3. Si era Reproducción o Copy-Paste -> Delegación / Reproducción
    if (
      prod === "Reproducción" ||
      modo === "Mecánico / Copy-Paste" ||
      din === "Reproducción" ||
      din === "Mecánico / Copy-Paste"
    ) {
      return "Delegación / Reproducción";
    }
    // 4. Si era Generación propia
    if (prod === "Generación propia" || din === "Generación propia" || modo === "Autónomo") {
      if ((modo === "Diálogo / Tutoría" || modo === "Copiloto / Apoyo") && pctIA >= 25) {
        return "Andamiaje / Co-creación";
      }
      return "Generación Propia";
    }
    // Fallback inteligente según porcentaje de IA
    if (pctIA === 0) return "Generación Propia";
    if (pctIA >= 75) return "Delegación / Reproducción";
    return "Andamiaje / Co-creación";
  }

  /**
   * Migra valores antiguos de Objetivo Cumplido ("Sí", "Parcial", "No") a la escala v3.1
   * (Flujo limpio, Lucha productiva, Con fricción, Parálisis / Abandono).
   */
  function migrarEstadoObjetivo(objetivoRaw) {
    const val = String(objetivoRaw || "").trim();
    if (VALORES_OBJETIVO_SET.has(val)) return val;
    if (val === "Sí" || val === "Si" || val === "Flujo") return "Flujo limpio";
    if (val === "Lucha") return "Lucha productiva";
    if (val === "Parcial" || val === "Fricción" || val === "Friccion") return "Con fricción";
    if (val === "No" || val === "Bloqueo" || val === "Parálisis" || val === "Paralisis") {
      return "Parálisis / Abandono";
    }
    return "Flujo limpio";
  }

  /**
   * Fusiona el antiguo campo Tema dentro de Notas con formato "[Tema] Notas"
   * y permite extraer el subtema en cualquier momento para el Inspector.
   */
  function formatearNotasConTema(notasRaw, temaLegacy = "") {
    const notas = String(notasRaw || "").trim();
    const tema = String(temaLegacy || "").trim();

    // Si notas ya empieza con [Subtema], no duplicar
    if (/^\[([^\]]+)\]/.test(notas)) {
      return notas;
    }
    if (tema && tema !== "General") {
      return notas ? `[${tema}] ${notas}` : `[${tema}]`;
    }
    return notas;
  }

  /**
   * Extrae el subtema desde Notas si tiene prefijo "[Subtema] ..." o usa General.
   */
  function extraerSubtemaDeNotas(notasRaw, temaExplicito = "") {
    const notas = String(notasRaw || "").trim();
    const match = notas.match(/^\[([^\]]+)\]\s*(.*)$/);
    if (match) {
      return {
        subtema: match[1].trim() || "General",
        notasLimpias: match[2].trim(),
        notasCompletas: notas
      };
    }
    const temaLimpio = String(temaExplicito || "").trim();
    return {
      subtema: temaLimpio && temaLimpio !== "General" ? temaLimpio : "General",
      notasLimpias: notas,
      notasCompletas: formatearNotasConTema(notas, temaLimpio)
    };
  }

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
    if (Number.isNaN(h1) || Number.isNaN(m1) || Number.isNaN(h2) || Number.isNaN(h2)) {
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
   * Clasifica la hora de inicio (HH:MM) en bloques simétricos de 6 horas exactas:
   * - 00:00–05:59 -> Madrugada
   * - 06:00–11:59 -> Mañana
   * - 12:00–17:59 -> Tarde
   * - 18:00–23:59 -> Noche
   */
  function calcularFranjaHoraria(horaInicio) {
    if (!horaInicio) return "Mañana";
    const hora = Number(String(horaInicio).split(":")[0]);
    if (Number.isNaN(hora)) return "Mañana";
    if (hora >= 0 && hora < 6) return "Madrugada";
    if (hora >= 6 && hora < 12) return "Mañana";
    if (hora >= 12 && hora < 18) return "Tarde";
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
   * Devuelve el bono multiplicador por cumplimiento de objetivo (+10% Flujo/Lucha, +5% Fricción, 0% Parálisis).
   */
  function obtenerBonoObjetivo(objetivoCumplido) {
    const canon = migrarEstadoObjetivo(objetivoCumplido);
    const item = ESTADOS_OBJETIVO.find((o) => o.valor === canon);
    return item ? item.bonoXP : 0;
  }

  /**
   * Devuelve el ajuste multiplicador según la Dinámica Cognitiva y el % de Uso de IA:
   * - Recepción Pasiva: 0%
   * - Delegación / Reproducción: -15% si IA >= 50%, 0% si IA < 50%
   * - Andamiaje / Co-creación: +5%
   * - Generación Propia: +10% si IA == 0%, +5% si tuvo consulta puntual
   */
  function obtenerBonoDinamica(dinamicaCognitiva, usoIA = 0) {
    const pct = Number(usoIA) || 0;
    const din = migrarDinamicaCognitiva(dinamicaCognitiva, "", dinamicaCognitiva, pct);

    if (din === "Recepción Pasiva") return 0;
    if (din === "Delegación / Reproducción") {
      return pct >= 50 || dinamicaCognitiva === "Mecánico / Copy-Paste" ? -0.15 : 0;
    }
    if (din === "Andamiaje / Co-creación") return 0.05;
    if (din === "Generación Propia") {
      return pct === 0 ? 0.1 : 0.05;
    }
    return 0;
  }

  /**
   * Calcula los puntos de experiencia (XP) en función de duración, calidad de asimilación (1-5),
   * complejidad (+10% desafiante, +20% muy difícil), objetivo (+10% Sí, +5% Parcial) y dinámica cognitiva.
   */
  function calcularXP(
    minutos,
    calidad,
    complejidad = "Fácil",
    objetivoCumplido = "No",
    dinamicaCognitiva = "Andamiaje / Co-creación",
    usoIA = 0
  ) {
    const min = Math.max(0, Number(minutos) || 0);
    const cal = Math.min(5, Math.max(1, Number(calidad) || 3));
    const bonoComp = obtenerBonoComplejidad(complejidad);
    const bonoObj = obtenerBonoObjetivo(objetivoCumplido);
    const bonoDin = obtenerBonoDinamica(dinamicaCognitiva, usoIA);
    const multiplicador = Math.max(0.5, 1 + cal * 0.2 + bonoComp + bonoObj + bonoDin);
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

    const cumplidosFlujo = lista.filter(
      (s) => migrarEstadoObjetivo(s.objetivoCumplido) === "Flujo limpio"
    ).length;
    const cumplidosLucha = lista.filter(
      (s) => migrarEstadoObjetivo(s.objetivoCumplido) === "Lucha productiva"
    ).length;
    const cumplidosFriccion = lista.filter(
      (s) => migrarEstadoObjetivo(s.objetivoCumplido) === "Con fricción"
    ).length;
    const bloqueosParalisis = lista.filter(
      (s) => migrarEstadoObjetivo(s.objetivoCumplido) === "Parálisis / Abandono"
    ).length;
    const tasaObjetivos = totalSesiones
      ? Math.round(((cumplidosFlujo + cumplidosLucha) / totalSesiones) * 100)
      : 0;

    // Desglose por Dinámica Cognitiva
    const dinGeneracion = lista.filter(
      (s) => s.dinamicaCognitiva === "Generación Propia"
    ).length;
    const dinAndamiaje = lista.filter(
      (s) => s.dinamicaCognitiva === "Andamiaje / Co-creación"
    ).length;
    const dinRecepcion = lista.filter(
      (s) => s.dinamicaCognitiva === "Recepción Pasiva"
    ).length;
    const dinDelegacion = lista.filter(
      (s) => s.dinamicaCognitiva === "Delegación / Reproducción"
    ).length;

    return {
      totalSesiones,
      totalMinutos,
      totalHoras,
      totalXP,
      promedioMinutos,
      promedioCalidad,
      promedioIA,
      cumplidosFlujo,
      cumplidosLucha,
      cumplidosFriccion,
      bloqueosParalisis,
      cumplidosSi: cumplidosFlujo, // Alias retrocompatible
      cumplidosParcial: cumplidosFriccion, // Alias retrocompatible
      bloqueosNo: bloqueosParalisis, // Alias retrocompatible
      tasaObjetivos,
      dinGeneracion,
      dinAndamiaje,
      dinRecepcion,
      dinDelegacion,
      // Alias retrocompatibles para UI
      iaAutonomo: dinGeneracion,
      iaDialogo: dinAndamiaje,
      iaCopiloto: dinRecepcion,
      iaMecanico: dinDelegacion
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
   * - Minutos de Aprendizaje Activo / Asimilación
   * - Minutos de Delegación / Reproducción con IA alta
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
      const din = s.dinamicaCognitiva || "Andamiaje / Co-creación";
      mapaMaterias[mat].minutos += dur;
      if (din === "Delegación / Reproducción" && Number(s.usoIA) >= 50) {
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
   * Analiza los patrones de comportamiento por Tipo de Actividad, Dinámica Cognitiva, Dominio Previo y Objetivos.
   */
  function analizarHabitos(sesiones) {
    const lista = Array.isArray(sesiones) ? sesiones : [];

    // 1. Por Tipo de Actividad
    const mapaActividades = {};
    lista.forEach((s) => {
      const act = migrarTipoActividad(s.tipoActividad);
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
      const conteo = lista.filter((s) => migrarEstadoObjetivo(s.objetivoCumplido) === est.valor).length;
      return {
        ...est,
        conteo
      };
    });

    // 5. Calidad y bloqueos según Complejidad
    const resumenComplejidad = NIVELES_COMPLEJIDAD.map((comp) => {
      const filtradas = lista.filter((s) => s.complejidad === comp.valor);
      const conteo = filtradas.length;
      const minutos = filtradas.reduce((acc, s) => acc + (Number(s.duracion) || 0), 0);
      const calidadProm = conteo
        ? +(filtradas.reduce((acc, s) => acc + (Number(s.calidad) || 0), 0) / conteo).toFixed(1)
        : 0;
      const bloqueos = filtradas.filter(
        (s) => migrarEstadoObjetivo(s.objetivoCumplido) === "Parálisis / Abandono"
      ).length;
      return {
        ...comp,
        conteo,
        minutos,
        calidadProm,
        bloqueos
      };
    });

    // 6. Balance Cognitivo: Ingesta / Recepción vs. Práctica / Co-creación / Generación
    const actividadesConsumo = new Set([
      "Clase / Cátedra",
      "Estudio Teórico / Conceptual"
    ]);
    let minConsumo = 0;
    let minProduccion = 0;
    lista.forEach((s) => {
      const dur = Number(s.duracion) || 0;
      const din = s.dinamicaCognitiva || "";
      if (
        din === "Recepción Pasiva" ||
        (din === "" && actividadesConsumo.has(migrarTipoActividad(s.tipoActividad)))
      ) {
        minConsumo += dur;
      } else {
        minProduccion += dur;
      }
    });
    const totalMinBalance = minConsumo + minProduccion;
    const pctProduccion = totalMinBalance ? Math.round((minProduccion / totalMinBalance) * 100) : 0;
    const pctConsumo = totalMinBalance ? 100 - pctProduccion : 0;

    // 7. Rendimiento según Dinámica Cognitiva (4 niveles)
    const resumenDinamica = DINAMICAS_COGNITIVAS.map((med) => {
      const filtradas = lista.filter(
        (s) => (s.dinamicaCognitiva || "Andamiaje / Co-creación") === med.valor
      );
      const conteo = filtradas.length;
      const minutos = filtradas.reduce((acc, s) => acc + (Number(s.duracion) || 0), 0);
      const calidadProm = conteo
        ? +(filtradas.reduce((acc, s) => acc + (Number(s.calidad) || 0), 0) / conteo).toFixed(1)
        : 0;
      const iaProm = conteo
        ? Math.round(filtradas.reduce((acc, s) => acc + (Number(s.usoIA) || 0), 0) / conteo)
        : 0;
      return {
        ...med,
        conteo,
        minutos,
        calidadProm,
        iaProm
      };
    });

    // 8. Rendimiento según Dominio Previo del Tema (Nuevo vs. En construcción vs. Consolidado)
    const resumenDominio = NIVELES_DOMINIO.map((fam) => {
      const filtradas = lista.filter(
        (s) => migrarDominioPrevio(s.dominioPrevio) === fam.valor
      );
      const conteo = filtradas.length;
      const minutos = filtradas.reduce((acc, s) => acc + (Number(s.duracion) || 0), 0);
      const calidadProm = conteo
        ? +(filtradas.reduce((acc, s) => acc + (Number(s.calidad) || 0), 0) / conteo).toFixed(1)
        : 0;
      const iaProm = conteo
        ? Math.round(filtradas.reduce((acc, s) => acc + (Number(s.usoIA) || 0), 0) / conteo)
        : 0;
      const fluidos = filtradas.filter((s) => {
        const est = migrarEstadoObjetivo(s.objetivoCumplido);
        return est === "Flujo limpio" || est === "Lucha productiva";
      }).length;
      const pctFluidez = conteo ? Math.round((fluidos / conteo) * 100) : 0;
      return {
        ...fam,
        conteo,
        minutos,
        calidadProm,
        iaProm,
        pctFluidez
      };
    });

    // 9. Matriz de Fricción: distribución Flujo / Lucha / Fricción / Parálisis por Complejidad y Dominio Previo
    const categoriasFriccion = [
      { clave: "Fácil", tipo: "complejidad", etiqueta: "🟢 Fácil" },
      { clave: "Desafiante", tipo: "complejidad", etiqueta: "🟡 Desafiante" },
      { clave: "Muy difícil", tipo: "complejidad", etiqueta: "🔴 Muy difícil" },
      { clave: "Nuevo", tipo: "dominioPrevio", etiqueta: "🌱 Nuevo" },
      { clave: "En construcción", tipo: "dominioPrevio", etiqueta: "🌿 En construcción" },
      { clave: "Consolidado", tipo: "dominioPrevio", etiqueta: "🌳 Consolidado" }
    ];

    const matrizFriccion = categoriasFriccion.map((cat) => {
      const sub = lista.filter((s) =>
        cat.tipo === "complejidad"
          ? (s.complejidad || "Desafiante") === cat.clave
          : migrarDominioPrevio(s.dominioPrevio) === cat.clave
      );
      const total = sub.length;
      const flujo = sub.filter((s) => migrarEstadoObjetivo(s.objetivoCumplido) === "Flujo limpio").length;
      const lucha = sub.filter((s) => migrarEstadoObjetivo(s.objetivoCumplido) === "Lucha productiva").length;
      const friccion = sub.filter((s) => migrarEstadoObjetivo(s.objetivoCumplido) === "Con fricción").length;
      const paralisis = sub.filter((s) => migrarEstadoObjetivo(s.objetivoCumplido) === "Parálisis / Abandono").length;
      return {
        ...cat,
        total,
        flujo,
        lucha,
        friccion,
        paralisis,
        // Aliases retrocompatibles para código existente
        si: flujo,
        parcial: friccion,
        no: paralisis,
        pctFlujo: total ? Math.round((flujo / total) * 100) : 0,
        pctLucha: total ? Math.round((lucha / total) * 100) : 0,
        pctFriccion: total ? Math.round((friccion / total) * 100) : 0,
        pctParalisis: total ? Math.round((paralisis / total) * 100) : 0,
        pctSi: total ? Math.round((flujo / total) * 100) : 0,
        pctParcial: total ? Math.round((friccion / total) * 100) : 0,
        pctNo: total ? Math.round((paralisis / total) * 100) : 0
      };
    });

    return {
      actividadesLabels,
      minutosPorActividad,
      calidadPorActividad,
      resumenEnergia,
      resumenContextos,
      resumenObjetivos,
      resumenComplejidad,
      resumenDinamica,
      resumenProduccion: resumenDinamica, // Alias retrocompatible
      resumenDominio,
      matrizFriccion,
      balanceCognitivo: {
        minConsumo,
        minProduccion,
        pctConsumo,
        pctProduccion
      }
    };
  }

  /**
   * Filtra una lista de sesiones combinando Contexto, Periodo temporal y Materia.
   */
  function filtrarSesionesAvanzado(
    sesiones,
    { contexto = "Todos", periodo = "todo", materia = "Todas" } = {}
  ) {
    const lista = Array.isArray(sesiones) ? sesiones : [];
    const ahora = new Date();
    const hoyISO = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(
      ahora.getDate()
    ).padStart(2, "0")}`;

    let fechaCorteStr = null;
    if (periodo === "hoy") {
      fechaCorteStr = hoyISO;
    } else if (periodo === "7d" || periodo === "30d") {
      const dias = periodo === "7d" ? 6 : 29;
      const corte = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - dias);
      fechaCorteStr = `${corte.getFullYear()}-${String(corte.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(corte.getDate()).padStart(2, "0")}`;
    }

    return lista.filter((s) => {
      if (contexto !== "Todos" && (s.contexto || "Académico") !== contexto) {
        return false;
      }
      if (materia !== "Todas" && (s.materia || "General").trim() !== materia) {
        return false;
      }
      if (fechaCorteStr && s.fecha) {
        const f = String(s.fecha).slice(0, 10);
        if (periodo === "hoy" && f !== fechaCorteStr) return false;
        if ((periodo === "7d" || periodo === "30d") && f < fechaCorteStr) return false;
      }
      return true;
    });
  }

  /**
   * Obtiene el lunes de la semana correspondiente a una fecha YYYY-MM-DD.
   */
  function obtenerInicioSemanaISO(fechaStr) {
    const partes = String(fechaStr || "").slice(0, 10).split("-").map(Number);
    if (partes.length !== 3 || partes.some(Number.isNaN)) return "Sin fecha";
    const d = new Date(partes[0], partes[1] - 1, partes[2]);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const lunes = new Date(d.setDate(diff));
    return `${lunes.getFullYear()}-${String(lunes.getMonth() + 1).padStart(2, "0")}-${String(
      lunes.getDate()
    ).padStart(2, "0")}`;
  }

  /**
   * Analiza la evolución temporal del estudio por Día, Semana o Mes, y calcula la racha de días activos.
   */
  function analizarEvolucionTemporal(sesiones, agrupacion = "dia") {
    const lista = Array.isArray(sesiones) ? sesiones : [];
    const mapa = {};
    const diasUnicosSet = new Set();

    lista.forEach((s) => {
      const f = String(s.fecha || "").slice(0, 10);
      if (!f) return;
      diasUnicosSet.add(f);

      let clave = f;
      if (agrupacion === "semana") {
        clave = obtenerInicioSemanaISO(f);
      } else if (agrupacion === "mes") {
        clave = f.slice(0, 7);
      }

      if (!mapa[clave]) {
        mapa[clave] = { minutos: 0, sumaCalidad: 0, conteo: 0, xp: 0 };
      }
      mapa[clave].minutos += Number(s.duracion) || 0;
      mapa[clave].sumaCalidad += Number(s.calidad) || 0;
      mapa[clave].conteo += 1;
      mapa[clave].xp += Number(s.xp) || 0;
    });

    const clavesOrdenadas = Object.keys(mapa).sort();
    const minutos = clavesOrdenadas.map((k) => mapa[k].minutos);
    const calidadPromedio = clavesOrdenadas.map(
      (k) => +(mapa[k].sumaCalidad / mapa[k].conteo).toFixed(2)
    );
    const conteoSesiones = clavesOrdenadas.map((k) => mapa[k].conteo);

    const diasOrdenados = Array.from(diasUnicosSet).sort();
    let rachaActual = 0;
    let mejorRacha = 0;
    let rachaTemp = 0;

    for (let i = 0; i < diasOrdenados.length; i++) {
      if (i === 0) {
        rachaTemp = 1;
      } else {
        const p1 = diasOrdenados[i - 1].split("-").map(Number);
        const p2 = diasOrdenados[i].split("-").map(Number);
        const d1 = new Date(p1[0], p1[1] - 1, p1[2]);
        const d2 = new Date(p2[0], p2[1] - 1, p2[2]);
        const diffDias = Math.round((d2 - d1) / 86400000);
        rachaTemp = diffDias === 1 ? rachaTemp + 1 : 1;
      }
      if (rachaTemp > mejorRacha) mejorRacha = rachaTemp;
    }
    rachaActual = rachaTemp;

    const totalMin = lista.reduce((acc, s) => acc + (Number(s.duracion) || 0), 0);
    const diasActivos = diasOrdenados.length;
    const promedioMinPorDiaActivo = diasActivos ? Math.round(totalMin / diasActivos) : 0;

    return {
      clavesOrdenadas,
      minutos,
      calidadPromedio,
      conteoSesiones,
      diasActivos,
      rachaActual,
      mejorRacha,
      promedioMinPorDiaActivo
    };
  }

  /**
   * Construye la matriz 7x4 para el Mapa de Calor Circadiano (Día de la semana x Franja horaria).
   * Siempre recalcula con la regla simétrica de 6h a partir de horaInicio para máxima exactitud.
   */
  function analizarMapaCalorCircadiano(sesiones) {
    const lista = Array.isArray(sesiones) ? sesiones : [];
    const ordenDias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const ordenFranjas = ["Madrugada", "Mañana", "Tarde", "Noche"];
    const pesoEnergia = { Alta: 3, Media: 2, Baja: 1 };

    const matriz = {};
    ordenDias.forEach((d) => {
      matriz[d] = {};
      ordenFranjas.forEach((f) => {
        matriz[d][f] = {
          minutos: 0,
          sesiones: 0,
          sumaCalidad: 0,
          sumaEnergia: 0,
          calidadProm: 0,
          energiaProm: 0
        };
      });
    });

    let maxMinutosCelda = 0;
    let mejorCelda = null;

    lista.forEach((s) => {
      const dia = s.diaSemana || calcularDiaSemana(s.fecha);
      const franja = calcularFranjaHoraria(s.horaInicio);
      if (!matriz[dia] || !matriz[dia][franja]) return;

      const celda = matriz[dia][franja];
      celda.minutos += Number(s.duracion) || 0;
      celda.sesiones += 1;
      celda.sumaCalidad += Number(s.calidad) || 0;
      celda.sumaEnergia += pesoEnergia[s.energiaPrevia] || 2;
      celda.calidadProm = +(celda.sumaCalidad / celda.sesiones).toFixed(1);
      celda.energiaProm = +(celda.sumaEnergia / celda.sesiones).toFixed(1);

      if (celda.minutos > maxMinutosCelda) {
        maxMinutosCelda = celda.minutos;
      }
    });

    ordenDias.forEach((d) => {
      ordenFranjas.forEach((f) => {
        const c = matriz[d][f];
        if (c.sesiones > 0) {
          if (
            !mejorCelda ||
            c.calidadProm > mejorCelda.calidadProm ||
            (c.calidadProm === mejorCelda.calidadProm && c.minutos > mejorCelda.minutos)
          ) {
            mejorCelda = { dia: d, franja: f, ...c };
          }
        }
      });
    });

    return {
      ordenDias,
      ordenFranjas,
      matriz,
      maxMinutosCelda,
      mejorCelda
    };
  }

  /**
   * Analiza el Cuadrante de Rendimiento Cognitivo (% Uso IA vs. Asimilación 1-5),
   * agrupando por Dinámica Cognitiva y desplazando puntos superpuestos en espiral.
   */
  function analizarCuadranteIA(sesiones) {
    const lista = Array.isArray(sesiones) ? sesiones : [];
    const conteoCoordenadas = {};
    const puntos = [];

    let qSinergia = 0; // IA >= 35% y Calidad >= 4
    let qAutonomo = 0; // IA < 35% y Calidad >= 4
    let qMecanico = 0; // IA >= 35% y Calidad <= 2
    let qFatiga = 0; // IA < 35% y Calidad <= 2

    lista.forEach((s) => {
      const ia = Math.min(100, Math.max(0, Number(s.usoIA) || 0));
      const cal = Math.min(5, Math.max(1, Number(s.calidad) || 3));
      const dur = Math.max(5, Number(s.duracion) || 15);
      const dinamica = s.dinamicaCognitiva || "Andamiaje / Co-creación";
      const { subtema } = extraerSubtemaDeNotas(s.notas, s.tema);

      if (cal >= 4 && ia >= 35) qSinergia += 1;
      else if (cal >= 4 && ia < 35) qAutonomo += 1;
      else if (cal <= 2 && ia >= 35) qMecanico += 1;
      else if (cal <= 2 && ia < 35) qFatiga += 1;

      const key = `${ia}_${cal}`;
      const indiceRepetido = conteoCoordenadas[key] || 0;
      conteoCoordenadas[key] = indiceRepetido + 1;

      const angulo = indiceRepetido * 1.9;
      const offsetRadio = indiceRepetido === 0 ? 0 : Math.min(3.5, 1.3 + indiceRepetido * 0.45);
      const xJitter = Math.min(100, Math.max(0, +(ia + Math.cos(angulo) * offsetRadio).toFixed(1)));
      const yJitter = Math.min(
        5.25,
        Math.max(0.75, +(cal + Math.sin(angulo) * (offsetRadio * 0.06)).toFixed(2))
      );

      puntos.push({
        x: xJitter,
        y: yJitter,
        r: Math.min(22, Math.max(6, Math.round(Math.sqrt(dur) * 1.85))),
        iaReal: ia,
        calidadReal: cal,
        duracion: Number(s.duracion) || 0,
        materia: s.materia || "General",
        tema: subtema,
        dinamicaCognitiva: dinamica,
        modoIA: dinamica, // Alias retrocompatible
        tipoActividad: migrarTipoActividad(s.tipoActividad),
        dominioPrevio: migrarDominioPrevio(s.dominioPrevio),
        fecha: s.fecha || ""
      });
    });

    return {
      puntos,
      cuadrantes: {
        qSinergia,
        qAutonomo,
        qMecanico,
        qFatiga
      }
    };
  }

  /**
   * Desglosa las sesiones por Subtema (extraído de "[Subtema] ..." en Notas) y recopila la bitácora de notas.
   * Incluye la "Curva de Dominio" de cada subtema: la secuencia cronológica de su Dominio Previo
   * (ej. Nuevo → En construcción → Consolidado).
   */
  function analizarInspectorMateria(sesiones) {
    const lista = Array.isArray(sesiones) ? sesiones : [];
    const mapaTemas = {};

    const ordenadas = [...lista].sort((a, b) =>
      `${a.fecha || ""} ${a.horaInicio || ""}`.localeCompare(`${b.fecha || ""} ${b.horaInicio || ""}`)
    );

    ordenadas.forEach((s) => {
      const mat = (s.materia || "General").trim() || "General";
      const { subtema } = extraerSubtemaDeNotas(s.notas, s.tema);
      const tem = subtema || "General";
      const key = `${mat}|||${tem}`;

      if (!mapaTemas[key]) {
        mapaTemas[key] = {
          materia: mat,
          tema: tem,
          minutos: 0,
          sesiones: 0,
          sumaCalidad: 0,
          sumaIA: 0,
          xp: 0,
          ultimaFecha: s.fecha || "",
          curvaDominio: []
        };
      }

      const item = mapaTemas[key];
      item.minutos += Number(s.duracion) || 0;
      item.sesiones += 1;
      item.sumaCalidad += Number(s.calidad) || 0;
      item.sumaIA += Number(s.usoIA) || 0;
      item.xp += Number(s.xp) || 0;
      if ((s.fecha || "") >= item.ultimaFecha) {
        item.ultimaFecha = s.fecha || "";
      }

      const dominio = migrarDominioPrevio(s.dominioPrevio);
      if (item.curvaDominio[item.curvaDominio.length - 1] !== dominio) {
        item.curvaDominio.push(dominio);
      }
    });

    const subtemas = Object.values(mapaTemas)
      .map((item) => ({
        ...item,
        calidadProm: +(item.sumaCalidad / item.sesiones).toFixed(1),
        iaProm: Math.round(item.sumaIA / item.sesiones)
      }))
      .sort((a, b) => b.minutos - a.minutos);

    const bitacoraNotas = [...lista]
      .reverse()
      .filter((s) => s.notas && String(s.notas).trim().length > 0);

    return {
      subtemas,
      bitacoraNotas
    };
  }

  /**
   * Devuelve el texto explicativo para un Tipo de Actividad.
   */
  function obtenerTextoAyudaActividad(tipoActividad) {
    const act = migrarTipoActividad(tipoActividad);
    const item = TIPOS_ACTIVIDAD.find((a) => a.valor === act);
    return item ? item.ayuda : TIPOS_ACTIVIDAD[3].ayuda;
  }

  /**
   * Devuelve el texto explicativo para una Dinámica Cognitiva.
   */
  function obtenerTextoAyudaDinamica(dinamicaCognitiva) {
    const item = DINAMICAS_COGNITIVAS.find((d) => d.valor === dinamicaCognitiva);
    return item ? item.ayuda : DINAMICAS_COGNITIVAS[2].ayuda;
  }

  /**
   * Devuelve el texto explicativo para un nivel de Dominio Previo.
   */
  function obtenerTextoAyudaDominio(dominioPrevio) {
    const dom = migrarDominioPrevio(dominioPrevio);
    const item = NIVELES_DOMINIO.find((d) => d.valor === dom);
    return item ? item.ayuda : NIVELES_DOMINIO[1].ayuda;
  }

  /**
   * Devuelve el texto explicativo para un estado de Fluidez y Avance del Bloque.
   */
  function obtenerTextoAyudaObjetivo(objetivoCumplido) {
    const canon = migrarEstadoObjetivo(objetivoCumplido);
    const item = ESTADOS_OBJETIVO.find((o) => o.valor === canon);
    return item ? item.ayuda : ESTADOS_OBJETIVO[0].ayuda;
  }

  /**
   * Devuelve el texto explicativo para un nivel de calidad de asimilación (1 al 5),
   * advirtiendo si se combina delegación mecánica con calidad alta.
   */
  function obtenerTextoAyudaCalidad(calidad, dinamicaCognitiva = "", usoIA = 0) {
    const numCal = Number(calidad) || 3;
    const base = TEXTOS_CALIDAD[numCal] || TEXTOS_CALIDAD[3];
    if (dinamicaCognitiva === "Delegación / Reproducción" && Number(usoIA) >= 50 && numCal >= 4) {
      return `${base} ⚠️ Nota: marcaste 'Delegación / Reproducción' con ${usoIA}% de IA; si hubo co-creación y debate conceptual real, considera cambiar a '🔄 Andamiaje / Co-creación'.`;
    }
    if (Number(usoIA) >= 75 && dinamicaCognitiva === "Generación Propia" && numCal >= 4) {
      return `${base} 💡 Con ${usoIA}% de IA, '🔄 Andamiaje / Co-creación' suele describir mejor el proceso que 'Generación Propia'.`;
    }
    return base;
  }

  /**
   * Devuelve el texto explicativo según la Dinámica Cognitiva y el porcentaje de IA.
   */
  function obtenerTextoAyudaIA(usoIA, dinamicaCognitiva = "Andamiaje / Co-creación") {
    const itemDin = DINAMICAS_COGNITIVAS.find((d) => d.valor === dinamicaCognitiva);
    if (itemDin) {
      return itemDin.ayuda;
    }
    const val = Number(usoIA) || 0;
    if (val === 0) {
      return "Estudio 100% autónomo sin asistencia de IA.";
    }
    if (val <= 50) {
      return "Uso moderado de IA como andamiaje, consulta o tutoría.";
    }
    return "Uso intensivo de IA: distingue si fue '🔄 Andamiaje / Co-creación' o '🤖 Delegación / Reproducción'.";
  }

  StudyTracker.RPG = {
    XP_BASE_CURVA,
    NIVEL_MAXIMO,
    TRAMOS_RANGO,
    CONTEXTOS,
    TIPOS_ACTIVIDAD,
    DINAMICAS_COGNITIVAS,
    NIVELES_PRODUCCION: DINAMICAS_COGNITIVAS, // Alias retrocompatible
    MODOS_IA: DINAMICAS_COGNITIVAS, // Alias retrocompatible
    NIVELES_DOMINIO,
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
    obtenerBonoComplejidad,
    obtenerBonoObjetivo,
    obtenerBonoDinamica,
    obtenerBonoModoIA: obtenerBonoDinamica,
    calcularXP,
    calcularXpRequeridoParaNivel,
    calcularProgresoRPG,
    calcularKPIs,
    analizarPorHora,
    analizarPorMateria,
    analizarHabitos,
    filtrarSesionesAvanzado,
    analizarEvolucionTemporal,
    analizarMapaCalorCircadiano,
    analizarCuadranteIA,
    analizarInspectorMateria,
    obtenerTextoAyudaActividad,
    obtenerTextoAyudaDinamica,
    obtenerTextoAyudaProduccion: obtenerTextoAyudaDinamica,
    obtenerTextoAyudaDominio,
    obtenerTextoAyudaObjetivo,
    obtenerTextoAyudaCalidad,
    obtenerTextoAyudaIA
  };
})(window);
