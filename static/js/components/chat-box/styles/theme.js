export const themeStyles = `
    /* Light theme (default) */
    :host {
        --bg-color: #ffffff;
        --text-color: #333333;
        --text-color-secondary: #666666;
        --border-color: #e0e0e0;
        --chat-bg: var(--bg-color);
        --messages-bg: var(--bg-color);

        /* Messages */
        --messages-bg: #ffffff;
        --sent-message-bg: #e3f2fd;
        --sent-message-text: var(--text-color);
        --received-message-bg: #f5f5f5;
        --received-message-text: var(--text-color);
        --system-message-bg: #fff3e0;
        --system-message-text: #e65100;
        --error-bg: #ffebee;
        --error-text: #c62828;
        --error-border: #ef9a9a;

        /* Input area */
        --input-bg: #ffffff;
        --input-text: var(--text-color);
        --input-border: var(--border-color);
        --input-focus-border: #2196f3;
        --input-placeholder: #999999;

        /* Button colors */
        --button-bg: #2196f3;
        --button-text: #ffffff;
        --button-hover-bg: #1976d2;
        --button-disabled-bg: #e0e0e0;
        --button-disabled-text: #9e9e9e;

        /* Primary colors */
        --primary-color: #2196f3;
        --primary-color-hover: #1976d2;
        --heading-color: #1565c0;

        /* Code blocks */
        --chat-code-bg: #282c34;
        --chat-code-border: #3e4451;
        --chat-code-text: #abb2bf;

        /* Markdown specific colors */
        --link-color: #2196f3;
        --header-color: var(--text-color);
        --blockquote-border: #666666;
        --blockquote-text: var(--text-color-secondary);
        --blockquote-bg: rgba(0, 0, 0, 0.05);
        --table-border: #e0e0e0;
        --table-header-bg: rgba(0, 0, 0, 0.05);
        --table-row-even: rgba(0, 0, 0, 0.02);
        --inline-code-bg: rgba(0, 0, 0, 0.05);
        --hr-color: #e0e0e0;
        --emphasis-color: inherit;
        --strong-color: inherit;
        --kbd-bg: #f7f7f7;
        --kbd-border: #cccccc;
        --kbd-color: #333333;
    }

    /* Dark theme */
    :host([data-theme="dark"]), [data-theme="dark"] :host {
        --bg-color: #1a1a1a;
        --text-color: #e0e0e0;
        --text-color-secondary: #999999;
        --border-color: #333333;

        /* Messages */
        --messages-bg: #1e1e1e;
        --sent-message-bg: #1565c0;
        --sent-message-text: #ffffff;
        --received-message-bg: #2d2d2d;
        --received-message-text: var(--text-color);
        --system-message-bg: #3e2723;
        --system-message-text: #ffab91;
        --error-bg: #b71c1c;
        --error-text: #ffcdd2;
        --error-border: #c62828;

        /* Input area */
        --input-bg: #2d2d2d;
        --input-border: #404040;
        --input-focus-border: #2196f3;
        --input-placeholder: #666666;

        /* Button colors */
        --button-bg: #1976d2;
        --button-hover-bg: #1565c0;
        --button-disabled-bg: #404040;
        --button-disabled-text: #666666;

        /* Primary colors */
        --primary-color: #1976d2;
        --primary-color-hover: #1565c0;
        --heading-color: #1565c0;

        /* Code blocks */
        --chat-code-bg: #1e1e1e;
        --chat-code-border: #404040;
        --chat-code-text: #d4d4d4;

        /* Markdown specific colors */
        --link-color: #64b5f6;
        --header-color: var(--text-color);
        --blockquote-border: #666666;
        --blockquote-text: var(--text-color-secondary);
        --blockquote-bg: rgba(255, 255, 255, 0.05);
        --table-border: #404040;
        --table-header-bg: rgba(255, 255, 255, 0.05);
        --table-row-even: rgba(255, 255, 255, 0.02);
        --inline-code-bg: rgba(255, 255, 255, 0.1);
        --hr-color: #404040;
        --emphasis-color: #e0e0e0;
        --strong-color: #ffffff;
        --kbd-bg: #2d2d2d;
        --kbd-border: #404040;
        --kbd-color: #e0e0e0;
    }
`;
