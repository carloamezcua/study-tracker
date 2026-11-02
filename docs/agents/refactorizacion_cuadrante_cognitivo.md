# 🤖 PROMPT DE EJECUCIÓN ESTRICTA: Corrección del Cuadrante Analítico (Asimilación vs Calificación FSRS)

> **INSTRUCCIONES CRÍTICAS PARA EL AGENTE:**
>
> 1. **Contexto del Problema:** El gráfico de burbujas (Cuadrante de Rendimiento Cognitivo) actualmente grafica la columna numérica `Calidad` en el eje Y, pero erróneamente la etiqueta como "Asimilación (1-5)". Además, en la versión 3.2 actual, la `Calidad` pasó a ser la calificación FSRS (escala de 1 a 4).
> 2. **Objetivo:** Renombrar el eje Y a "Calificación FSRS (1-4)", ajustar la escala del gráfico y actualizar las leyendas HTML sin alterar el archivo CSV ni la lógica de guardado.
> 3. **Archivos a modificar:** Principalmente `js/ui/charts.js`, `js/ui/dashboard.js` (o donde se construyan las leyendas) y `index.html` (si los textos están estáticos en el DOM).
> 4. Revisar que otros problemas o deuda técnica surge con la refactorización que se hizo. Especialmente en la parte del dashboard ya que algunas columnas cambiaron de nombre o se quitarion.

## 🛠️ FASE 1: Ajuste del Gráfico en `js/ui/charts.js`

Busca la configuración de Chart.js correspondiente al **Cuadrante de Rendimiento Cognitivo** (usualmente un *Bubble Chart* que mapea `Uso_IA_Porcentaje` en X y `Calidad` en Y).

* [ ] **1.1. Actualizar la escala del Eje Y (FSRS 1-4):**
  En las opciones del gráfico (`options.scales.y`), modifica los valores mínimo y máximo, y actualiza el título del eje.

  ```javascript
  y: {
      min: 0.5, // Para dar margen debajo del 1
      max: 4.5, // Para dar margen arriba del 4
      title: {
          display: true,
          text: 'Calificación FSRS (1-4)' // ANTES: 'Asimilación (1-5)'
      },
      ticks: {
          stepSize: 1
      }
  }
  ```
* [ ] **1.2. Actualizar el Tooltip para mostrar la verdad completa:**
  En la configuración de los tooltips (`options.plugins.tooltip.callbacks`), modifica el callback `label` para que muestre claramente el número de FSRS y el texto real de Asimilación/Fluidez.

  ```javascript
  label: function(context) {
      const sesion = context.raw.rawSessionData; // Asegúrate de estar pasando la sesión original en los datos del gráfico
      const ia = context.parsed.x;
      const grade = context.parsed.y;
      // En v3.1/v3.2 el texto de asimilación está en Objetivo_Cumplido o calidad_asimilacion_fluidez
      const asimilacionText = sesion.Objetivo_Cumplido || sesion.calidad_asimilacion_fluidez || 'No registrado';
      const dinamica = sesion.Dinamica_Cognitiva || sesion.dinamica_cognitiva_real || 'Desconocida';

      return [
          `IA: ${ia}% | Grade FSRS: ⭐ ${grade}`,
          `Dinámica: ${dinamica}`,
          `Fluidez real: ${asimilacionText}`
      ];
  }
  ```

## 📝 FASE 2: Actualización de Textos y Leyendas en el DOM

Busca en `index.html` o en los scripts que inyectan el HTML del Dashboard (`js/ui/dashboard.js` / `js/ui/i18n.js`) los textos de la cabecera de este gráfico.

* [ ] **2.1. Título y Subtítulo del Gráfico:**

  * **Cambiar de:** "Cuadrante de Rendimiento Cognitivo (% IA vs. Asimilación)"
  * **Cambiar a:** "Cuadrante de Rendimiento Cognitivo (% IA vs. Calificación FSRS)"
* [ ] **2.2. Actualización de las 4 Tarjetas de Leyenda:**
  Las reglas de agrupación cambian porque el máximo ahora es 4. Actualiza los textos HTML:

  * **Sinergia IA:** Cambiar de `(≥35% IA, ⭐ 4-5)` a `(≥35% IA, ⭐ 3-4)`
  * **Dominio Propio:** Cambiar de `(<35% IA, ⭐ 4-5)` a `(<35% IA, ⭐ 3-4)`
  * **Ilusión Mecánica:** El texto se mantiene igual o similar: `(≥35% IA, ⭐ 1-2)`
  * **Fricción / Fatiga:** El texto se mantiene igual o similar: `(<35% IA, ⭐ 1-2)`

## 🧮 FASE 3: Ajuste en la lógica de conteo de las tarjetas (KPIs)

Si el dashboard muestra un conteo de cuántas sesiones caen en cada cuadrante (los números que aparecen al lado de las leyendas, ej: "Sinergia IA: 0"), el agente debe ajustar los condicionales (`if/else`) que suman estas variables.

* [ ] **3.1. Reemplazar los umbrales numéricos en JavaScript:**
  Busca el iterador que cuenta los puntos del cuadrante (probablemente un `.forEach` o `.reduce` sobre las sesiones) y ajusta la lógica:
  ```javascript
  // LÓGICA ACTUALIZADA PARA FSRS (1-4)
  const ia = Number(sesion.Uso_IA_Porcentaje) || 0;
  const grade = Number(sesion.Calidad) || 0;

  if (ia >= 35 && grade >= 3) {
      conteo.sinergia++;
  } else if (ia < 35 && grade >= 3) {
      conteo.dominio++;
  } else if (ia >= 35 && grade <= 2) {
      conteo.ilusion++;
  } else if (ia < 35 && grade <= 2) {
      conteo.friccion++;
  }
  ```

## ✅ Verificación Final para el Agente

1. Abrir la aplicación y navegar al Dashboard.
2. Comprobar visualmente que el eje Y llega solo hasta 4 (con un poco de margen visual).
3. Pasar el ratón sobre un punto del cuadrante y verificar que el *tooltip* muestre tanto el "Grade FSRS" como la "Fluidez real" en formato de texto.
4. Verificar que las etiquetas superiores digan "⭐ 3-4" en lugar de "4-5".
