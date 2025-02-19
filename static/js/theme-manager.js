export class ThemeManager {
    constructor() {
        console.log('Initializing theme manager...');
        this.darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Set initial theme
        const preferredTheme = this.getPreferredTheme();
        this.setTheme(preferredTheme);

        // Listen for system theme changes
        this.darkModeMediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });

        // Ensure theme is set
        if (!document.documentElement.hasAttribute('data-theme')) {
            this.setTheme(preferredTheme);
        }

        // Set up theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    getPreferredTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        return this.darkModeMediaQuery.matches ? 'dark' : 'light';
    }

    setTheme(theme) {
        console.log('Setting theme:', theme);
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        console.log('Toggling theme');
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
}

// Create and export singleton instance
export const themeManager = new ThemeManager();
