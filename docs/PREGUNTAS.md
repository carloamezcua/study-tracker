# ❓ Preguntas Guía y Decisiones de Diseño

> Este archivo no es solo una lista de tareas: es para **pensar y documentar la arquitectura cognitiva**.
> Para consultar el historial de versiones (v1 → v2 → v3 → v3.2) y el registro formal de decisiones técnicas, consulta [docs/DECISIONES.md](DECISIONES.md).
> Debajo de cada pregunta se registran las respuestas (`**R:**`) y las lecciones aprendidas que se han convertido en decisiones de diseño del sistema.
> Puedes pegar una sección completa a una IA y pedirle que te **entreviste** o cuestione tus respuestas antes de hacer cambios mayores.

---

### 1. ¿Cómo evitar la fricción de tener que llenar todos los campos?

**R:** En las versiones 3.0–3.2 resolvimos la fricción aplicando el principio de **desacoplamiento cognitivo en 2 tiempos**, **condicionalidad estricta** y **cero redundancia**:

1. **División en 2 Etapas Temporales:**
   - **🎯 1. Punto de Partida (Al Iniciar):** Solo capturas tu intención inicial en menos de 3 segundos (Materia, Dominio previo objetivo, Estrategia planificada, Estructura de práctica y Modo de diseño con IA). Campos secundarios como Contexto, Energía previa y Complejidad quedan ocultos con valores neutros por defecto.
   - **🏁 2. Evaluación del Bloque (Al Terminar):** Evalúas la realidad observada al cerrar el bloque (Dinámica Cognitiva, `% IA`, Fluidez del bloque, Calificación FSRS 1–4, Modalidad de procesamiento efectiva, Fricción intercalada si aplica y Notas).
2. **Pre-llenado Inteligente (*Smart Defaults*) y Condicionalidad:**
   - El sistema recuerda tu última materia estudiada y pre-selecciona `🧱 Bloqueado` por defecto (que representa el 90% de las sesiones cotidianas).
   - El selector de `Fricción de Discriminación Intercalada` permanece oculto cuando estudias en modo `Bloqueado` y solo se despliega si eliges deliberadamente `🔀 Intercalado`.
   - El **Índice de Deuda Cognitiva** (`🟢 Nulo`, `🔵 Bajo`, `🟠 Moderado`, `🔴 Crítico`) se calcula de forma 100% determinista en segundo plano sin pedir una pregunta extra.
3. **Chips Rápidos de Materias Recientes:**
   - Barra de botones con tus últimas materias estudiadas (`[Snowflake]`, `[Rails]`, etc.) + un botón `[+ Nueva]` para cambiar de materia en 1 solo clic sin teclear en el input.
4. **Eliminación de Campos Redundantes:**
   - Se descartó `Dominio_Final`: nadie domina un tema complejo en 25 minutos; pedir calificar el dominio al inicio y al final generaba fatiga y parálisis.
   - El campo `Tema` se absorbió en `Notas` como prefijo entre corchetes (ej. `[Mesa Redonda - GANs] Notas...`), extrayéndose automáticamente para el Inspector sin obligar a llenar un input extra.

---

### 2. ¿Qué elementos de gamificación debería implementar para mantener a la audiencia atrapada?

**R:** La gamificación debe incentivar el **esfuerzo cognitivo profundo**, la **maestría profesional** y la **constancia**, nunca la trampa ni la velocidad vacía:

1. **Progresión Cuadrática Infinita y 16 Rangos Profesionales (v3.2):**
   - Sustituimos la antigua curva exponencial de fantasía (que subía demasiado rápido al principio e imponía un límite en el Nivel 99) por una **curva cuadrática infinita** donde alcanzar el Nivel 2 requiere exactamente `100 XP` y cada nivel exige un incremento linealmente mayor:
     $$\text{XP}(\text{Nivel } L) = 50 \times L \times (L - 1) \quad \Longleftrightarrow \quad L = \left\lfloor \frac{1 + \sqrt{1 + 0.08 \cdot \text{XP}}}{2} \right\rfloor$$
   - Acompañada de **16 Rangos de Competencia Profesional** sin techo: `Iniciado` (Nv. 1), `Practicante` (Nv. 5), `Analista` (Nv. 10), `Especialista` (Nv. 15), `Metódico` (Nv. 20), `Táctico` (Nv. 25), `Estratega` (Nv. 30), `Experimentado` (Nv. 40), `Consolidado` (Nv. 50), `Referente` (Nv. 60), `Experto` (Nv. 70), `Senior` (Nv. 80), `Élite` (Nv. 100), `Maestro` (Nv. 120), `Autoridad` (Nv. 150) y `Visionario` (Nv. 200+).
2. **Incentivos a la Autonomía Cognitiva y Lucha Productiva:**
   - La fórmula premia con bonos multiplicadores el estudio autónomo (`+10% XP` a `🧠 Generación Propia` con 0% IA), el `🔄 Andamiaje / Co-creación` (`+5% XP`), la `🧠 Lucha productiva` (`+10% XP`, igual que `✅ Flujo limpio` para eliminar el sesgo punitivo) y la `🧠 Fricción Productiva` en práctica intercalada (`+5% XP`), mientras penaliza la delegación mecánica (`-15% XP` si delegas $\ge 50\%$ a la IA).
3. **Próximos pasos a explorar (ver [IDEAS.md](IDEAS.md)):**
   - *Combos Pomodoro:* Bono de XP al encadenar 2 o más pomodoros seguidos con descanso reglamentario.
   - *Rachas de Foco Diario:* Medallas por mantener días activos consecutivos (hoy visible como estadística en la Pestaña 1).
   - *Avatar Virtual / Tienda de XP:* Un compañero virtual estilo Tamagotchi que se desbloquea o sube de nivel con cosméticos comprados con el XP acumulado.

---

### 3. ¿Cómo podría automatizar el proceso de ingesta de datos? ¿"monitoreando" la actividad del usuario para rellenar?

**R:** El equilibrio ideal es **automatizar la fricción temporal pero preservar la reflexión cognitiva humana**:

1. **Lo que SÍ se automatiza:**
   - El **Cronómetro / Pomodoro integrado** captura la fecha, la hora exacta de inicio al pulsar *Iniciar*, la hora de fin proyectada a partir del tiempo neto activo (`transcurridoMs`, descontando pausas) al pulsar *Terminar*, calcula los minutos (con soporte para cruce de medianoche) y asigna la franja horaria biológica.
2. **Lo que NO debe automatizarse al 100%:**
   - La calificación de la *Dinámica Cognitiva*, la *Modalidad de Procesamiento*, la *Fluidez* y el *Grado FSRS (1–4)*: el acto de auditar tu propio esfuerzo y tu brecha de intención al terminar un bloque (10 segundos) es un **ejercicio metacognitivo** insustituible para consolidar lo aprendido.
3. **Vías futuras no invasivas:**
   - Integración con extensiones de editores (ej. plugin de Obsidian o VS Code) que sincronicen el tiempo activo de un archivo/proyecto directamente con el micro-servidor local vía `POST /api/sesiones`.

---

### 4. ¿Cómo me enfrento a la deuda técnica de hacer todo con agentes de IA y LLMs?

**R:** Diseñando con **arquitectura modular estricta, contratos explícitos y verificación automatizada**:

1. **Separación de Responsabilidades en Capas Puras:**
   - `js/domain/metrics.js`: Lógica pura de negocio, fórmulas matemáticas (progresión cuadrática, FSRS/DSR, deuda cognitiva), taxonomías y funciones analíticas (sin DOM, sin APIs de red, testeable con Node.js en milisegundos).
   - `js/services/excel-sync.js`: Entrada/salida RFC 4180 de CSV (22 columnas con retrocompatibilidad para 18 y 20 columnas), parseo y cliente HTTP hacia `server.js`.
   - `js/state/store.js`: Estado reactivo (Pub/Sub) con persistencia dual en CSV y `localStorage`.
   - `js/ui/`: Controladores de presentación (`dashboard.js`, `charts.js`, `timer.js`, `i18n.js`).
2. **Manifiesto Anti-Vibecoding y Ruta Quirúrgica a v4.0:**
   - Documentado en [docs/ruta_de_refactorizaci_n_quir_rgica_v4_0.md](ruta_de_refactorizaci_n_quir_rgica_v4_0.md): diseñar contratos de tipos primero, verificar con Vitest y avanzar paso a paso.
3. **Cero Dependencias Externas en Producción (v3.2):**
   - `server.js` usa módulos nativos de Node (`http`, `fs`, `path`) con respaldos diarios automáticos en `data/backups/YYYY-MM-DD.csv`.

---

### 5. ¿Qué hacer cuando tenga una idea nueva que implique agregar una columna nueva con nueva información? ¿Qué pasaría con los datos que ya tenía? ¿Cómo imputo esa nueva información?

**R:** El protocolo establecido y probado en las migraciones v2 → v3.0 → v3.2 es el siguiente:

1. **Regla #1: Respaldo previo antes de tocar nada:**
   - Siempre crear una copia del archivo CSV actual en `data/backups/` (además del respaldo diario automático de `server.js`).
2. **Funciones de Migración e Inferencia Puras e Idempotentes:**
   - En `js/domain/metrics.js`, mantener funciones de mapeo e inferencia con fallbacks retrocompatibles:
     - `migrarTipoActividad(actividadVieja)`
     - `migrarDominioPrevio(dominioViejo)`
     - `migrarDinamicaCognitiva(dinamicaRaw, produccionVieja, modoIAViejo, usoIA)`
     - `migrarEstadoObjetivo(objetivoViejo)`
     - `inferirModoDisenoIA(sesion)`, `inferirModalidadProcesamiento(sesion)`, `inferirEstructuraPractica(sesion)` e `inferirDeudaSesion(sesion)`
3. **Detección Automática de Esquema en `excel-sync.js`:**
   - Al parsear el CSV, se inspeccionan los encabezados de la fila 0 (soportando archivos históricos de 18, 20 o 22 columnas sin pérdida) y se normalizan al esquema canónico de 22 columnas.
4. **Criterios de Imputación de Datos Históricos:**
   - *Grados FSRS (1–4):* Las sesiones históricas con calidad 5 se normalizan a `4 · Easy` manteniendo idéntico el multiplicador de XP (`+1.0`).
   - *Inferencia cognitiva:* Si una sesión antigua de 18 columnas no tenía `Modo_Diseno_IA` o `Modalidad_Procesamiento_Efectiva`, se infieren determinísticamente a partir de su `% IA`, `Dinamica_Cognitiva` y `Calidad` para nutrir todos los gráficos del Centro Analítico sin distorsión.
