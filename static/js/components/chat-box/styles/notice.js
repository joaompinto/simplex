export const noticeStyles = `
    /* Message notice base styles */
    .chat-message .message-notice {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 12px;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 0.9em;
        font-style: normal;
        line-height: 1;
    }

    .chat-message .message-notice::before {
        font-size: 1.1em;
    }

    .chat-message .message-notice::after {
        content: '';
        position: absolute;
        top: -8px;
        left: 12px;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
    }

    /* Cancelled notice style */
    .chat-message .cancelled-notice {
        background: #fef2f2;
        border: 1px solid #f87171;
        color: #dc2626;
        font-weight: 500;
    }

    .chat-message .cancelled-notice::before {
        content: '⚠';
        color: #ef4444;
    }

    .chat-message .cancelled-notice::after {
        border-bottom: 8px solid #fef2f2;
    }

    /* Error notice style */
    .chat-message .error-notice {
        background: #fef2f2;
        border: 1px solid #f87171;
        color: #dc2626;
        font-weight: 500;
    }

    .chat-message .error-notice::before {
        content: '⚠';
        color: #ef4444;
    }

    .chat-message .error-notice::after {
        border-bottom: 8px solid #fef2f2;
    }

    /* Info notice style */
    .chat-message .info-notice {
        background: #eff6ff;
        border: 1px solid #60a5fa;
        color: #1d4ed8;
        font-weight: 500;
    }

    .chat-message .info-notice::before {
        content: 'ℹ';
        color: #3b82f6;
    }

    .chat-message .info-notice::after {
        border-bottom: 8px solid #eff6ff;
    }
`;
