

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
    listTenants: `${editorConfig.apiBase}/configurations`,
    getTenant: (id) => `${editorConfig.apiBase}/configuration/${id}`,
    generateDefault: `${editorConfig.apiBase}/configuration/1`,
    postTenant: `${editorConfig.apiBase}/configuration`,
    putTenant: `${editorConfig.apiBase}/configuration`,
};


/**
 * Initializes the Monaco Editor instance.
 */
async function setupEditor() {
    const editorElement = document.getElementById('editor-tenant');
    if (!editorElement) {
        console.error('Editor element not found.');
        return; // Abort if editor element is not found
    }
    editorConfig.editorInstance = monaco.editor.create(editorElement, {
        value: '',
        language: 'json',
        theme: 'vs-dark',
        automaticLayout: true,
    });
}


function updateEditorDivWithMethod(action) {
    console.log('updateEditorDivWithMethod started')
    const editorDiv = document.getElementById('editor-interface');
    // if action is post remove data attribute id
    if (action === 'POST') {
        clearEditorDivAttributes();
    }
    editorDiv.setAttribute('data-method', action);
    console.log('updateEditorDivWithMethod ended')

}

function clearEditorDivAttributes() {
    console.log('clearEditorDivAttributes started');
    const editorDiv = document.getElementById('editor-interface');

    // Remove the data-id attribute if it exists
    if (editorDiv.hasAttribute('data-id')) {
        editorDiv.removeAttribute('data-id');
    }

    // Remove the data-method attribute if it exists
    if (editorDiv.hasAttribute('data-method')) {
        editorDiv.removeAttribute('data-method');
    }

    console.log('clearEditorDivAttributes ended');
}


function handleEditorButtonAction(buttonId, method) {
    console.log(`${method} button clicked`);

    // Clear previous attributes
    clearEditorDivAttributes();

    // Set the active button
    setActiveButton(document.getElementById(buttonId));

    // Update the editor div with the new method
    updateEditorDivWithMethod(method);

    // Activate the select tenant div
    activateSelectTenantDivOnAction();

    console.log(`${method} Action ended`);
}

function handleGenerateClick() {
    console.log('handleGenerateClick started')

    // Clear previous attributes
    clearEditorDivAttributes();
    setActiveButton(document.getElementById('generate-btn'));
    deActivateSelectTenantDivOnAction()
    fetchAndPopulateEditor(apiEndpoints.generateDefault);
    updateEditorDivWithMethod("POST");
    makeEditorVisible();
    console.log('handleGenerateClick ended')
}

function handleCopyButtonClick() {
    handleEditorButtonAction('copy-btn', 'POST');
}

function handleUpdateButtonClick() {
    handleEditorButtonAction('update-btn', 'PUT');
}


function handleResetChangesClick() {
    console.log('Reset changes button clicked');
    clearEditorDivAttributes();
    deActivateSelectTenantDivOnAction();
    hideActiveButton();
    hideEditor();
    console.log('Reset changes Action ended');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded')
    // Set event listeners for buttons
    document.getElementById('copy-btn').addEventListener('click', handleCopyButtonClick);
    document.getElementById('update-btn').addEventListener('click', handleUpdateButtonClick);
    document.getElementById('generate-btn').addEventListener('click', handleGenerateClick);
    document.getElementById('reset-changes').addEventListener('click', handleResetChangesClick);
    console.log('DOM loaded ended')
});

function updateEditorDivWithId(selectedId) {
    console.log('updateEditorDivWithId started')
    const editorDiv = document.getElementById('editor-interface');
    editorDiv.setAttribute('data-id', selectedId);
    console.log('updateEditorDivWithId ended')
}

function onSelectTenant() {
    console.log('onSelectTenant started')
    hideEditor();
    const dropdown = document.getElementById('dropdown');
    const selectedId = dropdown.value;
    if (selectedId) {
        let tenantUrl = apiEndpoints.getTenant(selectedId);
        console.log('Selected tenant URL:', tenantUrl);
        fetchAndPopulateEditor(tenantUrl);
        // get editor-interface data method
        let editorInterface = document.getElementById('editor-interface');
        let method = editorInterface.getAttribute('data-method');
        // if method is PUT than update
        if (method === 'PUT') {
            updateEditorDivWithId(selectedId);
        }
        makeEditorVisible();
    }
    console.log('onSelectTenant ended')
}

function populateTenantsDropdown() {
    console.log('populateTenantsDropdown started');
    fetch(apiEndpoints.listTenants)
        .then(response => response.json())
        .then(data => {
            const dropdown = document.getElementById('dropdown');
            dropdown.innerHTML = ''; // Clear existing options

            // Add default hint option
            let defaultOption = new Option('Select a tenant', '', false, false);
            defaultOption.disabled = true;
            dropdown.add(defaultOption);

            dropdown.selectedIndex = 0;

            // Populate dropdown with tenants
            Object.entries(data).forEach(([id, name]) => {
                let option = new Option(name, id);
                dropdown.add(option);
            });

            // Remove existing event listeners to avoid duplicates
            dropdown.removeEventListener('change', onSelectTenant);

            // Add change event listener to the dropdown
            dropdown.addEventListener('change', onSelectTenant);
        })
        .catch(error => {
            console.error('Error fetching tenants:', error);
        });
    console.log('populateTenantsDropdown ended');
}

function clearTenantsDropdown() {
    console.log('clearTenantsDropdown started');
    const dropdown = document.getElementById('dropdown');
    if (dropdown) {
        // Remove the event listener
        dropdown.removeEventListener('change', onSelectTenant);

        dropdown.innerHTML = ''; // Clear all options

        // Optionally, you could also add back the default 'Select a tenant' option
        let defaultOption = new Option('Select a tenant', '', false, false);
        defaultOption.disabled = true;
        dropdown.add(defaultOption);

        dropdown.selectedIndex = 0;
    } else {
        console.error('Dropdown element not found.');
    }
    console.log('clearTenantsDropdown ended');
}


function setActiveButton(button) {
    console.log('setActiveButton started')
    // Remove active class from all buttons
    document.getElementById('copy-btn').classList.remove('active-button');
    document.getElementById('update-btn').classList.remove('active-button');
    document.getElementById('generate-btn').classList.remove('active-button');

    // Add active class to the clicked button
    button.classList.add('active-button');
    console.log('setActiveButton ended')
}

function hideActiveButton() {
    console.log('hideActiveButton started')
    // Remove active class from all buttons
    document.getElementById('copy-btn').classList.remove('active-button');
    document.getElementById('update-btn').classList.remove('active-button');
    document.getElementById('generate-btn').classList.remove('active-button');
    console.log('hideActiveButton ended')
}

function activateSelectTenantDivOnAction() {
    console.log('activateSelectTenantDivOnAction started')
    populateTenantsDropdown();
    hideEditor();
    const tenantDiv = document.getElementById('select-tenant-div');
    tenantDiv.classList.remove('d-none');
    const tenantEmptyDiv = document.getElementById('select-tenant-div-empty');
    tenantEmptyDiv.classList.add('d-none');
    console.log('activateSelectTenantDivOnAction ended')
}

function deActivateSelectTenantDivOnAction() {
    console.log('deActivateSelectTenantDivOnAction started')
    clearTenantsDropdown();
    const tenantDiv = document.getElementById('select-tenant-div');
    tenantDiv.classList.add('d-none');
    const tenantEmptyDiv = document.getElementById('select-tenant-div-empty');
    tenantEmptyDiv.classList.remove('d-none');
    console.log('deActivateSelectTenantDivOnAction ended')
}



// This function populates the Monaco editor with the provided data
function populateEditor(data) {
    console.log('populateEditor started');
    if (editorConfig.editorInstance) {
        editorConfig.editorInstance.setValue(JSON.stringify(data, null, 2));
    } else {
        console.log('populateEditor: No editor instance available.');
    }
    console.log('populateEditor ended');
}

function clearEditor() {
    console.log('clearEditor started');
    if (editorConfig.editorInstance) {
        editorConfig.editorInstance.setValue('');
    } else {
        console.log('clearEditor: No editor instance available.');
    }
    console.log('clearEditor ended');
}

function showEditorActionButton() {
    console.log('showEditorActionButton started')
    const saveButton = document.getElementById('save-button-container');
    saveButton.classList.remove('d-none');
    const cancelButton = document.getElementById('cancel-button-container');
    cancelButton.classList.remove('d-none');
    const exportButton = document.getElementById('export-button-container');
    exportButton.classList.remove('d-none');

    const saveTenantEmptyDiv = document.getElementById('save-tenant-div-empty');
    saveTenantEmptyDiv.classList.add('d-none');
    const cancelTenantEmptyDiv = document.getElementById('cancel-tenant-div-empty');
    cancelTenantEmptyDiv.classList.add('d-none');
    const exportTenantEmptyDiv = document.getElementById('export-tenant-div-empty');
    exportTenantEmptyDiv.classList.add('d-none');
    console.log('showEditorActionButton ended')
}

function hideEditorActionButtons() {
    console.log('hideEditorActionButtons started');
    const saveButton = document.getElementById('save-button-container');
    saveButton.classList.add('d-none');
    const cancelButton = document.getElementById('cancel-button-container');
    cancelButton.classList.add('d-none');
    const exportButton = document.getElementById('export-button-container');
    exportButton.classList.add('d-none');

    const saveTenantEmptyDiv = document.getElementById('save-tenant-div-empty');
    saveTenantEmptyDiv.classList.remove('d-none');
    const cancelTenantEmptyDiv = document.getElementById('cancel-tenant-div-empty');
    cancelTenantEmptyDiv.classList.remove('d-none');
    const exportTenantEmptyDiv = document.getElementById('export-tenant-div-empty');
    exportTenantEmptyDiv.classList.remove('d-none');
    console.log('hideEditorActionButtons ended');
}


function makeEditorVisible() {
    console.log('makeEditorVisible started')
    const editorInterface = document.getElementById('editor-interface');
    editorInterface.classList.remove('d-none');
    showEditorActionButton();
    console.log('makeEditorVisible ended')
}

function hideEditor() {
    console.log('hideEditor started')
    clearEditor();
    const editorInterface = document.getElementById('editor-interface');
    editorInterface.classList.add('d-none');
    hideEditorActionButtons();
    console.log('hideEditor ended')
}

function fetchAndPopulateEditor(url) {
    console.log('fetchAndPopulateEditor started')

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Populate the editor with the fetched data
            populateEditor(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    console.log('fetchAndPopulateEditor ended')
}



window.onload = async function () {
    console.log('window.onload started')
    // Configure the path for Monaco Editor
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

    // Load the Monaco Editor
    await require(['vs/editor/editor.main'], async function () {
        // Once the editor is loaded, set it up
        await setupEditor();
    });
    console.log('window.onload ended')
};
