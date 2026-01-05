/**
 * CORRECTED SUBMIT FUNCTIONS WITH IMAGE UPLOAD
 * Copy these functions to replace the existing ones in main.js
 */

/**
 * Submit Lost Item with Image Upload
 */
async function submitLostItem() {
    const submitBtn = document.getElementById('submitLostItemBtn');

    try {
        // Disable button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Uploading...';

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

        // Upload image if selected
        const imageFile = document.getElementById('lostItemImage').files[0];
        if (imageFile) {
            item.imageUrl = await uploadImage(imageFile, 'lost', 'lostItemUploadProgress');
        }

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

        // Update display
        displayRecentItems();
        updateStatistics();

        // Show success message
        showNotification(`Lost item "${item.name}" reported successfully!`, 'success');

        // Reset form
        document.getElementById('lostItemForm').reset();
        document.getElementById('lostItemImagePreview').innerHTML = '';

    } catch (error) {
        console.error('❌ Error submitting lost item:', error);
        showNotification('Failed to submit item. Please try again.', 'danger');
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Report Lost Item';
    }
}

/**
 * Submit Found Item with Image Upload
 */
async function submitFoundItem() {
    const submitBtn = document.getElementById('submitFoundItemBtn');

    try {
        // Disable button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Uploading...';

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

        // Upload image if selected
        const imageFile = document.getElementById('foundItemImage').files[0];
        if (imageFile) {
            item.imageUrl = await uploadImage(imageFile, 'found', 'foundItemUploadProgress');
        }

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

        // Update display
        displayRecentItems();
        updateStatistics();

        // Show success message
        showNotification(`Found item "${item.name}" reported successfully!`, 'success');

        // Reset form
        document.getElementById('foundItemForm').reset();
        document.getElementById('foundItemImagePreview').innerHTML = '';

    } catch (error) {
        console.error('❌ Error submitting found item:', error);
        showNotification('Failed to submit item. Please try again.', 'danger');
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Report Found Item';
    }
}
