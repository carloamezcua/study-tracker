# 📐 Decisiones de Arquitectura e Historial de Versiones (ADRs)

> Este documento registra la **evolución conceptual y técnica** de StudyTracker, el razonamiento detrás de cada cambio mayor y el criterio con el que se define cada nueva versión del proyecto.

---

## 🧭 ¿Cómo se decide cuándo cambia una versión?

El versionado de este proyecto sigue una adaptación de **Versionado Semántico (SemVer: `MAJOR.MINOR.PATCH`)** enfocada en dos pilares: **Compatibilidad de Datos (Esquema CSV)** y **Carga Cognitiva (Modelo Mental del Usuario)**.

| Nivel | Cuándo se incrementa | Impacto en el sistema | Ejemplo en StudyTracker |
| :--- | :--- | :--- | :--- |
| **MAJOR (v1 → v2 → v3)** | **Ruptura de compatibilidad o cambio de paradigma.**<br>• Modificación de columnas canónicas en la persistencia.<br>• Reestructuración del flujo mental de captura (ej. rediseño del formulario).<br>• Eliminación o sustitución de tecnologías base (ej. descartar librerías de 850 KB). | Requiere migraciones de datos o reaprendizaje del flujo de registro. | **v2:** Migración de `.xlsx` a `.csv` + Dashboard en 4 pestañas.<br>**v3:** Reducción a 18 columnas, formulario en 2 tiempos y Dinámica Cognitiva. |
| **MINOR (vX.1 → vX.2)** | **Nueva funcionalidad compatible hacia atrás.**<br>• Nuevas vistas o gráficos que consumen los mismos datos (o columnas puente retrocompatibles).<br>• Herramientas auxiliares (temporizador, i18n, filtros, progresión infinita). | Los datos preexistentes funcionan inmediatamente sin pérdida. | **v3.1:** Lucha productiva y cálculo neto de pausas.<br>**v3.2:** Puente FSRS/DSR de 22 columnas, Deuda Cognitiva, Curva Cuadrática Infinita y 16 Rangos Profesionales. |
| **PATCH (vX.X.1)** | **Corrección de bugs, estilo o mantenimiento.**<br>• Arreglos de CSS (overflow de botones), ajustes de fórmulas matemáticas o textos. | Cero impacto en el esquema o en las reglas de negocio. | Ajuste del grid fluido responsivo para evitar desbordamiento de chips. |

---

## 📜 Línea de Tiempo y Evolución del Proyecto

```mermaid
flowchart LR
    V1["v1.0: Prototipo Excel\n(SheetJS + .xlsx)"] --> V2["v2.0: Era Analítica & CSV\n(Node.js + 20 col + 4 Tabs)"]
    V2 --> V3["v3.0–v3.1: Ergonomía Cognitiva\n(Formulario 2 Tiempos + 18 col)"]
    V3 --> V32["v3.2: Puente FSRS/DSR & Progresión Infinita\n(22 col + Deuda Cognitiva + Curva Cuadrática + 16 Rangos)"]
```

### 🟢 v1.0 — El Prototipo (Era Excel / `.xlsx`)
* **Commits clave:** `394ba27` → `9ae43c6`
* **Paradigma:** *Excel-First y Hoja de Cálculo como base de datos.*
* **Pila técnica:** HTML, CSS básico, JS con dependencia de `SheetJS` (~850 KB) para generar y leer binarios `.xlsx`.
* **Problema que resolvía:** Necesidad de registrar sesiones de estudio con cronometraje y cálculo de XP sin depender de herramientas de terceros en la nube.
* **Por qué tuvo que evolucionar:** 
  1. SheetJS hacía pesado el bundle y duplicaba la lógica: las fórmulas de duración, XP y bonos tenían que escribirse dos veces (una en JS y otra en sintaxis de celdas de Excel `=SI(...)`).
  2. Editar o corregir una sesión anterior era engorroso porque no existía un identificador único por fila.
  3. No se podía integrar fácilmente con herramientas de análisis de datos como Python, Pandas o Snowflake sin lidiar con formatos binarios propietarios.

---

### 🔵 v2.0 — La Era Analítica y CSV Local
* **Commits clave:** `5343654` → `19fa6b9`
* **Paradigma:** *CSV-First, Cero Dependencias y Analítica Multidimensional.*
* **Pila técnica:** Micro-servidor local en Node.js nativo (`server.js`), persistencia en texto plano `data/study-tracker.csv` (UTF-8 con BOM) y 4 pestañas interactivas con Chart.js.
* **Problema que resolvía:** Eliminó por completo las dependencias externas y convirtió el tracker en un centro analítico capaz de cruzar horas biológicas, retención y modo de IA.
* **Hitos de la v2:**
  - `5343654`: Migración de `.xlsx` a CSV puro RFC 4180.
  - `aa8f146`: Dashboard analítico en 4 pestañas (Evolución temporal, Mapa de calor circadiano 7×4, Cuadrante de Rendimiento IA e Inspector de temas).
  - `8c891e6` / `19fa6b9`: Expansión a 20 columnas (Tanda 2) introduciendo `Produccion_Propia` y `Dominio_Previo`.
* **Por qué tuvo que evolucionar:** 
  1. **Fatiga de Taxonomía (*Taxonomy Fatigue*):** El formulario creció hasta exigir llenar demasiados selectores al final de cada sesión.
  2. **Incompatibilidad con el estudio asistido por IA:** En sesiones reales con LLMs (ej. preparación de la mesa redonda sobre GANs), los campos `Teoría` vs. `Investigación`, y `Producción Propia` vs. `Modo IA` entraban en colisión directa.
  3. **Ambigüedad temporal:** Las franjas horarias dejaban las madrugadas (00:00 a 03:59) clasificadas artificialmente como "Noche".

---

### 🟣 v3.0 — La Era de Ergonomía Cognitiva y Flujo en 2 Tiempos
* **Commits clave:** `301a556` → `6439a89`
* **Paradigma:** *Desacoplamiento Temporal, Respaldo Continuo y Taxonomía Ortogonal.*
* **Pila técnica:** Node.js nativo + Vanilla JS modular en capas (`domain`, `services`, `state`, `ui`) + CSS Grid fluido responsivo.
* **Problema que resuelve:** Permite registrar sesiones con **cero fricción** antes de empezar y evalúa el esfuerzo mental real sin forzar etiquetas binarias obsoletas.
* **Principales innovaciones:**
  - **Formulario en 2 tiempos:** Bloque A al iniciar (con *Smart Defaults* y chips rápidos de materias) + Bloque B al terminar.
  - **Esquema de 18 columnas:** Fusión de `Produccion_Propia` y `Modo_IA` en **4 Dinámicas Cognitivas** (con *Andamiaje / Co-creación*), descarte de `Dominio_Final` e integración de `[Subtema]` en `Notas`.
  - **Prueba Objetiva de Dominio Previo:** 3 niveles comprobables con ejemplos de vida real (`🌱 Nuevo`, `🌿 En construcción`, `🌳 Consolidado`).
  - **Franjas circadianas simétricas de 6h:** `Madrugada (00-05)`, `Mañana (06-11)`, `Tarde (12-17)`, `Noche (18-23)`.
  - **Backups automáticos:** `data/backups/YYYY-MM-DD.csv` antes de cualquier escritura.

---

### 🟠 v3.2 — El Puente Analítico FSRS/DSR y Progresión Cuadrática Profesional
* **Commits clave:** `e7eed34` → `2ee1df0` + Refactor Sistema XP
* **Paradigma:** *Captura Compatible con v4.0, Auditoría de Deuda Cognitiva y Maestría Profesional Infinita.*
* **Pila técnica:** Vanilla JS + CSV de 22 columnas retrocompatible + Modelos matemáticos FSRS/DSR + Curva cuadrática sin límite de nivel.
* **Principales innovaciones:**
  - **Esquema Puente de 22 columnas:** Añade `Estructura_Practica` (`Bloqueado` / `Intercalado`), `Modo_Diseno_IA`, `Modalidad_Procesamiento_Efectiva` y `Friccion_Discriminacion_Intercalada` (condicional).
  - **Calificación FSRS (1–4) e Índice de Deuda Cognitiva en vivo:** Mide la brecha entre la intención del Tiempo 1 y la ejecución real del Tiempo 2 (`Nulo`, `Bajo`, `Moderado`, `Crítico`).
  - **Centro Analítico Avanzado (Tamara Munzner & FSRS/DSR):** Curva de Olvido a 30 días, Mapa de Consolidación DSR en burbujas, Efectividad Intercalada e Inspector Profundo (*Power BI View*) de 10 dimensiones y flujo multivariable de 5 etapas.
  - **Progresión Cuadrática Infinita y 16 Rangos Profesionales:** Sustitución de la curva exponencial OSRS (topada en nivel 99) por $\text{XP}(L) = 50 \cdot L \cdot (L - 1)$ (Nivel 2 = 100 XP) sin límite superior y con 16 rangos profesionales (`Iniciado` a `Visionario`).
  - **Guía de Referencia Exhaustiva en 8 Tarjetas:** Manual campo por campo bilingüe integrado en el Dashboard.

---

## 🏛️ Registro de Decisiones de Arquitectura (ADRs)

### ADR-001: Persistencia Local-First con Micro-Servidor Nativo y File System API
* **Fecha:** 2026-10-18 | **Estado:** Aceptado
* **Contexto:** Las soluciones en la nube o bases de datos externas añaden latencia, costos y dependencia de conexión para registrar hábitos personales.
* **Decisión:** Implementar un micro-servidor local en Node.js de ~100 líneas (`server.js`) sin librerías externas que atienda `GET /api/csv` y `PUT /api/csv`. Como respaldo sin servidor, permitir vincular un archivo local mediante la *File System Access API* del navegador.
* **Consecuencias:** Máxima velocidad, privacidad total y portabilidad de los datos en cualquier máquina sin instalación de `node_modules`.

---

### ADR-002: Sustitución de `.xlsx` (SheetJS) por CSV Canónico RFC 4180
* **Fecha:** 2026-10-20 | **Estado:** Aceptado
* **Contexto:** `SheetJS` pesaba ~850 KB y obligaba a mantener dos motores de cálculo (fórmulas de celdas de Excel y JavaScript).
* **Decisión:** Mudar la fuente de verdad a `data/study-tracker.csv` con codificación UTF-8 con BOM. Toda la matemática de duración (incluyendo cruce de medianoche), bonos, XP y curvas se calcula en `js/domain/metrics.js`.
* **Consecuencias:** Bundle ultra-ligero, compatibilidad directa con Python/Pandas/Snowflake y eliminación total de discrepancias de cálculo.

---

### ADR-003: Curva de Experiencia Exponencial RuneScape (Nv. 92 = 50% de Nv. 99)
* **Fecha:** 2026-10-20 | **Estado:** Reemplazado por ADR-011 (2026-11-01)
* **Contexto:** Las progresiones lineales hacen que subir de nivel al inicio sea aburrido y al final sea trivial o desmotivante.
* **Decisión:** Adoptar inicialmente la fórmula matemática inspirada en *Old School RuneScape*, donde el costo de XP se duplicaba cada 7 niveles:
  $$\text{XP}(L) = \text{REDONDEAR}\Big(250 \times \left(2^{(L-1)/7} - 1\right)\Big)$$
* **Consecuencias:** Permitió validar la gamificación en v1–v3.1, pero en v3.2 fue sustituida por una curva cuadrática infinita y rangos profesionales (ver **ADR-011**).

---

### ADR-004: Desacoplamiento del Formulario en 2 Tiempos y "Smart Defaults"
* **Fecha:** 2026-10-26 | **Estado:** Aceptado
* **Contexto:** Tener que responder 10 preguntas antes de estudiar genera parálisis por análisis y abandono del hábito.
* **Decisión:** Dividir el formulario en dos bloques visuales y temporales:
  1. *Punto de Partida:* Se pre-llena automáticamente al cargar la página según la hora del día y la última materia registrada. Si continúas estudiando lo mismo, solo pulsas *Iniciar*.
  2. *Evaluación del Bloque:* Solo se completa al pulsar *Terminar* para registrar la asimilación y la dinámica cognitiva real observada.
* **Consecuencias:** Reducción del tiempo de inicio de sesión a menos de 3 segundos.

---

### ADR-005: Dinámica Cognitiva Unificada (Resolución del Caso GANs)
* **Fecha:** 2026-10-26 | **Estado:** Aceptado
* **Contexto:** En el estudio asistido por IA, los campos `Produccion_Propia` (Consumo vs. Reproducción vs. Generación) y `Modo_IA` (Copiloto vs. Diálogo vs. Mecánico) se contradecían cuando el usuario dialogaba con la IA para corregir sus propios borradores.
* **Decisión:** Fusionar ambos conceptos en **4 Dinámicas Cognitivas Ortogonales**:
  - `👀 Recepción Pasiva` (0% ajuste)
  - `🤖 Delegación / Reproducción` (-15% XP si IA $\ge 50\%$)
  - `🔄 Andamiaje / Co-creación` (+5% XP)
  - `🧠 Generación Propia` (+10% XP con 0% IA / +5% consulta mínima)
* **Consecuencias:** Cero ambigüedad al estudiar con LLMs y unificación en una sola columna en el CSV.

---

### ADR-006: Prueba Objetiva de Dominio Previo y Eliminación de "Dominio Final"
* **Fecha:** 2026-10-26 | **Estado:** Aceptado
* **Contexto:** Preguntar "¿Cuánto dominas el tema al final del pomodoro?" es redundante con la Calidad de Asimilación (1 al 5) y genera frustración, pues nadie domina un concepto complejo en 25 minutos.
* **Decisión:** Eliminar `Dominio_Final` del CSV y redefinir `Dominio_Previo` mediante una prueba objetiva de 3 niveles:
  - `🌱 Nuevo`: 0 contactos previos; no sabrías por dónde empezar.
  - `🌿 En construcción`: Ya lo viste antes, pero aún requieres apuntes, docs o IA para no trabarte.
  - `🌳 Consolidado`: Autónomo; puedes explicarlo o codearlo sin manual ni IA.
* **Consecuencias:** Ahorro de una columna en el CSV y evaluación libre de juicios subjetivos.

---

### ADR-007: Franjas Horarias Circadianas Simétricas de 6 Horas
* **Fecha:** 2026-10-26 | **Estado:** Aceptado
* **Contexto:** El rango de 00:00 a 03:59 caía artificialmente en "Noche" en la v2, distorsionando el mapa de calor de ritmo biológico.
* **Decisión:** Establecer 4 franjas uniformes de 6 horas exactas:
  - `00:00–05:59` → `Madrugada`
  - `06:00–11:59` → `Mañana`
  - `12:00–17:59` → `Tarde`
  - `18:00–23:59` → `Noche`
* **Consecuencias:** Matriz circadiana limpia de 7 días × 4 franjas sin huecos ni sesgos.

---

### ADR-008: Respaldos Automáticos Diarios en Disco
* **Fecha:** 2026-10-26 | **Estado:** Aceptado
* **Contexto:** Modificar el CSV directamente mediante llamadas HTTP de sobrescritura creaba un riesgo potencial de pérdida de datos por cortes de energía o bugs.
* **Decisión:** En `server.js`, antes de ejecutar `fs.writeFileSync(CSV_PATH)`, el servidor verifica y copia automáticamente el archivo a `data/backups/YYYY-MM-DD.csv` si aún no existe un respaldo para el día en curso.
* **Consecuencias:** Seguridad de datos nivel producción con cero intervención del usuario.

---

### ADR-009: Lucha Productiva y Rediseño de Fluidez del Bloque sin Sesgo Punitivo en XP
* **Fecha:** 2026-10-26 | **Estado:** Aceptado
* **Contexto:** La escala binaria previa de objetivo cumplido (`Sí` / `Parcial` / `No`) generaba dos problemas:
  1. **Sesgo punitivo ante retos cognitivos altos:** Un estudiante que pasa 30 minutos intentando resolver una derivada o cazar un bug complejo y descarta hipótesis aprende activamente de la frustración y la experimentación, pero al no completar la meta tangible marcaba `Parcial` o `No`, perdiendo XP.
  2. **Confusión ante interrupciones externas o retiros tempranos:** Si el estudiante debía retirarse antes por un imprevisto o entregar un avance urgente pero su ritmo fue enfocado y de calidad, se sentía tentado a castigarse como `Parcial`.
* **Decisión:** 
  1. Rediseñar la escala de `Objetivo_Cumplido` en 4 estados cognitivos claros:
     - `✅ Flujo limpio (+10% XP)`: Ritmo constante y sin tropiezos graves. Válido también si el usuario debió retirarse antes por causas externas pero el ritmo dedicado fluyó enfocado.
     - `🧠 Lucha productiva (+10% XP)`: Duelo mental activo contra un bug o concepto duro; se descartaron hipótesis y se aprendió qué caminos no tomar, otorgando el mismo bono del 10% que el flujo limpio.
     - `⚠️ Con fricción (+5% XP)`: Hubo progreso pero con distracciones, cansancio, tropiezos o velocidad irregular.
     - `🔴 Parálisis / Abandono (0% bono)`: Bloqueo pasivo, dar vueltas en círculos sin probar caminos, procrastinación o sesión en blanco (conserva la XP base intacta).
  2. Ajustar el cronómetro / pomodoro para calcular la `Hora_Fin` a partir del tiempo neto activo transcurrido (`transcurridoMs`), excluyendo pausas y registrando la duración real sin distorsión.
* **Consecuencias:** Se elimina el sesgo punitivo de la gamificación, se alinea la experiencia RPG con el esfuerzo cognitivo real y la Matriz de Fricción ahora visualiza 4 niveles apilados por materia y dominio previo.

---

### ADR-010: Puente de Captura v3.2 (22 Columnas), Calificación FSRS (1–4) y Auditoría de Deuda Cognitiva
* **Fecha:** 2026-11-01 | **Estado:** Aceptado
* **Contexto:** Antes de migrar la infraestructura completa a TypeScript + SQLite (v4.0), era prioritario capturar desde ya las variables metacognitivas del modelo de memoria DSR/FSRS y auditar la brecha entre la intención inicial (Tiempo 1) y el procesamiento efectivo (Tiempo 2).
* **Decisión:**
  1. Expandir el esquema CSV de 18 a **22 columnas** retrocompatibles añadiendo `Estructura_Practica`, `Modo_Diseno_IA`, `Modalidad_Procesamiento_Efectiva` y `Friccion_Discriminacion_Intercalada` (condicional solo cuando se elige `Intercalado`).
  2. Adoptar la escala estándar **FSRS (1–4)** (`Again`, `Hard`, `Good`, `Easy`) e implementar la función determinista `calcularIndiceDeudaCognitiva` (`Nulo`, `Bajo`, `Moderado`, `Critico`).
  3. Incorporar el Centro Analítico Avanzado (Curva de Olvido Ebbinghaus/FSRS, Mapa DSR en burbujas, Efectividad Intercalada e Inspector Profundo *Power BI View* de 10 dimensiones) junto con una Guía de Referencia de 8 tarjetas.
* **Consecuencias:** Los datos capturados hoy en CSV son 100% compatibles con el esquema SQLite de la v4.0 sin pérdida de información histórica.

---

### ADR-011: Progresión Cuadrática Infinita (`50 * L * (L - 1)`) y Taxonomía de 16 Rangos Profesionales
* **Fecha:** 2026-11-01 | **Estado:** Aceptado (Reemplaza a ADR-003)
* **Contexto:** La curva exponencial previa estilo RuneScape tenía tres limitaciones prácticas:
  1. Subía demasiado rápido en el primer nivel (Nivel 2 pedía solo 26 XP) y luego se disparaba exponencialmente.
  2. Imponía un límite artificial (*Hard Cap*) en el Nivel 99.
  3. Los nombres de rango estilo fantasía/RPG resultaban poco serios para un entorno de seguimiento académico y profesional.
* **Decisión:**
  1. Eliminar cualquier tope de nivel (`NIVEL_MAXIMO`) para que el sistema de niveles sea **infinito**.
  2. Implementar la **fórmula matemática cuadrática exacta** donde el Nivel 2 exige `100 XP` y el incremento requerido crece linealmente con cada nivel ($+100, +200, +300, \dots$):
     $$\text{XP}(L) = 50 \times L \times (L - 1) \quad \Longleftrightarrow \quad L = \left\lfloor \frac{1 + \sqrt{1 + 0.08 \cdot \text{XP}}}{2} \right\rfloor$$
  3. Sustituir `TRAMOS_RANGO` por una taxonomía sobria de **16 rangos orientados a la competencia y maestría profesional**: `Iniciado` (Nv. 1), `Practicante` (Nv. 5), `Analista` (Nv. 10), `Especialista` (Nv. 15), `Metódico` (Nv. 20), `Táctico` (Nv. 25), `Estratega` (Nv. 30), `Experimentado` (Nv. 40), `Consolidado` (Nv. 50), `Referente` (Nv. 60), `Experto` (Nv. 70), `Senior` (Nv. 80), `Élite` (Nv. 100), `Maestro` (Nv. 120), `Autoridad` (Nv. 150) y `Visionario` (Nv. 200+).
* **Consecuencias:** Progresión predecible, desafiante y sin techo, con cálculo $O(1)$ mediante despeje cuadrático directo y una identidad visual profesional.
