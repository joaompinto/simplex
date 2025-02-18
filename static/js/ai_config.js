class AIConfigManager {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.checkConfig();
    }

    initializeElements() {
        this.configModal = document.getElementById('configModal');
        this.configForm = document.getElementById('configForm');
        this.closeModal = document.getElementById('closeModal');
        this.configMessageTemplate = document.getElementById('configMessageTemplate');
        this.messageArea = document.getElementById('messageArea');
        this.providerSelect = document.getElementById('provider');
        this.apiKeyGroup = document.getElementById('apiKeyGroup');
        this.headerSubtitle = document.getElementById('headerSubtitle');
        this.aiProvider = document.getElementById('aiProvider');
        this.headerConfigButton = document.getElementById('headerConfigButton');
        this.deleteConfigButton = document.getElementById('deleteConfig');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.configuredProvidersList = document.getElementById('configuredProvidersList');
    }

    initializeEventListeners() {
        // Modal triggers
        this.headerConfigButton.addEventListener('click', () => this.showModal());
        this.closeModal.addEventListener('click', () => this.hideModal());
        window.addEventListener('click', (e) => {
            if (e.target === this.configModal) {
                this.hideModal();
            }
        });

        // Form submission
        this.configForm.addEventListener('submit', (e) => this.handleConfigSubmit(e));

        // Delete config
        this.deleteConfigButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to remove this provider configuration?')) {
                this.handleDeleteConfig();
            }
        });

        // Show API key field when provider is selected
        this.providerSelect.addEventListener('change', () => {
            const selectedProvider = this.providerSelect.value;
            if (selectedProvider) {
                this.apiKeyGroup.style.display = 'block';
                this.apiKeyGroup.querySelector('input').focus();
            } else {
                this.apiKeyGroup.style.display = 'none';
            }
        });
    }

    showModal() {
        this.configModal.classList.add('show');
    }

    hideModal() {
        this.configModal.classList.remove('show');
        // Reset form
        this.configForm.reset();
        this.apiKeyGroup.style.display = 'none';
    }

    async checkConfig() {
        try {
            const response = await fetch('/api/config');
            const data = await response.json();
            
            if (data.configured) {
                this.updateConfiguredProviders(data.configs, data.current);
                this.updateHeaderProvider(data.current);
                this.messageInput.disabled = false;
                this.sendButton.disabled = false;
            } else {
                this.showConfigMessage();
                this.headerSubtitle.style.display = 'none';
                this.messageInput.disabled = true;
                this.sendButton.disabled = true;
            }
        } catch (error) {
            console.error('Error checking AI config:', error);
            window.addMessage('Error checking AI configuration.', 'system');
            this.messageInput.disabled = true;
            this.sendButton.disabled = true;
        }
    }

    updateConfiguredProviders(configs, currentProvider) {
        this.configuredProvidersList.innerHTML = '';
        
        if (Object.keys(configs).length === 0) {
            const noProviders = document.createElement('div');
            noProviders.className = 'no-providers';
            noProviders.textContent = 'No providers configured';
            this.configuredProvidersList.appendChild(noProviders);
            return;
        }

        for (const [provider, config] of Object.entries(configs)) {
            const item = document.createElement('div');
            item.className = `provider-item${provider === currentProvider ? ' current' : ''}`;
            
            const name = document.createElement('span');
            name.className = 'provider-name';
            name.textContent = this.getProviderDisplayName(provider);
            
            const actions = document.createElement('div');
            actions.className = 'provider-actions';
            
            if (provider !== currentProvider) {
                const selectBtn = document.createElement('button');
                selectBtn.className = 'provider-select';
                selectBtn.textContent = 'Select';
                selectBtn.addEventListener('click', () => this.handleSelectProvider(provider));
                actions.appendChild(selectBtn);
            }
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'provider-remove';
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', () => this.handleRemoveProvider(provider));
            actions.appendChild(removeBtn);
            
            item.appendChild(name);
            item.appendChild(actions);
            this.configuredProvidersList.appendChild(item);
        }
    }

    showConfigMessage() {
        const message = this.configMessageTemplate.content.cloneNode(true);
        const configButton = message.querySelector('.config-button');
        configButton.addEventListener('click', () => this.showModal());
        this.messageArea.appendChild(message);
    }

    getProviderDisplayName(provider) {
        const names = {
            'openai': 'OpenAI',
            'anthropic': 'Anthropic',
            'gemini': 'Google Gemini'
        };
        return names[provider] || provider;
    }

    updateHeaderProvider(provider) {
        this.aiProvider.textContent = this.getProviderDisplayName(provider);
        this.headerSubtitle.style.display = 'flex';
    }

    async handleConfigSubmit(e) {
        e.preventDefault();
        
        const formData = {
            provider: this.providerSelect.value,
            api_key: document.getElementById('apiKey').value
        };

        try {
            const response = await fetch('/api/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to save configuration');
            }

            this.hideModal();
            await this.checkConfig();
            window.addMessage('AI configuration updated successfully', 'system');
        } catch (error) {
            console.error('Error saving config:', error);
            window.addMessage('Failed to update AI configuration', 'system');
        }
    }

    async handleSelectProvider(provider) {
        try {
            const response = await fetch(`/api/config/${provider}/select`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to select provider');
            }

            await this.checkConfig();
            window.addMessage(`Switched to ${this.getProviderDisplayName(provider)}`, 'system');
        } catch (error) {
            console.error('Error selecting provider:', error);
            window.addMessage('Failed to switch provider', 'system');
        }
    }

    async handleRemoveProvider(provider) {
        if (!confirm(`Are you sure you want to remove ${this.getProviderDisplayName(provider)}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/config/${provider}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to remove provider');
            }

            await this.checkConfig();
            window.addMessage(`Removed ${this.getProviderDisplayName(provider)}`, 'system');
        } catch (error) {
            console.error('Error removing provider:', error);
            window.addMessage('Failed to remove provider', 'system');
        }
    }

    async handleDeleteConfig() {
        try {
            const response = await fetch('/api/config', {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete configuration');
            }

            this.headerSubtitle.style.display = 'none';
            window.addMessage('AI configuration deleted', 'system');
            await this.checkConfig();
        } catch (error) {
            console.error('Error deleting config:', error);
            window.addMessage('Failed to delete AI configuration', 'system');
        }
    }
}

// Initialize AI Config when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIConfigManager();
});
