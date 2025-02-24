export class ValidationHandler {
    constructor(component) {
        this.component = component;
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.errorContainer = this.component.shadowRoot.querySelector('#errorContainer');
        this.validatingMessage = this.component.shadowRoot.querySelector('#validatingMessage');
        this.submitButton = this.component.shadowRoot.querySelector('button[type="submit"]');

        // Verify elements are found
        if (!this.errorContainer || !this.validatingMessage || !this.submitButton) {
            console.error('Failed to initialize validation elements');
            return;
        }
    }

    initializeEventListeners() {
        // Listen for config events
        document.addEventListener('config-updated', () => {
            this.setValidating(false);
            this.hideError();
            this.component.uiHandler.hideModal();
        });

        document.addEventListener('config-error', (e) => {
            this.setValidating(false);
            this.showError(e.detail.error);
        });
    }

    showValidatingState() {
        console.log('Showing validating state');
        if (this.validatingMessage) {
            const messageSpan = this.validatingMessage.querySelector('span');
            const provider = this.component.formHandler.providerSelect.value;
            const providerName = this.component.providerNames[provider] || provider;
            
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
            this.component.dispatchEvent(new CustomEvent('validation-success', {
                detail: result,
                bubbles: true,
                composed: true
            }));
        } else {
            // Show error
            this.showError(result.error || 'Unknown error');
            // Dispatch error event
            this.component.dispatchEvent(new CustomEvent('validation-error', {
                detail: result,
                bubbles: true,
                composed: true
            }));
        }
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
}
