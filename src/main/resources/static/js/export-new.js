// Configuration object holding endpoint functions
const editorConfig = {
    apiBase: '/api/v1',
};

const apiEndpoints = {
    listTenants: `${editorConfig.apiBase}/configurations`,
    exportTenants: `${editorConfig.apiBase}/export`,
};

// Function to adjust table headers based on screen width
function adjustTableHeaders() {
    const tableHead = document.getElementById('tenants-table').querySelector('thead tr');
    tableHead.innerHTML = ''; // Clear existing headers

    const headers = ['Select', 'Tenant Name'];
    const itemsPerRow = window.innerWidth > 768 ? 3 : window.innerWidth > 576 ? 2 : 1;

    for (let i = 0; i < itemsPerRow; i++) {
        let header = document.createElement('th');
        header.textContent = i === 0 ? headers[0] : headers[1];
        tableHead.appendChild(header);
    }
}
function populateTenantsTable(tenants) {
    const tableBody = document.getElementById('tenants-table').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    Object.entries(tenants).forEach(([id, name], index) => {
        let row = tableBody.insertRow(); // Create a new row for each tenant

        // Insert a cell for the checkbox
        const checkboxCell = row.insertCell();
        checkboxCell.innerHTML = `<input type="checkbox" name="tenantId" value="${id}">`;
        checkboxCell.className = 'tenant-checkbox';

        // Insert a cell for the tenant name
        const nameCell = row.insertCell();
        nameCell.textContent = name;
        nameCell.className = 'tenant-name';

        row.className = 'tenant-item'; // Apply a class for potential styling
    });
}


// Fetch tenants and populate table
function fetchTenants() {
    fetch(apiEndpoints.listTenants)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => populateTenantsTable(data))
        .catch(error => console.error('There has been a problem with your fetch operation:', error));
}

// Handle export form submission
function handleExportFormSubmit(event) {
    event.preventDefault();

    const selectedIds = Array.from(document.querySelectorAll('input[name="tenantId"]:checked'))
        .map(checkbox => checkbox.value);

    if (selectedIds.length === 0) {
        alert('Please select at least one tenant to export.');
        return;
    }

    const payload = JSON.stringify({ ids: selectedIds });

    fetch(apiEndpoints.exportTenants, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.blob(); // Assuming the server sends a ZIP file as a binary blob
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'exported_tenants.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        })
        .catch(error => console.error('Export failed:', error));
}

// Attach event listeners on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchTenants(); // Fetch and populate the tenants table
    document.getElementById('export-form').addEventListener('submit', handleExportFormSubmit);
});

// You might not need the following if you're not changing the layout on resize
window.addEventListener('resize', adjustTableHeaders);
