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

- [ ] Logros

---

## 🧠 Analítica y reflexión

- [x] ¿Cuánto se estudia al día, semana, mes? *(Implementado en Pestaña 1 del Dashboard Analítico)*

---

## ⚡ Experiencia de uso (reducir fricción)

- [ ] Modo oscuro

---

## 💾 Datos y persistencia

- [ ] ¿Cuándo mudar a otra base de datos?

---

## 🧱 Calidad técnica (ver sección de deuda técnica en PREGUNTAS)

- [ ] Documento corto de arquitectura/decisiones (`docs/DECISIONES.md`).

---

## 🗃️ Ideas sueltas / sin clasificar

_Pega aquí cualquier cosa sin pensar demasiado._

- **Tanda 2 — Medio analógico vs. digital (`S` · ⭐⭐):** Diferenciar cuando escribo en el cuaderno a mano vs. en la computadora (incluso con el mismo % de IA, escribir en papel obliga a sintetizar y retener más sin copy-paste).
- **Tanda 2 — Familiaridad / Conocimientos previos (`S` · ⭐⭐):** Agregar si un tema es totalmente nuevo (`🌱 Nuevo`) o si ya tenía base previa (`🧱 Con base`), ya que cuando repaso o tengo base el flujo es más constante y el apoyo de IA rinde distinto.

---

## ❌ Descartadas

_Anota también lo que decidiste NO hacer y por qué. Evita volver a discutirlo._

| Idea | Fecha | Motivo |
| ---- | ----- | ------ |
|      |       |        |

---

## ✅ Hechas

| Idea | Fecha | Commit/PR |
| ---- | ----- | --------- |
| Mostrar solo los últimos 5 registros en el historial (con botón *Ver todos*) | 2026-10-20 | Tanda 1 |
| Redefinir *Objetivo Cumplido* a *Avance del Bloque* (`Sí = Buen avance +10%`, `Parcial = Con tropiezos +5%`) para no castigar tareas largas | 2026-10-20 | Tanda 1 |
| Actividad `🗂️ Preparación / Contexto` para medir el tiempo preparando el ambiente y recopilando info con LLMs | 2026-10-20 | Tanda 1 |
| Actividad `👨‍🏫 Clase / Cátedra` con ajuste automático de IA a 0% y escala enfocada en concentración e interés | 2026-10-20 | Tanda 1 |
| Migrar persistencia de `.xlsx` (SheetJS + fórmulas de Excel duplicadas) a `.csv` puro (`data/study-tracker.csv`) con fórmulas 100% en JS | 2026-10-20 | CSV Refactor |
| Dashboard Analítico Interactivo en 4 pestañas (Evolución Día/Semana/Mes + Racha, Mapa de Calor Circadiano 7×4, Cuadrante Cognitivo IA en burbujas, Balance Consumo/Producción e Inspector de Subtemas/Notas con filtros cruzados) | 2026-10-20 | Analytics v2 |
