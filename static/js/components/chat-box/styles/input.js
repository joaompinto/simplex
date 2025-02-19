export const inputStyles = `
    .chat-input-container {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid var(--border-color);
        border-radius: 0.5rem;
        background: var(--input-bg);
        width: 100%;
        box-sizing: border-box;
    }

    .input-wrapper {
        flex-grow: 1;
        position: relative;
        width: 100%;
    }

    textarea {
        width: 100%;
        height: 24px;
        min-height: 24px;
        max-height: 200px;
        padding: 0.25rem 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 0.5rem;
        background: var(--textarea-bg);
        color: var(--text-color);
        font-family: inherit;
        font-size: 1rem;
        line-height: 1.5;
        resize: none;
        overflow-y: hidden;
        box-sizing: border-box;
    }

    textarea:focus {
        outline: none;
        border-color: var(--focus-color);
    }

    #sendButton {
        padding: 0.25rem 1rem;
        background-color: var(--button-bg);
        color: var(--button-text);
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.2s;
        min-width: 60px;
        align-self: center;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    #sendButton:hover {
        background-color: var(--button-hover-bg);
    }

    #sendButton:disabled {
        background-color: var(--button-disabled-bg);
        color: var(--button-disabled-text);
        cursor: not-allowed;
    }
`;
