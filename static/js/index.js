import './components/ai-config/index.js';
import './components/chat-box/chat-box.js';
import { messageManager } from './message-manager.js';
import { configManager } from './config-manager.js';
import { themeManager } from './theme-manager.js';
import { CommandManager } from './command-manager.js';
import { messageIdGenerator } from './components/chat-box/id-generator.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing app...');

    const chatBox = document.querySelector('chat-box');
    if (!chatBox) {
        console.error('Chat box not found');
        return;
    }

    const aiConfig = document.querySelector('ai-config');
    const connectionStatus = document.getElementById('connectionStatus');
    const commandManager = new CommandManager();

    console.log('Elements found:', {
        chatBox,
        aiConfig,
        connectionStatus
    });

    // Define updateConnectionStatus function first
    const updateConnectionStatus = (status, error = false) => {
        console.log('Updating connection status:', { status, error });
        if (connectionStatus) {
            // Create or get the config button
            let configButton = connectionStatus.querySelector('.config-button');
            if (status === 'Not configured') {
                if (!configButton) {
                    configButton = document.createElement('button');
                    configButton.className = 'config-button';
                    configButton.textContent = '⚙️';
                    configButton.title = 'Configure AI';
                    configButton.onclick = () => document.dispatchEvent(new CustomEvent('show-ai-config'));
                    connectionStatus.appendChild(configButton);
                }
            } else if (configButton) {
                configButton.remove();
            }
            
            // Update status text
            const statusText = connectionStatus.querySelector('.status-text') || document.createElement('span');
            statusText.className = 'status-text';
            statusText.textContent = status;
            statusText.style.color = error ? 'var(--error-color)' : 'inherit';
            if (!statusText.parentNode) {
                connectionStatus.insertBefore(statusText, configButton);
            }
        }
    };

    // Initialize with a loading state
    updateConnectionStatus('Initializing...');
    chatBox.setInputEnabled(false);

    // Connect message manager and share WebSocket
    try {
        // Set chat box before connecting
        messageManager.chatBox = chatBox;
        
        // Connect WebSocket
        await messageManager.connect();
        
        // Wait a bit for the connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Share WebSocket with config manager
        configManager.setWebSocket(messageManager.webSocketManager.connection);

        // Check initial configuration
        try {
            const configResult = await configManager.checkConfiguration();
            console.log('Configuration check result:', configResult);

            if (!configResult.configured) {
                updateConnectionStatus('Not configured');
                chatBox.addCard({
                    content: "Configure AI to start chatting",
                    actions: [{
                        text: "Configure AI",
                        handler: () => document.dispatchEvent(new CustomEvent('show-ai-config'))
                    }],
                    metadata: {
                        id: "config-card"
                    }
                });
            } else {
                // Enable chat input
                chatBox.setInputEnabled(true);
                
                // Show help command message
                chatBox.addMessage({
                    content: "Type /help to see available commands",
                    type: "system",
                    metadata: {
                        id: "help-message",
                        timestamp: new Date().toISOString()
                    }
                });
            }
        } catch (error) {
            console.error('Configuration check failed:', error);
            updateConnectionStatus('Configuration error', true);
            chatBox.addCard({
                content: `Failed to check AI configuration: ${error.message}`,
                actions: [{
                    text: "Configure AI",
                    handler: () => document.dispatchEvent(new CustomEvent('show-ai-config'))
                }],
                metadata: {
                    id: "config-card"
                }
            });
        }
    } catch (error) {
        console.error('Error during initialization:', error);
        updateConnectionStatus('Connection error', true);
        chatBox.addMessage({
            content: `Error connecting to server: ${error.message}`,
            type: 'system',
            className: 'error',
            metadata: {
                id: messageIdGenerator.generate(),
                timestamp: new Date().toISOString()
            }
        });
    }

    // Handle message submission
    chatBox.addEventListener('message-sent', async (e) => {
        const { content, messageId } = e.detail;
        
        // Add user message to chat
        chatBox.addMessage({
            content,
            type: 'sent',
            metadata: { 
                id: messageId,
                timestamp: new Date().toISOString() 
            }
        });
        
        // Check for commands
        const commandResult = commandManager.handleCommand(content);
        if (commandResult) {
            try {
                const result = await (commandResult.content instanceof Promise ? commandResult.content : commandResult.content);
                if (result) {  // Only show message if there's content
                    chatBox.addMessageMD({
                        content: result,
                        type: 'system',
                        className: commandResult.className || '',
                        metadata: {
                            id: messageIdGenerator.generate(),
                            timestamp: new Date().toISOString()
                        }
                    });
                }
            } catch (error) {
                chatBox.addMessageMD({
                    content: `# Error: Command Failed\n\`${error.message}\``,
                    type: 'system',
                    className: 'error',
                    metadata: {
                        id: messageIdGenerator.generate(),
                        timestamp: new Date().toISOString()
                    }
                });
            }
            return;
        }

        try {
            // Send message through WebSocket
            messageManager.webSocketManager.connection.send(JSON.stringify({
                type: 'message',
                content: content,
                metadata: {
                    user_input_id: messageId
                }
            }));
        } catch (error) {
            console.error('Error sending message:', error);
            chatBox.addMessage({
                content: `Error sending message: ${error.message}`,
                type: 'system',
                className: 'error',
                metadata: {
                    id: messageIdGenerator.generate(),
                    timestamp: new Date().toISOString()
                }
            });
        }
    });

    // Handle connection status changes
    messageManager.addEventListener('connection-status', (event) => {
        console.log('Connection status event received:', event.detail);
        const { connected, error } = event.detail;
        if (!connected && error) {
            chatBox.addMessage({
                content: `Connection error: ${error}`,
                type: 'system',
                className: 'error',
                metadata: {
                    id: messageIdGenerator.generate(),
                    timestamp: new Date().toISOString()
                }
            });
            updateConnectionStatus('Connection error', true);
        }
    });

    // Listen for config events
    document.addEventListener('config-updated', (e) => {
        console.log('Config updated:', e.detail);
        
        // Enable chat input
        chatBox.setInputEnabled(true);
        
        // Remove config card if present
        chatBox.removeCard('config-card');

        // Update connection status with provider info
        if (e.detail.provider_info) {
            const { vendor, model } = e.detail.provider_info;
            connectionStatus.style.display = 'flex';
            connectionStatus.style.alignItems = 'center';
            connectionStatus.style.gap = '0.3rem';
            connectionStatus.innerHTML = `
                <span>Using ${vendor} ${model}</span>
                <button class="config-button" onclick="document.dispatchEvent(new CustomEvent('show-ai-config'))">
                    <span class="config-icon">⚙️</span>
                </button>
            `;
        }

        // Add welcome message
        chatBox.addMessage({
            content: 'Configuration saved successfully! Try saying hello!',
            type: 'system',
            metadata: {
                id: messageIdGenerator.generate(),
                timestamp: new Date().toISOString()
            }
        });
    });

    // Listen for show-ai-config event
    document.addEventListener('show-ai-config', () => {
        if (aiConfig) {
            aiConfig.showModal();
        }
    });

    document.addEventListener('config-saved', async (event) => {
        const { success, error, provider_info } = event.detail;
        
        if (success) {
            aiConfig?.hideModal();
            chatBox.setInputEnabled(true);
            
            // Remove config card if it exists
            chatBox.removeCard('config-card');
            
            // Add welcome message
            chatBox.addMessage({
                content: 'Configuration saved successfully! Try saying hello!',
                type: 'system',
                metadata: {
                    id: messageIdGenerator.generate(),
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            console.error('Configuration save failed:', error);
        }
    });
});
