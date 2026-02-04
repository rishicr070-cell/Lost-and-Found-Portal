/**
 * SIMPLIFIED NOTIFICATION-BASED CLAIM SYSTEM
 * Replace the complex claim system with this simpler notification approach
 */

/**
 * Claim an item - creates notification for original poster
 */
async function claimItem(itemId) {
    console.log('🎯 claimItem called for itemId:', itemId);

    const user = firebase.auth().currentUser;

    if (!user) {
        console.log('   ❌ User not logged in');
        showNotification('Please login to claim items.', 'warning');
        return;
    }

    console.log('   ✅ User logged in:', user.email);

    try {
        // Get the item
        console.log('   📥 Fetching item from Firestore...');
        const itemDoc = await db.collection('items').doc(itemId).get();

        if (!itemDoc.exists) {
            console.log('   ❌ Item not found in Firestore');
            showNotification('Item not found', 'danger');
            return;
        }

        const item = itemDoc.data();
        item.id = itemDoc.id;

        console.log('   ✅ Item found:', {
            id: item.id,
            name: item.name,
            type: item.type,
            contact: item.contact
        });

        // Can't claim your own item
        if (item.contact === user.email) {
            console.log('   ⚠️ User trying to claim their own item');
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

        console.log('   📝 Creating notification:', notification);

        const notifRef = await db.collection('notifications').add(notification);

        console.log('   ✅ Notification created with ID:', notifRef.id);
        console.log('   📧 Notification sent to:', item.contact);

        // Send email notification to item owner
        console.log('   🔍 Checking email service...');
        console.log('     - window.emailService exists:', !!window.emailService);
        console.log('     - emailService.initialized:', emailService?.initialized);

        try {
            if (window.emailService && emailService.initialized) {
                console.log('   📧 Sending email to item owner...');

                await emailService.sendClaimNotification(
                    {
                        contact: item.contact,
                        name: item.name,
                        type: item.type,
                        category: item.category,
                        description: item.description,
                        location: item.location,
                        date: item.date,
                        color: item.color
                    },
                    {
                        name: user.email.split('@')[0],
                        email: user.email,
                        verificationDetails: 'Claim request via notification system'
                    }
                );

                console.log('   ✅ Email sent successfully to:', item.contact);
            } else {
                console.warn('   ⚠️ Email service not initialized, trying to initialize...');
                if (window.emailService) {
                    emailService.init();
                    console.log('   ✅ Email service initialized, sending email...');

                    await emailService.sendClaimNotification(
                        {
                            contact: item.contact,
                            name: item.name,
                            type: item.type,
                            category: item.category,
                            description: item.description,
                            location: item.location,
                            date: item.date,
                            color: item.color
                        },
                        {
                            name: user.email.split('@')[0],
                            email: user.email,
                            verificationDetails: 'Claim request via notification system'
                        }
                    );
                    console.log('   ✅ Email sent after initialization');
                } else {
                    console.error('   ❌ Email service not available');
                }
            }
        } catch (emailError) {
            console.error('   ❌ Email failed (non-critical):', emailError);
            // Don't fail the claim if email fails
        }

        showNotification(`Claim request sent to ${item.contact}`, 'success');

    } catch (error) {
        console.error('   ❌ Error claiming item:', error);
        console.error('   Error details:', {
            code: error.code,
            message: error.message
        });
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
 * Real-time notification listener
 */
let notificationUnsubscribe = null;

/**
 * Load notifications for logged-in user with real-time updates
 */
function loadMyNotifications() {
    const user = firebase.auth().currentUser;

    console.log('🔔 loadMyNotifications called');
    console.log('   User:', user ? user.email : 'Not logged in');

    if (!user) {
        console.log('   ❌ No user logged in, skipping notification load');
        return;
    }

    const notificationsContainer = document.getElementById('notificationsContainer');
    if (!notificationsContainer) {
        console.log('   ❌ notificationsContainer element not found');
        return;
    }

    // Unsubscribe from previous listener if exists
    if (notificationUnsubscribe) {
        notificationUnsubscribe();
    }

    console.log('   📡 Setting up real-time listener for:', user.email);

    // Set up real-time listener
    notificationUnsubscribe = db.collection('notifications')
        .where('originalPosterEmail', '==', user.email)
        .where('status', '==', 'pending')
        .onSnapshot((snapshot) => {
            console.log('   📬 Notification snapshot received');
            console.log('   Total notifications:', snapshot.size);

            if (snapshot.empty) {
                console.log('   ℹ️ No pending notifications');
                notificationsContainer.innerHTML = '<p class="text-center text-muted">No notifications</p>';

                // Hide badge
                const badge = document.getElementById('notificationBadge');
                if (badge) {
                    badge.classList.add('d-none');
                }
                return;
            }

            let html = '';
            snapshot.forEach(doc => {
                const notif = doc.data();
                notif.id = doc.id;

                console.log('   📧 Notification:', {
                    id: notif.id,
                    itemName: notif.itemName,
                    claimerEmail: notif.claimerEmail
                });

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
                console.log('   ✅ Badge updated:', snapshot.size);
            }

        }, (error) => {
            console.error('   ❌ Error in notification listener:', error);
            console.error('   Error details:', {
                code: error.code,
                message: error.message
            });
        });
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
