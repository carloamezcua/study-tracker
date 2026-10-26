# ❓ Preguntas Guía y Decisiones de Diseño

> Este archivo no es solo una lista de tareas: es para **pensar y documentar la arquitectura cognitiva**.
> Debajo de cada pregunta se registran las respuestas (`**R:**`) y las lecciones aprendidas que se han convertido en decisiones de diseño del sistema.
> Puedes pegar una sección completa a una IA y pedirle que te **entreviste** o cuestione tus respuestas antes de hacer cambios mayores.

---

### 1. ¿Cómo evitar la fricción de tener que llenar todos los campos?

**R:** En la versión 3.0 resolvimos la fricción aplicando el principio de **desacoplamiento cognitivo en 2 tiempos** y **cero redundancia**:

1. **División en 2 Etapas Temporales:**
   - **🎯 1. Punto de Partida (Al Iniciar):** Solo capturas lo que sabes antes de sentarte a estudiar (Materia, Contexto, Energía inicial, Dominio previo del concepto).
   - **🏁 2. Evaluación del Bloque (Al Terminar):** Evalúas cómo se desarrolló el bloque (Dinámica Cognitiva, % IA, Fluidez/Avance, Asimilación 1–5 y Notas).
2. **Pre-llenado Inteligente (*Smart Defaults*):**
   - El sistema recuerda tu última materia estudiada, tu contexto habitual y tu energía promedio según la franja horaria actual (`Madrugada`, `Mañana`, `Tarde`, `Noche`), por lo que al abrir el formulario ya está pre-configurado para tu bloque actual.
3. **Chips Rápidos de Materias Recientes:**
   - Barra de botones con tus últimas materias estudiadas (`[Snowflake]`, `[Rails]`, etc.) + un botón `[+ Nueva]` para cambiar de materia en 1 solo clic sin teclear en el input.
4. **Fusión Ortogonal de Campos Redundantes:**
   - `Produccion_Propia` y `Modo_IA` se fusionaron en un solo campo: `Dinamica_Cognitiva` (4 opciones: *Recepción Pasiva, Delegación/Reproducción, Andamiaje/Co-creación, Generación Propia*).
   - Se descartó `Dominio_Final`: nadie domina un tema complejo en 25 minutos; pedir calificar el dominio al inicio y al final generaba fatiga y parálisis.
   - El campo `Tema` se absorbió en `Notas` como prefijo entre corchetes (ej. `[Mesa Redonda - GANs] Notas...`), extrayéndose automáticamente para el Inspector sin obligar a llenar un input extra.

---

### 2. ¿Qué elementos de gamificación debería implementar para mantener a la audiencia atrapada?

**R:** La gamificación debe incentivar el **esfuerzo cognitivo profundo** y la **constancia**, nunca la trampa ni la velocidad vacía:

1. **Curva Exponencial OSRS (*Old School RuneScape*):**
   - Ya implementada: duplicación de XP cada 7 niveles ($250 \times (2^{(L-1)/7} - 1)$), con el hito matemático donde el Nivel 92 representa el 50% del camino al Nivel 99.
2. **Incentivos a la Autonomía Cognitiva:**
   - La fórmula premia con bonos multiplicadores el estudio autónomo y la generación propia (`+10% XP` a `🧠 Generación Propia` con 0% IA) y penaliza la delegación mecánica vacía (`-15% XP` si delegas $\ge 50\%$ a la IA).
3. **Próximos pasos a explorar (ver [IDEAS.md](IDEAS.md)):**
   - *Combos Pomodoro:* Bono de XP al encadenar 2 o más pomodoros seguidos con descanso reglamentario.
   - *Rachas de Foco Diario:* Medallas por mantener días activos consecutivos (hoy visible como estadística en la Pestaña 1).
   - *Avatar Virtual / Tienda de XP:* Un compañero virtual estilo Tamagotchi que se desbloquea o sube de nivel con cosméticos comprados con el XP acumulado.

---

### 3. ¿Cómo podría automatizar el proceso de ingesta de datos? ¿"monitoreando" la actividad del usuario para rellenar?

**R:** El equilibrio ideal es **automatizar la fricción temporal pero preservar la reflexión cognitiva humana**:

1. **Lo que SÍ se automatiza:**
   - El **Cronómetro / Pomodoro integrado** captura la fecha, la hora exacta de inicio al pulsar *Iniciar*, la hora de fin al pulsar *Terminar*, calcula los minutos (con soporte para cruce de medianoche) y calcula la franja horaria biológica.
2. **Lo que NO debe automatizarse al 100%:**
   - La calificación de la *Dinámica Cognitiva*, la *Fluidez* y la *Asimilación*: el acto de calificar tu propio esfuerzo al terminar un bloque (10 segundos) es un **ejercicio metacognitivo** fundamental para consolidar lo aprendido.
3. **Vías futuras no invasivas:**
   - Integración con extensiones de editores (ej. plugin de Obsidian o VS Code) que sincronicen el tiempo activo de un archivo/proyecto directamente con el micro-servidor local vía `POST /api/sesion`.

---

### 4. ¿Cómo me enfrento a la deuda técnica de hacer todo con agentes de IA y LLMs?

**R:** Diseñando con **arquitectura modular estricta, cero frameworks pesados y verificación automatizada**:

1. **Separación de Responsabilidades en Capas Puras:**
   - `js/domain/metrics.js`: Lógica pura de negocio, fórmulas matemáticas, taxonomías y funciones analíticas (sin DOM, sin APIs de red, testeable con Node.js en 50 milisegundos).
   - `js/services/excel-sync.js`: Entrada/salida RFC 4180 de CSV, parseo y cliente HTTP hacia `server.js`.
   - `js/state/store.js`: Estado reactivo (Pub/Sub) con persistencia dual en CSV y `localStorage`.
   - `js/ui/`: Controladores de presentación (`dashboard.js`, `charts.js`, `timer.js`, `i18n.js`).
2. **Pruebas de Verificación Automatizadas:**
   - Scripts ligeros en Node (ej. `verify_v3.js`) que validan la sintaxis de todos los archivos, comprueban que el 100% de claves i18n existan en ES y EN, y ejecutan todo el pipeline analítico sobre el CSV antes de confirmar cambios.
3. **Cero Dependencias Externas en Producción:**
   - `server.js` usa módulos nativos de Node (`http`, `fs`, `path`).
   - El frontend corre nativamente en cualquier navegador sin bundlers (`vite`, `webpack`) ni librerías invasivas como SheetJS.

---

### 5. ¿Qué hacer cuando tenga una idea nueva que implique agregar una columna nueva con nueva información? ¿Qué pasaría con los datos que ya tenía? ¿Cómo imputo esa nueva información?

**R:** El protocolo establecido y probado en la migración a v3.0 es el siguiente:

1. **Regla #1: Respaldo previo antes de tocar nada:**
   - Siempre crear una copia del archivo CSV actual en `data/backups/study-tracker-pre-vX-backup.csv`.
2. **Funciones de Migración Puras e Idempotentes:**
   - En `js/domain/metrics.js`, crear funciones de mapeo con fallbacks retrocompatibles:
     - `migrarTipoActividad(actividadVieja)`
     - `migrarDominioPrevio(dominioViejo)`
     - `migrarDinamicaCognitiva(modoIAViejo, produccionVieja)`
3. **Detección Automática de Esquema en `excel-sync.js`:**
   - Al parsear el CSV, se inspeccionan los encabezados de la fila 0:
     - Si tiene 20 columnas (esquema v2), se aplica la migración en memoria fila por fila.
     - Si ya tiene 18 columnas (esquema v3), se lee directamente.
   - Si se detecta un archivo antiguo, se migra al vuelo y se sobreescribe el CSV en disco con el nuevo formato automáticamente.
4. **Criterios de Imputación de Datos Históricos:**
   - *Fusión de columnas:* Si una sesión tenía `Modo_IA = "Diálogo / Tutoría"`, se imputa prioritariamente a `Dinamica_Cognitiva = "Andamiaje / Co-creación"`. Si tenía `Modo_IA = "Mecánico"`, a `Delegación / Reproducción`.
   - *Columnas absorbidas:* Si existía una columna `Tema`, se concatena al inicio de `Notas` con formato `"[Tema] " + notasOriginales`.
   - *Columnas eliminadas:* Se descartan de forma limpia sin romper las fórmulas matemáticas.
