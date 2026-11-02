# 🧠 Arquitectura de Asistente Metacognitivo (Chatbot + RAG) para StudyTracker v4

> **Objetivo:** Implementar un asistente de inteligencia artificial dentro de la aplicación capaz de responder dudas sobre la taxonomía del estudio, sugerir clasificaciones para sesiones complejas y consultar el historial de notas del usuario utilizando **RAG (Retrieval-Augmented Generation)**, manteniendo la arquitectura "Local-First".

---

## 🏗️ 1. Diseño de la Arquitectura y Stack Tecnológico

Para mantener la aplicación ligera y rápida, integraremos el chatbot directamente en tu servidor local de Node.js, comunicándose con una API de LLM (como OpenAI o Anthropic) pero guardando toda la memoria y vectores localmente.

*   **Frontend (React):** Un panel lateral deslizable (Offcanvas) o widget de chat estático con manejo de estado para el historial de la conversación y renderizado de Markdown.
*   **Backend (Node.js/Express):** Un endpoint `/api/chat` que maneje la lógica de RAG, la inyección del System Prompt y la llamada a la API del LLM.
*   **Base de Datos Vectorial (Local):** `sqlite-vec` (una extensión ultraligera para SQLite) o `LanceDB` para Node.js. Esto permite guardar los "Embeddings" localmente sin depender de bases de datos en la nube como Pinecone.
*   **Modelo LLM y Embeddings:** `gpt-4o-mini` (rápido y barato para razonamiento) y `text-embedding-3-small` para convertir texto a vectores. (También compatible con modelos locales vía *Ollama* si deseas 100% privacidad en el futuro).

---

## 🛠️ 2. Fase 1: Preparación del "Cerebro" (Base de Conocimiento)

Un modelo LLM genérico no conoce tus reglas. Necesitamos darle tu "Manifiesto" y definiciones.

### 2.1. El *System Prompt* Base (Contexto Estático)
Crear un archivo `src/server/ai/prompts.ts` que defina la personalidad y las reglas inmutables del asistente.
*Ejemplo:*
> "Eres el Asistente Metacognitivo de StudyTracker. Tu objetivo es ayudar al usuario a clasificar sus sesiones de estudio y reflexionar sobre su deuda cognitiva. Reglas: Si el usuario lee un paper y formula respuestas antes de ver la solución, es 'Construcción Generativa', no 'Consumo Receptivo'. Usa un tono amigable, socrático y experto en neurociencia del aprendizaje."

### 2.2. Ingesta de Datos para RAG (Contexto Dinámico)
No puedes meter todas tus sesiones pasadas en el System Prompt (excedería el límite de tokens). Aquí entra el RAG.
1.  **Script de Ingesta:** Un proceso que lea tus notas históricas del CSV/SQLite y los archivos de documentación (ADRs).
2.  **Embeddings:** Convierte estos textos en vectores numéricos usando la API de embeddings.
3.  **Almacenamiento:** Guarda estos vectores en una tabla especial de SQLite (ej. `notas_embeddings`).

---

## ⚙️ 3. Fase 2: El Pipeline RAG en el Backend (Node.js)

Cuando el usuario hace una pregunta (ej. *"Estudié un paper y la IA me corrigió, ¿qué pongo?"*), el backend ejecuta esta secuencia:

1.  **Recepción:** El endpoint `POST /api/chat` recibe el `{ mensaje: string, historial: array }`.
2.  **Vectorización de la Pregunta:** Convierte la pregunta del usuario en un vector.
3.  **Recuperación (Retrieval - La 'R' de RAG):** Hace una búsqueda de similitud de cosenos (*Cosine Similarity*) en SQLite para encontrar las 3 notas o reglas pasadas más relevantes a esa pregunta.
4.  **Aumentado (Augmented - La 'A'):** Inyecta esos resultados recuperados en el Prompt.
    *   *Prompt final:* `[System Prompt] + [Contexto Recuperado: Reglas sobre papers e IA] + [Pregunta del usuario]`
5.  **Generación (Generation - La 'G'):** Envía el prompt final a OpenAI.
6.  **Streaming:** Devuelve la respuesta al frontend en tiempo real (*Server-Sent Events*) para el efecto de "escribiendo...".

---

## 💻 4. Fase 3: Interfaz de Usuario (React)

Construir el componente `StudyCoachChat.tsx` en el frontend.

*   **UI/UX:** Una ventana de chat limpia superpuesta sobre el Dashboard.
*   **Estado:** Usar un custom hook `useChat()` para manejar los mensajes (usuario/asistente) y el estado de carga (`isLoading`).
*   **Markdown:** Usar librerías como `react-markdown` para que las respuestas del bot puedan incluir negritas, listas y bloques de código.
*   **Quick Actions:** Botones predefinidos encima del input de texto:
    *   ⚡ *"Ayúdame a clasificar mi última sesión"*
    *   📊 *"¿Por qué mi nivel de Deuda Cognitiva es crítico?"*
    *   🧠 *"Recomiéndame una estructura de repaso para hoy"*

---

## 🚀 5. Fase 4: Tool Calling (Interacción Activa) - *El Siguiente Nivel*

Una vez que el chat funcione para responder preguntas, puedes usar la función de **"Function Calling"** de los LLMs modernos.

En lugar de que el bot solo te *diga* qué hacer, el bot puede **hacerlo por ti**.
1. Le enseñas al LLM una herramienta llamada `guardar_sesion_estudio(materia, dinamica, estrategia, calidad)`.
2. Tú le dices al chat: *"Acabo de leer 3 horas sobre Docker, me costó mucho pero no usé IA"*.
3. El LLM razona tu texto, deduce las variables (Consumo Receptivo, Lucha Productiva, Sin IA) y ejecuta la función para **guardar la sesión en tu base de datos SQLite directamente desde el chat**, ahorrándote llenar el formulario manualmente.

---

## 📋 Resumen del Plan de Ejecución para el Agente (Checklist)

Cuando decidas implementar esto, pide a tu agente que ejecute los pasos en este orden estricto:

- [ ] **Paso 1:** Crear el endpoint `/api/chat` básico conectando la API del LLM elegido.
- [ ] **Paso 2:** Construir el componente UI de React (`StudyCoachChat.tsx`).
- [ ] **Paso 3:** Definir el `System Prompt` con la taxonomía de la v4.
- [ ] **Paso 4:** Implementar la base de datos vectorial local (ej. `sqlite-vec` o `LanceDB`).
- [ ] **Paso 5:** Crear el script para generar embeddings de las sesiones históricas.
- [ ] **Paso 6:** Integrar la búsqueda vectorial en el endpoint `/api/chat` (Pipeline RAG completo).