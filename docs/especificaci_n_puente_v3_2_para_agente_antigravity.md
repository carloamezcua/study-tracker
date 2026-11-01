# 🤖 PROMPT DE EJECUCIÓN ESTRICTA: Implementación del "Puente v3.2" (Captura Compatible con v4.0 sobre CSV)

> **INSTRUCCIONES CRÍTICAS PARA EL AGENTE (ANTIGRAVITY):**
> 1. **CERO IMPROVISACIÓN:** Ejecuta **únicamente** los pasos descritos en este documento y en el orden secuencial indicado (Fase 1 a Fase 6).
> 2. **PROHIBIDO CAMBIAR EL STACK ACTUAL:** Este cambio se realiza sobre la versión actual en **Vanilla JS + HTML + CSS + CSV (`v3.1`)**. **NO** instales React, TypeScript ni SQLite en esta tarea.
> 3. **NO ROMPER RETROCOMPATIBILIDAD:** Los gráficos (`js/ui/charts.js`), el dashboard (`js/ui/dashboard.js`) y las sesiones históricas de 18 columnas en `data/study-tracker.csv` deben seguir funcionando sin errores.
> 4. **RESPETAR NOMBRES CANÓNICOS:** Usa exactamente los strings, nombres de columnas e IDs especificados en este documento (sin cambiar mayúsculas, guiones bajos ni tildes en los valores internos).

---

## 🎯 Objetivo Arquitectónico

Aplicar el patrón **Expand and Contract (Puente v3.2)**:
1. Actualizar el formulario en 2 tiempos (`index.html` y `js/app.js`) para que el usuario capture desde hoy mismo las variables exactas diseñadas para la futura versión 4.0.
2. Ocultar del formulario los campos obsoletos (`Contexto`, `Energia_Previa`, `Complejidad`), inyectándoles valores neutros por defecto en segundo plano para no romper los gráficos actuales de la v3.1.
3. Extender el esquema de `data/study-tracker.csv` de **18 a 22 columnas** (conservando las 18 originales y agregando las 4 nuevas columnas de la v4 al final).

---

## 🛡️ FASE 1: Respaldo Inmutable de Datos (Regla #1)

Antes de modificar cualquier línea de código o tocar el archivo CSV:

- [ ] **1.1 Verificar/Crear carpeta de respaldos:** Asegúrate de que exista el directorio `data/backups/`.
- [ ] **1.2 Copiar archivo maestro actual:** Crea una copia exacta e inmutable de `data/study-tracker.csv` en la ruta:
  ```text
  data/backups/study-tracker-v3.1-pre-bridge.csv
  ```
- [ ] **1.3 Verificación:** Confirma que el archivo de respaldo existe y tiene exactamente el mismo número de líneas que `data/study-tracker.csv`.

---

## 🧬 FASE 2: Actualización de Catálogos y Fórmulas en `js/domain/metrics.js`

Abre `js/domain/metrics.js` y realiza **únicamente** las siguientes adiciones y ajustes manteniendo el soporte para sesiones históricas:

### 2.1 Nuevas Constantes Taxonómicas (v4.0 Ready)

- [ ] **Definir las 4 nuevas Estrategias Técnicas Planificadas (sustituyen en la UI a las 6 actividades antiguas en el campo `Tipo_Actividad`):**
  ```javascript
  export const ESTRATEGIAS_TECNICAS_V4 = [
    'Recuperacion_Activa',     // Recordar y codificar a ciegas (flashcards, ejercicios sin ayuda, autoexplicación)
    'Construccion_Generativa', // Creación propia (redacción de arquitectura, apuntes estructurados, lógica desde cero)
    'Consumo_Receptivo',       // Lectura de documentación, videos, clases grabadas o revisión de código ajeno
    'Delegacion_Ejecutiva'     // Uso de IA o generadores para resolver scripts, entregables o tareas contra reloj
  ];
  ```
  *Nota crítica:* No borres las 6 actividades antiguas del normalizador o validador si se usan para leer sesiones pasadas; permite tanto los 6 valores antiguos como estos 4 valores nuevos en `Tipo_Actividad`.

- [ ] **Definir los catálogos de las 4 columnas nuevas (Columnas 19 a 22):**
  ```javascript
  export const ESTRUCTURAS_PRACTICA = ['Bloqueado', 'Intercalado'];

  export const MODOS_DISENO_IA = [
    'Sin_IA',
    'Tutor_Andamiaje',
    'Generacion_Automatica'
  ];

  export const MODALIDADES_PROCESAMIENTO = [
    'Extraccion_Esforzada',
    'Reconocimiento_Fluido',
    'Copia_Pasiva'
  ];

  export const FRICCIONES_INTERCALADAS = [
    '', // Vacío (NULL en CSV) cuando Estructura_Practica === 'Bloqueado'
    'Sin_Friccion',
    'Friccion_Productiva',
    'Confusion_Excesiva'
  ];
  ```

### 2.2 Calculador Automático de Deuda Cognitiva (Fórmula Determinista)

- [ ] **Agregar y exportar la función `calcularIndiceDeudaCognitiva(usoIaPorcentaje, dinamica, modalidad)`:**
  ```javascript
  export function calcularIndiceDeudaCognitiva(usoIaPorcentaje, dinamica, modalidad = 'Extraccion_Esforzada') {
    const ia = Number(usoIaPorcentaje) || 0;
    const din = String(dinamica || '').trim();
    const mod = String(modalidad || '').trim();

    if (
      din === 'Delegacion_Mecanica' ||
      din === 'Delegación / Reproducción' ||
      (ia >= 75 && mod === 'Copia_Pasiva')
    ) {
      return 'Critico';
    }
    if (ia >= 50 && (mod === 'Reconocimiento_Fluido' || mod === 'Copia_Pasiva')) {
      return 'Moderado';
    }
    if (
      (din === 'Generacion_Propia' || din === 'Generación Propia') &&
      ia <= 10
    ) {
      return 'Nulo';
    }
    return 'Bajo';
  }
  ```

### 2.3 Ajuste de Escala FSRS (1 a 4) y Bonos en `calcularXP`

- [ ] **Adaptar el cálculo de XP en `js/domain/metrics.js`:**
  1. En las nuevas sesiones, `Calidad` ahora representa `calificacion_respuesta_grade` en escala FSRS de `1` a `4` (`1 = Again`, `2 = Hard`, `3 = Good`, `4 = Easy`).
  2. Ajusta el multiplicador de calidad dentro de `calcularXP` a `calidad * 0.25` (para que el grado máximo `4` otorgue `+1.0`, equivalente al antiguo `5 * 0.20`).
  3. Añade el soporte opcional para `Friccion_Discriminacion_Intercalada` en el cálculo de XP:
     - Si `Friccion_Discriminacion_Intercalada === 'Friccion_Productiva'`, suma un bono de `+0.05` (`+5%`).
     - En cualquier otro caso (`''`, `'Sin_Friccion'`, `'Confusion_Excesiva'`), el bono es `0`.

---

## 💾 FASE 3: Expansión del CSV de 18 a 22 Columnas (`js/services/excel-sync.js` y `js/state/store.js`)

### 3.1 Nuevo Encabezado Canónico de 22 Columnas en `js/services/excel-sync.js`

- [ ] **Actualizar la constante de encabezados CSV a exactamente estas 22 columnas en este orden:**
  ```javascript
  export const CSV_HEADERS_V3_2 = [
    // --- 18 Columnas Originales (v3.1) ---
    'Fecha',
    'Dia_Semana',
    'Hora_Inicio',
    'Hora_Fin',
    'Franja_Horaria',
    'Contexto',
    'Materia',
    'Tipo_Actividad',
    'Dinamica_Cognitiva',
    'Uso_IA_Porcentaje',
    'Dominio_Previo',
    'Energia_Previa',
    'Complejidad',
    'Objetivo_Cumplido',
    'Duracion_Minutos',
    'Calidad',
    'XP_Ganados',
    'Notas',
    // --- 4 Columnas Nuevas (Puente v3.2 -> v4.0) ---
    'Estructura_Practica',
    'Modo_Diseno_IA',
    'Modalidad_Procesamiento_Efectiva',
    'Friccion_Discriminacion_Intercalada'
  ];
  ```

- [ ] **Soportar lectura retrocompatible de 18 y 22 columnas en `excel-sync.js`:**
  - Al parsear `data/study-tracker.csv`, si una fila proviene del esquema de 18 columnas (no tiene las columnas 19 a 22), asigna en el objeto en memoria:
    - `Estructura_Practica: row.Estructura_Practica || 'Bloqueado'`
    - `Modo_Diseno_IA: row.Modo_Diseno_IA || ''`
    - `Modalidad_Procesamiento_Efectiva: row.Modalidad_Procesamiento_Efectiva || ''`
    - `Friccion_Discriminacion_Intercalada: row.Friccion_Discriminacion_Intercalada || ''`
  - Al serializar hacia CSV (`toCSV`), escribe siempre las **22 columnas** usando `CSV_HEADERS_V3_2`.
  - Si `Estructura_Practica === 'Bloqueado'`, asegúrate de que `Friccion_Discriminacion_Intercalada` se escriba como cadena vacía `""` (que se migrará como `NULL` en SQLite).

### 3.2 Valores Neutros por Defecto en `js/state/store.js`

- [ ] **Actualizar la función normalizadora de sesiones en `js/state/store.js`:**
  - Dado que `Contexto`, `Energia_Previa` y `Complejidad` estarán ocultos en la interfaz para no generar fatiga cognitiva, inyecta estos fallbacks silenciosos si no vienen definidos desde el formulario:
    - `Contexto: sesion.Contexto || 'General'`
    - `Energia_Previa: Number(sesion.Energia_Previa) || 3`
    - `Complejidad: Number(sesion.Complejidad) || 3`
  - Conserva y normaliza las 4 propiedades nuevas en el objeto de sesión:
    - `Estructura_Practica: sesion.Estructura_Practica || 'Bloqueado'`
    - `Modo_Diseno_IA: sesion.Modo_Diseno_IA || 'Sin_IA'`
    - `Modalidad_Procesamiento_Efectiva: sesion.Modalidad_Procesamiento_Efectiva || 'Extraccion_Esforzada'`
    - `Friccion_Discriminacion_Intercalada: sesion.Estructura_Practica === 'Intercalado' ? (sesion.Friccion_Discriminacion_Intercalada || 'Sin_Friccion') : ''`

---

## 🖥️ FASE 4: Rediseño Quirúrgico del Formulario en 2 Tiempos (`index.html`)

Modifica el formulario de registro en `index.html` respetando las clases CSS existentes (`.chip-group`, `.chip`, etc.) para mantener la estética y el grid fluido:

### 4.1 Cambios en la Etapa 1: Punto de Partida (Al Iniciar — Tiempo 1)

- [ ] **1. Ocultar `Contexto` y `Energia_Previa`:**
  - No elimines sus inputs del DOM si `app.js` los referencia; envuélvelos en un contenedor con `style="display: none;"` y deja su valor por defecto seleccionado (`3` para energía, `Académico` o `General` para contexto).
- [ ] **2. Conservar `Materia` y `Dominio_Previo` intactos:**
  - Mantén los Quick-Chips de materia y los 3 botones de `Dominio_Previo` (🌱 *Nuevo*, 🌿 *En construcción*, 🌳 *Consolidado*).
- [ ] **3. Actualizar el selector de `Tipo_Actividad` (ahora "Estrategia Planificada"):**
  - Cambia la etiqueta visible a **"Estrategia Planificada"** y reemplaza los 6 botones antiguos por exactamente estos 4 botones/chips:
    - `data-value="Recuperacion_Activa"` $\to$ **🧠 Recuperación Activa** *(Ejercicios a ciegas, flashcards, autoexplicación)*
    - `data-value="Construccion_Generativa"` $\to$ **🛠️ Construcción Generativa** *(Crear código propio, arquitectura, apuntes desde cero)*
    - `data-value="Consumo_Receptivo"` $\to$ **📖 Consumo Receptivo** *(Leer docs, ver videos/clases, revisar código)*
    - `data-value="Delegacion_Ejecutiva"` $\to$ **⚡ Delegación Ejecutiva** *(Resolver entregable/script rápido asistido por IA)*
  - Deja `Construccion_Generativa` o `Recuperacion_Activa` pre-seleccionado por defecto.
- [ ] **4. Agregar selector de `Estructura_Practica` (con Smart Default en `Bloqueado`):**
  - Añade un grupo de chips o toggle para `Estructura_Practica` con ID/input oculto `estructura-practica`:
    - `data-value="Bloqueado"` $\to$ **🧱 Bloqueado (1 solo tema)** *(Seleccionado por defecto)*
    - `data-value="Intercalado"` $\to$ **🔀 Intercalado (Problemas mixtos)**
- [ ] **5. Agregar selector de `Modo_Diseno_IA` (Intención inicial con IA):**
  - Añade un grupo de 3 chips para `Modo_Diseno_IA` con ID/input oculto `modo-diseno-ia`:
    - `data-value="Sin_IA"` $\to$ **🚫 Sin IA**
    - `data-value="Tutor_Andamiaje"` $\to$ **🦉 Tutor Andamiaje** *(Seleccionado por defecto)*
    - `data-value="Generacion_Automatica"` $\to$ **🤖 Generación Automática**

### 4.2 Cambios en la Etapa 2: Evaluación del Bloque (Al Terminar — Tiempo 2)

- [ ] **1. Ocultar `Complejidad`:**
  - Oculta el bloque visual de `Complejidad` con `style="display: none;"` manteniendo su valor por defecto en `3`.
- [ ] **2. Transformar `Calidad` (1–5) en `Calificación FSRS (Grade 1–4)`:**
  - En el selector de `Calidad` (que guarda en el campo `Calidad`), reemplaza los 5 botones por los **4 botones FSRS**:
    - `data-value="1"` $\to$ **1 · Again** *(Olvido / Bloqueo)*
    - `data-value="2"` $\to$ **2 · Hard** *(Esfuerzo extremo)*
    - `data-value="3"` $\to$ **3 · Good** *(Recuerdo normal — Seleccionado por defecto)*
    - `data-value="4"` $\to$ **4 · Easy** *(Fluido / Inmediato)*
- [ ] **3. Conservar `Dinamica_Cognitiva`, `Uso_IA_Porcentaje`, `Objetivo_Cumplido` (Fluidez: *Flujo limpio, Lucha productiva, Con fricción, Parálisis*) y `Notas` (`[Subtema]`).**
- [ ] **4. Agregar selector de `Modalidad_Procesamiento_Efectiva`:**
  - Añade un grupo de 3 chips con ID/input oculto `modalidad-procesamiento`:
    - `data-value="Extraccion_Esforzada"` $\to$ **🔥 Extracción Esforzada** *(Sin mirar fuente — Seleccionado por defecto)*
    - `data-value="Reconocimiento_Fluido"` $\to$ **👀 Reconocimiento Fluido** *(Vi la solución y fue familiar)*
    - `data-value="Copia_Pasiva"` $\to$ **📋 Copia Pasiva** *(Transcripción directa)*
- [ ] **5. Agregar selector condicional de `Friccion_Discriminacion_Intercalada`:**
  - Añade un contenedor con `id="contenedor-friccion-intercalada"` y `style="display: none;"` (oculto por defecto porque `Estructura_Practica` inicia en `Bloqueado`).
  - Dentro del contenedor, coloca 3 chips vinculados al input `friccion-intercalada`:
    - `data-value="Sin_Friccion"` $\to$ **🟢 Sin Fricción**
    - `data-value="Friccion_Productiva"` $\to$ **🧠 Fricción Productiva (+5% XP)** *(Seleccionado por defecto cuando se activa)*
    - `data-value="Confusion_Excesiva"` $\to$ **🔴 Confusión Excesiva**
- [ ] **6. Agregar píldora informativa de `Indice_Deuda_Cognitiva` (Solo lectura / Automático):**
  - En la barra de previsualización de XP del Tiempo 2, añade un pequeño badge (`id="badge-deuda-cognitiva"`) que muestre en tiempo real el resultado de `calcularIndiceDeudaCognitiva(...)`: `Deuda Cognitiva: Nulo | Bajo | Moderado | Crítico`.

---

## ⚙️ FASE 5: Lógica de Eventos, Condicionalidad y Edición en `js/app.js` y `js/ui/dashboard.js`

- [ ] **5.1 Condicionalidad de `Estructura_Practica` $\to$ `Friccion_Discriminacion_Intercalada` en `js/app.js`:**
  - Cuando el usuario cambie `Estructura_Practica`:
    - Si selecciona `'Intercalado'`, muestra `#contenedor-friccion-intercalada` (`style.display = 'block'`) y pre-selecciona `'Friccion_Productiva'`.
    - Si selecciona `'Bloqueado'`, oculta `#contenedor-friccion-intercalada` (`style.display = 'none'`) y limpia su valor a `''`.
- [ ] **5.2 Independencia entre `Modo_Diseno_IA` y `Dinamica_Cognitiva`:**
  - **NO** bloquees ni fuerces `Dinamica_Cognitiva` según lo elegido en `Modo_Diseno_IA`. El usuario puede elegir `'Sin_IA'` al inicio y terminar marcando `'Andamiaje / Co-creación'` al final (esa discrepancia es intencional).
- [ ] **5.3 Recolección de datos al guardar (`submit`) y al editar (`✏️`):**
  - En `js/app.js`, al construir el objeto de sesión para `store.addSession()` o `store.updateSession()`, incluye explícitamente:
    - `Estructura_Practica`
    - `Modo_Diseno_IA`
    - `Modalidad_Procesamiento_Efectiva`
    - `Friccion_Discriminacion_Intercalada` (forzando `''` si `Estructura_Practica === 'Bloqueado'`)
  - Cuando el usuario pulse el botón Editar (`✏️`) en una fila del historial, carga correctamente en el formulario tanto los campos originales como estos 4 campos nuevos.
- [ ] **5.4 Smart Defaults en `js/ui/dashboard.js`:**
  - Asegúrate de que al aplicar *Smart Defaults* al inicio de una sesión, `Estructura_Practica` siempre se inicialice en `'Bloqueado'` por defecto.

---

## 🌐 FASE 6: Diccionarios de Idioma (`js/ui/i18n.js`) y Verificación Final

- [ ] **6.1 Actualizar `js/ui/i18n.js`:**
  - Agrega las claves de traducción en Español (`es`) e Inglés (`en`) para las nuevas etiquetas (`Estrategia Planificada`, `Estructura de Práctica`, `Modo Diseño IA`, `Modalidad Efectiva`, `Fricción Intercalada`, `Calificación FSRS`) para no romper el cambio de idioma.
- [ ] **6.2 Verificación de Integridad (Checklist de Cierre del Agente):**
  1. Verifica que ningún archivo `.js` tenga errores de sintaxis (`node --check`).
  2. Verifica que al iniciar la app se lean todas las sesiones históricas de `data/study-tracker.csv` sin lanzar errores en consola y que las 4 pestañas de gráficos rendericen normalmente.
  3. Verifica que al guardar una nueva sesión de prueba, el archivo `data/study-tracker.csv` tenga el nuevo encabezado de **22 columnas** y que los valores de las columnas 19 a 22 se guarden en el orden exacto especificado.