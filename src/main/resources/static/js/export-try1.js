

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
    const language = editorElement.getAttribute('data-language');
    console.log('Setting up editor for language:', language);

    editorConfig.editorInstance = monaco.editor.create(editorElement, {
        value: '',
        language: language.toLowerCase(),
        theme: 'vs-dark',
        automaticLayout: true,
    });
}

/**
 * Fetches data from the provided URL.
 */
async function fetchData(url, responseType = 'json') {
    console.log(`Fetching data from ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Network response was not ok for ${url}`);
        throw new Error('Network response was not ok.');
    }
    let responseData = responseType === 'json' ? response.json() : response.text();
    console.log(`Response data: ${typeof responseData}`)
    return responseData;
}

/**
 * Displays the editor interface.
 */
function toggleEditorInterface(show) {
    const editorInterface = document.getElementById('editor-interface');
    const actionButtons = document.getElementById('action-buttons');
    const actionLabelDiv = document.getElementById('action-label-div');
    const listInterface = document.getElementById('list-interface');
    const searchInterface = document.getElementById('list-interface');
    if (show) {
        editorInterface.classList.remove('d-none');
        // actionLabelDiv.textContent = 'Copy or Update Tenant Configuration';
        // actionButtons.classList.add('d-none');
        // listInterface.classList.add('d-none');
        // searchInterface.classList.add('d-none');
    } else {
        editorInterface.classList.add('d-none');
        // actionButtons.classList.remove('d-none');
        // listInterface.classList.remove('d-none');
        // searchInterface.classList.remove('d-none');
    }
}
/**
 * Combined Event listener setup
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Button event initialization
    function initButton(buttonId, handler) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', handler);
            console.log(`Button #${buttonId} initialized.`);
        } else {
            console.error(`Button #${buttonId} not found.`);
        }
    }

    // Initialize all buttons with their respective handlers
    // initButton('generate-btn', () => loadContentAndUpdateEditor(apiEndpoints.generateDefault,'', 'generate'));
    //
    // initButton('copy-btn', () => handleCopyOrUpdate('copy'));
    // initButton('update-btn', () => handleCopyOrUpdate('update'));
    // initButton('search-submit', submitTenantConfiguration);

// Event handlers for buttons
    document.getElementById('generate-btn').addEventListener('click', () => prepareActionUI('generate'));
    document.getElementById('copy-btn').addEventListener('click', () => prepareActionUI('copy'));
    document.getElementById('update-btn').addEventListener('click', () => prepareActionUI('update'));

    // Event listener for unsaved changes
    const editor = document.getElementById('editor-interface');
    if (editor) {
        editor.addEventListener('input', handleUnsavedChanges);
    }
});

// This function will handle the UI changes for Generate, Copy, and Update actions.
function prepareActionUI(action) {
    // Highlight the clicked button and reset the others
    ['generate', 'copy', 'update'].forEach(act => {
        const btn = document.getElementById(`${act}-btn`);
        if (btn) {
            if (action === act) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });

    // Make the editor and search interface visible
    const editorContainer = document.getElementById('editor-interface');
    const searchInterface = document.getElementById('search-interface');
    if (editorContainer) {
        editorContainer.classList.remove('d-none');
    }
    if (searchInterface) {
        searchInterface.classList.remove('d-none');
    }

    // Logic to move the action row to the top if required
    // For example, if you're using a grid system you could do something like this:
    const actionRow = document.getElementById('action-row');
    if (actionRow) {
        actionRow.style.order = '-1'; // Assuming your layout uses a flex or grid system where order works
    }

    // You can also toggle visibility of any other UI elements here if needed
}

// Additional functionality for each action
// ... (Load content, populate dropdowns, submit configuration, etc.)


/**
 * Loads the content into the editor from a given URL, updates the editor's data attributes,
 * and sets the action to be performed.
 * @param {string} url The URL from which to load the content.
 * @param {string} [tenantId] The tenant ID to set on the editor container. Used for 'update' action.
 * @param {string} action The action to be performed ('generate', 'copy', 'update').
 */
async function loadContentAndUpdateEditor(url, tenantId, action) {
    try {
        const content = await fetchData(url, 'text');
        if (!editorConfig.editorInstance) {
            console.error('Editor instance is not initialized.');
            return; // Abort if editor instance is not available
        }
        editorConfig.editorInstance.setValue(content);
        toggleEditorInterface(true);

        const editorContainer = document.getElementById('editor-interface');
        if (!editorContainer) {
            throw new Error('Editor container element not found.');
        }

        switch (action) {
            case 'generate':
                const actionDiv = document.getElementById('action-div');
                if (actionDiv) {
                    actionDiv.classList.remove("h-100", "justify-content-center", "align-items-center");
                }else{
                    console.log('actionDiv not found')
                }

            case 'copy':
                editorContainer.setAttribute('data-id', 'default');
                editorContainer.setAttribute('data-method', 'POST');
                break;
            case 'update':
                if (tenantId) {
                    editorContainer.setAttribute('data-id', tenantId);
                    editorContainer.setAttribute('data-method', 'PUT');
                } else {
                    throw new Error('Tenant ID is required for update action.');
                }
                break;
            default:
                throw new Error(`Unsupported action: ${action}`);
        }

    } catch (error) {
        console.error(`Error in loadContentAndUpdateEditor: ${error}`);
    }
}

/**
 * Handles the submission of the tenant's configuration.
 */
async function submitTenantConfiguration() {
    console.log('Submitting tenant configuration.');
    const tenantId = getSelectedTenantId();
    if (!tenantId) {
        console.error('No tenant selected.');
        return; // Abort if no tenant is selected
    }
    const editorContainer = document.getElementById('editor-interface');
    if (!editorContainer) {
        throw new Error('Editor container element not found.');
    }
    let action = editorContainer.getAttribute('data-method');

    // Here you need to define what action should be taken when submitting the tenant configuration.
    // Since the 'action' variable isn't defined in your current context, I'm assuming it should be 'update'.
    // You need to ensure that the 'action' variable is appropriately set in this context.
    await loadContentAndUpdateEditor(apiEndpoints.getTenant(tenantId), tenantId, action);
}


/**
 * Retrieves the selected tenant ID from the dropdown.
 * @returns {string|null} The selected tenant ID, or null if no tenant is selected.
 */
function getSelectedTenantId() {
    const dropdown = document.getElementById('dropdown');
    if (dropdown && dropdown.selectedIndex >= 0) {
        const tenantId = dropdown.options[dropdown.selectedIndex].value;
        console.log(`Selected tenantId: ${tenantId}`);
        return tenantId || null; // will return null if tenantId is an empty string
    } else {
        console.error('Dropdown not found or no option is selected.');
        return null;
    }
}


function handleCopyOrUpdate(action) {
    console.log(`Starting ${action} action.`);

    fetchData(apiEndpoints.listTenants)
        .then(items => {
            const itemListElement = document.getElementById('list-interface');
            if (!itemListElement) {
                throw new Error('List interface element not found.');
            }
            populateDropdown(items);
            adjustUIForAction(action);

            // Set the data-method attribute based on the action
            const editorContainer = document.getElementById('editor-interface');
            if (!editorContainer) {
                throw new Error('Editor container element not found.');
            }
            editorContainer.setAttribute('data-method', action === 'copy' ? 'POST' : 'PUT');

            const actionDiv = document.getElementById('action-div');
            if (actionDiv) {
                actionDiv.classList.remove("h-100", "justify-content-center", "align-items-center");
            }

        })
        .catch(error => {
            console.error(`An error occurred in handleCopyOrUpdate: ${error}`);
        });
}


function adjustUIForAction(action) {
    // Reset active states for buttons
    document.getElementById('copy-btn').classList.remove('active');
    document.getElementById('update-btn').classList.remove('active');

    if (action === 'copy') {
        // Show/hide relevant UI elements for copy
        document.getElementById('search-interface').classList.remove('d-none');
        document.getElementById('list-interface').classList.remove('d-none');

        // Set the copy button to active
        document.getElementById('copy-btn').classList.add('active');
    } else if (action === 'update') {
        // Show/hide relevant UI elements for update
        document.getElementById('search-interface').classList.remove('d-none');
        document.getElementById('list-interface').classList.remove('d-none');

        // Set the update button to active
        document.getElementById('update-btn').classList.add('active');
    }
}




function populateDropdown(items) {
    const searchInterface = document.getElementById('search-interface');
    if (!searchInterface) {
        throw new Error('Search interface element not found.');
    }
    searchInterface.classList.remove('d-none');
    const dropdown = document.getElementById('dropdown');
    if (!dropdown) {
        throw new Error('Dropdown element not found.');
    }
    // Clear existing options
    dropdown.length = 0;

    // Add a default option
    dropdown.appendChild(new Option('Please select', ''));

    // Iterate over the items object
    Object.entries(items).forEach(([key, value]) => {
        console.log(`Adding option for ${key}: ${value}`)
        // Here, 'key' is the object's key, and 'value' is the corresponding value
        dropdown.appendChild(new Option(value, key));
    });
}


function handleUnsavedChanges() {
    const saveButton = document.getElementById('save-btn');
    if (saveButton) {
        saveButton.disabled = false; // Enable the save button
        // You might want to visually indicate unsaved changes
    }
}


window.onload = async function () {
    // Configure the path for Monaco Editor
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

    // Load the Monaco Editor
    await require(['vs/editor/editor.main'], async function () {
        // Once the editor is loaded, set it up
        await setupEditor();

        // Continue with any additional setup that depends on the Monaco editor here
        // ...
    });
};