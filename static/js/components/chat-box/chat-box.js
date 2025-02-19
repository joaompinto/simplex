import { getTemplate } from './template.js';
import { styles } from './styles/index.js';
import { MessageHandler } from './message-handler.js';
import { InputHandler } from './input-handler.js';
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
 * 
 * CSS Custom Properties:
 * --------------------
 * --chat-bg: Background color of the chat container
 * --chat-text: Main text color
 * --chat-border: Border color
 * --chat-sent-bg: Background color for sent messages
 * --chat-received-bg: Background color for received messages
 * --chat-system-bg: Background color for system messages
 * --chat-input-bg: Background color for the input area
 * --chat-disabled-bg: Background color for disabled input
 * --chat-button-bg: Background color for the send button
 * --chat-button-hover: Background color for send button on hover
 * --chat-card-bg: Background color for cards
 * 
 * Example Usage:
 * -------------
 * // Add the component to your HTML
 * <chat-box></chat-box>
 * 
 * // Get a reference to the component
 * const chatBox = document.querySelector('chat-box');
 * 
 * // Listen for ready event
 * chatBox.addEventListener('chat-box-ready', () => {
 *   // ChatBox is ready to use
 * });
 * 
 * // Listen for new messages
 * chatBox.addEventListener('message-submitted', (event) => {
 *   const { content, messageId } = event.detail;
 *   // Handle new message
 * });
 * 
 * // Add a message
 * const messageId = chatBox.addMessage({
 *   content: "Hello!",
 *   type: "sent",
 *   metadata: {
 *     timestamp: new Date().toISOString()
 *   }
 * });
 * 
 * // Update a message
 * chatBox.updateMessage(messageId, "Updated content");
 * 
 * // Add a card
 * const cardId = chatBox.addCard({
 *   content: "This is a card",
 *   actions: [
 *     {
 *       label: "Click me",
 *       event: "card-action-clicked"
 *     }
 *   ]
 * });
 * 
 * // Remove a card
 * chatBox.removeCard(cardId);
 * 
 * // Generate a message ID
 * const newMessageId = chatBox.generateMessageId();
 */

export class ChatBox extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.configureMarked();
        this.render();
        this.messageHandler = new MessageHandler(this);
        this.inputHandler = new InputHandler(this);
    }

    connectedCallback() {
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

        this.dispatchEvent(new CustomEvent('chat-box-ready', {
            bubbles: true,
            composed: true
        }));
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

    configureMarked() {
        const decodeHtml = (html) => {
            const txt = document.createElement('textarea');
            txt.innerHTML = html;
            return txt.value;
        };

        const renderer = {
            code(code, language) {
                // Normalize language name
                let validLanguage = language;
                if (language === 'py' || language === 'python3') {
                    validLanguage = 'python';
                }
                
                // Check if language is supported, fallback to plaintext
                validLanguage = hljs.getLanguage(validLanguage) ? validLanguage : 'plaintext';

                try {
                    // First decode any HTML entities
                    const decodedCode = decodeHtml(code);
                    
                    // Then highlight the code
                    const highlighted = hljs.highlight(decodedCode, {
                        language: validLanguage,
                        ignoreIllegals: true
                    });

                    // Finally wrap in pre/code tags
                    return `<pre><code class="hljs language-${validLanguage}">${highlighted.value}</code></pre>`;
                } catch (err) {
                    console.warn('Failed to highlight code:', err);
                    return `<pre><code class="hljs">${code}</code></pre>`;
                }
            },
            codespan(code) {
                // Decode HTML entities in inline code
                const decodedCode = decodeHtml(code);
                return `<code class="inline-code">${decodedCode}</code>`;
            }
        };

        window.marked.setOptions({
            breaks: true,
            gfm: true,
            pedantic: false,
            mangle: false,
            headerIds: false,
            highlight: null
        });

        window.marked.use({ renderer });
    }

    escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') {
            unsafe = String(unsafe || '');
        }
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    render() {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        
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
}

// Wait for marked to be available before defining the component
if (window.marked) {
    customElements.define('chat-box', ChatBox);
} else {
    window.addEventListener('load', () => {
        customElements.define('chat-box', ChatBox);
    });
}
