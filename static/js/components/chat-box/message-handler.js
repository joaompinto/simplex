export class MessageHandler {
    constructor(messageContainer) {
        if (!messageContainer) throw new Error('Message container is required');
        this.messageContainer = messageContainer;
        this.autoScrollEnabled = true;
        
        // Listen for user scroll interactions
        this.messageContainer.addEventListener('wheel', () => {
            this.autoScrollEnabled = false;
        });
        
        this.messageContainer.addEventListener('mousedown', (e) => {
            // Only handle clicks on the scrollbar
            if (e.offsetX > this.messageContainer.clientWidth) {
                this.autoScrollEnabled = false;
            }
        });
        
        // Re-enable auto-scroll when manually scrolled to bottom
        this.messageContainer.addEventListener('scroll', () => {
            const maxScroll = this.messageContainer.scrollHeight - this.messageContainer.clientHeight;
            const currentScroll = Math.ceil(this.messageContainer.scrollTop);
            if (maxScroll - currentScroll <= 2) {
                this.autoScrollEnabled = true;
            }
        });
        
        // Create ResizeObserver for size changes
        this.resizeObserver = new ResizeObserver(() => {
            if (this.autoScrollEnabled) {
                this.scrollToBottom();
            }
        });

        // Create MutationObserver for DOM changes (like syntax highlighting)
        this.mutationObserver = new MutationObserver((mutations) => {
            // Check if any mutations affect code blocks
            const hasCodeChanges = mutations.some(mutation => {
                return mutation.target.tagName === 'PRE' || 
                       mutation.target.tagName === 'CODE' ||
                       mutation.target.closest('pre, code');
            });

            if (hasCodeChanges && this.autoScrollEnabled) {
                this.scrollToBottom();
            }
        });

        // Observe both childList and subtree changes
        this.mutationObserver.observe(messageContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        });
    }

    scrollToBottom() {
        if (!this.messageContainer) return;
        
        const maxScroll = this.messageContainer.scrollHeight - this.messageContainer.clientHeight;
        this.messageContainer.scrollTop = maxScroll;

        // Double-check scroll position after a short delay
        setTimeout(() => {
            if (this.autoScrollEnabled) {
                this.messageContainer.scrollTop = this.messageContainer.scrollHeight - this.messageContainer.clientHeight;
            }
        }, 50);
    }

    addMessage({ content, type = 'received', metadata = {}, isHtml = false, className = '' }) {
        const messageId = metadata.id || this.generateMessageId();
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${type} ${className}`;
        messageElement.id = messageId;
        
        if (isHtml) {
            messageElement.innerHTML = content;
        } else {
            messageElement.textContent = content;
        }

        this.messageContainer.appendChild(messageElement);
        this.resizeObserver.observe(messageElement);
        
        if (this.autoScrollEnabled) {
            this.scrollToBottom();
        }

        return messageId;
    }

    addMessageMD({ content, type = 'received', metadata = {}, className = '' }) {
        try {
            const parsedContent = window.marked.parse(content || '');
            const messageId = this.addMessage({
                content: parsedContent,
                type,
                metadata,
                isHtml: true,
                className
            });
            return messageId;
        } catch (error) {
            console.error('Error parsing markdown:', error);
            return this.addMessage({
                content: 'Error rendering message',
                type: 'error',
                metadata
            });
        }
    }

    updateMessage(messageId, content, append = false) {
        const messageElement = this.messageContainer.querySelector(`#${messageId}`);
        if (!messageElement) return false;
        
        content = String(content || '');
        
        if (append) {
            messageElement.innerHTML += content;
        } else {
            messageElement.innerHTML = content;
        }

        // Preserve stream indicator if it exists
        const existingIndicator = messageElement.querySelector('.stream-indicator');
        if (existingIndicator) {
            messageElement.appendChild(existingIndicator);
        }

        if (this.autoScrollEnabled) {
            this.scrollToBottom();
        }
        return messageElement;
    }

    updateMessageMD(messageId, content, append = false) {
        try {
            content = String(content || '');
            const parsedContent = window.marked.parse(content);
            return this.updateMessage(messageId, parsedContent, append);
        } catch (error) {
            console.error('Error parsing markdown:', error);
            return this.updateMessage(
                messageId,
                'Error rendering message',
                append
            );
        }
    }

    updateMessage(messageId, content) {
        const message = this.messageContainer.querySelector(`#${messageId}`);
        if (message) {
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
        }
    }

    setMessageStreaming(messageId, streaming) {
        const messageElement = this.messageContainer.querySelector(`#${messageId}`);
        if (!messageElement) return false;

        if (streaming) {
            messageElement.classList.add('streaming');
        } else {
            messageElement.classList.remove('streaming');
        }

        const existingIndicator = messageElement.querySelector('.stream-indicator');
        if (streaming && !existingIndicator) {
            const indicator = document.createElement('span');
            indicator.className = 'stream-indicator';
            messageElement.appendChild(indicator);
        } else if (!streaming && existingIndicator) {
            existingIndicator.remove();
        }
        return true;
    }

    addCard({ content, actions = [], metadata = {} }) {
        const cardElement = document.createElement('div');
        cardElement.className = 'chat-card';
        cardElement.innerHTML = content;

        if (actions && actions.length > 0) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'card-actions';
            actions.forEach(action => {
                const button = document.createElement('button');
                button.textContent = action.text;
                button.onclick = action.handler;
                actionsContainer.appendChild(button);
            });
            cardElement.appendChild(actionsContainer);
        }

        const id = metadata.id || this.generateId();
        cardElement.id = id;
        
        this.messageContainer.appendChild(cardElement);
        
        if (this.autoScrollEnabled) {
            this.scrollToBottom();
        }
        return id;
    }

    removeCard(cardId) {
        const card = this.messageContainer.querySelector(`#${cardId}`);
        if (card) {
            card.remove();
            return true;
        }
        return false;
    }

    clearMessages() {
        while (this.messageContainer.firstChild) {
            this.messageContainer.removeChild(this.messageContainer.firstChild);
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
        const messageElement = this.messageContainer.querySelector(`#${messageId}`);
        if (!messageElement) return;

        // Remove existing copy buttons first
        messageElement.querySelectorAll('.copy-button').forEach(btn => btn.remove());

        // Add copy buttons to code blocks
        const codeBlocks = messageElement.querySelectorAll('pre code');
        codeBlocks.forEach(codeBlock => {
            const pre = codeBlock.parentElement;
            if (!pre.querySelector('.copy-button')) {
                const copyButton = document.createElement('button');
                copyButton.className = 'copy-button';
                copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>`;

                copyButton.addEventListener('click', async () => {
                    try {
                        await navigator.clipboard.writeText(codeBlock.textContent);
                        copyButton.classList.add('copied');
                        setTimeout(() => copyButton.classList.remove('copied'), 2000);
                    } catch (err) {
                        console.error('Failed to copy code:', err);
                    }
                });

                pre.appendChild(copyButton);
            }
        });
    }

    addCopyButtonToMessage(messageId) {
        const messageElement = this.messageContainer.querySelector(`#${messageId}`);
        if (!messageElement || messageElement.querySelector('.message-copy-button')) return;

        const copyButton = document.createElement('button');
        copyButton.className = 'message-copy-button';
        copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>`;

        copyButton.addEventListener('click', async () => {
            try {
                const textContent = messageElement.textContent;
                await navigator.clipboard.writeText(textContent);
                copyButton.classList.add('copied');
                setTimeout(() => copyButton.classList.remove('copied'), 2000);
            } catch (err) {
                console.error('Failed to copy message:', err);
            }
        });

        messageElement.classList.add('with-copy-button');
        messageElement.appendChild(copyButton);
    }

    getMessageElement(messageId) {
        return this.messageContainer.querySelector(`#${messageId}`);
    }
}
