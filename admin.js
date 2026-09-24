let properties = [];
let editingPropertyId = null;
let selectedImages = [];
let currentAdmin = null;
let busy = false;
const byId = id => document.getElementById(id);

function status(message) { byId('adminStatus').textContent = message; }
function lockEditor() {
    currentAdmin = null;
    properties = [];
    resetPropertyForm();
    byId('adminPropertyList').replaceChildren();
    byId('adminWorkspace').hidden = true;
    byId('loginPanel').hidden = false;
    byId('signOut').hidden = true;
}
function setBusy(value) {
    busy = value;
    document.querySelectorAll('#adminWorkspace button, #adminWorkspace input, #adminWorkspace select, #adminWorkspace textarea, #signOut')
        .forEach(element => { element.disabled = value; });
}
async function requireAdmin() {
    const user = await PropertyStore.isAdmin();
    if (!user) {
        lockEditor();
        throw new Error('Please sign in with an authorised admin account.');
    }
    return user;
}
async function refreshListings() {
    properties = await PropertyStore.list();
    renderAdminProperties();
}
async function enterWorkspace() {
    currentAdmin = await requireAdmin();
    await refreshListings();
    byId('accountLabel').textContent = `Signed in as ${currentAdmin.email}`;
    byId('loginPanel').hidden = true;
    byId('adminWorkspace').hidden = false;
    byId('signOut').hidden = false;
    showManageProperties();
    status('');
}
function showAddProperty() {
    byId('addPropertyArea').style.display = 'block';
    byId('managePropertyArea').style.display = 'none';
    byId('addTab').classList.add('active');
    byId('manageTab').classList.remove('active');
}
function showManageProperties() {
    byId('addPropertyArea').style.display = 'none';
    byId('managePropertyArea').style.display = 'block';
    byId('addTab').classList.remove('active');
    byId('manageTab').classList.add('active');
    renderAdminProperties();
}
function closeAdminPanel() { resetPropertyForm(); showManageProperties(); }
function renderAdminProperties() {
    const list = byId('adminPropertyList');
    list.replaceChildren();
    if (!properties.length) {
        const message = document.createElement('p');
        message.className = 'no-admin-listings';
        message.textContent = 'No active listings yet. Choose Add Property to publish your first listing.';
        list.appendChild(message);
    }
    properties.forEach(property => {
        const item = document.createElement('article');
        item.className = 'admin-list-item';
        if (property.images[0]) {
            const image = document.createElement('img');
            image.className = 'admin-list-image';
            image.src = property.images[0];
            image.alt = '';
            item.appendChild(image);
        }
        const info = document.createElement('div');
        info.className = 'admin-list-info';
        const title = document.createElement('strong');
        title.textContent = property.title;
        const detail = document.createElement('span');
        detail.textContent = `${property.location} · KSh ${Number(property.price).toLocaleString('en-KE')}`;
        info.append(title, detail);
        const actions = document.createElement('div');
        actions.className = 'admin-list-buttons';
        for (const [label, className, handler] of [
            ['Edit', 'edit-listing', () => editProperty(property.id)],
            ['Archive', 'delete-listing', () => archiveProperty(property.id)]
        ]) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = className;
            button.textContent = label;
            button.addEventListener('click', handler);
            actions.appendChild(button);
        }
        item.append(info, actions);
        list.appendChild(item);
    });
}
async function archiveProperty(id) {
    if (busy) return;
    const property = properties.find(p => p.id === id);
    if (!property || !confirm(`Archive "${property.title}"? It will no longer appear on the public website.`)) return;
    setBusy(true);
    try {
        await requireAdmin();
        await PropertyStore.archive(id);
        properties = properties.filter(p => p.id !== id);
        renderAdminProperties();
        status('Listing archived.');
    } catch (error) { status(error.message); }
    finally { setBusy(false); }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Associate the original form's visible labels with their inputs.
    document.querySelectorAll('.form-group').forEach(group => {
        const label = group.querySelector('label');
        const field = group.querySelector('input,select,textarea');
        if (label && field && field.id) label.htmlFor = field.id;
    });
    setupImageUpload();
    byId('propertyImages').accept = 'image/jpeg,image/png,image/webp';
    byId('refreshListings').addEventListener('click', async () => {
        if (busy) return;
        setBusy(true);
        try { await requireAdmin(); await refreshListings(); status('Listings refreshed.'); }
        catch (error) { status(error.message); }
        finally { setBusy(false); }
    });
    byId('loginForm').addEventListener('submit', async event => {
        event.preventDefault();
        const button = event.target.querySelector('button');
        button.disabled = true;
        status('Signing in…');
        try {
            const { error } = await PropertyStore.requireClient().auth.signInWithPassword({
                email: byId('adminEmail').value.trim(), password: byId('adminPassword').value
            });
            byId('adminPassword').value = '';
            if (error) throw new Error('Sign-in failed. Check your email and password.');
            await enterWorkspace();
        } catch (error) { lockEditor(); status(error.message); }
        finally { button.disabled = false; }
    });
    byId('signOut').addEventListener('click', async () => {
        if (busy) return;
        const { error } = await PropertyStore.requireClient().auth.signOut({ scope: 'local' });
        if (error) { status('Sign-out failed. Please try again.'); return; }
        lockEditor(); status('Signed out.');
    });
    byId('propertyForm').addEventListener('submit', saveProperty);
    if (!PropertyStore.client) {
        status('Admin setup is not complete. Follow SETUP.md to connect Supabase.');
        byId('loginForm').querySelector('button').disabled = true;
        return;
    }
    PropertyStore.client.auth.onAuthStateChange(event => {
        if (event === 'SIGNED_OUT') { lockEditor(); status('Signed out.'); }
    });
    try {
        const { data: { session }, error } = await PropertyStore.client.auth.getSession();
        if (error) throw error;
        if (session) await enterWorkspace();
    } catch (error) { lockEditor(); status(error.message); }
});

async function saveProperty(event) {
    event.preventDefault();
    if (busy) return;
    const message = byId('propertyMessage');
    const files = [...selectedImages];
    const editing = Boolean(editingPropertyId);
    const existing = properties.find(p => p.id === editingPropertyId);
    const id = editingPropertyId || crypto.randomUUID();
    const value = field => byId(field).value.trim();
    const property = {
        id, title: value('propertyTitle'), location: value('propertyLocation'),
        status: value('propertyStatus'), type: value('propertyType'),
        price: Number(value('propertyPrice')), beds: Number(value('propertyBeds')) || 0,
        baths: Number(value('propertyBaths')) || 0, size: value('propertySize'),
        description: value('propertyDescription'), images: existing?.images || []
    };
    if (!property.title || !property.location || !property.description || !Number.isFinite(property.price) || property.price < 0) {
        message.textContent = 'Please complete the required details and enter a valid price.'; return;
    }
    if ((!editing && !files.length) || files.length > 12 || files.some(file => !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 20 * 1024 * 1024)) {
        message.textContent = 'Use 1–12 JPEG, PNG or WebP photos, each under 20 MB. Existing photos are kept when editing without new uploads.'; return;
    }
    setBusy(true);
    message.textContent = 'Publishing property…';
    try {
        await requireAdmin();
        if (files.length) {
            property.images = [];
            for (const file of files) {
                const result = await PropertyStore.uploadImage(await compressImage(file), id);
                property.images.push(result.url);
            }
        }
        await PropertyStore.save(property, editing);
        // Only update local state after the database confirms the write.
        properties = [property, ...properties.filter(p => p.id !== id)];
        resetPropertyForm(); showManageProperties();
        status('Property published successfully. It is now available to website visitors.');
    } catch (error) {
        // An uncertain network result might have committed: retain uploads rather
        // than risk breaking photos on a successfully saved listing.
        message.textContent = 'Publishing could not be confirmed. Refresh listings before trying again. ' + error.message;
    } finally { setBusy(false); }
}

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
            "Publish Property →";

    }

}


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


