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
    const language = editorElement.getAttribute('data-language');
    console.log('language: ' + language);

    editorConfig.editorInstance = monaco.editor.create(editorElement, {
        value: '',
        language: language.toLowerCase(),
        theme: 'vs-dark',
        automaticLayout: true,
    });

    // The following line is removed as the dropdown functionality is deprecated based on the new requirements
    // await populateTenantDropdown();
}


/**
 * Loads the content for a specific tenant into the editor and updates the UI accordingly.
 */
async function loadTenantContent(tenantId) {
    try {
        const content = await fetchData(apiEndpoints.getTenant(tenantId), 'text');
        editorConfig.editorInstance.setValue(content);
        showEditorInterface(); // Show the editor with the loaded content
        hideListAndButtons(); // Hide the list and other buttons
    } catch (error) {
        console.error(`Error fetching content for tenant ID ${tenantId}: ${error}`);
    }
}

/**
 * Fetches data from the provided URL.
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
        showEditorInterface();
    } catch (error) {
        console.error(`Error fetching default tenant: ${error}`);
    }
}

/**
 * Handles the submission of the tenant's configuration.
 */
async function submitTenantConfiguration() {
    const editorContainer = document.getElementById('editor-tenant');
    const tenantId = editorContainer.getAttribute('data-tenant-id');
    const content = editorConfig.editorInstance.getValue();

    try {
        let response;
        if (tenantId && tenantId !== 'default') {
            response = await fetch(`${apiEndpoints.postTenant}/${tenantId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: content }),
            });
        } else {
            response = await fetch(apiEndpoints.postTenant, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: content }),
            });
        }

        if (response.ok) {
            console.log('Content submitted successfully');
        } else {
            throw new Error('Content submission failed');
        }
    } catch (error) {
        console.error(`Error submitting tenant configuration: ${error}`);
    }
}

/**
 * Displays the editor interface.
 */
function showEditorInterface() {
    document.getElementById('list-interface').classList.add('d-none');
    document.getElementById('search-interface').classList.add('d-none');
    document.getElementById('editor-interface').classList.remove('d-none');
}

/**
 * Hides the editor interface (add this function if you have a cancel button).
 */
function hideEditorInterface() {
    document.getElementById('editor-interface').classList.add('d-none');
    document.getElementById('action-buttons').classList.remove('d-none');
}

async function handleCopyOrUpdate(action) {
    console.log(`handleCopyOrUpdate: ${action} action initiated`);

    try {
        console.log('Fetching data from listTenants endpoint...');
        const items = await fetchData(apiEndpoints.listTenants); // Fetches the tenant list
        console.log(`Received ${Object.keys(items).length} items from fetchData`);

        const itemListElement = document.getElementById('list-interface');

        if (!itemListElement) {
            console.error('List interface element not found.');
            return;
        }

        if (Object.keys(items).length > 10) {
            console.log('More than 10 items found, displaying search bar...');
            // Shows the search bar and bind input event for filtering
            displaySearchBar(items);
        } else {
            console.log('10 or fewer items found, displaying clickable list...');
            // Shows the list of items as clickable elements
            displayClickableList(Object.entries(items));
        }

        // Check if the action is 'copy' or 'update'
        if (action === 'copy' || action === 'update') {
            // Show the search and list interfaces
            const searchInterface = document.getElementById('search-interface');
            const listInterface = document.getElementById('list-interface');
            const emptySearchLeft = document.getElementById('empty-search-left');
            const emptySearchRight = document.getElementById('empty-search-right');
            searchInterface.classList.remove('d-none');
            listInterface.classList.remove('d-none');
            emptySearchLeft.classList.add('d-none');
            emptySearchRight.classList.add('d-none');

            // Move the action buttons to the left
            const actionButtons = document.getElementById('action-buttons');
            actionButtons.classList.remove('mx-auto');
            actionButtons.classList.remove('col-md-2');
            actionButtons.classList.add('col-md-1');

            // Adjust the column widths if necessary
            actionButtons.classList.replace('col-md-2', 'col-md-3'); // Adjust as needed
            searchInterface.classList.replace('col-md-10', 'col-md-9'); // Adjust as needed
        }
    } catch (error) {
        console.error('An error occurred in handleCopyOrUpdate:', error);
    }
}


function displaySearchBar(items) {
    console.log('Displaying the search bar...');

    const searchInterface = document.getElementById('search-interface');
    if (!searchInterface) {
        console.error('Search interface element not found.');
        return; // Exit the function if the search interface is not found
    }

    searchInterface.classList.remove('d-none');

    // Event listener for the search bar input to filter the list
    const searchBar = document.getElementById('search-bar');
    if (!searchBar) {
        console.error('Search bar element not found.');
        return; // Exit the function if the search bar is not found
    }

    searchBar.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        console.log(`Filtering items with search term: "${searchTerm}"`);

        try {
            const filteredItems = Object.entries(items).filter(([key, value]) =>
                value.toLowerCase().includes(searchTerm)
            );

            console.log(`Found ${filteredItems.length} items matching the search term.`);
            displayClickableList(filteredItems);
        } catch (error) {
            console.error('Error filtering items:', error);
        }
    });

    console.log('Search bar is now active.');
}

function displayClickableList(items) {
    const dropdown = document.getElementById('dropdown');

    if (!dropdown) {
        console.error('Dropdown element not found.');
        return;
    }

    console.log('Clearing existing options in the dropdown.');
    // Clear existing options
    dropdown.innerHTML = '';

    console.log('Adding a default "choose" option to the dropdown.');
    // Add a default 'choose' option
    dropdown.appendChild(new Option('Choose an item...', ''));

    console.log(`Populating dropdown with ${items.length} items.`);
    // Populate dropdown with items
    items.forEach(([id, name]) => {
        console.log(`Adding item to dropdown: ${name} (ID: ${id})`);
        dropdown.appendChild(new Option(name, id));
    });

    console.log('Making dropdown visible.');
    dropdown.classList.remove('d-none');
}



function hideListAndButtons() {
    document.getElementById('list-interface').classList.add('d-none');
    document.getElementById('search-interface').classList.add('d-none');
    document.getElementById('action-buttons').classList.add('d-none');
}


/**
 * Event listener setup
 */
document.addEventListener('DOMContentLoaded', (event) => {
    // Helper function to initialize buttons
    function initButton(buttonId, handler, eventName = 'click') {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener(eventName, handler);
            console.log(`${buttonId} initialized for ${eventName} event.`);
        } else {
            console.error(`${buttonId} not found.`);
        }
    }

    // Initialize all buttons with their respective handlers
    initButton('generate-btn', loadDefaultTenant);
    initButton('submit-btn', submitTenantConfiguration);
    initButton('copy-btn', () => handleCopyOrUpdate('copy'));
    initButton('update-btn', () => handleCopyOrUpdate('update'));

    // Any other initialization code can go here
});

// Include other event listeners as needed


// Initialization
window.onload = async function () {
    // Configure the path for Monaco Editor
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

    // Load the Monaco Editor
    await require(['vs/editor/editor.main'], function () {
        // Once the editor is loaded, set it up
        setupEditor();

        // Hides the editor and the submit button, and repositions the dropdown menu.
        // (Implement the logic for hiding and repositioning here)
    });

    // TODO: Add prompt for unsaved changes when attempting to navigate away
};
