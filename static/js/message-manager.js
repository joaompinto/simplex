import { WebSocketManager } from './websocket-manager.js';
import { MessageState } from './message-state.js';
import { StreamProcessor } from './stream-processor.js';

export class MessageManager extends EventTarget {
    constructor(chatBox = null) {
        super();
        this.chatBox = chatBox;
        this.websocket = new WebSocketManager();
        this.state = new MessageState();
        this.processor = new StreamProcessor();
        this.isStreaming = false;
        this.ignoredIds = new Set();

        // Setup WebSocket event handlers
        this.websocket.addEventListener('message', (event) => this.handleMessage(event.detail));
        this.websocket.addEventListener('error', (event) => this.handleError(event.detail.error));
        this.websocket.addEventListener('connection-status', (event) => {
            const { connected } = event.detail;
            if (this.chatBox) {
                this.chatBox.setInputEnabled(connected);
            }
            this.dispatchEvent(new CustomEvent('connection-status', { detail: { connected } }));
        });
    }

    setChatBox(chatBox) {
        this.chatBox = chatBox;
        if (chatBox) {
            console.log('[MessageManager] Setting up chat box event listeners');
            // Listen for message cancellations
            chatBox.addEventListener('messagecancel', (event) => {
                const messageId = event.detail.messageId;
                console.log('[MessageManager] Cancel requested for message:', messageId);
                
                if (messageId) {
                    // Find the user input ID that this response is for
                    const userInputId = this.state.getUserInputId(messageId);
                    console.log('[MessageManager] Found user input ID:', userInputId);
                    
                    if (userInputId) {
                        // Get current message content and append cancellation notice
                        const messageElement = this.chatBox?.messageHandler?.getMessageElement(messageId);
                        if (messageElement) {
                            // Add the user input ID to ignored set
                            this.ignoredIds.add(userInputId);
                            console.log('[MessageManager] Added to ignored IDs:', Array.from(this.ignoredIds));
                            
                            // Add cancellation notice
                            this.chatBox?.addNotice(messageId, {
                                type: 'cancelled',
                                text: 'Message cancelled by user'
                            });

                            // Send cancellation to server
                            this.websocket.send('cancel_stream', '', { user_input_id: userInputId });

                            // Stop streaming and clear processor state
                            this.chatBox?.messageHandler?.setMessageStreaming(messageId, false);
                            this.chatBox?.setReceiving(false);
                            this.processor.clear();
                            console.log('[MessageManager] Marked message as cancelled and cleared state:', messageId);
                        }
                    }
                }
            });
        }
    }

    get webSocketManager() {
        return this.websocket;
    }

    async connect() {
        try {
            await this.webSocketManager.connect();
            
            // Dispatch websocket connected event
            document.dispatchEvent(new CustomEvent('websocket-connected'));
            
            return true;
        } catch (error) {
            console.error('Failed to connect:', error);
            return false;
        }
    }

    handleError(error) {
        console.error('Error:', error);
        if (this.chatBox) {
            const errorId = this.chatBox.messageHandler?.generateId() || `error-${Date.now()}`;
            this.chatBox.addMessageMD({
                content: `Error: ${error.message}`,
                type: 'error',
                metadata: { id: errorId }
            });
        }
    }

    handleMessage(data) {
        try {
            if (data.type === 'error') {
                this.handleError(new Error(data.content));
                return;
            }

            const userInputId = data.metadata?.user_input_id;

            if (data.type === 'chunk') {
                // Don't process chunks for ignored messages
                if (!this.ignoredIds.has(userInputId)) {
                    this.handleChunk(data.content, userInputId);
                }
            } else if (data.type === 'end_stream') {
                this.handleEndStream(userInputId);
            } else if (data.type === 'stream_cancelled') {
                console.log('[MessageManager] Received cancellation confirmation for:', userInputId);
                // The server has confirmed the cancellation, we can clean up
                if (this.state.hasResponse(userInputId)) {
                    const responseId = this.state.getResponseId(userInputId);
                    // Don't clear the message, just mark it as not streaming
                    this.chatBox?.messageHandler?.setMessageStreaming(responseId, false);
                    this.chatBox?.setReceiving(false);
                    this.processor.clear();
                    this.state.clearResponse(userInputId);
                }
                // Clean up the ignored ID
                this.ignoredIds.delete(userInputId);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            this.handleError(error);
        }
    }

    handleChunk(content, userInputId) {
        console.log('[MessageManager] Handling chunk for user input:', userInputId);
        
        // Create new message if needed
        if (!this.state.hasResponse(userInputId)) {
            const messageId = this.chatBox?.messageHandler?.generateId() || `msg-${Date.now()}`;
            console.log('[MessageManager] Creating new message:', messageId);
            
            this.state.setCurrentMessageId(messageId);
            this.state.linkMessages(userInputId, messageId);
            
            // Create empty message and show receiving indicator
            this.chatBox?.setReceiving(true, messageId);
            try {
                this.chatBox?.addMessageMD({
                    content: '',
                    type: 'received',
                    metadata: {
                        id: messageId,
                        replyTo: userInputId,
                        timestamp: new Date().toISOString()
                    }
                });
            } catch (error) {
                console.warn('[MessageManager] Error creating initial message:', error);
                this.chatBox?.addMessage({
                    content: '',
                    type: 'received',
                    metadata: {
                        id: messageId,
                        replyTo: userInputId,
                        timestamp: new Date().toISOString()
                    }
                });
            }
        }

        // Process the chunk
        try {
            const updates = this.processor.processChunk(content);
            const responseId = this.state.getResponseId(userInputId);
            console.log('[MessageManager] Processing chunk for response:', responseId, 'user input:', userInputId);
            
            // Apply any updates, handling potential markdown errors
            for (const update of updates) {
                try {
                    if (update.metadata?.append_only) {
                        // For append_only updates (like cancellation), just append to existing content
                        const existingContent = this.chatBox?.messageHandler?.getMessageContent(responseId) || '';
                        this.chatBox?.updateMessageMD(responseId, existingContent + update.content);
                    } else {
                        this.chatBox?.updateMessageMD(responseId, update.content);
                    }
                } catch (error) {
                    console.warn('[MessageManager] Error updating markdown, falling back to plain text:', error);
                    // If markdown parsing fails, fall back to plain text
                    if (update.metadata?.append_only) {
                        const existingContent = this.chatBox?.messageHandler?.getMessageContent(responseId) || '';
                        this.chatBox?.updateMessage(responseId, existingContent + update.content);
                    } else {
                        this.chatBox?.updateMessage(responseId, update.content);
                    }
                }
            }
        } catch (error) {
            console.error('[MessageManager] Error processing chunk:', error);
            // Don't throw the error up, just log it and continue
        }
    }

    handleEndStream(userInputId) {
        console.log('[MessageManager] End stream for user input:', userInputId);
        
        if (this.state.hasResponse(userInputId)) {
            const responseId = this.state.getResponseId(userInputId);
            console.log('[MessageManager] Found response ID:', responseId);
            
            // Don't process if message was cancelled
            if (this.ignoredIds.has(userInputId)) {
                console.log('[MessageManager] Message was cancelled, cleaning up:', userInputId);
                this.ignoredIds.delete(userInputId);
                this.chatBox?.setReceiving(false);
                return;
            }
            
            // Process any remaining content
            const finalUpdate = this.processor.processEndOfStream();
            if (finalUpdate) {
                try {
                    this.chatBox?.updateMessageMD(responseId, finalUpdate.content);
                } catch (error) {
                    console.warn('[MessageManager] Error updating final markdown, falling back to plain text:', error);
                    this.chatBox?.updateMessage(responseId, finalUpdate.content);
                }
            }
            
            // Remove streaming indicator and hide receiving indicator
            if (this.chatBox?.messageHandler) {
                this.chatBox.messageHandler.setMessageStreaming(responseId, false);
            }
            this.chatBox?.setReceiving(false);
            
            // Add copy buttons
            if (this.chatBox) {
                this.chatBox.addCopyToMessage(responseId);
                this.chatBox.addCopyToBlocks(responseId);
            }
            
            // Clear state
            this.processor.clear();
            this.state.clearResponse(userInputId);
            console.log('[MessageManager] Stream completed for:', responseId);
        }
    }

    async sendMessage(content, metadata = {}) {
        if (!this.websocket.isConnected) {
            throw new Error('WebSocket not connected');
        }

        this.isStreaming = true;
        this.processor.clear();

        // Create a placeholder response message
        const messageId = this.chatBox?.messageHandler?.generateId() || `msg-${Date.now()}`;
        this.state.setCurrentMessageId(messageId);
        this.state.linkMessages(metadata.user_input_id, messageId);
        
        // Add empty message with streaming indicator
        this.chatBox?.addMessageMD({
            content: '...',  // Placeholder content
            type: 'received',
            metadata: {
                id: messageId,
                replyTo: metadata.user_input_id,
                timestamp: new Date().toISOString()
            },
            streaming: true,
            className: 'placeholder'  // Add class for styling
        });

        // Send the message
        await this.websocket.send('message', content, metadata);
    }
}

// Create and export singleton instance
export const messageManager = new MessageManager();
