export class UIHandler {
    constructor(component) {
        this.component = component;
        this.initializeElements();
    }

    initializeElements() {
        this.modal = this.component.shadowRoot.querySelector('#configModal');
        this.closeButton = this.component.shadowRoot.querySelector('#closeModal');

        // Verify elements are found
        if (!this.modal || !this.closeButton) {
            console.error('Failed to initialize UI elements');
            return;
        }

        // Add event listeners
        this.closeButton.addEventListener('click', () => this.hideModal());
    }

    showModal() {
        if (this.modal) {
            this.modal.classList.add('show');
            // Clear any previous error
            this.component.validationHandler.hideError();
            // Reset form
            this.component.formHandler.reset();
            // Request current config
            this.component.dispatchEvent(new CustomEvent('request-config', {
                bubbles: true,
                composed: true
            }));
        }
    }

    hideModal() {
        if (this.modal) {
            this.modal.classList.remove('show');
            // Clear any error when closing
            this.component.validationHandler.hideError();
            // Reset validation state
            this.component.validationHandler.setValidating(false);
        }
    }

    updateTheme(theme) {
        const style = document.createElement('style');
        style.textContent = `:host { color-scheme: ${theme}; }`;
        
        const existingTheme = this.component.shadowRoot.querySelector('style[data-theme]');
        if (existingTheme) {
            existingTheme.replaceWith(style);
        } else {
            this.component.shadowRoot.appendChild(style);
        }
        style.setAttribute('data-theme', theme);
    }
}
