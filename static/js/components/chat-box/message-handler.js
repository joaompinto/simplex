export class MessageHandler {
    constructor(chatBox) {
        this.chatBox = chatBox;
        this.messageContainer = this.chatBox.shadowRoot.querySelector('.chat-messages');
        this.messageQueue = [];
        this.processingQueue = false;
    }

    addMessage({ content, type = 'received', metadata = {}, isHtml = false, className = '' }) {
        console.log('Adding message:', { content, type, metadata, isHtml, className });
        
        // Check if we're at the bottom before adding
        const isAtBottom = this.isScrolledToBottom();
        
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${type} ${className}`;
        
        // For system messages, always use markdown
        if (type === 'system') {
            content = String(content || '');
            const parsedContent = window.marked.parse(content);
            messageElement.innerHTML = parsedContent;
            messageElement.classList.add('system');
        } else {
            content = String(content || '');
            messageElement.innerHTML = isHtml ? content : this.escapeHtml(content);
        }
        
        const id = metadata.id || this.generateId();
        messageElement.id = id;
        
        this.messageContainer.appendChild(messageElement);
        
        // Only scroll if we were at the bottom
        if (isAtBottom) {
            this.scrollToBottom();
        }
        
        console.log('Message added with ID:', id);
        return id;
    }

    addMessageMD({ content, type = 'received', metadata = {}, className = '' }) {
        console.log('Adding markdown message:', { content, type, metadata, className });
        
        // Check if we're at the bottom before adding
        const isAtBottom = this.isScrolledToBottom();
        
        try {
            content = String(content || '');
            console.log('Parsing markdown content:', content);
            const parsedContent = window.marked.parse(content);
            console.log('Parsed markdown result:', parsedContent);
            const id = this.addMessage({
                content: parsedContent,
                type,
                metadata,
                className,
                isHtml: true
            });

            // Add copy buttons to code blocks if not a system message
            if (type !== 'system') {
                this.addCopyButtonsToMessage(id);
            }

            return id;
        } catch (error) {
            console.error('Error parsing markdown:', error);
            return this.addMessage({
                content: `Error parsing markdown: ${error.message}`,
                type: 'system',
                className: 'error',
                metadata
            });
        }
    }

    updateMessageMD(messageId, content, append = false) {
        console.log('Updating markdown message:', { messageId, content, append });
        try {
            // Check if we're at the bottom before updating
            const isAtBottom = this.isScrolledToBottom();

            // First decode any HTML entities in the content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            const decodedContent = tempDiv.textContent;

            // Then parse the markdown
            console.log('Parsing markdown update content:', decodedContent);
            const parsedContent = window.marked.parse(decodedContent);
            console.log('Parsed markdown update result:', parsedContent);
            
            // Update the message
            const result = this.updateMessage(messageId, parsedContent, append);

            // Ensure we scroll to bottom on the final update if we were at bottom
            if (isAtBottom) {
                // Use setTimeout to ensure this runs after the content is fully rendered
                setTimeout(() => this.scrollToBottom(), 0);
            }

            return result;
        } catch (error) {
            console.error('Error parsing markdown update:', error);
            return this.updateMessage(messageId, content, append);
        }
    }

    updateMessage(messageId, content, append = false) {
        console.log('Updating message:', { messageId, content, append });
        const messageElement = this.messageContainer.querySelector(`#${messageId}`);
        if (!messageElement) {
            console.warn('Message not found:', messageId);
            return false;
        }
        
        content = String(content || '');
        if (append) {
            messageElement.innerHTML += content;
        } else {
            messageElement.innerHTML = content;
        }
        messageElement.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
        this.scrollToBottom();
        console.log('Message updated successfully');
        return true;
    }

    updateMessage(messageId, content) {
        const message = this.messageContainer.querySelector(`#${messageId}`);
        if (message) {
            // Check if we're at the bottom before updating
            const isAtBottom = this.isScrolledToBottom();

            // First sanitize the content
            const sanitizedContent = window.DOMPurify.sanitize(content, {
                ALLOWED_TAGS: ['pre', 'code', 'span', 'p', 'a', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
                ALLOWED_ATTR: ['class', 'href', 'target']
            });
            
            // Create a temporary div to decode HTML entities
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = sanitizedContent;
            
            // Find all code blocks and decode their content
            tempDiv.querySelectorAll('pre code').forEach((block) => {
                // Get the language from the class
                const langClass = Array.from(block.classList).find(c => c.startsWith('language-'));
                const language = langClass ? langClass.replace('language-', '') : 'plaintext';

                // Decode HTML entities in the code
                const decodedCode = block.textContent;

                try {
                    // Highlight the decoded code
                    const highlighted = hljs.highlight(decodedCode, {
                        language,
                        ignoreIllegals: true
                    });

                    // Set the highlighted content
                    block.innerHTML = highlighted.value;
                } catch (err) {
                    console.warn('Failed to highlight code block:', err);
                }
            });

            // Set the final content
            message.innerHTML = tempDiv.innerHTML;

            // If we were at the bottom, scroll back to bottom
            if (isAtBottom) {
                this.scrollToBottom();
            }
        }
    }

    isScrolledToBottom() {
        const { scrollHeight, scrollTop, clientHeight } = this.messageContainer;
        // Consider "at bottom" if within 10px of the bottom
        return Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
    }

    addCard({ content, actions = [], metadata = {} }) {
        console.log('Adding card:', { content, actions, metadata });
        const cardElement = document.createElement('div');
        cardElement.className = 'chat-message chat-card';
        
        // Create card content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'chat-card-content';
        contentDiv.innerHTML = window.marked.parse(String(content || ''));
        cardElement.appendChild(contentDiv);
        
        // Create actions container if there are actions
        if (actions && actions.length > 0) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'chat-card-actions';
            
            actions.forEach(action => {
                const button = document.createElement('button');
                button.textContent = action.label;
                button.addEventListener('click', () => {
                    // Dispatch the event at the document level
                    document.dispatchEvent(new CustomEvent(action.event, {
                        bubbles: true,
                        composed: true,
                        detail: {
                            cardId: id,
                            action: action
                        }
                    }));
                });
                actionsDiv.appendChild(button);
            });
            
            cardElement.appendChild(actionsDiv);
        }
        
        const id = metadata.id || this.generateId();
        cardElement.id = id;
        
        this.messageContainer.appendChild(cardElement);
        this.scrollToBottom();
        console.log('Card added with ID:', id);
        return id;
    }

    removeCard(cardId) {
        console.log('Removing card:', cardId);
        const card = this.messageContainer.querySelector(`#${cardId}`);
        if (card) {
            card.remove();
            console.log('Card removed successfully');
            return true;
        }
        console.warn('Card not found:', cardId);
        return false;
    }

    clearMessages() {
        console.log('Clearing all messages');
        while (this.messageContainer.firstChild) {
            this.messageContainer.removeChild(this.messageContainer.firstChild);
        }
    }

    scrollToBottom() {
        if (this.messageContainer) {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }
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

    generateId() {
        return 'msg-' + Math.random().toString(36).substr(2, 9);
    }

    addCopyButtonsToMessage(messageId) {
        console.log('Adding copy buttons to message:', messageId);
        const message = this.messageContainer.querySelector(`#${messageId}`);
        if (!message) {
            console.warn('Message not found:', messageId);
            return false;
        }

        // Find all code blocks in the message
        const codeBlocks = message.querySelectorAll('pre code');
        console.log('Found code blocks:', codeBlocks.length);
        
        codeBlocks.forEach((codeBlock, index) => {
            // Check if copy button already exists
            const existingButton = codeBlock.parentElement.querySelector('.copy-button');
            if (existingButton) {
                console.log(`Code block ${index}: Copy button already exists`);
                return;
            }

            console.log(`Adding copy button to code block ${index}`);
            // Create copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            `;
            copyButton.setAttribute('aria-label', 'Copy code');
            copyButton.setAttribute('title', 'Copy code');

            // Add click handler
            copyButton.addEventListener('click', async () => {
                try {
                    const code = codeBlock.textContent;
                    await navigator.clipboard.writeText(code);
                    
                    // Show success state
                    copyButton.classList.add('copied');
                    copyButton.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    `;
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        copyButton.classList.remove('copied');
                        copyButton.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        `;
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy code:', err);
                }
            });

            // Add button to code block
            const pre = codeBlock.parentElement;
            pre.style.position = 'relative';
            pre.appendChild(copyButton);
            console.log(`Copy button added to code block ${index}`);
        });

        return true;
    }

    addCopyButtonToMessage(messageId) {
        console.log('Adding copy button to message:', messageId);
        const message = this.messageContainer.querySelector(`#${messageId}`);
        if (!message) {
            console.warn('Message not found:', messageId);
            return false;
        }

        // Check if copy button already exists
        const existingButton = message.querySelector('.message-copy-button');
        if (existingButton) {
            console.log('Message copy button already exists');
            return true;
        }

        console.log('Creating message copy button');
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'message-copy-button';
        copyButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
        `;
        copyButton.setAttribute('aria-label', 'Copy message');
        copyButton.setAttribute('title', 'Copy message');

        // Add click handler
        copyButton.addEventListener('click', async () => {
            try {
                const messageContent = message.textContent;
                await navigator.clipboard.writeText(messageContent);
                
                // Show success state
                copyButton.classList.add('copied');
                copyButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                `;
                
                // Reset after 2 seconds
                setTimeout(() => {
                    copyButton.classList.remove('copied');
                    copyButton.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    `;
                }, 2000);
            } catch (err) {
                console.error('Failed to copy message:', err);
            }
        });

        // Add button to message
        message.style.position = 'relative';
        message.appendChild(copyButton);
        console.log('Message copy button added');

        return true;
    }
}
