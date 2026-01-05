/**
 * Image Upload Module - Base64 Version
 * Stores images as Base64 in Firestore (no Firebase Storage needed)
 */

/**
 * Setup image preview handlers
 */
function setupImagePreview() {
    const foundItemImage = document.getElementById('foundItemImage');

    if (foundItemImage) {
        foundItemImage.addEventListener('change', (e) => {
            previewImage(e.target.files[0], 'foundItemImagePreview');
        });
    }
}

/**
 * Preview selected image
 */
function previewImage(file, previewElementId) {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'warning');
        return;
    }

    // Validate file size (max 2MB for Base64)
    if (file.size > 2 * 1024 * 1024) {
        showNotification('Image size must be less than 2MB', 'warning');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const previewContainer = document.getElementById(previewElementId);
        previewContainer.innerHTML = `
            <img src="${e.target.result}" class="img-thumbnail" style="max-width: 200px; max-height: 200px;">
            <p class="text-muted small mt-1">${file.name} (${(file.size / 1024).toFixed(1)} KB)</p>
        `;
    };
    reader.readAsDataURL(file);
}

/**
 * Convert image to Base64 with compression
 * Returns a promise with the Base64 string
 */
async function uploadImage(file, itemType, progressElementId) {
    if (!file) return null;

    return new Promise((resolve, reject) => {
        // Show progress bar
        const progressContainer = document.getElementById(progressElementId);
        const progressBar = progressContainer.querySelector('.progress-bar');
        progressContainer.classList.remove('d-none');
        progressBar.style.width = '10%';
        progressBar.textContent = '10%';

        const reader = new FileReader();

        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const progress = Math.round((e.loaded / e.total) * 50);
                progressBar.style.width = progress + '%';
                progressBar.textContent = progress + '%';
            }
        };

        reader.onload = (e) => {
            progressBar.style.width = '60%';
            progressBar.textContent = '60%';

            // Compress image using canvas
            const img = new Image();
            img.onload = () => {
                progressBar.style.width = '80%';
                progressBar.textContent = '80%';

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Calculate new dimensions (max 800px)
                let width = img.width;
                let height = img.height;
                const maxSize = 800;

                if (width > height && width > maxSize) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                } else if (height > maxSize) {
                    width = (width * maxSize) / height;
                    height = maxSize;
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to Base64 with quality compression
                const base64 = canvas.toDataURL('image/jpeg', 0.7);

                progressBar.style.width = '100%';
                progressBar.textContent = '100%';

                console.log('✅ Image converted to Base64, size:', Math.round(base64.length / 1024), 'KB');

                setTimeout(() => {
                    progressContainer.classList.add('d-none');
                    resolve(base64);
                }, 500);
            };

            img.onerror = () => {
                progressContainer.classList.add('d-none');
                reject(new Error('Failed to process image'));
            };

            img.src = e.target.result;
        };

        reader.onerror = () => {
            progressContainer.classList.add('d-none');
            reject(new Error('Failed to read file'));
        };

        reader.readAsDataURL(file);
    });
}

// Make functions globally accessible
window.setupImagePreview = setupImagePreview;
window.uploadImage = uploadImage;

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    setupImagePreview();
});

console.log('✓ Image upload module (Base64) loaded');
