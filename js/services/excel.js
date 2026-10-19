/**
 * Capa de Servicios: Integración con archivos Excel (.xlsx) mediante SheetJS
 * y sincronización directa en disco con File System Access API.
 */
(function (global) {
  const StudyTracker = (global.StudyTracker = global.StudyTracker || {});
  const { calcularMinutos, calcularXP } = StudyTracker.RPG;

  let archivoExcelHandle = null;

  /**
   * Construye el objeto Workbook de SheetJS con pestaña de sesiones, fórmulas de Excel y guía.
   */
  function construirLibroExcel(sesiones) {
    const wb = XLSX.utils.book_new();
    const lista = Array.isArray(sesiones) ? sesiones : [];

    // Pestaña 1: Registro_Estudio (Sin columna Timestamp)
    const encabezados = [
      "Fecha",
      "Hora_Inicio",
      "Hora_Fin",
      "Materia",
      "Duracion_Minutos",
      "Calidad",
      "Uso_IA_Porcentaje",
      "XP_Ganados",
      "Notas"
    ];
    const filas = [encabezados];

    lista.forEach((s) => {
      filas.push([
        s.fecha,
        s.horaInicio,
        s.horaFin,
        s.materia,
        Number(s.duracion),
        Number(s.calidad),
        Number(s.usoIA) / 100, // Formato decimal para porcentaje en Excel
        Number(s.xp),
        s.notas || ""
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(filas);

    // Inyectar las fórmulas reales de Excel en Duracion_Minutos (Col E) y XP_Ganados (Col H)
    lista.forEach((s, idx) => {
      const r = idx + 2; // Fila 2 en adelante en Excel
      // E: Diferencia entre Hora_Fin (C) y Hora_Inicio (B) en minutos
      ws[`E${r}`] = {
        t: "n",
        f: `IF(OR(B${r}="",C${r}=""),"",MOD(TIMEVALUE(C${r})-TIMEVALUE(B${r}),1)*1440)`,
        v: Number(s.duracion)
      };
      // G: Formato de porcentaje
      if (ws[`G${r}`]) ws[`G${r}`].z = "0%";
      // H: Fórmula de XP Ganados
      ws[`H${r}`] = {
        t: "n",
        f: `IF(E${r}="","",ROUND(E${r}*(1+(F${r}*0.2)),0))`,
        v: Number(s.xp)
      };
    });

    ws["!cols"] = [
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 20 },
      { wch: 18 },
      { wch: 10 },
      { wch: 18 },
      { wch: 14 },
      { wch: 32 }
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Registro_Estudio");

    // Pestaña 2: Guia_y_Resumen (Con conteos automáticos y explicación de escalas)
    const guiaDatos = [
      ["RESUMEN DE RENDIMIENTO", "VALOR"],
      ["Total de Sesiones", { t: "n", f: "COUNTA(Registro_Estudio!D2:D1000)" }],
      ["Tiempo Total (Minutos)", { t: "n", f: "SUM(Registro_Estudio!E2:E1000)" }],
      ["Tiempo Total (Horas)", { t: "n", f: "SUM(Registro_Estudio!E2:E1000)/60" }],
      ["Promedio de Calidad (1-5)", { t: "n", f: "IFERROR(AVERAGE(Registro_Estudio!F2:F1000),0)" }],
      [
        "Promedio Uso de IA",
        { t: "n", f: "IFERROR(AVERAGE(Registro_Estudio!G2:G1000),0)", z: "0%" }
      ],
      ["Total XP Acumulados", { t: "n", f: "SUM(Registro_Estudio!H2:H1000)" }],
      ["Nivel Actual del Estudiante", { t: "n", f: "INT(SUM(Registro_Estudio!H2:H1000)/500)+1" }],
      [],
      ["GUÍA DE REFERENCIA RÁPIDA PARA NUEVOS USUARIOS", ""],
      ["Escala de Calidad (1 al 5)", "Significado"],
      ["1 - Muy bajo", "Distraído todo el tiempo, procrastinación constante, baja retención."],
      ["2 - Bajo", "Costó mucho mantener el foco, interrupciones frecuentes."],
      ["3 - Normal / Neutro", "Sesión estándar, se avanzó lo planeado con distracciones menores."],
      ["4 - Bueno", "Buen ritmo de trabajo, comprensión sólida y pocas distracciones."],
      ["5 - Flujo total", "Concentración profunda, el tiempo pasó volando y retención al máximo."],
      [],
      ["Escala de Uso de IA (0% a 100%)", "Significado"],
      [
        "0% (Autónomo)",
        "Estudio 100% autónomo (lectura, código o ejercicios resueltos sin asistencia)."
      ],
      [
        "25% - 50% (Híbrido)",
        "Estudio propio usando IA para aclarar dudas puntuales, explicar conceptos o depurar errores."
      ],
      [
        "75% - 100% (Dependencia)",
        "La IA resolvió la mayor parte del ejercicio o generó la respuesta directamente."
      ]
    ];
    const wsGuia = XLSX.utils.aoa_to_sheet(guiaDatos);
    wsGuia["!cols"] = [{ wch: 34 }, { wch: 75 }];
    XLSX.utils.book_append_sheet(wb, wsGuia, "Guia_y_Resumen");

    return wb;
  }

  /**
   * Extrae y normaliza las filas de un Workbook de SheetJS.
   */
  function extraerSesionesDesdeWorkbook(wb) {
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

    const nuevas = [];
    rows.forEach((r) => {
      const fecha = r.Fecha || r.fecha || "";
      const horaInicio = r.Hora_Inicio || r.horaInicio || "";
      const horaFin = r.Hora_Fin || r.horaFin || "";
      const materia = r.Materia || r.materia || "";
      if (!fecha && !materia) return;

      const duracion = Number(
        r.Duracion_Minutos || calcularMinutos(String(horaInicio), String(horaFin))
      );
      const calidad = Number(r.Calidad || 3);
      let rawIA = r.Uso_IA_Porcentaje !== undefined ? r.Uso_IA_Porcentaje : 0;
      if (typeof rawIA === "string") {
        rawIA = parseFloat(rawIA.replace("%", "")) || 0;
      } else if (rawIA <= 1 && rawIA > 0) {
        rawIA = Math.round(rawIA * 100);
      }

      const xp = Number(r.XP_Ganados || calcularXP(duracion, calidad));
      const notas = r.Notas || "";

      nuevas.push({
        fecha: String(fecha).slice(0, 10),
        horaInicio: String(horaInicio).slice(0, 5),
        horaFin: String(horaFin).slice(0, 5),
        materia: String(materia),
        duracion,
        calidad,
        usoIA: rawIA,
        xp,
        notas: String(notas)
      });
    });

    return nuevas;
  }

  /**
   * Descarga un archivo .xlsx con todas las sesiones y fórmulas activas.
   */
  function exportarExcelConFormulas(sesiones, nombreArchivo = "Tracker_Estudio_RPG.xlsx") {
    const wb = construirLibroExcel(sesiones);
    XLSX.writeFile(wb, nombreArchivo);
  }

  /**
   * Lee un objeto File (.xlsx, .xls, .csv) y resuelve con las sesiones extraídas.
   */
  function leerArchivoExcel(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve({ sesiones: [], nombreArchivo: "" });
        return;
      }
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const data = new Uint8Array(e.target.result);
          const wb = XLSX.read(data, { type: "array" });
          const sesiones = extraerSesionesDesdeWorkbook(wb);
          resolve({ sesiones, nombreArchivo: file.name });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Vincula un archivo .xlsx local usando File System Access API para lectura y escritura directa.
   */
  async function vincularArchivoLocal() {
    if (!global.showOpenFilePicker) {
      throw new Error("UNSUPPORTED_FS_API");
    }
    const [handle] = await global.showOpenFilePicker({
      types: [
        {
          description: "Archivo Excel",
          accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"]
          }
        }
      ],
      multiple: false
    });
    archivoExcelHandle = handle;
    const file = await handle.getFile();
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });
    const sesiones = extraerSesionesDesdeWorkbook(wb);

    return {
      sesiones,
      nombreArchivo: file.name
    };
  }

  /**
   * Sobreescribe automáticamente el archivo .xlsx vinculado en caso de estar activo.
   */
  async function guardarEnArchivoVinculado(sesiones) {
    if (!archivoExcelHandle) return false;
    try {
      const wb = construirLibroExcel(sesiones);
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const writable = await archivoExcelHandle.createWritable();
      await writable.write(
        new Blob([wbout], { type: "application/octet-stream" })
      );
      await writable.close();
      return true;
    } catch (err) {
      console.error("No se pudo sobreescribir el Excel automáticamente:", err);
      return false;
    }
  }

  function tieneArchivoVinculado() {
    return Boolean(archivoExcelHandle);
  }

  StudyTracker.ExcelService = {
    construirLibroExcel,
    exportarExcelConFormulas,
    leerArchivoExcel,
    vincularArchivoLocal,
    guardarEnArchivoVinculado,
    tieneArchivoVinculado
  };
})(window);

