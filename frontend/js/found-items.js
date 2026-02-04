/**
 * Found Items Page JavaScript
 * Displays all found items with filtering and search functionality
 */

// Initialize DSA structures
let foundItemsList = new LinkedList();
let itemHashTable = new HashTable(50);
let allFoundItems = [];
let currentFilter = 'all';

// Authentication check
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log('User logged in:', user.email);

        // Update user display
        const userDisplayName = document.getElementById('userDisplayName');
        if (userDisplayName) {
            const emailName = user.email.split('@')[0];
            userDisplayName.textContent = emailName;
        }

        // Load all found items
        loadAllFoundItems();
    } else {
        console.log('No user logged in, redirecting to login');
        window.location.href = 'login.html';
    }
});

// Logout handler
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
        console.log('✅ User logged out');
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('❌ Logout error:', error);
        alert('Failed to logout. Please try again.');
    });
});

/**
 * Load all found items from Firebase
 */
async function loadAllFoundItems() {
    const container = document.getElementById('allFoundItemsContainer');

    try {
        console.log('Loading all found items from Firebase...');

        // Query all found items
        const snapshot = await db.collection('items')
            .where('type', '==', 'found')
            .orderBy('createdAt', 'desc')
            .get();

        allFoundItems = [];
        foundItemsList = new LinkedList();
        itemHashTable = new HashTable(50);

        snapshot.forEach((doc) => {
            const item = {
                id: doc.id,
                ...doc.data()
            };

            allFoundItems.push(item);
            foundItemsList.append(item);

            // Add to hash table for searching
            itemHashTable.insert(item.name.toLowerCase(), item);
            itemHashTable.insert(item.category.toLowerCase(), item);
            if (item.description) {
                const words = item.description.toLowerCase().split(' ');
                words.forEach(word => {
                    if (word.length > 3) {
                        itemHashTable.insert(word, item);
                    }
                });
            }
        });

        console.log(`✅ Loaded ${allFoundItems.length} found items`);

        // Update statistics
        updateStatistics();

        // Display items
        displayFoundItems(allFoundItems);

    } catch (error) {
        console.error('❌ Error loading found items:', error);
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> Error loading found items. Please refresh the page.
                </div>
            </div>
        `;
    }
}

/**
 * Display found items
 */
function displayFoundItems(items) {
    const container = document.getElementById('allFoundItemsContainer');

    if (items.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state py-5">
                    <i class="bi bi-inbox" style="font-size: 4rem; color: #ccc;"></i>
                    <h4 class="mt-3">No found items available</h4>
                    <p class="text-muted">Check back later or try adjusting your filters</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    items.forEach(item => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-4 mb-4 fade-in';
        colDiv.innerHTML = createItemCard(item);
        container.appendChild(colDiv);
    });
}

/**
 * Create HTML for an item card
 */
function createItemCard(item) {
    const badgeClass = 'badge-found';
    const iconClass = 'bi-check-circle';

    // Message button (only show if not own item)
    const currentUser = firebase.auth().currentUser;
    const messageButtonHtml = currentUser && item.contact !== currentUser.email ? `
        <button class="btn btn-sm btn-outline-primary w-100 mt-2" 
                onclick="startItemConversation('${item.id}', '${item.name}', '${item.contact}')">
            <i class="bi bi-chat-dots"></i> Message Owner
        </button>
    ` : '';

    // Display image or icon placeholder
    const imageHtml = item.imageUrl ? `
        <img src="${item.imageUrl}" class="card-img-top" alt="${item.name}" 
             style="height: 200px; object-fit: cover;">
    ` : `
        <div class="item-image-placeholder">
            <i class="bi ${getIconForCategory(item.category)}"></i>
        </div>
    `;

    // Location display
    const locationHtml = item.coordinates ? `
        <i class="bi bi-geo-alt"></i> ${item.location} 
        <a href="#" onclick="showItemOnMap('${item.id}'); return false;" class="text-primary">
            <i class="bi bi-map"></i>
        </a>
    ` : `
        <i class="bi bi-geo-alt"></i> ${item.location}
    `;

    // Format date
    const dateStr = item.date || 'Unknown';

    return `
        <div class="card item-card h-100">
            ${imageHtml}
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="item-badge ${badgeClass}">
                        <i class="bi ${iconClass}"></i> FOUND
                    </span>
                    <span class="badge bg-secondary">${item.category}</span>
                </div>
                <h5 class="card-title">${item.name}</h5>
                <p class="card-text text-muted">${item.description || 'No description provided'}</p>
                <div class="mb-2">
                    <small class="text-muted">
                        <i class="bi bi-calendar"></i> ${dateStr}<br>
                        ${locationHtml}<br>
                        <i class="bi bi-palette"></i> ${item.color || 'Not specified'}
                    </small>
                </div>
                <button class="btn btn-sm btn-primary w-100" onclick="viewItemDetails('${item.id}')">
                    View Details
                </button>
                ${messageButtonHtml}
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
 * Update statistics
 */
function updateStatistics() {
    document.getElementById('totalFoundItems').textContent = allFoundItems.length;

    // Calculate items added this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentItems = allFoundItems.filter(item => {
        if (item.createdAt && item.createdAt.toDate) {
            return item.createdAt.toDate() > oneWeekAgo;
        }
        return false;
    });

    document.getElementById('recentFoundItems').textContent = recentItems.length;

    // For now, set claimed to 0 (can be updated with actual data)
    document.getElementById('totalClaimed').textContent = '0';
}

/**
 * View item details
 */
function viewItemDetails(itemId) {
    console.log(`Viewing details for item ID: ${itemId}`);

    // Search for item
    let item = foundItemsList.search(itemId);

    if (!item) {
        showNotification('Item not found', 'danger');
        return;
    }

    // Create or get modal
    let modal = document.getElementById('itemDetailsModal');
    if (!modal) {
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
    const badgeClass = 'bg-success';
    const iconClass = 'bi-check-circle';

    // Image display
    const imageHtml = item.imageUrl ? `
        <div class="text-center mb-3">
            <img src="${item.imageUrl}" class="img-fluid rounded" alt="${item.name}" 
                 style="max-height: 300px; object-fit: contain;">
        </div>
    ` : '';

    const modalBody = document.getElementById('itemDetailsModalBody');
    modalBody.innerHTML = `
        ${imageHtml}
        <div class="text-center mb-3">
            <span class="badge ${badgeClass} p-2">
                <i class="bi ${iconClass}"></i> FOUND ITEM
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
                <span class="text-muted">${item.date || 'Unknown'}</span>
            </div>
            <div class="col-6 mb-3">
                <strong><i class="bi bi-geo-alt"></i> Location:</strong><br>
                <span class="text-muted">${item.location}</span>
            </div>
            <div class="col-6 mb-3">
                <strong><i class="bi bi-palette"></i> Color:</strong><br>
                <span class="text-muted">${item.color || 'Not specified'}</span>
            </div>
            <div class="col-6 mb-3">
                <strong><i class="bi bi-envelope"></i> Contact:</strong><br>
                <span class="text-muted">${item.contact}</span>
            </div>
        </div>
        <div class="mb-3">
            <strong><i class="bi bi-card-text"></i> Description:</strong><br>
            <p class="text-muted">${item.description || 'No description provided'}</p>
        </div>
    `;

    // Add message button in footer if not own item
    const currentUser = firebase.auth().currentUser;
    const modalFooter = document.getElementById('itemDetailsModalFooter');

    if (currentUser && item.contact !== currentUser.email) {
        modalFooter.innerHTML = `
            <button type="button" class="btn btn-primary" onclick="startItemConversation('${item.id}', '${item.name}', '${item.contact}')">
                <i class="bi bi-chat-dots"></i> Message Owner
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        `;
    } else {
        modalFooter.innerHTML = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        `;
    }

    // Show the modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '11';
        document.body.appendChild(toastContainer);
    }

    const colors = {
        'success': { bg: 'bg-success', icon: 'bi-check-circle-fill' },
        'warning': { bg: 'bg-warning', icon: 'bi-exclamation-triangle-fill' },
        'danger': { bg: 'bg-danger', icon: 'bi-x-circle-fill' },
        'info': { bg: 'bg-info', icon: 'bi-info-circle-fill' }
    };
    const color = colors[type] || colors['info'];

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
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', function () {
        this.remove();
    });
}

/**
 * Search functionality
 */
document.getElementById('searchBtn')?.addEventListener('click', performSearch);
document.getElementById('searchInput')?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!searchTerm) {
        // Reset to show all items with current filter
        filterItems(currentFilter);
        return;
    }

    console.log(`Searching for: "${searchTerm}"...`);

    // Search using hash table
    let results = itemHashTable.searchPartial(searchTerm);

    // Filter to only found items
    results = results.filter(item => item.type === 'found');

    // Apply category filter if active
    if (currentFilter !== 'all') {
        results = results.filter(item => item.category === currentFilter);
    }

    console.log(`Found ${results.length} results`);
    displayFoundItems(results);
}

/**
 * Category filtering
 */
document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', function () {
        // Update active button
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.remove('active');
        });
        this.classList.add('active');

        // Get filter value
        const filter = this.getAttribute('data-filter');
        currentFilter = filter;

        // Filter items
        filterItems(filter);
    });
});

function filterItems(category) {
    if (category === 'all') {
        displayFoundItems(allFoundItems);
    } else {
        const filtered = allFoundItems.filter(item => item.category === category);
        displayFoundItems(filtered);
    }
}

/**
 * Messaging integration
 */
async function startItemConversation(itemId, itemName, ownerEmail) {
    if (window.messagingManager) {
        const conversationId = await messagingManager.startConversation(itemId, itemName, ownerEmail);
        if (conversationId) {
            showNotification('Opening conversation...', 'success');
            // Redirect to home page with messages modal
            window.location.href = `index.html#messages`;
        }
    } else {
        showNotification('Messaging feature not available', 'warning');
    }
}

// Make functions globally accessible
window.viewItemDetails = viewItemDetails;
window.startItemConversation = startItemConversation;
window.getIconForCategory = getIconForCategory;

console.log('✅ Found Items page loaded successfully');
