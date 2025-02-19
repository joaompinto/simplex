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

    .chat-message.system {
        background: var(--system-message-bg, var(--bg-color-secondary, #f0f0f0));
        border: 1px solid var(--system-message-border, var(--border-color, #ddd));
        font-family: var(--system-font, monospace);
        width: fit-content;
        min-width: 300px;
        max-width: 80%;
        padding: 1rem;
        margin: 0 auto;
        color: var(--text-color);
    }

    .chat-message.system.error {
        max-width: 100%;
        width: 100%;
        background: var(--error-bg, #ffebee);
        border-color: var(--error-border, #ef9a9a);
        color: var(--error-text, #c62828);
    }

    .chat-message.system h1 {
        font-size: 1.2rem;
        margin: 0 0 1rem 0;
        color: var(--heading-color, var(--text-color));
        border-bottom: 1px solid var(--system-message-border, var(--border-color, #ddd));
        padding-bottom: 0.5rem;
    }

    .chat-message.system h3 {
        font-size: 1rem;
        margin: 1rem 0 0.5rem 0;
        color: var(--heading-color, var(--text-color));
    }

    .chat-message.system code {
        background: var(--code-bg, var(--bg-color, #e0e0e0));
        padding: 0.2rem 0.4rem;
        border-radius: 0.25rem;
        font-family: var(--system-font, monospace);
        color: var(--code-color, var(--text-color));
    }

    .chat-message.system em {
        color: var(--text-color-secondary, var(--text-color));
        font-style: italic;
        display: block;
        margin-top: 1rem;
        text-align: center;
        font-size: 0.9rem;
    }

    .chat-message p {
        margin: 0;
        line-height: 1.5;
    }

    .chat-message p + p {
        margin-top: 1rem;
    }

    .message-content {
        font-size: 1rem;
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-word;
        margin: 0;
    }

    .message-content p:first-child {
        margin-top: 0;
    }

    .message-content p:last-child {
        margin-bottom: 0;
    }

    .message.with-copy-button {
        padding-right: 2.5rem;
    }
`;
