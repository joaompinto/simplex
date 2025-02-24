import { configManager } from '../../../config-manager.js';

export class FormHandler {
    constructor(component) {
        this.component = component;
        this.initializeElements();
    }

    initializeElements() {
        // Get form elements
        this.configForm = this.component.shadowRoot.querySelector('#configForm');
        this.providerSelect = this.component.shadowRoot.querySelector('#provider');
        this.apiKeyInput = this.component.shadowRoot.querySelector('#apiKey');
        this.apiKeySection = this.component.shadowRoot.querySelector('#apiKeySection');
        this.apiKeyInstructions = this.component.shadowRoot.querySelector('#apiKeyInstructions');
        this.submitButton = this.configForm?.querySelector('button[type="submit"]');

        // Verify all elements are found
        if (!this.configForm || !this.providerSelect || !this.apiKeyInput || 
            !this.apiKeySection || !this.apiKeyInstructions || !this.submitButton) {
            console.error('Failed to initialize form elements');
            return;
        }

        // Add event listeners
        this.configForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.providerSelect.addEventListener('change', () => this.updateApiKeyInstructions());

        // Listen for config loaded event
        document.addEventListener('config-loaded', (e) => this.handleConfigLoaded(e.detail));
    }

    handleConfigLoaded(config) {
        if (config && config.provider) {
            this.providerSelect.value = config.provider;
            this.apiKeyInput.value = config.api_key || '';
            this.apiKeySection.style.display = 'block';
            this.updateApiKeyInstructions();
        }
    }

    updateApiKeyInstructions() {
        const provider = this.providerSelect.value;
        if (provider) {
            this.apiKeySection.style.display = 'block';
            this.apiKeyInstructions.innerHTML = this.component.providerInstructions[provider] || 
                'Enter your API key for this provider.';
        } else {
            this.apiKeySection.style.display = 'none';
            this.apiKeyInstructions.innerHTML = 'Select a provider to see instructions for getting an API key.';
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        console.log('Handling form submission');

        const provider = this.providerSelect.value;
        const apiKey = this.apiKeyInput.value;

        if (!provider || !apiKey) {
            this.component.validationHandler.showError('Please fill in all fields');
            return;
        }

        this.component.validationHandler.hideError();
        this.component.validationHandler.setValidating(true);

        // Dispatch validate-config event
        this.component.dispatchEvent(new CustomEvent('validate-config', {
            detail: { provider, api_key: apiKey },
            bubbles: true,
            composed: true
        }));
    }

    reset() {
        this.configForm?.reset();
        this.updateApiKeyInstructions();
    }
}
