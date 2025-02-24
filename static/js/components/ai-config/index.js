import { getStyles } from './styles.js';
import { getTemplate } from './template.js';
import { PROVIDER_INSTRUCTIONS, PROVIDER_NAMES } from './providers.js';
import { FormHandler } from './handlers/form-handler.js';
import { UIHandler } from './handlers/ui-handler.js';
import { ValidationHandler } from './handlers/validation-handler.js';

class AIConfig extends HTMLElement {
    constructor() {
        super();

        // Store provider data
        this.providerInstructions = PROVIDER_INSTRUCTIONS;
        this.providerNames = PROVIDER_NAMES;

        // Create shadow DOM
        this.attachShadow({ mode: 'open' });
        
        // Initial render
        this.render();
        
        // Initialize handlers
        this.initializeHandlers();
    }

    initializeHandlers() {
        // Order matters here as some handlers depend on others
        this.validationHandler = new ValidationHandler(this);
        this.formHandler = new FormHandler(this);
        this.uiHandler = new UIHandler(this);
    }

    connectedCallback() {
        // Update theme
        this.updateTheme(document.documentElement.getAttribute('data-theme') || 'light');

        // Listen for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    this.updateTheme(document.documentElement.getAttribute('data-theme'));
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    disconnectedCallback() {
        // Cleanup will be handled by garbage collection
        // since we're not storing any global references
    }

    showModal() {
        this.uiHandler.showModal();
    }

    hideModal() {
        this.uiHandler.hideModal();
    }

    updateTheme(theme) {
        this.uiHandler.updateTheme(theme);
    }

    render() {
        // Get theme variables
        const style = getComputedStyle(document.documentElement);
        const theme = {
            textColor: style.getPropertyValue('--text-color').trim(),
            buttonBg: style.getPropertyValue('--button-bg').trim(),
            buttonText: style.getPropertyValue('--button-text').trim(),
            buttonSecondaryBg: style.getPropertyValue('--button-secondary-bg').trim(),
            errorColor: style.getPropertyValue('--error-color').trim()
        };

        this.shadowRoot.innerHTML = `
            <style>${getStyles(theme)}</style>
            ${getTemplate()}
        `;
    }
}

customElements.define('ai-config', AIConfig);
