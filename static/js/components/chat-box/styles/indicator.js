export const indicatorStyles = `
    /* Stream indicator */
    .stream-indicator {
        display: inline-block;
        margin-left: 4px;
        animation: blink 1s infinite;
    }

    .stream-indicator::after {
        content: '▋';
        opacity: 0.7;
    }

    @keyframes blink {
        0% { opacity: 1; }
        50% { opacity: 0; }
        100% { opacity: 1; }
    }

    /* Receiving indicator */
    .receiving-indicator {
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(100%);
        background: #2563eb;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
        padding: 8px 16px;
        border-radius: 16px;
        font-size: 0.9em;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 8px;
        opacity: 0;
        transition: all 0.2s ease;
        pointer-events: none;
        z-index: 100;
    }

    .receiving-indicator.visible {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
        pointer-events: all;
    }

    .receiving-indicator .cancel-button {
        cursor: pointer;
        width: 16px;
        height: 16px;
        padding: 2px;
        border: none;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;
        pointer-events: all;
    }

    .receiving-indicator .cancel-button:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .receiving-indicator .cancel-button svg {
        width: 12px;
        height: 12px;
        stroke: currentColor;
        stroke-width: 2;
        pointer-events: none;
    }

    .receiving-indicator .dots {
        display: flex;
        gap: 4px;
    }

    .receiving-indicator .dot {
        width: 4px;
        height: 4px;
        background: currentColor;
        border-radius: 50%;
        opacity: 0.5;
        animation: pulse 1s infinite;
    }

    .receiving-indicator .dot:nth-child(2) {
        animation-delay: 0.2s;
    }

    .receiving-indicator .dot:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes pulse {
        50% { opacity: 1; }
    }
`;
