/**
 * Main JavaScript for Lost & Found Portal
 * Demonstrates integration of DSA structures: LinkedList, Stack, HashTable
 */

// Initialize DSA structures
let lostItemsList = new LinkedList();
let foundItemsList = new LinkedList();
let actionStack = new Stack(50);
let itemHashTable = new HashTable(50);

// Item counter for unique IDs
let itemIdCounter = 1;

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('=== Lost & Found Portal Initialized ===');
    console.log('DSA Structures Created:');
    console.log('✓ Linked List for Lost Items');
    console.log('✓ Linked List for Found Items');
    console.log('✓ Stack for Action History');
    console.log('✓ Hash Table for Fast Search');

    // Load sample data
    loadSampleData();

    // Set up event listeners
    setupEventListeners();

    // Display initial data
    displayRecentItems();
    updateStatistics();

    // Show DSA structure info in console
    displayDSAInfo();
});

/**
 * Load sample data for testing
 */
function loadSampleData() {
    const sampleLostItems = [
        {
            id: itemIdCounter++,
            name: 'iPhone 13',
            category: 'Electronics',
            description: 'Black iPhone 13 with blue protective case',
            date: '2025-01-15',
            location: 'Library 2nd Floor',
            color: 'Black',
            contact: 'john@campus.edu',
            type: 'lost'
        },
        {
            id: itemIdCounter++,
            name: 'Student ID Card',
            category: 'Documents',
            description: 'ID card with photo, name: Sarah Johnson',
            date: '2025-01-18',
            location: 'Cafeteria',
            color: 'White',
            contact: 'sarah@campus.edu',
            type: 'lost'
        },
        {
            id: itemIdCounter++,
            name: 'Blue Backpack',
            category: 'Accessories',
            description: 'Blue Jansport backpack containing laptop',
            date: '2025-01-20',
            location: 'Gymnasium',
            color: 'Blue',
            contact: 'mike@campus.edu',
            type: 'lost'
        }
    ];

    const sampleFoundItems = [
        {
            id: itemIdCounter++,
            name: 'Black Smartphone',
            category: 'Electronics',
            description: 'Found near the library entrance',
            date: '2025-01-16',
            location: 'Library Entrance',
            color: 'Black',
            contact: 'finder1@campus.edu',
            type: 'found'
        },
        {
            id: itemIdCounter++,
            name: 'Set of Keys',
            category: 'Keys',
            description: 'Keys with Toyota keychain',
            date: '2025-01-19',
            location: 'Parking Lot B',
            color: 'Silver',
            contact: 'finder2@campus.edu',
            type: 'found'
        }
    ];

    // Add lost items to data structures
    sampleLostItems.forEach(item => {
        // Add to LinkedList
        lostItemsList.append(item);

        // Add to HashTable for O(1) search
        itemHashTable.insert(item.name.toLowerCase(), item);
        itemHashTable.insert(item.category.toLowerCase(), item);

        // Log action to Stack
        actionStack.push({
            type: 'ADD_LOST_ITEM',
            itemId: item.id,
            itemName: item.name,
            timestamp: Date.now()
        });
    });

    // Add found items to data structures
    sampleFoundItems.forEach(item => {
        // Add to LinkedList
        foundItemsList.append(item);

        // Add to HashTable
        itemHashTable.insert(item.name.toLowerCase(), item);
        itemHashTable.insert(item.category.toLowerCase(), item);

        // Log action to Stack
        actionStack.push({
            type: 'ADD_FOUND_ITEM',
            itemId: item.id,
            itemName: item.name,
            timestamp: Date.now()
        });
    });

    console.log('✓ Sample data loaded successfully');
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Lost Item Form
    const lostItemForm = document.getElementById('lostItemForm');
    if (lostItemForm) {
        lostItemForm.addEventListener('submit', function (e) {
            e.preventDefault();
            submitLostItem();
        });
    }

    // Found Item Form
    const foundItemForm = document.getElementById('foundItemForm');
    if (foundItemForm) {
        foundItemForm.addEventListener('submit', function (e) {
            e.preventDefault();
            submitFoundItem();
        });
    }
}

/**
 * Submit Lost Item
 */
function submitLostItem() {
    const item = {
        id: itemIdCounter++,
        name: document.getElementById('lostItemName').value,
        category: document.getElementById('lostItemCategory').value,
        description: document.getElementById('lostItemDescription').value,
        date: document.getElementById('lostItemDate').value,
        location: document.getElementById('lostItemLocation').value,
        color: document.getElementById('lostItemColor').value || 'Not specified',
        contact: document.getElementById('lostItemContact').value,
        type: 'lost'
    };

    // Add to LinkedList
    lostItemsList.append(item);

    // Add to HashTable for O(1) search
    itemHashTable.insert(item.name.toLowerCase(), item);
    itemHashTable.insert(item.category.toLowerCase(), item);

    // Log action to Stack
    actionStack.push({
        type: 'ADD_LOST_ITEM',
        itemId: item.id,
        itemName: item.name,
        timestamp: Date.now()
    });

    console.log('✓ Lost item added:', item.name);
    console.log('  - Added to LinkedList');
    console.log('  - Added to HashTable');
    console.log('  - Action logged to Stack');

    // Update UI
    displayRecentItems();
    updateStatistics();

    // Reset form
    document.getElementById('lostItemForm').reset();

    // Show success message
    showNotification('Lost item reported successfully!', 'success');

    // Scroll to recent items
    document.getElementById('recentLostItems').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Submit Found Item
 */
function submitFoundItem() {
    const item = {
        id: itemIdCounter++,
        name: document.getElementById('foundItemName').value,
        category: document.getElementById('foundItemCategory').value,
        description: document.getElementById('foundItemDescription').value,
        date: document.getElementById('foundItemDate').value,
        location: document.getElementById('foundItemLocation').value,
        color: document.getElementById('foundItemColor').value || 'Not specified',
        contact: document.getElementById('foundItemContact').value,
        type: 'found'
    };

    // Add to LinkedList
    foundItemsList.append(item);

    // Add to HashTable for O(1) search
    itemHashTable.insert(item.name.toLowerCase(), item);
    itemHashTable.insert(item.category.toLowerCase(), item);

    // Log action to Stack
    actionStack.push({
        type: 'ADD_FOUND_ITEM',
        itemId: item.id,
        itemName: item.name,
        timestamp: Date.now()
    });

    console.log('✓ Found item added:', item.name);
    console.log('  - Added to LinkedList');
    console.log('  - Added to HashTable');
    console.log('  - Action logged to Stack');

    // Update UI
    displayRecentItems();
    updateStatistics();

    // Reset form
    document.getElementById('foundItemForm').reset();

    // Show success message
    showNotification('Found item reported successfully! Thank you for your help!', 'success');

    // Scroll to recent items
    document.getElementById('recentFoundItems').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Perform search using Hash Table (O(1) complexity)
 */
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!searchTerm) {
        showNotification('Please enter a search term', 'warning');
        return;
    }

    console.log(`Searching for: "${searchTerm}" using Hash Table...`);

    // Use Hash Table for O(1) search
    const results = itemHashTable.searchPartial(searchTerm);

    // Log search action to Stack
    actionStack.push({
        type: 'SEARCH',
        searchTerm: searchTerm,
        resultsFound: results.length,
        timestamp: Date.now()
    });

    displaySearchResults(results, searchTerm);

    console.log(`Found ${results.length} results in O(1) time!`);
}

/**
 * Display search results
 */
function displaySearchResults(results, searchTerm) {
    const searchResults = document.getElementById('searchResults');

    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="bi bi-search"></i>
                    <h4>No results found for "${searchTerm}"</h4>
                    <p>Try different keywords or browse recent items below</p>
                </div>
            </div>
        `;
        return;
    }

    searchResults.innerHTML = `
        <div class="col-12 mb-3">
            <h5>Found ${results.length} result(s) for "${searchTerm}"</h5>
        </div>
    `;

    results.forEach(item => {
        const itemCard = createItemCard(item);
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-4 mb-3 fade-in';
        colDiv.innerHTML = itemCard;
        searchResults.appendChild(colDiv);
    });
}

/**
 * Display recent items from LinkedLists
 */
function displayRecentItems() {
    const recentLostDiv = document.getElementById('recentLostItems');
    const recentFoundDiv = document.getElementById('recentFoundItems');

    // Get items from LinkedLists
    const lostItems = lostItemsList.toArray().slice(-6).reverse();
    const foundItems = foundItemsList.toArray().slice(-6).reverse();

    // Display lost items
    if (lostItems.length === 0) {
        recentLostDiv.innerHTML = '<div class="col-12"><p class="text-center text-muted">No lost items reported yet</p></div>';
    } else {
        recentLostDiv.innerHTML = '';
        lostItems.forEach(item => {
            const colDiv = document.createElement('div');
            colDiv.className = 'col-md-4 mb-3 fade-in';
            colDiv.innerHTML = createItemCard(item);
            recentLostDiv.appendChild(colDiv);
        });
    }

    // Display found items
    if (foundItems.length === 0) {
        recentFoundDiv.innerHTML = '<div class="col-12"><p class="text-center text-muted">No found items reported yet</p></div>';
    } else {
        recentFoundDiv.innerHTML = '';
        foundItems.forEach(item => {
            const colDiv = document.createElement('div');
            colDiv.className = 'col-md-4 mb-3 fade-in';
            colDiv.innerHTML = createItemCard(item);
            recentFoundDiv.appendChild(colDiv);
        });
    }
}

/**
 * Create HTML for an item card
 */
function createItemCard(item) {
    const badgeClass = item.type === 'lost' ? 'badge-lost' : 'badge-found';
    const iconClass = item.type === 'lost' ? 'bi-exclamation-circle' : 'bi-check-circle';

    return `
        <div class="card item-card h-100">
            <div class="item-image-placeholder">
                <i class="bi ${getIconForCategory(item.category)}"></i>
            </div>
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="item-badge ${badgeClass}">
                        <i class="bi ${iconClass}"></i> ${item.type.toUpperCase()}
                    </span>
                    <span class="badge bg-secondary">${item.category}</span>
                </div>
                <h5 class="card-title">${item.name}</h5>
                <p class="card-text text-muted">${item.description}</p>
                <div class="mb-2">
                    <small class="text-muted">
                        <i class="bi bi-calendar"></i> ${item.date}<br>
                        <i class="bi bi-geo-alt"></i> ${item.location}<br>
                        <i class="bi bi-palette"></i> ${item.color}
                    </small>
                </div>
                <button class="btn btn-sm btn-primary w-100" onclick="viewItemDetails(${item.id})">
                    View Details
                </button>
            </div>
        </div>
    `;
}

/**
 * Get icon for category
 */
function getIconForCategory(category) {
    const icons = {
        'Electronics': 'bi-phone',
        'Documents': 'bi-file-text',
        'Accessories': 'bi-bag',
        'Keys': 'bi-key',
        'Clothing': 'bi-person',
        'Books': 'bi-book',
        'Sports Equipment': 'bi-trophy',
        'Personal Items': 'bi-briefcase'
    };
    return icons[category] || 'bi-question-circle';
}

/**
 * Update statistics on the page
 */
function updateStatistics() {
    document.getElementById('totalLostItems').textContent = lostItemsList.getSize();
    document.getElementById('totalFoundItems').textContent = foundItemsList.getSize();
    document.getElementById('totalMatches').textContent = '0'; // Will be implemented later
    document.getElementById('happyUsers').textContent = lostItemsList.getSize() + foundItemsList.getSize();
}

/**
 * View item details (placeholder)
 */
function viewItemDetails(itemId) {
    console.log(`Viewing details for item ID: ${itemId}`);
    showNotification('Item details feature coming soon!', 'info');

    // Log action to Stack
    actionStack.push({
        type: 'VIEW_ITEM',
        itemId: itemId,
        timestamp: Date.now()
    });
}

/**
 * Show notification using Bootstrap toast
 */
function showNotification(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '11';
        document.body.appendChild(toastContainer);
    }

    // Set colors based on type
    const colors = {
        'success': { bg: 'bg-success', icon: 'bi-check-circle-fill' },
        'warning': { bg: 'bg-warning', icon: 'bi-exclamation-triangle-fill' },
        'danger': { bg: 'bg-danger', icon: 'bi-x-circle-fill' },
        'info': { bg: 'bg-info', icon: 'bi-info-circle-fill' }
    };
    const color = colors[type] || colors['info'];

    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white ${color.bg} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${color.icon} me-2"></i> ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    // Show the toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
    toast.show();

    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function () {
        this.remove();
    });
}

/**
 * Display DSA structure information in console
 */
function displayDSAInfo() {
    console.log('\n=== DSA STRUCTURES INFO ===');

    console.log('\n1. LINKED LISTS:');
    console.log(`   Lost Items List Size: ${lostItemsList.getSize()}`);
    console.log(`   Found Items List Size: ${foundItemsList.getSize()}`);
    console.log('   Time Complexity:');
    console.log('   - Append: O(1)');
    console.log('   - Search: O(n)');
    console.log('   - Display: O(n)');

    console.log('\n2. STACK (Action History):');
    console.log(`   Stack Size: ${actionStack.size()}`);
    console.log('   Recent Actions:');
    actionStack.getLastN(5).forEach(action => {
        console.log(`   - ${action.type} at ${new Date(action.timestamp).toLocaleTimeString()}`);
    });
    console.log('   Time Complexity:');
    console.log('   - Push: O(1)');
    console.log('   - Pop: O(1)');
    console.log('   - Peek: O(1)');

    console.log('\n3. HASH TABLE:');
    const stats = itemHashTable.getStats();
    console.log(`   Table Size: ${stats.size}`);
    console.log(`   Items Stored: ${stats.count}`);
    console.log(`   Load Factor: ${stats.loadFactor.toFixed(2)}`);
    console.log(`   Max Chain Length: ${stats.maxChainLength}`);
    console.log(`   Efficiency: ${stats.efficiency}`);
    console.log('   Time Complexity:');
    console.log('   - Insert: O(1) average');
    console.log('   - Search: O(1) average');
    console.log('   - Delete: O(1) average');

    console.log('\n=== END DSA INFO ===\n');
}

// Make functions globally accessible
window.viewItemDetails = viewItemDetails;
window.performSearch = performSearch;

// Log that everything is ready
console.log('✓ All event listeners set up');
console.log('✓ Application ready to use!');
console.log('\nTry searching for: "iphone", "electronics", "keys", etc.');
