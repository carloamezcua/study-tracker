# 🤖 PROMPT DE EJECUCIÓN ESTRICTA: Refactorización del Sistema de XP y Rangos

> **INSTRUCCIONES CRÍTICAS PARA EL AGENTE:**
> 1. Modificar el sistema de progresión y experiencia (probablemente en `js/domain/metrics.js` o donde se calcule el nivel actual).
> 2. Eliminar cualquier límite de nivel (Hard Cap, ej. `Math.min(99, nivel)`). El nuevo sistema es **infinito**.
> 3. Implementar la nueva fórmula cuadrática exacta detallada abajo.

## 1. Nueva Fórmula Matemática Cuadrática

Reemplazar la antigua fórmula exponencial (estilo RuneScape) por la nueva progresión cuadrática donde el Nivel 2 requiere exactamente 100 XP y el incremento crece linealmente.

**Implementar las siguientes dos funciones (o reemplazar la lógica equivalente en el código):**

```javascript
/**
 * Calcula la experiencia total necesaria para alcanzar un nivel específico.
 * Fórmula: 50 * Nivel * (Nivel - 1)
 */
export function calcularXpParaNivel(nivel) {
    if (nivel <= 1) return 0;
    return 50 * nivel * (nivel - 1);
}

/**
 * Calcula el nivel actual basado en la experiencia total acumulada.
 * Utiliza el despeje de la ecuación cuadrática.
 */
export function calcularNivel(xp) {
    if (xp < 100) return 1;
    // Fórmula cuadrática despejada: L = (1 + sqrt(1 + 0.08 * xp)) / 2
    return Math.floor((1 + Math.sqrt(1 + 0.08 * xp)) / 2);
}
```

*Atención al Agente:* Si en el proyecto original la lógica para calcular el progreso porcentual entre un nivel y el siguiente dependía del Nivel 99, debe ajustarse para que siempre mida la distancia entre `XP del Nivel Actual` y `XP del Siguiente Nivel`.

## 2. Nueva Tabla de Rangos Profesionales

Sustituir el arreglo constante `TRAMOS_RANGO` por la siguiente taxonomía de 16 niveles orientada a la competencia profesional y maestría. Como el nivel es infinito, el último rango abarca cualquier nivel superior a 200.

```javascript
export const TRAMOS_RANGO = [
    { minNivel: 200, titulo: "Visionario" },
    { minNivel: 150, titulo: "Autoridad" },
    { minNivel: 120, titulo: "Maestro" },
    { minNivel: 100, titulo: "Élite" },
    { minNivel: 80,  titulo: "Senior" },
    { minNivel: 70,  titulo: "Experto" },
    { minNivel: 60,  titulo: "Referente" },
    { minNivel: 50,  titulo: "Consolidado" },
    { minNivel: 40,  titulo: "Experimentado" },
    { minNivel: 30,  titulo: "Estratega" },
    { minNivel: 25,  titulo: "Táctico" },
    { minNivel: 20,  titulo: "Metódico" },
    { minNivel: 15,  titulo: "Especialista" },
    { minNivel: 10,  titulo: "Analista" },
    { minNivel: 5,   titulo: "Practicante" },
    { minNivel: 1,   titulo: "Iniciado" }
];
```

## 3. Revisión de Interfaz Gráfica (UI)

* **Limpieza de Limitadores:** Buscar en la interfaz (ej. `js/ui/dashboard.js`, `js/app.js` o en los componentes de React si ya fueron migrados) cualquier cadena de texto que diga `"/ 99"` o que fije el nivel máximo visual. El nivel debe mostrarse simplemente como `Nivel X` (sin un límite superior explícito).
* **Verificación de Barra de Progreso:** La barra de progreso de la UI debe llenarse calculando:
  * `xpInicioNivel = calcularXpParaNivel(nivelActual)`
  * `xpMetaNivel = calcularXpParaNivel(nivelActual + 1)`
  * `porcentaje = ((xpActual - xpInicioNivel) / (xpMetaNivel - xpInicioNivel)) * 100`

Ejecutar estos cambios manteniendo intacta la recolección y guardado de los XP obtenidos en el CSV o SQLite.