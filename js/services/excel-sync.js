/**
 * Capa de Servicios (CSV Sync): Serialización y lectura nativa de CSV (RFC 4180, UTF-8 con BOM)
 * sin librerías externas (cero SheetJS). Todas las fórmulas (duración, XP, bonos y nivel RPG)
 * se calculan exclusivamente en JavaScript (js/domain/metrics.js).
 *
 * Soporta migración transparente al vuelo desde el esquema antiguo de 20 columnas al nuevo de 18 columnas.
 */
(function (global) {
  const StudyTracker = (global.StudyTracker = global.StudyTracker || {});
  const {
    migrarTipoActividad,
    migrarDominioPrevio,
    migrarDinamicaCognitiva,
    migrarEstadoObjetivo,
    formatearNotasConTema,
    extraerSubtemaDeNotas,
    calcularMinutos,
    calcularDiaSemana,
    calcularFranjaHoraria,
    calcularXP,
    inferirModoDisenoIA,
    inferirModalidadProcesamiento
  } = StudyTracker.RPG;

  let servidorLocalActivo = false;
  let archivoLocalHandle = null; // FileSystemFileHandle cuando se usa sin server.js

  // Esquema canónico v3.2 (22 columnas: 18 originales v3.1 + 4 nuevas v4.0)
  const CSV_HEADERS_V3_2 = [
    // --- 18 Columnas Originales (v3.1) ---
    "Fecha",
    "Dia_Semana",
    "Hora_Inicio",
    "Hora_Fin",
    "Franja_Horaria",
    "Contexto",
    "Materia",
    "Tipo_Actividad",
    "Dinamica_Cognitiva",
    "Uso_IA_Porcentaje",
    "Dominio_Previo",
    "Energia_Previa",
    "Complejidad",
    "Objetivo_Cumplido",
    "Duracion_Minutos",
    "Calidad",
    "XP_Ganados",
    "Notas",
    // --- 4 Columnas Nuevas (Puente v3.2 -> v4.0) ---
    "Estructura_Practica",
    "Modo_Diseno_IA",
    "Modalidad_Procesamiento_Efectiva",
    "Friccion_Discriminacion_Intercalada"
  ];
  const ENCABEZADOS_CSV = CSV_HEADERS_V3_2; // Alias retrocompatible

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
   * Construye el texto CSV completo de 22 columnas (con firma UTF-8 BOM para compatibilidad de acentos y emojis).
   * Todas las métricas (Duración, Franja Horaria de 6h y XP) se guardan ya calculadas por JavaScript.
   */
  function construirContenidoCSV(sesiones) {
    const lista = Array.isArray(sesiones) ? sesiones : [];
    const lineas = [CSV_HEADERS_V3_2.join(",")];

    lista.forEach((s) => {
      const duracion =
        Number(s.duracion || s.Duracion_Minutos) > 0
          ? Number(s.duracion || s.Duracion_Minutos)
          : calcularMinutos(s.horaInicio || s.Hora_Inicio, s.horaFin || s.Hora_Fin);
      const calidad = Math.min(4, Math.max(1, Number(s.calidad || s.Calidad) || 3));
      const complejidad = s.complejidad || s.Complejidad || "Desafiante";
      const objetivoCumplido = migrarEstadoObjetivo(s.objetivoCumplido || s.Objetivo_Cumplido);
      const usoIA = Math.min(100, Math.max(0, Math.round(Number(s.usoIA !== undefined ? s.usoIA : s.Uso_IA_Porcentaje) || 0)));
      const tipoActividad = migrarTipoActividad(s.tipoActividad || s.Tipo_Actividad);
      const dinamicaCognitiva = migrarDinamicaCognitiva(
        s.dinamicaCognitiva || s.Dinamica_Cognitiva,
        s.produccion || s.Produccion_Propia,
        s.modoIA || s.Modo_IA,
        usoIA
      );
      const dominioPrevio = migrarDominioPrevio(s.dominioPrevio || s.Dominio_Previo, tipoActividad);
      const notas = formatearNotasConTema(s.notas || s.Notas, s.tema || s.Tema);

      const estructuraPractica = s.Estructura_Practica || s.estructuraPractica || "Bloqueado";
      const modoDisenoIA =
        s.Modo_Diseno_IA ||
        s.modoDisenoIA ||
        s.modoDisenoIa ||
        (typeof inferirModoDisenoIA === "function"
          ? inferirModoDisenoIA({ usoIA, dinamicaCognitiva })
          : "Sin_IA");
      const modalidadProcesamiento =
        s.Modalidad_Procesamiento_Efectiva ||
        s.modalidadProcesamiento ||
        s.modalidadProcesamientoEfectiva ||
        (typeof inferirModalidadProcesamiento === "function"
          ? inferirModalidadProcesamiento({ usoIA, dinamicaCognitiva, calidad })
          : "Extraccion_Esforzada");
      const friccionIntercalada =
        estructuraPractica === "Intercalado"
          ? (s.Friccion_Discriminacion_Intercalada ||
             s.friccionIntercalada ||
             s.friccionDiscriminacionIntercalada ||
             "Sin_Friccion")
          : "";

      const xp = calcularXP(
        duracion,
        calidad,
        complejidad,
        objetivoCumplido,
        dinamicaCognitiva,
        usoIA,
        friccionIntercalada
      );

      const fila = [
        s.fecha || s.Fecha || "",
        calcularDiaSemana(s.fecha || s.Fecha),
        s.horaInicio || s.Hora_Inicio || "",
        s.horaFin || s.Hora_Fin || "",
        calcularFranjaHoraria(s.horaInicio || s.Hora_Inicio),
        s.contexto || s.Contexto || "Académico",
        s.materia || s.Materia || "General",
        tipoActividad,
        dinamicaCognitiva,
        usoIA,
        dominioPrevio,
        s.energiaPrevia || s.Energia_Previa || "Media",
        complejidad,
        objetivoCumplido,
        duracion,
        calidad,
        xp,
        notas,
        estructuraPractica,
        modoDisenoIA,
        modalidadProcesamiento,
        friccionIntercalada
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
   * Convierte el texto de un archivo CSV (18 columnas nuevas o 20 columnas legacy) en objetos de sesión normalizables,
   * aplicando las 4 reglas de migración automática y recalculando Franja Horaria y XP en JavaScript.
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
      const temaLegacy = r.Tema || r.tema || "";
      const tipoActividad = migrarTipoActividad(r.Tipo_Actividad || r.tipoActividad);

      let rawIA = r.Uso_IA_Porcentaje !== undefined ? r.Uso_IA_Porcentaje : "0";
      rawIA = parseFloat(String(rawIA).replace("%", "").replace(",", ".")) || 0;
      if (rawIA > 0 && rawIA <= 1) {
        rawIA = Math.round(rawIA * 100);
      } else {
        rawIA = Math.round(rawIA);
      }

      const dinamicaCognitiva = migrarDinamicaCognitiva(
        r.Dinamica_Cognitiva || r.dinamicaCognitiva,
        r.Produccion_Propia || r.produccion,
        r.Modo_IA || r.modoIA,
        rawIA
      );

      const dominioPrevio = migrarDominioPrevio(
        r.Dominio_Previo || r.dominioPrevio || r.Familiaridad || r.familiaridad,
        tipoActividad
      );
      const energiaPrevia = r.Energia_Previa || r.energiaPrevia || "Media";
      const complejidad = r.Complejidad || r.complejidad || "Desafiante";
      const objetivoCumplido = migrarEstadoObjetivo(r.Objetivo_Cumplido || r.objetivoCumplido);

      const duracion = calcularMinutos(horaInicio, horaFin) || Number(r.Duracion_Minutos || 0);
      const calidad = Math.min(4, Math.max(1, Number(r.Calidad || 3)));

      const notasUnificadas = formatearNotasConTema(r.Notas || r.notas || "", temaLegacy);
      const { subtema } = extraerSubtemaDeNotas(notasUnificadas, temaLegacy);

      // --- Soporte retrocompatible de 18 y 22 columnas (Puente v3.2 -> v4.0) ---
      const estructuraPractica = r.Estructura_Practica || r.estructuraPractica || "Bloqueado";
      const modoDisenoIA = r.Modo_Diseno_IA || r.modoDisenoIA || "";
      const modalidadProcesamiento =
        r.Modalidad_Procesamiento_Efectiva || r.modalidadProcesamiento || "";
      const friccionIntercalada =
        estructuraPractica === "Intercalado"
          ? (r.Friccion_Discriminacion_Intercalada || r.friccionIntercalada || "")
          : "";

      const xp = calcularXP(
        duracion,
        calidad,
        complejidad,
        objetivoCumplido,
        dinamicaCognitiva,
        rawIA,
        friccionIntercalada
      );

      nuevas.push({
        fecha: String(fecha).slice(0, 10),
        horaInicio: String(horaInicio).slice(0, 5),
        horaFin: String(horaFin).slice(0, 5),
        contexto,
        Contexto: contexto,
        materia,
        Materia: materia,
        tema: subtema,
        tipoActividad,
        Tipo_Actividad: tipoActividad,
        dinamicaCognitiva,
        Dinamica_Cognitiva: dinamicaCognitiva,
        produccion: dinamicaCognitiva,
        modoIA: dinamicaCognitiva,
        dominioPrevio,
        Dominio_Previo: dominioPrevio,
        energiaPrevia,
        Energia_Previa: energiaPrevia,
        complejidad,
        Complejidad: complejidad,
        objetivoCumplido,
        Objetivo_Cumplido: objetivoCumplido,
        duracion,
        Duracion_Minutos: duracion,
        calidad,
        Calidad: calidad,
        usoIA: rawIA,
        Uso_IA_Porcentaje: rawIA,
        xp,
        XP_Ganados: xp,
        notas: notasUnificadas,
        Notas: notasUnificadas,
        Estructura_Practica: estructuraPractica,
        Modo_Diseno_IA: modoDisenoIA,
        Modalidad_Procesamiento_Efectiva: modalidadProcesamiento,
        Friccion_Discriminacion_Intercalada: friccionIntercalada,
        estructuraPractica,
        modoDisenoIA,
        modoDisenoIa: modoDisenoIA,
        modalidadProcesamiento,
        modalidadProcesamientoEfectiva: modalidadProcesamiento,
        friccionIntercalada,
        friccionDiscriminacionIntercalada: friccionIntercalada
      });
    }

    return nuevas;
  }

  /**
   * Detecta si el texto CSV crudo aún tiene encabezados del esquema antiguo de 20 columnas.
   */
  function esEsquemaCSVLegacy(textoCSV) {
    const primeraLinea = String(textoCSV || "")
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)[0] || "";
    return (
      primeraLinea.includes("Produccion_Propia") ||
      primeraLinea.includes("Modo_IA") ||
      primeraLinea.includes(",Tema,")
    );
  }

  /**
   * Conecta al inicio con el servidor local (server.js).
   * Si data/study-tracker.csv ya existe en disco, carga sus sesiones;
   * si estaba en el formato antiguo de 20 columnas, lo migra automáticamente a las 18 columnas nuevas.
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

          // Si el archivo en disco aún tenía 20 columnas, persistir el nuevo formato de 18 columnas
          if (esEsquemaCSVLegacy(textoCSV) && sesiones.length > 0) {
            await guardarEnServidorLocal(sesiones);
          }

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
      } else if (esEsquemaCSVLegacy(texto) && sesiones.length > 0) {
        await guardarEnArchivoLocalNavegador(sesiones);
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
    CSV_HEADERS_V3_2,
    ENCABEZADOS_CSV,
    construirContenidoCSV,
    toCSV: construirContenidoCSV,
    extraerSesionesDesdeCSV,
    fromCSV: extraerSesionesDesdeCSV,
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

  if (typeof module !== "undefined" && module.exports) {
    module.exports = servicio;
  }
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));
