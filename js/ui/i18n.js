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
      kpiTotalTimeLabel: "Tiempo Total Estudiado",
      kpiTotalMinutesSub: "{min} minutos en total",
      kpiSessionsLabel: "Sesiones Completadas",
      kpiAvgMinSub: "{min} min promedio / sesión",
      kpiAvgMinZero: "0 min promedio",
      kpiAssimilationLabel: "Asimilación Promedio",
      kpiBestHourNone: "Mejor hora: --:--",
      kpiBestHourPeak: "Pico de foco: ~{hour} (⭐️ {quality})",
      kpiGoalsLabel: "Objetivos Cumplidos",
      kpiGoalsSub: "{yes} sí · {partial} parc. · {no} bloq.",
      kpiAiImpactLabel: "Impacto y Uso de IA",
      kpiAiSub: "🔄 {dial} andamiaje · 🧠 {auton} gen. propia · 🤖 {mech} deleg.",

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
      bonusGoalYes: "+10% buen avance",
      bonusGoalPartial: "+5% con tropiezos",
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
      labelQuality: "Calidad de Aprendizaje / Asimilación (1 al 5)",
      labelQualityClass: "Concentración, Interés y Retención en Clase (1 al 5)",
      qualityOpt1: "1 - ⭐️ Mecánico / Sin retención (Solo copié o distraído)",
      qualityOpt2: "2 - ⭐️⭐️ Superficial / Pasivo (Entendí por encima)",
      qualityOpt3: "3 - ⭐️⭐️⭐️ Comprensión estándar (Entendí la lógica)",
      qualityOpt4: "4 - ⭐️⭐️⭐️⭐️ Aprendizaje sólido (Razoné y puedo replicarlo)",
      qualityOpt5: "5 - ⭐️⭐️⭐️⭐️⭐️ Asimilación profunda (Dominio total)",
      labelNotes: "Notas y Subtema",
      labelNotesHint: "(Usa [Subtema] al inicio para agrupar)",
      placeholderNotes: "[Subtema] ¿Qué aprendiste, qué debatiste o dónde te trabaste?",
      btnSubmitNew: "💾 Registrar Sesión y Sumar XP",
      btnSubmitEdit: "💾 Actualizar Sesión y Sincronizar CSV",
      btnCancelEdit: "✖ Cancelar edición",

      // Textos dinámicos de ayuda en el formulario
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
        "🌱 Nuevo (0 contactos previos): Nunca has estudiado este concepto/herramienta específica. Si te pidieran explicarlo o escribir código ahorita mismo, no sabrías por dónde empezar.",
      helpDomBuilding:
        "🌿 En construcción (Necesitas apoyo/consulta): Ya lo viste antes (en clase, ayer o en el Pomodoro pasado), pero todavía necesitas mirar tus apuntes, la documentación o apoyarte en la IA para avanzar sin trabarte.",
      helpDomConsolidated:
        "🌳 Consolidado (Autónomo): Puedes explicarlo, resolver problemas o programar sobre esto sin mirar el manual ni depender de la IA, o solo estás haciendo un bloque de repaso/mantenimiento veloz.",
      helpDinPassive:
        "👀 Recepción Pasiva (0% ajuste): Leer, escuchar cátedra o ver videos sin producir ni debatir activamente todavía.",
      helpDinDelegation:
        "🤖 Delegación / Reproducción (-15% XP si IA ≥50%): La IA o la fuente hizo el trabajo pesado y tú copiaste, transcribiste o seguiste pasos sin construirlo desde tu mente.",
      helpDinScaffolding:
        "🔄 Andamiaje / Co-creación (+5% XP): Pensaste con apoyo; usaste la IA como tutor socrático (debatiendo el '¿por qué?'), copiloto de sintaxis o estructurador de tus propias ideas.",
      helpDinOwnGen:
        "🧠 Generación Propia (+10% XP con 0% IA, +5% con consulta mínima): El esfuerzo mental pesado salió de tu cabeza (redactar con tus palabras, resolver o programar con tu propia lógica).",
      helpGoalYes:
        "✅ Flujo limpio (+10% XP): Evalúa ESTE bloque, no si acabaste toda la tarea/proyecto. Úsalo si avanzaste a buen ritmo en lo planeado para esta sesión sin quedarte estancado.",
      helpGoalPartial:
        "⚠️ Con tropiezos / Fricción (+5% XP): Sí avanzaste, pero perdiste parte importante del bloque atorado en un bug, distracción, cansancio o confusión y el ritmo fue accidentado.",
      helpGoalNo:
        "❌ Bloqueo real (0% bono): Te quedaste trabado casi toda la sesión en un obstáculo técnico/conceptual sin lograr destrabarlo, o tuviste que abortar la sesión sin avance efectivo.",
      helpQualityClassNote:
        " 👨‍🏫 En Clase: evalúa aquí tu nivel de concentración, interés y retención de la cátedra.",
      helpQualityClassAiDialogue:
        " 👨‍🏫 Clase + Andamiaje IA: usaste IA para despejar dudas o estructurar ideas en vivo; califica qué tanto comprendiste y retuviste la clase.",
      helpQualityClassAiMech:
        " ⚠️ Clase + Delegación: si usaste IA solo para acabar rápido una actividad de clase sin procesarla, considera nivel 1 o 2.",
      helpQuality1:
        "Mecánico / Sin retención: Solo copié/pegué respuestas o estuve distraído; no asimilé el tema.",
      helpQuality2:
        "Superficial / Pasivo: Seguí pasos o código generado entendiendo solo por encima; poca retención.",
      helpQuality3:
        "Comprensión estándar: Entendí la lógica general de lo realizado y resolví partes por mi cuenta.",
      helpQuality4:
        "Aprendizaje sólido: Razoné activamente el problema, comprendí el porqué y puedo replicarlo.",
      helpQuality5:
        "Asimilación profunda: Esfuerzo mental propio al máximo; dominé el concepto a fondo y puedo explicarlo sin ayuda.",
      helpQualityWarnMech:
        " ⚠️ Nota: seleccionaste 'Delegación / Reproducción'; si solo copiaste sin profundizar, considera nivel 1 o 2 (o cambia a 'Andamiaje / Co-creación' si aprendiste debatiendo con la IA).",
      helpQualityWarnHighAi:
        " 💡 Con {ai}% de IA, califica con 4-5 solo si hubo diálogo y comprensión profunda, no solo fluidez mecánica.",

      // Pestañas y Gráficos Analíticos Interactivos
      tabTimeTitle: "📈 1. Tiempo y Ritmo",
      tabAiTitle: "🤖 2. IA vs. Retención",
      tabHabitsTitle: "🧠 3. Hábitos y Energía",
      tabInspectorTitle: "🗂️ 4. Temas y Notas",
      chartEvoTitle: "📅 Evolución y Constancia de Estudio",
      chartEvoSubtitle:
        "Cuánto estudias por día, semana o mes y cómo evoluciona tu calidad de asimilación.",
      evoBtnDay: "Día",
      evoBtnWeek: "Semana",
      evoBtnMonth: "Mes",
      evoStreakBadgeText: "🔥 Racha: {streak}d (Mejor: {best}d)",
      evoActiveDaysBadgeText: "📅 Días activos: {days}",
      evoAvgDayBadgeText: "⏱️ Promedio / día activo: {min} min",
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
      frictionDsYes: "✅ Sí (Flujo limpio)",
      frictionDsPartial: "⚠️ Parcial (Con tropiezos)",
      frictionDsNo: "❌ No (Bloqueo)",
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
      thSubjectTopic: "Materia / Tema",
      thActivity: "Actividad",
      thEnergyChallengeGoal: "Energía · Reto · Meta",
      thDuration: "Duración",
      thAssimilation: "Asimilación",
      thAiModePct: "Dinámica · % IA",
      thXpEarned: "XP Ganados",
      thNotes: "Notas",
      thActions: "Acciones",
      tableAiSupportSub: "{pct}% apoyo IA",
      btnEditSessionTitle: "Editar esta sesión",
      btnDeleteSessionTitle: "Eliminar esta sesión",

      // Guía de Referencia inferior (6 tarjetas v3)
      guideMainTitle: "📖 Guía de Referencia y Criterios del Sistema (v3)",
      guideMainSubtitle:
        "Manual rápido para elegir la actividad correcta, la dinámica cognitiva, el dominio previo objetivo y cómo interpretar los gráficos.",
      guideCard1Title: "🧭 1. Las 6 Actividades (¿Qué hiciste?)",
      guideCard1Li1:
        "<strong>👨‍🏫 Clase / Cátedra:</strong> Sesión en vivo con profesor o ponente.",
      guideCard1Li2:
        '<strong>📖 Estudio Teórico / Conceptual:</strong> Comprender el <em>qué</em> o el <em>porqué</em> (leer documentación/papers, ver un curso o debatir teoría con IA).',
      guideCard1Li3:
        "<strong>✍️ Síntesis / Documentación:</strong> Traducir ideas a un artefacto propio (apuntes, cheatsheets, resúmenes, diagramas o arquitectura).",
      guideCard1Li4:
        "<strong>💻 Desarrollo / Código vs. 🧪 Práctica / Debugging:</strong> <code>Desarrollo</code> es construir funcionalidades o scripts; <code>Práctica / Debugging</code> es resolver ejercicios o cazar un bug.",
      guideCard1Li5:
        "<strong>🔁 Repaso / Simulacro:</strong> Estudiar de tus propios apuntes previos, flashcards o exámenes de prueba.",
      guideCard2Title: "🎯 2. ¿Cuándo elegir Sí, Parcial o Bloqueo?",
      guideCard2Li1:
        "<strong>Regla de Oro:</strong> Evalúa <strong>la fluidez de este bloque de tiempo</strong>, nunca si ya terminaste el proyecto o entregable completo.",
      guideCard2Li2:
        "<strong>✅ Sí — Flujo limpio (+10% XP):</strong> Avanzaste a buen ritmo en la parte que tocabas hoy, aunque la tarea total continúe mañana.",
      guideCard2Li3:
        "<strong>⚠️ Parcial — Con tropiezos (+5% XP):</strong> Sí hubo progreso, pero perdiste buena parte del bloque atorado en un bug, distracción o cansancio.",
      guideCard2Li4:
        "<strong>❌ No — Bloqueo real (0% bono):</strong> Te quedaste estancado casi toda la sesión sin destrabarlo, o abortaste la sesión sin avance efectivo.",
      guideCard3Title: "🌱 3. La Prueba Objetiva de Dominio Previo",
      guideCard3Li1:
        "<strong>🌱 Nuevo (0 contactos previos):</strong> Nunca has estudiado este concepto/herramienta específica. Si te pidieran explicarlo o escribir código ahorita mismo, no sabrías por dónde empezar.",
      guideCard3Li2:
        "<strong>🌿 En construcción (Necesitas apoyo/consulta):</strong> Ya lo viste antes (en clase, ayer o en el Pomodoro pasado), pero todavía necesitas mirar apuntes, documentación o apoyarte en la IA para avanzar sin trabarte.",
      guideCard3Li3:
        "<strong>🌳 Consolidado (Autónomo):</strong> Puedes explicarlo, resolver problemas o programar sobre esto sin mirar el manual ni depender de la IA, o solo haces un repaso veloz.",
      guideCard3Li4:
        "<strong>Energía y Reto:</strong> <code>🔋 Alta / ⚡ Media / 🪫 Baja</code> al iniciar + Complejidad <code>🟢 Fácil (0%) / 🟡 Reto (+10%) / 🔴 Difícil (+20%)</code>.",
      guideCard4Title: "⭐️ 4. Escala de Asimilación (1 al 5)",
      guideCard4Li1:
        "<strong>1 (Mecánico / Sin retención):</strong> Solo copié/pegué respuestas por prisa o estuve distraído; no asimilé el tema.",
      guideCard4Li2:
        "<strong>2 (Superficial / Pasivo):</strong> Seguí pasos o código generado entendiendo solo por encima; poca retención a largo plazo.",
      guideCard4Li3:
        "<strong>3 (Comprensión estándar):</strong> Entendí la lógica general de lo realizado y resolví partes por mi cuenta.",
      guideCard4Li4:
        "<strong>4 (Aprendizaje sólido):</strong> Razoné activamente el problema, sinteticé los conceptos y puedo replicarlo.",
      guideCard4Li5:
        "<strong>5 (Asimilación profunda):</strong> Dominio total; puedo explicar el tema o escribir la solución desde cero sin ayuda.",
      guideCard5Title: "🧠 5. Las 4 Dinámicas Cognitivas (¿Cómo trabajaste?)",
      guideCard5Li1:
        "<strong>👀 Recepción Pasiva (0% ajuste):</strong> Leer, escuchar clase o ver un video sin producir ni interactuar activamente aún.",
      guideCard5Li2:
        "<strong>🤖 Delegación / Reproducción (-15% XP si IA &ge;50%):</strong> La IA o la fuente hizo el trabajo pesado y tú solo copiaste, transcribiste o seguiste pasos mecánicamente.",
      guideCard5Li3:
        "<strong>🔄 Andamiaje / Co-creación (+5% XP):</strong> Pensaste con apoyo; usaste la IA como tutor socrático, copiloto de sintaxis o estructurador de tus propias ideas.",
      guideCard5Li4:
        "<strong>🧠 Generación Propia (+10% XP sin IA / +5% con consulta mínima):</strong> El esfuerzo mental pesado salió de tu propia cabeza.",
      guideCard6Title: "📊 6. Franjas Horarias (6h) y Fórmulas RPG",
      guideCard6Li1:
        "<strong>Franjas Circadianas (6h):</strong> <code>00:00–05:59 Madrugada</code> · <code>06:00–11:59 Mañana</code> · <code>12:00–17:59 Tarde</code> · <code>18:00–23:59 Noche</code>.",
      guideCard6Li2:
        "<strong>Subtemas en Notas:</strong> Escribe <code>[Subtema] Tu nota</code> (ej. <code>[Mesa Redonda - GANs] Debate de arquitectura</code>) para agrupar en el Inspector.",
      guideCard6Li3:
        "<strong>Fórmula XP:</strong> <code>ROUND(Minutos * MAX(0.5, 1 + Calidad*0.2 + BonoReto + BonoAvance + BonoDinamica))</code>.",
      guideCard6Li4:
        "<strong>Curva Exponencial (Nv. 92 = 50% de 99):</strong> <code>XP(L) = 250 * (2^((L-1)/7) - 1)</code>.",

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
      kpiTotalTimeLabel: "Total Study Time",
      kpiTotalMinutesSub: "{min} total minutes",
      kpiSessionsLabel: "Completed Sessions",
      kpiAvgMinSub: "{min} min avg / session",
      kpiAvgMinZero: "0 min average",
      kpiAssimilationLabel: "Avg. Assimilation",
      kpiBestHourNone: "Best hour: --:--",
      kpiBestHourPeak: "Focus peak: ~{hour} (⭐️ {quality})",
      kpiGoalsLabel: "Goals Achieved",
      kpiGoalsSub: "{yes} yes · {partial} part. · {no} block.",
      kpiAiImpactLabel: "AI Impact & Usage",
      kpiAiSub: "🔄 {dial} scaffolding · 🧠 {auton} own gen. · 🤖 {mech} deleg.",

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
      bonusGoalYes: "+10% solid progress",
      bonusGoalPartial: "+5% rough progress",
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
      labelQuality: "Learning Quality / Assimilation (1 to 5)",
      labelQualityClass: "Class Focus, Interest & Retention (1 to 5)",
      qualityOpt1: "1 - ⭐️ Mechanical / No retention (Copied or distracted)",
      qualityOpt2: "2 - ⭐️⭐️ Superficial / Passive (Surface understanding)",
      qualityOpt3: "3 - ⭐️⭐️⭐️ Standard comprehension (Understood the logic)",
      qualityOpt4: "4 - ⭐️⭐️⭐️⭐️ Solid learning (Reasoned & can replicate)",
      qualityOpt5: "5 - ⭐️⭐️⭐️⭐️⭐️ Deep assimilation (Full mastery)",
      labelNotes: "Notes & Subtopic",
      labelNotesHint: "(Prefix with [Subtopic] to group)",
      placeholderNotes: "[Subtopic] What did you learn, debate, or get stuck on?",
      btnSubmitNew: "💾 Log Session & Earn XP",
      btnSubmitEdit: "💾 Update Session & Sync CSV",
      btnCancelEdit: "✖ Cancel edit",

      // Textos dinámicos de ayuda en el formulario
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
        "🌱 New (0 prior contacts): You have never studied this specific concept/tool. If asked to explain it or write code right now, you wouldn't know where to start.",
      helpDomBuilding:
        "🌿 In progress (Needs support/lookup): You saw it before (in class, yesterday, or last Pomodoro), but still need notes, docs, or AI to progress without getting stuck.",
      helpDomConsolidated:
        "🌳 Consolidated (Autonomous): You can explain it, solve problems, or code without looking at the manual or relying on AI, or you are doing a fast review/maintenance block.",
      helpDinPassive:
        "👀 Passive Reception (0% adj.): Reading, listening to a lecture, or watching videos without actively producing or debating yet.",
      helpDinDelegation:
        "🤖 Delegation / Reproduction (-15% XP if AI ≥50%): AI or the source did the heavy lifting and you copied, transcribed, or followed steps without building it from your own mind.",
      helpDinScaffolding:
        "🔄 Scaffolding / Co-creation (+5% XP): You thought with support; used AI as a Socratic tutor (debating 'why?'), syntax copilot, or structurer of your own ideas.",
      helpDinOwnGen:
        "🧠 Own Generation (+10% XP at 0% AI, +5% with minor lookup): The heavy mental effort came from your own head (writing in your own words, solving, or coding with your own logic).",
      helpGoalYes:
        "✅ Clean flow (+10% XP): Evaluate THIS block, not whether the entire deliverable is finished. Use it if you progressed smoothly on what you planned for this session.",
      helpGoalPartial:
        "⚠️ With hurdles / Friction (+5% XP): You made progress, but lost significant time stuck on a bug, distraction, fatigue, or confusion.",
      helpGoalNo:
        "❌ Real blocker (0% bonus): Stuck for almost the entire session on a technical/conceptual obstacle without unblocking it, or aborted with no effective progress.",
      helpQualityClassNote:
        " 👨‍🏫 In Class: use this scale to rate your focus, interest, and retention during the lecture.",
      helpQualityClassAiDialogue:
        " 👨‍🏫 Class + AI Scaffolding: you used AI to clarify questions or structure ideas live; rate how well you understood and retained the class.",
      helpQualityClassAiMech:
        " ⚠️ Class + Delegation: if you used AI just to finish an in-class activity quickly without processing it, consider level 1 or 2.",
      helpQuality1:
        "Mechanical / No retention: Only copied/pasted answers or was distracted; did not assimilate the topic.",
      helpQuality2:
        "Superficial / Passive: Followed steps or generated code with surface understanding; low retention.",
      helpQuality3:
        "Standard comprehension: Understood the general logic and solved parts on my own.",
      helpQuality4:
        "Solid learning: Actively reasoned through the problem, understood the 'why', and can replicate it.",
      helpQuality5:
        "Deep assimilation: Maximum mental effort; mastered the concept thoroughly and can explain it unaided.",
      helpQualityWarnMech:
        " ⚠️ Note: you selected 'Delegation / Reproduction'; if you only copied without reading deeply, consider level 1 or 2 (or switch to 'Scaffolding / Co-creation' if you learned by debating with AI).",
      helpQualityWarnHighAi:
        " 💡 With {ai}% AI, rate 4-5 only if there was deep dialogue and comprehension, not just mechanical speed.",

      // Pestañas y Gráficos Analíticos Interactivos
      tabTimeTitle: "📈 1. Time & Rhythm",
      tabAiTitle: "🤖 2. AI vs. Retention",
      tabHabitsTitle: "🧠 3. Habits & Energy",
      tabInspectorTitle: "🗂️ 4. Topics & Notes",
      chartEvoTitle: "📅 Study Evolution & Consistency",
      chartEvoSubtitle:
        "How much you study per day, week, or month and how your assimilation quality evolves.",
      evoBtnDay: "Day",
      evoBtnWeek: "Week",
      evoBtnMonth: "Month",
      evoStreakBadgeText: "🔥 Streak: {streak}d (Best: {best}d)",
      evoActiveDaysBadgeText: "📅 Active days: {days}",
      evoAvgDayBadgeText: "⏱️ Avg / active day: {min} min",
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
      frictionDsYes: "✅ Yes (Clean flow)",
      frictionDsPartial: "⚠️ Partial (With hurdles)",
      frictionDsNo: "❌ No (Blocker)",
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
      thSubjectTopic: "Subject / Topic",
      thActivity: "Activity",
      thEnergyChallengeGoal: "Energy · Challenge · Goal",
      thDuration: "Duration",
      thAssimilation: "Assimilation",
      thAiModePct: "Dynamic · % AI",
      thXpEarned: "XP Earned",
      thNotes: "Notes",
      thActions: "Actions",
      tableAiSupportSub: "{pct}% AI support",
      btnEditSessionTitle: "Edit this session",
      btnDeleteSessionTitle: "Delete this session",

      // Guía de Referencia inferior (6 tarjetas v3)
      guideMainTitle: "📖 System Reference Guide & Criteria (v3)",
      guideMainSubtitle:
        "Quick pocket manual to pick the right activity, cognitive dynamic, objective prior mastery, and read the analytics charts.",
      guideCard1Title: "🧭 1. The 6 Activities (What did you do?)",
      guideCard1Li1:
        "<strong>👨‍🏫 Class / Lecture:</strong> Live session with a professor or speaker.",
      guideCard1Li2:
        '<strong>📖 Theoretical / Conceptual Study:</strong> Understanding the <em>what</em> or <em>why</em> (reading docs/papers, watching a course, or debating theory with AI).',
      guideCard1Li3:
        "<strong>✍️ Synthesis / Documentation:</strong> Translating ideas into your own artifact (notes, cheatsheets, summaries, diagrams, or architecture).",
      guideCard1Li4:
        "<strong>💻 Dev / Code vs. 🧪 Practice / Debug:</strong> <code>Dev / Code</code> is building features or scripts; <code>Practice / Debug</code> is solving exercises or hunting down a bug.",
      guideCard1Li5:
        "<strong>🔁 Review / Mock:</strong> Studying from your own prior notes, flashcards, or mock exams.",
      guideCard2Title: "🎯 2. When to Pick Yes, Partial, or Blocked?",
      guideCard2Li1:
        "<strong>Golden Rule:</strong> Evaluate <strong>the fluency of this time block</strong>, never whether the entire project/deliverable is finished.",
      guideCard2Li2:
        "<strong>✅ Yes — Clean flow (+10% XP):</strong> You progressed at a good pace on today's slice, even if the overall assignment continues tomorrow.",
      guideCard2Li3:
        "<strong>⚠️ Partial — With hurdles (+5% XP):</strong> You made progress, but lost significant time stuck on a bug, distraction, or fatigue.",
      guideCard2Li4:
        "<strong>❌ No — Real blocker (0% bonus):</strong> Stuck for almost the whole session without unblocking it, or aborted with no effective progress.",
      guideCard3Title: "🌱 3. The Objective Prior Mastery Test",
      guideCard3Li1:
        "<strong>🌱 New (0 prior contacts):</strong> You have never studied this specific concept/tool. If asked to explain it or write code right now, you wouldn't know where to start.",
      guideCard3Li2:
        "<strong>🌿 In progress (Needs support/lookup):</strong> You saw it before (in class, yesterday, or last Pomodoro), but still need notes, docs, or AI to progress without getting stuck.",
      guideCard3Li3:
        "<strong>🌳 Consolidated (Autonomous):</strong> You can explain it, solve problems, or code without looking at the manual or relying on AI, or you are doing a fast review block.",
      guideCard3Li4:
        "<strong>Energy & Challenge:</strong> <code>🔋 High / ⚡ Medium / 🪫 Low</code> at start + Complexity <code>🟢 Easy (0%) / 🟡 Challenge (+10%) / 🔴 Hard (+20%)</code>.",
      guideCard4Title: "⭐️ 4. Assimilation Scale (1 to 5)",
      guideCard4Li1:
        "<strong>1 (Mechanical / No retention):</strong> Only copied/pasted answers in a rush or was distracted; did not assimilate.",
      guideCard4Li2:
        "<strong>2 (Superficial / Passive):</strong> Followed steps or generated code with surface understanding; low long-term retention.",
      guideCard4Li3:
        "<strong>3 (Standard comprehension):</strong> Understood the general logic and solved parts on my own.",
      guideCard4Li4:
        "<strong>4 (Solid learning):</strong> Actively reasoned through the problem, synthesized concepts, and can replicate it.",
      guideCard4Li5:
        "<strong>5 (Deep assimilation):</strong> Full mastery; can explain the topic or write the solution from scratch unaided.",
      guideCard5Title: "🧠 5. The 4 Cognitive Dynamics (How did you work?)",
      guideCard5Li1:
        "<strong>👀 Passive Reception (0% adj.):</strong> Reading, listening to a lecture, or watching a video without actively producing or debating yet.",
      guideCard5Li2:
        "<strong>🤖 Delegation / Reproduction (-15% XP if AI &ge;50%):</strong> AI or the source did the heavy lifting and you copied, transcribed, or followed steps mechanically.",
      guideCard5Li3:
        "<strong>🔄 Scaffolding / Co-creation (+5% XP):</strong> You thought with support; used AI as a Socratic tutor, syntax copilot, or structurer of your own ideas.",
      guideCard5Li4:
        "<strong>🧠 Own Generation (+10% XP no AI / +5% minor lookup):</strong> The heavy mental effort came from your own head.",
      guideCard6Title: "📊 6. Time Slots (6h) & RPG Formulas",
      guideCard6Li1:
        "<strong>Circadian Slots (6h):</strong> <code>00:00–05:59 Early Morning</code> · <code>06:00–11:59 Morning</code> · <code>12:00–17:59 Afternoon</code> · <code>18:00–23:59 Night</code>.",
      guideCard6Li2:
        "<strong>Subtopics in Notes:</strong> Write <code>[Subtopic] Your note</code> (e.g. <code>[Roundtable - GANs] Architecture debate</code>) to group in the Inspector.",
      guideCard6Li3:
        "<strong>XP Formula:</strong> <code>ROUND(Minutes * MAX(0.5, 1 + Quality*0.2 + ChallengeBonus + ProgressBonus + DynamicBonus))</code>.",
      guideCard6Li4:
        "<strong>Exponential Curve (Lv. 92 = 50% of 99):</strong> <code>XP(L) = 250 * (2^((L-1)/7) - 1)</code>.",

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
      es: { Sí: "Sí", Parcial: "Parcial", No: "No" },
      en: { Sí: "Yes", Parcial: "Partial", No: "No" }
    },
    objetivoChip: {
      es: {
        Sí: "✅ Sí (Flujo limpio +10%)",
        Parcial: "⚠️ Parcial (Con tropiezos +5%)",
        No: "❌ No (Bloqueo)"
      },
      en: {
        Sí: "✅ Yes (Clean flow +10%)",
        Parcial: "⚠️ Partial (With hurdles +5%)",
        No: "❌ No (Blocked)"
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
        "Capa de Maestría (Nivel 99)": "Capa de Maestría (Nivel 99)",
        "Leyenda de la Mitad (Nv. 92+)": "Leyenda de la Mitad (Nv. 92+)",
        "Gran Maestro Cognitivo": "Gran Maestro Cognitivo",
        "Sabio del Flujo Profundo": "Sabio del Flujo Profundo",
        "Maestro de la Concentración": "Maestro de la Concentración",
        "Arquitecto del Estudio": "Arquitecto del Estudio",
        "Guerrero Pomodoro": "Guerrero Pomodoro",
        "Explorador de Datos": "Explorador de Datos",
        "Aprendiz Constante": "Aprendiz Constante",
        "Novato del Enfoque": "Novato del Enfoque"
      },
      en: {
        "Capa de Maestría (Nivel 99)": "Mastery Cape (Level 99)",
        "Leyenda de la Mitad (Nv. 92+)": "Halfway Legend (Lv. 92+)",
        "Gran Maestro Cognitivo": "Cognitive Grandmaster",
        "Sabio del Flujo Profundo": "Deep Flow Sage",
        "Maestro de la Concentración": "Focus Master",
        "Arquitecto del Estudio": "Study Architect",
        "Guerrero Pomodoro": "Pomodoro Warrior",
        "Explorador de Datos": "Data Explorer",
        "Aprendiz Constante": "Steady Apprentice",
        "Novato del Enfoque": "Focus Novice"
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
      "Repaso / Simulacro": "🔁"
    };
    document
      .querySelectorAll('.chip-group[data-group="tipoActividad"] .chip-btn')
      .forEach((btn) => {
        const val = btn.dataset.value;
        btn.textContent = `${iconosActividad[val] || ""} ${traducirValor("tipoActividad", val)}`;
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
})(window);
