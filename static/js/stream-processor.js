export class StreamProcessor {
    constructor() {
        this.completeLines = [];
        this.currentBuffer = [];
        this.lastUpdateLength = 0;
    }

    processChunk(chunk) {
        const updates = [];
        
        for (let i = 0; i < chunk.length; i++) {
            const char = chunk[i];
            this.currentBuffer.push(char);
            
            // If we hit a newline or end of chunk, process the line
            if (char === '\n' || i === chunk.length - 1) {
                const line = this.currentBuffer.join('');
                this.completeLines.push(line);
                this.currentBuffer = [];
                
                // Always send the current content
                const allContent = this.completeLines.join('');
                if (allContent.length > this.lastUpdateLength) {
                    const update = {
                        type: 'content',
                        content: allContent,
                        isPartialLine: i === chunk.length - 1 && char !== '\n'
                    };
                    updates.push(update);
                    this.lastUpdateLength = allContent.length;
                }
            }
        }
        
        return updates;
    }

    processEndOfStream() {
        if (this.currentBuffer.length === 0 && this.completeLines.length === 0) {
            return null;
        }

        // Process any remaining content in the buffer
        if (this.currentBuffer.length > 0) {
            const line = this.currentBuffer.join('');
            this.completeLines.push(line);
            this.currentBuffer = [];
        }

        const finalContent = this.completeLines.join('');
        return {
            type: 'content',
            content: finalContent,
            isPartialLine: false
        };
    }

    clear() {
        this.completeLines = [];
        this.currentBuffer = [];
        this.lastUpdateLength = 0;
    }

    getCurrentContent() {
        return this.completeLines.join('') + this.currentBuffer.join('');
    }
}
