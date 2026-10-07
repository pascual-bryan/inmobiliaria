// ==========================================
// INICIO DE INMOVA
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("INMOVA iniciado correctamente");

});


// ==========================================
// API DE DJANGO
// ==========================================

const API_URL =
    "http://127.0.0.1:8000/api/propiedades/";

const LOTES_API_URL =
    "http://127.0.0.1:8000/api/lotes/";

const CITAS_API_URL =
    "http://127.0.0.1:8000/api/citas/";


// ==========================================
// FUNCIÓN PARA OBTENER URL DE IMAGEN
// ==========================================

window.obtenerUrlImagen = function (imagen) {

    const imagenDefault =
        "Imagenes/casa1.jpg";

    if (!imagen) {
        return imagenDefault;
    }

    let url =
        String(imagen).trim();

    if (
        url.includes("/propiedades/") &&
        !url.includes("/media/propiedades/")
    ) {

        url =
            url.replace(
                "/propiedades/",
                "/media/propiedades/"
            );

    }

    if (
        url.startsWith("propiedades/")
    ) {

        url =
            "/media/" + url;

    }

    if (
        url.startsWith("/media/")
    ) {

        return url;

    }

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {

        return url;

    }

    return url;

};


// ==========================================
// FILTROS DE PROPIEDADES
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const searchButton =
        document.getElementById("searchProperties");

    // ======================================
    // CARGAR PROPIEDADES SIEMPRE
    // ======================================

    cargarPropiedades();

    // ======================================
    // FILTROS
    // ======================================

    if (!searchButton) {
        return;
    }

    searchButton.addEventListener("click", function () {

        const tipo =
            document.getElementById("propertyType")?.value || "";

        const operacion =
            document.getElementById("propertyOperation")?.value || "";

        const ciudad =
            document.getElementById("propertyCity")?.value || "";

        cargarPropiedades(
            tipo,
            operacion,
            ciudad
        );

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

    const grid =
        document.getElementById(
            "propertyGrid"
        );

    if (!grid) {
        return;
    }

    const noResults =
        document.getElementById(
            "noResults"
        );

    const counter =
        document.getElementById(
            "propertyCounter"
        );

    try {

        const respuesta =
            await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron cargar las propiedades"
            );
        }

        const propiedades =
            await respuesta.json();

        let propiedadesFiltradas =
            propiedades.filter(
                function (propiedad) {

                    const coincideTipo =
                        !tipo ||
                        propiedad.tipo === tipo;

                    const coincideOperacion =
                        !operacion ||
                        propiedad.operacion === operacion;

                    const coincideCiudad =
                        !ciudad ||
                        propiedad.ciudad === ciudad;

                    return (
                        coincideTipo &&
                        coincideOperacion &&
                        coincideCiudad
                    );

                }
            );

        grid.innerHTML = "";

        if (
            propiedadesFiltradas.length === 0
        ) {

            if (noResults) {
                noResults.classList.remove(
                    "d-none"
                );
            }

            if (counter) {
                counter.textContent =
                    "0 propiedades";
            }

            return;

        }

        if (noResults) {
            noResults.classList.add(
                "d-none"
            );
        }

        if (counter) {

            counter.textContent =
                `${propiedadesFiltradas.length} ${
                    propiedadesFiltradas.length === 1
                        ? "propiedad"
                        : "propiedades"
                }`;

        }

        propiedadesFiltradas.forEach(
            function (propiedad) {

                const imagen =
                    obtenerUrlImagen(
                        propiedad.imagen_principal
                    );

                const precio =
                    Number(
                        propiedad.precio || 0
                    ).toLocaleString(
                        "es-MX",
                        {
                            style: "currency",
                            currency: "MXN"
                        }
                    );

                const tarjeta =
                    document.createElement(
                        "div"
                    );

                tarjeta.className =
                    "col-md-6 col-lg-4";

                tarjeta.innerHTML = `

                    <div class="card h-100 shadow-sm">

                        <img
                            src="${imagen}"
                            class="card-img-top"
                            alt="${propiedad.titulo}"
                            style="
                                height:230px;
                                object-fit:cover;
                            "
                        >

                        <div class="card-body">

                            <h5 class="card-title">
                                ${propiedad.titulo}
                            </h5>

                            <p class="text-muted mb-2">
                                <i class="bi bi-geo-alt"></i>
                                ${propiedad.ciudad}
                            </p>

                            <p class="fw-bold text-primary">
                                ${precio}
                            </p>

                            <p class="card-text">
                                ${propiedad.descripcion || ""}
                            </p>

                            <a
                                href="propiedad.html?id=${propiedad.id}"
                                class="btn btn-primary w-100"
                            >
                                Ver propiedad
                            </a>

                        </div>

                    </div>

                `;

                grid.appendChild(
                    tarjeta
                );

            }
        );

    } catch (error) {

        console.error(
            "Error cargando propiedades:",
            error
        );

        grid.innerHTML = `

            <div class="col-12 text-center py-5">

                <h4>
                    No se pudieron cargar
                    las propiedades.
                </h4>

                <p class="text-muted">
                    Verifica que Django
                    esté funcionando.
                </p>

            </div>

        `;

    }

}


// ==========================================
// CARGAR LOTES
// ==========================================

async function cargarLotes(
    propiedadId
) {

    const seccion =
        document.getElementById(
            "landLotsSection"
        );

    const tabla =
        document.getElementById(
            "landLotsTable"
        );

    if (!seccion || !tabla) {
        return;
    }

    try {

        const respuesta =
            await fetch(
                LOTES_API_URL
            );

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron cargar los lotes"
            );
        }

        const lotes =
            await respuesta.json();

        const lotesPropiedad =
            lotes.filter(
                function (lote) {

                    return Number(
                        lote.propiedad
                    ) === Number(
                        propiedadId
                    );

                }
            );

        tabla.innerHTML = "";

        if (
            lotesPropiedad.length === 0
        ) {

            seccion.style.display =
                "none";

            return;

        }

        seccion.style.display =
            "block";

        lotesPropiedad.forEach(
            function (lote) {

                let estadoTexto =
                    lote.estado || "disponible";

                let estadoClase =
                    "bg-success";

                if (
                    lote.estado === "apartado"
                ) {

                    estadoTexto =
                        "Apartado";

                    estadoClase =
                        "bg-warning text-dark";

                }

                if (
                    lote.estado === "vendido"
                ) {

                    estadoTexto =
                        "Vendido";

                    estadoClase =
                        "bg-danger";

                }

                if (
                    lote.estado === "disponible"
                ) {

                    estadoTexto =
                        "Disponible";

                }

                const precio =
                    lote.precio
                        ? Number(
                            lote.precio
                        ).toLocaleString(
                            "es-MX",
                            {
                                style: "currency",
                                currency: "MXN"
                            }
                        )
                        : "Consultar";

                const fila =
                    document.createElement(
                        "tr"
                    );

                fila.innerHTML = `

                    <td>
                        Lote ${lote.numero}
                    </td>

                    <td>
                        ${lote.superficie || "-"}
                        m²
                    </td>

                    <td>
                        ${lote.frente || "-"}
                        m
                    </td>

                    <td>
                        ${lote.fondo || "-"}
                        m
                    </td>

                    <td>
                        ${lote.medidas || "-"}
                    </td>

                    <td>
                        ${precio}
                    </td>

                    <td>

                        <span class="badge ${estadoClase}">
                            ${estadoTexto}
                        </span>

                    </td>

                `;

                tabla.appendChild(
                    fila
                );

            }
        );

    } catch (error) {

        console.error(
            "Error cargando lotes:",
            error
        );

        seccion.style.display =
            "none";

    }

}


// ==========================================
// DETALLE DE PROPIEDAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const urlParams =
            new URLSearchParams(
                window.location.search
            );

        const id =
            urlParams.get("id");

        if (!id) {
            return;
        }

        const propertyTitle =
            document.getElementById(
                "propertyTitle"
            );

        if (!propertyTitle) {
            return;
        }

        cargarDetallePropiedad(id);

    }
);


// ==========================================
// CARGAR DETALLE
// ==========================================

async function cargarDetallePropiedad(
    id
) {

    try {

        const respuesta =
            await fetch(
                `${API_URL}${id}/`
            );

        if (!respuesta.ok) {

            throw new Error(
                "No se pudo cargar la propiedad"
            );

        }

        const propiedad =
            await respuesta.json();

        console.log(
            "Propiedad cargada:",
            propiedad
        );

        const imagen =
            obtenerUrlImagen(
                propiedad.imagen_principal
            );

        const elementos = {

            propertyMainImage:
                document.getElementById(
                    "propertyMainImage"
                ),

            propertyTitle:
                document.getElementById(
                    "propertyTitle"
                ),

            propertyLocation:
                document.getElementById(
                    "propertyLocation"
                ),

            propertyPrice:
                document.getElementById(
                    "propertyPrice"
                ),

            propertyDescription:
                document.getElementById(
                    "propertyDescription"
                ),

            propertyArea:
                document.getElementById(
                    "propertyArea"
                ),

            propertyBedrooms:
                document.getElementById(
                    "propertyBedrooms"
                ),

            propertyBathrooms:
                document.getElementById(
                    "propertyBathrooms"
                ),

            propertyParking:
                document.getElementById(
                    "propertyParking"
                ),

            propertyFront:
                document.getElementById(
                    "propertyFront"
                ),

            propertyBack:
                document.getElementById(
                    "propertyBack"
                ),

            propertyPriceMeter:
                document.getElementById(
                    "propertyPriceMeter"
                ),

            propertyLandUse:
                document.getElementById(
                    "propertyLandUse"
                ),

            propertyServices:
                document.getElementById(
                    "propertyServices"
                ),

            propertyLegal:
                document.getElementById(
                    "propertyLegal"
                )

        };


        // ======================================
        // IMAGEN
        // ======================================

        if (
            elementos.propertyMainImage
        ) {

            elementos.propertyMainImage.src =
                imagen;

        }


        // ======================================
        // INFORMACIÓN PRINCIPAL
        // ======================================

        if (
            elementos.propertyTitle
        ) {

            elementos.propertyTitle.textContent =
                propiedad.titulo || "";

        }

        if (
            elementos.propertyLocation
        ) {

            elementos.propertyLocation.textContent =
                `${propiedad.ubicacion || ""}, ${
                    propiedad.ciudad || ""
                }`;

        }

        if (
            elementos.propertyPrice
        ) {

            elementos.propertyPrice.textContent =
                Number(
                    propiedad.precio || 0
                ).toLocaleString(
                    "es-MX",
                    {
                        style: "currency",
                        currency: "MXN"
                    }
                );

        }

        if (
            elementos.propertyDescription
        ) {

            elementos.propertyDescription.textContent =
                propiedad.descripcion || "";

        }


        // ======================================
        // CARACTERÍSTICAS
        // ======================================

        if (
            elementos.propertyArea
        ) {

            elementos.propertyArea.textContent =
                propiedad.metros_terreno || "0";

        }

        if (
            elementos.propertyBedrooms
        ) {

            elementos.propertyBedrooms.textContent =
                propiedad.recamaras || "0";

        }

        if (
            elementos.propertyBathrooms
        ) {

            elementos.propertyBathrooms.textContent =
                propiedad.banos || "0";

        }

        if (
            elementos.propertyParking
        ) {

            elementos.propertyParking.textContent =
                propiedad.estacionamientos || "0";

        }


        // ======================================
        // DATOS DEL TERRENO
        // ======================================

        if (
            elementos.propertyFront
        ) {

            elementos.propertyFront.textContent =
                propiedad.frente || "-";

        }

        if (
            elementos.propertyBack
        ) {

            elementos.propertyBack.textContent =
                propiedad.fondo || "-";

        }

        if (
            elementos.propertyPriceMeter
        ) {

            elementos.propertyPriceMeter.textContent =
                propiedad.precio_metro
                    ? Number(
                        propiedad.precio_metro
                    ).toLocaleString(
                        "es-MX",
                        {
                            style: "currency",
                            currency: "MXN"
                        }
                    )
                    : "-";

        }

        if (
            elementos.propertyLandUse
        ) {

            elementos.propertyLandUse.textContent =
                propiedad.uso_suelo || "-";

        }

        if (
            elementos.propertyServices
        ) {

            elementos.propertyServices.textContent =
                propiedad.servicios || "-";

        }

        if (
            elementos.propertyLegal
        ) {

            elementos.propertyLegal.textContent =
                propiedad.situacion_legal || "-";

        }


        // ======================================
        // MOSTRAR / OCULTAR DATOS DE TERRENO
        // ======================================

        const landDetails =
            document.getElementById(
                "landDetails"
            );

        if (
            landDetails
        ) {

            if (
                propiedad.tipo &&
                propiedad.tipo.toLowerCase()
                    .includes("terreno")
            ) {

                landDetails.style.display =
                    "block";

            } else {

                landDetails.style.display =
                    "none";

            }

        }


        // ======================================
        // CARGAR LOTES
        // ======================================

        cargarLotes(
            propiedad.id
        );

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

function cambiarImagen(
    imagen
) {

    const principal =
        document.getElementById(
            "propertyMainImage"
        );

    if (
        !principal ||
        !imagen
    ) {
        return;
    }

    principal.src =
        imagen.src;

}

// ==========================================
// SISTEMA DE CITAS - INMOVA
// ==========================================


// ==========================================
// HORARIOS DISPONIBLES
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
// INICIAR SISTEMA
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const formulario =
        document.getElementById("appointmentForm");

    const propiedad =
        document.getElementById("appointmentProperty");

    const fecha =
        document.getElementById("appointmentDate");

    const boton =
        document.getElementById("confirmAppointment");


    if (!formulario || !propiedad || !fecha) {

        console.log(
            "INMOVA: formulario de citas no encontrado."
        );

        return;

    }


    console.log(
        "INMOVA: sistema de citas iniciado correctamente."
    );


    // ======================================
    // FECHA MÍNIMA = HOY
    // ======================================

    const hoy = new Date();

    const año =
        hoy.getFullYear();

    const mes =
        String(
            hoy.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            hoy.getDate()
        ).padStart(2, "0");

    fecha.min =
        `${año}-${mes}-${dia}`;


    // ======================================
    // CARGAR PROPIEDADES
    // ======================================

    cargarPropiedadesParaCitas();


    // ======================================
    // CAMBIO DE PROPIEDAD
    // ======================================

    propiedad.addEventListener(
        "change",
        function () {

            limpiarHorarios();

            ocultarDatosCliente();

            fecha.value = "";

        }
    );


    // ======================================
    // CAMBIO DE FECHA
    // ======================================

    fecha.addEventListener(
        "change",
        function () {

            const fechaSeleccionada =
                fecha.value;

            limpiarHorarios();

            ocultarDatosCliente();

            if (!fechaSeleccionada) {
                return;
            }

            cargarHorariosDisponibles(
                fechaSeleccionada
            );

        }
    );


    // ======================================
    // FORMULARIO
    // ======================================

    formulario.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            guardarCita(event);

        }
    );


    // ======================================
    // BOTÓN DIRECTO
    // ======================================

    if (boton) {

        boton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                guardarCita(event);

            }
        );

    }

});


// ==========================================
// CARGAR PROPIEDADES
// ==========================================

async function cargarPropiedadesParaCitas() {

    const select =
        document.getElementById(
            "appointmentProperty"
        );

    if (!select) {
        return;
    }

    try {

        const respuesta =
            await fetch(API_URL);

        if (!respuesta.ok) {

            throw new Error(
                "Error al cargar propiedades"
            );

        }

        const propiedades =
            await respuesta.json();

        console.log(
            "Propiedades para citas:",
            propiedades
        );

        select.innerHTML = "";

        const inicial =
            document.createElement("option");

        inicial.value = "";

        inicial.textContent =
            "Selecciona una propiedad";

        select.appendChild(inicial);


        propiedades.forEach(
            function (propiedad) {

                const opcion =
                    document.createElement(
                        "option"
                    );

                opcion.value =
                    propiedad.id;

                opcion.textContent =
                    `${propiedad.titulo} — ${propiedad.ciudad}`;

                select.appendChild(
                    opcion
                );

            }
        );


    } catch (error) {

        console.error(
            "Error cargando propiedades:",
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
// CARGAR HORARIOS
// ==========================================

async function cargarHorariosDisponibles(
    fecha
) {

    const contenedor =
        document.getElementById(
            "appointmentTimes"
        );

    const propiedad =
        document.getElementById(
            "appointmentProperty"
        );


    if (
        !contenedor ||
        !propiedad ||
        !fecha
    ) {

        return;

    }


    if (!propiedad.value) {

        contenedor.innerHTML = `
            <div class="alert alert-warning">
                Primero selecciona una propiedad.
            </div>
        `;

        return;

    }


    contenedor.innerHTML = `
        <div class="text-muted">
            Consultando horarios disponibles...
        </div>
    `;


    try {

        const respuesta =
            await fetch(
                CITAS_API_URL
            );

        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron consultar las citas"
            );

        }

        const citas =
            await respuesta.json();


        // ======================================
        // HORARIOS OCUPADOS
        // ======================================

        const horariosOcupados =
            citas
                .filter(
                    function (cita) {

                        return (
                            cita.fecha === fecha &&
                            cita.estado !== "cancelada"
                        );

                    }
                )
                .map(
                    function (cita) {

                        return String(
                            cita.hora
                        ).substring(0, 5);

                    }
                );


        // ======================================
        // HORARIOS DISPONIBLES
        // ======================================

        const horariosDisponibles =
            HORARIOS_CITA.filter(
                function (hora) {

                    return !horariosOcupados.includes(
                        hora
                    );

                }
            );


        contenedor.innerHTML = "";


        if (
            horariosDisponibles.length === 0
        ) {

            contenedor.innerHTML = `
                <div class="alert alert-warning">
                    No hay horarios disponibles
                    para esta fecha.
                </div>
            `;

            return;

        }


        const titulo =
            document.createElement("p");

        titulo.className =
            "fw-semibold mb-3";

        titulo.textContent =
            "Selecciona un horario:";

        contenedor.appendChild(titulo);


        const fila =
            document.createElement("div");

        fila.className =
            "d-flex flex-wrap gap-2";


        horariosDisponibles.forEach(
            function (hora) {

                const boton =
                    document.createElement(
                        "button"
                    );

                boton.type =
                    "button";

                boton.className =
                    "btn btn-outline-primary";

                boton.textContent =
                    hora;


                boton.addEventListener(
                    "click",
                    function () {

                        seleccionarHorario(
                            hora,
                            boton
                        );

                    }
                );


                fila.appendChild(
                    boton
                );

            }
        );


        contenedor.appendChild(
            fila
        );


    } catch (error) {

        console.error(
            "Error cargando horarios:",
            error
        );

        contenedor.innerHTML = `
            <div class="alert alert-danger">
                No se pudieron consultar
                los horarios.
            </div>
        `;

    }

}


// ==========================================
// SELECCIONAR HORARIO
// ==========================================

function seleccionarHorario(
    hora,
    boton
) {

    const input =
        document.getElementById(
            "appointmentTime"
        );

    if (!input) {

        console.error(
            "No existe appointmentTime"
        );

        return;

    }


    input.value =
        hora;


    // Quitar selección anterior

    const contenedor =
        document.getElementById(
            "appointmentTimes"
        );

    if (contenedor) {

        const botones =
            contenedor.querySelectorAll(
                "button"
            );

        botones.forEach(
            function (elemento) {

                elemento.classList.remove(
                    "btn-primary"
                );

                elemento.classList.add(
                    "btn-outline-primary"
                );

            }
        );

    }


    // Seleccionar horario

    boton.classList.remove(
        "btn-outline-primary"
    );

    boton.classList.add(
        "btn-primary"
    );


    // Mostrar datos del cliente

    const datosCliente =
        document.getElementById(
            "clientDataSection"
        );

    if (datosCliente) {

        datosCliente.classList.remove(
            "d-none"
        );

    }


    console.log(
        "Horario seleccionado:",
        hora
    );

}


// ==========================================
// OCULTAR DATOS CLIENTE
// ==========================================

function ocultarDatosCliente() {

    const datos =
        document.getElementById(
            "clientDataSection"
        );

    const hora =
        document.getElementById(
            "appointmentTime"
        );


    if (datos) {

        datos.classList.add(
            "d-none"
        );

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
        document.getElementById(
            "appointmentTimes"
        );

    const hora =
        document.getElementById(
            "appointmentTime"
        );


    if (contenedor) {

        contenedor.innerHTML = `
            <p class="text-muted">
                Selecciona una fecha
                para consultar los horarios.
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

    if (event) {
        event.preventDefault();
    }


    console.log(
        "INMOVA: intentando guardar cita..."
    );


    // ======================================
    // OBTENER CAMPOS
    // ======================================

    const propiedad =
        document.getElementById(
            "appointmentProperty"
        );

    const fecha =
        document.getElementById(
            "appointmentDate"
        );

    const hora =
        document.getElementById(
            "appointmentTime"
        );

    const nombre =
        document.getElementById(
            "appointmentName"
        );

    const telefono =
        document.getElementById(
            "appointmentPhone"
        );

    const privacidad =
        document.getElementById(
            "appointmentPrivacy"
        );

    const boton =
        document.getElementById(
            "confirmAppointment"
        );


    // ======================================
    // VALIDAR ELEMENTOS
    // ======================================

    if (!propiedad) {

        mostrarMensajeCita(
            "No se encontró el campo de propiedad.",
            "danger"
        );

        return;

    }


    if (!fecha) {

        mostrarMensajeCita(
            "No se encontró el campo de fecha.",
            "danger"
        );

        return;

    }


    if (!hora) {

        mostrarMensajeCita(
            "No se encontró el campo de horario.",
            "danger"
        );

        return;

    }


    if (!nombre) {

        mostrarMensajeCita(
            "No se encontró el campo de nombre.",
            "danger"
        );

        return;

    }


    if (!telefono) {

        mostrarMensajeCita(
            "No se encontró el campo de teléfono.",
            "danger"
        );

        return;

    }


    // ======================================
    // VALIDACIONES
    // ======================================

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


    if (!nombre.value.trim()) {

        mostrarMensajeCita(
            "Escribe tu nombre completo.",
            "warning"
        );

        return;

    }


    if (!telefono.value.trim()) {

        mostrarMensajeCita(
            "Escribe tu número de teléfono.",
            "warning"
        );

        return;

    }


    if (
        privacidad &&
        !privacidad.checked
    ) {

        mostrarMensajeCita(
            "Debes aceptar el aviso de privacidad.",
            "warning"
        );

        return;

    }


    // ======================================
    // DATOS
    // ======================================

    const datosCita = {

        propiedad:
            Number(
                propiedad.value
            ),

        nombre_cliente:
            nombre.value.trim(),

        telefono:
            telefono.value.trim(),

        fecha:
            fecha.value,

        hora:
            hora.value,

        estado:
            "pendiente"

    };


    console.log(
        "INMOVA: datos enviados:",
        datosCita
    );


    // ======================================
    // BOTÓN
    // ======================================

    if (boton) {

        boton.disabled =
            true;

        boton.textContent =
            "Guardando...";

    }


    try {

        const respuesta =
            await fetch(
                CITAS_API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            datosCita
                        )
                }
            );


        // ==================================
        // LEER RESPUESTA
        // ==================================

        const texto =
            await respuesta.text();

        console.log(
            "Respuesta Django:",
            texto
        );


        let resultado = {};

        try {

            resultado =
                JSON.parse(texto);

        } catch (error) {

            console.error(
                "Django no devolvió JSON:",
                texto
            );

        }


        // ==================================
        // ERROR
        // ==================================

        if (!respuesta.ok) {

            let mensaje =
                "Django rechazó la cita.";

            if (resultado.hora) {

                mensaje =
                    Array.isArray(
                        resultado.hora
                    )
                        ? resultado.hora[0]
                        : resultado.hora;

            } else if (
                resultado.detail
            ) {

                mensaje =
                    resultado.detail;

            } else if (
                resultado.non_field_errors
            ) {

                mensaje =
                    Array.isArray(
                        resultado.non_field_errors
                    )
                        ? resultado.non_field_errors[0]
                        : resultado.non_field_errors;

            }


            mostrarMensajeCita(
                mensaje,
                "danger"
            );

            console.error(
                "Error Django:",
                resultado
            );

            return;

        }


        // ==================================
        // ÉXITO
        // ==================================

        console.log(
            "CITA GUARDADA:",
            resultado
        );


        mostrarMensajeCita(
            "¡Cita agendada correctamente! Nos pondremos en contacto contigo para confirmar tu visita.",
            "success"
        );


        // ==================================
        // LIMPIAR
        // ==================================

        nombre.value =
            "";

        telefono.value =
            "";

        propiedad.value =
            "";

        fecha.value =
            "";

        if (privacidad) {

            privacidad.checked =
                false;

        }


        limpiarHorarios();

        ocultarDatosCliente();


    } catch (error) {

        console.error(
            "ERROR AL GUARDAR CITA:",
            error
        );

        mostrarMensajeCita(
            "No se pudo conectar con Django. Revisa que el servidor esté funcionando.",
            "danger"
        );

    } finally {

        if (boton) {

            boton.disabled =
                false;

            boton.textContent =
                "Confirmar visita";

        }

    }

}


// ==========================================
// MENSAJE
// ==========================================

function mostrarMensajeCita(
    mensaje,
    tipo
) {

    const contenedor =
        document.getElementById(
            "appointmentMessage"
        );


    if (!contenedor) {

        alert(mensaje);

        return;

    }


    contenedor.innerHTML = `

        <div
            class="alert alert-${tipo}"
            role="alert"
        >
            ${mensaje}
        </div>

    `;


    contenedor.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

