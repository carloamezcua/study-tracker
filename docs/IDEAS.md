# 💡 Ideas y Mejoras Futuras

> Bandeja de entrada de ideas. **Anotar aquí no es comprometerse a hacerlo.**
> Cuando una idea se implemente, muévela a la sección "✅ Hechas" con la fecha.

**Cómo usar este archivo**

- Escribe la idea en una línea, sin filtrarla. Refínala después.
- Etiqueta cada una con esfuerzo (`S` horas · `M` días · `L` semanas) e impacto (⭐ a ⭐⭐⭐).
- Revisa el archivo una vez por semana o mes y elige **máximo 1–2** ideas para trabajar.
- Antes de implementar algo grande, responde las preguntas relacionadas de [PREGUNTAS.md](PREGUNTAS.md).

---

## 🔥 Prioridad alta (siguiente a considerar)

| Idea | Esfuerzo | Impacto | Notas |
|------|:--:|:--:|-------|
| Modo "registro rápido" (1 clic, solo lo esencial) | S | ⭐⭐⭐ | Los demás campos se completan después o son opcionales. Ver P1 en PREGUNTAS. |
| Valores por defecto inteligentes (recordar el último contexto/actividad/modo de IA) | S | ⭐⭐⭐ | Reduce clics por sesión. |
| Respaldo automático del `.xlsx` antes de cada escritura | S | ⭐⭐⭐ | Protege contra corrupción del archivo. Ej. `data/backups/AAAA-MM-DD.xlsx`. |

---

## 🎮 Gamificación (más allá de subir de nivel)

Hoy solo hay **XP → Nivel → Rango**. Esto es lo que añadiría profundidad. Ver también la sección de gamificación en [PREGUNTAS.md](PREGUNTAS.md).

- [ ] **Rachas (streaks)** con "días de gracia" o "congelar racha" para que una falla no destruya la motivación.
- [ ] **Logros / medallas**, por ejemplo:
  - "Primera semana completa", "10 sesiones sin IA mecánica", "Sesión de 2h sin bloqueos".
  - Logros **ocultos** que se descubren al cumplirlos.
- [ ] **Misiones diarias/semanales** auto-generadas (ej. "1 sesión de Práctica/Debugging esta semana").
- [ ] **Skills por materia o actividad**, cada una con su propio nivel (estilo RuneScape: Teoría, Código, Debugging…) además del nivel global.
- [ ] **Jefes / hitos reales**: vincular a un examen, certificación (ej. Snowflake) o entrega, con barra de progreso hasta la fecha.
- [ ] **Eventos con riesgo/recompensa**: "Doble XP en sesiones de Repaso esta semana".
- [ ] **Recompensas reales** definidas por ti (ej. al nivel 20 → algo que quieras comprar o hacer).
- [ ] **Resumen semanal estilo "recap"** (tu semana en números, mejor sesión, tendencia).
- [ ] **Comparación contra ti mismo** (esta semana vs. la anterior), nunca contra otros.
- [ ] Revisar la **economía de XP**: ¿qué comportamiento premia el sistema actual realmente? ¿Premia la cantidad de minutos o la calidad?

---

## 🧠 Analítica y reflexión

- [ ] Detectar **patrones**: ¿a qué hora/energía rindes más? ¿qué actividad tiene más bloqueos?
- [ ] **Revisión semanal guiada**: 3 preguntas automáticas al final de la semana (qué funcionó, qué no, qué cambiar).
- [ ] Tendencia de **asimilación** a lo largo del tiempo, por materia.
- [ ] Relación entre **modo de uso de IA** y asimilación (¿realmente el modo Diálogo te enseña más?).
- [ ] Alerta amable cuando pasas varios días sin registrar ("¿todo bien?"), sin culpa.
- [ ] Metas semanales de horas con progreso visible.

---

## ⚡ Experiencia de uso (reducir fricción)

- [ ] Atajos de teclado (iniciar/terminar sesión, guardar).
- [ ] Formulario en 2 pasos: **al iniciar** (materia + contexto) y **al terminar** (asimilación, objetivo, notas).
- [ ] Plantillas de sesión ("Estudio Snowflake", "Proyecto Rails") con campos pre-llenados.
- [ ] Recordatorio para registrar la sesión si el cronómetro quedó corriendo mucho tiempo.
- [ ] Edición masiva en el historial.
- [ ] Modo oscuro / temas (también como recompensa desbloqueable).
- [ ] Instalable como PWA para abrirlo como app.

---

## 💾 Datos y persistencia

- [ ] **Exportar/Importar** JSON y CSV además de Excel.
- [ ] Validación de datos al leer el Excel (¿qué pasa si editas una celda a mano y rompes algo?).
- [ ] Evaluar **SQLite** como fuente de verdad, con Excel solo como exportación/reporte. Ver P-T4 en PREGUNTAS.
- [ ] Control de versiones del esquema de columnas (hoy 18 columnas; ¿qué pasa cuando agregues la 19?).
- [ ] Sincronización/respaldo opcional en la nube (manteniendo la privacidad local-first).

---

## 🧱 Calidad técnica (ver sección de deuda técnica en PREGUNTAS)

- [ ] Agregar **pruebas** primero a `js/domain/metrics.js` (lógica pura, la más fácil de testear y la más valiosa).
- [ ] Linter + formateador (ESLint + Prettier) para mantener consistencia.
- [ ] Migrar de scripts globales (`StudyTracker` en `window`) a **módulos ES** (`import`/`export`).
- [ ] Dividir archivos grandes (`dashboard.js` ~785 líneas, `i18n.js` ~830, `timer.js` ~690).
- [ ] Mover las traducciones de `i18n.js` a archivos `es.json` / `en.json`.
- [ ] CI simple (GitHub Actions) que ejecute pruebas y linter.
- [ ] Documento corto de arquitectura/decisiones (`docs/DECISIONES.md`).

---

## 🗃️ Ideas sueltas / sin clasificar

_Pega aquí cualquier cosa sin pensar demasiado._

-

---

## ❌ Descartadas

_Anota también lo que decidiste NO hacer y por qué. Evita volver a discutirlo._

| Idea | Fecha | Motivo |
|------|-------|--------|
|      |       |        |

---

## ✅ Hechas

| Idea | Fecha | Commit/PR |
|------|-------|-----------|
|      |       |           |

