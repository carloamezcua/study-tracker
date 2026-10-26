# 💡 Ideas y Mejoras Futuras

> Bandeja de entrada de ideas. **Anotar aquí no es comprometerse a hacerlo.**
> Cuando una idea se implemente, muévela a la sección "✅ Hechas" con la fecha.

**Cómo usar este archivo**

- Escribe la idea en una línea, sin filtrarla. Refínala después.
- Etiqueta cada una con esfuerzo (`S` horas · `M` días · `L` semanas) e impacto (⭐ a ⭐⭐⭐).

## 🔥 Prioridad alta (siguiente a considerar)

| Idea                                                                                 | Esfuerzo | Impacto | Notas                                                                          |
| ------------------------------------------------------------------------------------ | :------: | :-----: | ------------------------------------------------------------------------------ |
| Modo "registro rápido" (1 clic, solo lo esencial)                                   |    S    | ⭐⭐⭐ | Los demás campos se completan después o son opcionales. Ver P1 en PREGUNTAS. |
| Valores por defecto inteligentes (recordar el último contexto/actividad/modo de IA) |    S    | ⭐⭐⭐ | Reduce clics por sesión.                                                      |
| Respaldo automático del `.xlsx` antes de cada escritura                           |    S    | ⭐⭐⭐ | Protege contra corrupción del archivo. Ej. `data/backups/AAAA-MM-DD.xlsx`.  |

---

## 🎮 Gamificación (más allá de subir de nivel)

Hoy solo hay **XP → Nivel → Rango**. Esto es lo que añadiría profundidad. Ver también la sección de gamificación en [PREGUNTAS.md](PREGUNTAS.md).

- [ ] **Sistema de Logros y Desafíos** `[M · ⭐⭐⭐]`
  - 🍅 *Combo Pomodoro:* Completar 2 pomodoros seguidos (con descanso de 5 min entre ambos).
  - 🔥 *Rachas de Constancia:* Racha de 2, 5, 10, 30 días seguidos (con al menos 1 pomodoro de 25 min al día).
  - 🧠 *Enfoque Autónomo:* Hito por acumular cierta cantidad de horas de estudio sin usar IA (0% IA).
  - ⏳ *Veterano del Estudio:* Hitos de horas totales acumuladas (ej. 25h, 50h, 100h, 500h).
- [ ] **Rebalancear la Curva de XP (Escalado Real estilo RuneScape)** `[S · ⭐⭐⭐]`
  - *Problema actual:* Se sube de nivel demasiado rápido en las primeras sesiones (ej. una sesión de 60 min sube a nivel 4; nivel 2 pide solo 26 XP).
  - *Objetivo:* Calibrar la constante base o adaptar los valores auténticos de Old School RuneScape (ej. Nivel 2 = 83 XP, Nivel 10 = 1,154 XP) para que el avance sea progresivo y verdaderamente desafiante.
- [ ] **Avatar Virtual estilo Tamagotchi y Tienda de XP** `[L · ⭐⭐⭐]`
  - Compañero virtual / avatar al que se le puedan dar ítems y cuidados estilo Tamagotchi.
  - Tienda de recompensas donde se compren accesorios y mejoras cosméticas usando la experiencia (XP) o puntos obtenidos al estudiar.
- [ ] **Bono de XP por Pomodoros Consecutivos** `[S · ⭐⭐]`
  - Recompensar sesiones encadenadas (ej. 2 o más bloques de 25 min completados con descansos estructurados).

---

## 🧠 Analítica, Modelo Cognitivo y Taxonomía

- [X] ¿Cuánto se estudia al día, semana, mes? *(Implementado en Pestaña 1 del Dashboard Analítico)*
- [ ] **Métrica de Progreso Real vs. Tiempo Invertido (Desacoplar Duración, Dominio y Dificultad)** `[M · ⭐⭐⭐]`
  - *Lucha cognitiva vs. Eficiencia:* Tardar mucho tiempo en una tarea puede ser síntoma de asimilación profunda de un concepto difícil (no de lentitud o ineficiencia). Al revés: avanzar muy rápido suele significar que el tema ya se domina o es intrínsecamente trivial.
  - *Revisar redundancias:* Evaluar si marcar `🌳 Dominado` y `🟢 Fácil` duplica información, y buscar una forma de medir el *progreso efectivo* realizado en el bloque para contrastarlo contra el tiempo invertido.
- [ ] **Redefinir Franjas Horarias Circadianas (00:00 a 23:59)** `[S · ⭐⭐]`
  - *Problema actual:* En `js/domain/metrics.js`, el horario de 00:00 a 03:59 cae por defecto en `Noche` (porque solo contempla Madrugada de 04:00 a 07:59).
  - *Corrección:* La noche debe terminar a las 23:59. De 00:00 en adelante (hasta las 06:59 o 07:59) debe clasificarse formalmente como `Madrugada` para que el mapa de calor circadiano 7×4 sea preciso.

### 🧩 Dilema de Taxonomía Rígida: Fricción y Ambigüedad al Clasificar Estudio Asistido por IA `[M · ⭐⭐⭐]`

> **Problema raíz:** Las categorías actuales del tracker asumen decisiones binarias y mutuamente excluyentes, pero el estudio moderno con IA es **híbrido, iterativo y de andamiaje cognitivo**. Esto genera fatiga de decisión (*Taxonomy Fatigue*) y parálisis por análisis al guardar una sesión, con el riesgo latente de que el sistema deje de escalar cuando aumente la variedad de materias o tipos de estudio.

#### 📖 Caso Testigo Real: Sesión de Preparación de Mesa Redonda sobre GANs

Al estudiar un paper técnico en inglés sobre Redes Generativas Antagónicas (GANs) con apoyo de un LLM:

- La IA tradujo y resumió el artículo para evitar la barrera del idioma.
- Fue aclarando dudas sobre tecnicismos matemáticos y conceptuales conforme surgían.
- El usuario redactaba sus propias explicaciones de los conceptos.
- La IA revisaba esos borradores, señalaba errores de entendimiento y generaba explicaciones para corregirlos en un diálogo socrático continuo.
- Aunque fue un aprendizaje de alto valor, **5 campos del formulario entraron en conflicto directo**:

1. **`Tipo_Actividad` (`Teoría / Docs` vs. `Investigación / Diálogo`):**
   - *El dilema:* Era el estudio de un documento teórico formal (paper/artículo), pero la dinámica real fue una exploración activa con preguntas y respuestas abiertas. Encajaba al 100% en ambos.
2. **`Produccion_Propia` (`Reproducción` vs. `Generación propia`):**
   - *El dilema:* El usuario redactó con sus propias palabras (generación propia), pero la IA generó correcciones masticadas y explicaciones de por qué estaba mal (asimilación/reproducción). No fue ni copia pasiva ni creación aislada: fue co-creación y corrección interactiva.
3. **`Dominio_Previo` (`🌱 Nuevo` vs. `🌿 Con lagunas`):**
   - *El dilema:* El tema específico (GANs y el artículo en cuestión) era nuevo, pero ya se tenían bases matemáticas y conceptuales previas que facilitaban entenderlo. ¿Se califica la novedad del tema o el estado general del andamiaje?
4. **`Complejidad` (`🟡 Desafiante` vs. `🟢 Fácil`):**
   - *El dilema:* La materia en sí es compleja/técnica, pero con el apoyo de la IA y el conocimiento previo la sesión no se sintió pesada. ¿La complejidad mide la dificultad intrínseca del material o la fricción subjetiva experimentada?
5. **`Modo_IA` (`🛠️ Copiloto / Apoyo` vs. `💬 Diálogo / Tutoría`):**
   - *El dilema:* La IA actuó como apoyo puntual (traducción de inglés y resumen de secciones), pero también como tutor de diálogo (discutiendo errores conceptuales). Son modos que hoy están separados en chips únicos.

#### ⚠️ Riesgo Identificado a Futuro

- **Inconsistencia y Ruido en Métricas:** Forzar una etiqueta artificialmente distorsiona los gráficos de asimilación y los cuadrantes cognitivos.
- **Abandono por Fricción de Registro:** Si una sola sesión normal requiere un debate filosófico para elegir 5 dropdowns, a mayor volumen de estudio más probable será abandonar el registro.

#### 💡 Posibles Soluciones a Evaluar

- **Regla de Oro de la Intención Dominante:** Establecer una jerarquía clara (ej. *si hubo diálogo socrático para desbloquear comprensión, prima `Investigación / Diálogo` y `Tutoría` aunque la fuente sea un paper*).
- **Taxonomía Flexible / Selección Múltiple:** Permitir etiquetas combinadas o modos híbridos en sesiones con IA.
- **Registro Rápido Asistido por Texto:** Un campo libre ("¿Qué hiciste?") donde un prompt ligero sugiera la combinación adecuada sin obligar a pensar cada chip.
- **Desacoplar Dificultad del Material vs. Esfuerzo Subjetivo.**

---

## ⚡ Experiencia de uso (reducir fricción)

- [ ] Modo oscuro `[S · ⭐⭐]`
- [ ] **Manejo Correcto de Pausas en el Cronómetro** `[S · ⭐⭐⭐]`
  - *Problema actual:* Al pausar el cronómetro y luego dar en "Terminar", la duración se calcula restando `Hora_Fin - Hora_Inicio` de reloj real, ignorando el tiempo que estuvo en pausa e inflando artificialmente los minutos de estudio.
  - *Corrección:* Descontar los minutos de pausa de la duración efectiva o ajustar la hora de inicio virtual.

---

## 💾 Datos y persistencia

- [ ] ¿Cuándo mudar a otra base de datos?

---

## 🧱 Calidad técnica (ver sección de deuda técnica en PREGUNTAS)

- [ ] Documento corto de arquitectura/decisiones (`docs/DECISIONES.md`).

---

## 🗃️ Ideas sueltas / sin clasificar

*(Bandeja de entrada vacía por ahora. Anota aquí cualquier idea rápida sin filtrar para procesarla y clasificarla después).*

- Un Produnctuvity Tracker en lugar solo de Study Tracker, así podré documentar cuando trabajo en proyectos personales y no se sienta solo como estudio, incluso podría escalarse a otros tipos de actividades más adelante.

## ❌ Descartadas

| Idea                                       | Fecha      | Motivo                                                                                                                             |
| ------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Actividad `🗂️ Preparación / Contexto` | 2026-10-20 | No es estudio real sino logística previa; se eliminó del sistema para no ensuciar las métricas cognitivas ni inflar minutos/XP. |

---

## ✅ Hechas

| Idea                                                                                                                                                                                                                                    | Fecha      | Commit/PR        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------- |
| Mostrar solo los últimos 5 registros en el historial (con botón *Ver todos*)                                                                                                                                                        | 2026-10-20 | Tanda 1          |
| Redefinir *Objetivo Cumplido* a *Fluidez y Avance del Bloque* (`Sí = Flujo limpio +10%`, `Parcial = Con tropiezos +5%`, `No = Bloqueo`) con Regla de Oro para evitar malinterpretaciones                                     | 2026-10-20 | Tanda 1 / 2      |
| Actividad `👨‍🏫 Clase / Cátedra` con ajuste automático de IA a 0% y escala enfocada en concentración e interés                                                                                                                  | 2026-10-20 | Tanda 1          |
| Migrar persistencia de `.xlsx` (SheetJS + fórmulas de Excel duplicadas) a `.csv` puro (`data/study-tracker.csv`) con fórmulas 100% en JS                                                                                        | 2026-10-20 | CSV Refactor     |
| Dashboard Analítico Interactivo en 4 pestañas (Evolución Día/Semana/Mes + Racha, Mapa de Calor Circadiano 7×4, Cuadrante Cognitivo IA en burbujas, Balance Consumo/Producción e Inspector de Subtemas/Notas con filtros cruzados) | 2026-10-20 | Analytics v2     |
| **Refactor Tanda 2 — Nivel de Producción Propia (`👀 Consumo`, `📋 Reproducción`, `🧠 Generación propia`)** reemplaza medio digital/papel para capturar esfuerzo cognitivo real sin sesgo de soporte                    | 2026-10-20 | Tanda 2 Refactor |
| **Refactor Tanda 2 — Dominio Previo en 3 niveles (`🌱 Nuevo`, `🌿 Con lagunas`, `🌳 Dominado`)** + Matriz de Fricción adaptada y Curva de Dominio en Inspector de Materia                                                 | 2026-10-20 | Tanda 2 Refactor |
| **Reclasificación de sesiones históricas Cheatsheet (5 sesiones)** como `📋 Reproducción` y `🌿 Con lagunas` (material sintetizado por IA y reproducido a mano)                                                            | 2026-10-20 | Tanda 2 Refactor |
| Rediseño completo de la **Guía de Referencia del Sistema** en 6 tarjetas temáticas dentro del Dashboard y en `README.md`                                                                                                     | 2026-10-20 | Tanda 2          |
