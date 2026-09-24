/* =========================================================
   ALUMARIAH REALTORS
   PROPERTY MANAGEMENT SYSTEM
========================================================= */


/* =========================================================
   GLOBAL VARIABLES
========================================================= */



let properties = [];





let currentSearchMode = "all";


/* =========================================================
   START WEBSITE
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    await loadProperties();

    renderProperties();

    setupNavigation();



    setupSearchTabs();

    setupContactForm();

});


/* =========================================================
   PROPERTY STORAGE
========================================================= */

async function loadProperties() {
    try {
        properties = await PropertyStore.list();
    } catch (error) {
        properties = [];
        document.querySelector('#emptyProperties h3').textContent = 'Listings are temporarily unavailable.';
        document.querySelector('#emptyProperties p').textContent = 'Please contact us for current availability.';
        console.error('Unable to load listings:', error.message);
    }
}

/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(price) {

    const number =
        Number(price) || 0;

    return "KSh " +
        number.toLocaleString(
            "en-KE"
        );

}


/* =========================================================
   WHATSAPP MESSAGE
========================================================= */

function whatsappLink(property) {
    const message = `Hello ALUMARIAH REALTORS, I am interested in: ${property.title}. Location: ${property.location}. Price: ${formatPrice(property.price)}. Please provide more information.`;
    return `https://wa.me/254721557592?text=${encodeURIComponent(message)}`;
}


/* =========================================================
   RENDER PROPERTIES
========================================================= */

function renderProperties(list = properties) {

    const grid =
        document.getElementById(
            "propertyGrid"
        );

    const empty =
        document.getElementById(
            "emptyProperties"
        );


    grid.innerHTML = "";


    if (!list.length) {

        grid.style.display = "none";

        empty.style.display = "block";

        return;

    }


    grid.style.display = "grid";

    empty.style.display = "none";


    list.forEach(property => {

        const card =
            document.createElement("article");

        card.className =
            "property-card";


        const image =
            property.images &&
            property.images.length
                ? property.images[0]
                : "";


        card.innerHTML = `

            <div class="property-image">

                ${
                    image
                    ?
                    `<img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(property.title)}"
                    >`
                    :
                    `<div
                        style="
                        width:100%;
                        height:100%;
                        display:grid;
                        place-items:center;
                        color:#752b91;
                        font-size:35px;
                        "
                    >
                        ✦
                    </div>`
                }

                <span class="property-badge">
                    ${escapeHTML(property.status)}
                </span>

            </div>


            <div class="property-content">

                <h3>
                    ${escapeHTML(property.title)}
                </h3>

                <div class="property-location">
                    📍 ${escapeHTML(property.location)}
                </div>

                <div class="property-price">
                    ${formatPrice(property.price)}
                </div>

                <div class="property-meta">

                    ${
                        property.beds
                        ?
                        `<span>🛏 ${Number(property.beds) || 0} Beds</span>`
                        : ""
                    }

                    ${
                        property.baths
                        ?
                        `<span>♨ ${Number(property.baths) || 0} Baths</span>`
                        : ""
                    }

                    ${
                        property.type
                        ?
                        `<span>◇ ${escapeHTML(property.type)}</span>`
                        : ""
                    }

                </div>


                <div class="property-actions">

                    <button
                        class="details-button"
                        onclick="openPropertyDetails('${property.id}')"
                    >
                        View Details
                    </button>

                    <a
                        href="${whatsappLink(property)}"
                        target="_blank"
                        class="property-whatsapp"
                    >
                        WhatsApp
                    </a>

                </div>

            </div>

        `;


        grid.appendChild(card);

    });

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (value === undefined ||
        value === null) {

        return "";

    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   PROPERTY DETAILS
========================================================= */

function openPropertyDetails(id) {

    const property =
        properties.find(
            p => p.id === id
        );


    if (!property) return;


    document.getElementById(
        "detailStatus"
    ).textContent =
        property.status;


    document.getElementById(
        "detailTitle"
    ).textContent =
        property.title;


    document.getElementById(
        "detailLocation"
    ).textContent =
        "📍 " + property.location;


    document.getElementById(
        "detailPrice"
    ).textContent =
        formatPrice(
            property.price
        );


    document.getElementById(
        "detailDescription"
    ).textContent =
        property.description;


    const features =
        document.getElementById(
            "detailFeatures"
        );


    features.innerHTML = "";


    if (property.beds) {

        features.innerHTML +=
            `<span>🛏 ${Number(property.beds) || 0} Bedrooms</span>`;

    }


    if (property.baths) {

        features.innerHTML +=
            `<span>♨ ${Number(property.baths) || 0} Bathrooms</span>`;

    }


    if (property.type) {

        features.innerHTML +=
            `<span>◇ ${escapeHTML(property.type)}</span>`;

    }


    if (property.size) {

        features.innerHTML +=
            `<span>▣ ${escapeHTML(property.size)}</span>`;

    }


    const whatsapp =
        document.getElementById(
            "detailWhatsApp"
        );


    whatsapp.href =
        whatsappLink(property);


    renderPropertyGallery(
        property
    );


    document.getElementById(
        "propertyDetailsModal"
    ).classList.add("show");


    document.body.style.overflow =
        "hidden";

}


function closePropertyDetails() {

    document.getElementById(
        "propertyDetailsModal"
    ).classList.remove("show");

    document.body.style.overflow =
        "";

}


/* =========================================================
   PROPERTY GALLERY
========================================================= */

function renderPropertyGallery(property) {

    const gallery =
        document.getElementById(
            "propertyGallery"
        );


    const images =
        property.images || [];


    if (!images.length) {

        gallery.innerHTML = "";

        return;

    }


    gallery.innerHTML = `

        <div class="gallery-main">

            <img
                id="galleryMainImage"
                src="${escapeHTML(images[0])}"
                alt="${escapeHTML(property.title)}"
            >

        </div>


        <div class="gallery-thumbs">

            ${
                images.map(
                    (image, index) => `

                        <div
                            class="gallery-thumb ${
                                index === 0
                                    ? "active"
                                    : ""
                            }"
                            onclick="changeGalleryImage(
                                this.querySelector('img').src,
                                this
                            )"
                        >

                            <img
                                src="${escapeHTML(image)}"
                                alt=""
                            >

                        </div>

                    `
                ).join("")
            }

        </div>

    `;

}


function changeGalleryImage(
    image,
    element
) {

    document.getElementById(
        "galleryMainImage"
    ).src = image;


    document
        .querySelectorAll(
            ".gallery-thumb"
        )
        .forEach(
            thumb =>
                thumb.classList.remove(
                    "active"
                )
        );


    element.classList.add(
        "active"
    );

}


/* =========================================================
   SEARCH TABS
========================================================= */

function setupSearchTabs() {

    document
        .querySelectorAll(
            ".search-tab"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".search-tab"
                        )
                        .forEach(
                            btn =>
                                btn.classList
                                    .remove(
                                        "active"
                                    )
                        );


                    button.classList.add(
                        "active"
                    );


                    currentSearchMode =
                        button.dataset.mode;


                    runSearch();

                }
            );

        });

}


/* =========================================================
   SEARCH
========================================================= */

function runSearch() {

    const location =
        document.getElementById(
            "searchLocation"
        ).value
            .toLowerCase();


    const type =
        document.getElementById(
            "searchType"
        ).value
            .toLowerCase();


    const minPrice =
        Number(
            document.getElementById(
                "searchMinPrice"
            ).value
        ) || 0;


    const maxPrice =
        Number(
            document.getElementById(
                "searchMaxPrice"
            ).value
        ) || Infinity;


    const results =
        properties.filter(
            property => {

                const propertyLocation =
                    property.location
                        .toLowerCase();


                const propertyType =
                    property.type
                        .toLowerCase();


                const propertyStatus =
                    property.status
                        .toLowerCase();


                const matchesLocation =
                    !location ||
                    propertyLocation.includes(
                        location
                    );


                const matchesType =
                    !type ||
                    propertyType === type;


                const matchesPrice =
                    Number(property.price)
                        >= minPrice &&
                    Number(property.price)
                        <= maxPrice;


                let matchesMode = true;


                if (
                    currentSearchMode ===
                    "sale"
                ) {

                    matchesMode =
                        propertyStatus
                            .includes("sale");

                }


                if (
                    currentSearchMode ===
                    "rent"
                ) {

                    matchesMode =
                        propertyStatus
                            .includes("rent");

                }


                if (
                    currentSearchMode ===
                    "lease"
                ) {

                    matchesMode =
                        propertyStatus
                            .includes("lease");

                }


                if (
                    currentSearchMode ===
                    "commercial"
                ) {

                    matchesMode =
                        propertyType
                            .includes(
                                "commercial"
                            ) ||
                        propertyType
                            .includes("office") ||
                        propertyType
                            .includes("warehouse");

                }


                return (
                    matchesLocation &&
                    matchesType &&
                    matchesPrice &&
                    matchesMode
                );

            }
        );


    renderProperties(results);


    document
        .getElementById(
            "properties"
        )
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const menuButton =
        document.getElementById(
            "menuButton"
        );


    const mobileMenu =
        document.getElementById(
            "mobileMenu"
        );


    const mobileClose =
        document.getElementById(
            "mobileClose"
        );


    menuButton.addEventListener(
        "click",
        () => {

            mobileMenu.classList.add(
                "open"
            );

        }
    );


    mobileClose.addEventListener(
        "click",
        () => {

            mobileMenu.classList.remove(
                "open"
            );

        }
    );


    mobileMenu
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    mobileMenu.classList.remove(
                        "open"
                    );

                }
            );

        });

}


/* =========================================================
   CONTACT FORM
========================================================= */

function setupContactForm() {

    const form =
        document.getElementById(
            "contactForm"
        );


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                document.getElementById(
                    "contactName"
                ).value;


            const phone =
                document.getElementById(
                    "contactPhone"
                ).value;


            const need =
                document.getElementById(
                    "contactNeed"
                ).value;


            const message =
                document.getElementById(
                    "contactMessage"
                ).value;


            const whatsappMessage =
                `Hello ALUMARIAH REALTORS,%0A%0A` +
                `My name is ${name}.%0A` +
                `Phone: ${phone}%0A` +
                `I need help with: ${need}%0A%0A` +
                `${message}`;


            const url = "https://wa.me/254721557592?text=" + encodeURIComponent(`Hello ALUMARIAH REALTORS,\nMy name is ${name}.\nPhone: ${phone}\nI need help with: ${need}\n${message}`);

            window.open(
                url,
                "_blank"
            );


            document.getElementById(
                "contactStatus"
            ).textContent =
                "Opening WhatsApp...";

        }
    );

}


/* =========================================================
   CLOSE MODALS WHEN CLICKING OUTSIDE
========================================================= */

window.addEventListener(
    "click",
    event => {

        const detailsModal =
            document.getElementById(
                "propertyDetailsModal"
            );





        if (
            event.target ===
            detailsModal
        ) {

            closePropertyDetails();

        }

    }
);