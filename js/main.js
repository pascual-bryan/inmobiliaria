
// ==========================================
// INICIO DE INMOVA
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("INMOVA iniciado correctamente");

});


// ==========================================
// FILTROS DE PROPIEDADES
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const searchButton =
        document.getElementById("searchProperties");

    if (searchButton) {

        searchButton.addEventListener("click", function () {

            const operation =
                document.getElementById("filterOperation").value;

            const type =
                document.getElementById("filterType").value;

            const location =
                document
                    .getElementById("filterLocation")
                    .value
                    .toLowerCase()
                    .trim();

            const properties =
                document.querySelectorAll(".property-item");

            let visibleProperties = 0;

            properties.forEach(function (property) {

                const propertyOperation =
                    property.dataset.operation;

                const propertyType =
                    property.dataset.type;

                const propertyLocation =
                    property.dataset.location;

                const matchesOperation =
                    operation === "todos" ||
                    propertyOperation === operation;

                const matchesType =
                    type === "todos" ||
                    propertyType === type;

                const matchesLocation =
                    location === "" ||
                    propertyLocation.includes(location);

                if (
                    matchesOperation &&
                    matchesType &&
                    matchesLocation
                ) {

                    property.style.display = "";
                    visibleProperties++;

                } else {

                    property.style.display = "none";

                }

            });


            const propertyCounter =
                document.getElementById("propertyCounter");

            if (propertyCounter) {

                propertyCounter.textContent =
                    visibleProperties + " propiedades";

            }


            const noResults =
                document.getElementById("noResults");

            if (noResults) {

                if (visibleProperties === 0) {

                    noResults.classList.remove("d-none");

                } else {

                    noResults.classList.add("d-none");

                }

            }

        });

    }

});


// ==========================================
// FORMULARIO DE CONTACTO
// ==========================================

const contactForm =
    document.getElementById("contactForm");

if (contactForm) {

    contactForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const formMessage =
            document.getElementById("formMessage");

        if (formMessage) {

            formMessage.classList.remove("d-none");

        }

        contactForm.reset();

        console.log("Solicitud enviada correctamente.");

    });

}


// ==========================================
// API DE DJANGO
// ==========================================

const API_URL =
    "http://127.0.0.1:8000/api/propiedades/";


// ==========================================
// CARGAR PROPIEDADES
// ==========================================

async function cargarPropiedades() {

    const propertyGrid =
        document.getElementById("propertyGrid");

    const propertyCounter =
        document.getElementById("propertyCounter");

    const noResults =
        document.getElementById("noResults");


    // Si esta página no tiene el listado,
    // no ejecutamos esta función.

    if (!propertyGrid) {

        return;

    }


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


        // Limpiar propiedades anteriores

        propertyGrid.innerHTML = "";


        // Actualizar contador

        if (propertyCounter) {

            propertyCounter.textContent =
                `${propiedades.length} propiedades`;

        }


        // Si no hay propiedades

        if (propiedades.length === 0) {

            if (noResults) {

                noResults.classList.remove("d-none");

            }

            return;

        }


        if (noResults) {

            noResults.classList.add("d-none");

        }


        // ==========================================
        // CREAR TARJETAS
        // ==========================================

        propiedades.forEach(propiedad => {

            const tarjeta =
                document.createElement("div");


            tarjeta.className =
                "col-md-6 col-lg-4 property-item";


            tarjeta.dataset.operation =
                propiedad.operacion || "";

            tarjeta.dataset.type =
                propiedad.tipo || "";

            tarjeta.dataset.location =
                `${propiedad.ciudad || ""} ${propiedad.estado || ""}`
                    .toLowerCase();


            tarjeta.innerHTML = `

                <div class="property-card">

                    <div class="property-image">

                        <img
                            src="${propiedad.imagen_principal || 'Imagenes/casa1.jpg'}"
                            alt="${propiedad.titulo || 'Propiedad'}"
                        >

                        <span class="property-status">
                            ${propiedad.operacion || ""}
                        </span>

                    </div>


                    <div class="property-info">

                        <h3>
                            ${propiedad.titulo || "Propiedad"}
                        </h3>


                        <p class="location">
                            📍 ${propiedad.ciudad || ""},
                            ${propiedad.estado || ""}
                        </p>


                        <div class="property-details">

                            <span>
                                🛏 ${propiedad.recamaras || 0}
                            </span>

                            <span>
                                🚿 ${propiedad.banos || 0}
                            </span>

                            <span>
                                🚗 ${propiedad.estacionamientos || 0}
                            </span>

                        </div>


                        <div class="property-price">

                            $${Number(propiedad.precio || 0)
                                .toLocaleString("es-MX")}
                            MXN

                        </div>


                        <a
                            href="propiedad.html?id=${propiedad.id}"
                            class="btn btn-outline-primary w-100 mt-3"
                        >
                            Ver propiedad
                        </a>

                    </div>

                </div>

            `;


            propertyGrid.appendChild(tarjeta);

        });


    } catch (error) {

        console.error("Error:", error);


        propertyGrid.innerHTML = `

            <div class="col-12 text-center">

                <h3>
                    No se pudieron cargar las propiedades
                </h3>

                <p class="text-muted">
                    Verifica que el servidor de Django
                    esté funcionando.
                </p>

            </div>

        `;

    }

}


// ==========================================
// EJECUTAR LISTADO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    cargarPropiedades
);


// ==========================================
// DETALLE DE UNA PROPIEDAD
// ==========================================

async function cargarDetallePropiedad() {

    const parametros =
        new URLSearchParams(window.location.search);

    const id =
        parametros.get("id");


    if (!id) {

        console.error(
            "No se encontró el ID de la propiedad"
        );

        return;

    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}${id}/`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se encontró la propiedad"
            );

        }


        const propiedad =
            await respuesta.json();


        console.log(
            "Propiedad cargada:",
            propiedad
        );


        // ==========================================
        // INFORMACIÓN PRINCIPAL
        // ==========================================

        const propertyTitle =
            document.getElementById("propertyTitle");

        if (propertyTitle) {

            propertyTitle.textContent =
                propiedad.titulo || "Propiedad";

        }


        const propertyLocation =
            document.getElementById("propertyLocation");

        if (propertyLocation) {

            propertyLocation.textContent =
                `📍 ${propiedad.ciudad || ""}, ${propiedad.estado || ""}`;

        }


        const propertyPrice =
            document.getElementById("propertyPrice");

        if (propertyPrice) {

            propertyPrice.textContent =
                `$${Number(propiedad.precio || 0)
                    .toLocaleString("es-MX")} MXN`;

        }


        const propertyDescription =
            document.getElementById(
                "propertyDescription"
            );

        if (propertyDescription) {

            propertyDescription.textContent =
                propiedad.descripcion ||
                "No hay descripción disponible.";

        }


        // ==========================================
        // OPERACIÓN
        // ==========================================

        const operation =
            document.querySelector(
                ".property-operation"
            );


        if (operation) {

            operation.textContent =
                (propiedad.operacion || "")
                    .toUpperCase();

        }


        // ==========================================
        // TÍTULO DEL NAVEGADOR
        // ==========================================

        document.title =
            `${propiedad.titulo || "Propiedad"} | INMOVA`;


        // ==========================================
        // IMAGEN PRINCIPAL
        // ==========================================

        if (propiedad.imagen_principal) {

            const imagenPrincipal =
                document.getElementById(
                    "propertyMainImage"
                );


            if (imagenPrincipal) {

                imagenPrincipal.src =
                    propiedad.imagen_principal;

                imagenPrincipal.alt =
                    propiedad.titulo || "Propiedad";

            }

        }


        // ==========================================
        // TIPO DE PROPIEDAD
        // ==========================================

        const tipo =
            (propiedad.tipo || "")
                .toLowerCase()
                .trim();


        console.log(
            "Tipo de propiedad:",
            tipo
        );


        // ==========================================
        // CARACTERÍSTICAS
        // ==========================================

        const propertyFeatures =
            document.getElementById(
                "propertyFeatures"
            );


        if (propertyFeatures) {

            let caracteristicas = "";


            // ------------------------------------------
            // CASA
            // ------------------------------------------

            if (
                tipo.includes("casa")
            ) {

                caracteristicas = `

                    <div class="feature">

                        <strong>
                            ${propiedad.recamaras || 0}
                        </strong>

                        <span>
                            Recámaras
                        </span>

                    </div>


                    <div class="feature">

                        <strong>
                            ${propiedad.banos || 0}
                        </strong>

                        <span>
                            Baños
                        </span>

                    </div>


                    <div class="feature">

                        <strong>
                            ${propiedad.estacionamientos || 0}
                        </strong>

                        <span>
                            Estacionamientos
                        </span>

                    </div>


                    <div class="feature">

                        <strong>
                            ${propiedad.metros_terreno || 0} m²
                        </strong>

                        <span>
                            Terreno
                        </span>

                    </div>


                    <div class="feature">

                        <strong>
                            ${propiedad.metros_construccion || 0} m²
                        </strong>

                        <span>
                            Construcción
                        </span>

                    </div>

                `;

            }


            // ------------------------------------------
            // DEPARTAMENTO
            // ------------------------------------------

            else if (
                tipo.includes("departamento")
            ) {

                caracteristicas = `

                    <div class="feature">

                        <strong>
                            ${propiedad.recamaras || 0}
                        </strong>

                        <span>
                            Recámaras
                        </span>

                    </div>


                    <div class="feature">

                        <strong>
                            ${propiedad.banos || 0}
                        </strong>

                        <span>
                            Baños
                        </span>

                    </div>


                    <div class="feature">

                        <strong>
                            ${propiedad.estacionamientos || 0}
                        </strong>

                        <span>
                            Estacionamientos
                        </span>

                    </div>


                    <div class="feature">

                        <strong>
                            ${propiedad.metros_construccion || 0} m²
                        </strong>

                        <span>
                            Construcción
                        </span>

                    </div>

                `;

            }


            // ------------------------------------------
            // TERRENO
            // ------------------------------------------

            else if (
                tipo.includes("terreno") ||
                tipo.includes("lote")
            ) {

                caracteristicas = `

                    <div class="feature">

                        <strong>
                            ${propiedad.metros_terreno || 0} m²
                        </strong>

                        <span>
                            Superficie
                        </span>

                    </div>


                    <div class="feature">

                        <strong>
                            ${propiedad.frente || "-"} m
                        </strong>

                        <span>
                            Frente
                        </span>

                    </div>


                    <div class="feature">

                        <strong>
                            ${propiedad.fondo || "-"} m
                        </strong>

                        <span>
                            Fondo
                        </span>

                    </div>


                    <div class="feature">

                        <strong>
                            ${propiedad.precio_metro
                                ? "$" + Number(propiedad.precio_metro)
                                    .toLocaleString("es-MX")
                                : "-"
                            }
                        </strong>

                        <span>
                            Precio por m²
                        </span>

                    </div>

                `;

            }


            // ------------------------------------------
            // LOCAL COMERCIAL
            // ------------------------------------------

            else if (
                tipo.includes("local") ||
                tipo.includes("comercial")
            ) {

                caracteristicas = `

                    <div class="feature">

                        <strong>
                            ${propiedad.metros_terreno || 0} m²
                        </strong>

                        <span>
                            Superficie
                        </span>

                    </div>


                    <div class="feature">

                        <strong>
                            ${propiedad.estacionamientos || 0}
                        </strong>

                        <span>
                            Estacionamientos
                        </span>

                    </div>

                `;

            }


            // ------------------------------------------
            // OTRO TIPO
            // ------------------------------------------

            else {

                caracteristicas = `

                    <div class="feature">

                        <strong>
                            ${propiedad.metros_terreno || 0} m²
                        </strong>

                        <span>
                            Superficie
                        </span>

                    </div>

                `;

            }


            propertyFeatures.innerHTML =
                caracteristicas;

        }


        // ==========================================
        // INFORMACIÓN EXCLUSIVA DE TERRENOS
        // ==========================================

        const landDetails =
            document.getElementById(
                "landDetails"
            );


        const landLotsSection =
            document.getElementById(
                "landLotsSection"
            );


        const propertyVideoSection =
            document.getElementById(
                "propertyVideoSection"
            );


        const propertyVideoTitle =
            document.getElementById(
                "propertyVideoTitle"
            );


        const propertyVideoDescription =
            document.getElementById(
                "propertyVideoDescription"
            );


        // ==========================================
        // SI ES TERRENO
        // ==========================================

        if (
            tipo.includes("terreno") ||
            tipo.includes("lote")
        ) {

            // Mostrar características del terreno

            if (landDetails) {

                landDetails.classList.remove("d-none");

            }


            // Mostrar sección de lotes

            if (landLotsSection) {

                landLotsSection.classList.remove("d-none");

            }


            // Cambiar texto del video

            if (propertyVideoTitle) {

                propertyVideoTitle.textContent =
                    "Conoce el terreno";

            }


            if (propertyVideoDescription) {

                propertyVideoDescription.textContent =
                    "Conoce el terreno, sus accesos y alrededores.";

            }


            // --------------------------------------
            // DATOS DEL TERRENO
            // --------------------------------------

            const propertyFront =
                document.getElementById(
                    "propertyFront"
                );

            if (propertyFront) {

                propertyFront.textContent =
                    propiedad.frente
                        ? `${propiedad.frente} m`
                        : "-";

            }


            const propertyBack =
                document.getElementById(
                    "propertyBack"
                );

            if (propertyBack) {

                propertyBack.textContent =
                    propiedad.fondo
                        ? `${propiedad.fondo} m`
                        : "-";

            }


            const propertyPriceMeter =
                document.getElementById(
                    "propertyPriceMeter"
                );

            if (propertyPriceMeter) {

                propertyPriceMeter.textContent =
                    propiedad.precio_metro
                        ? `$${Number(propiedad.precio_metro)
                            .toLocaleString("es-MX")} MXN`
                        : "-";

            }


            const propertyLandUse =
                document.getElementById(
                    "propertyLandUse"
                );

            if (propertyLandUse) {

                propertyLandUse.textContent =
                    propiedad.uso_suelo || "-";

            }


            const propertyServices =
                document.getElementById(
                    "propertyServices"
                );

            if (propertyServices) {

                propertyServices.textContent =
                    propiedad.servicios || "-";

            }


            const propertyLegal =
                document.getElementById(
                    "propertyLegal"
                );

            if (propertyLegal) {

                propertyLegal.textContent =
                    propiedad.situacion_legal || "-";

            }

        }


        // ==========================================
        // SI NO ES TERRENO
        // ==========================================

        else {

            // Ocultar información de terreno

            if (landDetails) {

                landDetails.classList.add("d-none");

            }


            // Ocultar lotes

            if (landLotsSection) {

                landLotsSection.classList.add("d-none");

            }


            // Video genérico

            if (propertyVideoTitle) {

                propertyVideoTitle.textContent =
                    "Conoce la propiedad";

            }


            if (propertyVideoDescription) {

                propertyVideoDescription.textContent =
                    "Conoce más detalles de esta propiedad.";

            }

        }


        // ==========================================
        // ÁREA GENERAL
        // ==========================================

        const propertyArea =
            document.getElementById(
                "propertyArea"
            );


        if (propertyArea) {

            if (propiedad.metros_terreno) {

                propertyArea.textContent =
                    `${propiedad.metros_terreno} m²`;

            }

        }


        // ==========================================
        // DATOS ADICIONALES
        // ==========================================

        const propertyBedrooms =
            document.getElementById(
                "propertyBedrooms"
            );

        if (propertyBedrooms) {

            propertyBedrooms.textContent =
                propiedad.recamaras || 0;

        }


        const propertyBathrooms =
            document.getElementById(
                "propertyBathrooms"
            );

        if (propertyBathrooms) {

            propertyBathrooms.textContent =
                propiedad.banos || 0;

        }


        const propertyParking =
            document.getElementById(
                "propertyParking"
            );

        if (propertyParking) {

            propertyParking.textContent =
                propiedad.estacionamientos || 0;

        }

    }


    catch (error) {

        console.error(
            "Error cargando propiedad:",
            error
        );


        const propertyTitle =
            document.getElementById(
                "propertyTitle"
            );


        const propertyDescription =
            document.getElementById(
                "propertyDescription"
            );


        if (propertyTitle) {

            propertyTitle.textContent =
                "Propiedad no encontrada";

        }


        if (propertyDescription) {

            propertyDescription.textContent =
                "No fue posible encontrar la información de la propiedad.";

        }

    }

}


// ==========================================
// CAMBIAR IMAGEN
// ==========================================

function cambiarImagen(imagen) {

    const imagenPrincipal =
        document.getElementById(
            "propertyMainImage"
        );


    if (imagenPrincipal) {

        imagenPrincipal.src =
            imagen.src;

        imagenPrincipal.alt =
            imagen.alt;

    }

}


// ==========================================
// DETECTAR PÁGINA DE DETALLE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            document.getElementById(
                "propertyTitle"
            )
        ) {

            cargarDetallePropiedad();

        }

    }
);
