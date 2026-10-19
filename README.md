# ⚔️ StudyTracker — Local-First Analytics & Excel Sync

Aplicación web **Local-First** gamificada (estilo RPG) con **micro-servidor local en Node.js** para registrar, editar y eliminar bloques de estudio, evaluar hábitos cognitivos y sincronizar los datos en tiempo real directamente sobre un archivo Excel local (`data/study-tracker.xlsx`) con fórmulas nativas autocalculables.

---

## ✨ Características Principales

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

---

## 🏗️ Arquitectura del Proyecto

```mermaid
flowchart TD
    subgraph UI["Capa de Presentación (Frontend)"]
        HTML["index.html"]
        CSS["css/styles.css"]
        I18N["js/ui/i18n.js\n(Diccionario Bilingüe ES / EN)"]
        TIMER["js/ui/timer.js\n(Cronómetro + Pomodoro)"]
        DASH["js/ui/dashboard.js\n(Filtro por Contexto, CRUD UI y KPIs)"]
        CHARTS["js/ui/charts.js\n(3 Instancias Chart.js)"]
    end

    subgraph Controller["Controlador Principal"]
        APP["js/app.js\n(Orquestador y Eventos)"]
    end

    subgraph State["Capa de Estado"]
        STORE["js/state/store.js\n(StudyStore Pub/Sub + CRUD)"]
        LS[("LocalStorage")]
    end

    subgraph Domain["Capa de Dominio"]
        METRICS["js/domain/metrics.js\n(Curva Exponencial Nv.1-99, Modos IA y Hábitos)"]
    end

    subgraph Sync["Capa de Sincronización y Backend Local"]
        SYNC["js/services/excel-sync.js\n(SheetJS 18 cols + Cliente API)"]
        SERVER["server.js\n(Node.js HTTP + FS nativo)"]
        XLSX[("data/study-tracker.xlsx\n(Ignorado en Git)")]
    end

    HTML --> APP
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

---

## 🧮 Estructura de 18 Columnas y Fórmulas en Excel (`data/study-tracker.xlsx`)

El archivo Excel generado contiene dos hojas (`Registro_Estudio` y `Guia_y_Resumen`) con las siguientes columnas:

`A: Fecha` · `B: Dia_Semana` · `C: Hora_Inicio` · `D: Hora_Fin` · `E: Franja_Horaria` · `F: Contexto` · `G: Materia` · `H: Tema` · `I: Tipo_Actividad` · `J: Energia_Previa` · `K: Complejidad` · `L: Objetivo_Cumplido` · `M: Duracion_Minutos` · `N: Calidad` · `O: Modo_IA` · `P: Uso_IA_Porcentaje` · `Q: XP_Ganados` · `R: Notas`

| Métrica | Regla / Fórmula en la App | Fórmula Inyectada en Excel (`.xlsx`) |
| :--- | :--- | :--- |
| **Duración (min)** | Diferencia entre `Hora_Fin` y `Hora_Inicio` (soporta cruce de medianoche sumando `1440` min). | `=IF(OR(C2="",D2=""),"",MOD(TIMEVALUE(D2)-TIMEVALUE(C2),1)*1440)` |
| **XP Ganados** | $\text{REDONDEAR}\Big(\text{Duración} \times \max(0.5,\ 1 + \text{Calidad}\times 0.2 + \text{BonoReto} + \text{BonoMeta} + \text{BonoModoIA})\Big)$ | `=IF(M2="","",ROUND(M2*MAX(0.5,1+(N2*0.2)+IF(K2="Muy difícil",0.2,IF(K2="Desafiante",0.1,0))+IF(L2="Sí",0.1,IF(L2="Parcial",0.05,0))+IF(OR(O2="Autónomo",O2="Diálogo / Tutoría"),0.05,IF(O2="Mecánico / Copy-Paste",-0.15,0))),0))` |
| **Nivel Exponencial (1-99)** | $\text{XP}(L) = \text{REDONDEAR}\big(250 \times (2^{(L-1)/7} - 1)\big)$ *(Nivel 92 = 50% de 99)* | `=MIN(99,INT(1+7*(LN(1+SUM(Registro_Estudio!Q2:Q1000)/250)/LN(2))))` |
| **Tasa Objetivos (Sí)** | Porcentaje de sesiones donde `Objetivo_Cumplido = "Sí"`. | `=IFERROR(COUNTIF(Registro_Estudio!L2:L1000,"Sí")/COUNTA(Registro_Estudio!G2:G1000),0)` |
| **Bloqueos (No)** | Total de sesiones con bloqueo o sin avance (`Objetivo_Cumplido = "No"`). | `=COUNTIF(Registro_Estudio!L2:L1000,"No")` |

---

## 🚀 Cómo Iniciar el Proyecto

### Opción Recomendada: Con Sincronización Automática en Excel
No requiere instalar paquetes externos (`node_modules`), ya que `server.js` utiliza únicamente módulos nativos de Node.js:

1. Haz doble clic en **`start.bat`** (o ejecuta `npm start` / `node server.js` en la terminal).
2. Se abrirá automáticamente `http://localhost:3000`.
3. El indicador superior mostrará **`🟢 Sincronizado en vivo: data/study-tracker.xlsx`**.
4. Cada sesión que registres, edites (`✏️`) o elimines (`✖`) actualizará instantáneamente el archivo `data/study-tracker.xlsx`.
