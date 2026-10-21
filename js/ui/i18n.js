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
      labelEnergy: "Energía Previa",
      labelComplexity: "Complejidad",
      labelComplexityHint: "(+XP)",
      labelGoal: "¿Avance del Bloque / Meta?",
      labelGoalHint: "(+10% Buen avance · +5% Con tropiezos)",
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
      helpActPrep:
        "🗂️ Antes de estudiar/programar: armar el ambiente, recopilar fuentes o 'masticar' contexto en un LLM para reutilizarlo en varias sesiones.",
      helpActClass:
        "👨‍🏫 En vivo con profesor: mide tu atención e interés. Por defecto pone IA en 0%, pero si usaste IA en clase (para resolver dudas o para acabar rápido una actividad), selecciona abajo el Modo de IA correspondiente.",
      helpActTheory:
        "📖 Estudio estructurado por tu cuenta: leer documentación oficial, libros, artículos técnicos o ver un curso grabado.",
      helpActResearch:
        "💬 Explorar dudas abiertas: investigar cómo/por qué funciona algo, comparar opciones o debatir conceptos a fondo (ej. tutoría socrática con IA).",
      helpActDesign:
        "✍️ Sintetizar y estructurar: redactar apuntes propios (en cuaderno o compu), hacer resúmenes, diagramas o planear una arquitectura.",
      helpActDev:
        "💻 Construir e implementar: escribir código, consultas SQL, scripts o desarrollar funcionalidades de un proyecto o tarea.",
      helpActPractice:
        "🧪 Ejercitar o destrabar: resolver problemas prácticos, laboratorios o depurar errores (debugging) hasta corregir la causa.",
      helpActReview:
        "🔁 Consolidar memoria: repasar apuntes previos, flashcards, explicar un tema sin mirar o hacer exámenes de simulacro.",
      helpGoalYes:
        "Buen avance del bloque (+10% XP): completaste la meta o avanzaste a buen ritmo en una tarea larga que seguirá en otra sesión.",
      helpGoalPartial:
        "Avance con tropiezos (+5% XP): hubo progreso, pero fue menor o más lento de lo esperado por dudas o distracciones.",
      helpGoalNo:
        "Bloqueo o sin avance (0% bono): te trabaste en un error, hubo distracción total o interrupción (alerta de bloqueo).",
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
      chart3Title: "🧠 Patrones de Hábito: 8 Actividades y Balance Cognitivo",
      chart3Hint: "Comportamiento por tipo de tarea y fatiga",
      chart3Subtitle:
        "Minutos y asimilación promedio según los 8 tipos de actividad y proporción entre preparación/teoría y práctica/producción.",
      balanceConsumeLabel: "📖 Preparación / Clase / Teoría: {min} min ({pct}%)",
      balanceProduceLabel: "💻 Apuntes / Código / Práctica: {min} min ({pct}%)",
      habitMatrixTitle: "🔋 Impacto de la Energía Previa y Complejidad",
      habitMatrixSubtitle:
        "Compara cómo cambia tu retención promedio según tu energía al iniciar y la dificultad del reto.",
      habitByEnergyTitle: "Por Energía Inicial",
      habitByComplexityTitle: "Por Complejidad del Tema",
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

      // Guía de Referencia inferior
      guideMainTitle: "📖 Guía de Referencia y Escalas del Sistema",
      guideMainSubtitle:
        "Documentación integrada para evaluar el impacto cognitivo de cada bloque y cómo se calculan las métricas en JavaScript y CSV.",
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
      guideCard2Title: "🧠 Contexto y 8 Tipos de Actividad",
      guideCard2Li1:
        "<strong>Contexto:</strong> <code>🎓 Académico</code>, <code>🏅 Certificación</code>, <code>🚀 Proyecto Propio</code>, <code>🤝 Externo</code>.",
      guideCard2Li2:
        "<strong>Actividades:</strong> <code>🗂️ Preparación / Contexto</code>, <code>👨‍🏫 Clase / Cátedra</code>, <code>📖 Teoría / Docs</code>, <code>💬 Investigación / Diálogo</code>, <code>✍️ Diseño / Apuntes</code>, <code>💻 Desarrollo / Código</code>, <code>🧪 Práctica / Debugging</code>, <code>🔁 Repaso / Simulacro</code>.",
      guideCard2Li3:
        "<strong>Energía Previa:</strong> <code>🔋 Alta</code>, <code>⚡ Media</code>, <code>🪫 Baja</code>.",
      guideCard2Li4:
        "<strong>Avance del Bloque:</strong> <code>✅ Sí (+10% XP: buen avance)</code>, <code>⚠️ Parcial (+5% XP: con tropiezos)</code>, <code>❌ No (0% / Bloqueo)</code>.",
      guideCard3Title: "🤖 Modo de Uso de IA (Impacto Cognitivo)",
      guideCard3Li1:
        "<strong>🧠 Autónomo (+5% XP):</strong> 100% por tu cuenta (0% IA).",
      guideCard3Li2:
        '<strong>💬 Diálogo / Tutoría (+5% XP):</strong> Debate conceptual, preguntas de <em>"¿por qué?"</em> y refuerzo activo con IA.',
      guideCard3Li3:
        "<strong>🛠️ Copiloto / Apoyo (0% ajuste):</strong> Consulta puntual de sintaxis o desbloqueo de bugs entendiendo la solución.",
      guideCard3Li4:
        "<strong>🤖 Mecánico / Copy-Paste (-15% XP):</strong> Automatización directa para entregar rápido sin leer a fondo.",
      guideCard4Title: "🧮 Curva Exponencial y Fórmulas en JavaScript",
      guideCard4Li1:
        "<strong>Curva RPG (Nv. 92 = 50% de 99):</strong> <code>XP(L) = 250 * (2^((L-1)/7) - 1)</code> (El XP necesario se duplica cada 7 niveles).",
      guideCard4Li2:
        "<strong>Duración (Minutos):</strong> Calculada automáticamente en JS a partir de <code>Hora_Inicio</code> y <code>Hora_Fin</code> (soporta cruce de medianoche).",
      guideCard4Li3:
        "<strong>XP con Bonos y Modo IA:</strong> <code>ROUND(Duracion * MAX(0.5, 1 + Calidad*0.2 + BonoReto + BonoMeta + BonoModoIA))</code>.",

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
      labelEnergy: "Prior Energy",
      labelComplexity: "Complexity",
      labelComplexityHint: "(+XP)",
      labelGoal: "Block Progress / Goal?",
      labelGoalHint: "(+10% Solid progress · +5% Rough progress)",
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
      helpActPrep:
        "🗂️ Before studying/coding: setting up the environment, gathering sources, or 'digesting' context in an LLM to reuse across multiple sessions.",
      helpActClass:
        "👨‍🏫 Live with professor: measures your focus and interest. Defaults to 0% AI, but if you used AI in class (to clarify questions or rush an in-class activity), select the matching AI Mode below.",
      helpActTheory:
        "📖 Self-paced structured study: reading official documentation, books, technical articles, or watching a recorded course.",
      helpActResearch:
        "💬 Exploring open questions: investigating how/why something works, comparing options, or debating concepts deeply (e.g., Socratic AI tutoring).",
      helpActDesign:
        "✍️ Synthesizing & structuring: writing your own notes (notebook or PC), summaries, diagrams, or planning software architecture.",
      helpActDev:
        "💻 Building & implementing: writing code, SQL queries, scripts, or developing project/assignment features.",
      helpActPractice:
        "🧪 Practicing or unblocking: solving hands-on exercises, labs, or debugging errors until finding and fixing the root cause.",
      helpActReview:
        "🔁 Consolidating memory: reviewing past notes, flashcards, explaining a topic from memory, or taking mock exams.",
      helpGoalYes:
        "Solid block progress (+10% XP): you finished the goal or made steady progress on a long multi-session task.",
      helpGoalPartial:
        "Progress with hurdles (+5% XP): you moved forward, but slower than expected due to doubts or partial distractions.",
      helpGoalNo:
        "Blocked or no progress (0% bonus): stuck on an error, total distraction, or interruption (blocker alert).",
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
      chart3Title: "🧠 Habit Patterns: 8 Activities & Cognitive Balance",
      chart3Hint: "Behavior by task type and fatigue",
      chart3Subtitle:
        "Minutes and average assimilation across the 8 activity types and balance between prep/theory and practice/production.",
      balanceConsumeLabel: "📖 Prep / Class / Theory: {min} min ({pct}%)",
      balanceProduceLabel: "💻 Notes / Code / Practice: {min} min ({pct}%)",
      habitMatrixTitle: "🔋 Prior Energy & Complexity Impact",
      habitMatrixSubtitle:
        "Compare how your average retention changes based on starting energy and challenge level.",
      habitByEnergyTitle: "By Starting Energy",
      habitByComplexityTitle: "By Topic Complexity",
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

      // Guía de Referencia inferior
      guideMainTitle: "📖 System Reference Guide & Scales",
      guideMainSubtitle:
        "Built-in documentation to evaluate the cognitive impact of each block and how metrics are calculated in JavaScript and CSV.",
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
      guideCard2Title: "🧠 Context & 8 Activity Types",
      guideCard2Li1:
        "<strong>Context:</strong> <code>🎓 Academic</code>, <code>🏅 Certification</code>, <code>🚀 Own Project</code>, <code>🤝 External</code>.",
      guideCard2Li2:
        "<strong>Activities:</strong> <code>🗂️ Prep / Context</code>, <code>👨‍🏫 Class / Lecture</code>, <code>📖 Theory / Docs</code>, <code>💬 Research / Dialogue</code>, <code>✍️ Design / Notes</code>, <code>💻 Dev / Code</code>, <code>🧪 Practice / Debugging</code>, <code>🔁 Review / Mock Exam</code>.",
      guideCard2Li3:
        "<strong>Prior Energy:</strong> <code>🔋 High</code>, <code>⚡ Medium</code>, <code>🪫 Low</code>.",
      guideCard2Li4:
        "<strong>Block Progress:</strong> <code>✅ Yes (+10% XP: solid progress)</code>, <code>⚠️ Partial (+5% XP: with hurdles)</code>, <code>❌ No (0% / Blocked)</code>.",
      guideCard3Title: "🤖 AI Usage Mode (Cognitive Impact)",
      guideCard3Li1:
        "<strong>🧠 Autonomous (+5% XP):</strong> 100% on your own (0% AI).",
      guideCard3Li2:
        '<strong>💬 Dialogue / Tutoring (+5% XP):</strong> Conceptual debate, <em>"why?"</em> questions, and active reinforcement with AI.',
      guideCard3Li3:
        "<strong>🛠️ Copilot / Support (0% adj.):</strong> Targeted syntax lookup or bug unblocking while understanding the fix.",
      guideCard3Li4:
        "<strong>🤖 Mechanical / Copy-Paste (-15% XP):</strong> Direct automation to deliver quickly without reading deeply.",
      guideCard4Title: "🧮 Exponential Curve & JavaScript Formulas",
      guideCard4Li1:
        "<strong>RPG Curve (Lv. 92 = 50% of 99):</strong> <code>XP(L) = 250 * (2^((L-1)/7) - 1)</code> (Required XP doubles every 7 levels).",
      guideCard4Li2:
        "<strong>Duration (Minutes):</strong> Automatically calculated in JS from <code>Hora_Inicio</code> and <code>Hora_Fin</code> (supports midnight crossover).",
      guideCard4Li3:
        "<strong>XP with Bonuses & AI Mode:</strong> <code>ROUND(Duration * MAX(0.5, 1 + Quality*0.2 + ChallengeBonus + GoalBonus + AiModeBonus))</code>.",

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
        "Preparación / Contexto": "Preparación / Contexto",
        "Clase / Cátedra": "Clase / Cátedra",
        "Teoría / Docs": "Teoría / Docs",
        "Investigación / Diálogo": "Investigación / Diálogo",
        "Diseño / Apuntes": "Diseño / Apuntes",
        "Desarrollo / Código": "Desarrollo / Código",
        "Práctica / Debugging": "Práctica / Debugging",
        "Repaso / Simulacro": "Repaso / Simulacro"
      },
      en: {
        "Preparación / Contexto": "Prep / Context",
        "Clase / Cátedra": "Class / Lecture",
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
        Sí: "✅ Sí (Buen avance +10%)",
        Parcial: "⚠️ Parcial (Con tropiezos +5%)",
        No: "❌ No (Bloqueo)"
      },
      en: {
        Sí: "✅ Yes (Solid progress +10%)",
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
      "Preparación / Contexto": "🗂️",
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

