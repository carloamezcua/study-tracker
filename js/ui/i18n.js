/**
 * Capa de Internacionalización (i18n) — v3.0:
 * Soporte bilingüe completo Español (ES) / Inglés (EN) en tiempo real.
 * Traduce la interfaz, el cronómetro/Pomodoro, las ayudas dinámicas, la tabla y los gráficos
 * manteniendo intactos los valores canónicos de datos en el Store y en CSV (18 columnas).
 */
(function (global) {
  const StudyTracker = (global.StudyTracker = global.StudyTracker || {});

  const LANG_STORAGE_KEY = "study_tracker_lang";
  let idiomaActual = "es";
  const listeners = new Set();

  // Diccionario de textos de interfaz y plantillas dinámicas
  const DICCIONARIO = {
    es: {
      // Top bar
      brandTitle: "⚔️ StudyTracker — Analytics & RPG",
      brandSubtitle:
        'Sincronización en vivo con <code>data/study-tracker.csv</code> (Altas, ediciones y bajas en tiempo real)',
      statusConnecting: "Conectando con servidor local...",
      statusBrowserMode:
        "Modo navegador (Pulsa 'Sincronizar CSV' para vincular un archivo .csv o ejecuta start.bat)",
      statusLiveSynced: "🟢 Sincronizado en vivo: {path}",
      statusReloaded: "🟢 Recargado desde: data/study-tracker.csv",
      statusLoadedFile: "Cargado: {file}",
      statusExcelLocked: "⚠️ Archivo CSV bloqueado — Ciérralo y pulsa 'Sincronizar CSV'",
      btnSyncExcel: "🔄 Sincronizar CSV",
      btnSyncExcelTitle:
        "Guarda inmediatamente todos los registros actuales en data/study-tracker.csv (o vincula un .csv local)",
      btnReloadExcel: "📂 Recargar CSV",
      btnReloadExcelTitle:
        "Vuelve a leer data/study-tracker.csv si hiciste cambios manuales en el archivo",
      btnImportExcel: "📤 Importar .csv",
      btnImportExcelTitle: "Importar un archivo .csv externo",
      btnExportExcel: "📥 Descargar copia (.csv)",
      btnExportExcelTitle: "Descarga una copia de respaldo de study-tracker.csv",

      // Banner RPG
      rpgLevelSmall: "Nivel",
      rpgRankPrefix: "Rango:",
      rpgXpToNext: "XP para subir de nivel",
      rpgMaxLevel: "MÁX",
      rpgTotalXpLabel: "XP Total Acumulado",

      // Filtros Globales (Contexto, Periodo y Materia)
      filterLabel: "🔍 Contexto:",
      filterAll: "🌐 Todos",
      filterPeriodLabel: "📅 Periodo:",
      periodAll: "Todo",
      period7d: "Últimos 7 días",
      period30d: "Últimos 30 días",
      periodToday: "Hoy",
      filterSubjectLabel: "📚 Materia:",
      filterAllSubjects: "Todas las materias",
      btnResetFilters: "✖ Quitar filtros",

      // Tarjetas KPI
      kpiTotalTimeLabel: "Volumen de Estudio",
      kpiTotalMinutesSub: "{min} minutos en total",
      kpiSessionsLabel: "Autonomía & Sesiones",
      kpiAutonomyPillText: "🧠 {pct}% aut.",
      kpiAvgMinSub: "{min} min promedio / sesión",
      kpiAvgMinZero: "0 min promedio",
      kpiAssimilationLabel: "Calidad FSRS & Foco",
      kpiBestHourNone: "Mejor hora: --:--",
      kpiBestHourPeak: "Pico de foco: ~{hour} (⭐️ {quality})",
      kpiGoalsLabel: "Fluidez & Éxito",
      kpiGoalsSub: "{flow} flujo · {struggle} lucha · {friction} fricc. · {freeze} parál.",
      kpiAiImpactLabel: "Deuda Cognitiva & IA",
      kpiAiSub: "🔄 {dial} andamiaje · 🧠 {auton} gen. propia · 🤖 {mech} deleg.",
      rpgNextRankText: "🎯 Próximo rango: {rank} (Nv. {level})",
      rpgMaxRankText: "🏆 Rango supremo: {rank}",
      debtLevelNulo: "🟢 Nulo",
      debtLevelBajo: "🔵 Bajo",
      debtLevelModerado: "🟠 Moderado",
      debtLevelCritico: "🔴 Crítico",

      // Panel Formulario y Timer
      formTitleNew: "➕ Registrar Sesión",
      formTitleEdit: "✏️ Editando Sesión",
      formSubtitle:
        'Cronometra tu sesión o regístrala en 1 clic. Sincronización automática con <code>data/study-tracker.csv</code>.',
      timerTabStopwatch: "⏱️ Cronómetro",
      timerTabStopwatchTitle: "Cuenta progresiva con captura de inicio y fin",
      timerTabPomodoro: "🍅 Pomodoro",
      timerTabPomodoroTitle: "Temporizador por bloques de enfoque y descanso",
      timerSoundOnTitle: "Sonido al finalizar activo (clic para silenciar)",
      timerSoundOffTitle: "Sonido silenciado (clic para activar)",
      timerCustomMinTitle: "Personalizar minutos del bloque",
      timerStatusReady: "Listo para iniciar",
      timerStatusRunning: "En curso...",
      timerStatusFocusReady: "Enfoque · {min} min",
      timerStatusFocusRunning: "Enfoque en curso ({min} min)",
      timerStatusBreakReady: "Descanso · {min} min",
      timerStatusBreakRunning: "Descanso en curso ({min} min)",
      timerStatusPaused: "En pausa",
      timerStatusCaptured: "Horario aplicado al formulario",
      timerBadgeStartEmpty: "🟢 Inicio: --:--",
      timerBadgeStartVal: "🟢 Inicio: {time}",
      timerBadgeEndEmpty: "🏁 Fin: --:--",
      timerBadgeEndRunning: "🏁 Fin: en curso...",
      timerBadgeEndVal: "🏁 Fin: {time}",
      timerBtnStartSession: "▶️ Iniciar Sesión",
      timerBtnStartBreak: "▶️ Iniciar Descanso",
      timerBtnPause: "⏸️ Pausar",
      timerBtnResume: "▶️ Reanudar",
      timerBtnFinish: "⏹️ Terminar",
      timerBtnFinishTitle: "Detiene el reloj y registra la Hora de Fin en el formulario",
      timerBtnFinishBreakTitle: "Terminar descanso",
      timerBtnResetTitle: "Reiniciar contador a cero",
      previewDurationBase: "⏱️ Duración: {min} min",
      previewDurationBonuses: "⏱️ {min} min ({bonuses})",
      bonusChallenge: "+10% reto",
      bonusHard: "+20% difícil",
      bonusGoalFlow: "+10% flujo limpio",
      bonusGoalStruggle: "+10% lucha productiva",
      bonusGoalFriction: "+5% con fricción",
      bonusGoalYes: "+10% flujo limpio",
      bonusGoalPartial: "+5% con fricción",
      bonusDinOwnAuton: "+10% Gen. Propia",
      bonusAiAuton: "+5% Gen. Propia",
      bonusAiDialogue: "+5% Andamiaje",
      bonusAiMech: "-15% Delegación",

      // Etapas del Formulario (2 Bloques)
      stageStartTitle: "🎯 1. Punto de Partida (Al Iniciar)",
      stageStartBadge: "Se pre-llena automáticamente",
      stageEndTitle: "🏁 2. Evaluación del Bloque (Al Terminar)",
      stageEndBadge: "Califica el esfuerzo y avance",
      btnNewSubjectChip: "+ Nueva",

      // Campos del Formulario
      labelContext: "Contexto / Propósito",
      labelDate: "Fecha",
      labelSubject: "Materia / Proyecto",
      placeholderSubject: "Ej. Snowflake, Base de Datos",
      labelTopic: "Tema específico",
      labelTopicHint: "(Subtema o módulo)",
      placeholderTopic: "Ej. Virtual Warehouses, Rutas MVC...",
      labelStartTime: "Hora Inicio",
      labelEndTime: "Hora Fin",
      btnNowStart: "⏱️ Poner hora actual",
      btnNowEnd: "🏁 Poner hora actual",
      labelStrategy: "Estrategia Planificada",
      labelPracticeStructure: "Estructura de Práctica",
      labelAiDesignMode: "Modo Diseño IA",
      labelProcessingModality: "Modalidad de Procesamiento Efectiva",
      labelInterleavedFriction: "Fricción de Discriminación Intercalada",
      bonusInterleavedFriction: "+5% fricción productiva",
      labelActivity: "Tipo de Actividad",
      labelCognitiveDynamic: "Dinámica Cognitiva (Método y Rol de la IA)",
      labelCognitiveDynamicHint: "(+10% Gen. Propia · +5% Andamiaje · -15% Delegación ≥50%)",
      labelMastery: "Dominio Previo del Tema",
      labelEnergy: "Energía Previa",
      labelComplexity: "Complejidad",
      labelComplexityHint: "(+XP)",
      labelGoal: "¿Fluidez y Avance del Bloque?",
      labelGoalHint: "(Evalúa este bloque, no si terminaste todo el entregable)",
      labelAiSlider: "Porcentaje de apoyo IA:",
      labelQuality: "Calificación FSRS (Grade 1–4)",
      labelQualityClass: "Concentración, Interés y Retención en Clase (Grade 1–4)",
      qualityOpt1: "1 · Again (Olvido / Bloqueo)",
      qualityOpt2: "2 · Hard (Esfuerzo extremo)",
      qualityOpt3: "3 · Good (Recuerdo normal)",
      qualityOpt4: "4 · Easy (Fluido / Inmediato)",
      qualityOpt5: "4 · Easy (Fluido / Inmediato)",
      labelNotes: "Notas y Subtema",
      labelNotesHint: "(Usa [Subtema] al inicio para agrupar)",
      placeholderNotes: "[Subtema] ¿Qué aprendiste, qué debatiste o dónde te trabaste?",
      btnSubmitNew: "💾 Registrar Sesión y Sumar XP",
      btnSubmitEdit: "💾 Actualizar Sesión y Sincronizar CSV",
      btnCancelEdit: "✖ Cancelar edición",

      // Acordeón explicativo de Regla de Oro / Brecha de Intención
      formHelpSummary: "💡 Regla de Oro: Auditar la Brecha de Intención",
      formHelpContent:
        "<strong>No intentes que Tiempo 1 y 2 coincidan:</strong> Tiempo 1 es tu <em>intención</em> y Tiempo 2 es la <em>realidad</em>. Si planeabas programar (<em>Construcción</em>) pero un error te forzó a copiar la solución de ChatGPT, mantén Tiempo 1 como Construcción y Tiempo 2 como Delegación / Copia Pasiva. ¡Esa discrepancia calcula tu <strong>Deuda Cognitiva</strong> real!",

      // Textos dinámicos de ayuda en el formulario
      helpStrategyActiveRecall:
        "🧠 Recuperación Activa: Recordar o resolver problemas cerrados a ciegas (flashcards, ejercicios, o depurar un bug existente aislando variables).",
      helpStrategyGenerativeBuild:
        "🛠️ Construcción Generativa: Producir un artefacto nuevo desde cero (código nuevo, notas estructuradas o arquitectura; no para arreglar bugs existentes).",
      helpStrategyReceptiveConsume:
        "📖 Consumo Receptivo: Absorber información (leer documentación oficial, papers, videos o clases; aún sin producir artefactos).",
      helpStrategyExecutiveDelegation:
        "⚡ Delegación Ejecutiva: Usar herramientas o IA para automatizar la creación de un entregable contra reloj.",
      helpPracticeStructureBlocked:
        "🧱 Bloqueado (Default 90%): Estudiar 1 solo tema continuo durante todo el bloque (ej. 1 hora entera de React Hooks).",
      helpPracticeStructureInterleaved:
        "🔀 Intercalado: Mezcla intencional de temas para forzar al cerebro a cambiar de contexto y discriminar (habilita evaluación de Fricción).",
      helpAiDesignSinIA:
        "🚫 Sin IA: Sesión autónoma planificada sin asistencia artificial.",
      helpAiDesignTutor:
        "🦉 Tutor Andamiaje: La IA te guía socráticamente con preguntas y pistas conceptuales sin darte el código directo.",
      helpAiDesignCoDisenador:
        "👥 Co-Diseñador: Intercambio de ideas en pareja (diseño de arquitectura, lluvia de ideas o debate crítico).",
      helpAiDesignGenerador:
        "🤖 Generación Automática: Automatización de código base, boilerplate, mocks o resúmenes rápidos.",
      helpAiDesignSocratico:
        "🔍 Evaluador Socrático: La IA pone a prueba tu comprensión haciéndote preguntas desafiantes.",
      helpProcessingExtraction:
        "🔥 Extracción Esforzada: Sacaste el conocimiento de tu propia memoria o dedujiste la lógica con esfuerzo cognitivo real.",
      helpProcessingRecognition:
        "👀 Reconocimiento Fluido: Sensación de familiaridad al leer o ver la solución ('ah, sí, claro'), pero sin extraerlo a ciegas.",
      helpProcessingCopy:
        "📋 Copia Pasiva: Transcribir, copiar y pegar código o respuestas sin procesar el trasfondo conceptual.",
      helpInterleavedFrictionNone:
        "🟢 Sin Fricción: El cambio de contexto no causó tropiezos ni interferencia entre temas.",
      helpInterleavedFrictionProductive:
        "🧠 Fricción Productiva (+5% XP): Confundir temas al inicio forzó a tu cerebro a diferenciarlos, consolidando tu aprendizaje.",
      helpInterleavedFrictionExcessive:
        "🔴 Confusión Excesiva: La mezcla fue caótica o prematura y terminó perjudicando la asimilación de ambos temas.",
      helpActClass:
        "👨‍🏫 En vivo con profesor: mide tu atención e interés. Por defecto elige Recepción Pasiva (0% IA), pero si hiciste actividades o usaste IA en clase, ajusta abajo la Dinámica Cognitiva.",
      helpActTheory:
        "📖 Estudio Teórico / Conceptual: Comprender qué es o cómo/por qué funciona un tema (leer documentación/papers, ver un curso grabado o debatir conceptos teóricos con IA).",
      helpActDesign:
        "✍️ Síntesis / Documentación: Traducir y estructurar ideas en un artefacto propio (apuntes, cheatsheets a mano o en PC, resúmenes, diagramas o arquitectura).",
      helpActDev:
        "💻 Desarrollo / Código: Construir e implementar código, notebooks, consultas SQL, scripts o funcionalidades de un proyecto o tarea.",
      helpActPractice:
        "🧪 Práctica / Debugging: Resolver problemas prácticos, laboratorios o depurar errores (debugging) hasta aislar y corregir la causa raíz.",
      helpActReview:
        "🔁 Repaso / Simulacro: Consolidar memoria repasando apuntes previos, flashcards, explicando un tema sin mirar o haciendo exámenes de simulacro.",
      helpDomNew:
        "🌱 Nuevo (Autonomía actual: 0): Cero contactos previos o conocimiento borrado; si te pidieran programar o explicarlo ahorita, no sabrías por dónde empezar.",
      helpDomBuilding:
        "🌿 En construcción (Dependencia externa): Entiendes la noción, pero si cierras la documentación o la IA, te quedas atascado.",
      helpDomConsolidated:
        "🌳 Consolidado (Autonomía total): Puedes explicarlo o programarlo sin manuales ni IA, o es una sesión de mantenimiento rápido.",
      helpDinPassive:
        "👀 Recepción Pasiva (0% ajuste): Leer, escuchar cátedra o ver videos sin producir ni debatir activamente todavía.",
      helpDinDelegation:
        "🤖 Delegación / Reproducción (-15% XP si IA ≥50%): La IA o fuente hizo el trabajo pesado y copiaste o seguiste pasos sin deducir el porqué.",
      helpDinScaffolding:
        "🔄 Andamiaje / Co-creación (+5% XP): Pensar en equipo con la IA; tú propones o deduces y la IA da pistas o aclara conceptos.",
      helpDinOwnGen:
        "🧠 Generación Propia (+10% con 0% IA · +5% base): El esfuerzo mental pesado salió de tu cabeza (la IA se usó 0% o solo para un dummy text mínimo).",
      helpGoalFlow:
        "✅ Flujo limpio (+10% XP): Ritmo constante y sin tropiezos graves. Válido también si te retiraste antes por causas externas pero el tiempo dedicado fluyó impecable.",
      helpGoalStruggle:
        "🧠 Lucha productiva (+10% XP): Duelo mental activo contra un bug o concepto duro; descartaste hipótesis y aprendiste qué no funciona aunque el avance visible sea poco.",
      helpGoalFriction:
        "⚠️ Con fricción (+5% XP): Hubo avance pero con tropiezos, distracciones, cansancio o velocidad irregular.",
      helpGoalFreeze:
        "🔴 Parálisis / Abandono (0% bono): Bloqueo pasivo, dar vueltas en círculos sin probar caminos, procrastinación o sesión en blanco.",
      helpGoalYes:
        "✅ Flujo limpio (+10% XP): Ritmo constante y sin tropiezos graves. Válido también si te retiraste antes por causas externas pero el tiempo dedicado fluyó impecable.",
      helpGoalPartial:
        "⚠️ Con fricción (+5% XP): Hubo avance pero con tropiezos, distracciones, cansancio o velocidad irregular.",
      helpGoalNo:
        "🔴 Parálisis / Abandono (0% bono): Bloqueo pasivo, dar vueltas en círculos sin probar caminos, procrastinación o sesión en blanco.",
      helpQualityClassNote:
        " 👨‍🏫 En Clase: evalúa aquí tu nivel de concentración, interés y retención de la cátedra.",
      helpQualityClassAiDialogue:
        " 👨‍🏫 Clase + Andamiaje IA: usaste IA para despejar dudas o estructurar ideas en vivo; califica qué tanto comprendiste y retuviste la clase.",
      helpQualityClassAiMech:
        " ⚠️ Clase + Delegación: si usaste IA solo para acabar rápido una actividad de clase sin procesarla, considera nivel 1 o 2.",
      helpQuality1:
        "1 · Again (Olvido / Bloqueo): Bloqueo total; si me preguntan mañana no me acordaré sin mirar la solución.",
      helpQuality2:
        "2 · Hard (Esfuerzo extremo): 'Lo saqué, pero sudé sangre'; máxima fatiga cognitiva y vacilación prolongada.",
      helpQuality3:
        "3 · Good (Recuerdo normal): 'Lo resolví bien, tuve que pensarlo un poco, pero todo en orden' (esfuerzo moderado).",
      helpQuality4:
        "4 · Easy (Fluido / Inmediato): 'Un paseo por el parque'; directo, sin dudas y con dominio total.",
      helpQuality5:
        "4 · Easy (Fluido / Inmediato): Dominio consolidado sin dudas.",
      helpQualityWarnMech:
        " ⚠️ Nota: seleccionaste 'Delegación / Reproducción'; si solo copiaste sin profundizar, considera nivel 1 o 2 (o cambia a 'Andamiaje / Co-creación' si aprendiste debatiendo con la IA).",
      helpQualityWarnHighAi:
        " 💡 Con {ai}% de IA, califica con 3-4 solo si hubo diálogo y comprensión profunda, no solo fluidez mecánica.",

      // Pestañas y Gráficos Analíticos Interactivos
      tabTimeTitle: "📈 1. Progresión & Circadiano",
      tabAiTitle: "🧠 2. Salud Cognitiva & IA",
      tabHabitsTitle: "📉 3. FSRS, DSR & Hábitos",
      tabInspectorTitle: "🔬 4. Inspector & Notas",
      chartEvoTitle: "📅 Evolución Temporal de Horas, XP y Calidad",
      chartEvoSubtitle:
        "Cuánto estudias por día, semana o mes y cómo evoluciona tu calidad de asimilación y ganancia de XP.",
      evoBtnDay: "Día",
      evoBtnWeek: "Semana",
      evoBtnMonth: "Mes",
      evoStreakBadgeText: "🔥 Racha: {streak}d (Mejor: {best}d)",
      evoActiveDaysBadgeText: "📅 Días activos: {days}",
      evoAvgDayBadgeText: "⏱️ Promedio / día activo: {min} min",
      evoBestWeekdayText: "📆 Día top: {day} ({min}m)",
      evoBestWeekdayEmpty: "📆 Día top: --",
      iaKpiLeverageText: "🤖 Apalancamiento IA: {ia}% · Modo: {mode}",
      iaKpiExtractionText: "🔥 Extracción Esforzada: {ext}% vs. {pas}% Pasivo/Fluido",
      iaKpiIntentionGapText: "⚖️ Brecha de Intención: {pct}% ({count} bloq.)",
      chartDebtTitle: "🍩 Índice de Deuda Cognitiva",
      chartDebtSubtitle:
        "Proporción de bloques según riesgo de delegación pasiva e ilusión de competencia.",
      chartAiDesignModalityTitle: "🧩 Modo Diseño IA × Modalidad Efectiva",
      chartAiDesignModalitySubtitle:
        "Audita si el rol planeado de la IA derivó en extracción esforzada o copia pasiva.",
      chartForgettingTitle: "📉 Algoritmos FSRS & Curva Teórica del Olvido (DSR)",
      chartForgettingHint: "Decaimiento R(t) = (1 + t / 9S)⁻¹ · Umbral crítico 90%",
      chartForgettingSubtitle:
        "Proyección de recuperabilidad memórica a 30 días según tu estabilidad promedio (S) frente a los 4 grados FSRS.",
      fsrsKpiGradeDistText: "🎯 FSRS: 1:{g1}% · 2:{g2}% · 3:{g3}% · 4:{g4}%",
      fsrsKpiRetentionText: "🧠 Retención Estimada (R): {r}% · Estabilidad (S): {s}d",
      fsrsKpiInterleavingText: "🔀 Intercalado: {inter}% · Fricción Productiva: {fric}%",
      forgettingUserCurve: "⭐ Tu Curva Promedio (S={s}d)",
      forgettingThreshold90: "🎯 Umbral Repaso 90%",
      forgettingAxisDays: "Días transcurridos desde el estudio (t)",
      forgettingAxisRetention: "Recuperabilidad Estimada R(t) %",
      chartDsrBubbleTitle: "🫧 Mapa de Consolidación DSR por Materia",
      chartDsrBubbleSubtitle:
        "Estabilidad S (días, eje X) vs. Dificultad D (1–10, eje Y). Tamaño = Minutos.",
      dsrAxisStability: "Estabilidad Memórica S (días hasta 90% R)",
      dsrAxisDifficulty: "Dificultad Estimada D (1-10)",
      chartInterleavedTitle: "🔀 Efectividad: Bloqueado vs. Intercalado",
      chartInterleavedSubtitle:
        "Calidad FSRS (1–4) y velocidad de XP/hora según estructura y fricción de discriminación.",
      interleavedCatBlocked: "🧱 Bloqueado",
      interleavedCatNoFric: "🟢 Sin Fricción",
      interleavedCatProdFric: "🧠 Fricción Prod.",
      interleavedCatConf: "🔴 Confusión",
      interleavedDsQuality: "Calidad FSRS (1-4)",
      interleavedDsXpHour: "XP / Hora",
      deepInspectorTitle: "🔬 Inspector Profundo por Dimensión (Power BI View)",
      deepInspectorSubtitle:
        "Audita cualquier variable categórica, haz clic en una barra para aislar su perfil o inspecciona su flujo multivariable.",
      inspectorDimLabel: "📐 Dimensión:",
      inspectorValLabel: "🎯 Valor (Drill-down):",
      inspectorValAll: "🌐 Todos (Comparativa)",
      dimOptSubject: "📚 Materia / Proyecto",
      dimOptSubtopic: "🗂️ Subtema [Corchetes]",
      dimOptStrategy: "🧭 Estrategia / Actividad",
      dimOptDynamic: "🔄 Dinámica Cognitiva",
      dimOptAiDesign: "🤖 Modo Diseño IA",
      dimOptModality: "🔥 Modalidad Procesamiento",
      dimOptStructure: "🔀 Estructura Práctica",
      dimOptMastery: "🌱 Dominio Previo",
      dimOptContext: "🎓 Contexto",
      dimOptDebt: "🍩 Deuda Cognitiva",
      inspKpiVolTitle: "📊 Volumen de Estudio",
      inspKpiVolSubText: "{sess} sesiones ({min} min)",
      inspKpiAiTitle: "🧠 Salud Cognitiva & IA",
      inspKpiAiSubText: "{auton}% autonomía cognitiva",
      inspKpiPerfTitle: "⚡ Rendimiento FSRS & XP",
      inspKpiDomTitle: "🌱 Transición de Dominio",
      inspectorFlowTitle:
        "🔀 Flujo Multivariable de Sesiones (Dominio ➔ Estrategia ➔ Dinámica ➔ Calidad ➔ Deuda)",
      flowStage1Mastery: "1. Dominio Previo",
      flowStage2Strategy: "2. Estrategia",
      flowStage3Dynamic: "3. Dinámica",
      flowStage4Quality: "4. Calidad FSRS",
      flowStage5Debt: "5. Deuda Cognitiva",
      chartDsQualityFSRS: "Calidad FSRS (1-4)",
      heatmapTitle: "🔥 Mapa de Calor de Ritmo Circadiano (Día × Franja)",
      heatmapSubtitle:
        "Descubre tu ventana dorada cruzando los días de la semana contra las 4 franjas de 6h (Madrugada 00-05, Mañana 06-11, Tarde 12-17, Noche 18-23).",
      heatBtnMin: "⏱️ Minutos",
      heatBtnQual: "⭐️ Asimilación",
      heatBtnEnergy: "🔋 Energía",
      heatmapCornerLabel: "Día \\ Franja",
      heatmapGoldenText:
        "🏆 Ventana dorada: {day} por la {slot} (⭐️ {quality}/5 · {min} min acumulados)",
      heatmapGoldenEmpty: "🏆 Registra sesiones para descubrir tu ventana dorada de enfoque",
      chart1ToggleSummary: "🕒 Ver desglose detallado hora por hora (00:00 - 23:00)",
      chartQuadTitle: "🎯 Cuadrante de Rendimiento Cognitivo (% IA vs. Asimilación)",
      chartQuadHint: "Tamaño de burbuja = Duración · Color = Dinámica Cognitiva",
      chartQuadSubtitle:
        "Detecta si la IA potencia tu aprendizaje (arriba-derecha) o genera ilusión de fluidez con baja retención (abajo-derecha).",
      quadSynergyText: "🚀 Sinergia IA (≥35% IA, ⭐️ 4-5): {count}",
      quadAutonText: "🧠 Dominio Propio (<35% IA, ⭐️ 4-5): {count}",
      quadMechText: "🤖 Ilusión Mecánica (≥35% IA, ⭐️ 1-2): {count}",
      quadFatigueText: "🪫 Fricción / Fatiga (<35% IA, ⭐️ 1-2): {count}",
      chartAxisAiPct: "Porcentaje de Uso de IA (%)",
      chart1Title: "🕒 Rendimiento y Asimilación por Hora del Día",
      chart1Hint: "Descubre tus picos biológicos de enfoque",
      chart1Subtitle:
        "Compara los minutos estudiados (barras) y tu calidad de asimilación promedio (línea) según la hora de inicio.",
      chart2Title: "📚 Impacto de IA y Aprendizaje por Materia",
      chart2Hint: "Aprendizaje real vs. Delegación mecánica",
      chart2ClickHint: "💡 Haz clic en una barra para filtrar por esa materia",
      chart2Subtitle:
        "Contrasta tus minutos de aprendizaje real (Generación Propia, Andamiaje o Recepción) frente a la delegación mecánica y tu asimilación (1-5).",
      chart3Title: "🧠 Patrones de Hábito: 6 Actividades y Balance Cognitivo",
      chart3Hint: "Comportamiento por tipo de tarea y método",
      chart3Subtitle:
        "Minutos y asimilación promedio según las 6 actividades de estudio y proporción entre consumo receptivo (Clase, Estudio Teórico) y producción activa (Síntesis, Código, Práctica, Repaso).",
      balanceConsumeLabel: "📖 Consumo (Clase / Estudio Teórico): {min} min ({pct}%)",
      balanceProduceLabel: "💻 Producción (Síntesis / Código / Práctica / Repaso): {min} min ({pct}%)",
      frictionChartTitle: "🧱 Matriz de Fricción: Fluidez vs. Tropiezos y Bloqueos",
      frictionChartHint: "Por Complejidad y Dominio Previo",
      frictionChartSubtitle:
        "Proporción de bloques con flujo limpio (✅ Sí), con tropiezos (⚠️ Parcial) o bloqueos (❌ No) según el nivel de reto y tu dominio previo del concepto.",
      frictionDsFlow: "✅ Flujo limpio",
      frictionDsStruggle: "🧠 Lucha productiva",
      frictionDsFriction: "⚠️ Con fricción",
      frictionDsFreeze: "🔴 Parálisis / Abandono",
      frictionDsYes: "✅ Flujo limpio",
      frictionDsPartial: "⚠️ Con fricción",
      frictionDsNo: "🔴 Parálisis / Abandono",
      frictionAxisSessions: "Sesiones",
      habitMatrixTitle: "🧠 Impacto de Dinámica Cognitiva, Dominio Previo, Energía y Reto",
      habitMatrixSubtitle:
        "Descubre cómo cambia tu retención promedio y el uso de IA según tu dinámica cognitiva, tu dominio previo del tema y tu energía inicial.",
      habitByProductionTitle: "🧠 Por Dinámica Cognitiva",
      habitByMasteryTitle: "🌱 Por Dominio Previo del Tema",
      habitByEnergyTitle: "🔋 Por Energía Inicial",
      habitByComplexityTitle: "🎯 Por Complejidad del Tema",
      inspectorTopicsTitle: "🗂️ Radiografía por Subtemas ([Subtema] en Notas)",
      inspectorTopicsHint: "Haz clic en cualquier subtema para filtrar su materia",
      inspectorTopicsSubtitle:
        "Desglose de tiempo invertido, sesiones, asimilación promedio, uso de IA y XP por cada subtema etiquetado con [Corchetes] en Notas.",
      inspectorNotesTitle: "📝 Bitácora de Notas y Reflexiones",
      inspectorNotesSubtitle:
        "Tus observaciones, aprendizajes y bloqueos registrados en las sesiones filtradas.",
      inspectorNoNotes: "No hay notas registradas en este filtro.",
      chartNoData: "Sin datos",
      chartAxisMinutes: "Minutos",
      chartAxisAssimilation: "Asimilación (1-5)",
      chartDsAssimilationAvg: "Asimilación Promedio (1-5)",
      chartDsMinutesStudied: "Minutos Estudiados",
      chartDsAssimilationShort: "Asimilación (1-5)",
      chartDsMinLearning: "Min. Aprendizaje (Gen. Propia / Andamiaje / Recepción)",
      chartDsMinMechanical: "Min. Delegación / Reproducción",
      chartDsMinByActivity: "Minutos por Actividad",
      habitEnergyPrefix: "Energía",
      habitNoRecords: "Sin registros",
      habitSessionsShort: "ses.",

      // Tabla de Historial
      historyTitle: "📋 Historial de Sesiones Registradas (Clic en ✏️ para editar o ✖ para borrar)",
      btnClearAll: "🗑️ Vaciar todo / Reiniciar a 0",
      historyShowingRecent: "Mostrando los últimos {shown} de {total} registros (más recientes primero)",
      historyShowingAll: "Mostrando los {total} registros (más recientes primero)",
      btnShowAllHistory: "📂 Ver todos ({total})",
      btnShowRecentHistory: "⬆️ Mostrar solo últimos 5",
      thDateSlot: "Fecha / Franja",
      thSchedule: "Horario",
      thSubjectTopic: "Materia / Subtema",
      thActivity: "Estrategia · Dominio",
      thEnergyChallengeGoal: "Fluidez · Estructura",
      thDuration: "Duración",
      thAssimilation: "FSRS · Modalidad",
      thAiModePct: "IA · Dinámica · Deuda",
      thXpEarned: "XP Ganados",
      thNotes: "Notas",
      thActions: "Acciones",
      tableAiSupportSub: "{pct}% IA",
      btnEditSessionTitle: "Editar esta sesión",
      btnDeleteSessionTitle: "Eliminar esta sesión",

      // Guía de Referencia inferior (Manual exhaustivo campo por campo en 8 tarjetas v3.2)
      guideMainTitle: "📖 Guía de Referencia y Criterios del Sistema (Manual Campo por Campo)",
      guideMainSubtitle:
        "Criterios exactos, ejemplos prácticos y reglas anti-confusión para cada campo del formulario (Tiempo 1 y Tiempo 2), indicadores cognitivos y fórmulas RPG.",
      guideCard1Title: "🎓 1. Contexto, Materia, [Subtema] y Horario",
      guideCard1Li1:
        "<strong>🎓 Académico / 🏅 Certificación:</strong> Materias escolares/universitarias vs. preparación de exámenes oficiales (ej. AWS, Snowflake, idiomas).",
      guideCard1Li2:
        "<strong>🚀 Proyecto Propio / 🤝 Externo:</strong> Portafolio, investigación o herramientas personales vs. clientes, trabajo freelance o encargos externos.",
      guideCard1Li3:
        "<strong>Materia vs. Tema específico (<code>[Subtema]</code>):</strong> <em>Materia</em> es el curso o proyecto general (ej. <code>Base de Datos</code>); <em>Tema específico</em> es el módulo puntual (ej. <code>Índices B-Tree</code>) que se guarda como <code>[Subtema]</code> al inicio de Notas para el Inspector.",
      guideCard1Li4:
        "<strong>Franjas Circadianas (6h):</strong> Se calculan por tu <em>Hora Inicio</em>: <code>00:00–05:59 Madrugada</code> · <code>06:00–11:59 Mañana</code> · <code>12:00–17:59 Tarde</code> · <code>18:00–23:59 Noche</code> (soporta cruce de medianoche).",
      guideCard2Title: "🌱 2. Dominio Previo del Tema (Tiempo 1)",
      guideCard2Li1:
        "<strong>Prueba de Cerrar Documentación:</strong> Antes de iniciar, pregúntate: <em>\"Si cierro internet, mis apuntes y la IA ahora mismo, ¿puedo resolver o explicar esto solo?\"</em>",
      guideCard2Li2:
        "<strong>🌱 Nuevo (Autonomía 0%):</strong> Primer contacto o concepto olvidado; frente a una hoja o editor en blanco no sabrías ni cómo arrancar.",
      guideCard2Li3:
        "<strong>🌿 En construcción (Dependencia externa):</strong> Entiendes la idea general, pero si cierras la documentación o la IA te trabas en pasos o sintaxis.",
      guideCard2Li4:
        "<strong>🌳 Consolidado (Autonomía total):</strong> Puedes implementarlo o explicarlo de principio a fin sin ayuda externa, o es mantenimiento rutinario.",
      guideCard2Li5:
        "<strong>Impacto en Deuda:</strong> Delegar a la IA un tema <code>🌱 Nuevo</code> sin procesarlo dispara el riesgo de <strong>Deuda Cognitiva Crítica</strong>.",
      guideCard3Title: "🧭 3. Estrategia Planificada (Tiempo 1)",
      guideCard3Li1:
        "<strong>🧠 Recuperación Activa:</strong> Extraer información de tu memoria sin mirar apuntes (flashcards, simulacros) o <strong>depurar un bug existente (debugging)</strong> aislando variables e hipótesis.",
      guideCard3Li2:
        "<strong>🛠️ Construcción Generativa:</strong> Crear un artefacto nuevo desde cero (programar una función nueva, diseñar arquitectura o escribir apuntes/resúmenes propios). <em>(Crear = Construcción; Arreglar bug = Recuperación)</em>.",
      guideCard3Li3:
        "<strong>📖 Consumo Receptivo:</strong> Absorber información externa (leer documentación oficial, libros, papers, asistir a clase o ver videocursos) sin producir entregables aún.",
      guideCard3Li4:
        "<strong>⚡ Delegación Ejecutiva:</strong> Automatizar código repetitivo, scripts o trámites con IA cuando la prioridad es entregar rápido y no memorizar ese paso.",
      guideCard3Li5:
        "<strong>Compatibilidad v3:</strong> Las 6 actividades clásicas se mapean automáticamente a estas 4 estrategias en todo el dashboard.",
      guideCard4Title: "🧱 4. Estructura de Práctica y Fricción Intercalada",
      guideCard4Li1:
        "<strong>🧱 Bloqueado (1 solo tema — 90% de casos):</strong> Estudiar o programar un único tema continuo durante toda la sesión (ej. 1h solo de React Hooks). Oculta el campo de fricción.",
      guideCard4Li2:
        "<strong>🔀 Intercalado (Problemas mixtos):</strong> Alternar intencionalmente entre varios temas o tipos de problemas en el mismo bloque para forzar al cerebro a elegir qué método usar.",
      guideCard4Li3:
        "<strong>🟢 Sin Fricción (en Intercalado):</strong> Cambiaste entre temas o ejercicios distintos con fluidez y sin confundir los métodos.",
      guideCard4Li4:
        "<strong>🧠 Fricción Productiva (+5% XP):</strong> Al mezclar temas dudaste cuál aplicar, forzando a tu mente a comparar y discriminar diferencias clave (máxima retención).",
      guideCard4Li5:
        "<strong>🔴 Confusión Excesiva (0% bono):</strong> Mezclaste temas demasiado verdes y terminaste abrumado sin consolidar ninguno (conviene volver a <code>🧱 Bloqueado</code>).",
      guideCard5Title: "🤖 5. Modo de Diseño con IA (Tiempo 1)",
      guideCard5Li1:
        "<strong>🚫 Sin IA:</strong> Planeas resolver el bloque 100% a pulmón (solo tu mente, compilador o documentación oficial estática).",
      guideCard5Li2:
        "<strong>🦉 Tutor Andamiaje:</strong> Le pides a la IA explicaciones conceptuales, analogías o pistas graduales <strong>sin que te escriba la solución final</strong>.",
      guideCard5Li3:
        "<strong>👥 Co-Diseñador:</strong> Pensar en pareja (<em>pair programming</em> / arquitectura): tú propones un diseño y debates pros, contras y mejoras con la IA.",
      guideCard5Li4:
        "<strong>🤖 Generación Automática:</strong> Le pides a la IA que genere directamente código base, boilerplate, mocks, regex o resúmenes operativos.",
      guideCard5Li5:
        "<strong>🔍 Evaluador Socrático:</strong> Tú resuelves o explicas primero el tema y usas la IA como examinador para que cuestione tu lógica o busque fallos.",
      guideCard6Title: "🔄 6. Dinámica Real, % IA y Brecha de Intención (Tiempo 2)",
      guideCard6Li1:
        "<strong>👀 Recepción Pasiva (0% ajuste):</strong> Solo leíste, escuchaste clase o viste videos sin producir ni debatir activamente todavía.",
      guideCard6Li2:
        "<strong>🤖 Delegación / Reproducción (-15% XP si IA &ge;50%):</strong> La IA resolvió el problema pesado y tú solo copiaste, pegaste o seguiste pasos mecánicamente.",
      guideCard6Li3:
        "<strong>🔄 Andamiaje / Co-creación (+5% XP):</strong> Dialogaste con la IA, cuestionaste el porqué, depuraste sus ideas y comprendiste cada línea construida.",
      guideCard6Li4:
        "<strong>🧠 Generación Propia (+10% sin IA / +5% consulta mínima):</strong> La solución salió de tu cabeza (0% IA o solo una consulta puntual de sintaxis).",
      guideCard6Li5:
        "<strong>⚖️ Regla de la Brecha de Intención:</strong> <strong>No fuerces a que Tiempo 1 y 2 coincidan.</strong> Si planeabas <em>Tutor Andamiaje</em> (T1) pero terminaste en <em>Delegación</em> (T2), regístralo tal cual para medir tu Deuda Cognitiva.",
      guideCard7Title: "🎯 7. Fluidez y Avance del Bloque (Tiempo 2)",
      guideCard7Li1:
        "<strong>Regla de Oro:</strong> Evalúa <strong>cómo fluyó este bloque de tiempo</strong>, NO si ya terminaste todo el entregable. Si paraste antes por algo externo pero estudiaste enfocado, es <em>Flujo limpio</em>.",
      guideCard7Li2:
        "<strong>✅ Flujo limpio (+10% XP):</strong> Concentración sostenida, ritmo constante y avance sin bloqueos graves en lo que tocaba hoy.",
      guideCard7Li3:
        "<strong>🧠 Lucha productiva (+10% XP):</strong> Duelo mental intenso contra un bug o concepto duro; aunque avanzaste pocas líneas, probaste hipótesis y aprendiste qué no funciona.",
      guideCard7Li4:
        "<strong>⚠️ Con fricción (+5% XP):</strong> Lograste avanzar, pero con distracciones, cansancio, interrupciones o ritmo irregular.",
      guideCard7Li5:
        "<strong>🔴 Parálisis / Abandono (0% bono):</strong> Bloqueo pasivo frente a la pantalla, dar vueltas sin probar nada, procrastinación o abandono del bloque.",
      guideCard8Title: "⭐️ 8. Calificación FSRS (1–4), Modalidad y Fórmulas",
      guideCard8Li1:
        "<strong>Grados FSRS (1–4):</strong> <code>1 · Again</code> (olvido/bloqueo, <em>S≈1.2d</em>) · <code>2 · Hard</code> (salió con esfuerzo extremo, <em>S≈3d</em>) · <code>3 · Good</code> (comprensión sólida esperada, <em>S≈6.5d</em>) · <code>4 · Easy</code> (dominio inmediato sin dudas, <em>S≈13d</em>).",
      guideCard8Li2:
        "<strong>Modalidad Efectiva:</strong> 🔥 <em>Extracción Esforzada</em> (lo sacaste de tu mente/lógica) vs. 👀 <em>Reconocimiento Fluido</em> (lo leíste y dijiste \"ah, claro\", trampa de familiaridad) vs. 📋 <em>Copia Pasiva</em> (transcripción sin procesar).",
      guideCard8Li3:
        "<strong>Deuda Cognitiva (<code>🟢 Nulo</code> a <code>🔴 Crítico</code>):</strong> Sube al combinar <code>📋 Copia Pasiva</code> o <code>🤖 Delegación</code> con alto <code>% IA</code> en temas nuevos o al calificar <code>4 · Easy</code> habiendo copiado.",
      guideCard8Li4:
        "<strong>Fórmula XP (v3.2):</strong> <code>ROUND(Min * MAX(0.5, 1 + Calidad*0.25 + BonoReto + BonoFluidez + BonoDinamica + BonoFriccion))</code>.",
      guideCard8Li5:
        "<strong>Curvas Matemáticas:</strong> Nivel cuadrático infinito <code>XP(L) = 50 * L * (L - 1)</code> (Nv. 2 = 100 XP, 16 rangos hasta <em>Visionario</em> Nv. 200+) · Olvido FSRS <code>R(t) = (1 + t/(9S))⁻¹</code>.",

      // Alertas y confirmaciones
      alertServerOffline:
        "El servidor local no está activo. Ejecuta 'start.bat' o 'npm start' para activar el guardado directo en data/study-tracker.csv.",
      alertReloadError:
        "No se pudo leer data/study-tracker.csv desde el servidor local. Asegúrate de haber iniciado 'start.bat' o 'npm start'.",
      alertImportError:
        "No se pudo leer el archivo seleccionado. Verifica que sea un .csv válido.",
      confirmClearAll:
        "¿Seguro que deseas vaciar todas las sesiones registradas en el dashboard y en el CSV?"
    },

    en: {
      // Top bar
      brandTitle: "⚔️ StudyTracker — Analytics & RPG",
      brandSubtitle:
        'Live sync with <code>data/study-tracker.csv</code> (Real-time create, edit & delete)',
      statusConnecting: "Connecting to local server...",
      statusBrowserMode:
        "Browser mode (Click 'Sync CSV' to link a local .csv file or run start.bat)",
      statusLiveSynced: "🟢 Live synced: {path}",
      statusReloaded: "🟢 Reloaded from: data/study-tracker.csv",
      statusLoadedFile: "Loaded: {file}",
      statusExcelLocked: "⚠️ CSV file locked — Close it and click 'Sync CSV'",
      btnSyncExcel: "🔄 Sync CSV",
      btnSyncExcelTitle:
        "Immediately save all current records to data/study-tracker.csv (or link a local .csv file)",
      btnReloadExcel: "📂 Reload CSV",
      btnReloadExcelTitle:
        "Re-read data/study-tracker.csv if you made manual edits to the file",
      btnImportExcel: "📤 Import .csv",
      btnImportExcelTitle: "Import an external .csv file",
      btnExportExcel: "📥 Download Copy (.csv)",
      btnExportExcelTitle: "Download a backup copy of study-tracker.csv",

      // Banner RPG
      rpgLevelSmall: "Level",
      rpgRankPrefix: "Rank:",
      rpgXpToNext: "XP to next level",
      rpgMaxLevel: "MAX",
      rpgTotalXpLabel: "Total Accumulated XP",

      // Filtros Globales (Contexto, Periodo y Materia)
      filterLabel: "🔍 Context:",
      filterAll: "🌐 All",
      filterPeriodLabel: "📅 Period:",
      periodAll: "All time",
      period7d: "Last 7 days",
      period30d: "Last 30 days",
      periodToday: "Today",
      filterSubjectLabel: "📚 Subject:",
      filterAllSubjects: "All subjects",
      btnResetFilters: "✖ Reset filters",

      // Tarjetas KPI
      kpiTotalTimeLabel: "Study Volume",
      kpiTotalMinutesSub: "{min} total minutes",
      kpiSessionsLabel: "Autonomy & Sessions",
      kpiAutonomyPillText: "🧠 {pct}% aut.",
      kpiAvgMinSub: "{min} min avg / session",
      kpiAvgMinZero: "0 min average",
      kpiAssimilationLabel: "FSRS Quality & Focus",
      kpiBestHourNone: "Best hour: --:--",
      kpiBestHourPeak: "Focus peak: ~{hour} (⭐️ {quality})",
      kpiGoalsLabel: "Fluency & Success",
      kpiGoalsSub: "{flow} flow · {struggle} struggle · {friction} frict. · {freeze} freeze",
      kpiAiImpactLabel: "Cognitive Debt & AI",
      kpiAiSub: "🔄 {dial} scaffolding · 🧠 {auton} own gen. · 🤖 {mech} deleg.",
      rpgNextRankText: "🎯 Next rank: {rank} (Lv. {level})",
      rpgMaxRankText: "🏆 Supreme rank: {rank}",
      debtLevelNulo: "🟢 None",
      debtLevelBajo: "🔵 Low",
      debtLevelModerado: "🟠 Moderate",
      debtLevelCritico: "🔴 Critical",

      // Panel Formulario y Timer
      formTitleNew: "➕ Log Session",
      formTitleEdit: "✏️ Editing Session",
      formSubtitle:
        'Time your session or log it in 1 click. Auto-synced with <code>data/study-tracker.csv</code>.',
      timerTabStopwatch: "⏱️ Stopwatch",
      timerTabStopwatchTitle: "Count up timer with automatic start & end capture",
      timerTabPomodoro: "🍅 Pomodoro",
      timerTabPomodoroTitle: "Focus & break block timer",
      timerSoundOnTitle: "End chime enabled (click to mute)",
      timerSoundOffTitle: "Sound muted (click to unmute)",
      timerCustomMinTitle: "Customize block minutes",
      timerStatusReady: "Ready to start",
      timerStatusRunning: "Running...",
      timerStatusFocusReady: "Focus · {min} min",
      timerStatusFocusRunning: "Focus running ({min} min)",
      timerStatusBreakReady: "Break · {min} min",
      timerStatusBreakRunning: "Break running ({min} min)",
      timerStatusPaused: "Paused",
      timerStatusCaptured: "Schedule applied to form",
      timerBadgeStartEmpty: "🟢 Start: --:--",
      timerBadgeStartVal: "🟢 Start: {time}",
      timerBadgeEndEmpty: "🏁 End: --:--",
      timerBadgeEndRunning: "🏁 End: running...",
      timerBadgeEndVal: "🏁 End: {time}",
      timerBtnStartSession: "▶️ Start Session",
      timerBtnStartBreak: "▶️ Start Break",
      timerBtnPause: "⏸️ Pause",
      timerBtnResume: "▶️ Resume",
      timerBtnFinish: "⏹️ Finish",
      timerBtnFinishTitle: "Stops the timer and sets End Time in the form",
      timerBtnFinishBreakTitle: "End break",
      timerBtnResetTitle: "Reset counter to zero",
      previewDurationBase: "⏱️ Duration: {min} min",
      previewDurationBonuses: "⏱️ {min} min ({bonuses})",
      bonusChallenge: "+10% challenge",
      bonusHard: "+20% hard",
      bonusGoalFlow: "+10% clean flow",
      bonusGoalStruggle: "+10% productive struggle",
      bonusGoalFriction: "+5% with friction",
      bonusGoalYes: "+10% clean flow",
      bonusGoalPartial: "+5% with friction",
      bonusDinOwnAuton: "+10% Own Gen.",
      bonusAiAuton: "+5% Own Gen.",
      bonusAiDialogue: "+5% Scaffolding",
      bonusAiMech: "-15% Delegation",

      // Etapas del Formulario (2 Bloques)
      stageStartTitle: "🎯 1. Starting Point (At Start)",
      stageStartBadge: "Auto-prefilled",
      stageEndTitle: "🏁 2. Block Evaluation (At End)",
      stageEndBadge: "Rate effort & progress",
      btnNewSubjectChip: "+ New",

      // Campos del Formulario
      labelContext: "Context / Purpose",
      labelDate: "Date",
      labelSubject: "Subject / Project",
      placeholderSubject: "E.g. Snowflake, Databases",
      labelTopic: "Specific Topic",
      labelTopicHint: "(Subtopic or module)",
      placeholderTopic: "E.g. Virtual Warehouses, MVC Routes...",
      labelStartTime: "Start Time",
      labelEndTime: "End Time",
      btnNowStart: "⏱️ Set current time",
      btnNowEnd: "🏁 Set current time",
      labelStrategy: "Planned Strategy",
      labelPracticeStructure: "Practice Structure",
      labelAiDesignMode: "AI Design Mode",
      labelProcessingModality: "Effective Processing Modality",
      labelInterleavedFriction: "Interleaved Discrimination Friction",
      bonusInterleavedFriction: "+5% productive friction",
      labelActivity: "Activity Type",
      labelCognitiveDynamic: "Cognitive Dynamic (Method & AI Role)",
      labelCognitiveDynamicHint: "(+10% Own Gen. · +5% Scaffolding · -15% Delegation ≥50%)",
      labelMastery: "Prior Topic Mastery",
      labelEnergy: "Prior Energy",
      labelComplexity: "Complexity",
      labelComplexityHint: "(+XP)",
      labelGoal: "Block Fluency & Progress?",
      labelGoalHint: "(Evaluate this block, not whether the whole project is finished)",
      labelAiSlider: "AI assistance percentage:",
      labelQuality: "FSRS Rating (Grade 1–4)",
      labelQualityClass: "Class Focus, Interest & Retention (Grade 1–4)",
      qualityOpt1: "1 · Again (Blackout / Forgot)",
      qualityOpt2: "2 · Hard (Extreme effort)",
      qualityOpt3: "3 · Good (Normal recall)",
      qualityOpt4: "4 · Easy (Instant / Fluid)",
      qualityOpt5: "4 · Easy (Instant / Fluid)",
      labelNotes: "Notes & Subtopic",
      labelNotesHint: "(Prefix with [Subtopic] to group)",
      placeholderNotes: "[Subtopic] What did you learn, debate, or get stuck on?",
      btnSubmitNew: "💾 Log Session & Earn XP",
      btnSubmitEdit: "💾 Update Session & Sync CSV",
      btnCancelEdit: "✖ Cancel edit",

      // Form Help Golden Rule Accordion
      formHelpSummary: "💡 Golden Rule: Audit the Intention Gap",
      formHelpContent:
        "<strong>Do not try to force Stage 1 and 2 to match:</strong> Stage 1 represents your <em>intention</em> and Stage 2 represents <em>reality</em>. If you planned to write code (<em>Generative Build</em>) but a bug forced you to copy a ChatGPT snippet, keep Stage 1 as Generative Build and Stage 2 as Delegation / Passive Copy. That exact discrepancy computes your real <strong>Cognitive Debt</strong>!",

      // Textos dinámicos de ayuda en el formulario
      helpStrategyActiveRecall:
        "🧠 Active Recall: Blind retrieval or debugging bounded problems (flashcards, exercises, or isolating bugs in existing code).",
      helpStrategyGenerativeBuild:
        "🛠️ Generative Build: Creating a new artifact from scratch (original code, structured notes, or architecture; not for fixing existing bugs).",
      helpStrategyReceptiveConsume:
        "📖 Receptive Consumption: Absorbing information (reading docs/papers, watching courses/lectures; before producing artifacts).",
      helpStrategyExecutiveDelegation:
        "⚡ Executive Delegation: Using AI or automated generators to deliver scripts or time-sensitive deliverables.",
      helpPracticeStructureBlocked:
        "🧱 Blocked (Default 90%): Studying 1 single domain continuously throughout the block (e.g. 1 continuous hour of React Hooks).",
      helpPracticeStructureInterleaved:
        "🔀 Interleaved: Intentionally mixing disparate topics to force the brain to switch context and discriminate (enables Friction evaluation).",
      helpAiDesignSinIA:
        "🚫 No AI: Autonomous planned session without artificial assistance.",
      helpAiDesignTutor:
        "🦉 Scaffolding Tutor: AI guides you Socratically with questions and hints without handing over direct solutions.",
      helpAiDesignCoDisenador:
        "👥 Co-Designer: Peer brainstorming and design iteration (architecture, ideation, or critical debate).",
      helpAiDesignGenerador:
        "🤖 Content Generator: Rapid boilerplate, mocks, base code, or quick summaries.",
      helpAiDesignSocratico:
        "🔍 Socratic Evaluator: AI tests your understanding by asking challenging counter-questions.",
      helpProcessingExtraction:
        "🔥 Effortful Extraction: Retrieved knowledge from your own memory or deduced logic with genuine cognitive effort.",
      helpProcessingRecognition:
        "👀 Fluent Recognition: Feeling of familiarity while reading or seeing the answer ('oh yeah, of course'), but unable to retrieve blind.",
      helpProcessingCopy:
        "📋 Passive Copy: Transcribing, copy-pasting code or answers without processing the conceptual core.",
      helpInterleavedFrictionNone:
        "🟢 No Friction: Context switching caused no confusion or topic interference.",
      helpInterleavedFrictionProductive:
        "🧠 Productive Friction (+5% XP): Initial confusion forced your brain to discriminate, deepening retention.",
      helpInterleavedFrictionExcessive:
        "🔴 Excessive Confusion: The mixture was chaotic or premature, harming assimilation of both topics.",
      helpActClass:
        "👨‍🏫 Live with professor: measures your focus and interest. Defaults to Passive Reception (0% AI), or adjust the Cognitive Dynamic below if you used AI in class.",
      helpActTheory:
        "📖 Theoretical / Conceptual Study: Understanding what a topic is or how/why it works (reading docs/papers, watching a course, or debating theoretical concepts with AI).",
      helpActDesign:
        "✍️ Synthesis / Documentation: Translating and structuring ideas into your own artifact (notes, handwritten/PC cheatsheets, summaries, diagrams, or architecture).",
      helpActDev:
        "💻 Dev / Code: Building and implementing code, notebooks, SQL queries, scripts, or project/assignment features.",
      helpActPractice:
        "🧪 Practice / Debug: Solving hands-on exercises, labs, or debugging errors until isolating and fixing the root cause.",
      helpActReview:
        "🔁 Review / Mock: Consolidating memory by reviewing past notes, flashcards, explaining a topic unaided, or taking mock exams.",
      helpDomNew:
        "🌱 New (Current autonomy: 0): Zero prior contacts or erased knowledge; if asked to code or explain it right now, you wouldn't know where to start.",
      helpDomBuilding:
        "🌿 In progress (External dependency): You understand the notion, but if you close docs or AI, you get stuck.",
      helpDomConsolidated:
        "🌳 Consolidated (Total autonomy): You can explain or code without manuals or AI, or it's a fast maintenance block.",
      helpDinPassive:
        "👀 Passive Reception (0% adj.): Reading, listening to a lecture, or watching videos without actively producing or debating yet.",
      helpDinDelegation:
        "🤖 Delegation / Reproduction (-15% if AI ≥50%): The source or AI did the heavy lifting and you copied without deducing why.",
      helpDinScaffolding:
        "🔄 Scaffolding / Co-creation (+5% XP): Thinking as a team with AI; you propose or deduce, and AI gives hints or clarifies concepts.",
      helpDinOwnGen:
        "🧠 Own Generation (+10% at 0% AI · +5% base): Heavy mental effort came from your head (0% AI or minimal dummy text).",
      helpGoalFlow:
        "✅ Clean flow (+10% XP): Steady pace without major hiccups. Also valid if you had to leave early due to external causes but your time spent was focused.",
      helpGoalStruggle:
        "🧠 Productive struggle (+10% XP): Active mental battle against a tough bug or concept; discarded hypotheses and learned what fails even if visible progress is small.",
      helpGoalFriction:
        "⚠️ With friction (+5% XP): Progress made but with hurdles, distractions, fatigue, or uneven pace.",
      helpGoalFreeze:
        "🔴 Paralysis / Quit (0% bonus): Passive freeze, spinning wheels in circles, procrastination, or blank session.",
      helpGoalYes:
        "✅ Clean flow (+10% XP): Steady pace without major hiccups. Also valid if you had to leave early due to external causes but your time spent was focused.",
      helpGoalPartial:
        "⚠️ With friction (+5% XP): Progress made but with hurdles, distractions, fatigue, or uneven pace.",
      helpGoalNo:
        "🔴 Paralysis / Quit (0% bonus): Passive freeze, spinning wheels in circles, procrastination, or blank session.",
      helpQualityClassNote:
        " 👨‍🏫 In Class: use this scale to rate your focus, interest, and retention during the lecture.",
      helpQualityClassAiDialogue:
        " 👨‍🏫 Class + AI Scaffolding: you used AI to clarify questions or structure ideas live; rate how well you understood and retained the class.",
      helpQualityClassAiMech:
        " ⚠️ Class + Delegation: if you used AI just to finish an in-class activity quickly without processing it, consider level 1 or 2.",
      helpQuality1:
        "1 · Again (Blackout / Forgot): Total blackout; if asked tomorrow I won't remember without looking at the answer.",
      helpQuality2:
        "2 · Hard (Extreme effort): 'Got it, but sweated blood'; high cognitive fatigue and prolonged hesitation.",
      helpQuality3:
        "3 · Good (Normal recall): 'Solved it well, had to think a bit, but all in order' (expected moderate effort).",
      helpQuality4:
        "4 · Easy (Instant / Fluid): 'A walk in the park'; instant, direct, and fully mastered without hesitation.",
      helpQuality5:
        "4 · Easy (Instant / Fluid): Fully mastered without hesitation.",
      helpQualityWarnMech:
        " ⚠️ Note: you selected 'Delegation / Reproduction'; if you only copied without reading deeply, consider level 1 or 2 (or switch to 'Scaffolding / Co-creation' if you learned by debating with AI).",
      helpQualityWarnHighAi:
        " 💡 With {ai}% AI, rate 3-4 only if there was deep dialogue and comprehension, not just mechanical speed.",

      // Pestañas y Gráficos Analíticos Interactivos
      tabTimeTitle: "📈 1. Progression & Circadian",
      tabAiTitle: "🧠 2. Cognitive Health & AI",
      tabHabitsTitle: "📉 3. FSRS, DSR & Habits",
      tabInspectorTitle: "🔬 4. Inspector & Notes",
      chartEvoTitle: "📅 Temporal Evolution of Hours, XP & Quality",
      chartEvoSubtitle:
        "How much you study per day, week, or month and how your assimilation quality and XP evolve.",
      evoBtnDay: "Day",
      evoBtnWeek: "Week",
      evoBtnMonth: "Month",
      evoStreakBadgeText: "🔥 Streak: {streak}d (Best: {best}d)",
      evoActiveDaysBadgeText: "📅 Active days: {days}",
      evoAvgDayBadgeText: "⏱️ Avg / active day: {min} min",
      evoBestWeekdayText: "📆 Top day: {day} ({min}m)",
      evoBestWeekdayEmpty: "📆 Top day: --",
      iaKpiLeverageText: "🤖 AI Leverage: {ia}% · Mode: {mode}",
      iaKpiExtractionText: "🔥 Effortful Extraction: {ext}% vs. {pas}% Passive/Fluent",
      iaKpiIntentionGapText: "⚖️ Intention Gap: {pct}% ({count} blk.)",
      chartDebtTitle: "🍩 Cognitive Debt Index",
      chartDebtSubtitle:
        "Proportion of blocks by risk of passive delegation and illusion of competence.",
      chartAiDesignModalityTitle: "🧩 AI Design Mode × Effective Modality",
      chartAiDesignModalitySubtitle:
        "Audits whether planned AI role resulted in effortful extraction or passive copy.",
      chartForgettingTitle: "📉 FSRS Algorithms & Theoretical Forgetting Curve (DSR)",
      chartForgettingHint: "Decay R(t) = (1 + t / 9S)⁻¹ · 90% critical threshold",
      chartForgettingSubtitle:
        "30-day memory retrievability projection based on your average stability (S) against the 4 FSRS grades.",
      fsrsKpiGradeDistText: "🎯 FSRS: 1:{g1}% · 2:{g2}% · 3:{g3}% · 4:{g4}%",
      fsrsKpiRetentionText: "🧠 Est. Retention (R): {r}% · Stability (S): {s}d",
      fsrsKpiInterleavingText: "🔀 Interleaved: {inter}% · Productive Friction: {fric}%",
      forgettingUserCurve: "⭐ Your Avg Curve (S={s}d)",
      forgettingThreshold90: "🎯 90% Review Threshold",
      forgettingAxisDays: "Days elapsed since study (t)",
      forgettingAxisRetention: "Estimated Retrievability R(t) %",
      chartDsrBubbleTitle: "🫧 DSR Consolidation Map by Subject",
      chartDsrBubbleSubtitle:
        "Stability S (days, X-axis) vs. Difficulty D (1–10, Y-axis). Size = Minutes.",
      dsrAxisStability: "Memory Stability S (days to 90% R)",
      dsrAxisDifficulty: "Estimated Difficulty D (1-10)",
      chartInterleavedTitle: "🔀 Effectiveness: Blocked vs. Interleaved",
      chartInterleavedSubtitle:
        "FSRS Quality (1–4) and XP/hour rate by practice structure and discrimination friction.",
      interleavedCatBlocked: "🧱 Blocked",
      interleavedCatNoFric: "🟢 No Friction",
      interleavedCatProdFric: "🧠 Prod. Friction",
      interleavedCatConf: "🔴 Confusion",
      interleavedDsQuality: "FSRS Quality (1-4)",
      interleavedDsXpHour: "XP / Hour",
      deepInspectorTitle: "🔬 Deep Dimension Inspector (Power BI View)",
      deepInspectorSubtitle:
        "Audit any categorical variable, click a bar to isolate its profile, or inspect its multivariable flow.",
      inspectorDimLabel: "📐 Dimension:",
      inspectorValLabel: "🎯 Value (Drill-down):",
      inspectorValAll: "🌐 All (Comparison)",
      dimOptSubject: "📚 Subject / Project",
      dimOptSubtopic: "🗂️ Subtopic [Brackets]",
      dimOptStrategy: "🧭 Strategy / Activity",
      dimOptDynamic: "🔄 Cognitive Dynamic",
      dimOptAiDesign: "🤖 AI Design Mode",
      dimOptModality: "🔥 Processing Modality",
      dimOptStructure: "🔀 Practice Structure",
      dimOptMastery: "🌱 Prior Mastery",
      dimOptContext: "🎓 Context",
      dimOptDebt: "🍩 Cognitive Debt",
      inspKpiVolTitle: "📊 Study Volume",
      inspKpiVolSubText: "{sess} sessions ({min} min)",
      inspKpiAiTitle: "🧠 Cognitive Health & AI",
      inspKpiAiSubText: "{auton}% cognitive autonomy",
      inspKpiPerfTitle: "⚡ FSRS Performance & XP",
      inspKpiDomTitle: "🌱 Mastery Transition",
      inspectorFlowTitle:
        "🔀 Multivariable Session Flow (Mastery ➔ Strategy ➔ Dynamic ➔ Quality ➔ Debt)",
      flowStage1Mastery: "1. Prior Mastery",
      flowStage2Strategy: "2. Strategy",
      flowStage3Dynamic: "3. Dynamic",
      flowStage4Quality: "4. FSRS Quality",
      flowStage5Debt: "5. Cognitive Debt",
      chartDsQualityFSRS: "FSRS Quality (1-4)",
      heatmapTitle: "🔥 Circadian Rhythm Heatmap (Day × Time Slot)",
      heatmapSubtitle:
        "Discover your golden focus window by crossing weekdays against the 4 6-hour biological slots (Early Morning 00-05, Morning 06-11, Afternoon 12-17, Night 18-23).",
      heatBtnMin: "⏱️ Minutes",
      heatBtnQual: "⭐️ Assimilation",
      heatBtnEnergy: "🔋 Energy",
      heatmapCornerLabel: "Day \\ Slot",
      heatmapGoldenText:
        "🏆 Golden window: {day} {slot} (⭐️ {quality}/5 · {min} total min)",
      heatmapGoldenEmpty: "🏆 Log sessions to discover your golden focus window",
      chart1ToggleSummary: "🕒 View detailed hour-by-hour breakdown (00:00 - 23:00)",
      chartQuadTitle: "🎯 Cognitive Performance Quadrant (% AI vs. Assimilation)",
      chartQuadHint: "Bubble size = Duration · Color = Cognitive Dynamic",
      chartQuadSubtitle:
        "Spot whether AI is boosting your learning (top-right) or creating an illusion of fluency with low retention (bottom-right).",
      quadSynergyText: "🚀 AI Synergy (≥35% AI, ⭐️ 4-5): {count}",
      quadAutonText: "🧠 Own Mastery (<35% AI, ⭐️ 4-5): {count}",
      quadMechText: "🤖 Mechanical Illusion (≥35% AI, ⭐️ 1-2): {count}",
      quadFatigueText: "🪫 Friction / Fatigue (<35% AI, ⭐️ 1-2): {count}",
      chartAxisAiPct: "AI Usage Percentage (%)",
      chart1Title: "🕒 Performance & Assimilation by Time of Day",
      chart1Hint: "Discover your biological focus peaks",
      chart1Subtitle:
        "Compare minutes studied (bars) and your average assimilation quality (line) by start hour.",
      chart2Title: "📚 AI Impact & Learning by Subject",
      chart2Hint: "Real learning vs. Mechanical Delegation",
      chart2ClickHint: "💡 Click any bar to filter by that subject",
      chart2Subtitle:
        "Contrast your real learning minutes (Own Generation, Scaffolding, or Reception) against mechanical delegation and your assimilation (1-5).",
      chart3Title: "🧠 Habit Patterns: 6 Activities & Cognitive Balance",
      chart3Hint: "Behavior by task type and method",
      chart3Subtitle:
        "Minutes and average assimilation across the 6 study activities and ratio between receptive consumption (Class, Theoretical Study) and active production (Synthesis, Code, Practice, Review).",
      balanceConsumeLabel: "📖 Consumption (Class / Theoretical Study): {min} min ({pct}%)",
      balanceProduceLabel: "💻 Production (Synthesis / Code / Practice / Review): {min} min ({pct}%)",
      frictionChartTitle: "🧱 Friction Matrix: Fluency vs. Hurdles & Blockers",
      frictionChartHint: "By Topic Complexity and Prior Mastery",
      frictionChartSubtitle:
        "Proportion of blocks with clean flow (✅ Yes), hurdles (⚠️ Partial), or blockers (❌ No) by challenge level and your prior mastery of the concept.",
      frictionDsFlow: "✅ Clean flow",
      frictionDsStruggle: "🧠 Productive struggle",
      frictionDsFriction: "⚠️ With friction",
      frictionDsFreeze: "🔴 Paralysis / Quit",
      frictionDsYes: "✅ Clean flow",
      frictionDsPartial: "⚠️ With friction",
      frictionDsNo: "🔴 Paralysis / Quit",
      frictionAxisSessions: "Sessions",
      habitMatrixTitle: "🧠 Cognitive Dynamic, Prior Mastery, Energy & Challenge Impact",
      habitMatrixSubtitle:
        "See how your average retention and AI usage change across cognitive dynamics, prior topic mastery, and starting energy.",
      habitByProductionTitle: "🧠 By Cognitive Dynamic",
      habitByMasteryTitle: "🌱 By Prior Topic Mastery",
      habitByEnergyTitle: "🔋 By Starting Energy",
      habitByComplexityTitle: "🎯 By Topic Complexity",
      inspectorTopicsTitle: "🗂️ Subtopic Breakdown ([Subtopic] in Notes)",
      inspectorTopicsHint: "Click any subtopic to filter its subject",
      inspectorTopicsSubtitle:
        "Time invested, sessions, average assimilation, AI usage, and XP for each subtopic prefixed with [Brackets] in Notes.",
      inspectorNotesTitle: "📝 Notes & Reflections Log",
      inspectorNotesSubtitle:
        "Your observations, takeaways, and blockers recorded in the filtered sessions.",
      inspectorNoNotes: "No notes recorded in this filter.",
      chartNoData: "No data",
      chartAxisMinutes: "Minutes",
      chartAxisAssimilation: "Assimilation (1-5)",
      chartDsAssimilationAvg: "Avg. Assimilation (1-5)",
      chartDsMinutesStudied: "Minutes Studied",
      chartDsAssimilationShort: "Assimilation (1-5)",
      chartDsMinLearning: "Learning Min. (Own Gen. / Scaffolding / Reception)",
      chartDsMinMechanical: "Delegation / Reproduction Min.",
      chartDsMinByActivity: "Minutes by Activity",
      habitEnergyPrefix: "Energy",
      habitNoRecords: "No records",
      habitSessionsShort: "sess.",

      // Tabla de Historial
      historyTitle: "📋 Logged Sessions History (Click ✏️ to edit or ✖ to delete)",
      btnClearAll: "🗑️ Clear All / Reset to 0",
      historyShowingRecent: "Showing latest {shown} of {total} records (newest first)",
      historyShowingAll: "Showing all {total} records (newest first)",
      btnShowAllHistory: "📂 View all ({total})",
      btnShowRecentHistory: "⬆️ Show latest 5 only",
      thDateSlot: "Date / Time Slot",
      thSchedule: "Schedule",
      thSubjectTopic: "Subject / Subtopic",
      thActivity: "Strategy · Mastery",
      thEnergyChallengeGoal: "Fluency · Structure",
      thDuration: "Duration",
      thAssimilation: "FSRS · Modality",
      thAiModePct: "AI · Dynamic · Debt",
      thXpEarned: "XP Earned",
      thNotes: "Notes",
      thActions: "Actions",
      tableAiSupportSub: "{pct}% AI",
      btnEditSessionTitle: "Edit this session",
      btnDeleteSessionTitle: "Delete this session",

      // Guía de Referencia inferior (Manual exhaustivo campo por campo en 8 tarjetas v3.2)
      guideMainTitle: "📖 System Reference Guide & Criteria (Field-by-Field Manual)",
      guideMainSubtitle:
        "Exact criteria, practical examples, and anti-confusion rules for every form field (Stage 1 & Stage 2), cognitive indicators, and RPG formulas.",
      guideCard1Title: "🎓 1. Context, Subject, [Subtopic] & Schedule",
      guideCard1Li1:
        "<strong>🎓 Academic / 🏅 Certification:</strong> University/school courses vs. official exam prep (e.g. AWS, Snowflake, languages).",
      guideCard1Li2:
        "<strong>🚀 Own Project / 🤝 External:</strong> Personal portfolio, research, or tools vs. freelance, client work, or external assignments.",
      guideCard1Li3:
        "<strong>Subject vs. Specific Topic (<code>[Subtopic]</code>):</strong> <em>Subject</em> is the macro course/project (e.g. <code>Databases</code>); <em>Specific Topic</em> is the specific module (e.g. <code>B-Tree Indexes</code>) saved as <code>[Subtopic]</code> at the start of Notes for the Inspector.",
      guideCard1Li4:
        "<strong>Circadian Slots (6h):</strong> Computed from your <em>Start Time</em>: <code>00:00–05:59 Early Morning</code> · <code>06:00–11:59 Morning</code> · <code>12:00–17:59 Afternoon</code> · <code>18:00–23:59 Night</code> (supports midnight crossing).",
      guideCard2Title: "🌱 2. Prior Topic Mastery (Stage 1)",
      guideCard2Li1:
        "<strong>The Close-the-Docs Test:</strong> Before starting, ask yourself: <em>\"If I close the internet, my notes, and AI right now, can I solve or explain this solo?\"</em>",
      guideCard2Li2:
        "<strong>🌱 New (0% Autonomy):</strong> First contact or wiped memory; facing a blank editor or page you wouldn't know how to start.",
      guideCard2Li3:
        "<strong>🌿 In progress (External dependency):</strong> You grasp the general idea, but closing docs or AI leaves you stuck on steps or syntax.",
      guideCard2Li4:
        "<strong>🌳 Consolidated (Total autonomy):</strong> You can implement or explain it end-to-end without external help, or it's routine maintenance.",
      guideCard2Li5:
        "<strong>Debt Impact:</strong> Delegating a <code>🌱 New</code> topic to AI without processing it triggers <strong>Critical Cognitive Debt</strong> risk.",
      guideCard3Title: "🧭 3. Planned Strategy (Stage 1)",
      guideCard3Li1:
        "<strong>🧠 Active Recall:</strong> Retrieving knowledge from memory without looking at notes (flashcards, mock tests) or <strong>debugging an existing bug</strong> by isolating variables and hypotheses.",
      guideCard3Li2:
        "<strong>🛠️ Generative Build:</strong> Creating a brand-new artifact from scratch (coding a new feature, designing architecture, or writing your own structured notes). <em>(Building new = Generative; Fixing bug = Active Recall)</em>.",
      guideCard3Li3:
        "<strong>📖 Receptive Consumption:</strong> Absorbing external information (reading official docs, books, papers, attending lectures, or watching courses) without producing artifacts yet.",
      guideCard3Li4:
        "<strong>⚡ Executive Delegation:</strong> Automating repetitive boilerplate, scripts, or deliverables with AI when speed is the priority over memorizing that step.",
      guideCard3Li5:
        "<strong>v3 Compatibility:</strong> All 6 classic activities map automatically to these 4 strategies across the dashboard.",
      guideCard4Title: "🧱 4. Practice Structure & Interleaved Friction",
      guideCard4Li1:
        "<strong>🧱 Blocked (1 single topic — 90% of cases):</strong> Studying or coding a single continuous topic throughout the block (e.g. 1h of React Hooks only). Hides the friction field.",
      guideCard4Li2:
        "<strong>🔀 Interleaved (Mixed problems):</strong> Intentionally alternating across multiple topics or problem types in the same session to force your brain to choose which method applies.",
      guideCard4Li3:
        "<strong>🟢 No Friction (when Interleaved):</strong> Switched across topics or distinct exercises smoothly without confusing methods.",
      guideCard4Li4:
        "<strong>🧠 Productive Friction (+5% XP):</strong> Mixing topics made you hesitate which method to apply, forcing your mind to compare and discriminate key differences (maximum retention).",
      guideCard4Li5:
        "<strong>🔴 Excessive Confusion (0% bonus):</strong> Mixed topics that were too raw and ended up overwhelmed without consolidating any (signal to return to <code>🧱 Blocked</code>).",
      guideCard5Title: "🤖 5. AI Design Mode (Stage 1)",
      guideCard5Li1:
        "<strong>🚫 No AI:</strong> You plan to solve the block 100% solo (only your mind, compiler, or static official documentation).",
      guideCard5Li2:
        "<strong>🦉 Scaffolding Tutor:</strong> You ask AI for conceptual explanations, analogies, or gradual hints <strong>without letting it write the final solution</strong>.",
      guideCard5Li3:
        "<strong>👥 Co-Designer:</strong> Pair thinking (<em>pair programming</em> / architecture): you propose a design and debate pros, cons, and edge cases with AI.",
      guideCard5Li4:
        "<strong>🤖 Auto Generation:</strong> You ask AI to directly generate base code, boilerplate, mocks, regex, or operational summaries.",
      guideCard5Li5:
        "<strong>🔍 Socratic Evaluator:</strong> You solve or explain the topic first and use AI as an examiner to challenge your logic or spot flaws.",
      guideCard6Title: "🔄 6. Real Cognitive Dynamic, % AI & Intention Gap (Stage 2)",
      guideCard6Li1:
        "<strong>👀 Passive Reception (0% adj.):</strong> Only read, listened to a lecture, or watched videos without actively producing or debating yet.",
      guideCard6Li2:
        "<strong>🤖 Delegation / Reproduction (-15% XP if AI &ge;50%):</strong> AI solved the heavy lifting and you copied, pasted, or followed steps mechanically.",
      guideCard6Li3:
        "<strong>🔄 Scaffolding / Co-creation (+5% XP):</strong> Dialogued with AI, questioned the why, debugged its ideas, and understood every line built.",
      guideCard6Li4:
        "<strong>🧠 Own Generation (+10% no AI / +5% minor lookup):</strong> The solution came from your own head (0% AI or only a quick syntax lookup).",
      guideCard6Li5:
        "<strong>⚖️ Intention Gap Rule:</strong> <strong>Never force Stage 1 and 2 to match.</strong> If you planned <em>Scaffolding Tutor</em> (T1) but ended up in <em>Delegation</em> (T2), log it honestly to measure your Cognitive Debt.",
      guideCard7Title: "🎯 7. Block Fluency & Progress (Stage 2)",
      guideCard7Li1:
        "<strong>Golden Rule:</strong> Evaluate <strong>how this time block flowed</strong>, NOT whether the whole deliverable is finished. If you stopped early for external reasons but studied with focus, choose <em>Clean flow</em>.",
      guideCard7Li2:
        "<strong>✅ Clean flow (+10% XP):</strong> Sustained focus, steady pace, and progress without major blockers on today's goal.",
      guideCard7Li3:
        "<strong>🧠 Productive struggle (+10% XP):</strong> Intense mental duel against a tough bug or concept; even with few lines written, you tested hypotheses and learned what fails.",
      guideCard7Li4:
        "<strong>⚠️ With friction (+5% XP):</strong> Made progress, but with distractions, fatigue, interruptions, or uneven pace.",
      guideCard7Li5:
        "<strong>🔴 Paralysis / Quit (0% bonus):</strong> Passive freeze staring at the screen, spinning wheels without testing hypotheses, procrastination, or quitting.",
      guideCard8Title: "⭐️ 8. FSRS Rating (1–4), Modality & Formulas",
      guideCard8Li1:
        "<strong>FSRS Grades (1–4):</strong> <code>1 · Again</code> (blackout/forgot, <em>S≈1.2d</em>) · <code>2 · Hard</code> (solved with extreme effort, <em>S≈3d</em>) · <code>3 · Good</code> (expected solid grasp, <em>S≈6.5d</em>) · <code>4 · Easy</code> (instant mastery without doubt, <em>S≈13d</em>).",
      guideCard8Li2:
        "<strong>Effective Modality:</strong> 🔥 <em>Effortful Extraction</em> (pulled from your mind/logic) vs. 👀 <em>Fluent Recognition</em> (read it and said \"ah, makes sense\", familiarity trap) vs. 📋 <em>Passive Copy</em> (unprocessed transcription).",
      guideCard8Li3:
        "<strong>Cognitive Debt (<code>🟢 None</code> to <code>🔴 Critical</code>):</strong> Rises when combining <code>📋 Passive Copy</code> or <code>🤖 Delegation</code> with high <code>% AI</code> on new topics or rating <code>4 · Easy</code> after copying.",
      guideCard8Li4:
        "<strong>XP Formula (v3.2):</strong> <code>ROUND(Min * MAX(0.5, 1 + Quality*0.25 + ChallengeBonus + FluencyBonus + DynamicBonus + FrictionBonus))</code>.",
      guideCard8Li5:
        "<strong>Math Curves:</strong> Infinite quadratic level <code>XP(L) = 50 * L * (L - 1)</code> (Lv. 2 = 100 XP, 16 ranks up to <em>Visionary</em> Lv. 200+) · FSRS Forgetting <code>R(t) = (1 + t/(9S))⁻¹</code>.",

      // Alertas y confirmaciones
      alertServerOffline:
        "Local server is not running. Run 'start.bat' or 'npm start' to enable direct saving to data/study-tracker.csv.",
      alertReloadError:
        "Could not read data/study-tracker.csv from local server. Make sure you started 'start.bat' or 'npm start'.",
      alertImportError:
        "Could not read the selected file. Please verify it is a valid .csv file.",
      confirmClearAll:
        "Are you sure you want to clear all logged sessions in the dashboard and CSV?"
    }
  };

  // Traducción de valores canónicos del dominio para visualización en UI (sin alterar los valores guardados)
  const MAPA_VALORES = {
    contexto: {
      es: {
        Académico: "Académico",
        Certificación: "Certificación",
        "Proyecto Propio": "Proyecto Propio",
        Externo: "Externo"
      },
      en: {
        Académico: "Academic",
        Certificación: "Certification",
        "Proyecto Propio": "Own Project",
        Externo: "External"
      }
    },
    tipoActividad: {
      es: {
        "Clase / Cátedra": "Clase / Cátedra",
        "Estudio Teórico / Conceptual": "Estudio Teórico / Conceptual",
        "Síntesis / Documentación": "Síntesis / Documentación",
        "Desarrollo / Código": "Desarrollo / Código",
        "Práctica / Debugging": "Práctica / Debugging",
        "Repaso / Simulacro": "Repaso / Simulacro",
        Recuperacion_Activa: "Recuperación Activa",
        Construccion_Generativa: "Construcción Generativa",
        Consumo_Receptivo: "Consumo Receptivo",
        Delegacion_Ejecutiva: "Delegación Ejecutiva",
        // Compatibilidad legado v2
        "Teoría / Docs": "Estudio Teórico / Conceptual",
        "Investigación / Diálogo": "Estudio Teórico / Conceptual",
        "Diseño / Apuntes": "Síntesis / Documentación"
      },
      en: {
        "Clase / Cátedra": "Class / Lecture",
        "Estudio Teórico / Conceptual": "Theoretical / Conceptual",
        "Síntesis / Documentación": "Synthesis / Docs",
        "Desarrollo / Código": "Dev / Code",
        "Práctica / Debugging": "Practice / Debug",
        "Repaso / Simulacro": "Review / Mock",
        Recuperacion_Activa: "Active Recall",
        Construccion_Generativa: "Generative Build",
        Consumo_Receptivo: "Receptive Consumption",
        Delegacion_Ejecutiva: "Executive Delegation",
        // Compatibilidad legado v2
        "Teoría / Docs": "Theoretical / Conceptual",
        "Investigación / Diálogo": "Theoretical / Conceptual",
        "Diseño / Apuntes": "Synthesis / Docs"
      }
    },
    dinamicaCognitiva: {
      es: {
        "Recepción Pasiva": "Recepción Pasiva",
        "Delegación / Reproducción": "Delegación / Reproducción",
        "Andamiaje / Co-creación": "Andamiaje / Co-creación",
        "Generación Propia": "Generación Propia"
      },
      en: {
        "Recepción Pasiva": "Passive Reception",
        "Delegación / Reproducción": "Delegation / Reproduction",
        "Andamiaje / Co-creación": "Scaffolding / Co-creation",
        "Generación Propia": "Own Generation"
      }
    },
    dinamicaCognitivaChip: {
      es: {
        "Recepción Pasiva": "👀 Recepción Pasiva",
        "Delegación / Reproducción": "🤖 Delegación / Reproducción",
        "Andamiaje / Co-creación": "🔄 Andamiaje / Co-creación",
        "Generación Propia": "🧠 Generación Propia"
      },
      en: {
        "Recepción Pasiva": "👀 Passive Reception",
        "Delegación / Reproducción": "🤖 Delegation / Reproduction",
        "Andamiaje / Co-creación": "🔄 Scaffolding / Co-creation",
        "Generación Propia": "🧠 Own Generation"
      }
    },
    dominioPrevio: {
      es: {
        Nuevo: "Nuevo",
        "En construcción": "En construcción",
        Consolidado: "Consolidado",
        "Con lagunas": "En construcción",
        Dominado: "Consolidado"
      },
      en: {
        Nuevo: "New",
        "En construcción": "In progress",
        Consolidado: "Consolidated",
        "Con lagunas": "In progress",
        Dominado: "Consolidated"
      }
    },
    dominioPrevioChip: {
      es: {
        Nuevo: "🌱 Nuevo",
        "En construcción": "🌿 En construcción",
        Consolidado: "🌳 Consolidado"
      },
      en: {
        Nuevo: "🌱 New",
        "En construcción": "🌿 In progress",
        Consolidado: "🌳 Consolidated"
      }
    },
    energiaPrevia: {
      es: { Alta: "Alta", Media: "Media", Baja: "Baja" },
      en: { Alta: "High", Media: "Medium", Baja: "Low" }
    },
    complejidad: {
      es: { Fácil: "Fácil", Desafiante: "Desafiante", "Muy difícil": "Muy difícil" },
      en: { Fácil: "Easy", Desafiante: "Challenging", "Muy difícil": "Very Hard" }
    },
    complejidadChip: {
      es: { Fácil: "🟢 Fácil", Desafiante: "🟡 Reto", "Muy difícil": "🔴 Difícil" },
      en: { Fácil: "🟢 Easy", Desafiante: "🟡 Challenge", "Muy difícil": "🔴 Hard" }
    },
    objetivoCumplido: {
      es: {
        "Flujo limpio": "Flujo limpio",
        "Lucha productiva": "Lucha productiva",
        "Con fricción": "Con fricción",
        "Parálisis / Abandono": "Parálisis / Abandono",
        Sí: "Flujo limpio",
        Parcial: "Con fricción",
        No: "Parálisis / Abandono"
      },
      en: {
        "Flujo limpio": "Clean flow",
        "Lucha productiva": "Productive struggle",
        "Con fricción": "With friction",
        "Parálisis / Abandono": "Paralysis / Quit",
        Sí: "Clean flow",
        Parcial: "With friction",
        No: "Paralysis / Quit"
      }
    },
    objetivoChip: {
      es: {
        "Flujo limpio": "✅ Flujo limpio (+10%)",
        "Lucha productiva": "🧠 Lucha productiva (+10%)",
        "Con fricción": "⚠️ Con fricción (+5%)",
        "Parálisis / Abandono": "🔴 Parálisis / Abandono",
        Sí: "✅ Flujo limpio (+10%)",
        Parcial: "⚠️ Con fricción (+5%)",
        No: "🔴 Parálisis / Abandono"
      },
      en: {
        "Flujo limpio": "✅ Clean flow (+10%)",
        "Lucha productiva": "🧠 Productive struggle (+10%)",
        "Con fricción": "⚠️ With friction (+5%)",
        "Parálisis / Abandono": "🔴 Paralysis / Quit",
        Sí: "✅ Clean flow (+10%)",
        Parcial: "⚠️ With friction (+5%)",
        No: "🔴 Paralysis / Quit"
      }
    },
    estructuraPractica: {
      es: {
        Bloqueado: "🧱 Bloqueado",
        Intercalado: "🔀 Intercalado"
      },
      en: {
        Bloqueado: "🧱 Blocked",
        Intercalado: "🔀 Interleaved"
      }
    },
    estructuraPracticaChip: {
      es: {
        Bloqueado: "🧱 Bloqueado (1 solo tema)",
        Intercalado: "🔀 Intercalado (Problemas mixtos)"
      },
      en: {
        Bloqueado: "🧱 Blocked (1 single topic)",
        Intercalado: "🔀 Interleaved (Mixed problems)"
      }
    },
    modoDisenoIA: {
      es: {
        Sin_IA: "🚫 Sin IA",
        Tutor_Andamiaje: "🦉 Tutor Andamiaje",
        Co_Disenador: "👥 Co-Diseñador",
        Generacion_Automatica: "🤖 Generación Automática",
        Evaluador_Socratico: "🔍 Evaluador Socrático"
      },
      en: {
        Sin_IA: "🚫 No AI",
        Tutor_Andamiaje: "🦉 Scaffolding Tutor",
        Co_Disenador: "👥 Co-Designer",
        Generacion_Automatica: "🤖 Auto Generation",
        Evaluador_Socratico: "🔍 Socratic Evaluator"
      }
    },
    modoDisenoIaChip: {
      es: {
        Sin_IA: "🚫 Sin IA",
        Tutor_Andamiaje: "🦉 Tutor Andamiaje",
        Co_Disenador: "👥 Co-Diseñador",
        Generacion_Automatica: "🤖 Generación Automática",
        Evaluador_Socratico: "🔍 Evaluador Socrático"
      },
      en: {
        Sin_IA: "🚫 No AI",
        Tutor_Andamiaje: "🦉 Scaffolding Tutor",
        Co_Disenador: "👥 Co-Designer",
        Generacion_Automatica: "🤖 Auto Generation",
        Evaluador_Socratico: "🔍 Socratic Evaluator"
      }
    },
    modalidadProcesamiento: {
      es: {
        Extraccion_Esforzada: "🔥 Extracción Esforzada",
        Reconocimiento_Fluido: "👀 Reconocimiento Fluido",
        Copia_Pasiva: "📋 Copia Pasiva"
      },
      en: {
        Extraccion_Esforzada: "🔥 Effortful Extraction",
        Reconocimiento_Fluido: "👀 Fluent Recognition",
        Copia_Pasiva: "📋 Passive Copy"
      }
    },
    calidadChip: {
      es: {
        1: "1 · Again (Olvido / Bloqueo)",
        2: "2 · Hard (Esfuerzo extremo)",
        3: "3 · Good (Recuerdo normal)",
        4: "4 · Easy (Fluido / Inmediato)"
      },
      en: {
        1: "1 · Again (Blackout / Forgot)",
        2: "2 · Hard (Extreme effort)",
        3: "3 · Good (Normal recall)",
        4: "4 · Easy (Instant / Fluid)"
      }
    },
    modalidadProcesamientoChip: {
      es: {
        Extraccion_Esforzada: "🔥 Extracción Esforzada",
        Reconocimiento_Fluido: "👀 Reconocimiento Fluido",
        Copia_Pasiva: "📋 Copia Pasiva"
      },
      en: {
        Extraccion_Esforzada: "🔥 Effortful Retrieval",
        Reconocimiento_Fluido: "👀 Fluid Recognition",
        Copia_Pasiva: "📋 Passive Copy"
      }
    },
    friccionIntercalada: {
      es: {
        Sin_Friccion: "🟢 Sin Fricción",
        Friccion_Productiva: "🧠 Fricción Prod. (+5% XP)",
        Confusion_Excesiva: "🔴 Confusión"
      },
      en: {
        Sin_Friccion: "🟢 No Friction",
        Friccion_Productiva: "🧠 Prod. Friction (+5% XP)",
        Confusion_Excesiva: "🔴 Confusion"
      }
    },
    friccionIntercaladaChip: {
      es: {
        Sin_Friccion: "🟢 Sin Fricción",
        Friccion_Productiva: "🧠 Fricción Productiva (+5% XP)",
        Confusion_Excesiva: "🔴 Confusión Excesiva"
      },
      en: {
        Sin_Friccion: "🟢 No Friction",
        Friccion_Productiva: "🧠 Productive Friction (+5% XP)",
        Confusion_Excesiva: "🔴 Excessive Confusion"
      }
    },
    diaSemana: {
      es: {
        Domingo: "Domingo",
        Lunes: "Lunes",
        Martes: "Martes",
        Miércoles: "Miércoles",
        Jueves: "Jueves",
        Viernes: "Viernes",
        Sábado: "Sábado",
        "Sin fecha": "Sin fecha"
      },
      en: {
        Domingo: "Sunday",
        Lunes: "Monday",
        Martes: "Tuesday",
        Miércoles: "Wednesday",
        Jueves: "Thursday",
        Viernes: "Friday",
        Sábado: "Saturday",
        "Sin fecha": "No date"
      }
    },
    franjaHoraria: {
      es: {
        Madrugada: "Madrugada",
        Mañana: "Mañana",
        Tarde: "Tarde",
        Noche: "Noche"
      },
      en: {
        Madrugada: "Early Morning",
        Mañana: "Morning",
        Tarde: "Afternoon",
        Noche: "Night"
      }
    },
    rango: {
      es: {
        Visionario: "Visionario",
        Autoridad: "Autoridad",
        Maestro: "Maestro",
        Élite: "Élite",
        Senior: "Senior",
        Experto: "Experto",
        Referente: "Referente",
        Consolidado: "Consolidado",
        Experimentado: "Experimentado",
        Estratega: "Estratega",
        Táctico: "Táctico",
        Metódico: "Metódico",
        Especialista: "Especialista",
        Analista: "Analista",
        Practicante: "Practicante",
        Iniciado: "Iniciado"
      },
      en: {
        Visionario: "Visionary",
        Autoridad: "Authority",
        Maestro: "Master",
        Élite: "Elite",
        Senior: "Senior",
        Experto: "Expert",
        Referente: "Benchmark",
        Consolidado: "Consolidated",
        Experimentado: "Experienced",
        Estratega: "Strategist",
        Táctico: "Tactician",
        Metódico: "Methodical",
        Especialista: "Specialist",
        Analista: "Analyst",
        Practicante: "Practitioner",
        Iniciado: "Initiate"
      }
    }
  };

  function getLang() {
    return idiomaActual;
  }

  /**
   * Obtiene un texto traducido e interpola variables {clave}.
   */
  function t(key, params = {}) {
    const tabla = DICCIONARIO[idiomaActual] || DICCIONARIO.es;
    let str = tabla[key] !== undefined ? tabla[key] : DICCIONARIO.es[key] || key;
    Object.keys(params).forEach((k) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(params[k]));
    });
    return str;
  }

  /**
   * Traduce un valor canónico (ej. "Académico", "Desarrollo / Código") al idioma actual para mostrar en UI.
   */
  function traducirValor(categoria, valor) {
    const cat = MAPA_VALORES[categoria];
    if (!cat) return valor;
    const sub = cat[idiomaActual] || cat.es;
    return sub[valor] !== undefined ? sub[valor] : valor;
  }

  /**
   * Aplica las traducciones estáticas a todos los elementos del DOM con atributos data-i18n.
   */
  function aplicarTraduccionesDOM() {
    document.documentElement.lang = idiomaActual;

    // 1. Elementos con texto plano (textContent)
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (key) el.textContent = t(key);
    });

    // 2. Elementos con HTML seguro de plantilla (code/strong/em en subtítulos y guía)
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.dataset.i18nHtml;
      if (key) el.innerHTML = t(key);
    });

    // 3. Placeholders de inputs y textareas
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      if (key) el.placeholder = t(key);
    });

    // 4. Atributos title (tooltips)
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.dataset.i18nTitle;
      if (key) el.title = t(key);
    });

    // 5. Traducir las etiquetas visibles de los chips del formulario conservando su data-value canónico
    const iconosContexto = {
      Académico: "🎓",
      Certificación: "🏅",
      "Proyecto Propio": "🚀",
      Externo: "🤝"
    };
    document.querySelectorAll('.chip-group[data-group="contexto"] .chip-btn').forEach((btn) => {
      const val = btn.dataset.value;
      btn.textContent = `${iconosContexto[val] || ""} ${traducirValor("contexto", val)}`;
    });

    const iconosActividad = {
      "Clase / Cátedra": "👨‍🏫",
      "Estudio Teórico / Conceptual": "📖",
      "Síntesis / Documentación": "✍️",
      "Desarrollo / Código": "💻",
      "Práctica / Debugging": "🧪",
      "Repaso / Simulacro": "🔁",
      Recuperacion_Activa: "🧠",
      Construccion_Generativa: "🛠️",
      Consumo_Receptivo: "📖",
      Delegacion_Ejecutiva: "⚡"
    };
    document
      .querySelectorAll('.chip-group[data-group="tipoActividad"] .chip-btn')
      .forEach((btn) => {
        const val = btn.dataset.value;
        btn.textContent = `${iconosActividad[val] || ""} ${traducirValor("tipoActividad", val)}`;
      });

    document
      .querySelectorAll('.chip-group[data-group="estructuraPractica"] .chip-btn')
      .forEach((btn) => {
        const val = btn.dataset.value;
        btn.textContent = traducirValor("estructuraPracticaChip", val);
      });

    document
      .querySelectorAll('.chip-group[data-group="modoDisenoIA"] .chip-btn')
      .forEach((btn) => {
        const val = btn.dataset.value;
        btn.textContent = traducirValor("modoDisenoIaChip", val);
      });

    document
      .querySelectorAll('.chip-group[data-group="calidad"] .chip-btn')
      .forEach((btn) => {
        const val = btn.dataset.value;
        btn.textContent = traducirValor("calidadChip", val);
      });

    document
      .querySelectorAll('.chip-group[data-group="modalidadProcesamiento"] .chip-btn')
      .forEach((btn) => {
        const val = btn.dataset.value;
        btn.textContent = traducirValor("modalidadProcesamientoChip", val);
      });

    document
      .querySelectorAll('.chip-group[data-group="friccionIntercalada"] .chip-btn')
      .forEach((btn) => {
        const val = btn.dataset.value;
        btn.textContent = traducirValor("friccionIntercaladaChip", val);
      });

    document
      .querySelectorAll('.chip-group[data-group="dinamicaCognitiva"] .chip-btn')
      .forEach((btn) => {
        const val = btn.dataset.value;
        btn.textContent = traducirValor("dinamicaCognitivaChip", val);
      });

    document
      .querySelectorAll('.chip-group[data-group="dominioPrevio"] .chip-btn')
      .forEach((btn) => {
        const val = btn.dataset.value;
        btn.textContent = traducirValor("dominioPrevioChip", val);
      });

    const iconosEnergia = { Alta: "🔋", Media: "⚡", Baja: "🪫" };
    document
      .querySelectorAll('.chip-group[data-group="energiaPrevia"] .chip-btn')
      .forEach((btn) => {
        const val = btn.dataset.value;
        btn.textContent = `${iconosEnergia[val] || ""} ${traducirValor("energiaPrevia", val)}`;
      });

    document
      .querySelectorAll('.chip-group[data-group="complejidad"] .chip-btn')
      .forEach((btn) => {
        const val = btn.dataset.value;
        btn.textContent = traducirValor("complejidadChip", val);
      });

    document
      .querySelectorAll('.chip-group[data-group="objetivoCumplido"] .chip-btn')
      .forEach((btn) => {
        const val = btn.dataset.value;
        btn.textContent = traducirValor("objetivoChip", val);
      });

    // 6. Estado activo del conmutador de idioma (ES / EN)
    document.querySelectorAll(".lang-switch-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === idiomaActual);
    });
  }

  function setLang(nuevoIdioma) {
    const langSeguro = nuevoIdioma === "en" ? "en" : "es";
    idiomaActual = langSeguro;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, idiomaActual);
    } catch (_) {
      // Ignorar errores de almacenamiento
    }
    aplicarTraduccionesDOM();
    listeners.forEach((fn) => {
      try {
        fn(idiomaActual);
      } catch (err) {
        console.error("Error en listener de i18n:", err);
      }
    });
  }

  function subscribe(fn) {
    if (typeof fn === "function") {
      listeners.add(fn);
    }
    return () => listeners.delete(fn);
  }

  function init() {
    try {
      const guardado = localStorage.getItem(LANG_STORAGE_KEY);
      if (guardado === "en" || guardado === "es") {
        idiomaActual = guardado;
      }
    } catch (_) {
      idiomaActual = "es";
    }
    aplicarTraduccionesDOM();
  }

  StudyTracker.I18n = {
    init,
    getLang,
    setLang,
    t,
    traducirValor,
    aplicarTraduccionesDOM,
    subscribe
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = StudyTracker.I18n;
  }
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));
