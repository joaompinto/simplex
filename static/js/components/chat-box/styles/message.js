export const messageStyles = `
    /* Message container */
    .chat-messages {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        overflow-y: auto;
        height: 100%;
        align-items: center;
        width: 100%;
    }

    /* Message styles */
    .chat-message {
        position: relative;
        padding: 1rem;
        margin: 0.5rem auto;
        border-radius: 0.5rem;
        line-height: 1.5;
        transition: background-color 0.3s ease;
        max-width: 80%;
        width: 100%;
        word-wrap: break-word;
        overflow-wrap: break-word;
    }

    .chat-message:last-child {
        margin-bottom: 0;
    }

    .chat-message.system {
        background: var(--system-message-bg);
        color: var(--system-message-text);
        font-style: italic;
        margin-left: auto;
        margin-right: auto;
    }

    .chat-message.sent {
        background-color: #2563eb;
        color: #ffffff;
        margin-left: auto;
        margin-right: auto;
    }

    .chat-message.sent pre,
    .chat-message.sent code {
        background-color: rgba(0, 0, 0, 0.3);
        color: #ffffff;
    }

    .chat-message.sent .copy-button {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
    }

    .chat-message.sent .copy-button:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .chat-message.sent .copy-button svg {
        stroke: #ffffff;
    }

    .chat-message.received {
        background-color: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
        margin-left: auto;
        margin-right: auto;
    }

    .chat-message.received.streaming {
        background-color: color-mix(in srgb, var(--vscode-editor-background) 97%, var(--vscode-editor-foreground) 3%);
    }

    .chat-message.error {
        background-color: color-mix(in srgb, var(--vscode-errorForeground) 10%, var(--vscode-editor-background) 90%);
        color: var(--vscode-editor-foreground);
        margin-left: auto;
        margin-right: auto;
    }

    /* Stream indicator */
    .stream-indicator {
        display: inline-block;
        width: 4px;
        height: 16px;
        background: var(--accent-color);
        margin-left: 4px;
        vertical-align: middle;
        animation: blink 1s infinite;
    }

    @keyframes blink {
        50% { opacity: 0; }
    }

    /* Card styles */
    .chat-card {
        background: var(--system-message-bg);
        color: var(--system-message-text);
        padding: 1.5rem;
        margin: auto;
        border-radius: 0.5rem;
        line-height: 1.5;
        max-width: 400px;
        width: 100%;
        word-wrap: break-word;
        overflow-wrap: break-word;
        border: 1px solid var(--border-color);
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .chat-card h1 {
        margin-top: 0;
        font-size: 1.2rem;
        color: var(--heading-color);
        margin-bottom: 1rem;
    }

    .card-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1.5rem;
        justify-content: center;
    }

    .card-actions button {
        padding: 0.5rem 1.5rem;
        border: none;
        border-radius: 0.25rem;
        background: var(--primary-color);
        color: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s ease;
    }

    .card-actions button:hover {
        background: var(--primary-color-hover);
        transform: translateY(-1px);
    }
`;
