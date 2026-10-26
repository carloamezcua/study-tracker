
---

### Parte 1: ¿Qué hacer con los datos que ya tienes? (Estrategia de Migración)

En este refactor van a ocurrir **4 transformaciones exactas** sobre las 20 columnas actuales de `data/study-tracker.csv` para dejarlas en el nuevo esquema de **19 columnas** (`-Tema`, `-Modo_IA`, `+Dominio_Final`, y `Produccion_Propia` evolucionada a `Dinamica_Cognitiva`):

| Cambio en el CSV                   | Cómo se migran tus filas actuales automáticamente                                                                                                                                       | ¿Necesitas revisar algo a mano?                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **1. `Tema` se une a `Notas**` | Si `Tema` tenía `"GANs"` y `Notas` tenía `"Mesa redonda"`, la nueva columna `Notas` queda como `"[GANs] Mesa redonda"` (si `Notas` estaba vacía, solo queda `"GANs"`). | **Nada.** No pierdes ni una letra de texto libre. |

 |
| **2. `Tipo_Actividad` (de 7 a 6 chips)** | Toda fila que tenía `📖 Teoría / Docs` o `💬 Investigación / Diálogo` se convierte automáticamente en **`📖 Estudio Teórico / Conceptual`**. `✍️ Diseño / Apuntes` pasa a **`✍️ Síntesis / Documentación`**. Las otras 4 quedan idénticas.

 | **Casi nada.** Solo si en alguna sesión hiciste una *Cheatsheet* y la habías puesto como Teoría (aunque ya reclasificaste las 5 de *Cheatsheet* en la Tanda 2).

 |
| **3. `Produccion_Propia` + `Modo_IA` → `Dinamica_Cognitiva**` | Regla automática:

• Si era `👀 Consumo` → **`👀 Recepción Pasiva`**.

<br>

• Si era `📋 Reproducción` o `🤖 Mecánico / Copy-Paste` → **`🤖 Delegación / Reproducción`**.

<br>

• Si era `🧠 Generación propia` + (`💬 Diálogo` o `🛠️ Copiloto` con `IA >= 25%`) → **`🔄 Andamiaje / Co-creación`**.

<br>

• Si era `🧠 Generación propia` + `🧠 Autónomo` (o `IA < 25%`) → **`🧠 Generación Propia`**.

 | **Revisión de 1 minuto:** Como tienes pocos registros, puedes mirar la columna en la interfaz y con el botón de editar (`✏️`) ajustar si alguna de `Generación Propia` fue más bien `Co-creación` (como la de GANs).

 |
| **4. Nueva columna `Dominio_Final**` | Regla de imputación inicial:

• Si `Objetivo_Cumplido === "Sí"` y `Calidad >= 4`, sube 1 nivel respecto a `Dominio_Previo` (de `🌱 Nuevo` pasa a `🌿 Con lagunas`, y si era `🌿` o `🌳` se mantiene o sube si `Calidad === 5`).

<br>

• Si fue `"Parcial"` o `"No"`, se queda igual que `Dominio_Previo`.

 | **Sí vale la pena un vistazo rápido:** Como tú te acuerdas perfecto de tus sesiones recientes, en 2 minutos puedes confirmar si realmente sentiste que subiste de nivel de dominio en cada una.

 |

---

### Parte 2: La Mejor Ruta de Refactorización (En 5 Fases sin romper la app)

Basado en el diagrama de arquitectura de tu `README.md` (`metrics.js` → `excel-sync.js` → `store.js` → `index.html / dashboard.js / charts.js` → `i18n.js`), el orden ideal es **de adentro hacia afuera (Domain-First)**. Así la app nunca deja de funcionar mientras programas:

---

#### 🛡️ Fase 0: Respaldo de Seguridad (2 minutos)

Antes de tocar código, aprovecha para cumplir el tercer punto de prioridad alta de tu `IDEAS.md`:

1. Haz una copia de `data/study-tracker.csv` a `data/backups/study-tracker-v2-backup.csv`.
2. *(Opcional pero recomendado)* En `server.js`, agrega 3 líneas dentro del endpoint `PUT /api/csv` para que antes de sobrescribir `data/study-tracker.csv`, copie la versión anterior en `data/backups/YYYY-MM-DD.csv`.

---

#### 🧠 Fase 1: Capa de Dominio (`js/domain/metrics.js`)

Es el corazón matemático y no depende del HTML. Aquí actualizas las constantes y fórmulas:

1. **Actualizar los catálogos canónicos:**

* `ACTIVIDADES`: Dejar las 6 limpias (`Clase / Cátedra`, `Estudio Teórico / Conceptual`, `Síntesis / Documentación`, `Desarrollo / Código`, `Práctica / Debugging`, `Repaso / Simulacro`).
* Reemplazar `PRODUCCION_PROPIA` y `MODOS_IA` por `DINAMICA_COGNITIVA`:
* `Recepción Pasiva` (`0%` ajuste XP)
* `Delegación / Reproducción` (`-15%` XP si `Uso_IA_Porcentaje >= 50`, `0%` si es menor)
* `Andamiaje / Co-creación` (`+5%` XP)
* `Generación Propia` (`+10%` XP — o `+5%` base y `+10%` si `Uso_IA === 0%` para premiar la autonomía).
* Agregar el cálculo de **Salto de Dominio ($\Delta$)** comparando `Dominio_Previo` (`1, 2, 3`) contra `Dominio_Final` (`1, 2, 3`) para tu métrica de *Progreso Real vs. Tiempo Invertido*.

2. **Aprovechar que tienes abierto `metrics.js` para un *Quick Win* de `IDEAS.md`:**

* Corregir en 1 línea la función de `Franja_Horaria` para que `00:00 a 07:59` sea formalmente `Madrugada`.

---

#### 🔄 Fase 2: Sincronización y Migración Automática (`js/services/excel-sync.js` y `js/state/store.js`)

Aquí defines el nuevo encabezado de **19 columnas** para el CSV:

```text
Fecha,Dia_Semana,Hora_Inicio,Hora_Fin,Franja_Horaria,Contexto,Materia,Tipo_Actividad,Dinamica_Cognitiva,Uso_IA_Porcentaje,Dominio_Previo,Dominio_Final,Energia_Previa,Complejidad,Objetivo_Cumplido,Duracion_Minutos,Calidad,XP_Ganados,Notas

```

* **El truco limpio en el Parser de `excel-sync.js`:**
  Haz que la función que lee el CSV detecte el encabezado:
* Si lee el encabezado viejo de **20 columnas** (o desde `localStorage` en `store.js`), aplica al vuelo la tabla de conversión de la **Parte 1** y recalcula `XP_Ganados` con `metrics.js`.
* En cuanto guardes o edites cualquier sesión, `excel-sync.js` ya escribirá el archivo `data/study-tracker.csv` limpio con las **19 columnas nuevas**. ¡Migración completada sin scripts externos!

---

#### 🎨 Fase 3: Refactor del Formulario en 2 Tiempos (`index.html`, `js/ui/dashboard.js`, `js/app.js`)

Aquí es donde eliminas la fricción de registro y aplicas las mejoras de UX:

1. **Agrupar visualmente el formulario en 2 tarjetas/bloques claros:**

* **Bloque A — "🎯 Punto de Partida (Al Iniciar)"**:
* `Contexto` (4 chips).
* `Materia` (En vez de `<input>` de texto, `dashboard.js` extrae un `Set` con las materias únicas de tu historial y renderiza chips clicables + un chip `[+ Nueva]` que despliega el input solo cuando empiezas una materia inédita).
* `Complejidad del Material` (`🟢 Básico`, `🟡 Técnico`, `🔴 Avanzado`).
* `Dominio_Previo` (`🌱 Nuevo`, `🌿 Con lagunas`, `🌳 Dominado`) y `Energia_Previa`.
* **Bloque B — "🏁 Evaluación del Bloque (Al Terminar)"**:
* `Tipo_Actividad` (6 chips).
* `Dinamica_Cognitiva` (4 chips) + `Uso_IA_Porcentaje`.
* `Dominio_Final` (`🌱 Sigue verde`, `🌿 Comprendido`, `🌳 Dominado`).
* `Fluidez (Objetivo_Cumplido)` (`✅`, `⚠️`, `❌`), `Calidad (1-5)` y `Notas` (donde antes ponías `Tema` + `Notas`).

2. **Valores por defecto inteligentes (`IDEAS.md`):**

* Al cargar la página o terminar de guardar una sesión, en lugar de resetear el formulario en blanco, deja pre-seleccionados el último `Contexto`, `Materia`, `Complejidad` y `Dominio_Final` (que pasa a ser automáticamente tu nuevo `Dominio_Previo` para el siguiente Pomodoro del mismo tema).
* *Fíjate en ese detalle:* Si haces 3 Pomodoros seguidos de GANs, el `Dominio_Final` del Pomodoro 1 se convierte automáticamente en el `Dominio_Previo` del Pomodoro 2.

---

#### 📊 Fase 4: Actualizar Gráficos y Textos (`js/ui/charts.js` e `js/ui/i18n.js`)

1. **En `js/ui/charts.js`:**

* En la **Pestaña 3 (Cuadrante Cognitivo IA)** y **Pestaña 4 (Balance Consumo/Producción)**, cambiar las referencias de `Produccion_Propia` y `Modo_IA` para que lean la nueva columna unificada `Dinamica_Cognitiva`.
* En la **Curva de Dominio del Inspector de Materia**, ahora puedes graficar no solo cómo entraste (`Dominio_Previo`), sino cómo evolucionó tu `Dominio_Final` sesión tras sesión.
* En el **Inspector de Subtemas/Notas**, como `Tema` ahora vive dentro de `Notas`, el buscador filtra directamente sobre `Notas`.

2. **En `js/ui/i18n.js` y `README.md`:**

* Actualizar las descripciones de las tarjetas de ayuda en español e inglés para reflejar los 6 tipos de actividad y las 4 dinámicas cognitivas.

---

### 📋 Resumen del Esfuerzo

| Fase                                | Archivos que tocas                                                             | Tiempo estimado |
| ----------------------------------- | ------------------------------------------------------------------------------ | --------------- |
| **1. Dominio + Migrador CSV** | `js/domain/metrics.js`, `js/services/excel-sync.js`, `js/state/store.js` |                 |

 | ~45 min |
| **2. Formulario y Chips de Materia** | `index.html`, `js/ui/dashboard.js`, `js/app.js`

 | ~1 hora |
| **3. Gráficos y Traducciones** | `js/ui/charts.js`, `js/ui/i18n.js`

 | ~45 min |
| **4. Revisión visual de tus filas** | Desde la propia tabla de la app (botón `✏️`)

 | ~5 min |

