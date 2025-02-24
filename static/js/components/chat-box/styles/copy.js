export const copyStyles = `
    /* Message copy button */
    .message-copy-button {
        position: absolute;
        top: 8px;
        right: 8px;
        padding: 4px;
        background: var(--chat-code-button-bg, rgba(255, 255, 255, 0.1));
        border: 1px solid var(--chat-code-button-border, rgba(255, 255, 255, 0.2));
        border-radius: 4px;
        color: var(--chat-code-button-color, rgba(255, 255, 255, 0.8));
        cursor: pointer;
        opacity: 0;
        transition: all 0.2s ease-in-out;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .message-copy-button:hover {
        background: var(--chat-code-button-hover-bg, rgba(255, 255, 255, 0.2));
    }

    .message-copy-button.copied {
        background: var(--chat-code-button-success-bg, rgba(40, 167, 69, 0.25));
        border-color: var(--chat-code-button-success-border, rgba(40, 167, 69, 0.5));
        color: var(--chat-code-button-success-color, rgb(40, 167, 69));
    }

    /* Show copy button on message hover with higher opacity for better visibility */
    .chat-message:hover .message-copy-button {
        opacity: 0.8;
    }

    /* Code block copy button */
    .code-block-wrapper {
        position: relative;
    }

    .code-block-wrapper .message-copy-button {
        top: 4px;
        right: 4px;
        opacity: 0;
    }

    .code-block-wrapper:hover .message-copy-button {
        opacity: 0.8;
    }

    /* Increase opacity on button hover */
    .message-copy-button:hover {
        opacity: 1 !important;
    }

    /* Dark theme adjustments */
    [data-theme="dark"] .message-copy-button {
        background: var(--chat-code-button-bg, rgba(255, 255, 255, 0.1));
        border-color: var(--chat-code-button-border, rgba(255, 255, 255, 0.2));
        color: var(--chat-code-button-color, rgba(255, 255, 255, 0.8));
    }

    [data-theme="dark"] .message-copy-button:hover {
        background: var(--chat-code-button-hover-bg, rgba(255, 255, 255, 0.2));
    }

    [data-theme="dark"] .message-copy-button.copied {
        background: var(--chat-code-button-success-bg, rgba(40, 167, 69, 0.25));
        border-color: var(--chat-code-button-success-border, rgba(40, 167, 69, 0.5));
        color: var(--chat-code-button-success-color, rgb(40, 167, 69));
    }
`;
