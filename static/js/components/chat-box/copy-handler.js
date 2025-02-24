export class CopyHandler {
    constructor(shadowRoot) {
        this.shadowRoot = shadowRoot;
    }

    addCopyToMessage(messageId) {
        const messageElement = this.shadowRoot.querySelector(`#${messageId}`);
        if (!messageElement) return;

        const button = document.createElement('button');
        button.className = 'message-copy-button';
        button.innerHTML = this.getCopyIcon();
        button.title = 'Copy message';
        
        button.addEventListener('click', async () => {
            try {
                // Get text content, excluding copy buttons
                const content = messageElement.cloneNode(true);
                content.querySelectorAll('.message-copy-button').forEach(btn => btn.remove());
                await navigator.clipboard.writeText(content.textContent);
                
                // Show feedback
                button.classList.add('copied');
                button.innerHTML = this.getCheckIcon();
                setTimeout(() => {
                    button.classList.remove('copied');
                    button.innerHTML = this.getCopyIcon();
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });

        messageElement.appendChild(button);
    }

    addCopyToBlocks(messageId) {
        const messageElement = this.shadowRoot.querySelector(`#${messageId}`);
        if (!messageElement) return;

        // Add copy buttons to all code blocks
        messageElement.querySelectorAll('pre').forEach(preElement => {
            // Only add if we haven't already added a copy button
            if (!preElement.querySelector('.message-copy-button')) {
                preElement.classList.add('code-block-wrapper');
                
                const button = document.createElement('button');
                button.className = 'message-copy-button';
                button.innerHTML = this.getCopyIcon();
                button.title = 'Copy code';
                
                button.addEventListener('click', async () => {
                    try {
                        const codeElement = preElement.querySelector('code');
                        const text = codeElement ? codeElement.textContent : preElement.textContent;
                        await navigator.clipboard.writeText(text);
                        
                        // Show feedback
                        button.classList.add('copied');
                        button.innerHTML = this.getCheckIcon();
                        setTimeout(() => {
                            button.classList.remove('copied');
                            button.innerHTML = this.getCopyIcon();
                        }, 2000);
                    } catch (err) {
                        console.error('Failed to copy code:', err);
                    }
                });

                preElement.appendChild(button);
            }
        });
    }

    getCopyIcon() {
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>`;
    }

    getCheckIcon() {
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>`;
    }
}
