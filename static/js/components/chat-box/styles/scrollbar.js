export const scrollbarStyles = `
    /* Scrollbar styles */
    .chat-messages::-webkit-scrollbar {
        width: 14px;
        background-color: var(--messages-bg);
    }

    .chat-messages::-webkit-scrollbar-thumb {
        background-color: var(--border-color);
        border: 2px solid var(--messages-bg);
        border-radius: 7px;
        min-height: 40px;
    }

    .chat-messages::-webkit-scrollbar-track {
        background-color: var(--messages-bg);
        border-radius: 7px;
    }
`;
