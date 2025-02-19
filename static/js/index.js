import './components/chat-box/chat-box.js';
import { messageManager } from './message-manager.js';
import { configManager } from './config-manager.js';
import { themeManager } from './theme-manager.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing app...');
    
    const chatBox = document.querySelector('chat-box');
    const aiConfig = document.querySelector('ai-config');
    const connectionStatus = document.getElementById('connectionStatus');

    console.log('Elements found:', {
        chatBox,
        aiConfig,
        connectionStatus
    });

    // Check initial configuration
    const configResult = await configManager.checkConfiguration();
    console.log('Configuration check result:', configResult);

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
        chatBox.setInputEnabled(true);
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
        chatBox.setInputEnabled(true);
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
        aiConfig.dataset.visible = 'true';
    });

    document.addEventListener('config-saved', async (event) => {
        console.log('Config saved, saving configuration...');
        const result = await configManager.saveConfiguration(event.detail);
        if (result.success) {
            messageManager.connect();
            aiConfig.dataset.visible = 'false';
        }
    });

    document.addEventListener('config-cancelled', () => {
        console.log('Config cancelled');
        aiConfig.dataset.visible = 'false';
    });

    // Update connection status
    const updateConnectionStatus = (status, error = false) => {
        console.log('Updating connection status:', { status, error });
        if (connectionStatus) {
            connectionStatus.textContent = status;
            connectionStatus.style.color = error ? 'var(--error-color)' : 'var(--text-color)';
        }
    };

    document.addEventListener('websocket-connected', () => {
        console.log('WebSocket connected');
        updateConnectionStatus('Connected');
    });

    document.addEventListener('websocket-disconnected', () => {
        console.log('WebSocket disconnected');
        updateConnectionStatus('Disconnected', true);
    });

    document.addEventListener('websocket-error', (event) => {
        console.error('WebSocket error:', event.detail);
        updateConnectionStatus(`Error: ${event.detail.message}`, true);
    });

    // Initialize message manager with chat box
    console.log('Initializing message manager...');
    messageManager.chatBox = chatBox;
});
