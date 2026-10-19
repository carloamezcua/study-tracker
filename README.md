# ⚔️ StudyTracker — Local-First Analytics & Excel Sync

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) | [🇬🇧 English](#-english)

---

## 🇪🇸 Español

Aplicación web **Local-First** gamificada (estilo RPG) con **micro-servidor local en Node.js** para registrar, editar y eliminar bloques de estudio, evaluar hábitos cognitivos y sincronizar los datos en tiempo real directamente sobre un archivo Excel local (`data/study-tracker.xlsx`) con fórmulas nativas autocalculables.

### ✨ Características Principales

- **Curva Exponencial de Nivel RPG (*"Level 92 is half of 99"*):**
  - Inspirada en *Old School RuneScape*, la experiencia requerida **se duplica cada 7 niveles**:
    $$\text{XP}(\text{Nivel } L) = \text{REDONDEAR}\Big( 250 \times \left(2^{(L-1)/7} - 1\right) \Big)$$
  - Subida rápida en los primeros niveles para motivar la constancia, progresión creciente (+10.4% por nivel) y propiedad matemática exacta donde el **Nivel 92 representa el 50% del XP total hacia el Nivel 99**.
- **Taxonomía Ortogonal de 1 Clic (`4 Contextos` × `6 Actividades`):**
  - **Contexto / Propósito (4 chips):**
    - `🎓 Académico`: Materias universitarias/escolares, tareas y exámenes de carrera.
    - `🏅 Certificación`: Certificaciones profesionales (ej. *Snowflake*) y cursos técnicos estructurados.
    - `🚀 Proyecto Propio`: Desarrollo de software personal, portafolio o proyectos en pareja.
    - `🤝 Externo`: Proyectos de amigos/terceros (ej. *Ruby on Rails*), incluyendo el estudio requerido para ellos.
  - **Tipo de Actividad (6 chips universales):**
    - `📖 Teoría / Docs` · `💬 Investigación / Diálogo` · `✍️ Diseño / Apuntes` · `💻 Desarrollo / Código` · `🧪 Práctica / Debugging` · `🔁 Repaso / Simulacro`.
- **Impacto Cognitivo de IA y Calidad de Asimilación (1 al 5):**
  - Separa la **fluidez mecánica** del **aprendizaje real**: la escala 1–5 evalúa tu **Asimilación Cognitiva** (desde `1 - Mecánico / Sin retención` hasta `5 - Asimilación profunda`).
  - **Modo de Uso de IA (4 chips):**
    - `🧠 Autónomo (+5% XP)`: 100% por tu cuenta (0% IA).
    - `💬 Diálogo / Tutoría (+5% XP)`: Debate conceptual, preguntas de *"¿por qué?"* y refuerzo activo con IA.
    - `🛠️ Copiloto / Apoyo (0% ajuste)`: Consulta puntual de sintaxis o desbloqueo de bugs entendiendo la solución.
    - `🤖 Mecánico / Copy-Paste (-15% XP)`: Automatización directa para entregar rápido sin leer a fondo.
  - El Dashboard contrasta en vivo tus minutos de **Aprendizaje (Autónomo / Diálogo / Copiloto)** frente a los minutos **Mecánicos (Copy-Paste)** por materia.
- **Filtro Rápido por Contexto en el Dashboard:**
  - Barra de pestañas interactiva (`🌐 Todos`, `🎓 Académico`, `🏅 Certificación`, `🚀 Proyecto Propio`, `🤝 Externo`) que filtra al instante las tarjetas KPI, los 3 gráficos y la tabla de historial manteniendo tu nivel global de personaje en la barra superior.
- **Detector de Bloqueos y Bonos de Esfuerzo:**
  - **Complejidad:** `🟢 Fácil (+0% XP)` · `🟡 Desafiante (+10% XP)` · `🔴 Muy difícil (+20% XP)`.
  - **¿Objetivo Cumplido? (con guía dinámica en vivo):**
    - `✅ Sí (Logrado +10% XP)`: Completaste la meta planeada para el bloque.
    - `⚠️ Parcial (Avance +5% XP)`: Hubo avance real y aprendizaje, pero continuará en otra sesión.
    - `❌ No (Bloqueo / 0% XP)`: Bloqueo técnico, distracción total o interrupción sin lograr avance (contabilizado en el indicador de bloqueos).
- **Cronómetro y Temporizador Pomodoro Integrado:**
  - **Modo Cronómetro (`⏱️`):** Cuenta progresiva con captura automática de la **Fecha**, **Hora de Inicio** al pulsar *Iniciar* y **Hora de Fin** al pulsar *Terminar* (o al guardar directamente la sesión).
  - **Modo Pomodoro (`🍅`):** Cuenta regresiva por bloques de enfoque (`25m`, `50m` o personalizado) y bloques de descanso (`5m`, `15m`) con aviso acústico vía *Web Audio API*.
  - Basado en marcas de tiempo reales (`Date.now()`) y persistencia en `localStorage` para no perder precisión en segundo plano ni al recargar la pestaña.
- **Sincronización en Tiempo Real con Excel (`data/study-tracker.xlsx`):**
  - Cada alta, edición en línea (`✏️`) o eliminación (`✖`) actualiza directamente `data/study-tracker.xlsx` en tu disco duro sin descargas repetidas.
  - La carpeta `data/` y los archivos `.xlsx` están excluidos en `.gitignore` por privacidad.
- **Interfaz Bilingüe en Tiempo Real (`ES` / `EN`):**
  - Selector rápido `ES` | `EN` en la barra superior con persistencia en `localStorage` (`study_tracker_lang`).
  - Traduce al instante toda la interfaz, el cronómetro/Pomodoro, las ayudas dinámicas, los gráficos de Chart.js y la tabla de historial, manteniendo intactos los valores canónicos en el `Store` y en `data/study-tracker.xlsx` para no romper fórmulas de Excel ni filtros.

### 🏗️ Arquitectura del Proyecto

```mermaid
flowchart TD
    subgraph UI["Capa de Presentación / Frontend Layer"]
        HTML["index.html"]
        CSS["css/styles.css"]
        I18N["js/ui/i18n.js\n(Bilingual ES / EN Engine)"]
        TIMER["js/ui/timer.js\n(Stopwatch + Pomodoro)"]
        DASH["js/ui/dashboard.js\n(Context Filter, CRUD UI & KPIs)"]
        CHARTS["js/ui/charts.js\n(3 Chart.js Instances)"]
    end

    subgraph Controller["Controlador Principal / Main Controller"]
        APP["js/app.js\n(Orchestrator & Events)"]
    end

    subgraph State["Capa de Estado / State Layer"]
        STORE["js/state/store.js\n(StudyStore Pub/Sub + CRUD)"]
        LS[("LocalStorage")]
    end

    subgraph Domain["Capa de Dominio / Domain Layer"]
        METRICS["js/domain/metrics.js\n(Lv.1-99 Curve, AI Modes & Habits)"]
    end

    subgraph Sync["Sincronización y Backend Local / Local Sync"]
        SYNC["js/services/excel-sync.js\n(SheetJS 18 cols + API Client)"]
        SERVER["server.js\n(Node.js HTTP + Native FS)"]
        XLSX[("data/study-tracker.xlsx\n(Git-ignored)")]
    end

    HTML --> APP
    APP --> I18N
    APP -->|Inicializa y sincroniza horas| TIMER
    TIMER -->|Auto-llena Fecha, Inicio y Fin| DASH
    APP -->|Crear / Editar / Borrar| STORE
    STORE -->|Respaldo rápido| LS
    STORE -->|Notifica cambios| APP
    APP -->|Renderiza y Filtra| DASH
    DASH --> CHARTS
    APP -->|Sincroniza binario .xlsx| SYNC
    SYNC <-->|GET / PUT /api/excel| SERVER
    SERVER <-->|Lectura / Escritura directa| XLSX
    STORE --> METRICS
    DASH --> METRICS
    CHARTS --> METRICS
    SYNC --> METRICS
```

### 🧮 Estructura de 18 Columnas y Fórmulas en Excel (`data/study-tracker.xlsx`)

El archivo Excel generado contiene dos hojas (`Registro_Estudio` y `Guia_y_Resumen`) con las siguientes columnas:

`A: Fecha` · `B: Dia_Semana` · `C: Hora_Inicio` · `D: Hora_Fin` · `E: Franja_Horaria` · `F: Contexto` · `G: Materia` · `H: Tema` · `I: Tipo_Actividad` · `J: Energia_Previa` · `K: Complejidad` · `L: Objetivo_Cumplido` · `M: Duracion_Minutos` · `N: Calidad` · `O: Modo_IA` · `P: Uso_IA_Porcentaje` · `Q: XP_Ganados` · `R: Notas`

| Métrica | Regla / Fórmula en la App | Fórmula Inyectada en Excel (`.xlsx`) |
| :--- | :--- | :--- |
| **Duración (min)** | Diferencia entre `Hora_Fin` y `Hora_Inicio` (soporta cruce de medianoche sumando `1440` min). | `=IF(OR(C2="",D2=""),"",MOD(TIMEVALUE(D2)-TIMEVALUE(C2),1)*1440)` |
| **XP Ganados** | $\text{REDONDEAR}\Big(\text{Duración} \times \max(0.5,\ 1 + \text{Calidad}\times 0.2 + \text{BonoReto} + \text{BonoMeta} + \text{BonoModoIA})\Big)$ | `=IF(M2="","",ROUND(M2*MAX(0.5,1+(N2*0.2)+IF(K2="Muy difícil",0.2,IF(K2="Desafiante",0.1,0))+IF(L2="Sí",0.1,IF(L2="Parcial",0.05,0))+IF(OR(O2="Autónomo",O2="Diálogo / Tutoría"),0.05,IF(O2="Mecánico / Copy-Paste",-0.15,0))),0))` |
| **Nivel Exponencial (1-99)** | $\text{XP}(L) = \text{REDONDEAR}\big(250 \times (2^{(L-1)/7} - 1)\big)$ *(Nivel 92 = 50% de 99)* | `=MIN(99,INT(1+7*(LN(1+SUM(Registro_Estudio!Q2:Q1000)/250)/LN(2))))` |
| **Tasa Objetivos (Sí)** | Porcentaje de sesiones donde `Objetivo_Cumplido = "Sí"`. | `=IFERROR(COUNTIF(Registro_Estudio!L2:L1000,"Sí")/COUNTA(Registro_Estudio!G2:G1000),0)` |
| **Bloqueos (No)** | Total de sesiones con bloqueo o sin avance (`Objetivo_Cumplido = "No"`). | `=COUNTIF(Registro_Estudio!L2:L1000,"No")` |

### 🚀 Cómo Iniciar el Proyecto

No requiere instalar paquetes externos (`node_modules`), ya que `server.js` utiliza únicamente módulos nativos de Node.js:

1. Haz doble clic en **`start.bat`** (o ejecuta `npm start` / `node server.js` en la terminal).
2. Se abrirá automáticamente `http://localhost:3000`.
3. El indicador superior mostrará **`🟢 Sincronizado en vivo: data/study-tracker.xlsx`**.
4. Cada sesión que registres, edites (`✏️`) o elimines (`✖`) actualizará instantáneamente el archivo `data/study-tracker.xlsx`.

---

## 🇬🇧 English

A gamified **Local-First** web application (RPG-style) powered by a **zero-dependency Node.js micro-server** to log, edit, and delete study blocks, evaluate cognitive habits, and sync your data in real time directly onto a local Excel workbook (`data/study-tracker.xlsx`) with native auto-calculating formulas.

### ✨ Key Features

- **Exponential RPG Level Curve (*"Level 92 is half of 99"*):**
  - Inspired by *Old School RuneScape*, required experience **doubles every 7 levels**:
    $$\text{XP}(\text{Level } L) = \text{ROUND}\Big( 250 \times \left(2^{(L-1)/7} - 1\right) \Big)$$
  - Fast early leveling to reward consistency, progressive scaling (+10.4% per level), and the exact mathematical property where **Level 92 equals 50% of the total XP required for Level 99**.
- **Orthogonal 1-Click Taxonomy (`4 Contexts` × `6 Activities`):**
  - **Context / Purpose (4 chips):**
    - `🎓 Academic` (`Académico`): University/school courses, assignments, and degree exams.
    - `🏅 Certification` (`Certificación`): Professional certifications (e.g., *Snowflake*) and structured technical courses.
    - `🚀 Own Project` (`Proyecto Propio`): Personal software engineering, portfolio, or duo projects.
    - `🤝 External` (`Externo`): Third-party or friends' projects (e.g., *Ruby on Rails*), including the research required for them.
  - **Activity Type (6 universal chips):**
    - `📖 Theory / Docs` · `💬 Research / Dialogue` · `✍️ Design / Notes` · `💻 Dev / Code` · `🧪 Practice / Debugging` · `🔁 Review / Mock Exam`.
- **Cognitive AI Impact & Learning Assimilation Scale (1 to 5):**
  - Separates **mechanical speed** from **real learning**: the 1–5 scale measures your **Cognitive Assimilation** (from `1 - Mechanical / No retention` up to `5 - Deep assimilation`).
  - **AI Interaction Mode (4 chips):**
    - `🧠 Autonomous (+5% XP)`: 100% on your own (0% AI).
    - `💬 Dialogue / Tutoring (+5% XP)`: Conceptual debate, *"why?"* questions, and active reinforcement with AI.
    - `🛠️ Copilot / Support (0% adj.)`: Targeted syntax lookup or bug unblocking while understanding the fix.
    - `🤖 Mechanical / Copy-Paste (-15% XP)`: Direct automation to deliver quickly without reading deeply.
  - The Dashboard contrasts your **Real Learning Minutes (Autonomous / Dialogue / Copilot)** against **Mechanical Minutes (Copy-Paste)** per subject.
- **Quick Context Filter Bar:**
  - Interactive tab bar (`🌐 All`, `🎓 Academic`, `🏅 Certification`, `🚀 Own Project`, `🤝 External`) that instantaneously filters KPI cards, all 3 charts, and the history table while keeping your global character level in the top banner.
- **Blocker Detector & Effort Bonuses:**
  - **Complexity:** `🟢 Easy (+0% XP)` · `🟡 Challenging (+10% XP)` · `🔴 Very Hard (+20% XP)`.
  - **Goal Achieved? (with live helper guide):**
    - `✅ Yes (Achieved +10% XP)`: Completed the planned goal for the block.
    - `⚠️ Partial (Progress +5% XP)`: Real progress and learning occurred, to be continued in another session.
    - `❌ No (Blocked / 0% XP)`: Technical blocker, total distraction, or interruption without progress (counted in the blockers metric).
- **Built-in Stopwatch & Pomodoro Timer:**
  - **Stopwatch Mode (`⏱️`):** Count-up timer that automatically captures the **Date**, **Start Time** when clicking *Start*, and **End Time** when clicking *Finish* (or when submitting the form directly).
  - **Pomodoro Mode (`🍅`):** Countdown timer with focus presets (`25m`, `50m`, or custom minutes) and break presets (`5m`, `15m`) with an acoustic chime via *Web Audio API*.
  - Driven by real wall-clock timestamps (`Date.now()`) and `localStorage` persistence so it never drifts in background tabs or across page reloads.
- **Real-Time Excel Synchronization (`data/study-tracker.xlsx`):**
  - Every new entry, inline edit (`✏️`), or deletion (`✖`) directly updates `data/study-tracker.xlsx` on disk without repeated browser downloads.
  - The `data/` folder and `.xlsx` files are excluded in `.gitignore` for privacy.
- **Real-Time Bilingual Interface (`ES` / `EN`):**
  - Quick `ES` | `EN` toggle in the top bar persisted in `localStorage` (`study_tracker_lang`).
  - Instantly translates the entire UI, stopwatch/Pomodoro, dynamic helper boxes, Chart.js labels, and history table while preserving canonical data values in the `Store` and `data/study-tracker.xlsx` so Excel formulas and filters never break.

### 🧮 18-Column Excel Schema & Native Formulas (`data/study-tracker.xlsx`)

The generated Excel workbook contains two sheets (`Registro_Estudio` and `Guia_y_Resumen`) with the following 18 columns:

`A: Fecha` · `B: Dia_Semana` · `C: Hora_Inicio` · `D: Hora_Fin` · `E: Franja_Horaria` · `F: Contexto` · `G: Materia` · `H: Tema` · `I: Tipo_Actividad` · `J: Energia_Previa` · `K: Complejidad` · `L: Objetivo_Cumplido` · `M: Duracion_Minutos` · `N: Calidad` · `O: Modo_IA` · `P: Uso_IA_Porcentaje` · `Q: XP_Ganados` · `R: Notas`

| Metric | Rule / Formula in App | Injected Excel Formula (`.xlsx`) |
| :--- | :--- | :--- |
| **Duration (min)** | Difference between `Hora_Fin` and `Hora_Inicio` (supports midnight crossover by adding `1440` min). | `=IF(OR(C2="",D2=""),"",MOD(TIMEVALUE(D2)-TIMEVALUE(C2),1)*1440)` |
| **XP Earned** | $\text{ROUND}\Big(\text{Duration} \times \max(0.5,\ 1 + \text{Quality}\times 0.2 + \text{ChallengeBonus} + \text{GoalBonus} + \text{AiModeBonus})\Big)$ | `=IF(M2="","",ROUND(M2*MAX(0.5,1+(N2*0.2)+IF(K2="Muy difícil",0.2,IF(K2="Desafiante",0.1,0))+IF(L2="Sí",0.1,IF(L2="Parcial",0.05,0))+IF(OR(O2="Autónomo",O2="Diálogo / Tutoría"),0.05,IF(O2="Mecánico / Copy-Paste",-0.15,0))),0))` |
| **Exponential Level (1-99)** | $\text{XP}(L) = \text{ROUND}\big(250 \times (2^{(L-1)/7} - 1)\big)$ *(Level 92 = 50% of 99)* | `=MIN(99,INT(1+7*(LN(1+SUM(Registro_Estudio!Q2:Q1000)/250)/LN(2))))` |
| **Goal Rate (Yes)** | Percentage of sessions where `Objetivo_Cumplido = "Sí"`. | `=IFERROR(COUNTIF(Registro_Estudio!L2:L1000,"Sí")/COUNTA(Registro_Estudio!G2:G1000),0)` |
| **Blockers (No)** | Total sessions with a blocker or no progress (`Objetivo_Cumplido = "No"`). | `=COUNTIF(Registro_Estudio!L2:L1000,"No")` |

### 🚀 Getting Started

No external `node_modules` installation is required, as `server.js` uses only built-in Node.js modules:

1. Double-click **`start.bat`** (or run `npm start` / `node server.js` in your terminal).
2. `http://localhost:3000` will open automatically in your browser.
3. The top status pill will display **`🟢 Live synced: data/study-tracker.xlsx`**.
4. Every session you log, edit (`✏️`), or delete (`✖`) will instantaneously update `data/study-tracker.xlsx`.
