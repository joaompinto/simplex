/**
 * Utility class for generating unique message IDs
 */
export class IdGenerator {
    constructor(prefix = 'msg') {
        this.prefix = prefix;
        this.counter = 0;
        this.lastTimestamp = 0;
    }

    /**
     * Generate a unique ID combining:
     * - prefix
     * - timestamp (base36)
     * - counter (for same-millisecond uniqueness)
     */
    generate() {
        const timestamp = Date.now();
        
        // If we're in the same millisecond, increment counter
        // Otherwise reset counter
        if (timestamp === this.lastTimestamp) {
            this.counter++;
        } else {
            this.counter = 0;
            this.lastTimestamp = timestamp;
        }

        // Convert timestamp to base36 for shorter string
        const timestampStr = timestamp.toString(36);
        // Pad counter with zeros
        const counterStr = this.counter.toString().padStart(3, '0');
        
        return `${this.prefix}-${timestampStr}-${counterStr}`;
    }
}

// Export a singleton instance for message IDs
export const messageIdGenerator = new IdGenerator('msg');
