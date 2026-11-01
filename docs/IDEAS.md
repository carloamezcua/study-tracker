# 💡 Ideas y Mejoras Futuras

> Bandeja de entrada de ideas. **Anotar aquí no es comprometerse a hacerlo.**
> Cuando una idea se implemente, muévela a la sección "✅ Hechas" con la fecha y commit.

**Cómo usar este archivo**

- Escribe la idea en una línea, sin filtrarla. Refínala después.
- Etiqueta cada una con esfuerzo (`S` horas · `M` días · `L` semanas) e impacto (⭐ a ⭐⭐⭐).

---

## 🔥 Prioridad alta (siguiente a considerar)

| Idea                                                         | Esfuerzo | Impacto | Notas                                                                                                        |
| ------------------------------------------------------------ | :------: | :-----: | ------------------------------------------------------------------------------------------------------------ |
| **Bono de XP por Pomodoros Consecutivos (Combos)**     |    S    |  ⭐⭐  | Recompensar bloques encadenados (ej. 2 o más pomodoros de 25m seguidos con descansos cumplidos).            |
| **Productivity Tracker (Expansión multi-propósito)** |    M    | ⭐⭐⭐ | Expandir más allá de estudio para cubrir trabajo en proyectos personales sin que se sienta solo "estudio". |
| **Migración Quirúrgica a v4.0 (TypeScript + SQLite + React)** |    L    | ⭐⭐⭐ | Seguir paso a paso `docs/ruta_de_refactorizaci_n_quir_rgica_v4_0.md` ahora que el puente de 22 columnas está activo. |

---

## 🎮 Gamificación (más allá de subir de nivel)

Hoy el sistema cuenta con la **progresión cuadrática infinita** ($\text{XP}(L) = 50 \cdot L \cdot (L - 1)$, donde el Nivel 2 requiere exactamente 100 XP y no existe límite superior de nivel) junto con **16 Rangos Profesionales** (*Iniciado* Nv. 1 hasta *Visionario* Nv. 200+). Ver también [PREGUNTAS.md](PREGUNTAS.md) y [docs/agents/refactorizacion_sistema_xp.md](agents/refactorizacion_sistema_xp.md).

- [ ] **Sistema de Logros y Desafíos** `[M · ⭐⭐⭐]`
  - 🍅 *Combo Pomodoro:* Completar 2 pomodoros seguidos (con descanso de 5 min entre ambos).
  - 🔥 *Rachas de Constancia:* Racha de 2, 5, 10, 30 días seguidos (con al menos 1 pomodoro de 25 min al día).
  - 🧠 *Enfoque Autónomo:* Hito por acumular cierta cantidad de horas de estudio sin usar IA (0% IA).
  - ⏳ *Veterano del Estudio:* Hitos de horas totales acumuladas (ej. 25h, 50h, 100h, 500h).
- [X] **Rebalancear la Curva de XP y Tabla de Rangos Profesionales (Progresión Cuadrática Infinita)** *(Implementado en v3.2: Nivel 2 = 100 XP, fórmula $50 \cdot L \cdot (L - 1)$, eliminación del tope de nivel 99 y 16 rangos profesionales)*
- [ ] **Avatar Virtual estilo Tamagotchi y Tienda de XP** `[L · ⭐⭐⭐]`
  - Compañero virtual / avatar al que se le puedan dar ítems y cuidados estilo Tamagotchi.
  - Tienda de recompensas donde se compren accesorios y mejoras cosméticas usando la experiencia (XP) o puntos obtenidos al estudiar.
- [ ] **Bono de XP por Pomodoros Consecutivos** `[S · ⭐⭐]`
  - Recompensar sesiones encadenadas (ej. 2 o más bloques de 25 min completados con descansos estructurados).

---

## 🧠 Analítica, Modelo Cognitivo y Taxonomía

- [X] ¿Cuánto se estudia al día, semana, mes? *(Implementado en Pestaña 1 del Dashboard Analítico)*
- [X] **Redefinir Franjas Horarias Circadianas (00:00 a 23:59)** *(Implementado en v3.0: 4 franjas simétricas de 6h)*
- [X] **Resolución del Dilema de Taxonomía Rígida con IA** *(Implementado en v3.0: 6 actividades ortogonales + 4 dinámicas cognitivas)*
- [X] **Puente de Captura FSRS/DSR, Deuda Cognitiva e Inspector Multidimensional (v3.2)** *(Implementado en v3.2: 22 columnas CSV, grados FSRS 1–4, Curva de Olvido, Mapa DSR e Inspector Power BI de 10 dimensiones)*
- [ ] **Métrica de Progreso Real vs. Tiempo Invertido (Desacoplar Duración, Dominio y Dificultad)** `[M · ⭐⭐⭐]`
  - *Lucha cognitiva vs. Eficiencia:* Tardar mucho tiempo en una tarea puede ser síntoma de asimilación profunda de un concepto difícil (no de lentitud o ineficiencia). Al revés: avanzar muy rápido suele significar que el tema ya se domina o es intrínsecamente trivial.
  - *Revisar redundancias:* Evaluar si marcar `🌳 Consolidado` y `🟢 Fácil` duplica información, y buscar una forma de medir el *progreso efectivo* realizado en el bloque para contrastarlo contra el tiempo invertido.

### 🧩 Caso Resuelto: Dilema de Taxonomía Rígida en Estudio con IA

> **Lección aprendida:** El estudio moderno con LLMs no es blanco o negro (consumo vs. producción pura), sino un proceso de **andamiaje cognitivo**.
>
> **Solución implementada en v3.0–v3.2:**
>
> 1. Fusión de `Teoría` e `Investigación` en **`📖 Estudio Teórico / Conceptual`** y evolución hacia las 4 Estrategias Planificadas (`Recuperacion_Activa`, `Construccion_Generativa`, `Consumo_Receptivo`, `Delegacion_Ejecutiva`).
> 2. Separación deliberada entre `Modo_Diseno_IA` (intención en Tiempo 1) y `Dinamica_Cognitiva` + `Modalidad_Procesamiento_Efectiva` (realidad en Tiempo 2) para auditar la **Brecha de Intención** y el **Índice de Deuda Cognitiva**.
> 3. Sustitución de `Dominio Previo` subjetivo por la **Prueba Objetiva de 3 Niveles** (`🌱 Nuevo`, `🌿 En construcción`, `🌳 Consolidado`) y eliminación de `Dominio_Final`.
> 4. Subtemas agrupados mediante corchetes `[Subtema]` en Notas.

---

## ⚡ Experiencia de uso (reducir fricción)

- [X] **Formulario en 2 Etapas Cognitivas** *(Implementado en v3.0: Bloque 1 Inicio + Bloque 2 Fin)*
- [X] **Valores por defecto inteligentes y chips rápidos de materias** *(Implementado en v3.0)*
- [X] **Manejo Correcto de Pausas y Retiro Temprano en el Cronómetro** *(Implementado en v3.1: se calcula Hora_Fin desde tiempo activo neto transcurridoMs, excluyendo pausas y sin distorsión al salir antes)*
- [X] **Guía de Referencia Exhaustiva de 8 Tarjetas y Acordeón de Regla de Oro** *(Implementado en v3.2)*
- [ ] Modo oscuro / temas visuales adicionales `[S · ⭐⭐]`
- [ ] Atajos de teclado para inicio rápido (ej. `Espacio` para pausar/reanudar, `Ctrl+Enter` para guardar) `[S · ⭐⭐]`

---

## 💾 Datos y persistencia

- [X] **Migrar a persistencia CSV pura sin SheetJS** *(Implementado)*
- [X] **Respaldos automáticos diarios antes de escribir en disco** *(Implementado en v3.0 en server.js)*
- [ ] ¿Cuándo mudar a SQLite / PostgreSQL local? *(Planificado en `docs/ruta_de_refactorizaci_n_quir_rgica_v4_0.md`)* `[L · ⭐]`

---

## 🧱 Calidad técnica y arquitectura

- [X] **Documentación de arquitectura y decisiones en PREGUNTAS.md** *(Implementado)*
- [X] **Documento de decisiones de arquitectura y versiones** ([docs/DECISIONES.md](DECISIONES.md)) *(Implementado)*

---

## 🗃️ Ideas en Exploración

- [ ] **Productivity Tracker en lugar de solo Study Tracker** `[M · ⭐⭐⭐]`
  - *Concepto:* Permitir documentar cuando se trabaja en proyectos personales, tareas de trabajo independiente o desarrollo de software sin que se sienta exclusivamente como "estudiar".
  - *Enfoque:* Mantener la misma fórmula y KPIs pero adaptando etiquetas para abarcar *Deep Work* y construcción de proyectos.
- [ ] **Rediseño del Layout del Formulario (Evitar columna izquierda alargada)** `[M · ⭐⭐]`
  - *Problema:* El formulario ocupa una columna lateral fija de 420px a la izquierda, lo que alarga mucho la página verticalmente cuando hay varias opciones en pantalla.
  - *Objetivo:* Explorar layouts alternativos (ej. formulario horizontal colapsable, vista compacta por pestañas o disposición balanceada) para que no canse visualmente.

---

## ❌ Descartadas

| Idea                                       | Fecha      | Motivo                                                                                                                             |
| ------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Actividad `🗂️ Preparación / Contexto` | 2026-10-20 | No es estudio real sino logística previa; se eliminó del sistema para no ensuciar las métricas cognitivas ni inflar minutos/XP. |
| Campo `Dominio_Final` en el formulario   | 2026-10-26 | Nadie domina un tema nuevo en 25 minutos; pedir calificar el dominio al final reintroducía fatiga de decisión y redundancia.     |
| Curva Exponencial RuneScape con tope Nivel 99 y nombres fantasía | 2026-11-01 | Subía demasiado rápido al inicio, imponía un límite artificial en 99 y tenía nombres poco profesionales; reemplazada por la curva cuadrática infinita y 16 rangos profesionales. |

---

## ✅ Hechas

| Idea                                                                                                                                                                                                                                           | Fecha      | Commit/PR        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------- |
| **Refactorización del Sistema de XP y Rangos Profesionales (v3.2)**: Curva cuadrática infinita $\text{XP}(L) = 50 \cdot L \cdot (L - 1)$ (Nivel 2 = 100 XP, sin tope de nivel) y 16 rangos profesionales (`Iniciado` a `Visionario`)         | 2026-11-01 | v3.2 XP Refactor |
| **Centro Analítico FSRS/DSR, Puente de 22 Columnas, Deuda Cognitiva y Guía de 8 Tarjetas (v3.2)**: Grados FSRS 1–4, Curva de Olvido, Mapa DSR en burbujas, Efectividad Intercalada e Inspector Profundo (*Power BI View*)                       | 2026-11-01 | v3.2 Bridge      |
| **Lucha Productiva y Rediseño de Fluidez del Bloque sin Sesgo Punitivo en XP (v3.1)**: Escala de 4 estados (`Flujo limpio`, `Lucha productiva`, `Con fricción`, `Parálisis / Abandono`) con +10% de bono para lucha cognitiva | 2026-10-26 | v3.1 Feature     |
| **Cálculo Exacto de Tiempo al Retirarse o Pausar en Cronómetro/Pomodoro (v3.1)**: `Hora_Fin` proyectada a partir del tiempo neto activo real, sin distorsión de duración                                                           | 2026-10-26 | v3.1 Feature     |
| **Documento de Decisiones de Arquitectura e Historial de Versiones (`docs/DECISIONES.md`)**                                                                                                                                            | 2026-10-26 | Docs             |
| **Refactor v3 — Esquema Canónico de 18 Columnas en CSV** con migración al vuelo retrocompatible en `excel-sync.js`                                                                                                                  | 2026-10-26 | v3 Refactor      |
| **Refactor v3 — Taxonomía Ortogonal:** 6 Actividades, 4 Dinámicas Cognitivas y Prueba Objetiva de Dominio Previo (3 niveles)                                                                                                          | 2026-10-26 | v3 Refactor      |
| **Refactor v3 — Formulario en 2 Etapas Cognitivas** (Punto de Partida al Iniciar vs. Evaluación del Bloque al Terminar)                                                                                                                | 2026-10-26 | v3 Refactor      |
| **Refactor v3 — Chips Rápidos de Materias Recientes** (1 clic para seleccionar materia o `[+ Nueva]`) + Pre-llenado inteligente por franja                                                                                           | 2026-10-26 | v3 Refactor      |
| **Refactor v3 — Franjas Horarias Circadianas Simétricas de 6h** (00:00–05:59 Madrugada, 06:00–11:59 Mañana, 12:00–17:59 Tarde, 18:00–23:59 Noche)                                                                                 | 2026-10-26 | v3 Refactor      |
| **Refactor v3 — Extracción Automática de Subtemas por `[Subtema]` en Notas** para el Inspector de Materia                                                                                                                           | 2026-10-26 | v3 Refactor      |
| **Refactor v3 — Respaldos Automáticos Diarios en Servidor** (`data/backups/YYYY-MM-DD.csv`) antes de sobrescribir el archivo                                                                                                         | 2026-10-26 | v3 Refactor      |
| **Refactor v3 — Grid Fluido Responsivo y Text Wrap en Chips de Actividad** para evitar desbordamiento horizontal en tarjetas                                                                                                            | 2026-10-26 | v3 Bugfix        |
| Mostrar solo los últimos 5 registros en el historial (con botón *Ver todos*)                                                                                                                                                               | 2026-10-20 | Tanda 1          |
| Redefinir *Objetivo Cumplido* a *Fluidez y Avance del Bloque* (`Sí = Flujo limpio +10%`, `Parcial = Con tropiezos +5%`, `No = Bloqueo`) con Regla de Oro para evitar malinterpretaciones                                            | 2026-10-20 | Tanda 1 / 2      |
| Actividad `👨‍🏫 Clase / Cátedra` con ajuste automático de IA a 0% y escala enfocada en concentración e interés                                                                                                                         | 2026-10-20 | Tanda 1          |
| Migrar persistencia de `.xlsx` (SheetJS + fórmulas de Excel duplicadas) a `.csv` puro (`data/study-tracker.csv`) con fórmulas 100% en JS                                                                                               | 2026-10-20 | CSV Refactor     |
| Dashboard Analítico Interactivo en 4 pestañas (Evolución Día/Semana/Mes + Racha, Mapa de Calor Circadiano 7×4, Cuadrante Cognitivo IA en burbujas, Balance Consumo/Producción e Inspector de Subtemas/Notas con filtros cruzados)        | 2026-10-20 | Analytics v2     |
| **Refactor Tanda 2 — Nivel de Producción Propia (`👀 Consumo`, `📋 Reproducción`, `🧠 Generación propia`)** reemplaza medio digital/papel para capturar esfuerzo cognitivo real sin sesgo de soporte                           | 2026-10-20 | Tanda 2 Refactor |
| **Refactor Tanda 2 — Dominio Previo en 3 niveles (`🌱 Nuevo`, `🌿 Con lagunas`, `🌳 Dominado`)** + Matriz de Fricción adaptada y Curva de Dominio en Inspector de Materia                                                        | 2026-10-20 | Tanda 2 Refactor |
| **Reclasificación de sesiones históricas Cheatsheet (5 sesiones)** como `📋 Reproducción` y `🌿 Con lagunas` (material sintetizado por IA y reproducido a mano)                                                                   | 2026-10-20 | Tanda 2 Refactor |
| Rediseño completo de la **Guía de Referencia del Sistema** en 6 tarjetas temáticas dentro del Dashboard y en `README.md`                                                                                                            | 2026-10-20 | Tanda 2          |
