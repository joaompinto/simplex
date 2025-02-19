export class ConfigManager {
    constructor() {
        this.isConfigured = false;
        this.configData = null;
    }

    updateProviderInfo(providerInfo) {
        const headerMessage = document.querySelector('.header-message');
        if (headerMessage && providerInfo) {
            const vendor = providerInfo.vendor || 'Unknown';
            const model = providerInfo.model || 'Unknown';
            headerMessage.innerHTML = `
                Using ${vendor} ${model}
                <button class="config-button" onclick="document.dispatchEvent(new CustomEvent('show-config-dialog'))">
                    <span class="config-icon">⚙️</span>
                </button>
            `;
        }
    }

    async checkConfiguration() {
        try {
            const response = await fetch('/api/config');
            const data = await response.json();
            
            this.isConfigured = data.configured;
            this.configData = data;
            
            if (data.configured) {
                this.updateProviderInfo(data.provider_info);
            }
            
            return data;
        } catch (error) {
            console.error('Error checking configuration:', error);
            return { configured: false, error: error.message };
        }
    }

    async handleConfigValidation(config) {
        const aiConfig = document.querySelector('ai-config');

        try {
            aiConfig?.setValidating(true);

            const response = await fetch('/api/config/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(config)
            });

            const data = await response.json();

            if (response.ok) {
                aiConfig?.setValidationResult({
                    success: true,
                    provider_info: data.provider_info
                });
            } else {
                aiConfig?.setValidationResult({
                    success: false,
                    error: data.error || 'Unknown error'
                });
            }
        } catch (error) {
            console.error('Error validating configuration:', error);
            aiConfig?.setValidationResult({
                success: false,
                error: error.message || 'Network error'
            });
        } finally {
            aiConfig?.setValidating(false);
        }
    }

    async saveConfiguration(config) {
        try {
            const response = await fetch('/api/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(config)
            });

            const data = await response.json();
            
            if (response.ok) {
                this.isConfigured = true;
                this.configData = data;
                this.updateProviderInfo(data.provider_info);
                return { success: true, provider_info: data.provider_info };
            } else {
                return { success: false, error: data.error || 'Unknown error' };
            }
        } catch (error) {
            console.error('Error saving configuration:', error);
            return { success: false, error: error.message || 'Network error' };
        }
    }

    async resetConfiguration() {
        try {
            const response = await fetch('/api/config', {
                method: 'DELETE'
            });

            const data = await response.json();
            
            if (response.ok) {
                this.isConfigured = false;
                this.configData = null;
                this.updateProviderInfo(null);
                return { success: true };
            } else {
                return { success: false, error: data.error || 'Unknown error' };
            }
        } catch (error) {
            console.error('Error resetting configuration:', error);
            return { success: false, error: error.message || 'Network error' };
        }
    }
}

export const configManager = new ConfigManager();
