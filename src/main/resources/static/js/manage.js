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
        exportTenant: `${editorConfig.apiBase}/export`,
    };

    function getElementById(id) {
        return document.getElementById(id);
    }

    function setElementAttribute(element, attribute, value) {
        element.setAttribute(attribute, value);
    }

    function removeElementAttribute(element, attribute) {
        if (element.hasAttribute(attribute)) {
            element.removeAttribute(attribute);
        }
    }

    function toggleElementById(elementId, action) {
        const element = getElementById(elementId);
        if (element) {
            if (action === 'hide') {
                element.classList.add('d-none');
            } else if (action === 'show') {
                element.classList.remove('d-none');
            }
        } else {
            console.error(`Element with ID '${elementId}' not found.`);
        }
    }

    function hideElementById(elementId) {
        toggleElementById(elementId, 'hide');
    }

    function showElementById(elementId) {
        toggleElementById(elementId, 'show');
    }


    /**
     * Initializes the Monaco Editor instance.
     */
    async function setupEditor() {
        const editorElement = getElementById('editor-tenant');
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
        console.log('updateEditorDivWithMethod started');
        const editorDiv = getElementById('editor-interface');
        // if action is post remove data attribute id
        if (action === 'POST') {
            clearEditorDivAttributes();
        }
        setElementAttribute(editorDiv, 'data-method', action);
        console.log('updateEditorDivWithMethod ended');
    }

    function clearEditorDivAttributes() {
        console.log('clearEditorDivAttributes started');
        const editorDiv = getElementById('editor-interface');

        // Remove the data-id attribute if it exists
        removeElementAttribute(editorDiv, 'data-id');

        // Remove the data-method attribute if it exists
        removeElementAttribute(editorDiv, 'data-method');

        console.log('clearEditorDivAttributes ended');
    }

    function handleEditorButtonAction(buttonId, method) {
        console.log(`${method} button clicked`);

        // Clear previous attributes
        clearEditorDivAttributes();

        // Set the active button
        setActiveButton(getElementById(buttonId));

        // Update the editor div with the new method
        updateEditorDivWithMethod(method);

        // Activate the select tenant div
        activateSelectTenantDivOnAction();

        console.log(`${method} Action ended`);
    }

    function handleGenerateClick() {
        console.log('handleGenerateClick started');

        // Clear previous attributes
        clearEditorDivAttributes();
        setActiveButton(getElementById('generate-btn'));
        deActivateSelectTenantDivOnAction();
        fetchAndPopulateEditor(apiEndpoints.generateDefault).then(r => console.log('handleGenerateClick: fetchAndPopulateEditor ended'));
        updateEditorDivWithMethod('POST');
        makeEditorVisible();
        console.log('handleGenerateClick ended');
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
        console.log('DOM loaded');
        // Set event listeners for buttons
        getElementById('copy-btn').addEventListener('click', handleCopyButtonClick);
        getElementById('update-btn').addEventListener('click', handleUpdateButtonClick);
        getElementById('generate-btn').addEventListener('click', handleGenerateClick);
        getElementById('reset-changes').addEventListener('click', handleResetChangesClick);
        getElementById('save-btn').addEventListener('click', handleSaveButtonClick);
        getElementById('export-btn').addEventListener('click', handleExportButtonClick);
        console.log('DOM loaded ended');
    });

    function updateEditorDivWithId(selectedId) {
        console.log('updateEditorDivWithId started');
        const editorDiv = getElementById('editor-interface');
        setElementAttribute(editorDiv, 'data-id', selectedId);
        console.log('updateEditorDivWithId ended');
    }

    function onSelectTenant() {
        console.log('onSelectTenant started');
        hideEditor();
        const dropdown = getElementById('dropdown');
        const selectedId = dropdown.value;
        if (selectedId) {
            let tenantUrl = apiEndpoints.getTenant(selectedId);
            console.log('Selected tenant URL:', tenantUrl);
            fetchAndPopulateEditor(tenantUrl).then(() => console.log('onSelectTenant: fetchAndPopulateEditor ended'));
            // get editor-interface data method
            let editorInterface = getElementById('editor-interface');
            let method = editorInterface.getAttribute('data-method');
            // if method is PUT than update
            if (method === 'PUT') {
                updateEditorDivWithId(selectedId);
                toggleExportButton(); // Call this function to toggle the export button visibility

            }
            makeEditorVisible();
        }
        console.log('onSelectTenant ended');
    }

    function populateTenantsDropdown() {
        console.log('populateTenantsDropdown started');
        fetch(apiEndpoints.listTenants)
            .then((response) => response.json())
            .then((data) => {
                const dropdown = getElementById('dropdown');
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
            .catch((error) => {
                console.error('Error fetching tenants:', error);
            });
        console.log('populateTenantsDropdown ended');
    }

    function clearTenantsDropdown() {
        console.log('clearTenantsDropdown started');
        const dropdown = getElementById('dropdown');
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
        console.log('setActiveButton started');
        // Remove active class from all buttons
        getElementById('copy-btn').classList.remove('active-button');
        getElementById('update-btn').classList.remove('active-button');
        getElementById('generate-btn').classList.remove('active-button');

        // Add active class to the clicked button
        button.classList.add('active-button');
        console.log('setActiveButton ended');
    }

    function hideActiveButton() {
        console.log('hideActiveButton started');
        // Remove active class from all buttons
        getElementById('copy-btn').classList.remove('active-button');
        getElementById('update-btn').classList.remove('active-button');
        getElementById('generate-btn').classList.remove('active-button');
        console.log('hideActiveButton ended');
    }

    function activateSelectTenantDivOnAction() {
        console.log('activateSelectTenantDivOnAction started');
        populateTenantsDropdown();
        hideEditor();
        showElementById('select-tenant-div');
        hideElementById('select-tenant-div-empty');
        console.log('activateSelectTenantDivOnAction ended');
    }

    function deActivateSelectTenantDivOnAction() {
        console.log('deActivateSelectTenantDivOnAction started');
        clearTenantsDropdown();
        hideElementById('select-tenant-div');
        showElementById('select-tenant-div-empty');
        console.log('deActivateSelectTenantDivOnAction ended');
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
        console.log('showEditorActionButton started');
        showElementById('save-button-container');
        showElementById('cancel-button-container');
        // showElementById('export-button-container');
        hideElementById('save-tenant-div-empty');
        hideElementById('cancel-tenant-div-empty');
        // hideElementById('export-tenant-div-empty');
        console.log('showEditorActionButton ended');
    }

    function hideEditorActionButtons() {
        console.log('hideEditorActionButtons started');
        hideElementById('save-button-container');
        hideElementById('cancel-button-container');
        // hideElementById('export-button-container');
        showElementById('save-tenant-div-empty');
        showElementById('cancel-tenant-div-empty');
        // showElementById('export-tenant-div-empty');
        console.log('hideEditorActionButtons ended');
    }

    function makeEditorVisible() {
        console.log('makeEditorVisible started');
        showElementById('editor-interface');
        showEditorActionButton();
        console.log('makeEditorVisible ended');
    }

    function hideEditor() {
        console.log('hideEditor started');
        clearEditor();
        hideElementById('editor-interface');
        hideEditorActionButtons();
        console.log('hideEditor ended');
    }

    async function fetchAndPopulateEditor(url) {
        console.log('fetchAndPopulateEditor started');

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                // Populate the editor with the fetched data
                populateEditor(data);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
        console.log('fetchAndPopulateEditor ended');
    }




    function handleSaveButtonClick() {
        console.log('Save button clicked');

        const editorDiv = getElementById('editor-interface');
        const action = editorDiv.getAttribute('data-method');
        const editorContent = editorConfig.editorInstance.getValue(); // get content from Monaco editor
        const selectedId = editorDiv.getAttribute('data-id'); // get selected ID if any
        let url = '';
        let method = '';
        let payload = {};

        // Determine the action based on the data-method attribute
        if (action === 'POST') {
            url = apiEndpoints.postTenant; // URL for POST
            method = 'POST';
            payload = JSON.stringify({ configuration: editorContent });
        } else if (action === 'PUT') {
            url = apiEndpoints.putTenant; // URL for PUT
            method = 'PUT';
            payload = JSON.stringify({ id: selectedId, configuration: editorContent });
        } else {
            // Handle other cases or show an error
            console.error('Invalid action.');
            return;
        }

        // Make the API call
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: payload
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Save successful:', data);
                showToast('Save successful'); // Replace with your toast function
            })
            .catch(error => {
                console.error('Save failed:', error);
                showToast(`Save failed: ${error.message}`); // Replace with your toast function
            });
    }

    function handleExportButtonClick() {
        console.log('Export button clicked');

        const editorDiv = getElementById('editor-interface');
        const selectedId = editorDiv.getAttribute('data-id'); // Get selected ID if any
        const editorContent = editorConfig.editorInstance.getValue(); // Get content from Monaco editor

        if (!selectedId) {
            console.error('No tenant selected for export.');
            showToast('No tenant selected for export.'); // Replace with your toast function
            return;
        }

        const payload = JSON.stringify({
            id: selectedId,
            configuration: editorContent
        });

        fetch(apiEndpoints.exportTenant, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: payload
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.blob(); // Assuming the server sends a ZIP file as a binary blob
            })
            .then(blob => {
                // Create a URL for the blob
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `configuration_${selectedId}.zip`; // Give the ZIP file a name
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl); // Clean up the URL object
                showToast('Export successful'); // Replace with your toast function
            })
            .catch(error => {
                console.error('Export failed:', error);
                showToast(`Export failed: ${error.message}`); // Replace with your toast function
            });
    }

    function toggleExportButton() {
        const editorDiv = getElementById('editor-interface');
        const selectedId = editorDiv.getAttribute('data-id');
        if (selectedId) {
            // If there is a selected ID, enable the export button and disable the placeholder
            showElementById('export-button-container');
            hideElementById('export-tenant-div-empty');
        } else {
            // If there is no selected ID, disable the export button and enable the placeholder
            hideElementById('export-button-container');
            showElementById('export-tenant-div-empty');
        }
    }


    window.onload = async function () {
        console.log('window.onload started');
        // Configure the path for Monaco Editor
        require.config({
            paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' },
        });

        // Load the Monaco Editor
        await require(['vs/editor/editor.main'], async function () {
            // Once the editor is loaded, set it up
            await setupEditor();
        });
        console.log('window.onload ended');
    };
