/**
 * SIMPLIFIED NOTIFICATION-BASED CLAIM SYSTEM
 * Replace the complex claim system with this simpler notification approach
 */

/**
 * Claim an item - creates notification for original poster
 */
async function claimItem(itemId) {
    const user = firebase.auth().currentUser;

    if (!user) {
        showNotification('Please login to claim items.', 'warning');
        return;
    }

    try {
        // Get the item
        const itemDoc = await db.collection('items').doc(itemId).get();
        if (!itemDoc.exists) {
            showNotification('Item not found', 'danger');
            return;
        }

        const item = itemDoc.data();
        item.id = itemDoc.id;

        // Can't claim your own item
        if (item.contact === user.email) {
            showNotification('You cannot claim your own item', 'warning');
            return;
        }

        // Create notification for original poster
        const notification = {
            type: 'claim_request',
            itemId: item.id,
            itemName: item.name,
            itemType: item.type,
            claimerEmail: user.email,
            originalPosterEmail: item.contact,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('notifications').add(notification);

        showNotification(`Claim request sent to ${item.contact}`, 'success');

    } catch (error) {
        console.error('❌ Error claiming item:', error);
        showNotification('Failed to claim item', 'danger');
    }
}

/**
 * Mark item as retrieved and delete it
 */
async function markAsRetrieved(itemId, notificationId) {
    try {
        // Delete item from Firebase
        await db.collection('items').doc(itemId).delete();

        // Update notification status
        if (notificationId) {
            await db.collection('notifications').doc(notificationId).update({
                status: 'completed',
                completedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        // Remove from DSA structures
        lostItemsList.delete(itemId);
        foundItemsList.delete(itemId);

        // Log action
        actionStack.push({
            type: 'ITEM_RETRIEVED',
            itemId: itemId,
            timestamp: Date.now()
        });

        // Update display
        displayRecentItems();
        updateStatistics();
        loadMyNotifications();

        showNotification('Item marked as retrieved and removed', 'success');

    } catch (error) {
        console.error('❌ Error marking as retrieved:', error);
        showNotification('Failed to mark item as retrieved', 'danger');
    }
}

/**
 * Load notifications for logged-in user
 */
async function loadMyNotifications() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
        const snapshot = await db.collection('notifications')
            .where('originalPosterEmail', '==', user.email)
            .where('status', '==', 'pending')
            .get();

        const notificationsContainer = document.getElementById('notificationsContainer');
        if (!notificationsContainer) return;

        if (snapshot.empty) {
            notificationsContainer.innerHTML = '<p class="text-center text-muted">No notifications</p>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const notif = doc.data();
            notif.id = doc.id;

            html += `
                <div class="card mb-3">
                    <div class="card-body">
                        <h6 class="card-title">
                            <i class="bi bi-bell-fill text-warning"></i> 
                            Someone claimed your ${notif.itemType} item
                        </h6>
                        <p class="mb-2"><strong>${notif.itemName}</strong></p>
                        <p class="text-muted small mb-3">
                            ${notif.claimerEmail} claims this is their item
                        </p>
                        <button class="btn btn-success btn-sm" 
                                onclick="markAsRetrieved('${notif.itemId}', '${notif.id}')">
                            <i class="bi bi-check-circle"></i> Mark as Retrieved
                        </button>
                        <button class="btn btn-secondary btn-sm" 
                                onclick="dismissNotification('${notif.id}')">
                            Dismiss
                        </button>
                    </div>
                </div>
            `;
        });

        notificationsContainer.innerHTML = html;

        // Update notification badge
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = snapshot.size;
            badge.classList.remove('d-none');
        }

    } catch (error) {
        console.error('❌ Error loading notifications:', error);
    }
}

/**
 * Dismiss a notification
 */
async function dismissNotification(notificationId) {
    try {
        await db.collection('notifications').doc(notificationId).update({
            status: 'dismissed',
            dismissedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        loadMyNotifications();
        showNotification('Notification dismissed', 'info');

    } catch (error) {
        console.error('❌ Error dismissing notification:', error);
    }
}

// Make functions globally accessible
window.claimItem = claimItem;
window.markAsRetrieved = markAsRetrieved;
window.loadMyNotifications = loadMyNotifications;
window.dismissNotification = dismissNotification;

console.log('✓ Notification-based claim system loaded');
