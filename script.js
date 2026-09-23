/* =========================================================
   ALUMARIAH REALTORS
   PROPERTY MANAGEMENT SYSTEM
========================================================= */


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

const STORAGE_KEY = "alumariah_realtors_properties";

let properties = [];

let editingPropertyId = null;

let selectedImages = [];

let currentSearchMode = "all";


/* =========================================================
   START WEBSITE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadProperties();

    renderProperties();

    setupNavigation();

    setupImageUpload();

    setupSearchTabs();

    setupContactForm();

});


/* =========================================================
   PROPERTY STORAGE
========================================================= */

function loadProperties() {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (saved) {

        try {

            properties =
                JSON.parse(saved);

        } catch (error) {

            properties = [];

        }

    } else {

        properties = [];

    }

}


function saveProperties() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(properties)
        );

    } catch (error) {

        alert(
            "The browser storage is full. Try using smaller images or fewer photos."
        );

    }

}


/* =========================================================
   PROPERTY ID
========================================================= */

function createPropertyId() {

    return Date.now().toString()
        + Math.random()
            .toString(36)
            .substring(2, 8);

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

    const message =
        `Hello ALUMARIAH REALTORS,%0A%0A` +
        `I am interested in:%0A` +
        `${property.title}%0A` +
        `Location: ${property.location}%0A` +
        `Price: ${formatPrice(property.price)}%0A%0A` +
        `Please provide more information.`;

    return `https://wa.me/254756112632?text=${message}`;

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
                        src="${image}"
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
                        `<span>🛏 ${property.beds} Beds</span>`
                        : ""
                    }

                    ${
                        property.baths
                        ?
                        `<span>♨ ${property.baths} Baths</span>`
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
   ADMIN PANEL
========================================================= */

function openAdminPanel() {

    const modal =
        document.getElementById(
            "adminModal"
        );

    modal.classList.add("show");

    document.body.style.overflow =
        "hidden";

    showAddProperty();

}


function closeAdminPanel() {

    const modal =
        document.getElementById(
            "adminModal"
        );

    modal.classList.remove("show");

    document.body.style.overflow =
        "";

    resetPropertyForm();

}


/* =========================================================
   ADMIN TABS
========================================================= */

function showAddProperty() {

    document.getElementById(
        "addPropertyArea"
    ).style.display = "block";


    document.getElementById(
        "managePropertyArea"
    ).style.display = "none";


    document.getElementById(
        "addTab"
    ).classList.add("active");


    document.getElementById(
        "manageTab"
    ).classList.remove("active");

}


function showManageProperties() {

    document.getElementById(
        "addPropertyArea"
    ).style.display = "none";


    document.getElementById(
        "managePropertyArea"
    ).style.display = "block";


    document.getElementById(
        "addTab"
    ).classList.remove("active");


    document.getElementById(
        "manageTab"
    ).classList.add("active");


    renderAdminProperties();

}


/* =========================================================
   IMAGE UPLOAD
========================================================= */

function setupImageUpload() {

    const input =
        document.getElementById(
            "propertyImages"
        );


    if (!input) return;


    input.addEventListener(
        "change",
        event => {

            selectedImages =
                Array.from(
                    event.target.files
                );

            showImagePreviews();

        }
    );

}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function showImagePreviews() {

    const preview =
        document.getElementById(
            "imagePreview"
        );


    preview.innerHTML = "";


    selectedImages.forEach(file => {

        const reader =
            new FileReader();


        reader.onload = event => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "preview-image";


            div.innerHTML = `

                <img
                    src="${event.target.result}"
                    alt="Property preview"
                >

            `;


            preview.appendChild(div);

        };


        reader.readAsDataURL(file);

    });

}


/* =========================================================
   COMPRESS IMAGE
========================================================= */

function compressImage(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload = event => {

                const img =
                    new Image();


                img.onload = () => {

                    const maxWidth = 1400;

                    let width =
                        img.width;

                    let height =
                        img.height;


                    if (width > maxWidth) {

                        height =
                            height *
                            (maxWidth / width);

                        width =
                            maxWidth;

                    }


                    const canvas =
                        document.createElement(
                            "canvas"
                        );


                    canvas.width =
                        width;

                    canvas.height =
                        height;


                    const ctx =
                        canvas.getContext(
                            "2d"
                        );


                    ctx.drawImage(
                        img,
                        0,
                        0,
                        width,
                        height
                    );


                    const compressed =
                        canvas.toDataURL(
                            "image/jpeg",
                            .78
                        );


                    resolve(compressed);

                };


                img.onerror =
                    reject;

                img.src =
                    event.target.result;

            };


            reader.onerror =
                reject;

            reader.readAsDataURL(file);

        }
    );

}


/* =========================================================
   PROPERTY FORM
========================================================= */

document.addEventListener(
    "submit",
    async event => {

        if (
            event.target.id !==
            "propertyForm"
        ) return;


        event.preventDefault();


        const title =
            document.getElementById(
                "propertyTitle"
            ).value.trim();


        const location =
            document.getElementById(
                "propertyLocation"
            ).value.trim();


        const status =
            document.getElementById(
                "propertyStatus"
            ).value;


        const type =
            document.getElementById(
                "propertyType"
            ).value;


        const price =
            document.getElementById(
                "propertyPrice"
            ).value;


        const beds =
            document.getElementById(
                "propertyBeds"
            ).value;


        const baths =
            document.getElementById(
                "propertyBaths"
            ).value;


        const size =
            document.getElementById(
                "propertySize"
            ).value.trim();


        const description =
            document.getElementById(
                "propertyDescription"
            ).value.trim();


        const message =
            document.getElementById(
                "propertyMessage"
            );


        if (
            !title ||
            !location ||
            !price ||
            !description
        ) {

            message.textContent =
                "Please complete all required fields.";

            return;

        }


        if (
            !editingPropertyId &&
            !selectedImages.length
        ) {

            message.textContent =
                "Please upload at least one property photo.";

            return;

        }


        message.textContent =
            "Saving property...";


        let images = [];


        try {

            if (selectedImages.length) {

                for (
                    const file
                    of selectedImages
                ) {

                    const compressed =
                        await compressImage(
                            file
                        );

                    images.push(
                        compressed
                    );

                }

            }


            if (editingPropertyId) {

                const index =
                    properties.findIndex(
                        p =>
                            p.id ===
                            editingPropertyId
                    );


                if (index !== -1) {

                    const existing =
                        properties[index];


                    properties[index] = {

                        ...existing,

                        title,
                        location,
                        status,
                        type,
                        price:
                            Number(price),
                        beds:
                            Number(beds) || 0,
                        baths:
                            Number(baths) || 0,
                        size,
                        description,

                        images:
                            images.length
                            ?
                            images
                            :
                            existing.images

                    };

                }

            } else {

                const newProperty = {

                    id:
                        createPropertyId(),

                    title,

                    location,

                    status,

                    type,

                    price:
                        Number(price),

                    beds:
                        Number(beds) || 0,

                    baths:
                        Number(baths) || 0,

                    size,

                    description,

                    images,

                    createdAt:
                        new Date()
                            .toISOString()

                };


                properties.unshift(
                    newProperty
                );

            }


            saveProperties();

            renderProperties();

            renderAdminProperties();


            message.textContent =
                "Property saved successfully!";


            setTimeout(
                () => {

                    resetPropertyForm();

                    showManageProperties();

                },
                900
            );


        } catch (error) {

            console.error(error);

            message.textContent =
                "Something went wrong while saving the property.";

        }

    }
);


/* =========================================================
   RESET FORM
========================================================= */

function resetPropertyForm() {

    const form =
        document.getElementById(
            "propertyForm"
        );


    if (form) {

        form.reset();

    }


    selectedImages = [];

    editingPropertyId = null;


    const preview =
        document.getElementById(
            "imagePreview"
        );


    if (preview) {

        preview.innerHTML = "";

    }


    const message =
        document.getElementById(
            "propertyMessage"
        );


    if (message) {

        message.textContent = "";

    }


    const button =
        document.querySelector(
            "#propertyForm .button-primary"
        );


    if (button) {

        button.innerHTML =
            "Save Property →";

    }

}


/* =========================================================
   ADMIN PROPERTY LIST
========================================================= */

function renderAdminProperties() {

    const container =
        document.getElementById(
            "adminPropertyList"
        );


    if (!properties.length) {

        container.innerHTML = `

            <div class="no-admin-listings">

                <strong>
                    No properties have been added yet.
                </strong>

                <p>
                    Go to "Add Property" to create your first listing.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    properties.forEach(property => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "admin-list-item";


        const image =
            property.images &&
            property.images.length
                ? property.images[0]
                : "";


        item.innerHTML = `

            <div class="admin-list-image">

                ${
                    image
                    ?
                    `<img
                        src="${image}"
                        alt=""
                    >`
                    :
                    ""
                }

            </div>


            <div class="admin-list-info">

                <strong>
                    ${escapeHTML(property.title)}
                </strong>

                <span>
                    ${escapeHTML(property.location)}
                    •
                    ${formatPrice(property.price)}
                </span>

            </div>


            <div class="admin-list-buttons">

                <button
                    class="edit-listing"
                    onclick="editProperty('${property.id}')"
                >
                    Edit
                </button>

                <button
                    class="delete-listing"
                    onclick="deleteProperty('${property.id}')"
                >
                    Delete
                </button>

            </div>

        `;


        container.appendChild(item);

    });

}


/* =========================================================
   EDIT PROPERTY
========================================================= */

function editProperty(id) {

    const property =
        properties.find(
            p => p.id === id
        );


    if (!property) return;


    editingPropertyId =
        id;


    document.getElementById(
        "propertyTitle"
    ).value =
        property.title;


    document.getElementById(
        "propertyLocation"
    ).value =
        property.location;


    document.getElementById(
        "propertyStatus"
    ).value =
        property.status;


    document.getElementById(
        "propertyType"
    ).value =
        property.type;


    document.getElementById(
        "propertyPrice"
    ).value =
        property.price;


    document.getElementById(
        "propertyBeds"
    ).value =
        property.beds;


    document.getElementById(
        "propertyBaths"
    ).value =
        property.baths;


    document.getElementById(
        "propertySize"
    ).value =
        property.size || "";


    document.getElementById(
        "propertyDescription"
    ).value =
        property.description;


    selectedImages = [];


    document.getElementById(
        "imagePreview"
    ).innerHTML = "";


    const button =
        document.querySelector(
            "#propertyForm .button-primary"
        );


    button.innerHTML =
        "Update Property →";


    showAddProperty();

}


/* =========================================================
   DELETE PROPERTY
========================================================= */

function deleteProperty(id) {

    const property =
        properties.find(
            p => p.id === id
        );


    if (!property) return;


    const confirmed =
        confirm(
            `Delete "${property.title}"?`
        );


    if (!confirmed) return;


    properties =
        properties.filter(
            p => p.id !== id
        );


    saveProperties();

    renderProperties();

    renderAdminProperties();

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
            `<span>🛏 ${property.beds} Bedrooms</span>`;

    }


    if (property.baths) {

        features.innerHTML +=
            `<span>♨ ${property.baths} Bathrooms</span>`;

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
                src="${images[0]}"
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
                                '${image}',
                                this
                            )"
                        >

                            <img
                                src="${image}"
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


            const url =
                `https://wa.me/254721557592?text=${whatsappMessage}`;


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

        const adminModal =
            document.getElementById(
                "adminModal"
            );


        const detailsModal =
            document.getElementById(
                "propertyDetailsModal"
            );


        if (
            event.target ===
            adminModal
        ) {

            closeAdminPanel();

        }


        if (
            event.target ===
            detailsModal
        ) {

            closePropertyDetails();

        }

    }
);