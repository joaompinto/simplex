export class ConfigManager {
    constructor() {
        this.isConfigured = false;
        this.configData = null;
        this.ws = null;

        // Listen for config events
        document.addEventListener('request-config', () => this.handleConfigRequest());
        document.addEventListener('validate-config', (e) => this.handleValidateConfig(e.detail));
    }

    updateProviderInfo(providerInfo) {
        const statusEl = document.getElementById('connectionStatus');
        if (!statusEl) return;

        if (!providerInfo) {
            statusEl.style.display = 'flex';
            statusEl.style.alignItems = 'center';
            statusEl.style.gap = '0.3rem';
            statusEl.innerHTML = `
                <span>Not configured</span>
                <button class="config-button" onclick="document.dispatchEvent(new CustomEvent('show-ai-config'))">
                    <span class="config-icon">⚙️</span>
                </button>
            `;
            return;
        }

        const vendor = providerInfo.vendor || 'Unknown';
        const model = providerInfo.model || 'AI Assistant';
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

    setWebSocket(ws) {
        this.ws = ws;
    }

    async checkConfiguration() {
        try {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                throw new Error('WebSocket not connected');
            }

            return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(new Error('Configuration check timed out'));
                }, 5000);

                const messageHandler = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === 'config') {
                            this.ws.removeEventListener('message', messageHandler);
                            clearTimeout(timeoutId);
                            
                            this.isConfigured = data.content.configured;
                            this.configData = data.content;
                            
                            if (data.content.configured) {
                                this.updateProviderInfo(data.content.provider_info);
                            }
                            
                            resolve(data.content);  // Resolve with the content
                        }
                    } catch (error) {
                        console.error('Error handling config message:', error);
                    }
                };

                this.ws.addEventListener('message', messageHandler);
                this.ws.send(JSON.stringify({ type: 'get_config' }));
            });
        } catch (error) {
            console.error('Error checking configuration:', error);
            throw error;
        }
    }

    async handleConfigValidation(config) {
        const aiConfig = document.querySelector('ai-config');
        console.log('Validating config with:', config);

        try {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                throw new Error('WebSocket not connected');
            }

            aiConfig?.setValidating(true);

            return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(new Error('Configuration validation timed out'));
                }, 10000);

                const messageHandler = async (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'validation_result') {
                        this.ws.removeEventListener('message', messageHandler);
                        clearTimeout(timeoutId);

                        if (data.content.valid) {
                            // Validation successful, now save the config
                            await this.saveConfig(config);
                            resolve(data.content);
                        } else {
                            aiConfig?.setValidationResult({
                                success: false,
                                error: data.content.error || 'Validation failed'
                            });
                            reject(new Error(data.content.error));
                        }
                    }
                };

                this.ws.addEventListener('message', messageHandler);
                this.ws.send(JSON.stringify({
                    type: 'validate_config',
                    content: config
                }));
            });
        } catch (error) {
            console.error('Error validating configuration:', error);
            aiConfig?.setValidationResult({
                success: false,
                error: error.message || 'Network error occurred'
            });
            throw error;
        } finally {
            aiConfig?.setValidating(false);
        }
    }

    async saveConfig(config) {
        const aiConfig = document.querySelector('ai-config');
        try {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                throw new Error('WebSocket not connected');
            }

            return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(new Error('Configuration save timed out'));
                }, 5000);

                const messageHandler = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'config_set') {
                        this.ws.removeEventListener('message', messageHandler);
                        clearTimeout(timeoutId);

                        if (data.content.success) {
                            // Dispatch save success event
                            document.dispatchEvent(new CustomEvent('config-saved', {
                                detail: {
                                    success: true,
                                    provider_info: data.content.provider_info
                                }
                            }));

                            resolve(data.content);
                        } else {
                            reject(new Error(data.content.error || 'Failed to save configuration'));
                        }
                    }
                };

                this.ws.addEventListener('message', messageHandler);
                this.ws.send(JSON.stringify({
                    type: 'set_config',
                    content: config
                }));
            });
        } catch (error) {
            console.error('Error saving configuration:', error);
            document.dispatchEvent(new CustomEvent('config-saved', {
                detail: {
                    success: false,
                    error: error.message
                }
            }));
            throw error;
        }
    }

    async deleteConfig() {
        try {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                throw new Error('WebSocket not connected');
            }

            return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(new Error('Configuration deletion timed out'));
                }, 5000);

                const messageHandler = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'config_deleted') {
                        this.ws.removeEventListener('message', messageHandler);
                        clearTimeout(timeoutId);

                        if (data.content.success) {
                            resolve(true);
                        } else {
                            reject(new Error(data.content.error || 'Failed to delete configuration'));
                        }
                    }
                };

                this.ws.addEventListener('message', messageHandler);
                this.ws.send(JSON.stringify({
                    type: 'delete_config'
                }));
            });
        } catch (error) {
            console.error('Error deleting configuration:', error);
            throw error;
        }
    }

    async validateConfig(provider, apiKey) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket not connected');
        }

        // Send validation request
        this.ws.send(JSON.stringify({
            type: 'validate_config',
            content: {
                provider,
                api_key: apiKey
            }
        }));

        // Wait for validation response
        const validationResult = await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Validation request timed out'));
            }, 5000);

            const messageHandler = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'validation_result') {
                    this.ws.removeEventListener('message', messageHandler);
                    clearTimeout(timeoutId);
                    resolve(data.content);
                }
            };

            this.ws.addEventListener('message', messageHandler);
        });

        if (!validationResult.valid) {
            throw new Error(validationResult.error || 'Validation failed');
        }

        return validationResult;
    }

    async saveConfig(provider, apiKey) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket not connected');
        }

        // Send save request
        this.ws.send(JSON.stringify({
            type: 'set_config',
            content: {
                provider,
                api_key: apiKey
            }
        }));

        // Wait for save response
        const saveResult = await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Save request timed out'));
            }, 5000);

            const messageHandler = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'config_set') {
                    this.ws.removeEventListener('message', messageHandler);
                    clearTimeout(timeoutId);
                    
                    if (!data.content.success) {
                        reject(new Error(data.content.error || 'Failed to save configuration'));
                        return;
                    }
                    
                    resolve(data.content);
                }
            };

            this.ws.addEventListener('message', messageHandler);
        });

        // After successful save, get latest config
        const config = await this.loadConfig();
        return config;
    }

    async loadConfig() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket not connected');
        }

        // Request config
        this.ws.send(JSON.stringify({ type: 'get_config' }));

        // Wait for response
        const config = await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Config request timed out'));
            }, 5000);

            const messageHandler = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'config') {
                    this.ws.removeEventListener('message', messageHandler);
                    clearTimeout(timeoutId);
                    resolve(data.content);
                }
            };

            this.ws.addEventListener('message', messageHandler);
        });

        this.configData = config;
        this.isConfigured = config.configured;
        
        if (config.configured && config.provider_info) {
            this.updateProviderInfo(config.provider_info);
        }

        return config;
    }

    async handleConfigRequest() {
        try {
            const config = await this.loadConfig();
            document.dispatchEvent(new CustomEvent('config-loaded', {
                detail: config
            }));
        } catch (error) {
            console.error('Error loading config:', error);
            document.dispatchEvent(new CustomEvent('config-error', {
                detail: { error: error.message }
            }));
        }
    }

    async handleValidateConfig({ provider, api_key }) {
        try {
            // Validate config
            await this.validateConfig(provider, api_key);
            
            // Save config if validation succeeds
            const saveResult = await this.saveConfig(provider, api_key);
            
            // Dispatch success event
            document.dispatchEvent(new CustomEvent('config-updated', {
                detail: saveResult
            }));
        } catch (error) {
            console.error('Error:', error);
            document.dispatchEvent(new CustomEvent('config-error', {
                detail: { error: error.message }
            }));
        }
    }
}

export const configManager = new ConfigManager();
