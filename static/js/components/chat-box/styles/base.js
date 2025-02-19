export const baseStyles = `
    :host {
        display: block;
        height: 100%;
        background: var(--bg-color);
        width: 100%;
    }

    .chat-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 1rem;
        gap: 1rem;
        box-sizing: border-box;
        background: var(--chat-bg);
        color: var(--text-color);
    }

    .chat-messages {
        flex-grow: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        border: 1px solid var(--border-color);
        border-radius: 0.5rem;
        background: var(--messages-bg);
    }

    .chat-message {
        padding: 1rem;
        border-radius: 0.5rem;
        max-width: 80%;
        position: relative;
        margin-right: auto;
    }

    .chat-message.sent {
        background: var(--sent-message-bg);
        color: var(--sent-message-text);
    }

    .chat-message.received {
        background: var(--received-message-bg);
        color: var(--received-message-text);
    }

    .chat-message p {
        margin: 0;
        line-height: 1.5;
    }

    .chat-message p + p {
        margin-top: 1rem;
    }
`;
