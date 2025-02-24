import { codeStyles } from './code.js';
import { copyStyles } from './copy.js';
import { inputStyles } from './input.js';
import { markdownStyles } from './markdown.js';
import { noticeStyles } from './notice.js';
import { themeStyles } from './theme.js';

export const baseStyles = `
    :host {
        display: block;
        height: 100%;
        width: 100%;
        background: var(--bg-color);
        overflow: hidden;
    }

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

    .chat-message {
        position: relative;
        padding: 1rem;
        margin: 0.5rem 0;
        border-radius: 0.5rem;
        line-height: 1.5;
        transition: background-color 0.3s ease;
        max-width: 80%;
        word-wrap: break-word;
        overflow-wrap: break-word;
    }

    .chat-message.sent {
        background-color: #2563eb;
        color: #ffffff;
        margin-left: 2rem;
        margin-right: 0;
        align-self: flex-end;
    }

    .chat-message.sent pre,
    .chat-message.sent code {
        background-color: rgba(0, 0, 0, 0.3);
        color: #ffffff;
    }

    .chat-message.sent .copy-button {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
    }

    .chat-message.sent .copy-button:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .chat-message.sent .copy-button svg {
        stroke: #ffffff;
    }

    .chat-message.received {
        background-color: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
        margin-right: 2rem;
        margin-left: 0;
        position: relative;
    }

    .chat-message.received.streaming {
        background-color: color-mix(in srgb, var(--vscode-editor-background) 97%, var(--vscode-editor-foreground) 3%);
    }

    .chat-message.error {
        background-color: color-mix(in srgb, var(--vscode-errorForeground) 10%, var(--vscode-editor-background) 90%);
        color: var(--vscode-editor-foreground);
        margin-right: 2rem;
    }

    .chat-message.received.streaming {
        background-color: color-mix(in srgb, var(--vscode-editor-background) 97%, var(--vscode-editor-foreground) 3%);
    }

    .chat-message.error {
        background-color: color-mix(in srgb, var(--vscode-errorForeground) 10%, var(--vscode-editor-background) 90%);
        color: var(--vscode-editor-foreground);
        margin-right: 2rem;
    }

    .copy-button {
        position: absolute;
        top: 8px;
        right: 8px;
        padding: 4px;
        background: var(--chat-bg);
        border: 1px solid var(--chat-border);
        border-radius: 4px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .chat-message:hover .copy-button {
        opacity: 1;
    }

    .copy-button:hover {
        background: var(--chat-button-hover);
    }

    .copy-button svg {
        width: 16px;
        height: 16px;
        stroke: var(--chat-text);
        transition: stroke 0.2s ease;
    }

    .copy-button.success svg {
        stroke: #22c55e;
    }

    pre {
        position: relative;
        padding: 16px;
        background: var(--chat-code-bg, #1e1e1e);
        border-radius: 6px;
        overflow-x: auto;
        display: block;
        width: fit-content;
        max-width: 100%;
        box-sizing: border-box;
        margin: 8px 0;
    }

    pre code {
        white-space: pre;
        word-wrap: normal;
        font-family: 'Fira Code', monospace;
        display: inline-block;
        min-width: 100%;
    }

    pre.code-block-wrapper {
        position: relative;
        width: 100%;
    }

    .code-copy-button {
        position: absolute;
        top: 4px;
        right: 4px;
        z-index: 1;
        opacity: 0;
    }

    pre.code-block-wrapper:hover .code-copy-button {
        opacity: 1;
    }

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

    .chat-message:last-child {
        margin-bottom: 0;
    }

    .chat-message.system {
        background: var(--system-message-bg);
        color: var(--system-message-text);
        font-style: italic;
    }

    .chat-input-container {
        position: relative;
        display: flex;
        gap: 8px;
        padding: 16px;
        background: var(--vscode-editor-background);
        border-top: 1px solid var(--vscode-panel-border);
    }

    .receiving-indicator {
        position: absolute;
        top: -40px;
        left: 50%;
        transform: translateX(-50%);
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
        transform: translateX(-50%) translateY(-4px);
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
        border-radius: 50%;
        background: currentColor;
        animation: pulse 1s infinite;
    }

    .receiving-indicator .dot:nth-child(2) {
        animation-delay: 0.2s;
    }

    .receiving-indicator .dot:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes pulse {
        0%, 100% { opacity: 0.4; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1); }
    }

    .chat-input {
        position: relative;
        display: flex;
        gap: 8px;
        padding: 16px;
        background: var(--vscode-editor-background);
        border-top: 1px solid var(--vscode-panel-border);
    }

    .chat-input textarea {
        flex: 1;
        padding: 10px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        resize: none;
        background: var(--input-bg);
        color: var(--text-color);
        box-sizing: border-box;
    }

    .chat-input button {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        background: var(--button-bg);
        color: var(--button-text);
        cursor: pointer;
    }

    .chat-input button:hover {
        background: var(--button-hover-bg);
    }

    .chat-input button:disabled {
        background: var(--button-disabled-bg);
        color: var(--button-disabled-text);
        cursor: not-allowed;
    }

    .message-content p em {
        color: #6b7280;
        font-style: italic;
    }

    .message-content p em:last-child {
        display: inline-block;
        margin-top: 8px;
        padding: 4px 8px;
        background: #f3f4f6;
        border-radius: 4px;
        font-size: 0.9em;
    }

    /* Message notice styles */
    ${noticeStyles}

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
