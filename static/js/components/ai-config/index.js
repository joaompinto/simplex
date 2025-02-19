import { getStyles } from './styles.js';
import { getTemplate } from './template.js';
import { PROVIDER_INSTRUCTIONS, PROVIDER_NAMES } from './providers.js';

class AIConfig extends HTMLElement {
    constructor() {
        super();

        // Listen for validation events
        this.addEventListener('validation-success', (e) => {
            console.log('Validation success event received');
            this.onValidationSuccess(e.detail);
        });

        this.addEventListener('validation-error', (e) => {
            console.log('Validation error event received');
            this.onValidationError(e.detail);
        });
    }

    connectedCallback() {
        // Create shadow DOM
        this.attachShadow({ mode: 'open' });
        
        // Initial render
        this.render();
        
        // Initialize elements after render
        this.initializeElements();
        
        // Add event listeners
        this.addEventListeners();
        
        // Update theme
        this.updateTheme(document.documentElement.getAttribute('data-theme') || 'light');

        // Load initial config
        this.loadConfig();
    }

    initializeElements() {
        console.log('Initializing elements');
        this.configModal = this.shadowRoot.querySelector('#configModal');
        this.configForm = this.shadowRoot.querySelector('#configForm');
        this.closeModalButton = this.shadowRoot.querySelector('#closeModal');
        this.providerSelect = this.shadowRoot.querySelector('#provider');
        this.apiKeySection = this.shadowRoot.querySelector('#apiKeySection');
        this.apiKeyInput = this.shadowRoot.querySelector('#apiKey');
        this.apiKeyInstructions = this.shadowRoot.querySelector('#apiKeyInstructions');
        this.validatingMessage = this.shadowRoot.querySelector('#validatingMessage');
        this.submitButton = this.shadowRoot.querySelector('button[type="submit"]');
        this.errorContainer = this.shadowRoot.querySelector('#errorContainer');
        
        // Elements outside shadow DOM
        this.aiProvider = document.getElementById('aiProvider');
    }

    addEventListeners() {
        // Modal controls
        if (this.closeModalButton) {
            this.closeModalButton.addEventListener('click', () => {
                console.log('Close button clicked');
                this.hideModal();
            });
        }

        // Form submission
        if (this.configForm) {
            this.configForm.addEventListener('submit', (e) => {
                console.log('Form submitted');
                this.handleSubmit(e);
            });
        }
        
        // Provider selection
        if (this.providerSelect) {
            this.providerSelect.addEventListener('change', () => {
                console.log('Provider changed');
                const provider = this.providerSelect.value;
                if (provider) {
                    this.apiKeySection.style.display = 'block';
                    this.updateApiKeyInstructions();
                } else {
                    this.apiKeySection.style.display = 'none';
                    this.apiKeyInput.value = '';
                }
            });
        }

        // Global click handler for modal backdrop
        if (this.configModal) {
            this.configModal.addEventListener('click', (e) => {
                if (e.target === this.configModal) {
                    console.log('Modal backdrop clicked');
                    this.hideModal();
                }
            });
        }

        // Listen for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    this.updateTheme();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    showModal() {
        if (this.configModal) {
            this.configModal.classList.add('show');
        }
    }

    hideModal() {
        if (this.configModal) {
            this.configModal.classList.remove('show');
            // Reset form
            this.configForm.reset();
            this.apiKeySection.style.display = 'none';
        }
    }

    async loadConfig() {
        try {
            const response = await fetch('/api/config');
            const config = await response.json();
            
            if (config && config.provider) {
                if (this.providerSelect) {
                    this.providerSelect.value = config.provider;
                }
                if (this.apiKeyInput) {
                    this.apiKeyInput.value = config.api_key || '';
                }
                this.apiKeySection.style.display = 'block';
                this.updateHeaderSubtitle(config.provider);
            }
        } catch (error) {
            console.error('Error loading config:', error);
        }
    }

    updateHeaderSubtitle(provider) {
        if (this.aiProvider) {
            const providerName = PROVIDER_NAMES[provider] || provider;
            this.aiProvider.textContent = providerName;
        }
    }

    updateApiKeyInstructions() {
        const provider = this.providerSelect.value;
        this.apiKeyInstructions.innerHTML = PROVIDER_INSTRUCTIONS[provider] || 
            'Select a provider to see instructions for getting an API key.';
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(this.configForm);
        const config = {
            provider: formData.get('provider'),
            api_key: formData.get('api_key')
        };

        console.log('Submitting config:', { ...config, api_key: '[REDACTED]' });
        this.setValidating(true);

        // Clear any existing error
        this.hideError();

        // Dispatch validation event
        document.dispatchEvent(new CustomEvent('validate-config', {
            detail: config,
            bubbles: true,
            composed: true
        }));
    }

    showValidatingState() {
        console.log('Showing validating state');
        const provider = this.providerSelect.value;
        const providerName = PROVIDER_NAMES[provider] || provider;
        
        if (this.validatingMessage) {
            const messageSpan = this.validatingMessage.querySelector('span');
            if (messageSpan) {
                messageSpan.textContent = `Waiting for response from ${providerName}...`;
            }
            this.validatingMessage.classList.add('show');
            console.log('Added show class to validating message');
        }
        if (this.submitButton) {
            this.submitButton.classList.add('validating');
            this.submitButton.disabled = true;
        }
    }

    hideValidatingState() {
        console.log('Hiding validating state');
        if (this.validatingMessage) {
            this.validatingMessage.classList.remove('show');
        }
        if (this.submitButton) {
            this.submitButton.classList.remove('validating');
            this.submitButton.disabled = false;
        }
    }

    setValidating(isValidating) {
        console.log('Setting validating state:', isValidating);
        if (isValidating) {
            this.showValidatingState();
        } else {
            this.hideValidatingState();
        }
    }

    setValidationResult(result) {
        console.log('Setting validation result:', result);
        if (result.success) {
            // Dispatch success event
            this.dispatchEvent(new CustomEvent('validation-success', {
                detail: result,
                bubbles: true,
                composed: true
            }));
        } else {
            // Show error
            if (this.errorContainer) {
                this.errorContainer.textContent = result.error || 'Unknown error';
                this.errorContainer.classList.add('show');
            }
            // Dispatch error event
            this.dispatchEvent(new CustomEvent('validation-error', {
                detail: result,
                bubbles: true,
                composed: true
            }));
        }
    }

    updateProviderInfo(providerInfo) {
        console.log('Updating provider info:', providerInfo);
        // Dispatch event for provider info update
        this.dispatchEvent(new CustomEvent('provider-info-update', {
            detail: providerInfo,
            bubbles: true,
            composed: true
        }));
    }

    onValidationSuccess(result) {
        console.log('Validation success:', result);
        // Hide error if any
        if (this.errorContainer) {
            this.errorContainer.classList.remove('show');
        }
        // Update provider info if available
        if (result.provider_info) {
            this.updateProviderInfo(result.provider_info);
        }
        this.setValidating(false);
        // Hide the modal and dispatch event
        this.hideModal();
        this.dispatchEvent(new CustomEvent('config-updated', {
            detail: result,
            bubbles: true,
            composed: true
        }));
    }

    onValidationError(result) {
        console.log('Validation error:', result);
        this.showError(result.error);
        this.setValidating(false);
        // Dispatch config error event
        this.dispatchEvent(new CustomEvent('config-error', {
            detail: result,
            bubbles: true,
            composed: true
        }));
    }

    showError(message) {
        if (this.errorContainer) {
            this.errorContainer.innerHTML = `
                <div class="error-message">
                    <span class="error-icon">⚠️</span>
                    <span class="error-text">${message}</span>
                </div>
            `;
            this.errorContainer.classList.add('show');
        }
    }

    hideError() {
        if (this.errorContainer) {
            this.errorContainer.classList.remove('show');
            this.errorContainer.innerHTML = '';
        }
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

    updateTheme(theme) {
        const style = document.createElement('style');
        style.textContent = `:host { color-scheme: ${theme}; }`;
        
        const existingTheme = this.shadowRoot.querySelector('style[data-theme]');
        if (existingTheme) {
            existingTheme.replaceWith(style);
        } else {
            this.shadowRoot.appendChild(style);
        }
        style.setAttribute('data-theme', theme);
    }
}

customElements.define('ai-config', AIConfig);
