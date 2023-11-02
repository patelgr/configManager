/**
 * TODO:
 * - Implement change detection to update `unsavedChanges` flag when the editor content changes.
 * - Validate editor content before submission to ensure it meets expected criteria.
 * - Provide user feedback for successful submissions and errors.
 * - If implementing a hide editor function, ensure it toggles the visibility of the editor and submit button appropriately.
 * - Add a prompt to alert the user of unsaved changes if they attempt to navigate away or load new content.
 * - Handle loading states during API calls to improve user experience.
 */


/**
 * Editor setup and interaction with the API to manage tenant configurations.
 */
const editorConfig = {
    unsavedChanges: false,
    editorInstance: null,
    apiBase: '/api/v1',
};

// Configuration object holding endpoint functions
const apiEndpoints = {
    listTenants: `${editorConfig.apiBase}/configuration/tenant`,
    getTenant: (id) => `${editorConfig.apiBase}/configuration/tenant/${id}`,
    generateDefault: `${editorConfig.apiBase}/configuration/tenant`,
    postTenant : `${editorConfig.apiBase}/configuration/tenant`,
};

/**
 * Initializes the Monaco Editor instance.
 */
async function setupEditor() {
    const editorElement = document.getElementById('editor-tenant');
    const language = editorElement.getAttribute('data-language');
    console.log('language' + language);

    editorConfig.editorInstance = monaco.editor.create(editorElement, {
        value: '',
        language: language.toLowerCase(),
        scrollbar: { vertical: 'auto', horizontal: 'auto' },
        theme: 'vs-dark',
        automaticLayout: true,
    });
    // TODO: Implement change detection for the editor
    // editorConfig.editorInstance.onDidChangeModelContent(event => {
    //     editorConfig.unsavedChanges = true;
    // TODO: Update UI to reflect unsaved changes
    // });
    await populateTenantDropdown();
}

/**
 * Populates the tenant dropdown with available tenants.
 */
async function populateTenantDropdown() {
    try {
        const tenants = await fetchData(apiEndpoints.listTenants);
        const dropdownMenu = document.querySelector("#tenantDropdown + .dropdown-menu");

        tenants.forEach(tenant => {
            dropdownMenu.appendChild(createDropdownItem(tenant.name, () => loadTenantContent(tenant.id)));
        });
    } catch (error) {
        console.error(`Error fetching tenants: ${error}`);
    }
}

/**
 * Creates a dropdown item.
 * @param {string} text - Display text for the dropdown item.
 * @param {Function} clickAction - Action to perform on item click.
 * @returns {HTMLElement} - The dropdown item element.
 */
function createDropdownItem(text, clickAction) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.className = "dropdown-item";
    a.textContent = text;
    a.addEventListener('click', clickAction);

    li.appendChild(a);
    return li;
}

/**
 * Loads the content for a specific tenant into the editor.
 * @param {string} tenantId - The ID of the tenant.
 */
async function loadTenantContent(tenantId) {
    try {
        const content = await fetchData(apiEndpoints.getTenant(tenantId), 'text');
        editorConfig.editorInstance.setValue(content);
        const editorContainer = document.getElementById('editor-tenant');
        editorContainer.setAttribute('data-tenant-id', tenantId); // Set the tenant ID as a data attribute
        showEditorAndButton();
    } catch (error) {
        console.error(`Error fetching content for tenant ID ${tenantId}: ${error}`);
    }
}
/**
 * Fetches data from the provided URL.
 * @param {string} url - The URL to fetch data from.
 * @param {string} [responseType='json'] - The response type expected.
 * @returns {Promise<any>} - The fetched data.
 */
async function fetchData(url, responseType = 'json') {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok.');
    return responseType === 'json' ? response.json() : response.text();
}

/**
 * Loads the default tenant's content into the editor.
 */
async function loadDefaultTenant() {
    try {
        const content = await fetchData(apiEndpoints.generateDefault, 'text');
        editorConfig.editorInstance.setValue(content);
        const editorContainer = document.getElementById('editor-tenant');
        editorContainer.setAttribute('data-tenant-id', 'default'); // Explicitly mark as default tenant
        showEditorAndButton();
    } catch (error) {
        console.error(`Error fetching default tenant: ${error}`);
    }
}


/**
 * Handles the submission of the tenant's configuration.
 * Implement the logic to submit content to the server using a POST or PUT request.
 */

async function submitTenantSelection() {
    const editorContainer = document.getElementById('editor-tenant');
    const tenantId = editorContainer.getAttribute('data-tenant-id');
    const content = editorConfig.editorInstance.getValue();

    try {
        let response;
        if (tenantId && tenantId !== 'default') {
            // If there is a tenant ID and it is not 'default', use PUT to update the tenant's configuration
            response = await fetch(`${apiEndpoints.postTenant}/${tenantId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: content }),
            });
        } else {
            // If tenant ID is 'default' or not set, use POST to create a new tenant configuration
            response = await fetch(apiEndpoints.postTenant, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: content }),
            });
        }

        if (response.ok) {
            // Handle successful submission here
            console.log('Content submitted successfully');
        } else {
            // Handle errors here
            throw new Error('Content submission failed');
        }
    } catch (error) {
        console.error(`Error submitting tenant configuration: ${error}`);
    }
}


/**
 * Displays the editor and the submit button, and repositions the dropdown menu.
 */
function showEditorAndButton() {
    document.getElementById('editor-tenant').classList.remove('d-none');
    document.getElementById('submit-div').classList.remove('d-none');
    document.getElementById('actionDropdown').classList.add('d-none');

    // Move dropdown above the editor
    const configurationsDiv = document.querySelector('.configurations');
    configurationsDiv.classList.remove('vh-100', 'justify-content-center');
}

/**
 * Hides the editor and the submit button, and repositions the dropdown menu.
 * @returns {Promise<void>}
 */
// TODO: Add prompt for unsaved changes when attempting to navigate away

window.onload = async function () {
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
    require(['vs/editor/editor.main'], async function () {
        await setupEditor();
    });
};
