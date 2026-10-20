# ❓ Preguntas Guía para Mejorar el Proyecto

> Este archivo no es una lista de tareas: es para **pensar**.
> Responde por escrito debajo de cada pregunta (`**R:**`). Con el tiempo, tus respuestas se vuelven decisiones de diseño.
> Puedes pegar una sección completa a una IA y pedirle que te **entreviste** o que cuestione tus respuestas.

Secciones:

1. [Fricción y abandono del registro](#1--fricción-y-abandono-del-registro)
2. [Gamificación más profunda](#2--gamificación-más-profunda)
3. [Deuda técnica y aprendizaje](#3--deuda-técnica-y-aprendizaje)
4. [Trabajar con IA y agentes sin perder el control](#4--trabajar-con-ia-y-agentes-sin-perder-el-control)
5. [Revisión periódica](#5--revisión-periódica)

---

## 1. 🪫 Fricción y abandono del registro

**Hipótesis a probar:** cada campo extra en el formulario reduce la probabilidad de que registres la sesión. Si registrar cuesta más que estudiar "un poco más", el sistema muere.

### Medir antes de opinar

- **P1.** ¿Cuánto tiempo toma hoy registrar una sesión completa, de principio a fin? Cronométralo 5 veces. (Meta orientativa: < 20 segundos.)
- **P2.** ¿Cuántas sesiones estudiaste en las últimas 2 semanas **sin registrarlas**? ¿Qué pasó en cada una?
- **P3.** ¿En qué momento exacto te dan ganas de saltarte el registro: al empezar, a mitad, o al terminar cansado?
- **P4.** ¿Hay algún día en que registraste "a la fuerza" y los datos fueron poco confiables (ej. asimilación puesta al azar)? Datos falsos son peor que datos ausentes.

### Auditar cada campo

Por cada campo del formulario (contexto, actividad, materia, asimilación, modo de IA, complejidad, objetivo, energía, notas…), responde:

| Pregunta | ¿Qué responder? |
|----------|-----------------|
| ¿Qué **decisión** tomé alguna vez gracias a este dato? | Si es "ninguna", es candidato a eliminar u ocultar. |
| ¿Puedo **deducirlo** (valor anterior, hora del día, plantilla)? | Si sí, autocompletarlo. |
| ¿Es necesario **durante** la sesión o solo **al terminar**? | Moverlo al paso donde cueste menos. |
| ¿Cuesta **esfuerzo mental** (pensar) o solo un clic? | Lo mental cuesta mucho más que un clic. |

- **P5.** De todos los campos, ¿cuáles **nunca** he mirado en el dashboard? ¿Por qué los sigo capturando?
- **P6.** ¿Cuál es el **mínimo absoluto** para que una sesión cuente (materia + minutos)? ¿Y si lo demás fuera opcional con un bono de XP por completarlo?
- **P7.** ¿Prefiero un registro **rápido por defecto** con un botón "agregar detalles", o un formulario completo siempre?
- **P8.** ¿Qué pasaría si la reflexión (asimilación, objetivo, notas) se hiciera **una vez al día o semana** en vez de por sesión?

### Experimentos pequeños (elige 1 y pruébalo 2 semanas)

- [ ] **A:** Quitar 2–3 campos del formulario y ver si registro más seguido.
- [ ] **B:** Dividir en "al iniciar" (3 datos) y "al terminar" (2 datos).
- [ ] **C:** Valores por defecto = última sesión. Solo cambio lo que difiere.
- [ ] **D:** Medir "porcentaje de días estudiados que quedaron registrados" como métrica de salud del sistema.

> 📏 **Indicador clave:** `días registrados / días estudiados`. Si baja, hay fricción.

---

## 2. 🎮 Gamificación más profunda

**Diagnóstico:** subir de nivel con XP es **recompensa**, pero no es todavía un **juego**. Un buen sistema combina varias fuerzas motivacionales.

### Entender qué te motiva

- **P9.** ¿Qué me hace volver a un videojuego o app día tras día? (Progreso, coleccionar, descubrir, competir, completar, narrativa, mejorar mi destreza…)
- **P10.** ¿Con qué tipo de recompensa me emocioné de verdad en el tracker hasta ahora? ¿Con cuál ya no siento nada?
- **P11.** Cuando subo de nivel, ¿qué siento? ¿Y una semana después? (Si desaparece rápido, falta variedad.)
- **P12.** ¿Prefiero metas **a largo plazo** (nivel 99) o **ciclos cortos** (esta semana, hoy)?

### Los ingredientes de un sistema rico

Marca cuáles te interesan y descríbelos con tus palabras:

| Mecánica | Qué aporta | ¿Me interesa? |
|----------|-----------|:---:|
| **Rachas** | Constancia diaria | ☐ |
| **Logros / medallas** | Coleccionismo, hitos concretos | ☐ |
| **Misiones** (diarias/semanales) | Dirección: qué hacer hoy | ☐ |
| **Skills por área** | Sensación de especializarse | ☐ |
| **Jefes / hitos reales** (examen, certificación) | Propósito y deadline | ☐ |
| **Eventos temporales** | Novedad y variedad | ☐ |
| **Recompensas reales** | Conectar el juego con la vida | ☐ |
| **Narrativa / personaje** | Identidad, "quién soy" | ☐ |
| **Desbloqueables** (temas, títulos, funciones) | Anticipación | ☐ |

### Diseño de la economía (lo más delicado)

- **P13.** ¿Qué comportamiento quiero **incentivar**? (Constancia, profundidad, autonomía, terminar proyectos…) Cada mecánica debe empujar uno.
- **P14.** ¿El XP actual premia **minutos** o **calidad**? Si solo premia tiempo, puedo "farmear" XP sin aprender. ¿Es eso aceptable?
- **P15.** ¿Qué conducta indeseada podría **incentivar sin querer**? (Ej. registrar sesiones largas e improductivas, marcar "Objetivo cumplido" siempre, rachas que generan ansiedad.)
- **P16.** ¿Cómo evito que una **racha rota** me haga abandonar todo? (Días de gracia, "congelar racha", racha semanal en vez de diaria.)
- **P17.** ¿Necesito **castigos** (perder XP/racha) o basta con recompensas? Pista: los castigos suelen generar culpa y abandono.
- **P18.** Si llego al nivel 99, ¿qué sigue? ¿Hay "prestigio", nuevas skills o un nuevo ciclo?

### Recompensas reales

- **P19.** ¿Qué recompensa **real** me motivaría de verdad? Defínela ahora, para hitos concretos:
  - Nivel 10 → …
  - Nivel 20 → …
  - Terminar la certificación → …

### Antes de construir

- **P20.** Si solo pudiera añadir **UNA** mecánica nueva este mes, ¿cuál sería y qué comportamiento mejoraría? Escribe cómo sabré que funcionó.

> 💡 Regla práctica: añade **una mecánica a la vez** y úsala 2–3 semanas antes de sumar otra. Más sistemas no significa más motivación.

---

## 3. 🧱 Deuda técnica y aprendizaje

**Contexto:** el proyecto crece con ayuda de IA y estás aprendiendo diseño de software, arquitectura y programación a la vez. Eso es una **buena forma de aprender**, pero la IA produce código más rápido de lo que se entiende. La deuda técnica real no es "código feo", es **código que ya no puedes modificar con confianza**.

### Diagnóstico honesto

- **P-T1.** ¿Hay partes del código que **no podría explicar** con mis palabras? Lístalas. Esa es tu deuda más peligrosa.
- **P-T2.** ¿Qué parte me da **miedo tocar** porque podría romper algo? (Señal de falta de pruebas o de acoplamiento.)
- **P-T3.** Cuando agrego una función, ¿cuántos archivos debo editar? Si son muchos para algo simple, hay acoplamiento.
- **P-T4.** Hoy el **Excel es la base de datos**. ¿Qué pasaría si lo abro mientras el servidor escribe? ¿Si edito una celda a mano? ¿Si crece a miles de filas? ¿Debería ser solo un reporte?
- **P-T5.** Hay archivos grandes (`dashboard.js`, `i18n.js`, `timer.js`). ¿Hacen **una sola cosa** cada uno, o varias mezcladas?
- **P-T6.** El proyecto usa un espacio de nombres global (`StudyTracker`) en vez de módulos. ¿Entiendo la diferencia y qué ventaja daría migrar?
- **P-T7.** ¿Hay **pruebas automáticas**? Si no, ¿cómo sé que un cambio no rompió el cálculo de XP?

### Una estrategia realista (sin frenar tus ideas)

No necesitas dejar de crear para pagar deuda. Pagarla en pequeñas dosis:

1. **Regla del 80/20 de tiempo:** ~80% construir ideas, ~20% entender/ordenar. Programa la parte del 20%.
2. **Prueba primero lo que más duele si falla:** `js/domain/metrics.js` (XP, niveles, bonos). Es lógica pura, fácil de testear y el corazón del sistema.
3. **Regla del Boy Scout:** al tocar un archivo, déjalo un poco mejor (renombrar algo confuso, borrar código muerto, añadir un comentario del *por qué*).
4. **Un cambio = un commit pequeño** con mensaje claro. Facilita revertir.
5. **Registra decisiones** en `docs/DECISIONES.md`: "Elegí X porque Y". Tu yo del futuro (y la IA) lo agradecerán.
6. **Refactoriza con red de seguridad:** primero pruebas, luego reorganizar, nunca al revés.

### Plan de aprendizaje mínimo (orden sugerido)

Qué conceptos dan más retorno para ESTE proyecto:

| Orden | Concepto | Por qué importa aquí |
|:--:|----------|----------------------|
| 1 | Funciones puras y separación dominio/UI | Ya lo haces con `domain/`; entiende por qué funciona. |
| 2 | Pruebas unitarias (Node `node:test` o Vitest) | Cambiar sin miedo. |
| 3 | Módulos ES (`import`/`export`) | Reemplaza el `window.StudyTracker`. |
| 4 | Responsabilidad única (SRP) | Para dividir archivos de 700+ líneas. |
| 5 | Modelado de datos / esquemas | Para decidir Excel vs. SQLite y versionar columnas. |
| 6 | Git: ramas y commits atómicos | Experimentar sin romper lo estable. |

Recursos para buscar (por nombre): *"A Philosophy of Software Design"* (Ousterhout), *"Refactoring"* (Fowler), *"Clean Code"* (con criterio), MDN Web Docs, y la documentación de `node:test`.

### Preguntas de arquitectura para decidir con calma

- **P-T8.** ¿Quiero que esto siga siendo un proyecto **sin dependencias ni build**, o acepto herramientas (npm, bundler) a cambio de mejor estructura?
- **P-T9.** ¿Qué parte cambiaré con más frecuencia en los próximos 6 meses? (Ahí conviene invertir en orden.) ¿Y cuál casi nunca? (Ahí no.)
- **P-T10.** ¿Es el proyecto para **uso personal** o podría ser usado por otros? Cambia mucho lo que importa (seguridad, instalación, soporte).
- **P-T11.** `server.js` escribe archivos en disco: ¿valida lo que recibe? ¿Solo escucha en `localhost`? ¿Qué pasa si recibe datos malformados?

---

## 4. 🤖 Trabajar con IA y agentes sin perder el control

**Principio:** la IA debe **acelerar tu aprendizaje**, no reemplazarlo. Mismo tema que tu propio tracker: modo *Diálogo/Tutoría* vs. *Mecánico/Copy-Paste*.

### Buenas prácticas al pedir cambios

- **Pide el plan antes del código:** "Explícame cómo lo harías y qué archivos tocarías" → revisa → luego implementa.
- **Cambios pequeños y acotados:** "una cosa por vez" produce código que puedes revisar.
- **Exige explicación del por qué**, no solo del qué. Si no la entiendes, pide que lo explique más simple o con un ejemplo.
- **Pide pruebas junto con el cambio** (especialmente para lógica de XP/métricas).
- **Revisa el diff** antes de aceptar. Si no entiendes algo, pregunta antes de aceptarlo.
- **Haz commit antes** de cada cambio grande de la IA, para poder volver atrás.
- **Pídele a la IA que te cuestione**: "¿Qué problemas ves en este diseño? ¿Qué alternativas hay?"

### Plantillas de prompts útiles

> **Entender:** "Explícame `js/domain/metrics.js` como si fuera un desarrollador junior. ¿Qué hace cada función y por qué está separada del resto?"

> **Auditar:** "Revisa el proyecto y dime los 5 mayores riesgos de mantenimiento, ordenados por impacto. No cambies nada, solo explícalos."

> **Planear:** "Quiero agregar [idea]. Antes de escribir código, dame 2–3 opciones de diseño con pros y contras, y recomienda una."

> **Refactorizar seguro:** "Antes de refactorizar `dashboard.js`, escribe pruebas que fijen su comportamiento actual. Luego propón una división en módulos."

> **Aprender:** "Acabas de hacer este cambio. Dame 3 preguntas para comprobar que lo entendí y un ejercicio pequeño para practicarlo."

### Preguntas de autoevaluación

- **P21.** De los últimos 5 cambios hechos con IA, ¿cuántos **entendí** realmente antes de aceptarlos?
- **P22.** ¿Estoy usando la IA en modo *Tutoría* o *Copy-Paste* al programar? (Registra esto en el propio tracker 😉.)
- **P23.** ¿Qué concepto técnico me ha aparecido **más de 3 veces** sin entenderlo del todo? Ese es el siguiente tema de estudio.
- **P24.** ¿Podría reconstruir el módulo `timer.js` desde cero, aunque fuera más simple? Si no, ¿qué me falta?
- **P25.** ¿Tengo un archivo (ej. `AGENTS.md` / reglas del proyecto) que le explique a los agentes las convenciones, la arquitectura y lo que **no** deben tocar?

---

## 5. 🔁 Revisión periódica

Copia esta plantilla cada semana/mes y responde brevemente.

```markdown
### Revisión — AAAA-MM-DD

- Días estudiados: __ | Días registrados: __ (ratio: __%)
- ¿Registrar me costó esfuerzo esta semana? (1–5): __
- ¿Qué parte del tracker me motivó más? ______
- ¿Qué parte ignoré o me molestó? ______
- ¿Qué entendí del código esta semana que antes no? ______
- ¿Qué cambio con IA acepté sin entender? ______
- Idea nueva (→ pasarla a IDEAS.md): ______
- UNA cosa que probaré la próxima semana: ______
```

---

_Relacionado: [IDEAS.md](IDEAS.md)_

