/**
 * My Items Management Module
 * Allows users to view and delete their uploaded items
 */

/**
 * Load items uploaded by the current user
 */
async function loadMyItems() {
    const user = firebase.auth().currentUser;

    if (!user) {
        console.log('No user logged in');
        return;
    }

    const userEmail = user.email;
    console.log(`Loading items for user: ${userEmail}`);

    try {
        // Query items where contact email matches user email
        // Note: Removed .orderBy() to avoid needing a composite index
        const snapshot = await db.collection('items')
            .where('contact', '==', userEmail)
            .get();

        const allItems = [];
        const lostItems = [];
        const foundItems = [];

        snapshot.forEach(doc => {
            const item = { id: doc.id, ...doc.data() };
            allItems.push(item);

            if (item.type === 'lost') {
                lostItems.push(item);
            } else {
                foundItems.push(item);
            }
        });

        // Sort items by createdAt in JavaScript (newest first)
        const sortByDate = (a, b) => {
            const dateA = a.createdAt ? a.createdAt.seconds : 0;
            const dateB = b.createdAt ? b.createdAt.seconds : 0;
            return dateB - dateA; // Descending order (newest first)
        };

        allItems.sort(sortByDate);
        lostItems.sort(sortByDate);
        foundItems.sort(sortByDate);

        console.log(`Found ${allItems.length} items for user`);

        // Display items in respective containers
        displayMyItems(allItems, 'allMyItemsContainer');
        displayMyItems(lostItems, 'myLostItemsContainer');
        displayMyItems(foundItems, 'myFoundItemsContainer');

        // Update tab badges
        updateTabBadges(allItems.length, lostItems.length, foundItems.length);

    } catch (error) {
        console.error('Error loading user items:', error);
        showNotification('Error loading your items. Please try again.', 'danger');
    }
}

/**
 * Display items in a container
 */
function displayMyItems(items, containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }

    if (items.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <h4>No items found</h4>
                    <p>You haven't uploaded any items yet</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    items.forEach(item => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-4 mb-3 fade-in';
        colDiv.innerHTML = createMyItemCard(item);
        container.appendChild(colDiv);
    });
}

/**
 * Create HTML card for user's item with delete button
 */
function createMyItemCard(item) {
    const badgeClass = item.type === 'lost' ? 'badge-lost' : 'badge-found';
    const iconClass = item.type === 'lost' ? 'bi-exclamation-circle' : 'bi-check-circle';

    // Display image or icon placeholder
    const imageHtml = item.imageUrl ? `
        <img src="${item.imageUrl}" class="card-img-top" alt="${item.name}" 
             style="height: 200px; object-fit: cover;">
    ` : `
        <div class="item-image-placeholder">
            <i class="bi ${getIconForCategory(item.category)}"></i>
        </div>
    `;

    // Format date
    const uploadDate = item.createdAt ?
        new Date(item.createdAt.seconds * 1000).toLocaleDateString() :
        item.date;

    return `
        <div class="card item-card h-100">
            ${imageHtml}
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
                        <i class="bi bi-palette"></i> ${item.color}<br>
                        <i class="bi bi-clock"></i> Uploaded: ${uploadDate}
                    </small>
                </div>
                <div class="d-grid gap-2">
                    <button class="btn btn-sm btn-primary" onclick="viewItemDetails('${item.id}')">
                        <i class="bi bi-eye"></i> View Details
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteItem('${item.id}', '${item.name}')">
                        <i class="bi bi-trash"></i> Delete Item
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Update tab badges with item counts
 */
function updateTabBadges(allCount, lostCount, foundCount) {
    const allTab = document.getElementById('all-items-tab');
    const lostTab = document.getElementById('lost-items-tab');
    const foundTab = document.getElementById('found-items-tab');

    if (allTab) {
        allTab.innerHTML = `<i class="bi bi-list-ul"></i> All Items <span class="badge bg-primary ms-2">${allCount}</span>`;
    }
    if (lostTab) {
        lostTab.innerHTML = `<i class="bi bi-exclamation-circle"></i> Lost Items <span class="badge bg-danger ms-2">${lostCount}</span>`;
    }
    if (foundTab) {
        foundTab.innerHTML = `<i class="bi bi-check-circle"></i> Found Items <span class="badge bg-success ms-2">${foundCount}</span>`;
    }
}

/**
 * Confirm before deleting an item
 */
function confirmDeleteItem(itemId, itemName) {
    // Create confirmation modal
    const modalHtml = `
        <div class="modal fade" id="deleteConfirmModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-exclamation-triangle"></i> Confirm Delete
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p class="mb-3">Are you sure you want to delete this item?</p>
                        <div class="alert alert-warning">
                            <strong><i class="bi bi-info-circle"></i> Item:</strong> ${itemName}
                        </div>
                        <p class="text-muted small">
                            <i class="bi bi-exclamation-circle"></i> This action cannot be undone. 
                            The item will be permanently removed from the database.
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x"></i> Cancel
                        </button>
                        <button type="button" class="btn btn-danger" onclick="deleteItem('${itemId}')">
                            <i class="bi bi-trash"></i> Delete Permanently
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('deleteConfirmModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
}

/**
 * Delete an item from Firebase and local data structures
 */
async function deleteItem(itemId) {
    console.log(`Deleting item: ${itemId}`);

    try {
        // Show loading state
        showNotification('Deleting item...', 'info');

        // Delete from Firebase
        await db.collection('items').doc(itemId).delete();
        console.log('✅ Item deleted from Firebase');

        // Remove from LinkedLists
        const deletedFromLost = lostItemsList.delete(itemId);
        const deletedFromFound = foundItemsList.delete(itemId);

        if (deletedFromLost || deletedFromFound) {
            console.log('✅ Item removed from LinkedList');
        }

        // Remove from HashTable (we need to search for it first)
        const allValues = itemHashTable.getAllValues();
        const itemToDelete = allValues.find(item => item.id === itemId);

        if (itemToDelete) {
            itemHashTable.delete(itemToDelete.name.toLowerCase());
            itemHashTable.delete(itemToDelete.category.toLowerCase());
            console.log('✅ Item removed from HashTable');
        }

        // Log action to Stack
        actionStack.push({
            type: 'DELETE_ITEM',
            itemId: itemId,
            timestamp: Date.now()
        });

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        if (modal) {
            modal.hide();
        }

        // Reload user items
        await loadMyItems();

        // Update statistics
        updateStatistics();

        // Update recent items display
        displayRecentItems();

        // Show success message
        showNotification('Item deleted successfully!', 'success');

    } catch (error) {
        console.error('❌ Error deleting item:', error);
        showNotification('Error deleting item. Please try again.', 'danger');
    }
}

/**
 * Initialize My Items section when user logs in
 */
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Load user's items when they navigate to the section
        const myItemsSection = document.getElementById('myitems');
        if (myItemsSection) {
            // Use Intersection Observer to load items when section is visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadMyItems();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(myItemsSection);
        }
    }
});

// Make functions globally accessible
window.loadMyItems = loadMyItems;
window.confirmDeleteItem = confirmDeleteItem;
window.deleteItem = deleteItem;

console.log('✓ My Items module loaded');
