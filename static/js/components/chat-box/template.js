export function getTemplate() {
    return `
        <div class="chat-container">
            <div class="receiving-indicator">
                <span>Receiving</span>
                <div class="dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
                <button type="button" class="cancel-button">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input-container">
                <textarea 
                    id="chatInput" 
                    placeholder="Type your message here..."
                    rows="1"
                    autocomplete="off"
                ></textarea>
                <button id="sendButton" disabled>
                    <span class="send-icon">➤</span>
                </button>
            </div>
        </div>
    `;
}
