/**
 * Theme Manager - Dark Mode Support
 * Handles theme switching and persistence
 */

class ThemeManager {
    constructor() {
        this.theme = this.getStoredTheme() || this.getSystemTheme();
        this.init();
    }

    init() {
        // Apply theme on load
        this.applyTheme(this.theme);

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });

        console.log('✅ Theme Manager initialized:', this.theme);
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    getStoredTheme() {
        return localStorage.getItem('theme');
    }

    applyTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Update toggle button if it exists
        this.updateToggleButton();

        // Toggle Three.js background
        if (window.threejsBackground) {
            threejsBackground.toggleForTheme(theme);
        }
    }

    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);

        // Add a subtle animation
        document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 500);

        console.log('🌓 Theme switched to:', newTheme);
    }

    updateToggleButton() {
        const slider = document.querySelector('.theme-toggle-slider');
        if (slider) {
            slider.innerHTML = this.theme === 'dark' ? '🌙' : '☀️';
        }
    }

    createToggleButton() {
        const toggle = document.createElement('div');
        toggle.className = 'theme-toggle';
        toggle.innerHTML = `<div class="theme-toggle-slider">${this.theme === 'dark' ? '🌙' : '☀️'}</div>`;
        toggle.addEventListener('click', () => this.toggleTheme());
        return toggle;
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Make it globally accessible
window.themeManager = themeManager;

console.log('✓ Theme Manager module loaded');
