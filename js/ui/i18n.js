/**
 * Capa de Internacionalización (i18n):
 * Soporte bilingüe completo Español (ES) / Inglés (EN) en tiempo real.
 * Traduce la interfaz, el cronómetro/Pomodoro, las ayudas dinámicas, la tabla y los gráficos
 * manteniendo intactos los valores canónicos de datos en el Store y en Excel.
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
      kpiAiSub: "💬 {dial} diálogo · 🧠 {auton} autón. · 🤖 {mech} mec.",

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
      bonusAiAuton: "+5% autónomo",
      bonusAiDialogue: "+5% diálogo IA",
      bonusAiMech: "-15% mecánico",

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
      labelMedium: "Medio de Trabajo",
      labelFamiliarity: "Familiaridad del Tema",
      labelEnergy: "Energía Previa",
      labelComplexity: "Complejidad",
      labelComplexityHint: "(+XP)",
      labelGoal: "¿Fluidez y Avance del Bloque?",
      labelGoalHint: "(Evalúa este bloque, no si terminaste todo el entregable)",
      labelAiMode: "Modo de Uso de IA",
      labelAiModeHint: "(+5% Autónomo/Diálogo · -15% Mecánico)",
      labelAiSlider: "Porcentaje de apoyo IA:",
      labelQuality: "Calidad de Aprendizaje / Asimilación (1 al 5)",
      labelQualityClass: "Concentración, Interés y Retención en Clase (1 al 5)",
      qualityOpt1: "1 - ⭐️ Mecánico / Sin retención (Solo copié o distraído)",
      qualityOpt2: "2 - ⭐️⭐️ Superficial / Pasivo (Entendí por encima)",
      qualityOpt3: "3 - ⭐️⭐️⭐️ Comprensión estándar (Entendí la lógica)",
      qualityOpt4: "4 - ⭐️⭐️⭐️⭐️ Aprendizaje sólido (Razoné y puedo replicarlo)",
      qualityOpt5: "5 - ⭐️⭐️⭐️⭐️⭐️ Asimilación profunda (Dominio total)",
      labelNotes: "Notas breves",
      placeholderNotes: "¿Qué aprendiste, qué debatiste o dónde te trabaste?",
      btnSubmitNew: "💾 Registrar Sesión y Sumar XP",
      btnSubmitEdit: "💾 Actualizar Sesión y Sincronizar CSV",
      btnCancelEdit: "✖ Cancelar edición",

      // Textos dinámicos de ayuda en el formulario
      helpActClass:
        "👨‍🏫 En vivo con profesor: mide tu atención e interés. Por defecto pone IA en 0%, pero si usaste IA en clase (para resolver dudas o para acabar rápido una actividad), selecciona abajo el Modo de IA correspondiente.",
      helpActTheory:
        "📖 Estudio estructurado por tu cuenta: leer documentación oficial, libros, artículos técnicos o ver un curso grabado sin escribir aún apuntes propios.",
      helpActResearch:
        "💬 Explorar dudas abiertas: investigar cómo/por qué funciona algo, comparar opciones o debatir conceptos a fondo (ej. tutoría socrática con IA).",
      helpActDesign:
        "✍️ Sintetizar y estructurar con tus palabras: redactar apuntes o cheatsheets (a mano o en PC), hacer resúmenes, diagramas o planear una arquitectura.",
      helpActDev:
        "💻 Construir e implementar: escribir código, notebooks, consultas SQL, scripts o desarrollar funcionalidades de un proyecto o tarea.",
      helpActPractice:
        "🧪 Ejercitar o destrabar: resolver problemas prácticos, laboratorios o depurar errores (debugging) hasta aislar y corregir la causa raíz.",
      helpActReview:
        "🔁 Consolidar memoria: repasar apuntes previos, flashcards, explicar un tema sin mirar o hacer exámenes de simulacro.",
      helpGoalYes:
        "✅ Flujo limpio (+10% XP): Evalúa ESTE bloque, no si acabaste toda la tarea/proyecto. Úsalo si avanzaste a buen ritmo en lo planeado para esta sesión sin quedarte estancado.",
      helpGoalPartial:
        "⚠️ Con tropiezos / Fricción (+5% XP): Sí avanzaste, pero perdiste parte importante del bloque atorado en un bug, distracción, cansancio o confusión y el ritmo fue accidentado.",
      helpGoalNo:
        "❌ Bloqueo real (0% bono): Te quedaste trabado casi toda la sesión en un obstáculo técnico/conceptual sin lograr destrabarlo, o tuviste que abortar la sesión sin avance efectivo.",
      helpQualityClassNote:
        " 👨‍🏫 En Clase: evalúa aquí tu nivel de concentración, interés y retención de la cátedra.",
      helpQualityClassAiDialogue:
        " 👨‍🏫 Clase + IA de apoyo: usaste IA para despejar dudas que surgieron en vivo; califica qué tanto comprendiste y retuviste la clase.",
      helpQualityClassAiMech:
        " ⚠️ Clase + IA Mecánica: si usaste IA solo para acabar rápido una actividad de clase sin procesarla, considera nivel 1 o 2 (además del ajuste de -15% XP).",
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
        " ⚠️ Nota: seleccionaste modo 'Mecánico / Copy-Paste'; si solo copiaste sin profundizar, considera nivel 1 o 2 (o cambia a 'Diálogo / Tutoría' si aprendiste debatiendo con la IA).",
      helpQualityWarnHighAi:
        " 💡 Con {ai}% de IA, califica con 4-5 solo si hubo diálogo y comprensión profunda, no solo fluidez mecánica.",
      helpAiAuton: "100% por tu cuenta sin asistencia de IA (+5% XP por autonomía cognitiva).",
      helpAiDialogue:
        "Alto valor cognitivo: debate de conceptos, preguntas de '¿por qué?' y refuerzo activo con IA (+5% XP).",
      helpAiCopilot:
        "Apoyo puntual: consulta de sintaxis, documentación o desbloqueo de bugs entendiendo la solución (XP estándar).",
      helpAiMech:
        "Delegación mecánica: automatización directa o copiar/pegar para entregar rápido sin profundizar (-15% XP).",

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
        "Descubre tu ventana dorada cruzando los días de la semana contra las 4 franjas biológicas.",
      heatBtnMin: "⏱️ Minutos",
      heatBtnQual: "⭐️ Asimilación",
      heatBtnEnergy: "🔋 Energía",
      heatmapCornerLabel: "Día \\ Franja",
      heatmapGoldenText:
        "🏆 Ventana dorada: {day} por la {slot} (⭐️ {quality}/5 · {min} min acumulados)",
      heatmapGoldenEmpty: "🏆 Registra sesiones para descubrir tu ventana dorada de enfoque",
      chart1ToggleSummary: "🕒 Ver desglose detallado hora por hora (00:00 - 23:00)",
      chartQuadTitle: "🎯 Cuadrante de Rendimiento Cognitivo (% IA vs. Asimilación)",
      chartQuadHint: "Tamaño de burbuja = Duración · Color = Modo de IA",
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
      chart2Hint: "Aprendizaje real vs. Copy-Paste mecánico",
      chart2ClickHint: "💡 Haz clic en una barra para filtrar por esa materia",
      chart2Subtitle:
        "Contrasta tus minutos de aprendizaje real (Autónomo, Diálogo o Copiloto) frente a las sesiones mecánicas (Copy-Paste) y tu asimilación (1-5).",
      chart3Title: "🧠 Patrones de Hábito: 7 Actividades y Balance Cognitivo",
      chart3Hint: "Comportamiento por tipo de tarea y método",
      chart3Subtitle:
        "Minutos y asimilación promedio según las 7 actividades de estudio y proporción entre consumo receptivo (Clase, Teoría, Investigación) y producción activa (Apuntes, Código, Práctica, Repaso).",
      balanceConsumeLabel: "📖 Consumo (Clase / Teoría / Inv.): {min} min ({pct}%)",
      balanceProduceLabel: "💻 Producción (Apuntes / Código / Práctica): {min} min ({pct}%)",
      frictionChartTitle: "🧱 Matriz de Fricción: Fluidez vs. Tropiezos y Bloqueos",
      frictionChartHint: "Por Complejidad y Familiaridad del tema",
      frictionChartSubtitle:
        "Proporción de bloques con flujo limpio (✅ Sí), con tropiezos (⚠️ Parcial) o bloqueos (❌ No) según el nivel de reto y si el tema es nuevo o ya tenías base.",
      frictionDsYes: "✅ Sí (Flujo limpio)",
      frictionDsPartial: "⚠️ Parcial (Con tropiezos)",
      frictionDsNo: "❌ No (Bloqueo)",
      frictionAxisSessions: "Sesiones",
      habitMatrixTitle: "📝 Impacto de Medio (Papel vs. Digital), Familiaridad, Energía y Reto",
      habitMatrixSubtitle:
        "Descubre cómo cambia tu retención promedio y el uso de IA cuando escribes a mano vs. digital, cuando abordas un tema nuevo vs. con base, y según tu energía inicial.",
      habitByMediumTitle: "📝 Por Medio de Trabajo (Papel vs. Digital)",
      habitByFamiliarityTitle: "🌱 Por Familiaridad del Tema (Nuevo vs. Con Base)",
      habitByEnergyTitle: "🔋 Por Energía Inicial",
      habitByComplexityTitle: "🎯 Por Complejidad del Tema",
      inspectorTopicsTitle: "🗂️ Radiografía por Subtemas (Tema específico)",
      inspectorTopicsHint: "Haz clic en cualquier subtema para filtrar su materia",
      inspectorTopicsSubtitle:
        "Desglose de tiempo invertido, sesiones, asimilación promedio, uso de IA y XP por cada subtema o módulo.",
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
      chartDsMinLearning: "Min. Aprendizaje (Autónomo / Diálogo / Copiloto)",
      chartDsMinMechanical: "Min. Mecánico (Copy-Paste IA)",
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
      thAiModePct: "IA (Modo · %)",
      thXpEarned: "XP Ganados",
      thNotes: "Notas",
      thActions: "Acciones",
      tableAiSupportSub: "{pct}% apoyo IA",
      btnEditSessionTitle: "Editar esta sesión",
      btnDeleteSessionTitle: "Eliminar esta sesión",

      // Guía de Referencia inferior (6 tarjetas)
      guideMainTitle: "📖 Guía de Referencia y Criterios del Sistema",
      guideMainSubtitle:
        "Manual rápido para elegir la actividad correcta, calificar el avance de tu bloque sin ambigüedades e interpretar los gráficos analíticos.",
      guideCard1Title: "🧭 1. Las 7 Actividades y Cómo Distinguirlas",
      guideCard1Li1:
        "<strong>👨‍🏫 Clase / Cátedra:</strong> Sesión en vivo con profesor. <em>Tip:</em> Si en clase haces un ejercicio con IA solo por salir del paso, regístralo aparte o baja la asimilación.",
      guideCard1Li2:
        '<strong>📖 Teoría / Docs vs. 💬 Investigación:</strong> Usa <code>Teoría / Docs</code> cuando consumes material estructurado (documentación, libro, video). Usa <code>Investigación / Diálogo</code> cuando haces preguntas abiertas o debates el <em>"¿por qué?"</em> con una IA.',
      guideCard1Li3:
        "<strong>✍️ Diseño / Apuntes:</strong> Cuando traduces ideas a tus propias palabras (cheatsheets a mano, resúmenes, diagramas).",
      guideCard1Li4:
        "<strong>💻 Código vs. 🧪 Debugging:</strong> <code>Desarrollo / Código</code> es construir funcionalidades; <code>Práctica / Debugging</code> es resolver ejercicios o cazar un bug específico.",
      guideCard1Li5:
        "<strong>🔁 Repaso / Simulacro:</strong> Estudiar de tus propios apuntes previos, flashcards o exámenes de prueba antes de una evaluación.",
      guideCard2Title: "🎯 2. ¿Cuándo elegir Sí, Parcial o Bloqueo?",
      guideCard2Li1:
        "<strong>Regla de Oro:</strong> Evalúa <strong>la fluidez de este bloque de tiempo</strong>, nunca si ya terminaste el proyecto o entregable completo.",
      guideCard2Li2:
        "<strong>✅ Sí — Flujo limpio (+10% XP):</strong> Avanzaste a buen ritmo en la parte que tocabas hoy (ej. escribir 1 página de tu Cheatsheet o programar un módulo), aunque la tarea total continúe mañana.",
      guideCard2Li3:
        "<strong>⚠️ Parcial — Con tropiezos (+5% XP):</strong> Sí hubo progreso, pero perdiste buena parte del bloque atorado en un bug, con distracciones, cansancio o yendo a la mitad de velocidad.",
      guideCard2Li4:
        "<strong>❌ No — Bloqueo real (0% bono):</strong> Te quedaste estancado casi toda la sesión en un obstáculo técnico/conceptual sin destrabarlo, o abortaste la sesión sin avance efectivo.",
      guideCard3Title: "📝 3. Medio, Familiaridad, Energía y Reto",
      guideCard3Li1:
        "<strong>Medio de Trabajo:</strong> <code>💻 Digital</code> (teclado/IDE), <code>📝 Papel / A mano</code> (fuerza a sintetizar sin copy-paste y suele elevar la retención) o <code>🔀 Híbrido</code> (pantalla + cuaderno).",
      guideCard3Li2:
        "<strong>Familiaridad:</strong> <code>🌱 Tema Nuevo</code> (1ª vez que ves el concepto; mayor carga cognitiva) vs. <code>🧱 Con base</code> (tema ya visto en clase o repaso; flujo más constante).",
      guideCard3Li3:
        "<strong>Energía Previa:</strong> <code>🔋 Alta</code>, <code>⚡ Media</code> o <code>🪫 Baja</code> al sentarte a estudiar (alimenta el Mapa de Calor Circadiano).",
      guideCard3Li4:
        "<strong>Complejidad del Reto:</strong> <code>🟢 Fácil (0%)</code>, <code>🟡 Desafiante (+10% XP)</code>, <code>🔴 Muy difícil (+20% XP)</code>.",
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
      guideCard5Title: "🤖 5. Modos de Uso de IA vs. Porcentaje",
      guideCard5Li1:
        "<strong>🧠 Autónomo (+5% XP):</strong> 100% por tu cuenta sin asistencia de IA (fija automáticamente el slider en <code>0%</code>).",
      guideCard5Li2:
        '<strong>💬 Diálogo / Tutoría (+5% XP):</strong> Usas la IA como tutor socrático (preguntas de <em>"¿por qué?"</em>, analogías y validación de tus ideas).',
      guideCard5Li3:
        "<strong>🛠️ Copiloto / Apoyo (0% ajuste):</strong> La IA te ayuda a sintetizar, consultar sintaxis o destrabar un error puntual, pero tú procesas y escribes el resultado.",
      guideCard5Li4:
        "<strong>🤖 Mecánico / Copy-Paste (-15% XP):</strong> Delegación directa para acabar y entregar rápido sin profundizar.",
      guideCard6Title: "📊 6. Lectura del Dashboard y Fórmulas RPG",
      guideCard6Li1:
        "<strong>Cuadrante IA (Pestaña 2):</strong> <code>🚀 Sinergia IA</code> (IA &ge; 35% y Calidad &ge; 4), <code>🧠 Dominio Propio</code> (IA &lt; 35% y Calidad &ge; 4), <code>🤖 Ilusión Mecánica</code> (IA &ge; 35% y Calidad &le; 2), <code>🪫 Fricción</code> (IA &lt; 35% y Calidad &le; 2).",
      guideCard6Li2:
        "<strong>Balance Cognitivo (Pestaña 3):</strong> Compara minutos de <em>Consumo receptivo</em> (Clase, Teoría, Investigación) vs. <em>Producción activa</em> (Apuntes, Código, Debugging, Repaso).",
      guideCard6Li3:
        "<strong>Fórmula XP:</strong> <code>ROUND(Minutos * MAX(0.5, 1 + Calidad*0.2 + BonoReto + BonoAvance + BonoModoIA))</code>.",
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
      kpiAiSub: "💬 {dial} dialogue · 🧠 {auton} auton. · 🤖 {mech} mech.",

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
      bonusAiAuton: "+5% autonomous",
      bonusAiDialogue: "+5% AI dialogue",
      bonusAiMech: "-15% mechanical",

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
      labelMedium: "Work Medium",
      labelFamiliarity: "Topic Familiarity",
      labelEnergy: "Prior Energy",
      labelComplexity: "Complexity",
      labelComplexityHint: "(+XP)",
      labelGoal: "Block Fluency & Progress?",
      labelGoalHint: "(Evaluate this block, not whether the whole project is finished)",
      labelAiMode: "AI Interaction Mode",
      labelAiModeHint: "(+5% Auton/Dialogue · -15% Mechanical)",
      labelAiSlider: "AI assistance percentage:",
      labelQuality: "Learning Quality / Assimilation (1 to 5)",
      labelQualityClass: "Class Focus, Interest & Retention (1 to 5)",
      qualityOpt1: "1 - ⭐️ Mechanical / No retention (Copied or distracted)",
      qualityOpt2: "2 - ⭐️⭐️ Superficial / Passive (Surface understanding)",
      qualityOpt3: "3 - ⭐️⭐️⭐️ Standard comprehension (Understood the logic)",
      qualityOpt4: "4 - ⭐️⭐️⭐️⭐️ Solid learning (Reasoned & can replicate)",
      qualityOpt5: "5 - ⭐️⭐️⭐️⭐️⭐️ Deep assimilation (Full mastery)",
      labelNotes: "Short notes",
      placeholderNotes: "What did you learn, debate, or get stuck on?",
      btnSubmitNew: "💾 Log Session & Earn XP",
      btnSubmitEdit: "💾 Update Session & Sync CSV",
      btnCancelEdit: "✖ Cancel edit",

      // Textos dinámicos de ayuda en el formulario
      helpActClass:
        "👨‍🏫 Live with professor: measures your focus and interest. Defaults to 0% AI, but if you used AI in class (to clarify questions or rush an in-class activity), select the matching AI Mode below.",
      helpActTheory:
        "📖 Self-paced structured study: reading official documentation, books, technical articles, or watching a recorded course without writing your own notes yet.",
      helpActResearch:
        "💬 Exploring open questions: investigating how/why something works, comparing options, or debating concepts deeply (e.g., Socratic AI tutoring).",
      helpActDesign:
        "✍️ Synthesizing & structuring in your own words: writing notes or cheatsheets (by hand or PC), summaries, diagrams, or planning architecture.",
      helpActDev:
        "💻 Building & implementing: writing code, notebooks, SQL queries, scripts, or developing project/assignment features.",
      helpActPractice:
        "🧪 Practicing or unblocking: solving hands-on exercises, labs, or debugging errors until isolating and fixing the root cause.",
      helpActReview:
        "🔁 Consolidating memory: reviewing past notes, flashcards, explaining a topic from memory, or taking mock exams.",
      helpGoalYes:
        "✅ Clean flow (+10% XP): Evaluate THIS block, not whether the entire deliverable is finished. Use it if you progressed smoothly on what you planned for this session.",
      helpGoalPartial:
        "⚠️ With hurdles / Friction (+5% XP): You made progress, but lost significant time stuck on a bug, distraction, fatigue, or confusion.",
      helpGoalNo:
        "❌ Real blocker (0% bonus): Stuck for almost the entire session on a technical/conceptual obstacle without unblocking it, or aborted with no effective progress.",
      helpQualityClassNote:
        " 👨‍🏫 In Class: use this scale to rate your focus, interest, and retention during the lecture.",
      helpQualityClassAiDialogue:
        " 👨‍🏫 Class + AI Support: you used AI to clarify questions that came up live; rate how well you understood and retained the class.",
      helpQualityClassAiMech:
        " ⚠️ Class + Mechanical AI: if you used AI just to finish an in-class activity quickly without processing it, consider level 1 or 2 (along with the -15% XP adjustment).",
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
        " ⚠️ Note: you selected 'Mechanical / Copy-Paste'; if you only copied without reading deeply, consider level 1 or 2 (or switch to 'Dialogue / Tutoring' if you learned by debating with AI).",
      helpQualityWarnHighAi:
        " 💡 With {ai}% AI, rate 4-5 only if there was deep dialogue and comprehension, not just mechanical speed.",
      helpAiAuton: "100% on your own without AI assistance (+5% XP for cognitive autonomy).",
      helpAiDialogue:
        "High cognitive value: conceptual debate, 'why?' questions, and active reinforcement with AI (+5% XP).",
      helpAiCopilot:
        "Targeted support: syntax lookup, docs, or debugging while understanding the solution (standard XP).",
      helpAiMech:
        "Mechanical delegation: direct automation or copy-pasting to deliver quickly without reading deeply (-15% XP).",

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
        "Discover your golden focus window by crossing weekdays against the 4 biological time slots.",
      heatBtnMin: "⏱️ Minutes",
      heatBtnQual: "⭐️ Assimilation",
      heatBtnEnergy: "🔋 Energy",
      heatmapCornerLabel: "Day \\ Slot",
      heatmapGoldenText:
        "🏆 Golden window: {day} {slot} (⭐️ {quality}/5 · {min} total min)",
      heatmapGoldenEmpty: "🏆 Log sessions to discover your golden focus window",
      chart1ToggleSummary: "🕒 View detailed hour-by-hour breakdown (00:00 - 23:00)",
      chartQuadTitle: "🎯 Cognitive Performance Quadrant (% AI vs. Assimilation)",
      chartQuadHint: "Bubble size = Duration · Color = AI Mode",
      chartQuadSubtitle:
        "Spot whether AI is boosting your learning (top-right) or creating an illusion of fluency with low retention (bottom-right).",
      quadSynergyText: "🚀 AI Synergy (≥35% AI, ⭐️ 4-5): {count}",
      quadAutonText: "🧠 Own Mastery (<35% AI, ⭐️ 4-5): {count}",
      quadMechText: "🤖 Mechanical Illusion (≥35% AI, ⭐️ 1-2): {count}",
      quadFatigueText: "🪫 Friction / Fatigue (<35% IA, ⭐️ 1-2): {count}",
      chartAxisAiPct: "AI Usage Percentage (%)",
      chart1Title: "🕒 Performance & Assimilation by Time of Day",
      chart1Hint: "Discover your biological focus peaks",
      chart1Subtitle:
        "Compare minutes studied (bars) and your average assimilation quality (line) by start hour.",
      chart2Title: "📚 AI Impact & Learning by Subject",
      chart2Hint: "Real learning vs. Mechanical Copy-Paste",
      chart2ClickHint: "💡 Click any bar to filter by that subject",
      chart2Subtitle:
        "Contrast your real learning minutes (Autonomous, Dialogue, or Copilot) against mechanical sessions (Copy-Paste) and your assimilation (1-5).",
      chart3Title: "🧠 Habit Patterns: 7 Activities & Cognitive Balance",
      chart3Hint: "Behavior by task type and method",
      chart3Subtitle:
        "Minutes and average assimilation across the 7 study activities and ratio between receptive consumption (Class, Theory, Research) and active production (Notes, Code, Practice, Review).",
      balanceConsumeLabel: "📖 Consumption (Class / Theory / Research): {min} min ({pct}%)",
      balanceProduceLabel: "💻 Production (Notes / Code / Practice): {min} min ({pct}%)",
      frictionChartTitle: "🧱 Friction Matrix: Fluency vs. Hurdles & Blockers",
      frictionChartHint: "By Topic Complexity and Familiarity",
      frictionChartSubtitle:
        "Proportion of blocks with clean flow (✅ Yes), hurdles (⚠️ Partial), or blockers (❌ No) by challenge level and whether the topic is new or familiar.",
      frictionDsYes: "✅ Yes (Clean flow)",
      frictionDsPartial: "⚠️ Partial (With hurdles)",
      frictionDsNo: "❌ No (Blocker)",
      frictionAxisSessions: "Sessions",
      habitMatrixTitle: "📝 Medium (Paper vs. Digital), Familiarity, Energy & Challenge Impact",
      habitMatrixSubtitle:
        "See how your average retention and AI usage change when writing by hand vs. digital, studying a new vs. familiar topic, and by starting energy.",
      habitByMediumTitle: "📝 By Work Medium (Paper vs. Digital)",
      habitByFamiliarityTitle: "🌱 By Topic Familiarity (New vs. Familiar)",
      habitByEnergyTitle: "🔋 By Starting Energy",
      habitByComplexityTitle: "🎯 By Topic Complexity",
      inspectorTopicsTitle: "🗂️ Subtopic Breakdown (Specific Topic)",
      inspectorTopicsHint: "Click any subtopic to filter its subject",
      inspectorTopicsSubtitle:
        "Time invested, sessions, average assimilation, AI usage, and XP for each specific topic or module.",
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
      chartDsMinLearning: "Learning Min. (Autonomous / Dialogue / Copilot)",
      chartDsMinMechanical: "Mechanical Min. (AI Copy-Paste)",
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
      thAiModePct: "AI (Mode · %)",
      thXpEarned: "XP Earned",
      thNotes: "Notes",
      thActions: "Actions",
      tableAiSupportSub: "{pct}% AI support",
      btnEditSessionTitle: "Edit this session",
      btnDeleteSessionTitle: "Delete this session",

      // Guía de Referencia inferior (6 tarjetas)
      guideMainTitle: "📖 System Reference Guide & Criteria",
      guideMainSubtitle:
        "Quick pocket manual to pick the right activity, rate block progress unambiguously, and read the analytics charts.",
      guideCard1Title: "🧭 1. The 7 Activities & How to Tell Them Apart",
      guideCard1Li1:
        "<strong>👨‍🏫 Class / Lecture:</strong> Live session with a professor. <em>Tip:</em> If you rush an in-class exercise with AI, log it separately or lower assimilation.",
      guideCard1Li2:
        '<strong>📖 Theory / Docs vs. 💬 Research:</strong> Use <code>Theory / Docs</code> when consuming structured material (docs, book, video). Use <code>Research / Dialogue</code> when asking open questions or debating <em>"why?"</em> with AI.',
      guideCard1Li3:
        "<strong>✍️ Design / Notes:</strong> Translating concepts into your own words (handwritten cheatsheets, summaries, diagrams).",
      guideCard1Li4:
        "<strong>💻 Code vs. 🧪 Debugging:</strong> <code>Dev / Code</code> is building features; <code>Practice / Debug</code> is solving exercises or hunting down a specific bug.",
      guideCard1Li5:
        "<strong>🔁 Review / Mock:</strong> Studying from your own prior notes, flashcards, or mock exams before an assessment.",
      guideCard2Title: "🎯 2. When to Pick Yes, Partial, or Blocked?",
      guideCard2Li1:
        "<strong>Golden Rule:</strong> Evaluate <strong>the fluency of this time block</strong>, never whether the entire project/deliverable is finished.",
      guideCard2Li2:
        "<strong>✅ Yes — Clean flow (+10% XP):</strong> You progressed at a good pace on today's slice (e.g., 1 page of your Cheatsheet or 1 module), even if the overall assignment continues tomorrow.",
      guideCard2Li3:
        "<strong>⚠️ Partial — With hurdles (+5% XP):</strong> You made progress, but lost significant time stuck on a bug, distraction, fatigue, or moving at half speed.",
      guideCard2Li4:
        "<strong>❌ No — Real blocker (0% bonus):</strong> Stuck for almost the whole session on a technical/conceptual obstacle without unblocking it, or aborted with no effective progress.",
      guideCard3Title: "📝 3. Medium, Familiarity, Energy & Challenge",
      guideCard3Li1:
        "<strong>Work Medium:</strong> <code>💻 Digital</code> (keyboard/IDE), <code>📝 Paper / Handwritten</code> (forces synthesis without copy-pasting and boosts retention), or <code>🔀 Hybrid</code> (screen + notebook).",
      guideCard3Li2:
        "<strong>Familiarity:</strong> <code>🌱 New Topic</code> (1st contact with the concept; higher cognitive load) vs. <code>🧱 Familiar</code> (already seen in class or review; steadier flow).",
      guideCard3Li3:
        "<strong>Prior Energy:</strong> <code>🔋 High</code>, <code>⚡ Medium</code>, or <code>🪫 Low</code> when sitting down to study (feeds the Circadian Heatmap).",
      guideCard3Li4:
        "<strong>Challenge Complexity:</strong> <code>🟢 Easy (0%)</code>, <code>🟡 Challenging (+10% XP)</code>, <code>🔴 Very Hard (+20% XP)</code>.",
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
      guideCard5Title: "🤖 5. AI Usage Modes vs. Percentage",
      guideCard5Li1:
        "<strong>🧠 Autonomous (+5% XP):</strong> 100% on your own without AI assistance (automatically locks slider to <code>0%</code>).",
      guideCard5Li2:
        '<strong>💬 Dialogue / Tutoring (+5% XP):</strong> Using AI as a Socratic tutor (<em>"why?"</em> questions, analogies, and validating your ideas).',
      guideCard5Li3:
        "<strong>🛠️ Copilot / Support (0% adj.):</strong> AI helps synthesize, check syntax, or unblock a specific bug, while you process and write the result.",
      guideCard5Li4:
        "<strong>🤖 Mechanical / Copy-Paste (-15% XP):</strong> Direct delegation to finish and deliver quickly without deep processing.",
      guideCard6Title: "📊 6. Reading the Dashboard & RPG Formulas",
      guideCard6Li1:
        "<strong>AI Quadrant (Tab 2):</strong> <code>🚀 AI Synergy</code> (AI &ge; 35% &amp; Quality &ge; 4), <code>🧠 Own Mastery</code> (AI &lt; 35% &amp; Quality &ge; 4), <code>🤖 Mechanical Illusion</code> (AI &ge; 35% &amp; Quality &le; 2), <code>🪫 Friction</code> (AI &lt; 35% &amp; Quality &le; 2).",
      guideCard6Li2:
        "<strong>Cognitive Balance (Tab 3):</strong> Compares minutes of <em>Receptive Consumption</em> (Class, Theory, Research) vs. <em>Active Production</em> (Notes, Code, Debugging, Review).",
      guideCard6Li3:
        "<strong>XP Formula:</strong> <code>ROUND(Minutes * MAX(0.5, 1 + Quality*0.2 + ChallengeBonus + ProgressBonus + AiModeBonus))</code>.",
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
        "Teoría / Docs": "Teoría / Docs",
        "Investigación / Diálogo": "Investigación / Diálogo",
        "Diseño / Apuntes": "Diseño / Apuntes",
        "Desarrollo / Código": "Desarrollo / Código",
        "Práctica / Debugging": "Práctica / Debugging",
        "Repaso / Simulacro": "Repaso / Simulacro"
      },
      en: {
        "Clase / Cátedra": "Class / Lecture",
        "Teoría / Docs": "Theory / Docs",
        "Investigación / Diálogo": "Research / Dialogue",
        "Diseño / Apuntes": "Design / Notes",
        "Desarrollo / Código": "Dev / Code",
        "Práctica / Debugging": "Practice / Debug",
        "Repaso / Simulacro": "Review / Mock"
      }
    },
    medio: {
      es: {
        Digital: "Digital",
        "Analógico / Papel": "Papel / A mano",
        Híbrido: "Híbrido"
      },
      en: {
        Digital: "Digital",
        "Analógico / Papel": "Paper / Handwritten",
        Híbrido: "Hybrid"
      }
    },
    medioChip: {
      es: {
        Digital: "💻 Digital",
        "Analógico / Papel": "📝 Papel / A mano",
        Híbrido: "🔀 Híbrido"
      },
      en: {
        Digital: "💻 Digital",
        "Analógico / Papel": "📝 Paper / Hand",
        Híbrido: "🔀 Hybrid"
      }
    },
    familiaridad: {
      es: {
        Nuevo: "Tema Nuevo",
        "Con base": "Con base"
      },
      en: {
        Nuevo: "New Topic",
        "Con base": "Familiar"
      }
    },
    familiaridadChip: {
      es: {
        Nuevo: "🌱 Tema Nuevo",
        "Con base": "🧱 Con base"
      },
      en: {
        Nuevo: "🌱 New Topic",
        "Con base": "🧱 Familiar"
      }
    },
    modoIA: {
      es: {
        Autónomo: "Autónomo",
        "Diálogo / Tutoría": "Diálogo / Tutoría",
        "Copiloto / Apoyo": "Copiloto / Apoyo",
        "Mecánico / Copy-Paste": "Mecánico / Copy-Paste"
      },
      en: {
        Autónomo: "Autonomous",
        "Diálogo / Tutoría": "Dialogue / Tutoring",
        "Copiloto / Apoyo": "Copilot / Support",
        "Mecánico / Copy-Paste": "Mechanical / Copy-Paste"
      }
    },
    modoIAChip: {
      es: {
        Autónomo: "🧠 Autónomo (Sin IA)",
        "Diálogo / Tutoría": "💬 Diálogo / Tutoría",
        "Copiloto / Apoyo": "🛠️ Copiloto / Apoyo",
        "Mecánico / Copy-Paste": "🤖 Mecánico / Copy-Paste"
      },
      en: {
        Autónomo: "🧠 Autonomous (No AI)",
        "Diálogo / Tutoría": "💬 Dialogue / Tutoring",
        "Copiloto / Apoyo": "🛠️ Copilot / Support",
        "Mecánico / Copy-Paste": "🤖 Mechanical / Copy-Paste"
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
      "Teoría / Docs": "📖",
      "Investigación / Diálogo": "💬",
      "Diseño / Apuntes": "✍️",
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
      .querySelectorAll('.chip-group[data-group="medio"] .chip-btn')
      .forEach((btn) => {
        const val = btn.dataset.value;
        btn.textContent = traducirValor("medioChip", val);
      });

    document
      .querySelectorAll('.chip-group[data-group="familiaridad"] .chip-btn')
      .forEach((btn) => {
        const val = btn.dataset.value;
        btn.textContent = traducirValor("familiaridadChip", val);
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

    document.querySelectorAll('.chip-group[data-group="modoIA"] .chip-btn').forEach((btn) => {
      const val = btn.dataset.value;
      btn.textContent = traducirValor("modoIAChip", val);
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

