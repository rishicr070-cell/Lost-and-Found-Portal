/**
 * Modal Close Fix
 * Ensures the item details modal can be closed properly
 */

// Fix modal close when viewItemDetails is called
(function () {
    // Store original viewItemDetails if exists
    const originalViewItemDetails = window.viewItemDetails;

    // Override to add close button fix
    window.viewItemDetails = async function (itemId) {
        // Call original function first
        if (originalViewItemDetails) {
            await originalViewItemDetails(itemId);
        }

        // Wait for modal to be shown
        setTimeout(function () {
            const modal = document.getElementById('itemDetailsModal');
            if (!modal) return;

            // Get or create Bootstrap modal instance
            let bsModal = bootstrap.Modal.getInstance(modal);
            if (!bsModal) {
                bsModal = new bootstrap.Modal(modal);
            }

            // Fix close button (X)
            const closeBtn = modal.querySelector('.btn-close');
            if (closeBtn) {
                closeBtn.onclick = function (e) {
                    e.preventDefault();
                    bsModal.hide();
                };
            }

            // Fix Close button in footer
            const footerCloseBtn = modal.querySelector('.modal-footer .btn-secondary');
            if (footerCloseBtn) {
                footerCloseBtn.onclick = function (e) {
                    e.preventDefault();
                    bsModal.hide();
                };
            }

            // Fix clicking outside modal
            modal.onclick = function (e) {
                if (e.target === modal) {
                    bsModal.hide();
                }
            };
        }, 100);
    };
})();

console.log('✓ Modal close fix loaded');
