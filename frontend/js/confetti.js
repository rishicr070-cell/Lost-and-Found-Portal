/**
 * Confetti Animation for Success Celebrations
 * Triggers when items are successfully claimed
 */

function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#11998e', '#38ef7d', '#f093fb', '#f5576c', '#ffd700', '#ff6b6b'];
    const confettiCount = 50;

    // Create container
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    // Create confetti pieces
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';

        // Random properties
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 2 + Math.random() * 1;

        confetti.style.left = `${left}%`;
        confetti.style.backgroundColor = color;
        confetti.style.animationDelay = `${delay}s`;
        confetti.style.animationDuration = `${duration}s`;

        container.appendChild(confetti);
    }

    // Remove container after animation
    setTimeout(() => {
        container.remove();
    }, 3500);
}

/**
 * Trigger confetti with optional message
 */
function celebrateSuccess(message = '🎉 Success!') {
    createConfetti();

    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification(message, 'success');
    }

    console.log('🎊 Celebration triggered!');
}

// Make globally accessible
window.createConfetti = createConfetti;
window.celebrateSuccess = celebrateSuccess;

console.log('✓ Confetti animation module loaded');
