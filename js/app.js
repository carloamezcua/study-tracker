/**
 * Punto de Entrada (Controlador Principal):
 * Conecta el Store reactivo (CRUD completo) con la capa de UI
 * y la sincronización automática en tiempo real con data/study-tracker.xlsx.
 */
(function (global) {
  const StudyTracker = (global.StudyTracker = global.StudyTracker || {});
  const { store, UI, ExcelService } = StudyTracker;

  function manejarEditarSesion(sesion) {
    UI.cargarSesionEnFormulario(sesion);
  }

  function manejarEliminarSesion(id) {
    if (UI.obtenerIdSesionEditando() === id) {
      UI.salirModoEdicion();
    }
    store.eliminarSesionPorId(id);
  }

  /**
   * Envía las sesiones actuales al servidor local para sobreescribir data/study-tracker.xlsx.
   */
  async function sincronizarConServidor(sesiones) {
    if (!ExcelService.estaServidorConectado()) return;

    const resultado = await ExcelService.guardarEnServidorLocal(sesiones);
    if (resultado.ok) {
      const hora = new Date().toLocaleTimeString().slice(0, 5);
      UI.actualizarEstadoArchivo(
        `🟢 Sincronizado en vivo: ${resultado.excelPath} (${hora})`,
        "connected"
      );
    } else if (resultado.bloqueado) {
      UI.actualizarEstadoArchivo(
        "⚠️ Archivo abierto en Excel — Ciérralo y pulsa 'Sincronizar'",
        "warning"
      );
    } else if (resultado.mensaje) {
      UI.actualizarEstadoArchivo(`⚠️ ${resultado.mensaje}`, "warning");
    }
  }

  function vincularEventosDOM() {
    // Barra de filtro rápido por Contexto en el Dashboard
    const filterBar = document.getElementById("contextFilterBar");
    if (filterBar) {
      filterBar.addEventListener("click", (e) => {
        const pill = e.target.closest(".filter-pill");
        if (!pill) return;
        UI.cambiarFiltroContexto(pill.dataset.filter);
        UI.renderizarDashboard(store.getSesiones(), {
          onEditarSesion: manejarEditarSesion,
          onEliminarSesion: manejarEliminarSesion
        });
      });
    }

    // Selectores de chips de 1 clic (Contexto, Actividad, Energía, Complejidad y Objetivo)
    document.querySelectorAll(".chip-group").forEach((grupoEl) => {
      const nombreGrupo = grupoEl.dataset.group;
      grupoEl.addEventListener("click", (e) => {
        const btn = e.target.closest(".chip-btn");
        if (!btn) return;
        UI.seleccionarChip(nombreGrupo, btn.dataset.value);
      });
    });

    // Formulario principal: soporta tanto Crear como Editar una sesión existente
    const form = document.getElementById("studyForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const chips = UI.obtenerValoresChips();
        const datosFormulario = {
          fecha: document.getElementById("fecha").value,
          horaInicio: document.getElementById("horaInicio").value,
          horaFin: document.getElementById("horaFin").value,
          contexto: chips.contexto,
          materia: document.getElementById("materia").value.trim(),
          tema: document.getElementById("tema").value.trim(),
          tipoActividad: chips.tipoActividad,
          energiaPrevia: chips.energiaPrevia,
          complejidad: chips.complejidad,
          objetivoCumplido: chips.objetivoCumplido,
          calidad: Number(document.getElementById("calidad").value),
          usoIA: Number(document.getElementById("usoIA").value),
          notas: document.getElementById("notas").value.trim()
        };

        const idEditando = UI.obtenerIdSesionEditando();
        if (idEditando) {
          store.actualizarSesionPorId(idEditando, datosFormulario);
          UI.salirModoEdicion();
        } else {
          store.agregarSesion(datosFormulario);
          document.getElementById("tema").value = "";
          document.getElementById("notas").value = "";
        }
      });
    }

    // Botón para cancelar la edición de una sesión
    const btnCancelEdit = document.getElementById("btnCancelEdit");
    if (btnCancelEdit) {
      btnCancelEdit.addEventListener("click", () => {
        UI.salirModoEdicion();
        UI.inicializarFormulario();
      });
    }

    // Campos que actualizan la vista previa de duración y XP
    const inputInicio = document.getElementById("horaInicio");
    const inputFin = document.getElementById("horaFin");
    const selectCalidad = document.getElementById("calidad");
    const inputUsoIA = document.getElementById("usoIA");

    if (inputInicio) inputInicio.addEventListener("change", UI.actualizarPreview);
    if (inputFin) inputFin.addEventListener("change", UI.actualizarPreview);
    if (selectCalidad) {
      selectCalidad.addEventListener("change", () => {
        UI.actualizarAyudaCalidad();
        UI.actualizarPreview();
      });
    }
    if (inputUsoIA) {
      inputUsoIA.addEventListener("input", UI.actualizarAyudaIA);
    }

    // Botones rápidos de hora actual
    const btnHoraInicio = document.getElementById("btnHoraInicioActual");
    const btnHoraFin = document.getElementById("btnHoraFinActual");
    if (btnHoraInicio) {
      btnHoraInicio.addEventListener("click", () => UI.ponerHoraActual("horaInicio"));
    }
    if (btnHoraFin) {
      btnHoraFin.addEventListener("click", () => UI.ponerHoraActual("horaFin"));
    }

    // Botón: Sincronizar / Guardar manualmente en el Excel del servidor
    const btnSincronizarServidor = document.getElementById("btnSincronizarServidor");
    if (btnSincronizarServidor) {
      btnSincronizarServidor.addEventListener("click", async () => {
        if (!ExcelService.estaServidorConectado()) {
          const conexion = await ExcelService.inicializarConexionServidor(store.getSesiones());
          if (!conexion.conectado) {
            alert(
              "El servidor local no está activo. Ejecuta 'start.bat' o 'npm start' para activar el guardado directo en data/study-tracker.xlsx."
            );
            return;
          }
        }
        await sincronizarConServidor(store.getSesiones());
      });
    }

    // Botón: Recargar desde data/study-tracker.xlsx (por si editaste el archivo directo en Excel)
    const btnRecargarExcel = document.getElementById("btnRecargarExcel");
    if (btnRecargarExcel) {
      btnRecargarExcel.addEventListener("click", async () => {
        try {
          const sesionesDisco = await ExcelService.recargarDesdeServidorLocal();
          UI.salirModoEdicion();
          store.reemplazarSesiones(sesionesDisco, "servidor_recarga");
          UI.actualizarEstadoArchivo(
            "🟢 Recargado desde: data/study-tracker.xlsx",
            "connected"
          );
        } catch (err) {
          alert(
            "No se pudo leer data/study-tracker.xlsx desde el servidor local. Asegúrate de haber iniciado 'start.bat' o 'npm start'."
          );
        }
      });
    }

    // Importar un archivo .xlsx externo manualmente
    const inputImportar = document.getElementById("importInput");
    if (inputImportar) {
      inputImportar.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        try {
          const { sesiones, nombreArchivo } = await ExcelService.leerArchivoExcel(file);
          if (sesiones.length > 0) {
            UI.salirModoEdicion();
            store.reemplazarSesiones(sesiones, "importar");
            if (!ExcelService.estaServidorConectado()) {
              UI.actualizarEstadoArchivo(`Cargado: ${nombreArchivo}`, "connected");
            }
          }
        } catch (err) {
          console.error("Error al importar archivo Excel:", err);
          alert("No se pudo leer el archivo seleccionado. Verifica que sea un .xlsx válido.");
        } finally {
          event.target.value = "";
        }
      });
    }

    // Exportar / Descargar una copia .xlsx
    const btnExportarExcel = document.getElementById("btnExportarExcel");
    if (btnExportarExcel) {
      btnExportarExcel.addEventListener("click", () => {
        ExcelService.exportarExcelConFormulas(store.getSesiones(), "study-tracker.xlsx");
      });
    }

    // Botón para vaciar todo el historial
    const btnVaciarTodo = document.getElementById("btnVaciarTodo");
    if (btnVaciarTodo) {
      btnVaciarTodo.addEventListener("click", () => {
        if (
          confirm(
            "¿Seguro que deseas vaciar todas las sesiones registradas en el dashboard y en el Excel?"
          )
        ) {
          UI.salirModoEdicion();
          store.vaciarSesiones();
        }
      });
    }
  }

  window.addEventListener("DOMContentLoaded", async () => {
    UI.inicializarFormulario();
    vincularEventosDOM();

    // Suscribir la UI y el sincronizador Excel a cualquier cambio del Store
    store.subscribe(async (sesiones, meta) => {
      UI.renderizarDashboard(sesiones, {
        onEditarSesion: manejarEditarSesion,
        onEliminarSesion: manejarEliminarSesion
      });

      // Cualquier alta, edición, baja, importación o vaciado actualiza automáticamente data/study-tracker.xlsx
      const origenesSincronizables = new Set([
        "agregar",
        "editar",
        "eliminar",
        "importar",
        "vaciar"
      ]);
      if (origenesSincronizables.has(meta.origen)) {
        await sincronizarConServidor(sesiones);
      }
    });

    // 1. Inicializar Store local
    store.init();

    // 2. Conectar automáticamente con el servidor local (server.js -> data/study-tracker.xlsx)
    const conexion = await ExcelService.inicializarConexionServidor(store.getSesiones());
    if (conexion.conectado) {
      if (conexion.origen === "leido_de_disco" && conexion.sesiones.length > 0) {
        store.reemplazarSesiones(conexion.sesiones, "servidor_init");
      }
      UI.actualizarEstadoArchivo(
        `🟢 Sincronizado en vivo: ${conexion.excelPath}`,
        "connected"
      );
    } else {
      UI.actualizarEstadoArchivo(
        "Modo navegador (Ejecuta start.bat para sincronizar data/study-tracker.xlsx)",
        "default"
      );
    }
  });
})(window);
