export const markdownStyles = `
    /* Links */
    .chat-message a {
        color: var(--link-color, #2196f3);
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: border-color 0.2s, opacity 0.2s;
    }

    .chat-message a:hover {
        border-bottom-color: var(--link-color, #2196f3);
        opacity: 0.8;
    }

    /* Headers */
    .chat-message h1,
    .chat-message h2,
    .chat-message h3,
    .chat-message h4,
    .chat-message h5,
    .chat-message h6 {
        color: var(--header-color, var(--text-color));
        margin: 1.5rem 0 1rem;
        line-height: 1.3;
    }

    .chat-message h1 { font-size: 1.8em; }
    .chat-message h2 { font-size: 1.5em; }
    .chat-message h3 { font-size: 1.3em; }
    .chat-message h4 { font-size: 1.2em; }
    .chat-message h5 { font-size: 1.1em; }
    .chat-message h6 { font-size: 1em; }

    /* Lists */
    .chat-message ul,
    .chat-message ol {
        padding-left: 1.5rem;
        margin: 0.5rem 0;
    }

    .chat-message li {
        margin: 0.3rem 0;
    }

    /* Blockquotes */
    .chat-message blockquote {
        border-left: 3px solid var(--blockquote-border, #666);
        margin: 1rem 0;
        padding: 0.5rem 0 0.5rem 1rem;
        color: var(--blockquote-text, var(--text-color-secondary, #666));
        background: var(--blockquote-bg, rgba(0, 0, 0, 0.05));
        border-radius: 0 0.3rem 0.3rem 0;
    }

    /* Tables */
    .chat-message table {
        border-collapse: collapse;
        margin: 1rem 0;
        width: 100%;
    }

    .chat-message th,
    .chat-message td {
        border: 1px solid var(--table-border, #ddd);
        padding: 0.5rem;
        text-align: left;
    }

    .chat-message th {
        background: var(--table-header-bg, rgba(0, 0, 0, 0.05));
        font-weight: 600;
    }

    .chat-message tr:nth-child(even) {
        background: var(--table-row-even, rgba(0, 0, 0, 0.02));
    }

    /* Inline Code */
    .chat-message code:not(pre code) {
        background: var(--inline-code-bg, rgba(0, 0, 0, 0.05));
        padding: 0.2em 0.4em;
        border-radius: 0.3rem;
        font-size: 0.9em;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    }

    /* Horizontal Rule */
    .chat-message hr {
        border: none;
        border-top: 1px solid var(--hr-color, #ddd);
        margin: 1.5rem 0;
    }

    /* Images */
    .chat-message img {
        max-width: 100%;
        border-radius: 0.3rem;
        margin: 1rem 0;
    }

    /* Task Lists */
    .chat-message input[type="checkbox"] {
        margin-right: 0.5rem;
    }

    /* Definition Lists */
    .chat-message dt {
        font-weight: 600;
        margin-top: 1rem;
    }

    .chat-message dd {
        margin-left: 1rem;
        margin-bottom: 0.5rem;
    }

    /* Emphasis */
    .chat-message em {
        color: var(--emphasis-color, inherit);
    }

    .chat-message strong {
        color: var(--strong-color, inherit);
        font-weight: 600;
    }

    /* Keyboard */
    .chat-message kbd {
        background: var(--kbd-bg, #f7f7f7);
        border: 1px solid var(--kbd-border, #ccc);
        border-radius: 3px;
        box-shadow: 0 1px 0 rgba(0,0,0,0.2);
        color: var(--kbd-color, #333);
        display: inline-block;
        font-size: 0.9em;
        line-height: 1;
        padding: 0.2em 0.4em;
        margin: 0 0.2em;
    }
`;
