export class MessageManager extends EventTarget {
    constructor(chatBox) {
        super();
        this.chatBox = chatBox;
        this.currentBuffer = [];
        this.currentMessageId = null;
        this.currentUserInputId = null;
        this.isStreaming = false;
        this.isConfigured = false;
        this.isConfigError = false;
        this.ws = null;
        this.connect();
    }

    connect() {
        try {
            if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
                return; // Already connected or connecting
            }

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.hostname + (window.location.port ? ':' + window.location.port : '');
            this.ws = new WebSocket(`${protocol}//${host}/api/ws`);
            
            this.setupWebSocketHandlers();
        } catch (error) {
            console.error('Error connecting:', error);
            this.handleError(error);
        }
    }

    setupWebSocketHandlers() {
        if (!this.ws) return;

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            if (this.chatBox) {
                this.chatBox.setInputEnabled(true);
            }
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'error') {
                    this.handleError(new Error(data.content));
                    return;
                }

                if (data.type === 'chunk') {
                    this.appendChunk(data.content);
                } else if (data.type === 'status') {
                    if (data.content === 'processing') {
                        if (!this.currentMessageId) {
                            this.startNewMessage();
                        }
                    } else if (data.content === 'complete') {
                        this.completeMessage();
                    }
                }
            } catch (error) {
                console.error('Error processing message:', error);
                this.handleError(error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.handleError(error);
        };

        this.ws.onclose = () => {
            console.log('WebSocket closed');
            if (this.chatBox) {
                this.chatBox.setInputEnabled(false);
            }
        };
    }

    startNewMessage() {
        this.currentMessageId = null;
        this.currentBuffer = [];
        this.isStreaming = true;

        if (this.chatBox) {
            this.currentMessageId = this.chatBox.addMessageMD({
                content: '',
                type: 'received',
                metadata: { 
                    id: this.currentMessageId,
                    timestamp: new Date().toISOString() 
                }
            });
        }

        this.dispatchEvent(new CustomEvent('messageStart', {
            detail: {
                messageId: this.currentMessageId,
                metadata: {
                    user_input_id: this.currentUserInputId
                }
            }
        }));
    }

    appendChunk(chunk) {
        if (!this.isStreaming || !this.currentMessageId) return;

        chunk = String(chunk || '');

        if (chunk.includes('\n')) {
            const lines = chunk.split('\n');
            
            if (this.currentBuffer.length > 0) {
                const combinedLine = this.currentBuffer[this.currentBuffer.length - 1] + lines[0];
                this.currentBuffer[this.currentBuffer.length - 1] = combinedLine;
                lines.shift();
            }

            this.currentBuffer.push(...lines);

            if (this.chatBox) {
                this.chatBox.updateMessageMD(this.currentMessageId, this.currentBuffer.join('\n'));
            }

            this.dispatchEvent(new CustomEvent('newLines', {
                detail: {
                    messageId: this.currentMessageId,
                    lines: this.currentBuffer
                }
            }));
        } else {
            if (this.currentBuffer.length === 0) {
                this.currentBuffer.push(chunk);
            } else {
                const lastLine = this.currentBuffer[this.currentBuffer.length - 1] + chunk;
                this.currentBuffer[this.currentBuffer.length - 1] = lastLine;
            }
            
            if (this.chatBox) {
                this.chatBox.updateMessageMD(this.currentMessageId, this.currentBuffer.join('\n'));
            }
        }
    }

    handleSubmittedMessage({ content, messageId }) {
        this.currentUserInputId = messageId;
        
        try {
            this.ws.send(JSON.stringify({
                type: 'message',
                content,
                metadata: {
                    user_input_id: messageId
                }
            }));
        } catch (error) {
            console.error('Error sending message:', error);
            this.handleError(error);
        }
    }

    submitMessage(content) {
        if (!content.trim() || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const userMessageId = this.chatBox.addMessage({
            content,
            type: 'sent',
            metadata: { timestamp: new Date().toISOString() }
        });

        this.currentUserInputId = userMessageId;
        this.isStreaming = true;
        this.currentBuffer = [];
        this.currentMessageId = null;

        this.ws.send(JSON.stringify({ content }));
    }

    handleError(error) {
        this.clear();
        this.dispatchEvent(new CustomEvent('error', {
            detail: { 
                content: error.message || 'An error occurred',
                messageId: this.currentMessageId,
                metadata: {
                    user_input_id: this.currentUserInputId
                }
            }
        }));
    }

    completeMessage() {
        if (!this.isStreaming || !this.currentMessageId) return;
        
        if (this.currentBuffer.length > 0) {
            const content = this.currentBuffer.join('\n');
            if (this.chatBox) {
                this.chatBox.updateMessageMD(this.currentMessageId, content);
            }
        }

        this.dispatchEvent(new CustomEvent('messageComplete', {
            detail: {
                messageId: this.currentMessageId,
                metadata: {
                    user_input_id: this.currentUserInputId
                }
            }
        }));

        this.clear();
    }

    clear() {
        this.currentBuffer = [];
        this.isStreaming = false;
        this.currentMessageId = null;
        this.currentUserInputId = null;
        this.dispatchEvent(new CustomEvent('messageCleared'));
    }
}

export const messageManager = new MessageManager();
