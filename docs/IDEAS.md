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

- [X] ¿Cuánto se estudia al día, semana, mes? *(Implementado en Pestaña 1 del Dashboard Analítico)*

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

_Ninguna por ahora._

## ❌ Descartadas

| Idea                                       | Fecha      | Motivo                                                                                                                             |
| ------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Actividad `🗂️ Preparación / Contexto` | 2026-10-20 | No es estudio real sino logística previa; se eliminó del sistema para no ensuciar las métricas cognitivas ni inflar minutos/XP. |

---

## ✅ Hechas

| Idea                                                                                                                                                                                                                                    | Fecha      | Commit/PR    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------ |
| Mostrar solo los últimos 5 registros en el historial (con botón *Ver todos*)                                                                                                                                                        | 2026-10-20 | Tanda 1      |
| Redefinir *Objetivo Cumplido* a *Fluidez y Avance del Bloque* (`Sí = Flujo limpio +10%`, `Parcial = Con tropiezos +5%`, `No = Bloqueo`) con Regla de Oro para evitar malinterpretaciones                                     | 2026-10-20 | Tanda 1 / 2  |
| Actividad `👨‍🏫 Clase / Cátedra` con ajuste automático de IA a 0% y escala enfocada en concentración e interés                                                                                                                  | 2026-10-20 | Tanda 1      |
| Migrar persistencia de `.xlsx` (SheetJS + fórmulas de Excel duplicadas) a `.csv` puro (`data/study-tracker.csv`) con fórmulas 100% en JS                                                                                        | 2026-10-20 | CSV Refactor |
| Dashboard Analítico Interactivo en 4 pestañas (Evolución Día/Semana/Mes + Racha, Mapa de Calor Circadiano 7×4, Cuadrante Cognitivo IA en burbujas, Balance Consumo/Producción e Inspector de Subtemas/Notas con filtros cruzados) | 2026-10-20 | Analytics v2 |
| **Refactor Tanda 2 — Nivel de Producción Propia (`👀 Consumo`, `📋 Reproducción`, `🧠 Generación propia`)** reemplaza medio digital/papel para capturar esfuerzo cognitivo real sin sesgo de soporte                                  | 2026-10-20 | Tanda 2 Refactor |
| **Refactor Tanda 2 — Dominio Previo en 3 niveles (`🌱 Nuevo`, `🌿 Con lagunas`, `🌳 Dominado`)** + Matriz de Fricción adaptada y Curva de Dominio en Inspector de Materia                                                          | 2026-10-20 | Tanda 2 Refactor |
| **Reclasificación de sesiones históricas Cheatsheet (5 sesiones)** como `📋 Reproducción` y `🌿 Con lagunas` (material sintetizado por IA y reproducido a mano)                                                                        | 2026-10-20 | Tanda 2 Refactor |
| Rediseño completo de la **Guía de Referencia del Sistema** en 6 tarjetas temáticas dentro del Dashboard y en `README.md`                                                                                                     | 2026-10-20 | Tanda 2      |
