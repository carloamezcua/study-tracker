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
        'Sincronización en vivo con <code>data/study-tracker.xlsx</code> (Altas, ediciones y bajas en tiempo real)',
      statusConnecting: "Conectando con servidor local...",
      statusBrowserMode:
        "Modo navegador (Ejecuta start.bat para sincronizar data/study-tracker.xlsx)",
      statusLiveSynced: "🟢 Sincronizado en vivo: {path}",
      statusReloaded: "🟢 Recargado desde: data/study-tracker.xlsx",
      statusLoadedFile: "Cargado: {file}",
      statusExcelLocked: "⚠️ Archivo abierto en Excel — Ciérralo y pulsa 'Sincronizar'",
      btnSyncExcel: "🔄 Sincronizar Excel",
      btnSyncExcelTitle:
        "Guarda inmediatamente todos los registros actuales en data/study-tracker.xlsx",
      btnReloadExcel: "📂 Recargar de Excel",
      btnReloadExcelTitle:
        "Vuelve a leer data/study-tracker.xlsx si hiciste cambios manuales desde Microsoft Excel",
      btnImportExcel: "📤 Importar otro .xlsx",
      btnImportExcelTitle: "Importar un archivo .xlsx externo",
      btnExportExcel: "📥 Descargar copia (.xlsx)",
      btnExportExcelTitle: "Descarga una copia de respaldo de study-tracker.xlsx",

      // Banner RPG
      rpgLevelSmall: "Nivel",
      rpgRankPrefix: "Rango:",
      rpgXpToNext: "XP para subir de nivel",
      rpgMaxLevel: "MÁX",
      rpgTotalXpLabel: "XP Total Acumulado",

      // Filtro por Contexto
      filterLabel: "🔍 Filtrar analítica y tabla por contexto:",
      filterAll: "🌐 Todos",

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
        'Cronometra tu sesión o regístrala en 1 clic. Sincronización automática con <code>data/study-tracker.xlsx</code>.',
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
      bonusGoalYes: "+10% meta",
      bonusGoalPartial: "+5% avance",
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
      labelEnergy: "Energía Previa",
      labelComplexity: "Complejidad",
      labelComplexityHint: "(+XP)",
      labelGoal: "¿Objetivo Cumplido?",
      labelGoalHint: "(+10% Sí · +5% Parcial)",
      labelAiMode: "Modo de Uso de IA",
      labelAiModeHint: "(+5% Autónomo/Diálogo · -15% Mecánico)",
      labelAiSlider: "Porcentaje de apoyo IA:",
      labelQuality: "Calidad de Aprendizaje / Asimilación (1 al 5)",
      qualityOpt1: "1 - ⭐️ Mecánico / Sin retención (Solo copié o distraído)",
      qualityOpt2: "2 - ⭐️⭐️ Superficial / Pasivo (Entendí por encima)",
      qualityOpt3: "3 - ⭐️⭐️⭐️ Comprensión estándar (Entendí la lógica)",
      qualityOpt4: "4 - ⭐️⭐️⭐️⭐️ Aprendizaje sólido (Razoné y puedo replicarlo)",
      qualityOpt5: "5 - ⭐️⭐️⭐️⭐️⭐️ Asimilación profunda (Dominio total)",
      labelNotes: "Notas breves",
      placeholderNotes: "¿Qué aprendiste, qué debatiste o dónde te trabaste?",
      btnSubmitNew: "💾 Registrar Sesión y Sumar XP",
      btnSubmitEdit: "💾 Actualizar Sesión y Sincronizar Excel",
      btnCancelEdit: "✖ Cancelar edición",

      // Textos dinámicos de ayuda en el formulario
      helpGoalYes: "Meta lograda: completaste lo planeado para este bloque (+10% XP).",
      helpGoalPartial:
        "En progreso: hubo avance real y aprendizaje, pero continuará en otra sesión (+5% XP).",
      helpGoalNo:
        "Bloqueo o sin avance: te trabaste en un error, hubo distracción total o interrupción (0% bono, alerta de bloqueo).",
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

      // Gráficos
      chart1Title: "🕒 Rendimiento y Asimilación por Hora del Día",
      chart1Hint: "Descubre tus picos biológicos de enfoque",
      chart1Subtitle:
        "Compara los minutos estudiados (barras) y tu calidad de asimilación promedio (línea) según la hora de inicio.",
      chart2Title: "📚 Impacto de IA y Aprendizaje por Materia",
      chart2Hint: "Aprendizaje real vs. Copy-Paste mecánico",
      chart2Subtitle:
        "Contrasta tus minutos de aprendizaje real (Autónomo, Diálogo o Copiloto) frente a las sesiones mecánicas (Copy-Paste) y tu asimilación (1-5).",
      chart3Title: "🧠 Patrones de Hábito: Actividad y Energía Previa",
      chart3Hint: "Comportamiento por tipo de tarea y fatiga",
      chart3Subtitle:
        "Minutos y asimilación promedio según los 6 tipos de actividad y cómo rinde tu aprendizaje según tu energía inicial.",
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

      // Guía de Referencia inferior
      guideMainTitle: "📖 Guía de Referencia y Escalas del Sistema",
      guideMainSubtitle:
        "Documentación integrada para evaluar el impacto cognitivo de cada bloque y cómo se calculan las fórmulas en Excel.",
      guideCard1Title: "⭐️ Calidad de Aprendizaje / Asimilación (1 al 5)",
      guideCard1Li1:
        "<strong>1 (Mecánico / Sin retención):</strong> Solo copié/pegué respuestas o estuve distraído; no asimilé el tema.",
      guideCard1Li2:
        "<strong>2 (Superficial / Pasivo):</strong> Seguí pasos o código generado entendiendo solo por encima; poca retención.",
      guideCard1Li3:
        "<strong>3 (Comprensión estándar):</strong> Entendí la lógica general de lo realizado y resolví partes por mi cuenta.",
      guideCard1Li4:
        "<strong>4 (Aprendizaje sólido):</strong> Razoné activamente el problema, comprendí el porqué y puedo replicarlo.",
      guideCard1Li5:
        "<strong>5 (Asimilación profunda):</strong> Esfuerzo mental propio al máximo; dominé el concepto a fondo y puedo explicarlo sin ayuda.",
      guideCard2Title: "🧠 Contexto y 6 Tipos de Actividad",
      guideCard2Li1:
        "<strong>Contexto:</strong> <code>🎓 Académico</code>, <code>🏅 Certificación</code>, <code>🚀 Proyecto Propio</code>, <code>🤝 Externo</code>.",
      guideCard2Li2:
        "<strong>Actividades:</strong> <code>📖 Teoría / Docs</code>, <code>💬 Investigación / Diálogo</code>, <code>✍️ Diseño / Apuntes</code>, <code>💻 Desarrollo / Código</code>, <code>🧪 Práctica / Debugging</code>, <code>🔁 Repaso / Simulacro</code>.",
      guideCard2Li3:
        "<strong>Energía Previa:</strong> <code>🔋 Alta</code>, <code>⚡ Media</code>, <code>🪫 Baja</code>.",
      guideCard2Li4:
        "<strong>Objetivo:</strong> <code>✅ Sí (+10% XP)</code>, <code>⚠️ Parcial (+5% XP)</code>, <code>❌ No (0% / Bloqueo)</code>.",
      guideCard3Title: "🤖 Modo de Uso de IA (Impacto Cognitivo)",
      guideCard3Li1:
        "<strong>🧠 Autónomo (+5% XP):</strong> 100% por tu cuenta (0% IA).",
      guideCard3Li2:
        '<strong>💬 Diálogo / Tutoría (+5% XP):</strong> Debate conceptual, preguntas de <em>"¿por qué?"</em> y refuerzo activo con IA.',
      guideCard3Li3:
        "<strong>🛠️ Copiloto / Apoyo (0% ajuste):</strong> Consulta puntual de sintaxis o desbloqueo de bugs entendiendo la solución.",
      guideCard3Li4:
        "<strong>🤖 Mecánico / Copy-Paste (-15% XP):</strong> Automatización directa para entregar rápido sin leer a fondo.",
      guideCard4Title: "🧮 Curva Exponencial y Fórmulas en Excel",
      guideCard4Li1:
        "<strong>Curva RPG (Nv. 92 = 50% de 99):</strong> <code>XP(L) = 250 * (2^((L-1)/7) - 1)</code> (El XP necesario se duplica cada 7 niveles).",
      guideCard4Li2:
        "<strong>Duración (Minutos):</strong> <code>=MOD(TIMEVALUE(Fin)-TIMEVALUE(Inicio),1)*1440</code>.",
      guideCard4Li3:
        "<strong>XP con Bonos y Modo IA:</strong> <code>=ROUND(Duracion * MAX(0.5, 1 + Calidad*0.2 + BonoReto + BonoMeta + BonoModoIA), 0)</code>.",

      // Alertas y confirmaciones
      alertServerOffline:
        "El servidor local no está activo. Ejecuta 'start.bat' o 'npm start' para activar el guardado directo en data/study-tracker.xlsx.",
      alertReloadError:
        "No se pudo leer data/study-tracker.xlsx desde el servidor local. Asegúrate de haber iniciado 'start.bat' o 'npm start'.",
      alertImportError:
        "No se pudo leer el archivo seleccionado. Verifica que sea un .xlsx válido.",
      confirmClearAll:
        "¿Seguro que deseas vaciar todas las sesiones registradas en el dashboard y en el Excel?"
    },

    en: {
      // Top bar
      brandTitle: "⚔️ StudyTracker — Analytics & RPG",
      brandSubtitle:
        'Live sync with <code>data/study-tracker.xlsx</code> (Real-time create, edit & delete)',
      statusConnecting: "Connecting to local server...",
      statusBrowserMode:
        "Browser mode (Run start.bat to sync data/study-tracker.xlsx)",
      statusLiveSynced: "🟢 Live synced: {path}",
      statusReloaded: "🟢 Reloaded from: data/study-tracker.xlsx",
      statusLoadedFile: "Loaded: {file}",
      statusExcelLocked: "⚠️ File open in Excel — Close it and click 'Sync Excel'",
      btnSyncExcel: "🔄 Sync Excel",
      btnSyncExcelTitle:
        "Immediately save all current records to data/study-tracker.xlsx",
      btnReloadExcel: "📂 Reload Excel",
      btnReloadExcelTitle:
        "Re-read data/study-tracker.xlsx if you made manual edits in Microsoft Excel",
      btnImportExcel: "📤 Import .xlsx",
      btnImportExcelTitle: "Import an external .xlsx file",
      btnExportExcel: "📥 Download Copy (.xlsx)",
      btnExportExcelTitle: "Download a backup copy of study-tracker.xlsx",

      // Banner RPG
      rpgLevelSmall: "Level",
      rpgRankPrefix: "Rank:",
      rpgXpToNext: "XP to next level",
      rpgMaxLevel: "MAX",
      rpgTotalXpLabel: "Total Accumulated XP",

      // Filtro por Contexto
      filterLabel: "🔍 Filter analytics & table by context:",
      filterAll: "🌐 All",

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
        'Time your session or log it in 1 click. Auto-synced with <code>data/study-tracker.xlsx</code>.',
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
      bonusGoalYes: "+10% goal",
      bonusGoalPartial: "+5% progress",
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
      labelEnergy: "Prior Energy",
      labelComplexity: "Complexity",
      labelComplexityHint: "(+XP)",
      labelGoal: "Goal Achieved?",
      labelGoalHint: "(+10% Yes · +5% Partial)",
      labelAiMode: "AI Interaction Mode",
      labelAiModeHint: "(+5% Auton/Dialogue · -15% Mechanical)",
      labelAiSlider: "AI assistance percentage:",
      labelQuality: "Learning Quality / Assimilation (1 to 5)",
      qualityOpt1: "1 - ⭐️ Mechanical / No retention (Copied or distracted)",
      qualityOpt2: "2 - ⭐️⭐️ Superficial / Passive (Surface understanding)",
      qualityOpt3: "3 - ⭐️⭐️⭐️ Standard comprehension (Understood the logic)",
      qualityOpt4: "4 - ⭐️⭐️⭐️⭐️ Solid learning (Reasoned & can replicate)",
      qualityOpt5: "5 - ⭐️⭐️⭐️⭐️⭐️ Deep assimilation (Full mastery)",
      labelNotes: "Short notes",
      placeholderNotes: "What did you learn, debate, or get stuck on?",
      btnSubmitNew: "💾 Log Session & Earn XP",
      btnSubmitEdit: "💾 Update Session & Sync Excel",
      btnCancelEdit: "✖ Cancel edit",

      // Textos dinámicos de ayuda en el formulario
      helpGoalYes: "Goal achieved: you completed what was planned for this block (+10% XP).",
      helpGoalPartial:
        "In progress: real progress and learning occurred, to be continued next session (+5% XP).",
      helpGoalNo:
        "Blocked or no progress: stuck on an error, total distraction, or interruption (0% bonus, blocker alert).",
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

      // Gráficos
      chart1Title: "🕒 Performance & Assimilation by Time of Day",
      chart1Hint: "Discover your biological focus peaks",
      chart1Subtitle:
        "Compare minutes studied (bars) and your average assimilation quality (line) by start hour.",
      chart2Title: "📚 AI Impact & Learning by Subject",
      chart2Hint: "Real learning vs. Mechanical Copy-Paste",
      chart2Subtitle:
        "Contrast your real learning minutes (Autonomous, Dialogue, or Copilot) against mechanical sessions (Copy-Paste) and your assimilation (1-5).",
      chart3Title: "🧠 Habit Patterns: Activity & Prior Energy",
      chart3Hint: "Behavior by task type and fatigue",
      chart3Subtitle:
        "Minutes and average assimilation across the 6 activity types and how your learning performs based on starting energy.",
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

      // Guía de Referencia inferior
      guideMainTitle: "📖 System Reference Guide & Scales",
      guideMainSubtitle:
        "Built-in documentation to evaluate the cognitive impact of each block and how Excel formulas are calculated.",
      guideCard1Title: "⭐️ Learning Quality / Assimilation (1 to 5)",
      guideCard1Li1:
        "<strong>1 (Mechanical / No retention):</strong> Only copied/pasted answers or was distracted; did not assimilate.",
      guideCard1Li2:
        "<strong>2 (Superficial / Passive):</strong> Followed steps or generated code with surface understanding; low retention.",
      guideCard1Li3:
        "<strong>3 (Standard comprehension):</strong> Understood the general logic and solved parts on my own.",
      guideCard1Li4:
        "<strong>4 (Solid learning):</strong> Actively reasoned through the problem, understood the 'why', and can replicate it.",
      guideCard1Li5:
        "<strong>5 (Deep assimilation):</strong> Maximum mental effort; mastered the concept and can explain it unaided.",
      guideCard2Title: "🧠 Context & 6 Activity Types",
      guideCard2Li1:
        "<strong>Context:</strong> <code>🎓 Academic</code>, <code>🏅 Certification</code>, <code>🚀 Own Project</code>, <code>🤝 External</code>.",
      guideCard2Li2:
        "<strong>Activities:</strong> <code>📖 Theory / Docs</code>, <code>💬 Research / Dialogue</code>, <code>✍️ Design / Notes</code>, <code>💻 Dev / Code</code>, <code>🧪 Practice / Debugging</code>, <code>🔁 Review / Mock Exam</code>.",
      guideCard2Li3:
        "<strong>Prior Energy:</strong> <code>🔋 High</code>, <code>⚡ Medium</code>, <code>🪫 Low</code>.",
      guideCard2Li4:
        "<strong>Goal:</strong> <code>✅ Yes (+10% XP)</code>, <code>⚠️ Partial (+5% XP)</code>, <code>❌ No (0% / Blocked)</code>.",
      guideCard3Title: "🤖 AI Usage Mode (Cognitive Impact)",
      guideCard3Li1:
        "<strong>🧠 Autonomous (+5% XP):</strong> 100% on your own (0% AI).",
      guideCard3Li2:
        '<strong>💬 Dialogue / Tutoring (+5% XP):</strong> Conceptual debate, <em>"why?"</em> questions, and active reinforcement with AI.',
      guideCard3Li3:
        "<strong>🛠️ Copilot / Support (0% adj.):</strong> Targeted syntax lookup or bug unblocking while understanding the fix.",
      guideCard3Li4:
        "<strong>🤖 Mechanical / Copy-Paste (-15% XP):</strong> Direct automation to deliver quickly without reading deeply.",
      guideCard4Title: "🧮 Exponential Curve & Excel Formulas",
      guideCard4Li1:
        "<strong>RPG Curve (Lv. 92 = 50% of 99):</strong> <code>XP(L) = 250 * (2^((L-1)/7) - 1)</code> (Required XP doubles every 7 levels).",
      guideCard4Li2:
        "<strong>Duration (Minutes):</strong> <code>=MOD(TIMEVALUE(End)-TIMEVALUE(Start),1)*1440</code>.",
      guideCard4Li3:
        "<strong>XP with Bonuses & AI Mode:</strong> <code>=ROUND(Duration * MAX(0.5, 1 + Quality*0.2 + ChallengeBonus + GoalBonus + AiModeBonus), 0)</code>.",

      // Alertas y confirmaciones
      alertServerOffline:
        "Local server is not running. Run 'start.bat' or 'npm start' to enable direct saving to data/study-tracker.xlsx.",
      alertReloadError:
        "Could not read data/study-tracker.xlsx from local server. Make sure you started 'start.bat' or 'npm start'.",
      alertImportError:
        "Could not read the selected file. Please verify it is a valid .xlsx file.",
      confirmClearAll:
        "Are you sure you want to clear all logged sessions in the dashboard and Excel?"
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
        "Teoría / Docs": "Teoría / Docs",
        "Investigación / Diálogo": "Investigación / Diálogo",
        "Diseño / Apuntes": "Diseño / Apuntes",
        "Desarrollo / Código": "Desarrollo / Código",
        "Práctica / Debugging": "Práctica / Debugging",
        "Repaso / Simulacro": "Repaso / Simulacro"
      },
      en: {
        "Teoría / Docs": "Theory / Docs",
        "Investigación / Diálogo": "Research / Dialogue",
        "Diseño / Apuntes": "Design / Notes",
        "Desarrollo / Código": "Dev / Code",
        "Práctica / Debugging": "Practice / Debug",
        "Repaso / Simulacro": "Review / Mock"
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
        Sí: "✅ Sí (Logrado +10%)",
        Parcial: "⚠️ Parcial (+5%)",
        No: "❌ No (Bloqueo)"
      },
      en: {
        Sí: "✅ Yes (Achieved +10%)",
        Parcial: "⚠️ Partial (+5%)",
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

