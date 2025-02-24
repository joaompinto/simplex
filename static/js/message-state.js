export class MessageState {
    constructor() {
        this.currentMessageId = null;
        this.messageChain = new Map(); // Maps user message IDs to AI response IDs
    }

    startNewMessage(userInputId) {
        // Generate new message ID (delegate to chat box)
        this.currentMessageId = null; // Will be set by message manager
        return this.currentMessageId;
    }

    setCurrentMessageId(messageId) {
        this.currentMessageId = messageId;
    }

    linkMessages(userInputId, responseId) {
        this.messageChain.set(userInputId, responseId);
    }

    getResponseId(userInputId) {
        return this.messageChain.get(userInputId);
    }

    getUserInputId(responseId) {
        // Find the user input ID that maps to this response ID
        for (const [userInputId, respId] of this.messageChain.entries()) {
            if (respId === responseId) {
                return userInputId;
            }
        }
        return null;
    }

    hasResponse(userInputId) {
        return this.messageChain.has(userInputId);
    }

    clearCurrent() {
        this.currentMessageId = null;
    }

    clearResponse(userInputId) {
        this.messageChain.delete(userInputId);
        if (this.currentMessageId === this.getResponseId(userInputId)) {
            this.clearCurrent();
        }
    }

    getCurrentMessageId() {
        return this.currentMessageId;
    }
}
