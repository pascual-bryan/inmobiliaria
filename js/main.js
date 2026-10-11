
// ==========================================
// BIENES Y RAÍCES OLAYA
// ARCHIVO PRINCIPAL JAVASCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    console.log("Bienes y Raíces Olaya iniciado correctamente");
});


// ==========================================
// API DE DJANGO
// ==========================================

const API_URL = "http://127.0.0.1:8000/api/propiedades/";
const LOTES_API_URL = "http://127.0.0.1:8000/api/lotes/";
const CITAS_API_URL = "http://127.0.0.1:8000/api/citas/";


// ==========================================
// RUTAS DE IMÁGENES
// ==========================================

// Las imágenes se encuentran en:
// proyecto/static/Imagenes/

const IMAGENES_URL = "/static/Imagenes/";

// Imagen de respaldo: debe existir con este nombre.
const IMAGEN_DEFAULT = IMAGENES_URL + "house%202.jpg";


// ==========================================
// CONSTRUIR URL DE IMAGEN
// ==========================================

window.obtenerUrlImagen = function (imagen) {

    if (!imagen || !String(imagen).trim()) {
        return IMAGEN_DEFAULT;
    }

    let ruta = String(imagen).trim();

    // Si Django devuelve una URL completa.
    if (/^https?:\/\//i.test(ruta)) {
        try {
            const url = new URL(ruta);

            const esServidorLocal =
                (url.hostname === "127.0.0.1" ||
                 url.hostname === "localhost") &&
                url.port === "8000";

            // Conservar las imágenes de servidores externos.
            if (!esServidorLocal) {
                return ruta;
            }

            ruta = url.pathname;

        } catch (error) {
            console.error("URL de imagen inválida:", imagen);
            return IMAGEN_DEFAULT;
        }
    }

    // Quitar parámetros y fragmentos.
    ruta = ruta
        .split("?")[0]
        .split("#")[0]
        .replace(/\\/g, "/");

    // Quitar barras iniciales.
    ruta = ruta.replace(/^\/+/, "");

    // Eliminar prefijos conocidos.
    ruta = ruta.replace(/^static\//i, "");
    ruta = ruta.replace(/^media\/propiedades\//i, "");

    // Quitar la carpeta Imagenes si ya viene incluida.
    ruta = ruta.replace(/^Imagenes\//i, "");

    // Quitar la carpeta propiedades si viene dentro de Imagenes.
    ruta = ruta.replace(/^propiedades\//i, "");

    if (!ruta) {
        return IMAGEN_DEFAULT;
    }

    // Codificar espacios y caracteres especiales.
    const rutaCodificada = ruta
        .split("/")
        .map(function (parte) {
            return encodeURIComponent(parte);
        })
        .join("/");

    return IMAGENES_URL + rutaCodificada;
};


// ==========================================
// CONFIGURAR IMAGEN Y RESPALDO
// ==========================================

function configurarImagen(imagenElemento, rutaImagen) {

    if (!imagenElemento) return;

    let usandoRespaldo = false;

    imagenElemento.onerror = function () {

        if (usandoRespaldo) {
            this.onerror = null;

            console.error(
                "No se encontró la imagen:",
                this.src
            );

            return;
        }

        usandoRespaldo = true;

        console.warn(
            "Imagen no encontrada. Se utilizará la imagen de respaldo:",
            this.src
        );

        this.src = IMAGEN_DEFAULT;
    };

    imagenElemento.src = rutaImagen || IMAGEN_DEFAULT;
}


// ==========================================
// FILTROS Y CARGA DE PROPIEDADES
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const searchButton = document.getElementById("searchProperties");

    cargarPropiedades();

    if (!searchButton) return;

    searchButton.addEventListener("click", function () {

        const tipo =
            document.getElementById("propertyType")?.value || "";

        const operacion =
            document.getElementById("propertyOperation")?.value || "";

        const ciudad =
            document.getElementById("propertyCity")?.value || "";

        cargarPropiedades(tipo, operacion, ciudad);
    });
});


// ==========================================
// CARGAR PROPIEDADES
// ==========================================

async function cargarPropiedades(
    tipo = "",
    operacion = "",
    ciudad = ""
) {

    const grid = document.getElementById("propertyGrid");

    if (!grid) return;

    const noResults = document.getElementById("noResults");
    const counter = document.getElementById("propertyCounter");

    try {

        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron cargar las propiedades. HTTP " +
                respuesta.status
            );
        }

        const propiedades = await respuesta.json();

        if (!Array.isArray(propiedades)) {
            throw new Error(
                "La API no devolvió una lista de propiedades."
            );
        }

        const propiedadesFiltradas = propiedades.filter(
            function (propiedad) {

                const coincideTipo =
                    !tipo || propiedad.tipo === tipo;

                const coincideOperacion =
                    !operacion ||
                    propiedad.operacion === operacion;

                const coincideCiudad =
                    !ciudad || propiedad.ciudad === ciudad;

                return (
                    coincideTipo &&
                    coincideOperacion &&
                    coincideCiudad
                );
            }
        );

        grid.innerHTML = "";

        if (propiedadesFiltradas.length === 0) {

            if (noResults) {
                noResults.classList.remove("d-none");
            }

            if (counter) {
                counter.textContent = "0 propiedades";
            }

            return;
        }

        if (noResults) {
            noResults.classList.add("d-none");
        }

        if (counter) {
            counter.textContent =
                `${propiedadesFiltradas.length} ${
                    propiedadesFiltradas.length === 1
                        ? "propiedad"
                        : "propiedades"
                }`;
        }

        propiedadesFiltradas.forEach(function (propiedad) {

            // Obtener la ruta de la imagen de esta propiedad.
            const imagen = window.obtenerUrlImagen(
                propiedad.imagen_principal
            );

            console.log(
                "Imagen de propiedad:",
                propiedad.titulo,
                propiedad.imagen_principal,
                "=>",
                imagen
            );

            const precio = Number(
                propiedad.precio || 0
            ).toLocaleString("es-MX", {
                style: "currency",
                currency: "MXN"
            });

            const tarjeta = document.createElement("div");

            tarjeta.className = "col-md-6 col-lg-4";

            tarjeta.innerHTML = `
                <div class="card h-100 shadow-sm">

                    <img
                        class="card-img-top"
                        alt="${propiedad.titulo || "Propiedad"}"
                        style="height:230px; object-fit:cover;"
                        loading="lazy"
                    >

                    <div class="card-body d-flex flex-column">

                        <h5 class="card-title">
                            ${propiedad.titulo || ""}
                        </h5>

                        <p class="text-muted mb-2">
                            <i class="bi bi-geo-alt"></i>
                            ${propiedad.ciudad || ""}
                        </p>

                        <p class="fw-bold text-primary">
                            ${precio}
                        </p>

                        <p class="card-text">
                            ${propiedad.descripcion || ""}
                        </p>

                        <a
                            href="propiedad.html?id=${encodeURIComponent(propiedad.id)}"
                            class="btn btn-primary w-100 mt-auto"
                        >
                            Ver propiedad
                        </a>

                    </div>
                </div>
            `;

            const imagenElemento = tarjeta.querySelector("img");

            configurarImagen(imagenElemento, imagen);

            grid.appendChild(tarjeta);
        });

    } catch (error) {

        console.error(
            "Error cargando propiedades:",
            error
        );

        grid.innerHTML = `
            <div class="col-12 text-center py-5">

                <h4>No se pudieron cargar las propiedades.</h4>

                <p class="text-muted">
                    Verifica que Django esté funcionando y que la API
                    de propiedades esté disponible.
                </p>

            </div>
        `;
    }
}


// ==========================================
// CARGAR LOTES DE UNA PROPIEDAD
// ==========================================


async function cargarLotes(propiedadId) {

    const seccion = document.getElementById("landLotsSection");
    const tabla = document.getElementById("landLotsTable");

    if (!seccion || !tabla) return;

    try {

        const respuesta = await fetch(LOTES_API_URL);

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los lotes.");
        }

        const lotes = await respuesta.json();

        const lotesPropiedad = lotes.filter(function (lote) {
            return Number(lote.propiedad) === Number(propiedadId);
        });

        tabla.innerHTML = "";

        if (lotesPropiedad.length === 0) {
            seccion.style.display = "none";
            return;
        }

        seccion.style.display = "block";

        lotesPropiedad.forEach(function (lote) {

            let estadoTexto;
            let estadoClase;

            if (lote.estado === "apartado") {
                estadoTexto = "Apartado";
                estadoClase = "bg-warning text-dark";
            } else if (lote.estado === "vendido") {
                estadoTexto = "Vendido";
                estadoClase = "bg-danger";
            } else {
                estadoTexto = "Disponible";
                estadoClase = "bg-success";
            }

            const precio = lote.precio !== null &&
                           lote.precio !== undefined &&
                           lote.precio !== ""
                ? Number(lote.precio).toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN"
                })
                : "Consultar";

            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>Lote ${lote.numero ?? "-"}</td>
                <td>${lote.superficie || "-"} m²</td>
                <td>${lote.frente || "-"} m</td>
                <td>${lote.fondo || "-"} m</td>
                <td>${lote.medidas || "-"}</td>
                <td>${precio}</td>
                <td class="lote-precios"></td>
                <td>
                    <span class="badge ${estadoClase}">
                        ${estadoTexto}
                    </span>
                </td>
            `;

            // Mostrar precio total, enganche, mensualidades y contado.
            // textContent conserva el texto de forma segura.
            const celdaPrecios = fila.querySelector(".lote-precios");

            celdaPrecios.textContent =
                lote.informacion_precios || "Consultar";

            tabla.appendChild(fila);
        });

    } catch (error) {

        console.error("Error cargando lotes:", error);

        seccion.style.display = "none";
    }
}




// termina funcion de cargar lote


// ==========================================
// INICIAR DETALLE DE PROPIEDAD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const urlParams = new URLSearchParams(
        window.location.search
    );

    const id = urlParams.get("id");

    if (!id) return;

    if (!document.getElementById("propertyTitle")) {
        return;
    }

    cargarDetallePropiedad(id);
});


// ==========================================
// CARGAR DETALLE DE PROPIEDAD
// ==========================================

async function cargarDetallePropiedad(id) {

    try {

        const respuesta = await fetch(
            `${API_URL}${encodeURIComponent(id)}/`
        );

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo cargar la propiedad."
            );
        }

        const propiedad = await respuesta.json();

        console.log(
            "Propiedad cargada:",
            propiedad
        );

        const imagen = window.obtenerUrlImagen(
            propiedad.imagen_principal
        );

        const elementos = {

            propertyMainImage:
                document.getElementById("propertyMainImage"),

            propertyTitle:
                document.getElementById("propertyTitle"),

            propertyLocation:
                document.getElementById("propertyLocation"),

            propertyPrice:
                document.getElementById("propertyPrice"),

            propertyDescription:
                document.getElementById("propertyDescription"),

            propertyArea:
                document.getElementById("propertyArea"),

            propertyBedrooms:
                document.getElementById("propertyBedrooms"),

            propertyBathrooms:
                document.getElementById("propertyBathrooms"),

            propertyParking:
                document.getElementById("propertyParking"),

            propertyFront:
                document.getElementById("propertyFront"),

            propertyBack:
                document.getElementById("propertyBack"),

            propertyPriceMeter:
                document.getElementById("propertyPriceMeter"),

            propertyLandUse:
                document.getElementById("propertyLandUse"),

            propertyServices:
                document.getElementById("propertyServices"),

            propertyLegal:
                document.getElementById("propertyLegal")
        };

        // IMAGEN PRINCIPAL

        if (elementos.propertyMainImage) {
            configurarImagen(
                elementos.propertyMainImage,
                imagen
            );
        }

        // INFORMACIÓN GENERAL

        if (elementos.propertyTitle) {
            elementos.propertyTitle.textContent =
                propiedad.titulo || "";
        }

        if (elementos.propertyLocation) {
            elementos.propertyLocation.textContent =
                `${propiedad.ubicacion || ""}, ${propiedad.ciudad || ""}`;
        }

        // ==========================================
        // GOOGLE MAPS
        // ==========================================

        let botonMaps =
            document.getElementById("btnGoogleMaps");

        if (!botonMaps && elementos.propertyLocation) {

            botonMaps = document.createElement("a");

            botonMaps.id = "btnGoogleMaps";
            botonMaps.className = "btn btn-warning mt-3";
            botonMaps.textContent =
                "Ver ubicación en Google Maps";

            botonMaps.target = "_blank";
            botonMaps.rel = "noopener noreferrer";
            botonMaps.style.display = "none";

            elementos.propertyLocation.insertAdjacentElement(
                "afterend",
                botonMaps
            );
        }

        if (botonMaps) {

            const enlaceMaps =
                typeof propiedad.ubicacion_maps === "string"
                    ? propiedad.ubicacion_maps.trim()
                    : "";

            try {

                const urlMaps = new URL(enlaceMaps);

                if (
                    enlaceMaps &&
                    (
                        urlMaps.protocol === "https:" ||
                        urlMaps.protocol === "http:"
                    )
                ) {

                    botonMaps.href = urlMaps.href;
                    botonMaps.style.display = "inline-block";

                } else {

                    botonMaps.removeAttribute("href");
                    botonMaps.style.display = "none";
                }

            } catch (error) {

                botonMaps.removeAttribute("href");
                botonMaps.style.display = "none";
            }
        }

        // PRECIO

        if (elementos.propertyPrice) {

            elementos.propertyPrice.textContent =
                Number(propiedad.precio || 0).toLocaleString(
                    "es-MX",
                    {
                        style: "currency",
                        currency: "MXN"
                    }
                );
        }

        // DESCRIPCIÓN

        if (elementos.propertyDescription) {
            elementos.propertyDescription.textContent =
                propiedad.descripcion || "";
        }

        // SUPERFICIE

        if (elementos.propertyArea) {
            elementos.propertyArea.textContent =
                propiedad.metros_terreno || "0";
        }

        // RECÁMARAS

        if (elementos.propertyBedrooms) {
            elementos.propertyBedrooms.textContent =
                propiedad.recamaras || "0";
        }

        // BAÑOS

        if (elementos.propertyBathrooms) {
            elementos.propertyBathrooms.textContent =
                propiedad.banos || "0";
        }

        // ESTACIONAMIENTOS

        if (elementos.propertyParking) {
            elementos.propertyParking.textContent =
                propiedad.estacionamientos || "0";
        }

        // FRENTE

        if (elementos.propertyFront) {
            elementos.propertyFront.textContent =
                propiedad.frente || "-";
        }

        // FONDO

        if (elementos.propertyBack) {
            elementos.propertyBack.textContent =
                propiedad.fondo || "-";
        }

        // PRECIO POR METRO CUADRADO

        if (elementos.propertyPriceMeter) {

            elementos.propertyPriceMeter.textContent =
                propiedad.precio_metro
                    ? Number(propiedad.precio_metro).toLocaleString(
                        "es-MX",
                        {
                            style: "currency",
                            currency: "MXN"
                        }
                    )
                    : "-";
        }

        // USO DE SUELO

        if (elementos.propertyLandUse) {
            elementos.propertyLandUse.textContent =
                propiedad.uso_suelo || "-";
        }

        // SERVICIOS

        if (elementos.propertyServices) {
            elementos.propertyServices.textContent =
                propiedad.servicios || "-";
        }

        // SITUACIÓN LEGAL

        if (elementos.propertyLegal) {
            elementos.propertyLegal.textContent =
                propiedad.situacion_legal || "-";
        }

        // MOSTRAR DATOS DE TERRENO

        const landDetails =
            document.getElementById("landDetails");

        if (landDetails) {

            landDetails.style.display =
                propiedad.tipo &&
                propiedad.tipo.toLowerCase().includes("terreno")
                    ? "block"
                    : "none";
        }

        // CARGAR LOTES RELACIONADOS

        cargarLotes(propiedad.id);

    } catch (error) {

        console.error(
            "Error cargando detalle:",
            error
        );
    }
}


// ==========================================
// CAMBIAR IMAGEN PRINCIPAL
// ==========================================

function cambiarImagen(imagen) {

    const principal =
        document.getElementById("propertyMainImage");

    if (!principal || !imagen) return;

    configurarImagen(
        principal,
        imagen.src
    );
}


// ==========================================
// SISTEMA DE CITAS
// ==========================================

const HORARIOS_CITA = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "16:00",
    "17:00"
];


// ==========================================
// INICIAR FORMULARIO DE CITAS
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const formulario =
        document.getElementById("appointmentForm");

    const propiedad =
        document.getElementById("appointmentProperty");

    const fecha =
        document.getElementById("appointmentDate");

    if (!formulario || !propiedad || !fecha) {
        return;
    }

    console.log(
        "Olaya: sistema de citas iniciado correctamente."
    );

    // Evitar seleccionar fechas anteriores a hoy.

    const hoy = new Date();

    const año = hoy.getFullYear();

    const mes = String(
        hoy.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        hoy.getDate()
    ).padStart(2, "0");

    fecha.min = `${año}-${mes}-${dia}`;

    cargarPropiedadesParaCitas();

    // CAMBIAR PROPIEDAD

    propiedad.addEventListener("change", function () {

        limpiarHorarios();
        ocultarDatosCliente();

        fecha.value = "";
    });

    // CAMBIAR FECHA

    fecha.addEventListener("change", function () {

        const fechaSeleccionada = fecha.value;

        limpiarHorarios();
        ocultarDatosCliente();

        if (!fechaSeleccionada) return;

        if (!propiedad.value) {

            const contenedor =
                document.getElementById("appointmentTimes");

            if (contenedor) {
                contenedor.textContent =
                    "Primero selecciona una propiedad.";
            }

            return;
        }

        cargarHorariosDisponibles(
            fechaSeleccionada
        );
    });

    // ENVIAR FORMULARIO

    formulario.addEventListener(
        "submit",
        guardarCita
    );
});


// ==========================================
// CARGAR PROPIEDADES EN FORMULARIO DE CITAS
// ==========================================

async function cargarPropiedadesParaCitas() {

    const select =
        document.getElementById("appointmentProperty");

    if (!select) return;

    try {

        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error(
                "Error al cargar propiedades."
            );
        }

        const propiedades = await respuesta.json();

        select.innerHTML = "";

        const inicial = document.createElement("option");

        inicial.value = "";
        inicial.textContent =
            "Selecciona una propiedad";

        select.appendChild(inicial);

        propiedades.forEach(function (propiedad) {

            const opcion = document.createElement("option");

            opcion.value = propiedad.id;

            opcion.textContent =
                `${propiedad.titulo || "Propiedad"} — ${propiedad.ciudad || ""}`;

            select.appendChild(opcion);
        });

    } catch (error) {

        console.error(
            "Error cargando propiedades para citas:",
            error
        );

        select.innerHTML = `
            <option value="">
                No se pudieron cargar las propiedades
            </option>
        `;
    }
}


// ==========================================
// CARGAR HORARIOS DISPONIBLES
// ==========================================

async function cargarHorariosDisponibles(
    fechaSeleccionada
) {

    const contenedor =
        document.getElementById("appointmentTimes");

    const propiedad =
        document.getElementById("appointmentProperty");

    if (!contenedor || !propiedad || !fechaSeleccionada) {
        return;
    }

    if (!propiedad.value) {

        contenedor.textContent =
            "Primero selecciona una propiedad.";

        return;
    }

    contenedor.textContent =
        "Consultando horarios disponibles...";

    try {

        const respuesta = await fetch(CITAS_API_URL);

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron consultar las citas."
            );
        }

        const citas = await respuesta.json();

        const horariosOcupados = citas
            .filter(function (cita) {

                return (
                    cita.fecha === fechaSeleccionada &&
                    String(cita.estado || "").toLowerCase() !==
                        "cancelada"
                );
            })
            .map(function (cita) {

                return String(cita.hora || "").substring(0, 5);
            });

        const horariosDisponibles =
            HORARIOS_CITA.filter(function (hora) {

                return !horariosOcupados.includes(hora);
            });

        contenedor.innerHTML = "";

        if (horariosDisponibles.length === 0) {

            contenedor.textContent =
                "No hay horarios disponibles para esta fecha.";

            return;
        }

        const titulo = document.createElement("p");

        titulo.className = "fw-semibold mb-3";
        titulo.textContent = "Selecciona un horario:";

        contenedor.appendChild(titulo);

        const fila = document.createElement("div");

        fila.className = "d-flex flex-wrap gap-2";

        horariosDisponibles.forEach(function (hora) {

            const botonHora =
                document.createElement("button");

            botonHora.type = "button";

            botonHora.className =
                "btn btn-outline-primary";

            botonHora.textContent = hora;

            botonHora.addEventListener(
                "click",
                function () {
                    seleccionarHorario(
                        hora,
                        botonHora
                    );
                }
            );

            fila.appendChild(botonHora);
        });

        contenedor.appendChild(fila);

    } catch (error) {

        console.error(
            "Error cargando horarios:",
            error
        );

        contenedor.textContent =
            "No se pudieron consultar los horarios. Intenta nuevamente.";
    }
}


// ==========================================
// SELECCIONAR HORARIO
// ==========================================

function seleccionarHorario(hora, boton) {

    const input =
        document.getElementById("appointmentTime");

    if (!input) {

        console.error(
            "No existe el campo appointmentTime."
        );

        return;
    }

    input.value = hora;

    const contenedor =
        document.getElementById("appointmentTimes");

    if (contenedor) {

        contenedor.querySelectorAll("button").forEach(
            function (elemento) {

                elemento.classList.remove("btn-primary");

                elemento.classList.add(
                    "btn-outline-primary"
                );
            }
        );
    }

    boton.classList.remove(
        "btn-outline-primary"
    );

    boton.classList.add("btn-primary");

    const datosCliente =
        document.getElementById("clientDataSection");

    if (datosCliente) {
        datosCliente.classList.remove("d-none");
    }
}


// ==========================================
// OCULTAR DATOS DEL CLIENTE
// ==========================================

function ocultarDatosCliente() {

    const datos =
        document.getElementById("clientDataSection");

    const hora =
        document.getElementById("appointmentTime");

    if (datos) {
        datos.classList.add("d-none");
    }

    if (hora) {
        hora.value = "";
    }
}


// ==========================================
// LIMPIAR HORARIOS
// ==========================================

function limpiarHorarios() {

    const contenedor =
        document.getElementById("appointmentTimes");

    const hora =
        document.getElementById("appointmentTime");

    if (contenedor) {

        contenedor.innerHTML = `
            <p class="text-muted">
                Selecciona una fecha para consultar los horarios.
            </p>
        `;
    }

    if (hora) {
        hora.value = "";
    }
}


// ==========================================
// GUARDAR CITA
// ==========================================

async function guardarCita(event) {

    event.preventDefault();

    const propiedad =
        document.getElementById("appointmentProperty");

    const fecha =
        document.getElementById("appointmentDate");

    const hora =
        document.getElementById("appointmentTime");

    const nombre =
        document.getElementById("appointmentName");

    const telefono =
        document.getElementById("appointmentPhone");

    const privacidad =
        document.getElementById("appointmentPrivacy");

    const boton =
        document.getElementById("confirmAppointment");

    // VALIDAR CAMPOS

    if (
        !propiedad ||
        !fecha ||
        !hora ||
        !nombre ||
        !telefono
    ) {

        mostrarMensajeCita(
            "Faltan campos obligatorios en el formulario.",
            "danger"
        );

        return;
    }

    if (!propiedad.value) {

        mostrarMensajeCita(
            "Selecciona una propiedad.",
            "warning"
        );

        return;
    }

    if (!fecha.value) {

        mostrarMensajeCita(
            "Selecciona una fecha.",
            "warning"
        );

        return;
    }

    if (!hora.value) {

        mostrarMensajeCita(
            "Selecciona un horario.",
            "warning"
        );

        return;
    }

    if (
        !nombre.value.trim() ||
        !telefono.value.trim()
    ) {

        mostrarMensajeCita(
            "Escribe tu nombre y número de teléfono.",
            "warning"
        );

        return;
    }

    if (privacidad && !privacidad.checked) {

        mostrarMensajeCita(
            "Debes aceptar el aviso de privacidad.",
            "warning"
        );

        return;
    }

    // DATOS QUE SE ENVÍAN A DJANGO

    const datosCita = {

        propiedad: Number(propiedad.value),

        nombre_cliente: nombre.value.trim(),

        telefono: telefono.value.trim(),

        fecha: fecha.value,

        hora: hora.value,

        estado: "pendiente"
    };

    if (boton) {

        boton.disabled = true;

        boton.textContent = "Guardando...";
    }

    try {

        const respuesta = await fetch(
            CITAS_API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },

                body: JSON.stringify(datosCita)
            }
        );

        const texto = await respuesta.text();

        let resultado = {};

        try {

            resultado = JSON.parse(texto);

        } catch (error) {

            console.error(
                "Respuesta no JSON de Django:",
                texto
            );
        }

        if (!respuesta.ok) {

            console.error(
                "Error guardando cita:",
                resultado
            );

            const detalle =
                resultado.detail ||
                resultado.hora ||
                resultado.fecha ||
                resultado.non_field_errors;

            const mensaje = Array.isArray(detalle)
                ? detalle.join(" ")
                : detalle ||
                  "No se pudo guardar la cita.";

            mostrarMensajeCita(
                mensaje,
                "danger"
            );

            return;
        }

        mostrarMensajeCita(
            "¡Cita agendada correctamente! Nos pondremos en contacto contigo para confirmar tu visita.",
            "success"
        );

        // LIMPIAR FORMULARIO

        nombre.value = "";

        telefono.value = "";

        propiedad.value = "";

        fecha.value = "";

        if (privacidad) {
            privacidad.checked = false;
        }

        limpiarHorarios();

        ocultarDatosCliente();

    } catch (error) {

        console.error(
            "Error al guardar cita:",
            error
        );

        mostrarMensajeCita(
            "No se pudo conectar con Django. Comprueba que el servidor esté funcionando.",
            "danger"
        );

    } finally {

        if (boton) {

            boton.disabled = false;

            boton.textContent = "Confirmar visita";
        }
    }
}


// ==========================================
// MOSTRAR MENSAJES DE CITAS
// ==========================================

function mostrarMensajeCita(mensaje, tipo) {

    const contenedor =
        document.getElementById("appointmentMessage");

    if (!contenedor) {

        alert(mensaje);

        return;
    }

    contenedor.innerHTML = "";

    const alerta = document.createElement("div");

    alerta.className = `alert alert-${tipo}`;

    alerta.setAttribute("role", "alert");

    alerta.textContent = mensaje;

    contenedor.appendChild(alerta);

    contenedor.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}
