/**
 * Servidor Local de Sincronización Automática CSV (Cero dependencias externas).
 * Sirve el frontend en http://localhost:3000 y sincroniza en tiempo real
 * todas las altas, bajas y ediciones directamente sobre data/study-tracker.csv.
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, "data");
const CSV_FILE_PATH = path.join(DATA_DIR, "study-tracker.csv");
const CSV_RELATIVE_PATH = "data/study-tracker.csv";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function asegurarDirectorioDatos() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function enviarJSON(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function manejarApiStatus(req, res) {
  asegurarDirectorioDatos();
  const existe = fs.existsSync(CSV_FILE_PATH);
  let updatedAt = null;
  if (existe) {
    try {
      const stats = fs.statSync(CSV_FILE_PATH);
      updatedAt = stats.mtime.toISOString();
    } catch (_) {
      updatedAt = null;
    }
  }
  enviarJSON(res, 200, {
    ok: true,
    csvExists: existe,
    excelExists: existe,
    csvPath: CSV_RELATIVE_PATH,
    excelPath: CSV_RELATIVE_PATH,
    updatedAt
  });
}

function manejarGetCsv(req, res) {
  asegurarDirectorioDatos();
  if (!fs.existsSync(CSV_FILE_PATH)) {
    enviarJSON(res, 404, {
      ok: false,
      error: "NOT_FOUND",
      message: "El archivo CSV aún no existe en data/study-tracker.csv"
    });
    return;
  }

  try {
    const buffer = fs.readFileSync(CSV_FILE_PATH);
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[".csv"],
      "Content-Length": buffer.length,
      "Cache-Control": "no-store"
    });
    res.end(buffer);
  } catch (err) {
    enviarJSON(res, 500, {
      ok: false,
      error: err.code || "READ_ERROR",
      message: "No se pudo leer data/study-tracker.csv"
    });
  }
}

function manejarPutCsv(req, res) {
  asegurarDirectorioDatos();
  const chunks = [];

  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    const buffer = Buffer.concat(chunks);
    if (!buffer || buffer.length === 0) {
      enviarJSON(res, 400, {
        ok: false,
        error: "EMPTY_BODY",
        message: "No se recibieron datos para guardar en el archivo CSV."
      });
      return;
    }

    try {
      fs.writeFileSync(CSV_FILE_PATH, buffer);
      const stats = fs.statSync(CSV_FILE_PATH);
      enviarJSON(res, 200, {
        ok: true,
        csvPath: CSV_RELATIVE_PATH,
        excelPath: CSV_RELATIVE_PATH,
        updatedAt: stats.mtime.toISOString()
      });
    } catch (err) {
      if (err.code === "EBUSY" || err.code === "EPERM" || err.code === "EACCES") {
        enviarJSON(res, 423, {
          ok: false,
          error: "FILE_LOCKED",
          message:
            "El archivo data/study-tracker.csv está bloqueado por otro programa. Ciérralo y pulsa 'Sincronizar CSV'."
        });
        return;
      }

      enviarJSON(res, 500, {
        ok: false,
        error: err.code || "WRITE_ERROR",
        message: "Error al escribir en data/study-tracker.csv: " + err.message
      });
    }
  });
}

function servirArchivoEstatico(req, res, pathname) {
  const rutaRelativa = pathname === "/" ? "/index.html" : pathname;
  const rutaSegura = path.normalize(rutaRelativa).replace(/^(\.\.[/\\])+/, "");
  const archivoAbsoluto = path.join(ROOT_DIR, rutaSegura);

  if (!archivoAbsoluto.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end("Acceso denegado");
    return;
  }

  fs.stat(archivoAbsoluto, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Recurso no encontrado");
      return;
    }

    const ext = path.extname(archivoAbsoluto).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    fs.readFile(archivoAbsoluto, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Error interno leyendo archivo");
        return;
      }
      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-cache"
      });
      res.end(content);
    });
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  if (pathname === "/api/status" && req.method === "GET") {
    manejarApiStatus(req, res);
    return;
  }

  if ((pathname === "/api/csv" || pathname === "/api/excel") && req.method === "GET") {
    manejarGetCsv(req, res);
    return;
  }

  if ((pathname === "/api/csv" || pathname === "/api/excel") && req.method === "PUT") {
    manejarPutCsv(req, res);
    return;
  }

  servirArchivoEstatico(req, res, pathname);
});

server.listen(PORT, () => {
  asegurarDirectorioDatos();
  console.log("==========================================================");
  console.log(`🚀 StudyTracker ejecutándose en: http://localhost:${PORT}`);
  console.log(`📄 Archivo CSV vinculado:        ${CSV_RELATIVE_PATH}`);
  console.log("==========================================================");
});
