/**
 * Capa de Servicios: Construcción del libro Excel (.xlsx) con fórmulas nativas
 * y sincronización bidireccional en tiempo real con el servidor local (server.js -> data/study-tracker.xlsx).
 */
(function (global) {
  const StudyTracker = (global.StudyTracker = global.StudyTracker || {});
  const {
    calcularMinutos,
    calcularDiaSemana,
    calcularFranjaHoraria,
    calcularXP
  } = StudyTracker.RPG;

  let servidorLocalActivo = false;

  /**
   * Construye el objeto Workbook de SheetJS con pestaña de sesiones enriquecida (17 columnas),
   * fórmulas nativas de Excel (incluyendo bonos por complejidad, objetivo y nivel exponencial) y pestaña de guía.
   */
  function construirLibroExcel(sesiones) {
    const wb = XLSX.utils.book_new();
    const lista = Array.isArray(sesiones) ? sesiones : [];

    // Pestaña 1: Registro_Estudio (17 columnas analíticas)
    // A: Fecha | B: Dia_Semana | C: Hora_Inicio | D: Hora_Fin | E: Franja_Horaria
    // F: Contexto | G: Materia | H: Tema | I: Tipo_Actividad | J: Energia_Previa
    // K: Complejidad | L: Objetivo_Cumplido | M: Duracion_Minutos | N: Calidad
    // O: Uso_IA_Porcentaje | P: XP_Ganados | Q: Notas
    const encabezados = [
      "Fecha",
      "Dia_Semana",
      "Hora_Inicio",
      "Hora_Fin",
      "Franja_Horaria",
      "Contexto",
      "Materia",
      "Tema",
      "Tipo_Actividad",
      "Energia_Previa",
      "Complejidad",
      "Objetivo_Cumplido",
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
        s.diaSemana || calcularDiaSemana(s.fecha),
        s.horaInicio,
        s.horaFin,
        s.franjaHoraria || calcularFranjaHoraria(s.horaInicio),
        s.contexto || "Académico",
        s.materia,
        s.tema || "General",
        s.tipoActividad || "Código / Práctica",
        s.energiaPrevia || "Media",
        s.complejidad || "Desafiante",
        s.objetivoCumplido || "Sí",
        Number(s.duracion),
        Number(s.calidad),
        Number(s.usoIA) / 100, // Formato decimal para porcentaje en Excel
        Number(s.xp),
        s.notas || ""
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(filas);

    // Inyectar las fórmulas reales de Excel en Duracion_Minutos (Col M) y XP_Ganados (Col P)
    lista.forEach((s, idx) => {
      const r = idx + 2; // Fila 2 en adelante en Excel
      // M: Diferencia entre Hora_Fin (D) y Hora_Inicio (C) en minutos
      ws[`M${r}`] = {
        t: "n",
        f: `IF(OR(C${r}="",D${r}=""),"",MOD(TIMEVALUE(D${r})-TIMEVALUE(C${r}),1)*1440)`,
        v: Number(s.duracion)
      };
      // O: Formato de porcentaje
      if (ws[`O${r}`]) ws[`O${r}`].z = "0%";
      // P: Fórmula de XP Ganados con bonos por Complejidad (Col K) y Objetivo_Cumplido (Col L: Sí +10%, Parcial +5%)
      ws[`P${r}`] = {
        t: "n",
        f: `IF(M${r}="","",ROUND(M${r}*(1+(N${r}*0.2)+IF(K${r}="Muy difícil",0.2,IF(K${r}="Desafiante",0.1,0))+IF(L${r}="Sí",0.1,IF(L${r}="Parcial",0.05,0))),0))`,
        v: Number(s.xp)
      };
    });

    ws["!cols"] = [
      { wch: 12 }, // A: Fecha
      { wch: 13 }, // B: Dia_Semana
      { wch: 12 }, // C: Hora_Inicio
      { wch: 12 }, // D: Hora_Fin
      { wch: 15 }, // E: Franja_Horaria
      { wch: 16 }, // F: Contexto
      { wch: 20 }, // G: Materia
      { wch: 26 }, // H: Tema
      { wch: 19 }, // I: Tipo_Actividad
      { wch: 15 }, // J: Energia_Previa
      { wch: 15 }, // K: Complejidad
      { wch: 18 }, // L: Objetivo_Cumplido
      { wch: 18 }, // M: Duracion_Minutos
      { wch: 10 }, // N: Calidad
      { wch: 18 }, // O: Uso_IA_Porcentaje
      { wch: 14 }, // P: XP_Ganados
      { wch: 34 }  // Q: Notas
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Registro_Estudio");

    // Pestaña 2: Guia_y_Resumen (Con conteos automáticos y explicación de todas las escalas)
    const guiaDatos = [
      ["RESUMEN DE RENDIMIENTO", "VALOR"],
      ["Total de Sesiones", { t: "n", f: "COUNTA(Registro_Estudio!G2:G1000)" }],
      ["Tiempo Total (Minutos)", { t: "n", f: "SUM(Registro_Estudio!M2:M1000)" }],
      ["Tiempo Total (Horas)", { t: "n", f: "SUM(Registro_Estudio!M2:M1000)/60" }],
      ["Promedio de Calidad (1-5)", { t: "n", f: "IFERROR(AVERAGE(Registro_Estudio!N2:N1000),0)" }],
      [
        "Promedio Uso de IA",
        { t: "n", f: "IFERROR(AVERAGE(Registro_Estudio!O2:O1000),0)", z: "0%" }
      ],
      [
        "Tasa de Objetivos Cumplidos (Sí)",
        {
          t: "n",
          f: 'IFERROR(COUNTIF(Registro_Estudio!L2:L1000,"Sí")/COUNTA(Registro_Estudio!G2:G1000),0)',
          z: "0%"
        }
      ],
      [
        "Sesiones con Bloqueo (No)",
        { t: "n", f: 'COUNTIF(Registro_Estudio!L2:L1000,"No")' }
      ],
      ["Total XP Acumulados", { t: "n", f: "SUM(Registro_Estudio!P2:P1000)" }],
      [
        "Nivel Actual (Curva Exponencial 1-99)",
        { t: "n", f: "MIN(99,INT(1+7*(LN(1+SUM(Registro_Estudio!P2:P1000)/250)/LN(2))))" }
      ],
      [],
      ["GUÍA DE REFERENCIA RÁPIDA Y REGLAS DE NEGOCIO", ""],
      ["Variable", "Opciones y Regla Analítica"],
      [
        "Contexto / Propósito",
        "Académico (🎓) | Certificación (🏅) | Proyecto Propio (🚀) | Externo (🤝)"
      ],
      [
        "Materia vs. Tema",
        "Materia agrupa a nivel macro (ej. Snowflake, Base de Datos) y Tema detalla el contenido específico"
      ],
      [
        "Tipo de Actividad",
        "Código / Práctica (💻) | Teoría / Docs (📖) | Papel / Diseño (✍️) | Repaso / Test (🔁)"
      ],
      ["Energía Previa", "Alta (🔋) | Media (⚡) | Baja (🪫) — Permite medir fatiga vs. retención"],
      [
        "Complejidad del Tema",
        "Fácil (+0% XP) | Desafiante (+10% XP) | Muy difícil (+20% XP)"
      ],
      [
        "Objetivo Cumplido",
        "Sí (+10% XP: meta lograda) | Parcial (+5% XP: avance en progreso) | No (0% XP: bloqueo o distracción)"
      ],
      [
        "Curva de Nivel Exponencial",
        "XP(Nivel L) = REDONDEAR(250 * (2^((L-1)/7) - 1)). El XP requerido se duplica cada 7 niveles (el Nivel 92 es exactamente el 50% del Nivel 99)."
      ],
      [],
      ["Escala de Calidad (1 al 5)", "Significado"],
      ["1 - Muy bajo", "Distraído todo el tiempo, procrastinación constante, baja retención."],
      ["2 - Bajo", "Costó mucho mantener el foco, interrupciones frecuentes."],
      ["3 - Normal / Neutro", "Sesión estándar, se avanzó lo planeado con distracciones menores."],
      ["4 - Bueno", "Buen ritmo de trabajo, comprensión sólida y pocas distracciones."],
      ["5 - Flujo total", "Concentración profunda, el tiempo pasó volando y retención al máximo."]
    ];
    const wsGuia = XLSX.utils.aoa_to_sheet(guiaDatos);
    wsGuia["!cols"] = [{ wch: 36 }, { wch: 88 }];
    XLSX.utils.book_append_sheet(wb, wsGuia, "Guia_y_Resumen");

    return wb;
  }

  /**
   * Genera el binario ArrayBuffer (.xlsx) listo para enviarse al servidor o guardarse en disco.
   */
  function construirBufferExcel(sesiones) {
    const wb = construirLibroExcel(sesiones);
    return XLSX.write(wb, { bookType: "xlsx", type: "array" });
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

      const contexto = r.Contexto || r.contexto || "Académico";
      const tema = r.Tema || r.tema || "General";
      const tipoActividad = r.Tipo_Actividad || r.tipoActividad || "Código / Práctica";
      const energiaPrevia = r.Energia_Previa || r.energiaPrevia || "Media";
      const complejidad = r.Complejidad || r.complejidad || "Desafiante";
      const objetivoCumplido = r.Objetivo_Cumplido || r.objetivoCumplido || "Sí";

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

      const xp = Number(
        r.XP_Ganados || calcularXP(duracion, calidad, complejidad, objetivoCumplido)
      );
      const notas = r.Notas || "";

      nuevas.push({
        fecha: String(fecha).slice(0, 10),
        horaInicio: String(horaInicio).slice(0, 5),
        horaFin: String(horaFin).slice(0, 5),
        contexto: String(contexto),
        materia: String(materia),
        tema: String(tema),
        tipoActividad: String(tipoActividad),
        energiaPrevia: String(energiaPrevia),
        complejidad: String(complejidad),
        objetivoCumplido: String(objetivoCumplido),
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
   * Conecta al inicio con el servidor local (server.js).
   * Si data/study-tracker.xlsx ya existe en disco, carga sus sesiones;
   * si no existe, lo crea automáticamente con las sesiones iniciales.
   */
  async function inicializarConexionServidor(sesionesActuales) {
    if (global.location.protocol === "file:") {
      servidorLocalActivo = false;
      return { conectado: false, razon: "MODO_ARCHIVO_LOCAL" };
    }

    try {
      const resStatus = await fetch("/api/status", { cache: "no-store" });
      if (!resStatus.ok) {
        servidorLocalActivo = false;
        return { conectado: false };
      }

      const status = await resStatus.json();
      servidorLocalActivo = true;

      if (status.excelExists) {
        const resExcel = await fetch("/api/excel", { cache: "no-store" });
        if (resExcel.ok) {
          const buffer = await resExcel.arrayBuffer();
          const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });
          const sesiones = extraerSesionesDesdeWorkbook(wb);
          return {
            conectado: true,
            origen: "leido_de_disco",
            sesiones,
            excelPath: status.excelPath
          };
        }
      }

      // Si el Excel aún no existe en data/study-tracker.xlsx, lo creamos automáticamente
      const guardado = await guardarEnServidorLocal(sesionesActuales);
      return {
        conectado: guardado.ok,
        origen: "creado_en_disco",
        sesiones: sesionesActuales,
        excelPath: status.excelPath
      };
    } catch (_) {
      servidorLocalActivo = false;
      return { conectado: false };
    }
  }

  /**
   * Envía el libro Excel actualizado al servidor local para escribirlo en data/study-tracker.xlsx.
   */
  async function guardarEnServidorLocal(sesiones) {
    if (!servidorLocalActivo) {
      return { ok: false, desconectado: true };
    }

    try {
      const wbout = construirBufferExcel(sesiones);
      const res = await fetch("/api/excel", {
        method: "PUT",
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        },
        body: new Blob([wbout], { type: "application/octet-stream" })
      });

      const payload = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          bloqueado: res.status === 423,
          mensaje: payload.message || "No se pudo actualizar el archivo Excel."
        };
      }

      return {
        ok: true,
        excelPath: payload.excelPath,
        updatedAt: payload.updatedAt
      };
    } catch (err) {
      return {
        ok: false,
        mensaje: "Error de red con el servidor local: " + err.message
      };
    }
  }

  /**
   * Recarga bajo demanda el archivo data/study-tracker.xlsx desde el servidor local
   * (útil si el usuario hizo cambios manuales directamente en Microsoft Excel).
   */
  async function recargarDesdeServidorLocal() {
    const resExcel = await fetch("/api/excel", { cache: "no-store" });
    if (!resExcel.ok) {
      throw new Error("No se encontró data/study-tracker.xlsx en el servidor.");
    }
    const buffer = await resExcel.arrayBuffer();
    const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });
    const sesiones = extraerSesionesDesdeWorkbook(wb);
    servidorLocalActivo = true;
    return sesiones;
  }

  /**
   * Descarga una copia del archivo .xlsx en el navegador.
   */
  function exportarExcelConFormulas(sesiones, nombreArchivo = "study-tracker.xlsx") {
    const wb = construirLibroExcel(sesiones);
    XLSX.writeFile(wb, nombreArchivo);
  }

  /**
   * Lee un objeto File (.xlsx, .xls, .csv) subido manualmente por el usuario.
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

  function estaServidorConectado() {
    return servidorLocalActivo;
  }

  StudyTracker.ExcelService = {
    construirLibroExcel,
    inicializarConexionServidor,
    guardarEnServidorLocal,
    recargarDesdeServidorLocal,
    exportarExcelConFormulas,
    leerArchivoExcel,
    estaServidorConectado
  };
})(window);

