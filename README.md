<p align="center">
  <img src="assets/icon.png" alt="StudyTracker Logo" width="128" height="128" style="border-radius: 26px;">
</p>

# ⚔️ StudyTracker v3.2 — Local-First Analytics & CSV Sync

> 🌐 **Idioma / Language:** [🇪🇸 Español](#-español) | [🇬🇧 English](#-english)  
> 📚 **Documentación / Docs:** [📐 Decisiones & Versiones](docs/DECISIONES.md) · [❓ Preguntas Guía](docs/PREGUNTAS.md) · [💡 Ideas y Roadmap](docs/IDEAS.md) · [🗺️ Ruta v4.0](docs/ruta_de_refactorizaci_n_quir_rgica_v4_0.md) · [🤖 Especificación Sistema XP](docs/agents/refactorizacion_sistema_xp.md)

---

## 🇪🇸 Español

Aplicación web **Local-First** gamificada (estilo RPG) ultra-ligera con **micro-servidor local en Node.js** (y soporte directo por navegador vía *File System Access API*) para registrar, editar y eliminar bloques de estudio sin fatiga de decisión, evaluar hábitos cognitivos y sincronizar los datos en tiempo real directamente sobre un archivo CSV local (`data/study-tracker.csv`) con **respaldos automáticos diarios** (`data/backups/YYYY-MM-DD.csv`).

### 🌉 Novedades v3.2 — Puente de Captura Compatible con v4.0 y Centro Analítico Avanzado

La v3.2 sigue siendo Vanilla JS + CSV, pero captura desde ya los datos que necesitará la v4.0 (FSRS y Deuda Cognitiva) e incorpora un **Centro Analítico Avanzado** basado en el marco de visualización **Tamara Munzner (What–Why–How)** y los modelos cognitivos **FSRS / DSR**:

- **4 columnas nuevas en el CSV (22 en total):** `Estructura_Practica`, `Modo_Diseno_IA`, `Modalidad_Procesamiento_Efectiva`, `Friccion_Discriminacion_Intercalada`.
- **Estrategia Planificada (`Tipo_Actividad`):** `Recuperacion_Activa`, `Construccion_Generativa` *(por defecto)*, `Consumo_Receptivo`, `Delegacion_Ejecutiva`. Los 6 valores históricos siguen siendo válidos.
- **Estructura de Práctica:** `Bloqueado` *(por defecto)* o `Intercalado`. Al elegir `Intercalado` aparece la **Fricción de Discriminación** (`Sin_Friccion`, `Friccion_Productiva` *(+5% XP, preseleccionada)*, `Confusion_Excesiva`); en `Bloqueado` se oculta y se guarda vacía.
- **Modo de Diseño con IA** (`Sin_IA`, `Tutor_Andamiaje`, `Co_Disenador`, `Generacion_Automatica`, `Evaluador_Socratico`): independiente de `Dinamica_Cognitiva` (la discrepancia entre ambos es intencional para auditar la brecha de intención).
- **Modalidad de Procesamiento Efectiva:** `Extraccion_Esforzada` *(por defecto)*, `Reconocimiento_Fluido`, `Copia_Pasiva`.
- **Calificación FSRS (1–4):** `1 · Again`, `2 · Hard`, `3 · Good` *(por defecto)*, `4 · Easy`. Las sesiones antiguas con calidad 5 se normalizan a 4 (mismo multiplicador de XP que antes).
- **Índice de Deuda Cognitiva en vivo (`Nulo` · `Bajo` · `Moderado` · `Critico`):** fórmula determinista a partir de `% IA`, Dinámica y Modalidad, visible como píldora en la vista previa del formulario y en el header de KPIs.
- **Formulario simplificado con Guía de Brecha de Intención:** `Contexto`, `Energía Previa` y `Complejidad` quedan ocultos con valores neutros por defecto. Incluye un acordeón de la *Regla de Oro* (auditar la brecha entre intención y realidad) y micro-helpers interactivos en cada campo.
- **Banner Superior de 5 KPIs Globales Persistentes:** Volumen de Estudio, Autonomía Cognitiva (% de Generación Propia + Andamiaje), Calidad FSRS Promedio (1–4), Fluidez/Éxito y Deuda Cognitiva Global (con píldora semántica de color e indicador del próximo rango profesional).
- **4 Pestañas Analíticas Interactivas (Tamara Munzner & FSRS/DSR):**
  1. **📈 Pestaña 1 (Progresión & Circadiano):** Evolución temporal de Horas, XP y Calidad (Día / Semana / Mes), constancia de estudio (racha activa, mejor racha, días activos, día top de la semana) y Mapa de Calor Circadiano 7×4 (Día × Franja de 6h) con ventana dorada de foco y desglose hora por hora.
  2. **🧠 Pestaña 2 (Salud Cognitiva & IA):** Strip de KPIs (Apalancamiento IA, Extracción Esforzada vs. Copia/Reconocimiento, Brecha de Intención), Gráfico de Anillo (*Doughnut*) de Deuda Cognitiva, Gráfico de Barras Apiladas de Modo Diseño IA × Modalidad Efectiva, Cuadrante de Rendimiento Cognitivo (Bubble plot % IA vs. Asimilación) e Impacto por Materia.
  3. **📉 Pestaña 3 (FSRS, DSR & Hábitos):** Strip de KPIs (Distribución de grados FSRS 1–4, Retención Estimada $R$, Estabilidad $S$, y tasa de Intercalación con Fricción Productiva), Curva Teórica del Olvido Ebbinghaus/FSRS proyectada a 30 días con línea del 90% de umbral crítico, Mapa de Consolidación DSR (Burbujas: Estabilidad $S$ vs. Dificultad $D$), efectividad comparativa de Práctica Intercalada vs. Bloqueada, Balance Cognitivo y Matriz de Fricción.
  4. **🔬 Pestaña 4 (Inspector & Notas — Power BI View):** Selector multidimensional de 10 variables, selector de valor (drill-down) y gráfico comparativo interactivo con click-to-filter, 4 tarjetas KPI contextuales en tiempo real, Flujo Multivariable de 5 etapas (`Dominio Previo ➔ Estrategia ➔ Dinámica ➔ Calidad FSRS ➔ Deuda`), Radiografía por Subtemas con curva de dominio y Bitácora cronológica de reflexiones.
- **Retrocompatibilidad e Inferencia Inteligente:** un CSV de 18 columnas se lee sin pérdida e infiere automáticamente los modos de IA y modalidades para nutrir de inmediato los nuevos gráficos. Respaldo previo al puente en `data/backups/study-tracker-v3.1-pre-bridge.csv`.

### ✨ Características Principales

- **Progresión Cuadrática Infinita y 16 Rangos Profesionales (Sin límite de nivel):**
  - El Nivel 2 requiere exactamente `100 XP` y el incremento entre niveles crece linealmente sin tope artificial:
    $$\text{XP}(\text{Nivel } L) = 50 \times L \times (L - 1) \quad \Longleftrightarrow \quad L = \left\lfloor \frac{1 + \sqrt{1 + 0.08 \cdot \text{XP}}}{2} \right\rfloor$$
  - **Taxonomía de 16 Rangos Profesionales:** `Iniciado` (Nv. 1) · `Practicante` (Nv. 5) · `Analista` (Nv. 10) · `Especialista` (Nv. 15) · `Metódico` (Nv. 20) · `Táctico` (Nv. 25) · `Estratega` (Nv. 30) · `Experimentado` (Nv. 40) · `Consolidado` (Nv. 50) · `Referente` (Nv. 60) · `Experto` (Nv. 70) · `Senior` (Nv. 80) · `Élite` (Nv. 100) · `Maestro` (Nv. 120) · `Autoridad` (Nv. 150) · `Visionario` (Nv. 200+).
  - **Guía de Referencia Exhaustiva de 8 Tarjetas:** Manual campo por campo integrado al pie del Dashboard con criterios prácticos y reglas anti-confusión para Tiempo 1, Tiempo 2, FSRS y fórmulas.
- **Formulario en 2 Etapas Cognitivas + Pre-llenado Inteligente (*Smart Defaults*):**
  - **🎯 Etapa 1: Punto de Partida (Al Iniciar):** Pre-llena automáticamente la última materia, estrategia habitual y estructura de práctica. Incluye **Chips Rápidos de Materias Recientes** (1 clic para elegir materia o `[+ Nueva]`).
  - **🏁 Etapa 2: Evaluación del Bloque (Al Terminar):** Evalúa la Dinámica Cognitiva, el `% IA`, la Fluidez del bloque, la Calificación FSRS (1–4), la Modalidad de Procesamiento y las Notas con `[Subtema]`.
- **Taxonomía Ortogonal v3 (`4 Contextos` × `6 Actividades` × `4 Dinámicas Cognitivas` × `3 Niveles de Dominio Previo`):**
  - **Contexto / Propósito (4 chips):**
    - `🎓 Académico`: Materias universitarias/escolares, tareas y exámenes de carrera.
    - `🏅 Certificación`: Certificaciones profesionales (ej. *Snowflake*) y cursos técnicos estructurados.
    - `🚀 Proyecto Propio`: Desarrollo de software personal, portafolio o proyectos en pareja.
    - `🤝 Externo`: Proyectos de amigos/terceros (ej. *Ruby on Rails*), incluyendo el estudio requerido para ellos.
  - **La Prueba Objetiva de Dominio Previo (`Dominio_Previo` — Cero dudas):**
    - `🌱 Nuevo` *(0 contactos previos)*: Nunca has estudiado este concepto/herramienta específica. Si te pidieran explicarlo o escribir código ahorita mismo, no sabrías por dónde empezar.
    - `🌿 En construcción` *(Necesitas apoyo/consulta)*: Ya lo viste antes (en clase, ayer o en el Pomodoro pasado), pero todavía necesitas mirar tus apuntes, la documentación o apoyarte en la IA para avanzar sin trabarte.
    - `🌳 Consolidado` *(Autónomo)*: Puedes explicarlo, resolver problemas o programar sobre esto sin mirar el manual ni depender de la IA, o solo estás haciendo un bloque de repaso/mantenimiento veloz.
  - **Dinámica Cognitiva Unificada (`Dinamica_Cognitiva` — ¿Cómo trabajaste y qué rol jugó la IA?):**
    - `👀 Recepción Pasiva (0% ajuste XP)`: Leer, escuchar clase o ver un video sin producir ni debatir activamente aún.
    - `🤖 Delegación / Reproducción (-15% XP si IA ≥50%)`: La IA o la fuente hizo el trabajo pesado y tú solo copiaste, transcribiste o seguiste pasos sin construirlo desde tu mente.
    - `🔄 Andamiaje / Co-creación (+5% XP)`: Pensaste con apoyo; usaste la IA como tutor socrático (debatiendo el *"¿por qué?"*), copiloto de sintaxis o estructurador de tus propias ideas.
    - `🧠 Generación Propia (+10% XP con 0% IA · +5% con consulta mínima)`: El esfuerzo mental pesado salió de tu cabeza (redactar con tus palabras, resolver o programar con tu propia lógica).
  - **Tipo de Actividad (6 chips ortogonales con ayuda dinámica en vivo):**

| Actividad | ¿Qué significa y cuándo usarla? | ¿Cómo no confundirla con otras? |
| :--- | :--- | :--- |
| **`👨‍🏫 Clase / Cátedra`** | **En vivo con un profesor o ponente:** asistir a una clase escolar, cátedra universitaria o taller guiado. Evalúa tu **concentración, interés y retención**. | Aquí el ritmo lo lleva un **profesor en vivo**. Si estudias por tu cuenta a tu ritmo, usa `📖 Estudio Teórico / Conceptual`. |
| **`📖 Estudio Teórico / Conceptual`** | **Comprender el *qué* o el *porqué*:** leer documentación oficial (ej. *Snowflake Docs*), libros, papers, ver videocursos grabados o debatir conceptos teóricos con IA. | Se enfoca en **comprender conceptos o investigar teoría** antes de pasar a redactar apuntes propios (`✍️ Síntesis`) o programar (`💻 Desarrollo`). |
| **`✍️ Síntesis / Documentación`** | **Traducir y estructurar en un artefacto propio:** redactar apuntes o *cheatsheets* (en cuaderno o PC), resúmenes, mapas mentales o diagramas de arquitectura. | Mientras que en `📖 Estudio Teórico` consumes/exploras conceptos, aquí **produces síntesis o diseño tangible** sin escribir código todavía. |
| **`💻 Desarrollo / Código`** | **Construir e implementar:** escribir código nuevo, consultas SQL, scripts o desarrollar funcionalidades de un proyecto o entregable. | Es **creación de software/entregables**. Si estás cazando un error o resolviendo ejercicios aislados, usa `🧪 Práctica / Debugging`. |
| **`🧪 Práctica / Debugging`** | **Ejercitar o destrabar errores:** hacer laboratorios prácticos, ejercicios tipo kata/algoritmos o depurar (*debugging*) un bug hasta encontrar la causa. | Se enfoca en **entrenar destreza o arreglar fallos**, no en levantar funcionalidades nuevas desde cero (`💻 Desarrollo`). |
| **`🔁 Repaso / Simulacro`** | **Consolidar memoria sobre algo ya visto:** repasar tus propios apuntes previos, flashcards, explicar un tema sin mirar o hacer exámenes de simulacro (*mock exams*). | Solo aplica a temas que **ya estudiaste antes** y estás reforzando para no olvidarlos o para medirte antes de un examen. |

- **Franjas Horarias Circadianas Simétricas de 6 Horas:**
  - `00:00–05:59` → `Madrugada`
  - `06:00–11:59` → `Mañana`
  - `12:00–17:59` → `Tarde`
  - `18:00–23:59` → `Noche`
- **Etiquetas de Subtema en Notas (`[Subtema] Nota`):**
  - Escribe `[Subtema]` al inicio de tus notas (ej. `[Mesa Redonda - GANs] Debate de arquitectura`) para agrupar automáticamente tus sesiones en el **Inspector de Subtemas** sin añadir campos obligatorios extra al formulario.
- **Diseño Responsivo con Grid Fluido y Text Wrap:**
  - Los grupos de chips utilizan `grid-template-columns: repeat(auto-fit, minmax(150px, 1fr))` y ajuste de línea automático para garantizar **cero desbordamientos horizontales** en tarjetas y pantallas estrechas.
- **Sincronización en Tiempo Real con CSV (`data/study-tracker.csv`) y Respaldos Automáticos:**
  - **Modo 1 (Servidor Local `server.js`):** Cada alta, edición (`✏️`) o eliminación (`✖`) actualiza directamente `data/study-tracker.csv` (`UTF-8 con BOM`) y crea un respaldo diario automático en `data/backups/YYYY-MM-DD.csv` antes de sobrescribir.
  - **Modo 2 (100% Navegador sin servidor):** Puedes vincular cualquier `.csv` local usando la *File System Access API* del navegador.
  - Migración automática transparente si cargas un archivo CSV antiguo de 18 o 20 columnas al nuevo esquema canónico de 22 columnas (v3.2).

### 🏗️ Arquitectura del Proyecto (v3.2)

```mermaid
flowchart TD
    subgraph UI["Capa de Presentación / Frontend Layer"]
        HTML["index.html\n(2-Stage Form, 4 Tabs & Power BI View)"]
        CSS["css/styles.css\n(Fluid Grid & Responsive Chips)"]
        I18N["js/ui/i18n.js\n(Bilingual ES / EN Engine)"]
        TIMER["js/ui/timer.js\n(Stopwatch + Pomodoro)"]
        DASH["js/ui/dashboard.js\n(Smart Defaults, 5 Global KPIs & Tab Views)"]
        CHARTS["js/ui/charts.js\n(FSRS, DSR, Debt, Quadrant, Heatmap & Inspector)"]
    end

    subgraph Controller["Controlador Principal / Main Controller"]
        APP["js/app.js\n(Orchestrator & Form Events)"]
    end

    subgraph State["Capa de Estado / State Layer"]
        STORE["js/state/store.js\n(22-col Normalizer & Pub/Sub)"]
        LS[("LocalStorage")]
    end

    subgraph Domain["Capa de Dominio / Domain Layer"]
        METRICS["js/domain/metrics.js\n(Infinite Quadratic Curve, 16 Ranks, DSR, FSRS & Analytics)"]
    end

    subgraph Sync["Sincronización CSV & Respaldos"]
        SYNC["js/services/excel-sync.js\n(22-col RFC 4180 CSV + Backward-compatible 18-col Parser)"]
        SERVER["server.js\n(Node.js HTTP + Native FS + Daily Backups)"]
        CSV[("data/study-tracker.csv\n(UTF-8 BOM, Git-ignored)")]
        BACKUPS[("data/backups/YYYY-MM-DD.csv\n(Automatic Daily Backups)")]
    end

    HTML --> APP
    APP --> I18N
    APP --> TIMER
    TIMER --> DASH
    APP --> STORE
    STORE --> LS
    STORE --> APP
    APP --> DASH
    DASH --> CHARTS
    APP --> SYNC
    SYNC <--> SERVER
    SERVER <--> CSV
    SERVER --> BACKUPS
    STORE --> METRICS
    DASH --> METRICS
    CHARTS --> METRICS
    SYNC --> METRICS
```

### 🧮 Esquema de 22 Columnas en CSV (`data/study-tracker.csv`) y Fórmulas en JavaScript

El archivo `data/study-tracker.csv` se guarda en texto plano `UTF-8 con BOM` (estándar RFC 4180) con las siguientes **22 columnas** (las 18 originales + 4 del Puente v3.2):

`Fecha,Dia_Semana,Hora_Inicio,Hora_Fin,Franja_Horaria,Contexto,Materia,Tipo_Actividad,Dinamica_Cognitiva,Uso_IA_Porcentaje,Dominio_Previo,Energia_Previa,Complejidad,Objetivo_Cumplido,Duracion_Minutos,Calidad,XP_Ganados,Notas,Estructura_Practica,Modo_Diseno_IA,Modalidad_Procesamiento_Efectiva,Friccion_Discriminacion_Intercalada`

| Métrica | Regla / Fórmula en JavaScript (`js/domain/metrics.js`) |
| :--- | :--- |
| **Duración (min)** | Diferencia entre `Hora_Fin` y `Hora_Inicio` (soporta cruce de medianoche sumando `1440` min). En cronómetro/pomodoro se calcula a partir del tiempo neto activo transcurrido (excluyendo pausas). |
| **XP Ganados** | $\text{REDONDEAR}\Big(\text{Duración} \times \max(0.5,\ 1 + \text{Calidad}\times 0.25 + \text{BonoReto} + \text{BonoFluidez} + \text{BonoDinamica} + \text{BonoFricción})\Big)$ con `Calidad` FSRS 1–4 (el 5 histórico se limita a 4) y `BonoFricción = +0.05` si `Friccion_Productiva` |
| **Deuda Cognitiva** | `Critico` si Dinámica de delegación o (`IA ≥ 75%` y `Copia_Pasiva`) · `Moderado` si `IA ≥ 50%` y (`Reconocimiento_Fluido` o `Copia_Pasiva`) · `Nulo` si `Generación Propia` y `IA ≤ 10%` · `Bajo` en otro caso |
| **Nivel Cuadrático Infinito** | $\text{XP}(L) = 50 \cdot L \cdot (L - 1)$ y $L = \lfloor (1 + \sqrt{1 + 0.08 \cdot \text{XP}}) / 2 \rfloor$ *(Nv. 2 = 100 XP · 16 rangos profesionales sin tope)* |
| **Franja Horaria** | `00:00–05:59 Madrugada` · `06:00–11:59 Mañana` · `12:00–17:59 Tarde` · `18:00–23:59 Noche` |
| **Fluidez del Bloque** | `Flujo limpio (+10%)` · `Lucha productiva (+10%)` · `Con fricción (+5%)` · `Parálisis / Abandono (0% bono)` |
| **Bono Dinámica** | `Generación Propia (+10%)` · `Andamiaje (+5%)` · `Recepción Pasiva (0%)` · `Delegación (-15% si IA ≥ 50%)` |

### 🚀 Cómo Iniciar el Proyecto

No requiere instalar paquetes externos (`node_modules`), ya que tanto el frontend como `server.js` usan código nativo:

1. Haz doble clic en **`start.bat`** (o ejecuta `npm start` / `node server.js` en la terminal).
2. Se abrirá automáticamente `http://localhost:3000`.
3. El indicador superior mostrará **`🟢 Sincronizado en vivo: data/study-tracker.csv`**.
4. Cada sesión que registres, edites (`✏️`) o elimines (`✖`) actualizará instantáneamente el archivo `data/study-tracker.csv` y generará un respaldo diario en `data/backups/`.

---

## 🇬🇧 English

An ultra-lightweight gamified **Local-First** web application (RPG-style) powered by a **zero-dependency Node.js micro-server** (plus direct browser *File System Access API* support) to log, edit, and delete study blocks without decision fatigue, evaluate cognitive habits, and sync your data in real time directly onto a local CSV file (`data/study-tracker.csv`) with **automatic daily backups** (`data/backups/YYYY-MM-DD.csv`).

### 🌉 What's New in v3.2 — v4.0-Compatible Capture Bridge & Advanced Analytics Dashboard

v3.2 remains Vanilla JS + CSV, but already captures the data v4.0 (FSRS & Cognitive Debt) will need, and introduces an **Advanced Analytics Dashboard** powered by the **Tamara Munzner (What–Why–How)** visualization framework and **FSRS / DSR** cognitive models:

- **4 new CSV columns (22 total):** `Estructura_Practica`, `Modo_Diseno_IA`, `Modalidad_Procesamiento_Efectiva`, `Friccion_Discriminacion_Intercalada`.
- **Planned Strategy (`Tipo_Actividad`):** `Recuperacion_Activa`, `Construccion_Generativa` *(default)*, `Consumo_Receptivo`, `Delegacion_Ejecutiva`. The 6 legacy values remain valid.
- **Practice Structure:** `Bloqueado` (blocked, *default*) or `Intercalado` (interleaved). Choosing interleaved reveals **Discrimination Friction** (`Sin_Friccion`, `Friccion_Productiva` *(+5% XP, preselected)*, `Confusion_Excesiva`); when blocked it is hidden and stored empty.
- **AI Design Mode** (`Sin_IA`, `Tutor_Andamiaje`, `Co_Disenador`, `Generacion_Automatica`, `Evaluador_Socratico`): independent from `Dinamica_Cognitiva` (any mismatch is intentional for intention gap auditing).
- **Effective Processing Modality:** `Extraccion_Esforzada` *(default)*, `Reconocimiento_Fluido`, `Copia_Pasiva`.
- **FSRS Grade (1–4):** `1 · Again`, `2 · Hard`, `3 · Good` *(default)*, `4 · Easy`. Legacy sessions with quality 5 are normalized to 4 (same XP multiplier as before).
- **Live Cognitive Debt Index (`Nulo` · `Bajo` · `Moderado` · `Critico`):** deterministic formula from `% AI`, Dynamic, and Modality, visible as a pill in the XP preview and top KPI banner.
- **Simplified Form with Intention Gap Guidance:** `Contexto`, `Energia Previa`, and `Complejidad` are hidden with neutral defaults. Includes a *Golden Rule* accordion (auditing intention vs. reality gap) and interactive micro-helpers on each field.
- **Persistent Top Banner with 5 Global Macro KPIs:** Study Volume, Cognitive Autonomy (% Own Generation + Scaffolding), Avg FSRS Quality (1–4), Fluency/Success, and Global Cognitive Debt (with semantic color pill and next professional rank milestone badge).
- **4 Dedicated Interactive Analytics Tabs (Tamara Munzner & FSRS/DSR Framework):**
  1. **📈 Tab 1 (Progression & Circadian):** Time evolution of Hours, XP, and Quality (Day / Week / Month), study consistency metrics (active streak, best streak, active days, top weekday), and 7×4 Circadian Heatmap (Day × 6h Slot) with golden focus window and collapsible hour-by-hour breakdown.
  2. **🧠 Tab 2 (Cognitive Health & AI):** KPI strip (AI leverage, Effortful Extraction vs. Passive Copy/Recognition, Intention Gap), Doughnut Chart for Cognitive Debt Index distribution, Stacked Bar Chart for AI Design Mode × Effective Modality, Cognitive Performance Quadrant (Bubble plot % AI vs. Quality), and Subject Learning Impact.
  3. **📉 Tab 3 (FSRS, DSR & Habits):** KPI strip (FSRS grade distribution 1–4, Estimated Retention $R$, Stability $S$, and Interleaved Practice rate with Productive Friction), 30-day Ebbinghaus/FSRS Forgetting Curve with 90% critical review threshold line, DSR Consolidation Bubble Map (Stability $S$ vs. Difficulty $D$), comparative effectiveness of Blocked vs. Interleaved practice, Cognitive Balance, and Friction Matrix.
  4. **🔬 Tab 4 (Inspector & Notes — Power BI View):** Multidimensional selector with 10 variables, value selector (drill-down) with click-to-filter bar chart, 4 real-time contextual KPI cards, 5-Stage Multivariable Flow (`Prior Mastery ➔ Strategy ➔ Dynamic ➔ FSRS Quality ➔ Debt`), Subtopic Breakdown with mastery curves, and chronological reflection notes log.
- **Backward Compatibility & Smart Inference:** an 18-column CSV loads losslessly and intelligently infers AI modes and modalities to immediately populate all new visual charts. Pre-bridge backup saved at `data/backups/study-tracker-v3.1-pre-bridge.csv`.

### ✨ Key Features

- **Infinite Quadratic Level Progression & 16 Professional Ranks (Uncapped):**
  - Level 2 requires exactly `100 XP` and the distance between levels grows linearly with no artificial level cap:
    $$\text{XP}(\text{Level } L) = 50 \times L \times (L - 1) \quad \Longleftrightarrow \quad L = \left\lfloor \frac{1 + \sqrt{1 + 0.08 \cdot \text{XP}}}{2} \right\rfloor$$
  - **16 Professional Mastery Ranks:** `Initiate` (`Iniciado`, Lv. 1) · `Practitioner` (Lv. 5) · `Analyst` (Lv. 10) · `Specialist` (Lv. 15) · `Methodical` (Lv. 20) · `Tactician` (Lv. 25) · `Strategist` (Lv. 30) · `Experienced` (Lv. 40) · `Consolidated` (Lv. 50) · `Benchmark` (Lv. 60) · `Expert` (Lv. 70) · `Senior` (Lv. 80) · `Elite` (Lv. 100) · `Master` (Lv. 120) · `Authority` (Lv. 150) · `Visionary` (`Visionario`, Lv. 200+).
  - **Built-in 8-Card Field-by-Field Reference Manual:** Exhaustive reference guide at the bottom of the Dashboard covering practical criteria and anti-confusion rules for Stage 1, Stage 2, FSRS, and math formulas.
- **2-Stage Cognitive Form + Smart Defaults:**
  - **🎯 Stage 1: Starting Point (At Start):** Auto-prefills your latest subject, planned strategy, and practice structure for the current time slot. Includes **Recent Subject Quick-Chips** (1 click to pick a subject or `[+ New]`).
  - **🏁 Stage 2: Block Evaluation (At End):** Rate the Cognitive Dynamic, `% AI`, Block Fluency, FSRS Rating (1–4), Processing Modality, and Notes with `[Subtopic]`.
- **v3 Orthogonal Taxonomy (`4 Contexts` × `6 Activities` × `4 Cognitive Dynamics` × `3 Objective Prior Mastery Levels`):**
  - **The Objective Prior Mastery Test (`Dominio_Previo`):**
    - `🌱 New` (`Nuevo` — *0 prior contacts*): You have never studied this specific concept/tool. If asked to explain it or write code right now, you wouldn't know where to start.
    - `🌿 In progress` (`En construcción` — *Needs support/lookup*): You saw it before (in class, yesterday, or last Pomodoro), but still need notes, docs, or AI to progress without getting stuck.
    - `🌳 Consolidated` (`Consolidado` — *Autonomous*): You can explain it, solve problems, or code without looking at the manual or relying on AI, or you are doing a fast review/maintenance block.
  - **Unified Cognitive Dynamic (`Dinamica_Cognitiva` — How did you work & what role did AI play?):**
    - `👀 Passive Reception` (`Recepción Pasiva` — `0% XP adj.`): Reading, listening to a lecture, or watching a video without actively producing or debating yet.
    - `🤖 Delegation / Reproduction` (`Delegación / Reproducción` — `-15% XP if AI ≥50%`): AI or the source did the heavy lifting and you copied, transcribed, or followed steps mechanically.
    - `🔄 Scaffolding / Co-creation` (`Andamiaje / Co-creación` — `+5% XP`): You thought with support; used AI as a Socratic tutor, syntax copilot, or structurer of your own ideas.
    - `🧠 Own Generation` (`Generación Propia` — `+10% XP at 0% AI · +5% with minor lookup`): The heavy mental effort came from your own head.
  - **6 Clean Activity Types (`Tipo_Actividad`):**
    - `👨‍🏫 Class / Lecture` (`Clase / Cátedra`)
    - `📖 Theoretical / Conceptual Study` (`Estudio Teórico / Conceptual`)
    - `✍️ Synthesis / Documentation` (`Síntesis / Documentación`)
    - `💻 Dev / Code` (`Desarrollo / Código`)
    - `🧪 Practice / Debug` (`Práctica / Debugging`)
    - `🔁 Review / Mock` (`Repaso / Simulacro`)
- **6-Hour Circadian Time Slots:**
  - `00:00–05:59` → `Early Morning` (`Madrugada`)
  - `06:00–11:59` → `Morning` (`Mañana`)
  - `12:00–17:59` → `Afternoon` (`Tarde`)
  - `18:00–23:59` → `Night` (`Noche`)
- **Fluid Grid & Text Wrap (Zero Horizontal Overflow):**
  - Chip groups use `repeat(auto-fit, minmax(150px, 1fr))` with natural wrapping to fit cards cleanly across all screen sizes.

### 🧮 22-Column CSV Schema (`data/study-tracker.csv`) & JavaScript Formulas

The generated `data/study-tracker.csv` file is stored in plain-text `UTF-8 with BOM` (RFC 4180 standard) with the following **22 columns** (the original 18 + 4 from the v3.2 Bridge):

`Fecha,Dia_Semana,Hora_Inicio,Hora_Fin,Franja_Horaria,Contexto,Materia,Tipo_Actividad,Dinamica_Cognitiva,Uso_IA_Porcentaje,Dominio_Previo,Energia_Previa,Complejidad,Objetivo_Cumplido,Duracion_Minutos,Calidad,XP_Ganados,Notas,Estructura_Practica,Modo_Diseno_IA,Modalidad_Procesamiento_Efectiva,Friccion_Discriminacion_Intercalada`

| Metric | Rule / Formula in JavaScript (`js/domain/metrics.js`) |
| :--- | :--- |
| **Duration (min)** | Difference between `Hora_Fin` and `Hora_Inicio` (supports midnight crossover by adding `1440` min). In timer/pomodoro it is computed from active net elapsed time (excluding pauses). |
| **XP Earned** | $\text{ROUND}\Big(\text{Duration} \times \max(0.5,\ 1 + \text{Quality}\times 0.25 + \text{ChallengeBonus} + \text{GoalBonus} + \text{DynamicBonus} + \text{FrictionBonus})\Big)$ with FSRS `Quality` 1–4 (legacy 5 is clamped to 4) and `FrictionBonus = +0.05` for `Friccion_Productiva` |
| **Cognitive Debt** | `Critico` if delegation Dynamic or (`AI ≥ 75%` and `Copia_Pasiva`) · `Moderado` if `AI ≥ 50%` and (`Reconocimiento_Fluido` or `Copia_Pasiva`) · `Nulo` if `Own Generation` and `AI ≤ 10%` · `Bajo` otherwise |
| **Infinite Quadratic Level** | $\text{XP}(L) = 50 \cdot L \cdot (L - 1)$ and $L = \lfloor (1 + \sqrt{1 + 0.08 \cdot \text{XP}}) / 2 \rfloor$ *(Lv. 2 = 100 XP · 16 uncapped professional ranks)* |
| **Circadian Slots** | `00:00–05:59 Early Morning` · `06:00–11:59 Morning` · `12:00–17:59 Afternoon` · `18:00–23:59 Night` |
| **Block Fluency** | `Clean flow (+10%)` · `Productive struggle (+10%)` · `With friction (+5%)` · `Paralysis / Quit (0% bonus)` |
| **Dynamic Bonus** | `Own Generation (+10%)` · `Scaffolding (+5%)` · `Passive Reception (0%)` · `Delegation (-15% if AI ≥ 50%)` |

### 🚀 Getting Started

No external `node_modules` installation is required:

1. Double-click **`start.bat`** (or run `npm start` / `node server.js` in your terminal).
2. `http://localhost:3000` will open automatically in your browser.
3. The top status pill will display **`🟢 Live synced: data/study-tracker.csv`**.
