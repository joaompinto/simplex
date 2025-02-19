export const styles = `
    :host {
        display: block;
        height: 100%;
        background: var(--bg-color);
        color: var(--text-color);
        border: 1px solid var(--input-border);
        border-radius: 8px;
        overflow: hidden;
    }

    .chat-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        background-color: var(--bg-color);
    }

    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .chat-message {
        max-width: 80%;
        padding: 0.75rem 1rem;
        border-radius: 1rem;
        word-break: break-word;
        align-self: flex-start;
        background-color: var(--chat-received-bg);
        color: var(--text-color);
    }

    .chat-message.sent {
        background-color: var(--chat-sent-bg);
        color: var(--text-color);
        border-bottom-left-radius: 0.25rem;
        align-self: flex-end;
    }

    .chat-message.received {
        background-color: var(--chat-received-bg);
        color: var(--text-color);
        border-bottom-right-radius: 0.25rem;
    }

    .chat-message.system {
        align-self: center;
        background-color: var(--chat-system-bg);
        color: var(--text-color);
        border-radius: 0.5rem;
        font-style: italic;
        max-width: 100%;
    }

    /* Markdown styles */
    .chat-message p {
        margin: 0.5rem 0;
    }

    .chat-message ul, .chat-message ol {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
    }

    .chat-message blockquote {
        border-left: 3px solid var(--text-color);
        margin: 0.5rem 0;
        padding-left: 1rem;
        opacity: 0.8;
    }

    .chat-message table {
        border-collapse: collapse;
        margin: 0.5rem 0;
        width: 100%;
    }

    .chat-message th, .chat-message td {
        border: 1px solid var(--text-color);
        padding: 0.5rem;
    }

    .chat-message img {
        max-width: 100%;
        height: auto;
        border-radius: 0.25rem;
    }

    .chat-input-container {
        display: flex;
        gap: 0.5rem;
        padding: 1rem;
        background-color: var(--bg-color);
        border-top: 1px solid var(--input-border);
    }

    #chatInput {
        flex: 1;
        min-height: 40px;
        max-height: 200px;
        padding: 0.75rem;
        border: 1px solid var(--input-border);
        border-radius: 8px;
        resize: none;
        font-family: inherit;
        font-size: 1rem;
        line-height: 1.5;
        background-color: var(--input-bg);
        color: var(--text-color);
    }

    #chatInput:disabled {
        background-color: var(--chat-disabled-bg);
        cursor: not-allowed;
    }

    #chatInput:focus {
        outline: none;
        border-color: var(--button-bg);
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
    }

    #sendButton {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        background-color: var(--button-bg);
        color: var(--button-text);
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    #sendButton:hover:not(:disabled) {
        background-color: var(--button-hover-bg);
    }

    #sendButton:disabled {
        background-color: var(--button-disabled-bg);
        color: var(--button-disabled-text);
        cursor: not-allowed;
    }

    .send-icon {
        font-size: 1.2em;
        line-height: 1;
    }

    /* Scrollbar Styling */
    .chat-messages::-webkit-scrollbar {
        width: 8px;
    }

    .chat-messages::-webkit-scrollbar-track {
        background: var(--bg-color);
        border-radius: 4px;
    }

    .chat-messages::-webkit-scrollbar-thumb {
        background: var(--input-border);
        border-radius: 4px;
    }

    .chat-messages::-webkit-scrollbar-thumb:hover {
        background: var(--button-bg);
    }

    /* Card Styles */
    .chat-card {
        align-self: center;
        width: 90%;
        max-width: 500px;
        margin: 1rem;
        padding: 1.5rem;
        background-color: var(--chat-system-bg);
        border: 1px solid var(--input-border);
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .chat-card-content {
        text-align: center;
        margin-bottom: 1.5rem;
        color: var(--text-color);
        font-size: 1.1rem;
        line-height: 1.5;
    }

    .chat-card-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
    }

    .chat-card button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        background-color: var(--button-bg);
        color: var(--button-text);
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
    }

    .chat-card button:hover {
        background-color: var(--button-hover-bg);
    }

    /* Code styles */
    .chat-message pre {
        background-color: var(--code-bg);
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin: 0.5rem 0;
    }

    .chat-message code {
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 0.9em;
        color: var(--text-color);
        white-space: pre;
    }

    .chat-message code.inline-code {
        display: inline;
        padding: 0.2rem 0.4rem;
        border-radius: 0.25rem;
        background-color: var(--code-bg);
        white-space: pre-wrap;
    }
`;
