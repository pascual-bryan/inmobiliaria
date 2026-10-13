
/* =====================================================
   INMOVA - DASHBOARD ADMINISTRATIVO
   Conexión con las API de Django
===================================================== */

document.addEventListener("DOMContentLoaded", iniciarDashboard);

const API_PROPIEDADES = "/api/propiedades/";
const API_LOTES = "/api/lotes/";
const API_CITAS = "/api/citas/";


async function iniciarDashboard() {
    configurarModulosPendientes();

    mostrarMensaje(
        "info",
        '<i class="bi bi-arrow-repeat"></i> Cargando información de la inmobiliaria...'
    );

    try {
        const [propiedades, lotes, citas] = await Promise.all([
            consultarAPI(API_PROPIEDADES),
            consultarAPI(API_LOTES),
            consultarAPI(API_CITAS)
        ]);

        actualizarEstadisticas(propiedades, lotes, citas);
        mostrarPropiedades(propiedades);
        mostrarProximasCitas(citas, propiedades);
        mostrarActividad(propiedades, citas);

        mostrarMensaje(
            "success",
            '<i class="bi bi-check-circle"></i> Información actualizada correctamente.'
        );

    } catch (error) {
        console.error("Error al cargar el dashboard:", error);

        mostrarMensaje(
            "danger",
            '<i class="bi bi-exclamation-triangle"></i> No se pudo cargar toda la información. Verifica que Django esté ejecutándose y que las API respondan correctamente.'
        );

        mostrarErrorTablas();
    }
}


/* =====================================================
   CONSULTAR API
===================================================== */

async function consultarAPI(url) {
    const respuesta = await fetch(url, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });

    if (!respuesta.ok) {
        throw new Error(
            `Error HTTP ${respuesta.status} al consultar ${url}`
        );
    }

    const datos = await respuesta.json();

    // Admite listas normales y respuestas paginadas de DRF.
    if (Array.isArray(datos)) {
        return datos;
    }

    if (datos && Array.isArray(datos.results)) {
        return datos.results;
    }

    throw new Error(`La respuesta de ${url} no contiene una lista válida.`);
}


/* =====================================================
   ESTADÍSTICAS
===================================================== */

function actualizarEstadisticas(propiedades, lotes, citas) {
    const activas = propiedades.filter(
        propiedad => propiedad.activa === true
    );

    const disponibles = lotes.filter(
        lote => normalizar(lote.estado) === "disponible"
    );

    const apartados = lotes.filter(
        lote => normalizar(lote.estado) === "apartado"
    );

    const vendidos = lotes.filter(
        lote => normalizar(lote.estado) === "vendido"
    );

    const pendientes = citas.filter(
        cita => normalizar(cita.estado) === "pendiente"
    );

    const confirmadas = citas.filter(
        cita => normalizar(cita.estado) === "confirmada"
    );

    const citasHoy = citas.filter(cita => {
        const fecha = String(cita.fecha || "").slice(0, 10);

        return fecha === fechaActual()
            && ["pendiente", "confirmada"].includes(
                normalizar(cita.estado)
            );
    });

    establecerTexto("totalPropiedades", propiedades.length);
    establecerTexto("totalActivas", activas.length);
    establecerTexto("totalLotesDisponibles", disponibles.length);
    establecerTexto("totalCitasPendientes", pendientes.length);

    establecerTexto(
        "resumenLotes",
        `${apartados.length} apartados · ${vendidos.length} vendidos`
    );

    establecerTexto(
        "resumenCitas",
        `${confirmadas.length} confirmadas · ${citasHoy.length} para hoy`
    );

    establecerTexto("lotesDisponiblesDetalle", disponibles.length);
    establecerTexto("lotesApartadosDetalle", apartados.length);
    establecerTexto("lotesVendidosDetalle", vendidos.length);
}


/* =====================================================
   PROPIEDADES RECIENTES
===================================================== */

function mostrarPropiedades(propiedades) {
    const tabla = document.getElementById("tablaPropiedades");

    if (!tabla) return;

    tabla.replaceChildren();

    const recientes = [...propiedades]
        .sort((a, b) => obtenerTiempo(b.fecha_registro) - obtenerTiempo(a.fecha_registro))
        .slice(0, 6);

    if (recientes.length === 0) {
        agregarFilaVacia(
            tabla,
            5,
            "Todavía no hay propiedades registradas."
        );
        return;
    }

    recientes.forEach(propiedad => {
        const fila = document.createElement("tr");

        const nombre = document.createElement("td");
        const titulo = document.createElement("strong");
        titulo.textContent = propiedad.titulo || "Propiedad sin título";
        nombre.appendChild(titulo);

        const ubicacion = document.createElement("td");
        ubicacion.textContent =
            propiedad.ciudad || propiedad.ubicacion || "Sin ubicación";

        const operacion = document.createElement("td");
        operacion.textContent = capitalizar(propiedad.operacion || "No especificada");

        const precio = document.createElement("td");
        precio.textContent = formatearPrecio(propiedad.precio);

        const estado = document.createElement("td");
        const etiqueta = document.createElement("span");

        etiqueta.className = propiedad.activa
            ? "status available"
            : "status pending";

        etiqueta.textContent = propiedad.activa
            ? "Activa"
            : "Inactiva";

        estado.appendChild(etiqueta);

        fila.append(nombre, ubicacion, operacion, precio, estado);
        tabla.appendChild(fila);
    });
}


/* =====================================================
   PRÓXIMAS CITAS
===================================================== */

function mostrarProximasCitas(citas, propiedades) {
    const contenedor = document.getElementById("listaProximasCitas");

    if (!contenedor) return;

    contenedor.replaceChildren();

    const mapaPropiedades = new Map(
        propiedades.map(propiedad => [
            String(propiedad.id),
            propiedad.titulo || "Propiedad sin título"
        ])
    );

    const hoy = fechaActual();

    const proximas = citas
        .filter(cita => {
            const fecha = String(cita.fecha || "").slice(0, 10);

            return fecha >= hoy
                && ["pendiente", "confirmada"].includes(
                    normalizar(cita.estado)
                );
        })
        .sort((a, b) => {
            const fechaA = `${a.fecha || ""} ${a.hora || ""}`;
            const fechaB = `${b.fecha || ""} ${b.hora || ""}`;

            return fechaA.localeCompare(fechaB);
        })
        .slice(0, 6);

    if (proximas.length === 0) {
        mostrarMensajeContenedor(
            contenedor,
            "No hay próximas citas programadas."
        );
        return;
    }

    proximas.forEach(cita => {
        const elemento = document.createElement("div");
        elemento.className = "prospect-item";

        const icono = document.createElement("div");
        icono.className = "prospect-icon";
        icono.innerHTML = '<i class="bi bi-calendar-event"></i>';

        const informacion = document.createElement("div");

        const nombre = document.createElement("strong");
        nombre.textContent = cita.nombre_cliente || "Cliente sin nombre";

        const propiedadId = obtenerIdPropiedad(cita.propiedad);
        const tituloPropiedad =
            mapaPropiedades.get(String(propiedadId))
            || "Propiedad no identificada";

        const detalle = document.createElement("small");
        detalle.textContent =
            `${tituloPropiedad} · ${formatearFecha(cita.fecha)} · ${formatearHora(cita.hora)}`;

        const estado = document.createElement("small");
        estado.className = "d-block mt-1 text-muted";
        estado.textContent = `Estado: ${capitalizar(cita.estado || "pendiente")}`;

        informacion.append(nombre, detalle, estado);
        elemento.append(icono, informacion);

        contenedor.appendChild(elemento);
    });
}


/* =====================================================
   ACTIVIDAD RECIENTE
===================================================== */

function mostrarActividad(propiedades, citas) {
    const contenedor = document.getElementById("listaActividad");

    if (!contenedor) return;

    contenedor.replaceChildren();

    const actividades = [];

    propiedades.forEach(propiedad => {
        if (propiedad.fecha_registro) {
            actividades.push({
                tipo: "propiedad",
                titulo: "Propiedad registrada",
                detalle: propiedad.titulo || "Propiedad sin título",
                fecha: propiedad.fecha_registro
            });
        }
    });

    citas.forEach(cita => {
        if (cita.fecha_registro) {
            actividades.push({
                tipo: "cita",
                titulo: "Cita registrada",
                detalle: `${cita.nombre_cliente || "Cliente"} · ${formatearFecha(cita.fecha)}`,
                fecha: cita.fecha_registro
            });
        }
    });

    actividades.sort(
        (a, b) => obtenerTiempo(b.fecha) - obtenerTiempo(a.fecha)
    );

    const recientes = actividades.slice(0, 8);

    if (recientes.length === 0) {
        mostrarMensajeContenedor(
            contenedor,
            "No hay actividad registrada para mostrar."
        );
        return;
    }

    recientes.forEach(actividad => {
        const elemento = document.createElement("div");
        elemento.className = "activity-item";

        const icono = document.createElement("i");
        icono.className = actividad.tipo === "propiedad"
            ? "bi bi-house-add"
            : "bi bi-calendar-check";

        const informacion = document.createElement("div");

        const titulo = document.createElement("strong");
        titulo.textContent = actividad.titulo;

        const detalle = document.createElement("span");
        detalle.textContent =
            `${actividad.detalle} · ${tiempoTranscurrido(actividad.fecha)}`;

        informacion.append(titulo, detalle);
        elemento.append(icono, informacion);

        contenedor.appendChild(elemento);
    });
}


/* =====================================================
   MÓDULOS TODAVÍA NO CONFIGURADOS
===================================================== */

function configurarModulosPendientes() {
    document.querySelectorAll("[data-modulo-pendiente]").forEach(enlace => {
        enlace.addEventListener("click", evento => {
            evento.preventDefault();

            const modulo = enlace.dataset.moduloPendiente;

            alert(
                `El módulo "${modulo}" todavía no está implementado en INMOVA.`
            );
        });
    });
}


/* =====================================================
   FUNCIONES AUXILIARES
===================================================== */

function mostrarMensaje(tipo, mensaje) {
    const elemento = document.getElementById("dashboardMensaje");

    if (!elemento) return;

    elemento.className = `alert alert-${tipo}`;
    elemento.innerHTML = mensaje;
}

function mostrarMensajeContenedor(contenedor, mensaje) {
    const texto = document.createElement("p");

    texto.className = "text-muted p-3 mb-0";
    texto.textContent = mensaje;

    contenedor.appendChild(texto);
}

function mostrarErrorTablas() {
    const tabla = document.getElementById("tablaPropiedades");

    if (tabla) {
        agregarFilaVacia(
            tabla,
            5,
            "No fue posible cargar las propiedades."
        );
    }

    const citas = document.getElementById("listaProximasCitas");

    if (citas) {
        mostrarMensajeContenedor(
            citas,
            "No fue posible cargar las citas."
        );
    }

    const actividad = document.getElementById("listaActividad");

    if (actividad) {
        mostrarMensajeContenedor(
            actividad,
            "No fue posible cargar la actividad."
        );
    }
}

function agregarFilaVacia(tabla, columnas, mensaje) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");

    celda.colSpan = columnas;
    celda.className = "text-center text-muted py-4";
    celda.textContent = mensaje;

    fila.appendChild(celda);
    tabla.appendChild(fila);
}

function establecerTexto(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor;
    }
}

function normalizar(valor) {
    return String(valor || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function capitalizar(valor) {
    const texto = String(valor || "");

    return texto.length
        ? texto.charAt(0).toUpperCase() + texto.slice(1)
        : "";
}

function formatearPrecio(valor) {
    if (valor === null || valor === undefined || valor === "") {
        return "Consultar";
    }

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return String(valor);
    }

    return numero.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 2
    });
}

function fechaActual() {
    const ahora = new Date();

    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

function formatearFecha(fecha) {
    if (!fecha) return "Fecha pendiente";

    const partes = String(fecha).slice(0, 10).split("-");

    if (partes.length !== 3) return String(fecha);

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearHora(hora) {
    if (!hora) return "Hora pendiente";

    return String(hora).slice(0, 5);
}

function obtenerTiempo(fecha) {
    if (!fecha) return 0;

    const tiempo = new Date(fecha).getTime();

    return Number.isFinite(tiempo) ? tiempo : 0;
}

function tiempoTranscurrido(fecha) {
    const tiempo = obtenerTiempo(fecha);

    if (!tiempo) return "fecha no disponible";

    const diferencia = Math.max(0, Date.now() - tiempo);
    const minutos = Math.floor(diferencia / 60000);

    if (minutos < 1) return "hace unos segundos";
    if (minutos < 60) return `hace ${minutos} min`;

    const horas = Math.floor(minutos / 60);

    if (horas < 24) return `hace ${horas} h`;

    const dias = Math.floor(horas / 24);

    if (dias < 30) return `hace ${dias} día${dias === 1 ? "" : "s"}`;

    return `registrado el ${formatearFecha(String(fecha).slice(0, 10))}`;
}

function obtenerIdPropiedad(valor) {
    if (valor && typeof valor === "object") {
        return valor.id;
    }

    return valor;
}
