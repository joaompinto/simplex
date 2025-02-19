export class MessageHandler {
    constructor(chatBox) {
        this.chatBox = chatBox;
        this.messages = this.chatBox.shadowRoot.querySelector('.chat-messages');
        console.log('MessageHandler initialized, messages container:', this.messages);
    }

    addMessage({ content, type = 'received', metadata = {}, isHtml = false }) {
        console.log('Adding message:', { content, type, metadata, isHtml });
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${type}`;
        
        content = String(content || '');
        messageElement.innerHTML = isHtml ? content : this.escapeHtml(content);
        
        const id = metadata.id || this.generateId();
        messageElement.id = id;
        
        this.messages.appendChild(messageElement);
        this.scrollToBottom();
        console.log('Message added with ID:', id);
        return id;
    }

    addMessageMD({ content, type = 'received', metadata = {} }) {
        console.log('Adding markdown message:', { content, type, metadata });
        try {
            content = String(content || '');
            console.log('Parsing markdown content:', content);
            const parsedContent = window.marked.parse(content);
            console.log('Parsed markdown result:', parsedContent);
            return this.addMessage({
                content: parsedContent,
                type,
                metadata,
                isHtml: true
            });
        } catch (error) {
            console.error('Error parsing markdown:', error);
            return this.addMessage({
                content,
                type,
                metadata,
                isHtml: false
            });
        }
    }

    updateMessageMD(messageId, content, append = false) {
        console.log('Updating markdown message:', { messageId, content, append });
        try {
            content = String(content || '');
            console.log('Parsing markdown update content:', content);
            const parsedContent = window.marked.parse(content);
            console.log('Parsed markdown update result:', parsedContent);
            return this.updateMessage(messageId, parsedContent, append);
        } catch (error) {
            console.error('Error parsing markdown update:', error);
            return this.updateMessage(messageId, content, append);
        }
    }

    updateMessage(messageId, content, append = false) {
        console.log('Updating message:', { messageId, content, append });
        const messageElement = this.messages.querySelector(`#${messageId}`);
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
        this.scrollToBottom();
        console.log('Message updated successfully');
        return true;
    }

    clearMessages() {
        console.log('Clearing all messages');
        while (this.messages.firstChild) {
            this.messages.removeChild(this.messages.firstChild);
        }
    }

    scrollToBottom() {
        this.messages.scrollTop = this.messages.scrollHeight;
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
}
