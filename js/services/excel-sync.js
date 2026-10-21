/**
 * Capa de Servicios (CSV Sync): Serialización y lectura nativa de CSV (RFC 4180, UTF-8 con BOM)
 * sin librerías externas (cero SheetJS). Todas las fórmulas (duración, XP, bonos y nivel RPG)
 * se calculan exclusivamente en JavaScript (js/domain/metrics.js).
 *
 * Soporta dos modos de sincronización:
 * 1. Servidor local (server.js -> data/study-tracker.csv): automático y sin pedir permisos.
 * 2. API nativa del navegador (File System Access API): permite vincular y sobreescribir
 *    un archivo .csv local directamente desde el navegador incluso sin ejecutar server.js.
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
  let archivoLocalHandle = null; // FileSystemFileHandle cuando se usa sin server.js

  const ENCABEZADOS_CSV = [
    "Fecha",
    "Dia_Semana",
    "Hora_Inicio",
    "Hora_Fin",
    "Franja_Horaria",
    "Contexto",
    "Materia",
    "Tema",
    "Tipo_Actividad",
    "Produccion_Propia",
    "Dominio_Previo",
    "Energia_Previa",
    "Complejidad",
    "Objetivo_Cumplido",
    "Duracion_Minutos",
    "Calidad",
    "Modo_IA",
    "Uso_IA_Porcentaje",
    "XP_Ganados",
    "Notas"
  ];

  /**
   * Escapa un valor individual según el estándar RFC 4180 para CSV.
   */
  function escaparCeldaCSV(valor) {
    const str = String(valor ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  /**
   * Construye el texto CSV completo (con firma UTF-8 BOM para compatibilidad de acentos y emojis).
   * Todas las métricas (Duración y XP) se guardan ya calculadas por JavaScript.
   */
  function construirContenidoCSV(sesiones) {
    const lista = Array.isArray(sesiones) ? sesiones : [];
    const lineas = [ENCABEZADOS_CSV.join(",")];

    lista.forEach((s) => {
      const duracion =
        Number(s.duracion) > 0
          ? Number(s.duracion)
          : calcularMinutos(s.horaInicio, s.horaFin);
      const calidad = Math.min(5, Math.max(1, Number(s.calidad) || 3));
      const complejidad = s.complejidad || "Desafiante";
      const objetivoCumplido = s.objetivoCumplido || "Sí";
      const usoIA = Math.min(100, Math.max(0, Math.round(Number(s.usoIA) || 0)));
      const modoIA = s.modoIA || (usoIA === 0 ? "Autónomo" : "Copiloto / Apoyo");
      const xp =
        Number(s.xp) > 0
          ? Number(s.xp)
          : calcularXP(duracion, calidad, complejidad, objetivoCumplido, modoIA);

      const fila = [
        s.fecha || "",
        s.diaSemana || calcularDiaSemana(s.fecha),
        s.horaInicio || "",
        s.horaFin || "",
        s.franjaHoraria || calcularFranjaHoraria(s.horaInicio),
        s.contexto || "Académico",
        s.materia || "General",
        s.tema || "General",
        s.tipoActividad || "Desarrollo / Código",
        s.produccion || "Reproducción",
        s.dominioPrevio || "Con lagunas",
        s.energiaPrevia || "Media",
        complejidad,
        objetivoCumplido,
        duracion,
        calidad,
        modoIA,
        usoIA,
        xp,
        s.notas || ""
      ];

      lineas.push(fila.map(escaparCeldaCSV).join(","));
    });

    return "\uFEFF" + lineas.join("\r\n") + "\r\n";
  }

  /**
   * Parsea un texto CSV (soporta comillas escapadas, saltos de línea en celdas y separador ',' o ';').
   */
  function parsearFilasCSV(textoCrudo) {
    const texto = String(textoCrudo || "").replace(/^\uFEFF/, "");
    if (!texto.trim()) return [];

    // Detectar automáticamente si la primera línea usa ';' (típico al guardar en Excel en español) o ','
    const primeraLineaFin = texto.indexOf("\n");
    const cabeceraMuestra = primeraLineaFin >= 0 ? texto.slice(0, primeraLineaFin) : texto;
    const delimitador =
      cabeceraMuestra.split(";").length > cabeceraMuestra.split(",").length ? ";" : ",";

    const filas = [];
    let filaActual = [];
    let celdaActual = "";
    let enComillas = false;

    for (let i = 0; i < texto.length; i++) {
      const char = texto[i];
      const sig = texto[i + 1];

      if (enComillas) {
        if (char === '"' && sig === '"') {
          celdaActual += '"';
          i++;
        } else if (char === '"') {
          enComillas = false;
        } else {
          celdaActual += char;
        }
      } else {
        if (char === '"') {
          enComillas = true;
        } else if (char === delimitador) {
          filaActual.push(celdaActual);
          celdaActual = "";
        } else if (char === "\r" && sig === "\n") {
          filaActual.push(celdaActual);
          filas.push(filaActual);
          filaActual = [];
          celdaActual = "";
          i++;
        } else if (char === "\n" || char === "\r") {
          filaActual.push(celdaActual);
          filas.push(filaActual);
          filaActual = [];
          celdaActual = "";
        } else {
          celdaActual += char;
        }
      }
    }

    if (celdaActual.length > 0 || filaActual.length > 0) {
      filaActual.push(celdaActual);
      filas.push(filaActual);
    }

    return filas;
  }

  /**
   * Convierte el texto de un archivo CSV en objetos de sesión normalizables,
   * recalculando Duración y XP en JavaScript cuando sea necesario.
   */
  function extraerSesionesDesdeCSV(textoCSV) {
    const matriz = parsearFilasCSV(textoCSV);
    if (matriz.length < 2) return [];

    const encabezados = matriz[0].map((h) => String(h || "").trim());
    const nuevas = [];

    for (let i = 1; i < matriz.length; i++) {
      const valores = matriz[i];
      if (!valores || valores.every((v) => !String(v || "").trim())) continue;

      const r = {};
      encabezados.forEach((colName, idx) => {
        r[colName] = valores[idx] !== undefined ? String(valores[idx]).trim() : "";
      });

      const fecha = r.Fecha || r.fecha || "";
      const horaInicio = r.Hora_Inicio || r.horaInicio || "";
      const horaFin = r.Hora_Fin || r.horaFin || "";
      const materia = r.Materia || r.materia || "";
      if (!fecha && !materia) continue;

      const contexto = r.Contexto || r.contexto || "Académico";
      const tema = r.Tema || r.tema || "General";
      const tipoActividad = r.Tipo_Actividad || r.tipoActividad || "Desarrollo / Código";
      const produccion = r.Produccion_Propia || r.produccion || "";
      // Acepta la columna nueva (Dominio_Previo) o la antigua (Familiaridad) para migrar archivos viejos
      const dominioPrevio = r.Dominio_Previo || r.dominioPrevio || "";
      const familiaridadLegacy = r.Familiaridad || r.familiaridad || "";
      const energiaPrevia = r.Energia_Previa || r.energiaPrevia || "Media";
      const complejidad = r.Complejidad || r.complejidad || "Desafiante";
      const objetivoCumplido = r.Objetivo_Cumplido || r.objetivoCumplido || "Sí";
      const modoIA = r.Modo_IA || r.modoIA || "";

      const duracion = calcularMinutos(horaInicio, horaFin) || Number(r.Duracion_Minutos || 0);
      const calidad = Math.min(5, Math.max(1, Number(r.Calidad || 3)));

      let rawIA = r.Uso_IA_Porcentaje !== undefined ? r.Uso_IA_Porcentaje : "0";
      rawIA = parseFloat(String(rawIA).replace("%", "").replace(",", ".")) || 0;
      if (rawIA > 0 && rawIA <= 1) {
        rawIA = Math.round(rawIA * 100);
      } else {
        rawIA = Math.round(rawIA);
      }

      const xp = calcularXP(duracion, calidad, complejidad, objetivoCumplido, modoIA || undefined);
      const notas = r.Notas || r.notas || "";

      nuevas.push({
        fecha: String(fecha).slice(0, 10),
        horaInicio: String(horaInicio).slice(0, 5),
        horaFin: String(horaFin).slice(0, 5),
        contexto,
        materia,
        tema,
        tipoActividad,
        produccion: produccion || undefined,
        dominioPrevio: dominioPrevio || undefined,
        familiaridad: familiaridadLegacy || undefined,
        energiaPrevia,
        complejidad,
        objetivoCumplido,
        duracion,
        calidad,
        modoIA: modoIA || undefined,
        usoIA: rawIA,
        xp,
        notas
      });
    }

    return nuevas;
  }

  /**
   * Conecta al inicio con el servidor local (server.js).
   * Si data/study-tracker.csv ya existe en disco, carga sus sesiones;
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
      const csvPath = status.csvPath || status.excelPath || "data/study-tracker.csv";

      if (status.csvExists || status.excelExists) {
        const resCsv = await fetch("/api/csv", { cache: "no-store" });
        if (resCsv.ok) {
          const textoCSV = await resCsv.text();
          const sesiones = extraerSesionesDesdeCSV(textoCSV);
          return {
            conectado: true,
            origen: "leido_de_disco",
            sesiones,
            excelPath: csvPath
          };
        }
      }

      const guardado = await guardarEnServidorLocal(sesionesActuales);
      return {
        conectado: guardado.ok,
        origen: "creado_en_disco",
        sesiones: sesionesActuales,
        excelPath: csvPath
      };
    } catch (_) {
      servidorLocalActivo = false;
      return { conectado: false };
    }
  }

  /**
   * Permite vincular directamente un archivo .csv local desde el navegador (sin server.js)
   * usando la File System Access API (Chrome / Edge).
   */
  async function vincularArchivoLocalNavegador(sesionesActuales) {
    if (typeof global.showOpenFilePicker !== "function") {
      return { ok: false, noSoportado: true };
    }
    try {
      const [handle] = await global.showOpenFilePicker({
        types: [
          {
            description: "Archivo CSV de StudyTracker",
            accept: { "text/csv": [".csv"] }
          }
        ],
        multiple: false
      });
      archivoLocalHandle = handle;
      const file = await handle.getFile();
      const texto = await file.text();
      const sesiones = extraerSesionesDesdeCSV(texto);
      if (sesiones.length === 0 && Array.isArray(sesionesActuales) && sesionesActuales.length > 0) {
        await guardarEnArchivoLocalNavegador(sesionesActuales);
      }
      return {
        ok: true,
        nombreArchivo: file.name,
        sesiones
      };
    } catch (err) {
      return { ok: false, cancelado: err.name === "AbortError" };
    }
  }

  /**
   * Escribe el contenido CSV directamente en el archivo vinculado vía File System Access API.
   */
  async function guardarEnArchivoLocalNavegador(sesiones) {
    if (!archivoLocalHandle) return { ok: false, desconectado: true };
    try {
      const contenidoCSV = construirContenidoCSV(sesiones);
      const writable = await archivoLocalHandle.createWritable();
      await writable.write(contenidoCSV);
      await writable.close();
      return {
        ok: true,
        excelPath: archivoLocalHandle.name,
        updatedAt: new Date().toISOString()
      };
    } catch (err) {
      return {
        ok: false,
        mensaje: "No se pudo escribir en el archivo CSV vinculado: " + err.message
      };
    }
  }

  /**
   * Guarda el CSV actualizado en el servidor local (data/study-tracker.csv)
   * o en el archivo local vinculado en el navegador si no hay servidor.
   */
  async function guardarEnServidorLocal(sesiones) {
    if (!servidorLocalActivo) {
      if (archivoLocalHandle) {
        return guardarEnArchivoLocalNavegador(sesiones);
      }
      return { ok: false, desconectado: true };
    }

    try {
      const contenidoCSV = construirContenidoCSV(sesiones);
      const res = await fetch("/api/csv", {
        method: "PUT",
        headers: {
          "Content-Type": "text/csv; charset=utf-8"
        },
        body: contenidoCSV
      });

      const payload = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          bloqueado: res.status === 423,
          mensaje: payload.message || "No se pudo actualizar el archivo CSV."
        };
      }

      return {
        ok: true,
        excelPath: payload.csvPath || payload.excelPath || "data/study-tracker.csv",
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
   * Recarga bajo demanda el archivo data/study-tracker.csv desde el servidor local o el archivo vinculado.
   */
  async function recargarDesdeServidorLocal() {
    if (!servidorLocalActivo && archivoLocalHandle) {
      const file = await archivoLocalHandle.getFile();
      const texto = await file.text();
      return extraerSesionesDesdeCSV(texto);
    }

    const resCsv = await fetch("/api/csv", { cache: "no-store" });
    if (!resCsv.ok) {
      throw new Error("No se encontró data/study-tracker.csv en el servidor.");
    }
    const textoCSV = await resCsv.text();
    const sesiones = extraerSesionesDesdeCSV(textoCSV);
    servidorLocalActivo = true;
    return sesiones;
  }

  /**
   * Descarga una copia de respaldo del archivo .csv en el navegador.
   */
  function exportarExcelConFormulas(sesiones, nombreArchivo = "study-tracker.csv") {
    const contenidoCSV = construirContenidoCSV(sesiones);
    const blob = new Blob([contenidoCSV], { type: "text/csv; charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo.endsWith(".csv") ? nombreArchivo : "study-tracker.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Lee un objeto File (.csv) subido manualmente por el usuario.
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
          const texto = String(e.target.result || "");
          const sesiones = extraerSesionesDesdeCSV(texto);
          resolve({ sesiones, nombreArchivo: file.name });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file, "utf-8");
    });
  }

  function estaServidorConectado() {
    return servidorLocalActivo || Boolean(archivoLocalHandle);
  }

  const servicio = {
    construirContenidoCSV,
    extraerSesionesDesdeCSV,
    inicializarConexionServidor,
    vincularArchivoLocalNavegador,
    guardarEnServidorLocal,
    recargarDesdeServidorLocal,
    exportarExcelConFormulas,
    leerArchivoExcel,
    estaServidorConectado
  };

  StudyTracker.CsvService = servicio;
  StudyTracker.ExcelService = servicio;
})(window);
