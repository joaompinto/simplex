export function getTemplate() {
    return `
        <div class="chat-container">
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
