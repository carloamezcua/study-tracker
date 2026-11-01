
Para diseñar un **dashboard analítico completo e interactivo** para **StudyTracker v3.2/v4.0**, es fundamental basarnos en el marco conceptual de **Tamara Munzner** (*Visualization Analysis and Design*) y en los principios neurocognitivos de tus fuentes (modelo DSR de FSRS, dificultades deseables y curva del olvido).

Según el marco **What–Why–How** de Munzner, un dashboard eficaz transforma atributos de datos (22 columnas del CSV) en abstracciones de tareas visuales (explorar tendencias, comparar rendimiento y detectar anomalías o deudas cognitivas). La **posición espacial** es el canal visual de mayor jerarquía y precisión, mientras que el **filtrado cruzado interactivo (*cross-filtering / linked highlighting*)** entre vistas multiformas (*multiform views*) permite navegar los datos sin saturar la carga cognitiva del usuario.

A continuación se presenta la propuesta estructurada por **Pestañas (Tabs)** e **Interacciones**, diseñada para abstraer completamente tus registros.

---

### 🏛️ Estructura General del Dashboard por Pestañas

#### 📌 Pestaña 1: Progresión RPG & Panorama Circadiano (Vista Macro / Overview)

* **Propósito:** Ofrecer una visión general inmediata de tu constancia y evolución temporal bajo el principio de Shneiderman (*"Overview first, zoom and filter, details-on-demand"*).
* **Visualizaciones Recomendadas:**
  1. **Gauge / Progress Arc (Progresión RPG Lv 1–99):**
     * **Métrica:** XP total acumulado vs. XP necesario para el siguiente nivel, reflejando la curva exponencial \\(2^{(L-1)/7}\\) (donde el Nivel 92 equivale al 50% del camino).
     * **Codificación:** Arco de progreso con marcador numérico de nivel y píldora de XP faltante.
  2. **Streamgraph / Stacked Area Chart (Evolución de Horas y XP por Materia):**
     * **Ejes:** Eje X = Tiempo (Fechas), Eje Y = Minutos o XP ganados.
     * **Codificación:** Áreas apilables codificadas por matiz de color (*hue*) según la `Materia`. Muestra la continuidad del estudio y los cambios de enfoque a lo largo de las semanas.
  3. **Heatmap 2D Circadiano (Matriz Día de la Semana × Franja Horaria):**
     * **Ejes:** Eje X = Franja Horaria (Madrugada, Mañana, Tarde, Noche), Eje Y = Día de la Semana (Lunes a Domingo).
     * **Codificación:** Saturación de color (*luminance/saturation*) proporcional al volumen de minutos estudiados. Permite identificar tus ventanas circadianas de mayor productividad real.
  4. **KPI Metric Cards (Tarjetas de Control):**
     * Total de Horas Acumuladas, Promedio de Uso de IA (%), Nivel de Deuda Cognitiva Dominante e Índice de Fluidez.

---

#### 🧠 Pestaña 2: Salud Cognitiva, IA & Deuda Cognitiva

* **Propósito:** Evaluar el impacto del uso de IA y diferenciar la *Generación Propia* de la *Delegación / Copia Pasiva*, fundamentado en las dificultades deseables de Bjork.
* **Visualizaciones Recomendadas:**
  1. **Scatterplot de Dispersión (Uso de IA % vs. Calidad FSRS / XP):**
     * **Ejes:** Eje X = `Uso_IA_Porcentaje` (0% a 100%), Eje Y = `Calidad` FSRS (1 a 4).
     * **Canales Visuales:** Color = `Dinamica_Cognitiva` (Generación Propia, Andamiaje, Recepción Pasiva, Delegación); Tamaño del punto = `Duracion_Minutos`.
     * **Tarea:** Identificar el "punto dulce" donde la IA actúa como andamiaje socrático sin generar deuda cognitiva ni perjudicar la retención futura.
  2. **Donut / Ring Chart (Distribución del Índice de Deuda Cognitiva):**
     * **Categorías:** Nulo, Bajo, Moderado, Crítico.
     * **Codificación:** Colores semánticos (Verde, Azul, Naranja, Rojo).
  3. **Stacked Bar Chart (Modo de Diseño IA vs. Modalidad de Procesamiento Efectiva):**
     * **Ejes:** Eje X = `Modo_Diseno_IA` (Tutor, Sintaxis, etc.), Eje Y = Conteo de Sesiones desglosadas por `Modalidad_Procesamiento_Efectiva` (Extracción Esforzada, Reconocimiento Fluido, Copia Pasiva).

---

#### 📈 Pestaña 3: Algoritmos FSRS & Consolidación Memórica (DSR)

* **Propósito:** Monitorear la retención a largo plazo y la estabilidad de la memoria basándose en los modelos DSR (Dificultad, Estabilidad, Retrievabilidad) de FSRS/SuperMemo y la Curva del Olvido de Ebbinghaus.
* **Visualizaciones Recomendadas:**
  1. **Curva Teórica del Olvido e Histórico de Retención (Line Chart Simulado):**
     * **Ejes:** Eje X = Días desde la última sesión (\\(t\\)), Eje Y = Probabilidad de Recuerdo / Retrievabilidad (\\(R\\)).
     * **Codificación:** Línea de decaimiento teórico basada en las calificaciones FSRS (1: Again, 2: Hard, 3: Good, 4: Easy) con una línea punteada que marca el objetivo de retención deseada (ej. 90%).
  2. **Bubble Chart DSR (Estabilidad vs. Dificultad por Materia/Subtema):**
     * **Ejes:** Eje X = Estabilidad estimada (\\(S\\) en días), Eje Y = Dificultad estimada (\\(D\\) de 1 a 10).
     * **Canales:** Tamaño de la burbuja = Frecuencia de repasos; Color = `Contexto` (Académico, Certificación, Proyecto Propio, Externo).
  3. **Grouped Bar Chart (Práctica Bloqueada vs. Intercalada & Fricción):**
     * **Ejes:** Eje X = `Estructura_Practica` (Bloqueado vs. Intercalado), Eje Y = XP Promedio / Calidad FSRS.
     * **Desglose:** Barras agrupadas por `Friccion_Discriminacion_Intercalada` (Sin Fricción, Friccion Productiva, Confusión Excesiva) para verificar la hipótesis científica de que la práctica intercalada con fricción productiva genera un aprendizaje más duradero.

---

#### 🔬 Pestaña 4: Inspector Profundo por Dimensión ("Power BI View" & Cross-Filtering)

* **Propósito:** Cumplir con tu requerimiento de seleccionar cualquier columna/dimensión y analizar dinámicamente todo su comportamiento.
* **Visualizaciones e Interacciones Integradas:**
  1. **Selector de Dimensión Activa (Dropdown / Column Picker):**
     * Permite elegir cualquier variable categórica (`Materia`, `Tipo_Actividad`, `Contexto`, `Dominio_Previo`, `Dinamica_Cognitiva`).
  2. **Parallel Coordinates Plot (Coordenadas Paralelas Multivariables):**
     * **Ejes Verticales Paralelos:** `Dominio_Previo` ➔ `Tipo_Actividad` ➔ `Dinamica_Cognitiva` ➔ `Calidad_FSRS` ➔ `XP_Ganados`.
     * **Utilidad:** Cada línea representa una sesión de estudio. Al seleccionar un valor en un eje (ej. `Dominio_Previo = En Construcción`), las líneas pertenecientes se resaltan (*linked highlighting*), revelando instantáneamente cómo se comporta esa dimensión a través de todas las etapas del proceso de estudio.
  3. **Treemap / Sunburst Chart (Desglose de Subtemas en Notas):**
     * **Estructura Jerárquica:** `Materia` ➔ `[Subtema]` extraído del campo de notas.
     * **Codificación:** Área del rectángulo = Minutos invertidos; Color = Calidad FSRS o Índice de Deuda Cognitiva.
  4. **Small Multiples / Grid de Histogramas (Comparación entre Categorías):**
     * Matriz de pequeños gráficos idénticos (*small multiples*) que comparan la distribución de XP y Duración para cada categoría de la dimensión seleccionada.

---

### ⚡ Mecanismo Técnico de Interacción (*Cross-Filtering / Brushing*)

Para lograr la experiencia interactiva que buscas (estilo Power BI), el dashboard debe implementar las siguientes reglas de diseño de interacción descritas por Tamara Munzner:

1. **Estado de Selección Compartido (*Shared Selection State*):**
   * Al hacer clic en un elemento gráfico de cualquier pestaña (por ejemplo, la barra de una `Materia` o un chip de `Tipo_Actividad`), la aplicación almacena un filtro activo global: `filterState = { Materia: 'Snowflake' }`.
2. **Linked Highlighting / Cross-Filtering en Tiempo Real:**
   * Todos los gráficos juxtapuestos (*juxtaposed multiform views*) responden al evento actualizando sus marcas visuales: las sesiones que coinciden permanecen opacas y con su color asignado, mientras que las que no coinciden se atenúan (*dimming/fade out*).
3. **Filtros Dinámicos de Panel (*Dynamic Query Widgets*):**
   * Controles deslizantes (*sliders*) para rangos de fecha y % de IA, junto con selectores de etiquetas, para ajustar instantáneamente lo que se visualiza sin recargar la página.

---



Para integrar los **KPIs y todas las métricas secundarias** del esquema de 22 columnas de **StudyTracker v3.2 / v4.0**, el diseño debe garantizar que ningún dato quede aislado ni se pierda al navegar entre pestañas.

Siguiendo el marco de **Tamara Munzner** (*Faceted Views* y *Overview first*) y la arquitectura analítica estilo Power BI, la solución óptima es implementar un **Banner Persistente de KPIs Globales** en la cabecera superior, complementado con **Tarjetas Métricas Dinámicas** que reaccionan cuando filtras o seleccionas una columna específica.

---

### 1. Banner Superior de KPIs Globales (Persistent Header Panel)

En la parte superior del dashboard (fijo por encima de las pestañas) se ubica una barra con los **5 KPIs Macro del Sistema**. Este banner nunca desaparece y **reacciona dinámicamente** si aplicas filtros de fecha o selecciones cruzadas:

1. **Progreso RPG (Nivel 1–99):** Nivel actual, XP Total Acumulado y barra de progreso hacia el Nivel 92 (50% del XP) o Nivel 99.
2. **Volumen de Estudio:** Horas totales acumuladas en el periodo seleccionado y promedio de minutos por día.
3. **Índice de Autonomía Cognitiva:** Porcentaje de bloques realizados con *Generación Propia* vs. *Delegación Pasiva*.
4. **Rendimiento & Éxito:** Calidad FSRS Promedio (1 a 4) y Porcentaje de `Objetivo_Cumplido` (%).
5. **Estado de Deuda Cognitiva Global:** Píldora de estado predominante (*Nulo, Bajo, Moderado, Crítico*).

---

### 2. Dónde viven y cómo se agrupan los KPIs específicos por Pestaña

Para cubrir las **22 columnas** y sus métricas derivadas sin saturar la vista, cada pestaña incluye un bloque de tarjetas métricas (*KPI Cards*) enfocadas en su dominio:

#### 📌 Pestaña 1: Progresión RPG & Panorama Circadiano

* **KPI 1: Eficiencia de Tiempo:** Total de sesiones registradas y duración promedio por bloque (ej. 45 min).
* **KPI 2: Racha & Constancia (Streak):** Días consecutivos con al menos 1 bloque registrado y día de la semana con mayor volumen.
* **KPI 3: Ventana Circadiana Óptima:** Franja horaria con mayor XP/hora generado (*Mañana, Tarde, Noche, Madrugada*).

#### 🧠 Pestaña 2: Salud Cognitiva, IA & Deuda Cognitiva

* **KPI 4: Apalancamiento con IA:** Porcentaje medio de uso de IA (`Uso_IA_Porcentaje`) y modo de diseño predominante (`Modo_Diseno_IA`).
* **KPI 5: Fricción & Procesamiento Efectivo:** Ratio de sesiones en *Extracción Esforzada* vs. *Copia Pasiva* o *Reconocimiento Fluido*.
* **KPI 6: Brecha de Intención:** Porcentaje de bloques donde la estrategia real difirió de la intención inicial.

#### 📈 Pestaña 3: Algoritmos FSRS & Consolidación Memórica (DSR)

* **KPI 7: Distribución FSRS:** Proporción de calificaciones recibidas en los repasos (1 · *Again*, 2 · *Hard*, 3 · *Good*, 4 · *Easy*).
* **KPI 8: Ratio de Intercalación:** Porcentaje de bloques en `Práctica Intercalada` vs. `Bloqueada` y tasa de *Fricción Productiva* (+5% XP).
* **KPI 9: Retención Teórica Estimada (\\(R\\)):** Probabilidad media de recuerdo sobre los temas repasados en el periodo.

---

### 3. ¿Qué pasa al seleccionar UNA sola columna en el "Inspector Profundo" (Estilo Power BI)?

Al abrir la pestaña **Inspector Profundo por Dimensión** y seleccionar una variable específica en el desplegable (ej. `Materia = Snowflake`, `Tipo_Actividad = 💻 Desarrollo` o `Dominio_Previo`), el panel genera automáticamente un **cuadro de 4 KPIs dinámicos contextuales**:

```
+-----------------------------------------------------------------------------------+
|  DIMENSIÓN SELECCIONADA: [ Materia: Snowflake                                 v ] |
+-------------------------------+-------------------------------+-------------------+
| 📊 VOLUMEN DE ESTUDIO         | 🧠 SALUD COGNITIVA & IA       | ⚡ RENDIMIENTO    |
| 34.5 hrs (28% del total)      | 15% Uso IA Promedio           | 3.4 / 4.0 FSRS    |
| 42 Sesiones registradas       | Deuda Cognitiva: Nulo/Bajo    | +4,850 XP Ganados |
+-------------------------------+-------------------------------+-------------------+
| 🌱 PROGRESIÓN DE DOMINIO PREVIO                                                   |
| De 'En Construcción' (60%) ➔ 'Consolidado' (40%)                                  |
+-----------------------------------------------------------------------------------+
```

#### Comportamiento según el tipo de columna seleccionada:

1. **Si seleccionas una Variable Categórica (`Materia`, `Tipo_Actividad`, `Contexto`, `Dominio_Previo`):**

   * **Volumen:** Horas dedicadas y porcentaje que representa del total de tu historial.
   * **Rendimiento FSRS/XP:** Calidad media FSRS y XP acumulado en esa categoría.
   * **Uso de IA & Deuda:** Porcentaje promedio de IA y nivel de deuda cognitiva específico de esta variable.
   * **Evolución:** Transición del nivel de dominio (de *Nuevo* a *Consolidado*).
2. **Si seleccionas una Variable Numérica / Continua (`Uso_IA_Porcentaje`, `Duracion_Minutos`):**

   * **Estadística Descriptiva:** Promedio, mediana, valor mínimo y valor máximo del rango.
   * **Impacto en FSRS:** Calidad promedio observada dentro de ese rango de valores.
   * **Muestreo:** Cantidad de bloques de estudio que cumplen con esa condición.
3. **Si seleccionas el campo de Notas (`[Subtema]`):**

   * **Subtemas Detectados:** Número de subtemas únicos analizados en las notas.
   * **Subtema Crítico:** El subtema que acumula la menor calidad FSRS o la mayor fricción de aprendizaje.

---

### 4. Matriz Resumen del Dashboard Completo

| Componente                       | Rol en el Dashboard                                                    | Interacción & Filtrado                                                                      |
| :------------------------------- | :--------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| **Header Fijo**            | KPIs Globales (Nivel RPG, Horas, Autonomía, FSRS, Deuda).             | Se actualiza en tiempo real al cambiar filtros de fecha o selectores.                        |
| **Pestañas 1 a 3**        | Visualización estructurada por temas (Panorama, IA/Cognición, FSRS). | Muestra gráficos específicos y métricas agregadas por tema.                               |
| **Pestaña 4 (Inspector)** | Vista individual de una sola columna/atributo.                         | Al hacer clic en un valor, realiza *Cross-Filtering* (resaltado cruzado) en todo el panel. |

---

¿Te gustaría que prepare una maqueta visual en código (HTML/CSS) o un script de prototipo para la barra superior de KPIs y la pestaña del Inspector?
