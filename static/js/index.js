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

    // Connect message manager to chat box
    messageManager.chatBox = chatBox;
    messageManager.connect();

    // Define updateConnectionStatus function first
    const updateConnectionStatus = (status, error = false) => {
        console.log('Updating connection status:', { status, error });
        if (connectionStatus) {
            connectionStatus.textContent = status;
            connectionStatus.style.color = error ? 'var(--error-color)' : 'inherit';
        }
    };

    // Initialize with a loading state
    updateConnectionStatus('Initializing...');
    chatBox.setInputEnabled(false);

    // Check initial configuration
    const configResult = await configManager.checkConfiguration();
    console.log('Configuration check result:', configResult);

    if (!configResult.configured) {
        updateConnectionStatus('Not configured');
        chatBox.addCard({
            content: "# AI Configuration Required\nPlease configure your AI provider to start chatting.",
            actions: [{
                label: "Configure AI",
                event: "show-ai-config"
            }],
            metadata: {
                id: "config-card"
            }
        });
    } else {
        // Enable chat input
        chatBox.setInputEnabled(true);
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

        // Regular message handling
        try {
            await messageManager.sendMessage(content);
        } catch (error) {
            console.error('Error sending message:', error);
            chatBox.addMessageMD({
                content: `# Error\n${error.message}`,
                type: 'system',
                className: 'error',
                metadata: {
                    id: messageIdGenerator.generate(),
                    timestamp: new Date().toISOString()
                }
            });
        }
    });

    // Handle chat events
    chatBox.addEventListener('message-submitted', (event) => {
        console.log('Message submitted event received:', event.detail);
        messageManager.handleSubmittedMessage(event.detail);
    });

    // Handle message manager events
    messageManager.addEventListener('messageStart', (event) => {
        console.log('Message start event received:', event.detail);
        // Message is already created in MessageManager
    });

    messageManager.addEventListener('newLines', (event) => {
        console.log('New lines event received:', event.detail);
        // Updates are handled in MessageManager
    });

    messageManager.addEventListener('lineUpdate', (event) => {
        console.log('Line update event received:', event.detail);
        // Updates are handled in MessageManager
    });

    messageManager.addEventListener('messageComplete', (event) => {
        console.log('Message complete event received:', event.detail);
        if (configResult.configured) {
            chatBox.setInputEnabled(true);
        }
    });

    messageManager.addEventListener('error', (event) => {
        console.error('Error event received:', event.detail);
        const { content, isHtml, messageId, metadata } = event.detail;
        chatBox.addMessage({
            content,
            type: 'system',
            isHtml,
            metadata: {
                ...metadata,
                error: true
            }
        });
        if (configResult.configured) {
            chatBox.setInputEnabled(true);
        }
    });

    messageManager.addEventListener('connection-status', (event) => {
        console.log('Connection status event received:', event.detail);
        const { connected, error } = event.detail;
        if (!connected && error) {
            chatBox.addMessage({
                content: `Connection error: ${error}`,
                type: 'system',
                metadata: { error: true }
            });
        }
    });

    // Handle config events
    document.addEventListener('show-ai-config', () => {
        console.log('Showing AI config');
        const configModal = aiConfig.shadowRoot.querySelector('#configModal');
        if (configModal) {
            configModal.classList.add('show');
        }
    });

    document.addEventListener('config-saved', (event) => {
        console.log('Configuration saved:', event.detail);
        // Remove config card using the component's API
        const chatBox = document.querySelector('chat-box');
        if (chatBox) {
            chatBox.removeCard('config-card');
            chatBox.setInputEnabled(true);
        }
        // Connect to WebSocket since we're now configured
        messageManager.connect();
        // Update connection status
        updateConnectionStatus('Connecting...');
        // Hide the config modal
        const aiConfig = document.querySelector('ai-config');
        if (aiConfig) {
            aiConfig.dataset.visible = 'false';
        }
    });

    document.addEventListener('config-cancelled', () => {
        console.log('Config cancelled');
        aiConfig.dataset.visible = 'false';
    });

    // Handle validation request
    document.addEventListener('validate-config', async (event) => {
        console.log('Validating config:', { ...event.detail, api_key: '[REDACTED]' });
        await configManager.handleConfigValidation(event.detail);
    });

    // Handle provider info updates
    document.addEventListener('provider-info-update', (event) => {
        console.log('Provider info update:', event.detail);
        const aiProvider = document.getElementById('aiProvider');
        if (aiProvider && event.detail) {
            aiProvider.textContent = event.detail.name;
        }
    });

    // Handle configuration errors
    document.addEventListener('config-error', (event) => {
        console.log('Configuration error:', event.detail);
        updateConnectionStatus('Configuration error');
    });

    // WebSocket connection events
    document.addEventListener('websocket-connected', () => {
        console.log('WebSocket connected');
        if (configResult.configured) {
            updateConnectionStatus('Connected');
            chatBox.setInputEnabled(true);
        }
    });

    document.addEventListener('websocket-disconnected', () => {
        console.log('WebSocket disconnected');
        if (configResult.configured) {
            updateConnectionStatus('Disconnected', true);
            chatBox.setInputEnabled(false);
        }
    });

    document.addEventListener('websocket-error', (event) => {
        console.log('WebSocket error:', event.detail);
        if (configResult.configured) {
            updateConnectionStatus('Connection error', true);
            chatBox.setInputEnabled(false);
        }
    });
});
