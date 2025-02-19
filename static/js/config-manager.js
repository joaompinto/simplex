export class ConfigManager {
    constructor() {
        this.isConfigured = false;
        this.configData = null;
    }

    updateProviderInfo(providerInfo) {
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl && providerInfo) {
            const vendor = providerInfo.vendor || 'Unknown';
            const model = providerInfo.model || 'Unknown';
            statusEl.style.display = 'flex';
            statusEl.style.alignItems = 'center';
            statusEl.style.gap = '0.3rem';
            statusEl.innerHTML = `
                <span>Using ${vendor} ${model}</span>
                <button class="config-button" onclick="document.dispatchEvent(new CustomEvent('show-ai-config'))">
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
        console.log('Validating config with:', config);

        try {
            aiConfig?.setValidating(true);

            const response = await fetch('/api/config/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(config)
            });

            console.log('Validation response status:', response.status);
            const data = await response.json();
            console.log('Validation response data:', data);

            if (response.ok) {
                // Validation successful, now save the config
                await this.saveConfig(config);
            } else {
                aiConfig?.setValidationResult({
                    success: false,
                    error: data.error || data.detail || 'Server returned an error'
                });
            }
        } catch (error) {
            console.error('Error validating configuration:', error);
            aiConfig?.setValidationResult({
                success: false,
                error: error.message || 'Network error occurred'
            });
        } finally {
            aiConfig?.setValidating(false);
        }
    }

    async saveConfig(config) {
        const aiConfig = document.querySelector('ai-config');
        try {
            const saveResponse = await fetch('/api/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(config)
            });

            if (!saveResponse.ok) {
                throw new Error('Failed to save configuration');
            }

            const saveData = await saveResponse.json();
            // Dispatch save success event
            document.dispatchEvent(new CustomEvent('config-saved', {
                detail: {
                    success: true,
                    provider_info: saveData.provider_info
                }
            }));
            // Update AI config component
            aiConfig?.setValidationResult({
                success: true,
                provider_info: saveData.provider_info
            });
            this.isConfigured = true;
            this.configData = saveData;
            this.updateProviderInfo(saveData.provider_info);
        } catch (error) {
            console.error('Error saving configuration:', error);
            aiConfig?.setValidationResult({
                success: false,
                error: error.message || 'Failed to save configuration'
            });
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
