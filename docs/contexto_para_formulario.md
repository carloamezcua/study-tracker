
# 🤖 Guía de Ingesta para Agente Antigravity: Reglas y Casos Límite del Formulario (v3.2/v4.0)

**Directiva Principal para Antigravity:** El objetivo de este formulario dividido en 2 tiempos (Planificación vs. Realidad) no es que los datos coincidan, sino auditar la brecha de intención. Nunca corrijas al usuario si su Tiempo 2 contradice al Tiempo 1; esa discrepancia es la que calcula la "Deuda Cognitiva".

---

## ⏱️ TIEMPO 1: CONFIGURACIÓN (ANTES DE ESTUDIAR)

*Aquí el usuario define su intención y estado actual.*

### 1. Dominio Previo (Nivel de maestría actual)

No se basa en cuánto tiempo ha invertido el usuario, sino en su **autonomía real en este exacto momento**.

* **🌱 Nuevo:**
* *Definición:* Cero contactos previos o conocimiento completamente borrado.
* *Cuándo SÍ:* Es el primer Pomodoro sobre un framework; o lo vio hace 2 años y no recuerda absolutamente nada.
* *Cuándo NO:* Si ya vio una clase ayer, ya no es nuevo.
* **🌿 En Construcción:**
* *Definición:* Hay noción, pero existe dependencia de recursos externos para avanzar.
* *Cuándo SÍ:* Entiende el concepto, pero si cierra la documentación o ChatGPT, se queda atascado.
* *Caso raro:* Resolvió un ejercicio idéntico hace una hora, pero intentó repetirlo a ciegas y falló. Vuelve a ser "En construcción".
* **🌳 Consolidado:**
* *Definición:* Autonomía total.
* *Cuándo SÍ:* Puede explicarlo, aplicarlo o programarlo sin mirar tutoriales ni usar IA.
* *Caso raro:* Si solo está haciendo una sesión de mantenimiento (flashcards fáciles) sobre un tema que ya domina.

### 2. Estrategia Técnica Planificada (La intención)

Mapeo exacto de las actividades históricas (v3) a la taxonomía (v4).

* **📖 Consumo Receptivo (Antes "Estudio Teórico" / "Clase"):**
* *Definición:* Absorber información (leer docs, ver videos, ir a clases en vivo).
* *Caso raro:* Si planea leer documentación el 80% del tiempo y escribir una línea de código al final, el propósito principal es Consumo.
* **🛠️ Construcción Generativa (Antes "Síntesis" / "Desarrollo"):**
* *Definición:* Producir un artefacto nuevo (escribir código nuevo, redactar apuntes o arquitectura).
* *Cuándo NO:* No se usa para corregir errores existentes o hacer ejercicios cortos de algoritmos (eso es recuperación).
* **🧠 Recuperación Activa (Antes "Práctica" / "Debugging" / "Simulacro"):**
* *Definición:* Esforzarse por recordar o desentrañar un problema cerrado.
* *Casos raros:* Depurar un *bug* durante 2 horas es Recuperación Activa porque el código ya existe y está intentando encontrar el fallo aislando variables.
* **⚡ Delegación Ejecutiva:**
* *Definición:* Usar herramientas o IA para automatizar la creación de un entregable.

### 3. Estructura Práctica

* **🧱 Bloqueado (Default 90%):** Estudiar UN solo tema o dominio durante todo el bloque. *Ejemplo: Una hora entera sobre "React Hooks".*
* **🔀 Intercalado:** Estudiar de forma intencionalmente desordenada para forzar al cerebro a cambiar de contexto. *Ejemplo: Un simulacro de examen que mezcla preguntas de 5 materias diferentes al azar.* Solo aquí se habilitará la "Fricción de Discriminación" en el Tiempo 2.

---

## ⏱️ TIEMPO 2: EVALUACIÓN (AL FINALIZAR)

*Aquí el usuario reporta la ejecución cruda, sin juicios de valor.*

### 1. Dinámica Cognitiva Real (El rol de la IA y el usuario)

* **👀 Recepción Pasiva (Modificador 0%):**
* *Caso raro:* Planeaba hacer "Construcción" pero se topó con un problema y se pasó toda la sesión viendo a alguien explicarlo en YouTube. Terminó sin escribir nada.
* **🤖 Delegación Mecánica (Penaliza -15% si IA $\ge 50\%$):**
* *Definición:* La fuente hizo el trabajo, el usuario fue un conducto mecánico.
* *Casos raros:* Le pidió a ChatGPT que hiciera el script, lo pegó, funcionó y cerró el editor. También aplica si copió un tutorial de YouTube línea por línea sin entender el porqué.
* **🔄 Andamiaje / Co-creación (Bono +5%):**
* *Definición:* Pensar en equipo con la IA.
* *Casos raros:* Se atascó con un error de compilación, le pasó el log a la IA, la IA le dio una pista, el usuario lo dedujo y corrigió la sintaxis por su cuenta.
* **🧠 Generación Propia (Bono +10% con $0\%$ IA):**
* *Definición:* El esfuerzo salió de la propia mente.
* *Casos raros:* Escribió toda la arquitectura por sí mismo y usó a la IA un 5% solo para generar un *dummy text* (lorem ipsum). Sigue siendo Generación Propia.

### 2. Fluidez del Bloque (Calidad de asimilación temporal)

Mide cómo se sintió la gestión del tiempo y la frustración.

* **🌊 Flujo Limpio:** Entró en "la zona". El tiempo voló y no hubo interrupciones.
* **🧗 Lucha Productiva:** Hubo sufrimiento mental intenso, frustración, se rompió la cabeza pensando, *pero logró desatorarse y aprender*. (Nota: Otorga el mismo bono de XP que el Flujo Limpio para no castigar el aprendizaje difícil).
* **🚧 Con Fricción:** Demasiados bloqueos técnicos, interrupciones o el avance fue casi nulo a pesar del esfuerzo.
* **🛑 Parálisis / Abandono:** Tiró la toalla, se distrajo severamente a mitad del Pomodoro o cerró el proyecto por estrés excesivo (0% bono).

### 3. Fricción Intercalada (Condicional)

(Antigravity: Solo evalúa esto si Estructura Práctica fue "Intercalado")

* **Fricción Productiva:** Confundir los temas al principio hizo que los entendiera mejor al final.
* **Confusión Excesiva:** Mezclar los temas fue un error, terminó sin entender ninguno de los dos.

### 4. Calificación FSRS (Grade 1 al 4)

Aplicado al bloque general.

* **1 (Again):** "Terminé la sesión y si me preguntas del tema mañana, no me acordaré". Ocurrió un bloqueo total.
* **2 (Hard):** "Lo saqué, pero sudé sangre". Máxima fatiga cognitiva.
* **3 (Good):** "Lo resolví bien, tuve que pensarlo unos segundos, pero todo en orden" (Smart Default).
* **4 (Easy):** "Fue un paseo por el parque. Demasiado fácil para mi nivel actual".

---

Con este documento, cuando estés llenando el formulario y te surja una duda como: *"Planeaba hacer código, pero me dio un error de Docker, me pasé 40 minutos leyendo foros, le pregunté a ChatGPT, me dio la solución y la copié"*...

Antigravity te dirá instantáneamente:

* **Tiempo 1:** Tu estrategia planificada era *Construcción Generativa* (tu intención original).
* **Tiempo 2:** Tu dinámica real mutó a *Delegación Mecánica* (copiaste la solución de ChatGPT) con un $\%$ de IA alto, y tu modalidad efectiva fue *Copia Pasiva*.
* **Resultado del sistema:** Calculará un Índice de **Deuda Cognitiva Crítica**, advirtiéndote que tu código funciona, pero no tienes idea de por qué.
