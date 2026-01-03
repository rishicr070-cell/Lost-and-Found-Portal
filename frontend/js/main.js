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
document.addEventListener('DOMContentLoaded', async function () {
    console.log('=== Lost & Found Portal Initialized ===');
    console.log('DSA Structures Created:');
    console.log('✓ Linked List for Lost Items');
    console.log('✓ Linked List for Found Items');
    console.log('✓ Stack for Action History');
    console.log('✓ Hash Table for Fast Search');

    // Set up event listeners first
    setupEventListeners();

    // Load data from Firebase
    await loadDataFromFirebase();

    // Display initial data
    displayRecentItems();
    updateStatistics();

    // Auto-load claims for logged-in user
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loadMyClaims(user.email);
        }
    });

    // Show DSA structure info in console
    displayDSAInfo();
});

/**
 * Load items from Firebase Firestore
 */
async function loadDataFromFirebase() {
    try {
        console.log('📥 Loading items from Firebase...');

        const snapshot = await db.collection('items').orderBy('createdAt', 'desc').get();

        if (snapshot.empty) {
            console.log('No items in database. Loading sample data...');
            loadSampleData();
            return;
        }

        snapshot.forEach(doc => {
            const item = { id: doc.id, ...doc.data() };

            // Add to appropriate LinkedList
            if (item.type === 'lost') {
                lostItemsList.append(item);
            } else {
                foundItemsList.append(item);
            }

            // Add to HashTable for O(1) search
            itemHashTable.insert(item.name.toLowerCase(), item);
            itemHashTable.insert(item.category.toLowerCase(), item);
        });

        // Update item counter
        itemIdCounter = snapshot.size + 1;

        console.log(`✅ Loaded ${snapshot.size} items from Firebase`);
        showNotification(`Loaded ${snapshot.size} items from database`, 'info');

    } catch (error) {
        console.error('❌ Error loading from Firebase:', error);
        console.log('Loading sample data instead...');
        loadSampleData();
    }
}

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
async function submitLostItem() {
    const item = {
        name: document.getElementById('lostItemName').value,
        category: document.getElementById('lostItemCategory').value,
        description: document.getElementById('lostItemDescription').value,
        date: document.getElementById('lostItemDate').value,
        location: document.getElementById('lostItemLocation').value,
        color: document.getElementById('lostItemColor').value || 'Not specified',
        contact: document.getElementById('lostItemContact').value,
        type: 'lost',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        // Save to Firebase
        const docRef = await db.collection('items').add(item);
        item.id = docRef.id;
        console.log('✅ Item saved to Firebase with ID:', docRef.id);

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
        console.log('  - Saved to Firebase');
        console.log('  - Added to LinkedList');
        console.log('  - Added to HashTable');
        console.log('  - Action logged to Stack');

        // Update UI
        displayRecentItems();
        updateStatistics();

        // Reset form
        document.getElementById('lostItemForm').reset();

        // Show success message
        showNotification('Lost item reported and saved to database!', 'success');

        // Scroll to recent items
        document.getElementById('recentLostItems').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('❌ Error saving to Firebase:', error);
        showNotification('Error saving item. Please try again.', 'danger');
    }
}

/**
 * Submit Found Item
 */
async function submitFoundItem() {
    const item = {
        name: document.getElementById('foundItemName').value,
        category: document.getElementById('foundItemCategory').value,
        description: document.getElementById('foundItemDescription').value,
        date: document.getElementById('foundItemDate').value,
        location: document.getElementById('foundItemLocation').value,
        color: document.getElementById('foundItemColor').value || 'Not specified',
        contact: document.getElementById('foundItemContact').value,
        type: 'found',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        // Save to Firebase
        const docRef = await db.collection('items').add(item);
        item.id = docRef.id;
        console.log('✅ Item saved to Firebase with ID:', docRef.id);

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
        console.log('  - Saved to Firebase');
        console.log('  - Added to LinkedList');
        console.log('  - Added to HashTable');
        console.log('  - Action logged to Stack');

        // Update UI
        displayRecentItems();
        updateStatistics();

        // Reset form
        document.getElementById('foundItemForm').reset();

        // Show success message
        showNotification('Found item reported and saved to database! Thank you!', 'success');

        // Scroll to recent items
        document.getElementById('recentFoundItems').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('❌ Error saving to Firebase:', error);
        showNotification('Error saving item. Please try again.', 'danger');
    }
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
function createItemCard(item, showClaimButton = false, oppositeItemId = null) {
    const badgeClass = item.type === 'lost' ? 'badge-lost' : 'badge-found';
    const iconClass = item.type === 'lost' ? 'bi-exclamation-circle' : 'bi-check-circle';

    const claimButtonHtml = showClaimButton ? `
        <button class="btn btn-sm btn-warning w-100 mt-2" onclick="promptClaimItem('${oppositeItemId}', '${item.id}', '${item.type}')">
            <i class="bi bi-hand-thumbs-up"></i> Claim This Item
        </button>
    ` : '';

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
                <button class="btn btn-sm btn-primary w-100" onclick="viewItemDetails('${item.id}')">
                    View Details
                </button>
                ${claimButtonHtml}
            </div>
        </div>
    `;
}

/**
 * Initiate claim using logged-in user's email
 */
function promptClaimItem(lostItemId, foundItemId, itemType) {
    // Get current user from Firebase Auth
    const user = firebase.auth().currentUser;

    if (!user) {
        showNotification('Please login to claim items.', 'warning');
        return;
    }

    const userEmail = user.email;

    // Determine correct order based on item type
    if (itemType === 'lost') {
        // User clicked on a lost item, so they found something
        initiateClaim(lostItemId, foundItemId, userEmail);
    } else {
        // User clicked on a found item, so they lost something
        initiateClaim(foundItemId, lostItemId, userEmail);
    }
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
 * View item details in a modal
 */
function viewItemDetails(itemId) {
    console.log(`Viewing details for item ID: ${itemId}`);

    // Search for item in both lists
    let item = lostItemsList.search(itemId);
    if (!item) {
        item = foundItemsList.search(itemId);
    }

    if (!item) {
        showNotification('Item not found', 'danger');
        return;
    }

    // Log action to Stack
    actionStack.push({
        type: 'VIEW_ITEM',
        itemId: itemId,
        timestamp: Date.now()
    });

    // Create or get modal
    let modal = document.getElementById('itemDetailsModal');
    if (!modal) {
        // Create modal if it doesn't exist
        const modalHtml = `
            <div class="modal fade" id="itemDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="itemDetailsModalLabel">Item Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="itemDetailsModalBody">
                            <!-- Content will be inserted here -->
                        </div>
                        <div class="modal-footer" id="itemDetailsModalFooter">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modal = document.getElementById('itemDetailsModal');
    }

    // Populate modal with item details
    const badgeClass = item.type === 'lost' ? 'bg-danger' : 'bg-success';
    const iconClass = item.type === 'lost' ? 'bi-exclamation-circle' : 'bi-check-circle';

    const modalBody = document.getElementById('itemDetailsModalBody');
    modalBody.innerHTML = `
        <div class="text-center mb-3">
            <span class="badge ${badgeClass} p-2">
                <i class="bi ${iconClass}"></i> ${item.type.toUpperCase()} ITEM
            </span>
        </div>
        <div class="mb-3">
            <h4 class="text-center">${item.name}</h4>
            <p class="text-center text-muted"><span class="badge bg-secondary">${item.category}</span></p>
        </div>
        <hr>
        <div class="row">
            <div class="col-6 mb-3">
                <strong><i class="bi bi-calendar"></i> Date:</strong><br>
                <span class="text-muted">${item.date}</span>
            </div>
            <div class="col-6 mb-3">
                <strong><i class="bi bi-geo-alt"></i> Location:</strong><br>
                <span class="text-muted">${item.location}</span>
            </div>
            <div class="col-6 mb-3">
                <strong><i class="bi bi-palette"></i> Color:</strong><br>
                <span class="text-muted">${item.color}</span>
            </div>
            <div class="col-6 mb-3">
                <strong><i class="bi bi-envelope"></i> Contact:</strong><br>
                <span class="text-muted">${item.contact}</span>
            </div>
        </div>
        <div class="mb-3">
            <strong><i class="bi bi-card-text"></i> Description:</strong><br>
            <p class="text-muted">${item.description}</p>
        </div>
    `;

    // Add claim button in footer
    const modalFooter = document.getElementById('itemDetailsModalFooter');
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-warning" onclick="promptClaimFromDetails('${item.id}', '${item.type}')">
            <i class="bi bi-hand-thumbs-up"></i> Claim This Item
        </button>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
    `;

    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

/**
 * Initiate claim from details modal using logged-in user's email
 */
function promptClaimFromDetails(itemId, itemType) {
    // Get current user from Firebase Auth
    const user = firebase.auth().currentUser;

    if (!user) {
        showNotification('Please login to claim items.', 'warning');
        return;
    }

    const userEmail = user.email;

    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('itemDetailsModal'));
    if (modal) modal.hide();

    // For now, we need to find a matching item of opposite type
    // This is a simplified version - in a real app, user would select which item to match
    showNotification('Please search for a matching item and use the Claim button on the search results.', 'info');
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

// ========================================
// CLAIM VERIFICATION SYSTEM
// ========================================

/**
 * Initiate a claim for matching lost and found items
 * @param {string} lostItemId - ID of the lost item
 * @param {string} foundItemId - ID of the found item
 * @param {string} userEmail - Email of the person initiating the claim
 */
async function initiateClaim(lostItemId, foundItemId, userEmail) {
    try {
        // Get item details
        const lostItem = lostItemsList.search(lostItemId);
        const foundItem = foundItemsList.search(foundItemId);

        if (!lostItem || !foundItem) {
            showNotification('Item not found. Please try again.', 'danger');
            return;
        }

        // Create claim object
        const claim = {
            lostItemId: lostItemId,
            foundItemId: foundItemId,
            lostItemReporter: lostItem.contact,
            foundItemReporter: foundItem.contact,
            initiatedBy: userEmail === lostItem.contact ? 'lost' : 'found',
            status: 'pending',
            lostItemApproval: userEmail === lostItem.contact ? true : null,
            foundItemApproval: userEmail === foundItem.contact ? true : null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            lostItemName: lostItem.name,
            foundItemName: foundItem.name
        };

        // Save to Firebase
        const docRef = await db.collection('claims').add(claim);
        claim.id = docRef.id;

        console.log('✅ Claim initiated:', claim);

        // Log action to Stack
        actionStack.push({
            type: ActionTypes.CLAIM_INITIATED,
            claimId: claim.id,
            lostItemId: lostItemId,
            foundItemId: foundItemId,
            initiatedBy: userEmail,
            timestamp: Date.now()
        });

        showNotification('Claim request sent! Waiting for the other party to approve.', 'success');

        // Reload claims
        loadMyClaims(userEmail);

    } catch (error) {
        console.error('❌ Error initiating claim:', error);
        showNotification('Error creating claim. Please try again.', 'danger');
    }
}

/**
 * Approve a claim
 * @param {string} claimId - ID of the claim to approve
 * @param {string} userEmail - Email of the user approving
 */
async function approveClaim(claimId, userEmail) {
    try {
        const claimRef = db.collection('claims').doc(claimId);
        const claimDoc = await claimRef.get();

        if (!claimDoc.exists) {
            showNotification('Claim not found.', 'danger');
            return;
        }

        const claim = claimDoc.data();

        // Determine which approval to update
        const updates = {
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (userEmail === claim.lostItemReporter) {
            updates.lostItemApproval = true;
        } else if (userEmail === claim.foundItemReporter) {
            updates.foundItemApproval = true;
        } else {
            showNotification('You are not authorized to approve this claim.', 'danger');
            return;
        }

        // Check if both parties have approved
        const bothApproved = (updates.lostItemApproval || claim.lostItemApproval) &&
            (updates.foundItemApproval || claim.foundItemApproval);

        if (bothApproved) {
            updates.status = 'approved';

            // Delete both items from active listings
            await db.collection('items').doc(claim.lostItemId).delete();
            await db.collection('items').doc(claim.foundItemId).delete();

            // Remove from DSA structures
            lostItemsList.delete(claim.lostItemId);
            foundItemsList.delete(claim.foundItemId);
            itemHashTable.delete(claim.lostItemId);
            itemHashTable.delete(claim.foundItemId);

            // Log to Stack
            actionStack.push({
                type: ActionTypes.ITEM_CLAIMED,
                claimId: claimId,
                lostItemId: claim.lostItemId,
                foundItemId: claim.foundItemId,
                timestamp: Date.now()
            });

            showNotification('🎉 Claim approved! Both items have been removed from listings.', 'success');

            // Update UI
            displayRecentItems();
            updateStatistics();
        } else {
            showNotification('Claim approved! Waiting for the other party to approve.', 'success');
        }

        // Update claim in Firebase
        await claimRef.update(updates);

        // Log action to Stack
        actionStack.push({
            type: ActionTypes.CLAIM_APPROVED,
            claimId: claimId,
            approvedBy: userEmail,
            timestamp: Date.now()
        });

        // Reload claims
        loadMyClaims(userEmail);

    } catch (error) {
        console.error('❌ Error approving claim:', error);
        showNotification('Error approving claim. Please try again.', 'danger');
    }
}

/**
 * Reject a claim
 * @param {string} claimId - ID of the claim to reject
 * @param {string} userEmail - Email of the user rejecting
 */
async function rejectClaim(claimId, userEmail) {
    try {
        const claimRef = db.collection('claims').doc(claimId);
        const claimDoc = await claimRef.get();

        if (!claimDoc.exists) {
            showNotification('Claim not found.', 'danger');
            return;
        }

        const claim = claimDoc.data();

        // Verify user is authorized
        if (userEmail !== claim.lostItemReporter && userEmail !== claim.foundItemReporter) {
            showNotification('You are not authorized to reject this claim.', 'danger');
            return;
        }

        // Update claim status
        await claimRef.update({
            status: 'rejected',
            rejectedBy: userEmail,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Log action to Stack
        actionStack.push({
            type: ActionTypes.CLAIM_REJECTED,
            claimId: claimId,
            rejectedBy: userEmail,
            timestamp: Date.now()
        });

        showNotification('Claim rejected.', 'info');

        // Reload claims
        loadMyClaims(userEmail);

    } catch (error) {
        console.error('❌ Error rejecting claim:', error);
        showNotification('Error rejecting claim. Please try again.', 'danger');
    }
}

/**
 * Load claims for a specific user
 * @param {string} userEmail - Email of the user
 */
async function loadMyClaims(userEmail) {
    try {
        const claimsContainer = document.getElementById('myClaimsContainer');
        if (!claimsContainer) return;

        // Query claims where user is involved
        const snapshot = await db.collection('claims')
            .where('status', '==', 'pending')
            .get();

        const userClaims = [];
        snapshot.forEach(doc => {
            const claim = { id: doc.id, ...doc.data() };
            if (claim.lostItemReporter === userEmail || claim.foundItemReporter === userEmail) {
                userClaims.push(claim);
            }
        });

        if (userClaims.length === 0) {
            claimsContainer.innerHTML = '<p class="text-center text-muted">No pending claims</p>';
            return;
        }

        // Display claims
        claimsContainer.innerHTML = '';
        userClaims.forEach(claim => {
            const isLostReporter = claim.lostItemReporter === userEmail;
            const needsApproval = isLostReporter ? !claim.lostItemApproval : !claim.foundItemApproval;
            const otherPartyApproved = isLostReporter ? claim.foundItemApproval : claim.lostItemApproval;

            const claimCard = `
                <div class="card mb-3">
                    <div class="card-body">
                        <h6>Claim Match</h6>
                        <p><strong>Lost Item:</strong> ${claim.lostItemName}</p>
                        <p><strong>Found Item:</strong> ${claim.foundItemName}</p>
                        <p><small class="text-muted">
                            ${otherPartyApproved ? '✅ Other party has approved' : '⏳ Waiting for other party'}
                        </small></p>
                        ${needsApproval ? `
                            <div class="btn-group w-100">
                                <button class="btn btn-success" onclick="approveClaim('${claim.id}', '${userEmail}')">
                                    <i class="bi bi-check-circle"></i> Approve
                                </button>
                                <button class="btn btn-danger" onclick="rejectClaim('${claim.id}', '${userEmail}')">
                                    <i class="bi bi-x-circle"></i> Reject
                                </button>
                            </div>
                        ` : '<p class="text-success mb-0">✅ You have approved this claim</p>'}
                    </div>
                </div>
            `;
            claimsContainer.insertAdjacentHTML('beforeend', claimCard);
        });

    } catch (error) {
        console.error('❌ Error loading claims:', error);
    }
}


// Make functions globally accessible
window.viewItemDetails = viewItemDetails;
window.performSearch = performSearch;
window.initiateClaim = initiateClaim;
window.approveClaim = approveClaim;
window.rejectClaim = rejectClaim;
window.loadMyClaims = loadMyClaims;
window.promptClaimItem = promptClaimItem;
window.promptClaimFromDetails = promptClaimFromDetails;

// Log that everything is ready
console.log('✓ All event listeners set up');
console.log('✓ Application ready to use!');
console.log('\nTry searching for: "iphone", "electronics", "keys", etc.');
