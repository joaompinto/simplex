export const themeStyles = `
    /* Light theme (default) */
    :host {
        --bg-color: #ffffff;
        --text-color: #333333;
        --border-color: #e0e0e0;
        --focus-color: #007bff;
        --hover-color: #f5f5f5;
        --success-color: #28a745;

        /* Messages */
        --messages-bg: #ffffff;
        --sent-message-bg: #e3f2fd;
        --sent-message-text: #333333;
        --received-message-bg: #f5f5f5;
        --received-message-text: #333333;

        /* Input area */
        --input-bg: #ffffff;
        --textarea-bg: #ffffff;
        --button-bg: #007bff;
        --button-text: #ffffff;
        --button-hover-bg: #0056b3;
        --button-disabled-bg: #cccccc;
        --button-disabled-text: #666666;

        /* Code blocks */
        --chat-code-bg: #282c34;
        --chat-code-border: #3e4451;
        --chat-code-text: #abb2bf;

        /* System Messages */
        --system-message-bg: #f5f5f5;
        --system-message-border: #e0e0e0;
        --error-bg: #ffebee;
        --error-border: #ef9a9a;
        --error-text: #c62828;
    }

    /* Dark theme */
    :host([data-theme="dark"]), [data-theme="dark"] :host {
        --bg-color: #1e1e1e;
        --text-color: #ffffff;
        --border-color: #404040;
        --focus-color: #0078d4;
        --hover-color: #2d2d2d;
        --success-color: #28a745;

        /* Messages */
        --messages-bg: #1e1e1e;
        --sent-message-bg: #0078d4;
        --sent-message-text: #ffffff;
        --received-message-bg: #2d2d2d;
        --received-message-text: #ffffff;

        /* Input area */
        --input-bg: #2d2d2d;
        --textarea-bg: #2d2d2d;
        --button-bg: #0078d4;
        --button-text: #ffffff;
        --button-hover-bg: #006abc;
        --button-disabled-bg: #404040;
        --button-disabled-text: #999999;

        /* Code blocks */
        --chat-code-bg: #1e1e1e;
        --chat-code-border: #404040;
        --chat-code-text: #d4d4d4;

        /* System Messages */
        --system-message-bg: #2d2d2d;
        --system-message-border: #404040;
        --error-bg: #421c1c;
        --error-border: #b71c1c;
        --error-text: #ef5350;
    }
`;
