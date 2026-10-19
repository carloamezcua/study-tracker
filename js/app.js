/**
 * Punto de Entrada (Controlador Principal):
 * Conecta el Store reactivo con la capa de UI y el servicio de sincronización Excel.
 */
(function (global) {
  const StudyTracker = (global.StudyTracker = global.StudyTracker || {});
  const { store, UI, ExcelService } = StudyTracker;

  function manejarEliminarSesion(id) {
    store.eliminarSesionPorId(id);
  }

  function vincularEventosDOM() {
    // Formulario principal de registro de sesión
    const form = document.getElementById("studyForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        store.agregarSesion({
          fecha: document.getElementById("fecha").value,
          horaInicio: document.getElementById("horaInicio").value,
          horaFin: document.getElementById("horaFin").value,
          materia: document.getElementById("materia").value.trim(),
          calidad: Number(document.getElementById("calidad").value),
          usoIA: Number(document.getElementById("usoIA").value),
          notas: document.getElementById("notas").value.trim()
        });
        document.getElementById("notas").value = "";
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

    // Botones de barra superior (Excel)
    const btnConectarExcel = document.getElementById("btnConectarExcel");
    if (btnConectarExcel) {
      btnConectarExcel.addEventListener("click", async () => {
        try {
          const { sesiones, nombreArchivo } = await ExcelService.vincularArchivoLocal();
          if (sesiones.length > 0) {
            store.reemplazarSesiones(sesiones, "vincular");
          }
          UI.actualizarEstadoArchivo(`🔗 Sincronizado con: ${nombreArchivo}`, true);
        } catch (err) {
          if (err && err.message === "UNSUPPORTED_FS_API") {
            alert(
              "Tu navegador no soporta edición directa en disco o abriste el archivo sin contexto seguro. Usa los botones 'Importar .xlsx' y 'Guardar / Descargar Excel (.xlsx)'."
            );
          } else {
            console.log("Vinculación cancelada o interrumpida:", err);
          }
        }
      });
    }

    const inputImportar = document.getElementById("importInput");
    if (inputImportar) {
      inputImportar.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        try {
          const { sesiones, nombreArchivo } = await ExcelService.leerArchivoExcel(file);
          if (sesiones.length > 0) {
            store.reemplazarSesiones(sesiones, "importar");
            UI.actualizarEstadoArchivo(`Cargado: ${nombreArchivo}`, true);
          }
        } catch (err) {
          console.error("Error al importar archivo Excel:", err);
          alert("No se pudo leer el archivo seleccionado. Verifica que sea un .xlsx válido.");
        } finally {
          event.target.value = "";
        }
      });
    }

    const btnExportarExcel = document.getElementById("btnExportarExcel");
    if (btnExportarExcel) {
      btnExportarExcel.addEventListener("click", () => {
        ExcelService.exportarExcelConFormulas(store.getSesiones());
      });
    }

    // Botón para vaciar todo el historial
    const btnVaciarTodo = document.getElementById("btnVaciarTodo");
    if (btnVaciarTodo) {
      btnVaciarTodo.addEventListener("click", () => {
        if (
          confirm(
            "¿Seguro que deseas vaciar todas las sesiones registradas para empezar desde cero?"
          )
        ) {
          store.vaciarSesiones();
        }
      });
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    UI.inicializarFormulario();
    vincularEventosDOM();

    // Suscribir la UI y el sincronizador Excel a cualquier cambio del Store
    store.subscribe(async (sesiones, meta) => {
      UI.renderizarDashboard(sesiones, {
        onEliminarSesion: manejarEliminarSesion
      });

      // Sincronizar en disco si hay un archivo vinculado y hubo mutación local
      if (
        ExcelService.tieneArchivoVinculado() &&
        (meta.origen === "agregar" || meta.origen === "eliminar" || meta.origen === "vaciar")
      ) {
        await ExcelService.guardarEnArchivoVinculado(sesiones);
      }
    });

    // Inicializar estado
    store.init();
  });
})(window);

