import { getTemplate } from './template.js';
import { styles } from './styles/index.js';
import { MessageHandler } from './message-handler.js';
import { InputHandler } from './input-handler.js';
import { CopyHandler } from './copy-handler.js';
import { MarkdownHandler } from './markdown-handler.js';
import { messageIdGenerator } from './id-generator.js';

/**
 * ChatBox Component
 * A web component for displaying a chat interface with message streaming support.
 * 
 * Events Emitted:
 * --------------
 * 'chat-box-ready'
 *   - Fired when component is fully initialized
 *   - Bubbles: true, composed: true
 * 
 * 'message-submitted'
 *   - Fired when user submits a message
 *   - Bubbles: true, composed: true
 *   - detail: { content: string, messageId: string }
 * 
 * Methods:
 * --------
 * addMessage({ content, type, metadata, isHtml })
 *   - Adds a new message to the chat
 *   - Parameters:
 *     - content: string - Message content
 *     - type: string - Message type ('sent', 'received', 'system')
 *     - metadata: object - Additional message data (id, timestamp, etc.)
 *     - isHtml: boolean - If true, content is rendered as HTML
 *   - Returns: string - The ID of the created message
 * 
 * updateMessage(messageId, content, append)
 *   - Updates an existing message
 *   - Parameters:
 *     - messageId: string - ID of message to update
 *     - content: string - New content
 *     - append: boolean - If true, appends content instead of replacing
 *   - Returns: boolean - True if message was found and updated
 * 
 * setInputEnabled(enabled)
 *   - Enables/disables the input field and send button
 *   - Parameters:
 *     - enabled: boolean
 * 
 * clearMessages()
 *   - Removes all messages from the chat
 * 
 * addCard({ content, actions, metadata })
 *   - Adds a new card message to the chat
 *   - Parameters:
 *     - content: string - Card content/description
 *     - actions: Object[] - Button actions
 *     - metadata: object - Additional metadata
 *   - Returns: string - The ID of the created card
 * 
 * addMessageMD({ content, type, metadata })
 *   - Adds a new markdown message to the chat
 *   - Parameters:
 *     - content: string - Message content in markdown format
 *     - type: string - Message type ('sent', 'received', 'system')
 *     - metadata: object - Additional message data (id, timestamp, etc.)
 *   - Returns: string - The ID of the created message
 * 
 * updateMessageMD(messageId, content, append)
 *   - Updates an existing message with markdown content
 *   - Parameters:
 *     - messageId: string - ID of the message to update
 *     - content: string - New content in markdown format
 *     - append: boolean - If true, appends content instead of replacing
 *   - Returns: boolean - True if message was found and updated
 * 
 * removeCard(cardId)
 *   - Removes a card from the chat
 *   - Parameters:
 *     - cardId: string - ID of the card to remove
 *   - Returns: boolean - True if card was found and removed
 * 
 * generateMessageId()
 *   - Generates a unique message ID
 *   - Returns: string - A unique message ID
 */

export class ChatBox extends HTMLElement {
    static get styles() {
        return styles;
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
        
        // Initialize handlers
        this.markdownHandler = new MarkdownHandler();
        const messageContainer = this.shadowRoot.querySelector('.chat-messages');
        this.messageHandler = new MessageHandler(messageContainer);
        this.inputHandler = new InputHandler(this);
        this.copyHandler = new CopyHandler(this.shadowRoot);
        
        // Start theme observer
        this.initThemeObserver();
    }

    initThemeObserver() {
        // Start observing theme changes on the document root
        this.observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    this.updateTheme();
                }
            });
        });
        
        this.observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
        
        // Set initial theme
        this.updateTheme();
    }

    connectedCallback() {
        // Create shadow DOM first
        if (!this.shadowRoot) {
            const shadow = this.attachShadow({ mode: 'open' });
            shadow.innerHTML = getTemplate();
        }

        // Set up event listeners
        this.setupEventListeners();

        // Notify message manager
        import('../../message-manager.js').then(({ messageManager }) => {
            console.log('[ChatBox] Setting up with message manager');
            messageManager.setChatBox(this);
        });
        
        this.dispatchEvent(new CustomEvent('chat-box-ready', {
            bubbles: true,
            composed: true
        }));
    }

    setupEventListeners() {
        // Add cancel button handler
        const cancelButton = this.shadowRoot.querySelector('.receiving-indicator .cancel-button');
        console.log('[ChatBox] Found cancel button:', !!cancelButton);
        
        if (cancelButton) {
            cancelButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log('[ChatBox] Cancel button clicked');
                console.log('[ChatBox] Current receiving ID:', this._currentReceivingId);
                
                if (this._currentReceivingId) {
                    console.log('[ChatBox] Dispatching messagecancel event');
                    
                    // Create event once
                    const evt = new CustomEvent('messagecancel', {
                        detail: { messageId: this._currentReceivingId },
                        bubbles: true,
                        composed: true
                    });

                    // Dispatch on the component itself
                    console.log('[ChatBox] Dispatching event on component');
                    this.dispatchEvent(evt);
                    
                    this.setReceiving(false);
                }
            });
        } else {
            console.error('[ChatBox] Cancel button not found in shadow DOM');
        }
    }

    disconnectedCallback() {
        // Clean up observer when component is removed
        this.observer.disconnect();
    }

    updateTheme() {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme) {
            this.setAttribute('data-theme', theme);
        } else {
            this.removeAttribute('data-theme');
        }
    }

    render() {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = this.constructor.styles;
        
        const template = document.createElement('template');
        template.innerHTML = getTemplate();
        
        this.shadowRoot.appendChild(styleSheet);
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // Public API methods
    addMessage(params) {
        return this.messageHandler.addMessage(params);
    }

    addMessageMD(params) {
        return this.messageHandler.addMessageMD(params);
    }

    updateMessage(messageId, content, append) {
        return this.messageHandler.updateMessage(messageId, content, append);
    }

    updateMessageMD(messageId, content, append) {
        return this.messageHandler.updateMessageMD(messageId, content, append);
    }

    addCard(options) {
        return this.messageHandler.addCard(options);
    }

    removeCard(cardId) {
        return this.messageHandler.removeCard(cardId);
    }

    setInputEnabled(enabled) {
        this.inputHandler.setEnabled(enabled);
    }

    clearMessages() {
        this.messageHandler.clearMessages();
    }

    generateMessageId() {
        return messageIdGenerator.generate();
    }

    addCopyToMessage(messageId) {
        this.copyHandler.addCopyToMessage(messageId);
    }

    addCopyToBlocks(messageId) {
        this.copyHandler.addCopyToBlocks(messageId);
    }

    setReceiving(receiving, messageId = null) {
        const indicator = this.shadowRoot.querySelector('.receiving-indicator');
        if (!indicator) return;

        console.log('[ChatBox] setReceiving:', receiving, 'messageId:', messageId);

        if (receiving && messageId) {
            this._currentReceivingId = messageId;
            indicator.classList.add('visible');
            console.log('[ChatBox] Showing indicator for:', messageId);
            
            // Make sure it's visible even if we're at the bottom
            setTimeout(() => {
                if (indicator.classList.contains('visible')) {
                    indicator.classList.add('visible');
                }
            }, 100);
        } else {
            console.log('[ChatBox] Hiding indicator, was showing:', this._currentReceivingId);
            this._currentReceivingId = null;
            indicator.classList.remove('visible');
        }
    }

    getCurrentReceivingId() {
        return this._currentReceivingId;
    }

    addNotice(messageId, { type, text }) {
        const messageElement = this.messageHandler?.getMessageElement(messageId);
        if (!messageElement) return;

        // Remove any existing notices
        const existingNotice = messageElement.querySelector('.message-notice');
        if (existingNotice) {
            existingNotice.remove();
        }

        // Create notice element
        const noticeDiv = document.createElement('div');
        noticeDiv.className = `message-notice ${type}-notice`;
        noticeDiv.textContent = text;
        
        // Append to message
        messageElement.appendChild(noticeDiv);
    }

    removeNotice(messageId) {
        const messageElement = this.messageHandler?.getMessageElement(messageId);
        if (!messageElement) return;

        const notice = messageElement.querySelector('.message-notice');
        if (notice) {
            notice.remove();
        }
    }
}

// Wait for marked to be available before defining the component
if (window.marked) {
    customElements.define('chat-box', ChatBox);
} else {
    document.addEventListener('marked-ready', () => {
        customElements.define('chat-box', ChatBox);
    });
}
