export const containerStyles = `
    /* Host styles */
    :host {
        display: block;
        height: 100%;
        width: 100%;
        background: var(--bg-color);
        overflow: hidden;
    }

    /* Container styles */
    .chat-container {
        height: 100%;
        width: 100%;
        padding: 20px;
        box-sizing: border-box;
        background: var(--chat-bg);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    /* Messages container */
    .chat-messages {
        flex: 1;
        min-height: 0;
        width: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        background: var(--messages-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        scrollbar-width: thin;
        scrollbar-color: var(--border-color) var(--messages-bg);
        box-sizing: border-box;
        scroll-behavior: smooth;
    }
`;
