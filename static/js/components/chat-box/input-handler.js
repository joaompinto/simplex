import { messageIdGenerator } from './id-generator.js';

export class InputHandler {
    constructor(chatBox) {
        this.chatBox = chatBox;
        this.input = this.chatBox.shadowRoot.querySelector('#chatInput');
        this.sendButton = this.chatBox.shadowRoot.querySelector('#sendButton');
        console.log('InputHandler initialized:', {
            input: this.input,
            sendButton: this.sendButton
        });
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Input event listeners
        this.input.addEventListener('input', () => this.handleInput());
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Send button event listener
        this.sendButton.addEventListener('click', () => this.handleSubmit());
        console.log('Event listeners initialized');
    }

    handleInput() {
        const content = this.input.value.trim();
        this.sendButton.disabled = content.length === 0;
        
        // Auto-resize textarea
        this.input.style.height = 'auto';
        this.input.style.height = Math.min(this.input.scrollHeight, 200) + 'px';
    }

    handleKeydown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            console.log('Enter key pressed, submitting message');
            this.handleSubmit();
        }
    }

    handleSubmit() {
        const content = this.input.value.trim();
        if (!content) return;

        console.log('Submitting message:', content);

        // Generate unique message ID
        const messageId = messageIdGenerator.generate();

        // Emit message-sent event
        this.chatBox.dispatchEvent(new CustomEvent('message-sent', {
            detail: {
                content,
                messageId
            },
            bubbles: true,
            composed: true
        }));

        // Clear input
        this.input.value = '';
        this.input.style.height = 'auto';
        this.sendButton.disabled = true;
    }

    setEnabled(enabled) {
        console.log('Setting input enabled:', enabled);
        this.input.disabled = !enabled;
        if (!enabled) {
            this.sendButton.disabled = true;
        } else {
            this.handleInput();
        }
    }
}
