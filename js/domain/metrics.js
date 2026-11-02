/**
 * Capa de Dominio: Reglas de negocio puras del sistema de progresión cuadrática infinita
 * (Nivel 2 = 100 XP, 16 rangos profesionales hasta Visionario Nv. 200+),
 * taxonomía cognitiva v3.2 y analítica de hábitos de estudio.
 * No tiene dependencias del DOM ni de almacenamiento externo.
 */
(function (global) {
  const StudyTracker = (global.StudyTracker = global.StudyTracker || {});

  // Taxonomía de 16 niveles orientada a la competencia profesional y maestría (nivel infinito).
  const TRAMOS_RANGO = [
    { minNivel: 200, titulo: "Visionario" },
    { minNivel: 150, titulo: "Autoridad" },
    { minNivel: 120, titulo: "Maestro" },
    { minNivel: 100, titulo: "Élite" },
    { minNivel: 80,  titulo: "Senior" },
    { minNivel: 70,  titulo: "Experto" },
    { minNivel: 60,  titulo: "Referente" },
    { minNivel: 50,  titulo: "Consolidado" },
    { minNivel: 40,  titulo: "Experimentado" },
    { minNivel: 30,  titulo: "Estratega" },
    { minNivel: 25,  titulo: "Táctico" },
    { minNivel: 20,  titulo: "Metódico" },
    { minNivel: 15,  titulo: "Especialista" },
    { minNivel: 10,  titulo: "Analista" },
    { minNivel: 5,   titulo: "Practicante" },
    { minNivel: 1,   titulo: "Iniciado" }
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

  // --- NUEVAS CONSTANTES TAXONÓMICAS (v4.0 Ready - Puente v3.2) ---
  const ESTRATEGIAS_TECNICAS_V4 = [
    "Recuperacion_Activa",     // Recordar y codificar a ciegas (flashcards, ejercicios sin ayuda, autoexplicación)
    "Construccion_Generativa", // Creación propia (redacción de arquitectura, apuntes estructurados, lógica desde cero)
    "Consumo_Receptivo",       // Lectura de documentación, videos, clases grabadas o revisión de código ajeno
    "Delegacion_Ejecutiva"     // Uso de IA o generadores para resolver scripts, entregables o tareas contra reloj
  ];

  const ESTRUCTURAS_PRACTICA = ["Bloqueado", "Intercalado"];

  const MODOS_DISENO_IA = [
    "Sin_IA",
    "Tutor_Andamiaje",
    "Co_Disenador",
    "Generacion_Automatica",
    "Evaluador_Socratico"
  ];

  const MODALIDADES_PROCESAMIENTO = [
    "Extraccion_Esforzada",
    "Reconocimiento_Fluido",
    "Copia_Pasiva"
  ];

  const FRICCIONES_INTERCALADAS = [
    "", // Vacío (NULL en CSV) cuando Estructura_Practica === 'Bloqueado'
    "Sin_Friccion",
    "Friccion_Productiva",
    "Confusion_Excesiva"
  ];

  /**
   * Calculador Automático de Deuda Cognitiva (Fórmula Determinista Puente v3.2 -> v4.0)
   */
  function calcularIndiceDeudaCognitiva(usoIaPorcentaje, dinamica, modalidad = "Extraccion_Esforzada") {
    const ia = Number(usoIaPorcentaje) || 0;
    const din = String(dinamica || "").trim();
    const mod = String(modalidad || "").trim();

    if (
      din === "Delegacion_Mecanica" ||
      din === "Delegación / Reproducción" ||
      (ia >= 75 && mod === "Copia_Pasiva")
    ) {
      return "Critico";
    }
    if (ia >= 50 && (mod === "Reconocimiento_Fluido" || mod === "Copia_Pasiva")) {
      return "Moderado";
    }
    if (
      (din === "Generacion_Propia" || din === "Generación Propia") &&
      ia <= 10
    ) {
      return "Nulo";
    }
    return "Bajo";
  }

  /**
   * Infiere el Modo_Diseno_IA para sesiones históricas que no tenían explícitamente la columna 19.
   */
  function inferirModoDisenoIA(sesion) {
    if (!sesion) return "Sin_IA";
    const explicito = String(sesion.Modo_Diseno_IA || sesion.modoDisenoIA || "").trim();
    if (explicito && MODOS_DISENO_IA.includes(explicito)) return explicito;

    const ia = Number(sesion.usoIA) || 0;
    const din = String(sesion.dinamicaCognitiva || "").trim();
    if (ia === 0) return "Sin_IA";
    if (din === "Delegación / Reproducción" || din === "Delegacion_Mecanica") {
      return "Generacion_Automatica";
    }
    if (din === "Andamiaje / Co-creación" && ia >= 55) {
      return "Co_Disenador";
    }
    return "Tutor_Andamiaje";
  }

  /**
   * Infiere la Modalidad_Procesamiento_Efectiva para sesiones históricas sin la columna 20.
   */
  function inferirModalidadProcesamiento(sesion) {
    if (!sesion) return "Extraccion_Esforzada";
    const explicita = String(
      sesion.Modalidad_Procesamiento_Efectiva || sesion.modalidadProcesamiento || ""
    ).trim();
    if (explicita && MODALIDADES_PROCESAMIENTO.includes(explicita)) return explicita;

    const din = String(sesion.dinamicaCognitiva || "").trim();
    const ia = Number(sesion.usoIA) || 0;
    const cal = Number(sesion.calidad) || 3;
    if (din === "Delegación / Reproducción" || din === "Delegacion_Mecanica") {
      return "Copia_Pasiva";
    }
    if (din === "Recepción Pasiva" || (ia >= 50 && cal <= 3)) {
      return "Reconocimiento_Fluido";
    }
    return "Extraccion_Esforzada";
  }

  /**
   * Infiere la Estructura_Practica ("Bloqueado" | "Intercalado") para cualquier sesión.
   */
  function inferirEstructuraPractica(sesion) {
    if (!sesion) return "Bloqueado";
    const est = String(sesion.Estructura_Practica || sesion.estructuraPractica || "").trim();
    return est === "Intercalado" ? "Intercalado" : "Bloqueado";
  }

  /**
   * Calcula o recupera el Indice_Deuda_Cognitiva de una sesión con soporte retrocompatible.
   */
  function inferirDeudaSesion(sesion) {
    if (!sesion) return "Nulo";
    const tieneModalidadExplicita = Boolean(
      String(sesion.Modalidad_Procesamiento_Efectiva || sesion.modalidadProcesamiento || "").trim()
    );
    const deudaExplicita = String(
      sesion.Indice_Deuda_Cognitiva || sesion.indiceDeudaCognitiva || ""
    ).trim();
    if (tieneModalidadExplicita && ["Nulo", "Bajo", "Moderado", "Critico"].includes(deudaExplicita)) {
      return deudaExplicita;
    }
    return calcularIndiceDeudaCognitiva(
      sesion.usoIA,
      sesion.dinamicaCognitiva,
      inferirModalidadProcesamiento(sesion)
    );
  }

  const TEXTOS_CALIDAD = {
    1: "1 · Again (Olvido / Bloqueo): No se pudo recuperar sin mirar la solución.",
    2: "2 · Hard (Esfuerzo extremo): Vacilación prolongada y alto esfuerzo para resolver o razonar.",
    3: "3 · Good (Recuerdo normal): Comprensión y recuerdo dentro de lo esperado con esfuerzo moderado.",
    4: "4 · Easy (Fluido / Inmediato): Fluido, directo y dominio consolidado sin dudas."
  };

  const VALORES_ACTIVIDAD_SET = new Set([...TIPOS_ACTIVIDAD.map((a) => a.valor), ...ESTRATEGIAS_TECNICAS_V4]);
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
   * Calcula los puntos de experiencia (XP) en función de duración, calificación FSRS (1 a 4),
   * complejidad (+10% desafiante, +20% muy difícil), objetivo (+10% Sí, +5% Parcial),
   * dinámica cognitiva y fricción de discriminación intercalada (+5% si Friccion_Productiva).
   */
  function calcularXP(
    minutos,
    calidad,
    complejidad = "Fácil",
    objetivoCumplido = "No",
    dinamicaCognitiva = "Andamiaje / Co-creación",
    usoIA = 0,
    friccionIntercalada = ""
  ) {
    const min = Math.max(0, Number(minutos) || 0);
    // Escala FSRS 1 a 4 (si viene 5 de sesiones históricas, se topa en 4 para que 4 * 0.25 = +1.0)
    const cal = Math.min(4, Math.max(1, Number(calidad) || 3));
    const bonoComp = obtenerBonoComplejidad(complejidad);
    const bonoObj = obtenerBonoObjetivo(objetivoCumplido);
    const bonoDin = obtenerBonoDinamica(dinamicaCognitiva, usoIA);
    const bonoFriccion =
      String(friccionIntercalada || "").trim() === "Friccion_Productiva" ? 0.05 : 0;
    const multiplicador = Math.max(
      0.5,
      1 + cal * 0.25 + bonoComp + bonoObj + bonoDin + bonoFriccion
    );
    return Math.round(min * multiplicador);
  }

  /**
   * Calcula la experiencia total necesaria para alcanzar un nivel específico.
   * Fórmula: 50 * Nivel * (Nivel - 1)
   */
  function calcularXpParaNivel(nivel) {
    if (nivel <= 1) return 0;
    return 50 * nivel * (nivel - 1);
  }

  /**
   * Alias retrocompatible para calcularXpParaNivel.
   */
  function calcularXpRequeridoParaNivel(nivel) {
    return calcularXpParaNivel(Math.max(1, Math.floor(Number(nivel) || 1)));
  }

  /**
   * Calcula el nivel actual basado en la experiencia total acumulada.
   * Utiliza el despeje de la ecuación cuadrática.
   */
  function calcularNivel(xp) {
    if (xp < 100) return 1;
    // Fórmula cuadrática despejada: L = (1 + sqrt(1 + 0.08 * xp)) / 2
    return Math.floor((1 + Math.sqrt(1 + 0.08 * xp)) / 2);
  }

  /**
   * Obtiene el título del rango profesional correspondiente al nivel actual.
   */
  function obtenerRangoPorNivel(nivel) {
    const tramo = TRAMOS_RANGO.find((t) => nivel >= t.minNivel);
    return tramo ? tramo.titulo : TRAMOS_RANGO[TRAMOS_RANGO.length - 1].titulo;
  }

  /**
   * Calcula el estado de progreso cuadrático infinito a partir del XP total acumulado.
   */
  function calcularProgresoRPG(totalXP) {
    const xpActual = Math.max(0, Math.round(Number(totalXP) || 0));
    const nivelActual = calcularNivel(xpActual);

    const xpInicioNivel = calcularXpParaNivel(nivelActual);
    const xpMetaNivel = calcularXpParaNivel(nivelActual + 1);

    const xpEnNivelActual = xpActual - xpInicioNivel;
    const xpRequeridoTramoActual = Math.max(1, xpMetaNivel - xpInicioNivel);
    const porcentaje = ((xpActual - xpInicioNivel) / xpRequeridoTramoActual) * 100;
    const porcentajeBarra = Math.min(100, Math.max(0, +porcentaje.toFixed(1)));

    const rango = obtenerRangoPorNivel(nivelActual);

    // Determinar el próximo tramo de rango profesional (si aún no se alcanzó el máximo de Nv. 200)
    let proximoTramo = null;
    for (let i = TRAMOS_RANGO.length - 1; i >= 0; i--) {
      if (TRAMOS_RANGO[i].minNivel > nivelActual) {
        proximoTramo = TRAMOS_RANGO[i];
        break;
      }
    }

    return {
      nivel: nivelActual,
      rango,
      proximoRango: proximoTramo ? proximoTramo.titulo : null,
      nivelProximoRango: proximoTramo ? proximoTramo.minNivel : null,
      xpEnNivelActual,
      xpSiguienteNivel: xpRequeridoTramoActual,
      xpInicioNivel,
      xpMetaTotalSiguiente: xpMetaNivel,
      porcentajeBarra,
      totalXP: xpActual,
      esNivelMaximo: false
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
    const promedioCalidadFSRS = totalSesiones
      ? (
          lista.reduce(
            (acc, s) => acc + Math.min(4, Math.max(1, Number(s.calidad) || 3)),
            0
          ) / totalSesiones
        ).toFixed(1)
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

    // Índice de Autonomía Cognitiva (% de sesiones con Generación Propia + Andamiaje vs Delegación)
    const indiceAutonomia = totalSesiones
      ? Math.round(((dinGeneracion + dinAndamiaje) / totalSesiones) * 100)
      : 0;
    const tasaDelegacion = totalSesiones
      ? Math.round((dinDelegacion / totalSesiones) * 100)
      : 0;

    // Desglose y estado predominante de Deuda Cognitiva
    const conteoDeuda = { Nulo: 0, Bajo: 0, Moderado: 0, Critico: 0 };
    lista.forEach((s) => {
      const d = inferirDeudaSesion(s);
      conteoDeuda[d] = (conteoDeuda[d] || 0) + 1;
    });

    let deudaPredominante = "Nulo";
    if (totalSesiones > 0) {
      const ordenDeuda = ["Nulo", "Bajo", "Moderado", "Critico"];
      let maxCount = -1;
      ordenDeuda.forEach((nivel) => {
        if (conteoDeuda[nivel] >= maxCount && conteoDeuda[nivel] > 0) {
          maxCount = conteoDeuda[nivel];
          deudaPredominante = nivel;
        }
      });
    }

    return {
      totalSesiones,
      totalMinutos,
      totalHoras,
      totalXP,
      promedioMinutos,
      promedioCalidad,
      promedioCalidadFSRS,
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
      indiceAutonomia,
      tasaDelegacion,
      conteoDeuda,
      deudaPredominante,
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
      const calFSRS = Math.min(4, Math.max(1, Number(s.calidad || s.Calidad) || 3));
      mapaHoras[horaStr].minutos += Number(s.duracion) || 0;
      mapaHoras[horaStr].sumaCalidad += calFSRS;
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
   * - Calificación FSRS promedio (1-4)
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
      const calFSRS = Math.min(4, Math.max(1, Number(s.calidad || s.Calidad) || 3));
      mapaMaterias[mat].minutos += dur;
      if (din === "Delegación / Reproducción" && Number(s.usoIA) >= 50) {
        mapaMaterias[mat].minutosMecanicos += dur;
      } else {
        mapaMaterias[mat].minutosAprendizaje += dur;
      }
      mapaMaterias[mat].sumaIA += Number(s.usoIA) || 0;
      mapaMaterias[mat].sumaCalidad += calFSRS;
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
   * Analiza los patrones de comportamiento por Tipo de Actividad, Dinámica Cognitiva, Dominio Previo,
   * Modalidad de Procesamiento Efectiva, Estructura de Práctica y Objetivos.
   */
  function analizarHabitos(sesiones) {
    const lista = Array.isArray(sesiones) ? sesiones : [];
    const normCal = (s) => Math.min(4, Math.max(1, Number(s.calidad || s.Calidad) || 3));

    // 1. Por Tipo de Actividad
    const mapaActividades = {};
    lista.forEach((s) => {
      const act = migrarTipoActividad(s.tipoActividad);
      if (!mapaActividades[act]) {
        mapaActividades[act] = { minutos: 0, sumaCalidad: 0, sumaIA: 0, conteo: 0 };
      }
      mapaActividades[act].minutos += Number(s.duracion) || 0;
      mapaActividades[act].sumaCalidad += normCal(s);
      mapaActividades[act].sumaIA += Number(s.usoIA) || 0;
      mapaActividades[act].conteo += 1;
    });

    const actividadesLabels = Object.keys(mapaActividades);
    const minutosPorActividad = actividadesLabels.map((a) => mapaActividades[a].minutos);
    const calidadPorActividad = actividadesLabels.map(
      (a) => +(mapaActividades[a].sumaCalidad / mapaActividades[a].conteo).toFixed(2)
    );

    // 2. Calidad promedio según Nivel de Energía Previa (retrocompatible)
    const resumenEnergia = NIVELES_ENERGIA.map((niv) => {
      const filtradas = lista.filter((s) => s.energiaPrevia === niv.valor);
      const conteo = filtradas.length;
      const calidadProm = conteo
        ? +(filtradas.reduce((acc, s) => acc + normCal(s), 0) / conteo).toFixed(1)
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

    // 5. Calidad y bloqueos según Complejidad (retrocompatible)
    const resumenComplejidad = NIVELES_COMPLEJIDAD.map((comp) => {
      const filtradas = lista.filter((s) => s.complejidad === comp.valor);
      const conteo = filtradas.length;
      const minutos = filtradas.reduce((acc, s) => acc + (Number(s.duracion) || 0), 0);
      const calidadProm = conteo
        ? +(filtradas.reduce((acc, s) => acc + normCal(s), 0) / conteo).toFixed(1)
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

    // 5b. Resumen por Modalidad de Procesamiento Efectiva (v3.2)
    const metaModalidades = [
      { valor: "Extraccion_Esforzada", icono: "🔥", etiqueta: "Extracción Esforzada" },
      { valor: "Reconocimiento_Fluido", icono: "👀", etiqueta: "Reconocimiento Fluido" },
      { valor: "Copia_Pasiva", icono: "📋", etiqueta: "Copia Pasiva" }
    ];
    const resumenModalidad = metaModalidades.map((mod) => {
      const filtradas = lista.filter((s) => inferirModalidadProcesamiento(s) === mod.valor);
      const conteo = filtradas.length;
      const minutos = filtradas.reduce((acc, s) => acc + (Number(s.duracion) || 0), 0);
      const calidadProm = conteo
        ? +(filtradas.reduce((acc, s) => acc + normCal(s), 0) / conteo).toFixed(1)
        : 0;
      const iaProm = conteo
        ? Math.round(filtradas.reduce((acc, s) => acc + (Number(s.usoIA) || 0), 0) / conteo)
        : 0;
      return {
        ...mod,
        conteo,
        minutos,
        calidadProm,
        iaProm
      };
    });

    // 5c. Resumen por Estructura de Práctica (v3.2: Bloqueado vs. Intercalado)
    const metaEstructuras = [
      { valor: "Bloqueado", icono: "🧱", etiqueta: "Bloqueado" },
      { valor: "Intercalado", icono: "🔀", etiqueta: "Intercalado" }
    ];
    const resumenEstructura = metaEstructuras.map((est) => {
      const filtradas = lista.filter((s) => inferirEstructuraPractica(s) === est.valor);
      const conteo = filtradas.length;
      const minutos = filtradas.reduce((acc, s) => acc + (Number(s.duracion) || 0), 0);
      const calidadProm = conteo
        ? +(filtradas.reduce((acc, s) => acc + normCal(s), 0) / conteo).toFixed(1)
        : 0;
      const fluidos = filtradas.filter((s) => {
        const obj = migrarEstadoObjetivo(s.objetivoCumplido);
        return obj === "Flujo limpio" || obj === "Lucha productiva";
      }).length;
      const pctFluidez = conteo ? Math.round((fluidos / conteo) * 100) : 0;
      return {
        ...est,
        conteo,
        minutos,
        calidadProm,
        pctFluidez
      };
    });

    // 6. Balance Cognitivo: Ingesta / Recepción vs. Práctica / Co-creación / Generación
    const actividadesConsumo = new Set([
      "Clase / Cátedra",
      "Clase en Vivo",
      "Estudio Teórico / Conceptual",
      "Consumo_Receptivo"
    ]);
    let minConsumo = 0;
    let minProduccion = 0;
    lista.forEach((s) => {
      const dur = Number(s.duracion) || 0;
      const din = s.dinamicaCognitiva || "";
      const actNorm = migrarTipoActividad(s.tipoActividad);
      if (
        din === "Recepción Pasiva" ||
        actNorm === "Consumo_Receptivo" ||
        (din === "" && actividadesConsumo.has(actNorm))
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
        ? +(filtradas.reduce((acc, s) => acc + normCal(s), 0) / conteo).toFixed(1)
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
        ? +(filtradas.reduce((acc, s) => acc + normCal(s), 0) / conteo).toFixed(1)
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

    // 9. Matriz de Fricción: distribución Flujo / Lucha / Fricción / Parálisis por Dominio Previo y Estructura de Práctica
    const categoriasFriccion = [
      { clave: "Nuevo", tipo: "dominioPrevio", etiqueta: "🌱 Nuevo" },
      { clave: "En construcción", tipo: "dominioPrevio", etiqueta: "🌿 En construcción" },
      { clave: "Consolidado", tipo: "dominioPrevio", etiqueta: "🌳 Consolidado" },
      { clave: "Bloqueado", tipo: "estructuraPractica", etiqueta: "🧱 Bloqueado" },
      { clave: "Intercalado", tipo: "estructuraPractica", etiqueta: "🔀 Intercalado" }
    ];

    const matrizFriccion = categoriasFriccion.map((cat) => {
      const sub = lista.filter((s) =>
        cat.tipo === "estructuraPractica"
          ? inferirEstructuraPractica(s) === cat.clave
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
      resumenModalidad,
      resumenEstructura,
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
      const calFSRS = Math.min(4, Math.max(1, Number(s.calidad || s.Calidad) || 3));
      mapa[clave].minutos += Number(s.duracion) || 0;
      mapa[clave].sumaCalidad += calFSRS;
      mapa[clave].conteo += 1;
      mapa[clave].xp += Number(s.xp) || 0;
    });

    const clavesOrdenadas = Object.keys(mapa).sort();
    const minutos = clavesOrdenadas.map((k) => mapa[k].minutos);
    const xpPorPeriodo = clavesOrdenadas.map((k) => mapa[k].xp);
    const calidadPromedio = clavesOrdenadas.map(
      (k) => +(mapa[k].sumaCalidad / mapa[k].conteo).toFixed(2)
    );
    const conteoSesiones = clavesOrdenadas.map((k) => mapa[k].conteo);

    // Día de la semana más productivo (por minutos acumulados)
    const mapaDiaSemana = {};
    lista.forEach((s) => {
      const ds = s.diaSemana || calcularDiaSemana(s.fecha);
      if (!ds || ds === "Sin fecha") return;
      mapaDiaSemana[ds] = (mapaDiaSemana[ds] || 0) + (Number(s.duracion) || 0);
    });
    let diaSemanaTop = null;
    let maxMinDiaSemana = 0;
    Object.keys(mapaDiaSemana).forEach((ds) => {
      if (mapaDiaSemana[ds] > maxMinDiaSemana) {
        maxMinDiaSemana = mapaDiaSemana[ds];
        diaSemanaTop = ds;
      }
    });

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
      xpPorPeriodo,
      calidadPromedio,
      conteoSesiones,
      diasActivos,
      rachaActual,
      mejorRacha,
      promedioMinPorDiaActivo,
      diaSemanaTop,
      maxMinDiaSemana
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
      const calFSRS = Math.min(4, Math.max(1, Number(s.calidad || s.Calidad) || 3));
      celda.minutos += Number(s.duracion) || 0;
      celda.sesiones += 1;
      celda.sumaCalidad += calFSRS;
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
   * Analiza el Cuadrante de Rendimiento Cognitivo (% Uso IA vs. Calificación FSRS 1-4),
   * agrupando por Dinámica Cognitiva y desplazando puntos superpuestos en espiral.
   */
  function analizarCuadranteIA(sesiones) {
    const lista = Array.isArray(sesiones) ? sesiones : [];
    const conteoCoordenadas = {};
    const puntos = [];

    let qSinergia = 0; // IA >= 35% y Calificación FSRS >= 3 (3-4)
    let qAutonomo = 0; // IA < 35% y Calificación FSRS >= 3 (3-4)
    let qMecanico = 0; // IA >= 35% y Calificación FSRS <= 2 (1-2)
    let qFatiga = 0; // IA < 35% y Calificación FSRS <= 2 (1-2)

    lista.forEach((s) => {
      const ia = Math.min(100, Math.max(0, Number(s.usoIA ?? s.Porcentaje_IA) || 0));
      const cal = Math.min(4, Math.max(1, Number(s.calidad || s.Calidad) || 3));
      const dur = Math.max(5, Number(s.duracion || s.Duracion_Minutos) || 15);
      const dinamica = s.dinamicaCognitiva || s.Dinamica_Cognitiva || "Andamiaje / Co-creación";
      const fluidezReal = migrarEstadoObjetivo(s.objetivoCumplido || s.Objetivo_Cumplido);
      const { subtema } = extraerSubtemaDeNotas(s.notas, s.tema);

      if (ia >= 35 && cal >= 3) qSinergia += 1;
      else if (ia < 35 && cal >= 3) qAutonomo += 1;
      else if (ia >= 35 && cal <= 2) qMecanico += 1;
      else if (ia < 35 && cal <= 2) qFatiga += 1;

      const key = `${ia}_${cal}`;
      const indiceRepetido = conteoCoordenadas[key] || 0;
      conteoCoordenadas[key] = indiceRepetido + 1;

      const angulo = indiceRepetido * 1.9;
      const offsetRadio = indiceRepetido === 0 ? 0 : Math.min(3.5, 1.3 + indiceRepetido * 0.45);
      const xJitter = Math.min(100, Math.max(0, +(ia + Math.cos(angulo) * offsetRadio).toFixed(1)));
      const yJitter = Math.min(
        4.35,
        Math.max(0.65, +(cal + Math.sin(angulo) * (offsetRadio * 0.06)).toFixed(2))
      );

      puntos.push({
        x: xJitter,
        y: yJitter,
        r: Math.min(22, Math.max(6, Math.round(Math.sqrt(dur) * 1.85))),
        iaReal: ia,
        calidadReal: cal,
        duracion: Number(s.duracion || s.Duracion_Minutos) || 0,
        materia: s.materia || s.Materia || "General",
        tema: subtema,
        dinamicaCognitiva: dinamica,
        modoIA: dinamica, // Alias retrocompatible
        objetivoCumplido: fluidezReal,
        tipoActividad: migrarTipoActividad(s.tipoActividad || s.Tipo_Actividad),
        dominioPrevio: migrarDominioPrevio(s.dominioPrevio || s.Dominio_Previo),
        fecha: s.fecha || s.Fecha || "",
        rawSessionData: s
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
      item.sumaCalidadFSRS =
        (item.sumaCalidadFSRS || 0) + Math.min(4, Math.max(1, Number(s.calidad) || 3));
      item.sumaIA += Number(s.usoIA) || 0;
      item.xp += Number(s.xp) || 0;
      if ((s.fecha || "") >= item.ultimaFecha) {
        item.ultimaFecha = s.fecha || "";
      }

      const deuda = inferirDeudaSesion(s);
      item.conteoDeuda = item.conteoDeuda || { Nulo: 0, Bajo: 0, Moderado: 0, Critico: 0 };
      item.conteoDeuda[deuda] = (item.conteoDeuda[deuda] || 0) + 1;

      const dominio = migrarDominioPrevio(s.dominioPrevio);
      if (item.curvaDominio[item.curvaDominio.length - 1] !== dominio) {
        item.curvaDominio.push(dominio);
      }
    });

    const subtemas = Object.values(mapaTemas)
      .map((item) => {
        let deudaPredominante = "Nulo";
        const cd = item.conteoDeuda || { Nulo: 0, Bajo: 0, Moderado: 0, Critico: 0 };
        let maxC = -1;
        ["Nulo", "Bajo", "Moderado", "Critico"].forEach((niv) => {
          if ((cd[niv] || 0) >= maxC && (cd[niv] || 0) > 0) {
            maxC = cd[niv];
            deudaPredominante = niv;
          }
        });
        return {
          ...item,
          calidadProm: +(item.sumaCalidad / item.sesiones).toFixed(1),
          calidadFSRS: +((item.sumaCalidadFSRS || item.sumaCalidad) / item.sesiones).toFixed(1),
          iaProm: Math.round(item.sumaIA / item.sesiones),
          deudaPredominante
        };
      })
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
   * Analiza la Salud Cognitiva, el Diseño de IA vs. Modalidad de Procesamiento Efectiva,
   * la distribución de Deuda Cognitiva y la Brecha de Intención (Pestaña 2).
   */
  function analizarSaludCognitivaIA(sesiones) {
    const lista = Array.isArray(sesiones) ? sesiones : [];
    const total = lista.length;

    const conteoDeuda = { Nulo: 0, Bajo: 0, Moderado: 0, Critico: 0 };
    const conteoModalidad = {
      Extraccion_Esforzada: 0,
      Reconocimiento_Fluido: 0,
      Copia_Pasiva: 0
    };
    const conteoModoDiseno = {};
    const matrizModoModalidad = {};

    MODOS_DISENO_IA.forEach((m) => {
      conteoModoDiseno[m] = 0;
      matrizModoModalidad[m] = {
        Extraccion_Esforzada: 0,
        Reconocimiento_Fluido: 0,
        Copia_Pasiva: 0
      };
    });

    let sesionesBrechaIntencion = 0;
    let brechaDeudaNegativa = 0;
    let brechaSuperacionPositiva = 0;
    let sumaIA = 0;

    const actividadesActivas = new Set([
      "Recuperacion_Activa",
      "Construccion_Generativa",
      "Desarrollo / Código",
      "Práctica / Debugging",
      "Síntesis / Documentación",
      "Repaso / Simulacro"
    ]);
    const actividadesReceptivas = new Set([
      "Consumo_Receptivo",
      "Clase en Vivo",
      "Estudio Teórico / Conceptual"
    ]);

    lista.forEach((s) => {
      const ia = Math.min(100, Math.max(0, Number(s.usoIA) || 0));
      sumaIA += ia;

      const deuda = inferirDeudaSesion(s);
      conteoDeuda[deuda] = (conteoDeuda[deuda] || 0) + 1;

      const modo = inferirModoDisenoIA(s);
      const modalidad = inferirModalidadProcesamiento(s);

      if (!matrizModoModalidad[modo]) {
        matrizModoModalidad[modo] = {
          Extraccion_Esforzada: 0,
          Reconocimiento_Fluido: 0,
          Copia_Pasiva: 0
        };
      }
      conteoModoDiseno[modo] = (conteoModoDiseno[modo] || 0) + 1;
      conteoModalidad[modalidad] = (conteoModalidad[modalidad] || 0) + 1;
      matrizModoModalidad[modo][modalidad] = (matrizModoModalidad[modo][modalidad] || 0) + 1;

      // Detección de Brecha de Intención (Tiempo 1 planeado vs Tiempo 2 ejecutado)
      const act = migrarTipoActividad(s.tipoActividad);
      const din = s.dinamicaCognitiva || "Andamiaje / Co-creación";

      const caidaEnDelegacion =
        (actividadesActivas.has(act) &&
          (din === "Delegación / Reproducción" || modalidad === "Copia_Pasiva")) ||
        ((modo === "Sin_IA" || modo === "Tutor_Andamiaje" || modo === "Evaluador_Socratico") &&
          (modalidad === "Copia_Pasiva" || din === "Delegación / Reproducción"));

      const elevacionActiva =
        actividadesReceptivas.has(act) &&
        (din === "Generación Propia" || din === "Andamiaje / Co-creación") &&
        modalidad === "Extraccion_Esforzada";

      if (caidaEnDelegacion) {
        sesionesBrechaIntencion += 1;
        brechaDeudaNegativa += 1;
      } else if (elevacionActiva) {
        sesionesBrechaIntencion += 1;
        brechaSuperacionPositiva += 1;
      }
    });

    let modoDisenoPredominante = "Sin_IA";
    let maxModoCount = -1;
    MODOS_DISENO_IA.forEach((m) => {
      if ((conteoModoDiseno[m] || 0) > maxModoCount) {
        maxModoCount = conteoModoDiseno[m] || 0;
        modoDisenoPredominante = m;
      }
    });

    const promedioIA = total ? Math.round(sumaIA / total) : 0;
    const pctExtraccionEsforzada = total
      ? Math.round((conteoModalidad.Extraccion_Esforzada / total) * 100)
      : 0;
    const pctCopiaReconocimiento = total ? 100 - pctExtraccionEsforzada : 0;
    const pctBrechaIntencion = total ? Math.round((sesionesBrechaIntencion / total) * 100) : 0;
    const pctBrechaDeuda = total ? Math.round((brechaDeudaNegativa / total) * 100) : 0;

    return {
      totalSesiones: total,
      promedioIA,
      modoDisenoPredominante,
      conteoDeuda,
      conteoModalidad,
      conteoModoDiseno,
      modosDisenoLabels: MODOS_DISENO_IA,
      serieExtraccion: MODOS_DISENO_IA.map((m) => matrizModoModalidad[m].Extraccion_Esforzada),
      serieReconocimiento: MODOS_DISENO_IA.map((m) => matrizModoModalidad[m].Reconocimiento_Fluido),
      serieCopia: MODOS_DISENO_IA.map((m) => matrizModoModalidad[m].Copia_Pasiva),
      pctExtraccionEsforzada,
      pctCopiaReconocimiento,
      sesionesBrechaIntencion,
      brechaDeudaNegativa,
      brechaSuperacionPositiva,
      pctBrechaIntencion,
      pctBrechaDeuda
    };
  }

  /**
   * Analiza los Algoritmos FSRS, Curva del Olvido, Modelo DSR (Dificultad, Estabilidad, Recuperabilidad)
   * y Efectividad de la Práctica Intercalada vs. Bloqueada (Pestaña 3).
   */
  function analizarFSRSConsolidacion(sesiones) {
    const lista = Array.isArray(sesiones) ? sesiones : [];
    const total = lista.length;

    // 1. Distribución de Calificaciones FSRS (1 Again, 2 Hard, 3 Good, 4 Easy)
    const conteoGrades = { 1: 0, 2: 0, 3: 0, 4: 0 };
    let sesionesIntercaladas = 0;
    let sesionesBloqueadas = 0;
    let sesionesFriccionProductiva = 0;

    // Estructura para comparar Bloqueado vs Intercalado por tipo de fricción
    const gruposPractica = {
      Bloqueado: { sesiones: 0, minutos: 0, sumaCalFSRS: 0, xp: 0 },
      Sin_Friccion: { sesiones: 0, minutos: 0, sumaCalFSRS: 0, xp: 0 },
      Friccion_Productiva: { sesiones: 0, minutos: 0, sumaCalFSRS: 0, xp: 0 },
      Confusion_Excesiva: { sesiones: 0, minutos: 0, sumaCalFSRS: 0, xp: 0 }
    };

    // Fecha más reciente del conjunto para calcular días transcurridos de forma consistente
    let maxFechaMs = 0;
    lista.forEach((s) => {
      if (s.fecha) {
        const p = String(s.fecha).slice(0, 10).split("-").map(Number);
        if (p.length === 3 && !p.some(Number.isNaN)) {
          const ms = new Date(p[0], p[1] - 1, p[2]).getTime();
          if (ms > maxFechaMs) maxFechaMs = ms;
        }
      }
    });
    if (!maxFechaMs) maxFechaMs = Date.now();

    // Agrupación cronológica por Materia para estimar el modelo DSR (Difficulty, Stability, Retrievability)
    const ordenadas = [...lista].sort((a, b) =>
      `${a.fecha || ""} ${a.horaInicio || ""}`.localeCompare(`${b.fecha || ""} ${b.horaInicio || ""}`)
    );

    const mapaMateriasDSR = {};

    ordenadas.forEach((s) => {
      const grade = Math.min(4, Math.max(1, Math.round(Number(s.calidad) || 3)));
      conteoGrades[grade] = (conteoGrades[grade] || 0) + 1;

      const dur = Math.max(5, Number(s.duracion) || 0);
      const xp = Number(s.xp) || 0;
      const estructura = inferirEstructuraPractica(s);
      const friccion = String(
        s.Friccion_Discriminacion_Intercalada || s.friccionIntercalada || ""
      ).trim();

      if (estructura === "Intercalado") {
        sesionesIntercaladas += 1;
        const catFric =
          friccion === "Friccion_Productiva" || friccion === "Confusion_Excesiva"
            ? friccion
            : "Sin_Friccion";
        if (catFric === "Friccion_Productiva") sesionesFriccionProductiva += 1;
        gruposPractica[catFric].sesiones += 1;
        gruposPractica[catFric].minutos += dur;
        gruposPractica[catFric].sumaCalFSRS += grade;
        gruposPractica[catFric].xp += xp;
      } else {
        sesionesBloqueadas += 1;
        gruposPractica.Bloqueado.sesiones += 1;
        gruposPractica.Bloqueado.minutos += dur;
        gruposPractica.Bloqueado.sumaCalFSRS += grade;
        gruposPractica.Bloqueado.xp += xp;
      }

      // Estimación DSR por Materia
      const mat = (s.materia || "General").trim() || "General";
      if (!mapaMateriasDSR[mat]) {
        const estabilidadInicial = { 1: 1.2, 2: 3.0, 3: 6.5, 4: 13.0 }[grade] || 6.0;
        mapaMateriasDSR[mat] = {
          materia: mat,
          contexto: s.contexto || "Académico",
          sesiones: 0,
          minutos: 0,
          xp: 0,
          sumaGrade: 0,
          sumaDificultad: 0,
          estabilidadDias: estabilidadInicial,
          ultimaFechaMs: maxFechaMs,
          ultimaFecha: s.fecha || ""
        };
      }

      const dsr = mapaMateriasDSR[mat];
      dsr.sesiones += 1;
      dsr.minutos += dur;
      dsr.xp += xp;
      dsr.sumaGrade += grade;
      if (s.contexto) dsr.contexto = s.contexto;

      // Dificultad instantánea del bloque (escala 1 a 10)
      const baseComp =
        s.complejidad === "Muy difícil" ? 7.5 : s.complejidad === "Desafiante" ? 5.2 : 3.0;
      const ajusteGrade = (4 - grade) * 1.15;
      const objCanon = migrarEstadoObjetivo(s.objetivoCumplido);
      const ajusteFriccion =
        objCanon === "Parálisis / Abandono"
          ? 1.4
          : objCanon === "Con fricción"
            ? 0.7
            : objCanon === "Lucha productiva"
              ? 0.4
              : -0.3;
      const difSesion = Math.min(10, Math.max(1, baseComp + ajusteGrade + ajusteFriccion));
      dsr.sumaDificultad += difSesion;

      // Evolución de Estabilidad S (en días hasta caer a 90% de retención)
      if (dsr.sesiones > 1) {
        const modalidad = inferirModalidadProcesamiento(s);
        const factorDuracion = Math.min(1.4, Math.max(0.75, dur / 45));
        if (grade >= 3 && modalidad !== "Copia_Pasiva") {
          const factorCrecimiento =
            1 + (grade === 4 ? 0.42 : 0.26) * factorDuracion * (estructura === "Intercalado" ? 1.12 : 1);
          dsr.estabilidadDias = Math.min(90, dsr.estabilidadDias * factorCrecimiento);
        } else if (grade === 2) {
          dsr.estabilidadDias = Math.min(90, dsr.estabilidadDias * 1.08);
        } else {
          dsr.estabilidadDias = Math.max(1.0, dsr.estabilidadDias * 0.72);
        }
      }

      if (s.fecha) {
        const p = String(s.fecha).slice(0, 10).split("-").map(Number);
        if (p.length === 3 && !p.some(Number.isNaN)) {
          const ms = new Date(p[0], p[1] - 1, p[2]).getTime();
          if (ms >= dsr.ultimaFechaMs || dsr.sesiones === 1) {
            dsr.ultimaFechaMs = ms;
            dsr.ultimaFecha = s.fecha;
          }
        }
      }
    });

    const burbujasDSR = Object.values(mapaMateriasDSR).map((item) => {
      const S = +item.estabilidadDias.toFixed(1);
      const D = +(item.sumaDificultad / item.sesiones).toFixed(1);
      const diasTranscurridos = Math.max(
        0,
        Math.round((maxFechaMs - item.ultimaFechaMs) / 86400000)
      );
      // Fórmula FSRS: R(t) = (1 + t / (9 * S))^-1
      const R = Math.round((1 / (1 + diasTranscurridos / (9 * Math.max(0.5, S)))) * 100);
      return {
        materia: item.materia,
        contexto: item.contexto,
        sesiones: item.sesiones,
        minutos: item.minutos,
        xp: item.xp,
        calidadFSRS: +(item.sumaGrade / item.sesiones).toFixed(2),
        estabilidadS: S,
        dificultadD: D,
        diasSinRepaso: diasTranscurridos,
        retencionR: R,
        x: S,
        y: D,
        r: Math.min(24, Math.max(7, Math.round(Math.sqrt(item.minutos) * 1.35)))
      };
    });

    const estabilidadPromedioGlobal = burbujasDSR.length
      ? +(
          burbujasDSR.reduce((acc, b) => acc + b.estabilidadS * b.minutos, 0) /
          Math.max(1, burbujasDSR.reduce((acc, b) => acc + b.minutos, 0))
        ).toFixed(1)
      : 6.5;

    const retencionPromedioGlobal = burbujasDSR.length
      ? Math.round(
          burbujasDSR.reduce((acc, b) => acc + b.retencionR, 0) / burbujasDSR.length
        )
      : 0;

    // Curvas Teóricas de Olvido FSRS: R(t) = (1 + t / (9 * S))^-1 * 100 para t = 0..30 días
    const diasCurva = [0, 1, 2, 3, 5, 7, 10, 14, 21, 30];
    const calcCurva = (S) =>
      diasCurva.map((t) => +((1 / (1 + t / (9 * Math.max(0.5, S)))) * 100).toFixed(1));

    const curvasOlvido = {
      diasLabels: diasCurva.map((d) => `${d}d`),
      diasValores: diasCurva,
      curvaUsuario: calcCurva(estabilidadPromedioGlobal),
      curvaGrade4: calcCurva(24.0),
      curvaGrade3: calcCurva(9.0),
      curvaGrade2: calcCurva(3.2),
      curvaGrade1: calcCurva(1.1),
      umbral90: diasCurva.map(() => 90)
    };

    const pctGrades = {
      1: total ? Math.round((conteoGrades[1] / total) * 100) : 0,
      2: total ? Math.round((conteoGrades[2] / total) * 100) : 0,
      3: total ? Math.round((conteoGrades[3] / total) * 100) : 0,
      4: total ? Math.round((conteoGrades[4] / total) * 100) : 0
    };

    const pctIntercalado = total ? Math.round((sesionesIntercaladas / total) * 100) : 0;
    const tasaFriccionProductiva = sesionesIntercaladas
      ? Math.round((sesionesFriccionProductiva / sesionesIntercaladas) * 100)
      : 0;

    const ordenGruposPractica = [
      "Bloqueado",
      "Sin_Friccion",
      "Friccion_Productiva",
      "Confusion_Excesiva"
    ];
    const seriePracticaCalidad = ordenGruposPractica.map((k) => {
      const g = gruposPractica[k];
      return g.sesiones ? +(g.sumaCalFSRS / g.sesiones).toFixed(2) : 0;
    });
    const seriePracticaXpHora = ordenGruposPractica.map((k) => {
      const g = gruposPractica[k];
      return g.minutos > 0 ? Math.round((g.xp / g.minutos) * 60) : 0;
    });
    const seriePracticaSesiones = ordenGruposPractica.map((k) => gruposPractica[k].sesiones);

    return {
      totalSesiones: total,
      conteoGrades,
      pctGrades,
      sesionesIntercaladas,
      sesionesBloqueadas,
      sesionesFriccionProductiva,
      pctIntercalado,
      tasaFriccionProductiva,
      estabilidadPromedioGlobal,
      retencionPromedioGlobal,
      burbujasDSR,
      curvasOlvido,
      practicaIntercalada: {
        claves: ordenGruposPractica,
        calidadPromedio: seriePracticaCalidad,
        xpPorHora: seriePracticaXpHora,
        sesiones: seriePracticaSesiones
      }
    };
  }

  /**
   * Extrae el valor de una sesión para la dimensión solicitada en el Inspector Profundo (Pestaña 4).
   */
  function obtenerValorDimensionSesion(sesion, dimension) {
    if (!sesion) return "General";
    switch (dimension) {
      case "Materia":
        return (sesion.materia || "General").trim() || "General";
      case "Subtema":
        return extraerSubtemaDeNotas(sesion.notas, sesion.tema).subtema || "General";
      case "Tipo_Actividad":
        return migrarTipoActividad(sesion.tipoActividad);
      case "Dinamica_Cognitiva":
        return sesion.dinamicaCognitiva || "Andamiaje / Co-creación";
      case "Modo_Diseno_IA":
        return inferirModoDisenoIA(sesion);
      case "Modalidad_Procesamiento_Efectiva":
        return inferirModalidadProcesamiento(sesion);
      case "Estructura_Practica":
        return inferirEstructuraPractica(sesion);
      case "Dominio_Previo":
        return migrarDominioPrevio(sesion.dominioPrevio);
      case "Contexto":
        return sesion.contexto || "Académico";
      case "Indice_Deuda_Cognitiva":
        return inferirDeudaSesion(sesion);
      default:
        return (sesion.materia || "General").trim() || "General";
    }
  }

  /**
   * Analiza en profundidad cualquier Dimensión categórica ("Power BI View" en Pestaña 4),
   * devolviendo la comparativa entre categorías, los 4 KPIs contextuales del valor activo
   * y el flujo multivariable a través de las 5 etapas cognitivas.
   */
  function analizarDimensionProfunda(sesiones, dimension = "Materia", valorSeleccionado = "Todos") {
    const lista = Array.isArray(sesiones) ? sesiones : [];
    const totalMinGlobal = lista.reduce((acc, s) => acc + (Number(s.duracion) || 0), 0);

    const mapaCat = {};
    lista.forEach((s) => {
      const val = obtenerValorDimensionSesion(s, dimension);
      if (!mapaCat[val]) {
        mapaCat[val] = {
          valor: val,
          sesiones: 0,
          minutos: 0,
          sumaCalFSRS: 0,
          sumaIA: 0,
          xpTotal: 0,
          conteoDeuda: { Nulo: 0, Bajo: 0, Moderado: 0, Critico: 0 },
          conteoDominio: { Nuevo: 0, "En construcción": 0, Consolidado: 0 }
        };
      }
      const item = mapaCat[val];
      const dur = Number(s.duracion) || 0;
      const cal = Math.min(4, Math.max(1, Number(s.calidad) || 3));
      const deuda = inferirDeudaSesion(s);
      const dom = migrarDominioPrevio(s.dominioPrevio);

      item.sesiones += 1;
      item.minutos += dur;
      item.sumaCalFSRS += cal;
      item.sumaIA += Number(s.usoIA) || 0;
      item.xpTotal += Number(s.xp) || 0;
      item.conteoDeuda[deuda] = (item.conteoDeuda[deuda] || 0) + 1;
      item.conteoDominio[dom] = (item.conteoDominio[dom] || 0) + 1;
    });

    const categorias = Object.values(mapaCat)
      .map((item) => {
        let deudaPredominante = "Nulo";
        let maxD = -1;
        ["Nulo", "Bajo", "Moderado", "Critico"].forEach((niv) => {
          if ((item.conteoDeuda[niv] || 0) >= maxD && (item.conteoDeuda[niv] || 0) > 0) {
            maxD = item.conteoDeuda[niv];
            deudaPredominante = niv;
          }
        });
        return {
          valor: item.valor,
          sesiones: item.sesiones,
          minutos: item.minutos,
          horas: +(item.minutos / 60).toFixed(1),
          pctTiempo: totalMinGlobal ? Math.round((item.minutos / totalMinGlobal) * 100) : 0,
          calidadFSRS: +(item.sumaCalFSRS / item.sesiones).toFixed(2),
          iaProm: Math.round(item.sumaIA / item.sesiones),
          xpTotal: item.xpTotal,
          deudaPredominante,
          conteoDeuda: item.conteoDeuda,
          conteoDominio: item.conteoDominio
        };
      })
      .sort((a, b) => b.minutos - a.minutos);

    const valoresDisponibles = categorias.map((c) => c.valor);
    const valorActivo =
      valorSeleccionado && valorSeleccionado !== "Todos" && valoresDisponibles.includes(valorSeleccionado)
        ? valorSeleccionado
        : "Todos";

    const sesionesEnfocadas =
      valorActivo === "Todos"
        ? lista
        : lista.filter((s) => obtenerValorDimensionSesion(s, dimension) === valorActivo);

    const kpisEnfocados = calcularKPIs(sesionesEnfocadas);
    const pctVolumenSobreTotal = totalMinGlobal
      ? Math.round((kpisEnfocados.totalMinutos / totalMinGlobal) * 100)
      : 0;

    // Progresión de Dominio Previo en las sesiones enfocadas
    const domCounts = { Nuevo: 0, "En construcción": 0, Consolidado: 0 };
    sesionesEnfocadas.forEach((s) => {
      const d = migrarDominioPrevio(s.dominioPrevio);
      domCounts[d] = (domCounts[d] || 0) + 1;
    });
    const totalEnfocadas = sesionesEnfocadas.length;

    const resumenContextual = {
      valorActivo,
      volumen: {
        horas: kpisEnfocados.totalHoras,
        minutos: kpisEnfocados.totalMinutos,
        sesiones: totalEnfocadas,
        pctSobreTotal: pctVolumenSobreTotal
      },
      saludIA: {
        iaProm: kpisEnfocados.promedioIA,
        deudaPredominante: kpisEnfocados.deudaPredominante,
        indiceAutonomia: kpisEnfocados.indiceAutonomia,
        conteoDeuda: kpisEnfocados.conteoDeuda
      },
      rendimiento: {
        calidadFSRS: kpisEnfocados.promedioCalidadFSRS,
        xpTotal: kpisEnfocados.totalXP,
        tasaObjetivos: kpisEnfocados.tasaObjetivos
      },
      progresionDominio: {
        nuevo: domCounts.Nuevo,
        construccion: domCounts["En construcción"],
        consolidado: domCounts.Consolidado,
        pctNuevo: totalEnfocadas ? Math.round((domCounts.Nuevo / totalEnfocadas) * 100) : 0,
        pctConstruccion: totalEnfocadas
          ? Math.round((domCounts["En construcción"] / totalEnfocadas) * 100)
          : 0,
        pctConsolidado: totalEnfocadas
          ? Math.round((domCounts.Consolidado / totalEnfocadas) * 100)
          : 0
      }
    };

    // Flujo Multivariable (5 etapas cognitivas: Dominio -> Estrategia -> Dinámica -> Calidad FSRS -> Deuda)
    const agruparEtapa = (fnExtractor) => {
      const m = {};
      sesionesEnfocadas.forEach((s) => {
        const k = fnExtractor(s);
        m[k] = (m[k] || 0) + 1;
      });
      return Object.entries(m)
        .map(([etiqueta, conteo]) => ({
          etiqueta,
          conteo,
          pct: totalEnfocadas ? Math.round((conteo / totalEnfocadas) * 100) : 0
        }))
        .sort((a, b) => b.conteo - a.conteo);
    };

    const flujoMultivariable = {
      dominio: agruparEtapa((s) => migrarDominioPrevio(s.dominioPrevio)),
      estrategia: agruparEtapa((s) => migrarTipoActividad(s.tipoActividad)),
      dinamica: agruparEtapa((s) => s.dinamicaCognitiva || "Andamiaje / Co-creación"),
      calidad: agruparEtapa((s) => {
        const g = Math.min(4, Math.max(1, Math.round(Number(s.calidad) || 3)));
        const nombres = { 1: "1 · Again", 2: "2 · Hard", 3: "3 · Good", 4: "4 · Easy" };
        return nombres[g] || "3 · Good";
      }),
      deuda: agruparEtapa((s) => inferirDeudaSesion(s))
    };

    return {
      dimension,
      valorActivo,
      valoresDisponibles,
      categorias,
      resumenContextual,
      flujoMultivariable,
      sesionesEnfocadas
    };
  }

  const AYUDA_ESTRATEGIAS_V4 = {
    Recuperacion_Activa:
      "🧠 Recuperación Activa: Recordar y codificar a ciegas (flashcards, ejercicios sin ayuda, autoexplicación).",
    Construccion_Generativa:
      "🛠️ Construcción Generativa: Creación propia (redacción de arquitectura, apuntes estructurados, lógica desde cero).",
    Consumo_Receptivo:
      "📖 Consumo Receptivo: Lectura de documentación, videos, clases grabadas o revisión de código ajeno.",
    Delegacion_Ejecutiva:
      "⚡ Delegación Ejecutiva: Uso de IA o generadores para resolver scripts, entregables o tareas contra reloj."
  };

  /**
   * Devuelve el texto explicativo para un Tipo de Actividad o Estrategia Planificada.
   */
  function obtenerTextoAyudaActividad(tipoActividad) {
    const act = migrarTipoActividad(tipoActividad);
    if (AYUDA_ESTRATEGIAS_V4[act]) return AYUDA_ESTRATEGIAS_V4[act];
    const item = TIPOS_ACTIVIDAD.find((a) => a.valor === act);
    return item ? item.ayuda : AYUDA_ESTRATEGIAS_V4.Construccion_Generativa;
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
    TRAMOS_RANGO,
    CONTEXTOS,
    TIPOS_ACTIVIDAD,
    ESTRATEGIAS_TECNICAS_V4,
    ESTRUCTURAS_PRACTICA,
    MODOS_DISENO_IA,
    MODALIDADES_PROCESAMIENTO,
    FRICCIONES_INTERCALADAS,
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
    calcularIndiceDeudaCognitiva,
    inferirModoDisenoIA,
    inferirModalidadProcesamiento,
    inferirEstructuraPractica,
    inferirDeudaSesion,
    calcularXpParaNivel,
    calcularXpRequeridoParaNivel,
    calcularNivel,
    obtenerRangoPorNivel,
    calcularProgresoRPG,
    calcularKPIs,
    analizarPorHora,
    analizarPorMateria,
    analizarHabitos,
    filtrarSesionesAvanzado,
    analizarEvolucionTemporal,
    analizarMapaCalorCircadiano,
    analizarCuadranteIA,
    analizarSaludCognitivaIA,
    analizarFSRSConsolidacion,
    analizarDimensionProfunda,
    analizarInspectorMateria,
    obtenerTextoAyudaActividad,
    obtenerTextoAyudaDinamica,
    obtenerTextoAyudaProduccion: obtenerTextoAyudaDinamica,
    obtenerTextoAyudaDominio,
    obtenerTextoAyudaObjetivo,
    obtenerTextoAyudaCalidad,
    obtenerTextoAyudaIA
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = StudyTracker.RPG;
  }
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));
