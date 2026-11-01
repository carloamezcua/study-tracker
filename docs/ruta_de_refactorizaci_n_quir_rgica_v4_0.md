# 🗺️ Ruta de Refactorización Quirúrgica: StudyTracker v3.1 $\to$ v4.0

> **Propósito de este documento:** Servir como manual de ingeniería paso a paso para evolucionar `study-tracker` desde una arquitectura en Vanilla JS basada en archivos CSV (v3.1) hacia una aplicación **Local-First con tipado estricto (TypeScript), persistencia relacional (SQLite), pruebas unitarias (Vitest) e interfaz reactiva (React + Vite)** impulsada por el modelo de memoria **DSR/FSRS** y auditoría automatizada de **Deuda Cognitiva**.

---

## 🧠 Manifiesto Anti-Vibecoding: Reglas de Ingeniería Supervisada

Para dejar de programar por inercia o delegación ciega a la IA y evitar la misma deuda cognitiva que tu aplicación mide, aplicarás el siguiente protocolo en cada casilla (`[ ]`) de este documento:

1. **Prohibido pedir "archivos completos mágicos":** Nunca le pidas a la IA *"hazme la Fase 2 completa"*. Avanza **una sola casilla a la vez**.
2. **El contrato va primero:** Antes de escribir la lógica de una función, escribe tú mismo (o diseña con ayuda socrática) los **tipos de entrada y de salida** (Interfaces de TypeScript).
3. **La prueba de explicación (Feynman):** No marques una casilla como completada `[x]` si no puedes explicar con tus propias palabras qué hace cada línea del bloque que acabas de integrar.
4. **Prompt de Andamiaje Recomendado:** Cuando uses IA para resolver un paso de esta guía, usa esta estructura:

   > *"Estoy en la Fase X, Punto Y de mi guía de refactorización. Actúa como tutor de ingeniería de software: explícame primero el concepto detrás de este paso, muéstrame únicamente el bloque de código necesario para este punto y hazme 2 preguntas para verificar que entendí cómo funciona antes de pasar al siguiente."*

---

## 🔬 Radiografía de Transición: ¿Qué cambia de la v3.1 a la v4.0?

No vas a tirar tu proyecto a la basura. Tu lógica de negocio, tus fórmulas de experiencia RPG, tus franjas circadianas de 6 horas y la ergonomía del formulario en 2 tiempos son el activo más valioso del sistema. Lo que haremos será **trasplantar ese cerebro a un esqueleto industrial**.

| Archivo / Componente Actual (v3.1) | Destino en la v4.0 | Acción Quirúrgica y Justificación Técnica |
|:--- |:--- |:--- |
| `js/domain/metrics.js` | ♻️ **Se transforma** $\to$ `src/domain/metrics.ts` y `src/domain/fsrs.ts` | Se conserva la curva exponencial de niveles ($1\text{ a }99$), franjas de $6\text{ h}$ y bonos de XP. Se le añade tipado estricto y se separa el nuevo motor matemático DSR/FSRS en su propio archivo. |
| `data/study-tracker.csv` | ♻️ **Evoluciona** $\to$ `data/study-tracker.db` (SQLite) | El CSV deja de ser la base de datos principal para evitar sobrescribir todo el disco en cada clic y permitir consultas relacionales. Se mantiene un exportador/importador CSV para compatibilidad con Excel y Pandas. |
| `js/services/excel-sync.js` | 🗑️ **Se elimina** $\to$ Reemplazado por `src/server/db/migrate.ts` y `src/client/services/api.ts` | Ya no necesitas parsear texto RFC 4180 en el navegador en cada acción. La lógica de migración histórica se mueve a un script único de base de datos en el servidor. |
| `server.js` | ♻️ **Se transforma** $\to$ `src/server/index.ts` | Pasa de ser un lector/escritor de texto plano (`GET/PUT /api/csv`) a una API REST local conectada a SQLite con respaldos diarios automáticos (`.db`). |
| `js/state/store.js` | 🗑️ **Se elimina** $\to$ Reemplazado por Estado de React / Custom Hooks | El patrón Pub/Sub manual y la sincronización artesanal con `localStorage` son sustituidos por el ciclo de vida declarativo de React y llamadas limpias a la API local. |
| `js/app.js` y `js/ui/dashboard.js` | 🗑️ **Se eliminan y reconstruyen** $\to$ `src/client/components/*` | Se elimina la manipulación imperativa del DOM (`document.getElementById`, `.innerHTML`) que causa bugs silenciosos. Se divide en componentes pequeños y aislados. |
| `js/ui/timer.js` | ♻️ **Se transforma** $\to$ `src/client/hooks/useStudyTimer.ts` | La lógica exacta de tiempo activo neto (`transcurridoMs` descontando pausas) se conserva intacta, pero encapsulada en un Hook reutilizable. |
| `js/ui/charts.js` | ♻️ **Se transforma** $\to$ `src/client/components/analytics/*` | Conservas tus 4 pestañas analíticas, ahora alimentadas por consultas SQL directas y tipadas. |
| `js/ui/i18n.js` | ♻️ **Se conserva y tipa** $\to$ `src/client/i18n/dictionaries.ts` | Tus diccionarios Español/Inglés se conservan, agregando autocompletado de claves con TypeScript para que nunca falte una traducción. |

---

## 🏗️ FASE 1: Preparación del Entorno, Respaldo y Andamiaje Moderno

**Objetivo:** Congelar y proteger tu versión 3.1 funcional, configurar las herramientas de compilación modernas (Node.js, Vite, TypeScript, Vitest) y crear la nueva estructura de carpetas sin romper lo que ya tienes.
**Conceptos de ingeniería que aprenderás:** Control de versiones por ramas (Git Branching), gestores de paquetes (`npm`), compilación estática (`tsconfig.json`) y separación Cliente/Servidor.

### 1.1 Respaldo y Aislamiento en Git

- [ ] **Verificar estado limpio en Git:** Abre tu terminal en la carpeta del proyecto y ejecuta `git status`. Si tienes cambios sueltos de la v3.1, guárdalos con `git add .` y `git commit -m "chore: snapshot estable v3.1 pre-refactor v4"`.
- [ ] **Crear respaldo físico de tus datos reales:** Copia manualmente tu archivo `data/study-tracker.csv` actual y pégalo en `data/backups/study-tracker-v3-master-backup.csv`. **Regla de oro:** Este archivo jamás se modifica; será nuestra fuente para migrar tu historial a SQLite en la Fase 4.
- [ ] **Crear la rama de desarrollo v4:** Ejecuta `git checkout -b feat/v4-typescript-sqlite` (o utiliza `git worktree add ../study-tracker-v4 -b feat/v4-typescript-sqlite` si deseas mantener dos carpetas independientes). Todo el trabajo ocurrirá aquí; si algo sale mal, tu rama `main` sigue intacta.

### 1.2 Inicialización de Dependencias y TypeScript

- [ ] **Revisar o inicializar `package.json`:** Si no tienes un `package.json` formal, ejecuta `npm init -y`.
- [ ] **Instalar el núcleo de desarrollo (TypeScript + Vite + Vitest):**
  Ejecuta en tu terminal:

  ```bash
  npm install -D typescript vite vitest @types/node tsx
  ```

  *Nota de aprendizaje:* `typescript` es el compilador que verificará tus tipos; `vite` empaqueta el frontend ultrarrápido; `vitest` ejecutará tus pruebas matemáticas; `tsx` permite ejecutar archivos `.ts` en Node.js directamente sin configuraciones complejas.

- [ ] **Instalar librerías de Frontend (React) y Base de Datos (SQLite):**
  Ejecuta en tu terminal:

  ```bash
  npm install react react-dom better-sqlite3 chart.js
  npm install -D @types/react @types/react-dom @types/better-sqlite3 @vitejs/plugin-react
  ```

  *Nota de aprendizaje:* `better-sqlite3` es el motor SQLite más rápido y estable para Node.js porque funciona de manera síncrona (sin complicarte con promesas anidadas al hacer consultas locales).

### 1.3 Configuración del Compilador (`tsconfig.json`)

- [ ] **Crear el archivo `tsconfig.json` en la raíz del proyecto:**
  Configúralo con las siguientes reglas clave y comprende para qué sirve cada una:
  - `"target": "ES2022"` (Usa JavaScript moderno).
  - `"strict": true` (**Crucial para dejar de vibecodear:** prohíbe variables sin tipo `any` implícito y te obliga a verificar cuando un dato puede ser `null` o `undefined`).
  - `"jsx": "react-jsx"` (Permite escribir componentes visuales con sintaxis HTML dentro de TypeScript).

- [ ] **Crear la nueva estructura de directorios:**
  Crea las siguientes carpetas vacías en la raíz de tu proyecto (deja la carpeta `js/` antigua quieta por ahora para consultar tu código v3 mientras migramos):

  ```text
  src/
  ├── domain/          # Fórmulas puras, tipos canónicos, FSRS y XP (Compartido entre Front y Back)
  ├── server/          # Nuevo servidor Node.js + SQLite
  │   └── db/          # Esquema SQL, conexión y script de migración CSV -> SQLite
  └── client/          # Nueva interfaz en React + TypeScript
      ├── components/  # Formulario en 2 etapas, Cronómetro, Gráficos
      ├── hooks/       # Lógica del temporizador y estado de sesión
      ├── services/    # Cliente HTTP para hablar con tu servidor local
      └── i18n/        # Diccionarios ES/EN tipados
  tests/               # Pruebas automatizadas con Vitest
  ```

---

## 🧬 FASE 2: El Corazón del Sistema — Capa de Dominio y Tipos Estrictos

**Objetivo:** Traducir la estructura de datos científica en dos tiempos (Tiempo 1: Intención previa / Tiempo 2: Evaluación metacognitiva) a contratos estrictos de TypeScript y migrar las matemáticas de `js/domain/metrics.js`.
**Conceptos de ingeniería que aprenderás:** Modelado de Dominio (DDD básico), Tipos Unión y Enumeraciones (`type` vs `enum`), Interfaces de Datos y Funciones Puras (funciones que ante la misma entrada siempre devuelven la misma salida sin efectos secundarios).

### 2.1 Definición del Vocabulario Canónico (`src/domain/types.ts`)

- [ ] **Crear `src/domain/types.ts` y definir las Taxonomías Ortogonales definitivas:**
  En lugar de usar cadenas de texto sueltas (que provocan errores si escribes `'En construccion'` sin tilde en un archivo y con tilde en otro), define tipos literales estrictos con la nueva taxonomía de cuatro estrategias planificadas:
  - `DominioPrevio`: `'Nuevo' | 'En_Construccion' | 'Consolidado'`
  - `EstructuraPractica`: `'Bloqueado' | 'Intercalado'` *(Smart Default operativo fijo en `'Bloqueado'`)*
  - `EstrategiaTecnica`:
    - `'Recuperacion_Activa'` *(Recordar y codificar a ciegas: flashcards, ejercicios sin ayuda, autoexplicación)*
    - `'Construccion_Generativa'` *(Creación propia: redacción de arquitectura, apuntes estructurados, lógica desde cero)*
    - `'Consumo_Receptivo'` *(Lectura de documentación, videos, clases grabadas o revisión de código ajeno — sustituye a Lectura Pasiva)*
    - `'Delegacion_Ejecutiva'` *(Uso de IA o generadores para resolver scripts, entregables o tareas contra reloj)*
  - `ModoDisenoIA`: `'Sin_IA' | 'Tutor_Andamiaje' | 'Generacion_Automatica'`
  - `CalificacionFSRS`: `1 | 2 | 3 | 4` *(1 = Again, 2 = Hard, 3 = Good, 4 = Easy)*
  - `DinamicaCognitivaReal`: `'Recepcion_Pasiva' | 'Delegacion_Mecanica' | 'Andamiaje_Cocreacion' | 'Generacion_Propia'`
  - `IndiceDeudaCognitiva`: `'Nulo' | 'Bajo' | 'Moderado' | 'Critico'`
  - `ModalidadProcesamiento`: `'Extraccion_Esforzada' | 'Reconocimiento_Fluido' | 'Copia_Pasiva'`
  - `FriccionIntercalada`: `'Sin_Friccion' | 'Friccion_Productiva' | 'Confusion_Excesiva'`
  - `CalidadFluidez`: `'Flujo_Limpio' | 'Lucha_Productiva' | 'Con_Friccion' | 'Paralisis_Abandono'`
  - `FranjaHoraria`: `'Madrugada' | 'Manana' | 'Tarde' | 'Noche'`

  > **Regla de negocio sobre `ModoDisenoIA` vs. `DinamicaCognitivaReal`:** Ambos campos se mantienen separados e independientes. No existe conflicto si seleccionas `'Sin_IA'` al inicio y terminas eligiendo `'Andamiaje_Cocreacion'` al final: esa discrepancia entre intención previa y ejecución real (*Intention-Action Gap*) es precisamente la métrica conductual que el sistema auditará.

- [ ] **Definir las Interfaces de los "Dos Tiempos" en `src/domain/types.ts`:**
  - Crear `interface ConfiguracionPrevia` (Tiempo 1): Contiene `materia_contexto`, `dominio_previo`, `estabilidad_acumulada_s`, `recuperabilidad_estimada_r`, `estructura_practica`, `estrategia_tecnica_planificada` y `modo_diseno_ia`.
  - Crear `interface EvaluacionBloque` (Tiempo 2): Contiene `duracion_neta_minutos`, `calificacion_respuesta_grade`, `dinamica_cognitiva_real`, `uso_ia_porcentaje`, `indice_deuda_cognitiva` (calculado automáticamente), `modalidad_procesamiento_efectiva`, `friccion_discriminacion_intercalada: FriccionIntercalada | null` (permite `null` cuando la sesión fue `'Bloqueado'`), `calidad_asimilacion_fluidez` y `notas?: string` (opcional para conservar tu funcionalidad de `[Subtema]`).
  - Crear `interface SesionEstudioCompleta`: Extiende ambas interfaces (`ConfiguracionPrevia` y `EvaluacionBloque`) y añade los metadatos generados por el sistema: `id_sesion`, `fecha_registro`, `franja_horaria`, `dificultad_item_d`, `estabilidad_posterior_s` y `xp_ganados`.

### 2.2 Implementación del Motor de Memoria DSR / FSRS (`src/domain/fsrs.ts`)

- [ ] **Crear `src/domain/fsrs.ts` e implementar el cálculo de Recuperabilidad $R(t)$:**
  Programa una función pura `calcularRecuperabilidad(diasTranscurridos: number, estabilidadS: number): number` que aplique la curva de olvido del modelo FSRS-4.5/v5:
  $$R(t, S) = \left(1 + \frac{19}{81} \cdot \frac{t}{S}\right)^{-0.5}$$
  *Regla de negocio a validar:* Cuando los días transcurridos $t$ son exactamente iguales a la estabilidad $S$, la función debe devolver $0.90$ ($90\%$ de probabilidad de recuerdo). Si es un tema `'Nuevo'` sin historial, $R$ inicia en $0.00$ y $S$ inicia en el valor base $S_0$.
- [ ] **Implementar la actualización de Dificultad ($D'$) y Nueva Estabilidad ($S'$) post-sesión:**
  Programa la función `actualizarEstadoMemoria(estadoActual: { s: number, d: number }, grade: CalificacionFSRS, diasTranscurridos: number)` que reciba la calificación del 1 al 4 al terminar el bloque de estudio y devuelva la nueva estabilidad $S'$ (en días) y la nueva dificultad $D' \in [1, 10]$.

### 2.3 Migración y Evolución de Métricas RPG y Cognitivas (`src/domain/metrics.ts`)

- [ ] **Migrar cálculo de Franja Horaria Circadiana:**
  Pasa tu función de franjas de 6h desde `js/domain/metrics.js` a `src/domain/metrics.ts` tipando la entrada (`Date` o string `HH:MM`) y la salida (`FranjaHoraria`).
- [ ] **Implementar el Calculador Automático de Deuda Cognitiva:**
  Para ahorrar al usuario contestar una pregunta redundante al terminar, crea una función determinista `calcularIndiceDeudaCognitiva(usoIaPorcentaje: number, dinamica: DinamicaCognitivaReal, modalidad?: ModalidadProcesamiento): IndiceDeudaCognitiva` que pre-calcule e impute automáticamente la atrofia potencial:
  - Si `dinamica === 'Generacion_Propia'` y `usoIaPorcentaje <= 10` $\to$ `'Nulo'`.
  - Si `dinamica === 'Andamiaje_Cocreacion'` y `modalidad === 'Extraccion_Esforzada'` $\to$ `'Bajo'`.
  - Si `usoIaPorcentaje >= 50` y `modalidad === 'Reconocimiento_Fluido'` $\to$ `'Moderado'`.
  - Si `dinamica === 'Delegacion_Mecanica'` o (`usoIaPorcentaje >= 75` y `modalidad === 'Copia_Pasiva'`) $\to$ `'Critico'`.
- [ ] **Migrar y adaptar la Fórmula de XP y Curva Exponencial (Niveles 1–99):**
  Traslada la función de XP de tu `js/domain/metrics.js` adaptándola a las nuevas variables (considerando que si `friccion_discriminacion_intercalada` es `null`, su bono es $0$):
  $$\text{XP} = \text{Math.round}\Big(\text{Duracion} \times \max\big(0.5,\ 1 + \text{Grade}\times 0.25 + \text{BonoFluidez} + \text{BonoDinamica} + \text{BonoFriccionIntercalada}\big)\Big)$$
  Conserva intacta tu ecuación de nivel estilo RuneScape:
  $$\text{XP}(L) = \text{Math.round}\left(250 \times \left(2^{\frac{L-1}{7}} - 1\right)\right)$$
- [ ] **Migrar el extractor de `[Subtema]` en Notas:**
  Traslada la expresión regular que extrae `[Subtema]` del campo de notas para que siga alimentando tu Inspector de Temas sin requerir columnas extra.

---

## 🧪 FASE 3: Blindaje Matemático — Pruebas Unitarias con Vitest

**Objetivo:** Comprobar que el "cerebro" de tu aplicación (Fase 2) no tiene ningún error antes de conectarlo a la base de datos o a la pantalla.
**Conceptos de ingeniería que aprenderás:** Desarrollo guiado por pruebas (Unit Testing), aserciones (`expect().toBe()`), casos borde (Edge Cases).

- [ ] **Crear `tests/fsrs.test.ts`:**
  Escribe pruebas automatizadas para verificar que:
  1. Si $t = 0$ días desde el último repaso, $R(t, S)$ es igual a $1.00$ ($100\%$).
  2. Si $t = S$ días (por ejemplo, $S = 10$ días y han pasado $10$ días), $R(10, 10)$ es aproximadamente $0.90$.
  3. Calificar una sesión con `Grade = 4 (Easy)` incrementa la estabilidad $S'$ mucho más que `Grade = 2 (Hard)`, mientras que `Grade = 1 (Again)` reduce la estabilidad $S'$ por olvido.
- [ ] **Crear `tests/metrics.test.ts`:**
  Escribe pruebas para verificar que:
  1. El nivel 92 requiere exactamente alrededor del $50\%$ de la experiencia total del nivel 99.
  2. Una sesión con `Lucha_Productiva` otorga el mismo bono de XP ($+10\%$) que `Flujo_Limpio` (cero sesgo punitivo).
  3. Una sesión con `Delegacion_Mecanica` y $80\%$ de IA aplica la penalización de XP ($-15\%$) y arroja automáticamente un `IndiceDeudaCognitiva` igual a `'Critico'`.
  4. Una sesión en modo `'Bloqueado'` con `friccion_discriminacion_intercalada = null` calcula el XP limpiamente sin errores de nulidad.
- [ ] **Ejecutar la suite de pruebas:**
  Corre `npx vitest run` en la terminal. **Criterio de avance:** No puedes pasar a la Fase 4 hasta que todas las pruebas aparezcan en verde (`PASS`).

---

## 🗄️ FASE 4: Persistencia Relacional Local-First — De CSV a SQLite

**Objetivo:** Crear la base de datos SQLite local, aplicar las restricciones `CHECK` del esquema canónico consolidado y migrar todas tus sesiones históricas del archivo `data/study-tracker.csv` (v3) hacia `data/study-tracker.db` (v4) sin perder un solo minuto de estudio registrado.
**Conceptos de ingeniería que aprenderás:** DDL (Data Definition Language), restricciones de integridad en motor SQL, Vistas SQL (`CREATE VIEW`), transacciones atómicas (`BEGIN / COMMIT`) y ETL básico (Extracción, Transformación y Carga).

### 4.1 Creación del Esquema SQL Consolidado (`src/server/db/schema.sql`)

- [ ] **Crear el archivo `src/server/db/schema.sql`:**
  Escribe la sentencia `CREATE TABLE IF NOT EXISTS sesiones_estudio` integrando la nueva taxonomía de `estrategia_tecnica_planificada`, el valor por defecto `'Bloqueado'` en `estructura_practica` y permitiendo `NULL` en `friccion_discriminacion_intercalada` cuando la sesión sea bloqueada:

  ```sql
  CREATE TABLE IF NOT EXISTS sesiones_estudio (
      id_sesion INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha_registro TIMESTAMP NOT NULL DEFAULT (datetime('now', 'localtime')),
      franja_horaria TEXT NOT NULL CHECK (franja_horaria IN ('Madrugada', 'Manana', 'Tarde', 'Noche')),

      -- TIEMPO 1: Intención previa y parámetros FSRS (Antes de estudiar)
      materia_contexto VARCHAR(50) NOT NULL CHECK (length(materia_contexto) > 0 AND length(materia_contexto) <= 50),
      dominio_previo TEXT NOT NULL CHECK (dominio_previo IN ('Nuevo', 'En_Construccion', 'Consolidado')),
      estabilidad_acumulada_s REAL NOT NULL CHECK (estabilidad_acumulada_s >= 0.1),
      recuperabilidad_estimada_r REAL NOT NULL CHECK (recuperabilidad_estimada_r BETWEEN 0.00 AND 1.00),
      estructura_practica TEXT NOT NULL DEFAULT 'Bloqueado' CHECK (estructura_practica IN ('Bloqueado', 'Intercalado')),
      estrategia_tecnica_planificada TEXT NOT NULL CHECK (estrategia_tecnica_planificada IN (
          'Recuperacion_Activa',
          'Construccion_Generativa',
          'Consumo_Receptivo',
          'Delegacion_Ejecutiva'
      )),
      modo_diseno_ia TEXT NOT NULL CHECK (modo_diseno_ia IN ('Sin_IA', 'Tutor_Andamiaje', 'Generacion_Automatica')),

      -- TIEMPO 2: Métricas de cierre y evaluación metacognitiva (Al finalizar)
      duracion_neta_minutos INTEGER NOT NULL CHECK (duracion_neta_minutos > 0),
      calificacion_respuesta_grade INTEGER NOT NULL CHECK (calificacion_respuesta_grade BETWEEN 1 AND 4),
      dinamica_cognitiva_real TEXT NOT NULL CHECK (dinamica_cognitiva_real IN (
          'Recepcion_Pasiva',
          'Delegacion_Mecanica',
          'Andamiaje_Cocreacion',
          'Generacion_Propia'
      )),
      uso_ia_porcentaje INTEGER NOT NULL CHECK (uso_ia_porcentaje BETWEEN 0 AND 100),
      indice_deuda_cognitiva TEXT NOT NULL CHECK (indice_deuda_cognitiva IN ('Nulo', 'Bajo', 'Moderado', 'Critico')),
      modalidad_procesamiento_efectiva TEXT NOT NULL CHECK (modalidad_procesamiento_efectiva IN (
          'Extraccion_Esforzada',
          'Reconocimiento_Fluido',
          'Copia_Pasiva'
      )),
      friccion_discriminacion_intercalada TEXT DEFAULT NULL CHECK (
          friccion_discriminacion_intercalada IS NULL OR
          friccion_discriminacion_intercalada IN ('Sin_Friccion', 'Friccion_Productiva', 'Confusion_Excesiva')
      ),
      calidad_asimilacion_fluidez TEXT NOT NULL CHECK (calidad_asimilacion_fluidez IN (
          'Flujo_Limpio',
          'Lucha_Productiva',
          'Con_Friccion',
          'Paralisis_Abandono'
      )),

      -- Metadatos Calculados y Notas
      dificultad_item_d REAL NOT NULL DEFAULT 5.0 CHECK (dificultad_item_d BETWEEN 1.0 AND 10.0),
      estabilidad_posterior_s REAL NOT NULL CHECK (estabilidad_posterior_s >= 0.1),
      xp_ganados INTEGER NOT NULL CHECK (xp_ganados >= 0),
      notas TEXT DEFAULT ''
  );
  ```

  *Nota técnica sobre SQLite:* SQLite utiliza `TEXT CHECK (columna IN (...))` para cumplir exactamente la misma función de un `ENUM`, rechazando cualquier valor fuera de tu taxonomía y permitiendo `NULL` explícito en `friccion_discriminacion_intercalada` cuando no aplica.

- [ ] **Crear Índices y Vistas Analíticas en `schema.sql`:**
  - Añade un índice por materia y fecha (`CREATE INDEX IF NOT EXISTS idx_materia_fecha ON sesiones_estudio(materia_contexto, fecha_registro);`) para que calcular el estado FSRS al abrir el formulario tome menos de $1\text{ ms}$.
  - Añade una vista `CREATE VIEW IF NOT EXISTS v_estado_memoria_materias` que obtenga automáticamente la última sesión de cada `materia_contexto` con su `estabilidad_posterior_s` y `dificultad_item_d`.

### 4.2 Conexión y Sistema de Respaldos (`src/server/db/database.ts`)

- [ ] **Crear `src/server/db/database.ts`:**
  Inicializa la conexión con `better-sqlite3` apuntando a `data/study-tracker.db`, activa el modo de alto rendimiento (`PRAGMA journal_mode = WAL;`) y ejecuta el contenido de `schema.sql` al arrancar.
- [ ] **Evolucionar tu ADR-008 (Respaldos Diarios Automáticos):**
  Crea una función `asegurarRespaldoDiario()` dentro de `database.ts`. Antes de la primera inserción, edición o borrado del día, verifica si existe `data/backups/YYYY-MM-DD.db`. Si no existe, usa el método nativo `.backup()` de SQLite para crear una copia exacta y segura en caliente.

### 4.3 Script de Migración Histórica v3 (CSV 18 col) $\to$ v4 (SQLite)

- [ ] **Crear `src/server/db/migrate-v3-to-v4.ts`:**
  Este script leerá tu archivo `data/study-tracker.csv` de 18 columnas fila por fila en orden cronológico y traducirá cada sesión histórica al nuevo esquema aplicando las siguientes **reglas de imputación**:
  1. `Fecha` + `Hora_Inicio` $\to$ se unen en `fecha_registro` formato ISO (`YYYY-MM-DD HH:MM:00`).
  2. `Materia` (o `Contexto: Materia`) $\to$ `materia_contexto`.
  3. `Tipo_Actividad` (v3) $\to$ se mapea a la nueva `estrategia_tecnica_planificada`:
     - *Clase / Cátedra* o *Estudio Teórico* $\to$ `'Consumo_Receptivo'`.
     - *Síntesis / Documentación* o *Desarrollo / Código* $\to$ `'Construccion_Generativa'` (o `'Delegacion_Ejecutiva'` si en esa sesión histórica `Dinamica_Cognitiva` fue *Delegación* con $\ge 75\%$ de IA).
     - *Práctica / Debug* o *Repaso / Simulacro* $\to$ `'Recuperacion_Activa'`.
  4. `Estructura_Practica` e `Intercalado` $\to$ se asigna `'Bloqueado'` por defecto y `friccion_discriminacion_intercalada = NULL`.
  5. `Calidad` (escala 1 a 5 en v3) $\to$ se mapea a `calificacion_respuesta_grade` (escala 1 a 4 FSRS):
     - Calidad $1 \to 1$ (*Again*), Calidad $2 \to 2$ (*Hard*), Calidad $3\text{ o }4 \to 3$ (*Good*), Calidad $5 \to 4$ (*Easy*).
  6. **Simulación retroactiva FSRS:** A medida que el script recorre tus sesiones antiguas de la primera a la última, lleva un registro en memoria de cada materia para calcular dinámicamente qué estabilidad $S$ y qué recuperabilidad $R(t)$ tenías en ese momento histórico.
- [ ] **Ejecutar y verificar la migración:**
  Corre `npx tsx src/server/db/migrate-v3-to-v4.ts`. Verifica en consola que el número de filas insertadas en SQLite coincida exactamente con el número de sesiones de tu CSV v3.

---

## 🌐 FASE 5: Refactorización del Backend — De Servidor de Archivos a API REST

**Objetivo:** Reemplazar el antiguo `server.js` (que leía y sobrescribía todo el CSV en cada petición) por un servidor tipado en `src/server/index.ts` que exponga endpoints granulares e inteligentes.
**Conceptos de ingeniería que aprenderás:** Diseño de APIs RESTful, códigos de estado HTTP (`200`, `201`, `400`, `404`), validación de payloads en el servidor y desacoplamiento entre almacenamiento y transporte.

- [ ] **Crear `src/server/index.ts` conservando tu ligereza:**
  Puedes usar el módulo `http` nativo de Node (como en tu v3) o `express` ligero, pero ahora en TypeScript.
- [ ] **Implementar Endpoint 1: `GET /api/sesiones` (Listado e Historial):**
  Consulta `SELECT * FROM sesiones_estudio ORDER BY fecha_registro DESC` y devuelve el arreglo JSON tipado al frontend.
- [ ] **Implementar Endpoint 2: `GET /api/smart-defaults` (El motor del Tiempo 1):**
  Cuando el usuario abre la aplicación o selecciona una materia en los *Quick-Chips*, este endpoint consulta la última vez que se estudió esa materia en SQLite, calcula cuántos días $t$ han pasado hasta hoy, ejecuta `calcularRecuperabilidad(t, S)` y devuelve en menos de $5\text{ ms}$:
  - La `estabilidad_acumulada_s` actual de esa materia.
  - La `recuperabilidad_estimada_r` exacta al día de hoy (para que veas en pantalla: *"Probabilidad de recuerdo hoy: 84% — Momento óptimo de repaso"*).
  - El `dominio_previo` sugerido según su estabilidad y `estructura_practica` pre-seleccionada en `'Bloqueado'`.
- [ ] **Implementar Endpoint 3: `POST /api/sesiones` (Guardado al finalizar el Tiempo 2):**
  1. Recibe los datos del Tiempo 1 + Tiempo 2 desde el frontend.
  2. Garantiza que si `estructura_practica === 'Bloqueado'`, el campo `friccion_discriminacion_intercalada` se guarde como `null`.
  3. Calcula o verifica en el servidor la nueva estabilidad $S'$, dificultad $D'$, el `indice_deuda_cognitiva` automático y los `xp_ganados` usando tus funciones de `src/domain/` (Fase 2).
  4. Ejecuta `asegurarRespaldoDiario()`.
  5. Inserta la fila en SQLite (`INSERT INTO sesiones_estudio ...`) y devuelve la sesión creada con código HTTP `201 Created`.
- [ ] **Implementar Endpoint 4: `PUT /api/sesiones/:id` y `DELETE /api/sesiones/:id`:**
  Permite editar (✏️) o eliminar (✖) una sesión específica por su `id_sesion` sin tener que reescribir toda la base de datos.
- [ ] **Implementar Endpoint 5: `GET /api/export/csv` (Puente de compatibilidad CSV):**
  Para no perder la ventaja de tu ADR-002 (analizar datos en Python, Pandas o Excel), este endpoint transforma las filas de SQLite en texto CSV RFC 4180 con BOM al vuelo y lo descarga o actualiza `data/study-tracker-export.csv` automáticamente.
- [ ] **Eliminar el archivo obsoleto:** Borra `js/services/excel-sync.js` tras confirmar con pruebas en el navegador o Postman que los 5 endpoints responden correctamente.

---

## ⚡ FASE 6: Reconstrucción del Frontend Reactivo (Flujo en 2 Tiempos)

**Objetivo:** Sustituir la manipulación manual del DOM (`js/app.js`, `js/state/store.js`, `js/ui/*`) por una arquitectura limpia de componentes en React + TypeScript donde el estado de la sesión esté gobernado por una Máquina de Estados Finita y reglas de condicionalidad sin fricción.
**Conceptos de ingeniería que aprenderás:** Máquina de Estados en UI, Custom Hooks en React, Props tipadas, separación entre Componentes Contenedores (lógica) y Presentacionales (visuales).

### 6.1 Comparativa Definitiva del Formulario: Lo que tú respondes vs. Lo que calcula el sistema

Para mantener absoluta claridad al construir los componentes, así queda la división exacta entre interfaz y motor en segundo plano:

#### Al Iniciar (Tiempo 1: $\sim 3\text{ segundos}$)

| Campo visible en UI | Tipo de entrada | Opciones / Comportamiento |
|:--- |:--- |:--- |
| **Materia** | Chips rápidos / Texto | Tu materia habitual pre-seleccionada. |
| **Dominio Previo** | 3 botones | 🌱 *Nuevo*, 🌿 *En construcción*, 🌳 *Consolidado*. |
| **Estrategia Planificada** | Selector | *Recuperación Activa*, *Construcción Generativa*, *Consumo Receptivo*, *Delegación Ejecutiva*. |
| **Estructura** | Toggle | Pre-marcado en **Bloqueado** (rara vez lo tocas en el $90\%$ de sesiones cotidianas). |
| **Modo IA** | Selector | *Sin IA*, *Tutor Andamiaje*, *Generación Automática*. |

*(Las variables matemáticas $S$ y $R$ del modelo de memoria las consulta y calcula el backend por su cuenta).*

#### Al Terminar (Tiempo 2: $\sim 10\text{ segundos}$)

| Campo visible en UI | Tipo de entrada | Opciones / Comportamiento |
|:--- |:--- |:--- |
| **Duración Neta** | Automático | Registrado por el cronómetro excluyendo pausas. |
| **Calificación (Grade)** | 4 botones FSRS | `Again` (1), `Hard` (2), `Good` (3), `Easy` (4). |
| **Dinámica Real** | 4 botones | *Recepción Pasiva*, *Delegación Mecánica*, *Andamiaje*, *Generación Propia*. |
| **% Uso IA** | Slider numérico | $0\%$ a $100\%$. |
| **Fluidez del Bloque** | 4 botones | *Flujo Limpio*, *Lucha Productiva*, *Con Fricción*, *Parálisis / Abandono*. |
| **Modalidad Efectiva** | Selector rápido | *Extracción Esforzada*, *Reconocimiento Fluido*, *Copia Pasiva*. |
| **Fricción Intercalada** | Condicional | **Solo se muestra** si marcaste la sesión como *Intercalado* (oculta y `NULL` si fue *Bloqueado*). |

*(El cálculo de XP ganados, la actualización de estabilidad $S'$ y dificultad $D'$, y la imputación del índice de deuda cognitiva los procesa el sistema en segundo plano).*

### 6.2 Máquina de Estados de la Sesión y Temporizador (`src/client/hooks/`)

- [ ] **Diseñar el Hook de Máquina de Estados (`useStudySession.ts`):**
  En lugar de ocultar o mostrar `div`s manualmente con clases CSS, define el estado explícito de la pantalla:
  `type SessionPhase = 'STAGE_1_CONFIG' | 'STUDYING_ACTIVE' | 'STUDYING_PAUSED' | 'STAGE_2_EVALUATION';`
  - En `'STAGE_1_CONFIG'`: Solo está habilitado el Bloque 1 (Configuración Previa) y el botón *"Iniciar Sesión"*.
  - En `'STUDYING_ACTIVE'` / `'STUDYING_PAUSED'`: El Bloque 1 queda bloqueado en modo lectura (resumen compacto), el cronómetro/Pomodoro corre en primer plano.
  - Al pulsar *"Terminar"*: Pasa a `'STAGE_2_EVALUATION'`, calcula automáticamente `duracion_neta_minutos` a partir de `transcurridoMs` (tu mejora de la v3.1) y despliega el Bloque 2.
- [ ] **Migrar el Cronómetro y Pomodoro (`js/ui/timer.js` $\to$ `src/client/hooks/useStudyTimer.ts`):**
  Pasa tu lógica de conteo exacto de milisegundos netos (descontando pausas y soportando retiro temprano) a un Hook de React que devuelva `{ elapsedNetMinutes, formattedTime, isRunning, start, pause, resume, stop }`.

### 6.3 Componentes del Formulario en 2 Tiempos (`src/client/components/form/`)

- [ ] **Construir `Stage1ConfigForm.tsx` (El "Antes" — Menos de 3 segundos):**
  - Renderiza la barra de **Chips Rápidos de Materias Recientes** (`[Snowflake]`, `[TypeScript]`, `[+ Nueva]`).
  - Al hacer clic en un chip, llama a `GET /api/smart-defaults?materia=X` y muestra un indicador visual (semáforo cognitivo) con la **Estabilidad acumulada ($S$)** en días y la **Recuperabilidad estimada ($R$)** en porcentaje.
  - Renderiza los selectores de chips fluidos (conservando tu CSS Grid `repeat(auto-fit, minmax(150px, 1fr))` de `css/styles.css`) para:
    1. `Dominio_Previo` (🌱 Nuevo, 🌿 En construcción, 🌳 Consolidado).
    2. `Estrategia_Tecnica_Planificada` (🧠 Recuperación Activa, 🛠️ Construcción Generativa, 📖 Consumo Receptivo, ⚡ Delegación Ejecutiva).
    3. `Estructura_Practica` (Toggle pre-marcado fijo por defecto en 🧱 **Bloqueado**, cambiándolo a 🔀 **Intercalado** únicamente cuando deliberadamente armes una batería de problemas mixtos).
    4. `Modo_Diseno_IA` (🚫 Sin IA, 🦉 Tutor Andamiaje, 🤖 Generación Automática).
- [ ] **Construir `Stage2EvalForm.tsx` (El "Después" — Evaluación Metacognitiva):**
  - Se muestra únicamente al detener el reloj.
  - Renderiza los controles para:
    1. `Calificacion_Respuesta_Grade` (Botones 1 al 4: *1: Olvido / Again*, *2: Esfuerzo Extremo / Hard*, *3: Con Vacilación / Good*, *4: Fluido / Easy*).
    2. `Dinamica_Cognitiva_Real` y control deslizante de `Uso_IA_Porcentaje` ($0\%$ a $100\%$).
    3. `Calidad_Asimilacion_Fluidez` (*Flujo Limpio*, *Lucha Productiva*, *Con Fricción*, *Parálisis / Abandono*).
    4. `Modalidad_Procesamiento_Efectiva` (*Extracción Esforzada*, *Reconocimiento Fluido*, *Copia Pasiva*).
    5. `Friccion_Discriminacion_Intercalada` (**Renderizado condicional:** solo aparece en pantalla si en el Tiempo 1 se seleccionó `'Intercalado'`; si fue `'Bloqueado'`, no se muestra y se envía como `null`).
    6. Input de `Notas` con soporte para `[Subtema]`.
  - **Pre-cálculo y Previsualización en vivo:** Calcula automáticamente en el cliente el `indice_deuda_cognitiva` a partir del cruce entre `uso_ia_porcentaje`, `dinamica_cognitiva_real` y `modalidad_procesamiento_efectiva`. Antes de pulsar *"Guardar Sesión"*, muestra una píldora en tiempo real con los **XP que ganarás**, la **Nueva Estabilidad ($S'$)** proyectada y una alerta si el bloque generó **Deuda Cognitiva Crítica**.

### 6.4 Migración del Dashboard Analítico y Gráficos (`src/client/components/analytics/`)

- [ ] **Construir la Barra Superior de Nivel RPG (`RpgHeader.tsx`):**
  Muestra tu nivel actual ($1\text{–}99$), barra de progreso hacia el siguiente nivel, racha de días y estado de conexión con SQLite (`🟢 SQLite Local Activo + Backup Diario`).
- [ ] **Migrar las 4 Pestañas Analíticas + Nueva Vista FSRS:**
  - **Pestaña 1 (`EvolutionTab.tsx`):** Horas y XP por día/semana/mes.
  - **Pestaña 2 (`CircadianHeatmapTab.tsx`):** Tu mapa de calor $7 \times 4$ (Días $\times$ Franjas de 6h) cruzado ahora con la tasa de recuerdo exitoso (`Grade >= 3`).
  - **Pestaña 3 (`CognitiveDebtQuadrantTab.tsx`):** Evolución de tu Cuadrante de IA, mostrando cómo impacta el `% IA`, la discrepancia entre `Modo_Diseno_IA` y `Dinamica_Cognitiva_Real`, y tu `Indice_Deuda_Cognitiva`.
  - **Pestaña 4 (`SubjectInspectorTab.tsx`):** Tu inspector por materia y `[Subtema]`, al que ahora le agregamos la **Tabla de Repetición Espaciada FSRS**: una lista ordenada de tus materias desde la que tiene menor recuperabilidad $R(t)$ hoy (urgente de repasar) hasta la más consolidada.

---

## 🧹 FASE 7: Limpieza Quirúrgica, Documentación y Cierre de la v4.0

**Objetivo:** Eliminar el código legado de la v3, unificar el arranque con un solo comando y documentar formalmente la arquitectura v4 siguiendo tu estándar de ADRs.

- [ ] **Verificar paridad total de funciones:**
  Comprueba que puedes:
  1. Iniciar sesión en menos de 3 segundos con *Smart Defaults* (`Bloqueado` fijo por defecto).
  2. Pausar, reanudar y terminar el cronómetro calculando el tiempo neto exacto.
  3. Evaluar el Tiempo 2 viendo el campo de fricción intercalada oculto cuando la sesión es bloqueada y el índice de deuda cognitiva pre-calculado automáticamente.
  4. Guardar la evaluación y ver la sesión reflejada al instante en el historial y en los gráficos.
  5. Editar (✏️) y eliminar (✖) un registro existente.
  6. Cambiar el idioma entre Español (ES) e Inglés (EN).
- [ ] **Eliminar directorios y archivos obsoletos de la v3:**
  Una vez verificado todo lo anterior, ejecuta `git rm -r js/` y elimina el antiguo `server.js` de la raíz. Tu proyecto ahora vive íntegramente tipado dentro de `src/` y `tests/`.
- [ ] **Actualizar `package.json` y `start.bat`:**
  Configura el script `"start"` en `package.json` para que levante el servidor SQLite y la interfaz con un solo comando (o mediante doble clic en `start.bat`), manteniendo exactamente la misma comodidad de arranque que tenías en la v3.
- [ ] **Redactar `ADR-009` y `ADR-010` en `docs/DECISIONES.md`:**
  - **ADR-009:** *Migración de Persistencia Primaria de CSV a SQLite Local con Puente de Exportación RFC 4180.*
  - **ADR-010:** *Integración del Modelo de Memoria DSR/FSRS, Nueva Taxonomía de Estrategia Planificada y Auditoría Automática de Deuda Cognitiva con TypeScript.*
- [ ] **Fusión a la rama principal (Release v4.0.0):**
  Ejecuta `npx vitest run` por última vez, haz commit de tus cambios, intégralos en tu rama `main` (`git checkout main && git merge feat/v4-typescript-sqlite`) y crea la etiqueta oficial de versión: `git tag -a v4.0.0 -m "StudyTracker v4.0: FSRS Engine, SQLite & TypeScript Architecture"`.