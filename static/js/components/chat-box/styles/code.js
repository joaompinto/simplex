export const codeStyles = `
    /* Code block styles */
    .chat-message pre {
        background-color: var(--chat-code-bg, #282c34);
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin: 0.5rem 0;
        border: 1px solid var(--chat-code-border, #3e4451);
        position: relative;
    }

    .chat-message pre code.hljs {
        background: transparent;
        padding: 0;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 0.9em;
        line-height: 1.5;
    }

    /* Copy button styles */
    .copy-button {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        padding: 0.5rem;
        background: var(--chat-code-button-bg, rgba(255, 255, 255, 0.1));
        border: 1px solid var(--chat-code-button-border, rgba(255, 255, 255, 0.2));
        border-radius: 0.3rem;
        color: var(--chat-code-button-color, rgba(255, 255, 255, 0.8));
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s, background-color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .chat-message pre:hover .copy-button {
        opacity: 1;
    }

    .copy-button:hover {
        background: var(--chat-code-button-hover-bg, rgba(255, 255, 255, 0.2));
    }

    .copy-button.copied {
        background: var(--chat-code-button-success-bg, rgba(40, 167, 69, 0.25));
        border-color: var(--chat-code-button-success-border, rgba(40, 167, 69, 0.5));
        color: var(--chat-code-button-success-color, rgb(40, 167, 69));
    }

    .copy-button svg {
        width: 16px;
        height: 16px;
    }

    /* Syntax highlighting */
    .hljs {
        color: #abb2bf;
    }

    .hljs-comment,
    .hljs-quote {
        color: #5c6370;
        font-style: italic;
    }

    .hljs-doctag,
    .hljs-formula,
    .hljs-keyword {
        color: #c678dd;
    }

    .hljs-deletion,
    .hljs-name,
    .hljs-section,
    .hljs-selector-tag,
    .hljs-subst {
        color: #e06c75;
    }

    .hljs-literal {
        color: #56b6c2;
    }

    .hljs-addition,
    .hljs-attribute,
    .hljs-meta .hljs-string,
    .hljs-regexp,
    .hljs-string {
        color: #98c379;
    }

    .hljs-attr,
    .hljs-number,
    .hljs-selector-attr,
    .hljs-selector-class,
    .hljs-selector-pseudo,
    .hljs-template-variable,
    .hljs-type,
    .hljs-variable {
        color: #d19a66;
    }

    .hljs-bullet,
    .hljs-link,
    .hljs-meta,
    .hljs-selector-id,
    .hljs-symbol,
    .hljs-title {
        color: #61aeee;
    }

    .hljs-built_in,
    .hljs-class .hljs-title,
    .hljs-title.class_ {
        color: #e6c07b;
    }

    .hljs-emphasis {
        font-style: italic;
    }

    .hljs-strong {
        font-weight: bold;
    }
`;
