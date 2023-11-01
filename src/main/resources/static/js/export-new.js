let editor;
let unsavedChanges = false;

function setupEditor() {
    const editorId = 'editor-tenant';
    const editorElement = document.getElementById(editorId);
    const language = editorElement.getAttribute('data-language');

    editor = monaco.editor.create(editorElement, {
        value: '',
        language: language.toLowerCase(),
        scrollbar: { vertical: 'auto', horizontal: 'auto' },
        theme: 'vs-dark',
        automaticLayout: true,
    });

    // Populate the tenant dropdown after setting up the editor
    populateTenantDropdown();
}

function populateTenantDropdown() {
    fetch(`/api/v1/configuration/tenant/`)
        .then(response => response.json())
        .then(tenants => {
            const dropdownMenu = document.querySelector("#tenantDropdown + .dropdown-menu");

            tenants.forEach(tenant => {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = "#";
                a.className = "dropdown-item";
                a.textContent = tenant.name;  // assuming 'name' represents the tenant name
                a.onclick = function() { loadTenantContent(tenant.id); }; // Load content when this item is clicked

                li.appendChild(a);
                dropdownMenu.appendChild(li);
            });
        })
        .catch(error => {
            console.error(`Error fetching tenants: ${error}`);
        });
}

function loadTenantContent(tenantId) {
    fetch(`/api/v1/configuration/tenant/${tenantId}`)
        .then(response => response.text())
        .then(content => {
            editor.setValue(content);
            showEditorAndButton();
        })
        .catch(error => {
            console.error(`Error fetching content for tenant ID ${tenantId}: ${error}`);
        });
}

function loadDefaultTenant() {
    fetch(`/api/v1/configuration/tenant/generate`)
        .then(response => response.text())
        .then(content => {
            editor.setValue(content);
            showEditorAndButton();
        })
        .catch(error => {
            console.error(`Error fetching default tenant: ${error}`);
        });
}

function submitTenantSelection() {
    const content = editor.getValue();
    // Handle the submit logic for the tenant content here
    // This could be a POST or PUT request to save/update the tenant content on your server
}
function showEditorAndButton() {
    document.getElementById('editor-tenant').classList.remove('d-none');
    document.getElementById('submitBtn').classList.remove('d-none');

    // Move dropdown above the editor
    const configurationsDiv = document.querySelector('.configurations');
    configurationsDiv.classList.remove('vh-100', 'justify-content-center');
}


window.onload = function () {
    require.config({paths: {'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs'}});
    require(['vs/editor/editor.main'], function () {
        setupEditor();
    });
}
