export function getStyles(theme) {
    const {
        textColor,
        buttonBg,
        buttonText,
        buttonSecondaryBg,
        errorColor
    } = theme;

    return `
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            pointer-events: none;
        }

        .modal.show {
            display: block;
            pointer-events: auto;
        }

        .modal-content {
            background-color: var(--modal-content-bg);
            color: var(--text-color);
            margin: 15% auto;
            padding: 1.5rem;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            position: relative;
            pointer-events: auto;
        }

        .modal-content * {
            pointer-events: auto;
        }

        h2 {
            margin-top: 0;
            color: var(--text-color);
        }

        form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        label {
            font-weight: 500;
            color: var(--text-color);
        }

        select, input {
            padding: 0.5rem;
            border: 1px solid var(--input-border);
            border-radius: 4px;
            background-color: var(--input-bg);
            color: var(--text-color);
        }

        select {
            cursor: pointer;
        }

        .api-key-section {
            display: none;
        }

        .api-key-instructions {
            font-size: 0.9rem;
            color: var(--text-color);
            opacity: 0.8;
            margin-bottom: 1rem;
        }

        .api-key-instructions a {
            color: var(--link-color);
            text-decoration: none;
        }

        .api-key-instructions a:hover {
            text-decoration: underline;
        }

        .form-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
            margin-top: 1rem;
        }

        .form-buttons button {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .form-buttons button[type="submit"] {
            background-color: ${buttonBg};
            color: ${buttonText};
        }

        .form-buttons button[type="submit"].validating {
            opacity: 0.7;
            cursor: wait;
        }

        .form-buttons button[type="button"] {
            background-color: ${buttonSecondaryBg};
            color: ${buttonText};
        }

        .error-container {
            display: none;
            margin-top: 1rem;
            padding: 0.75rem;
            border-radius: 6px;
            background-color: #fef2f2;
            border: 1px solid #fee2e2;
            color: #991b1b;
            transition: all 0.3s ease;
        }

        .error-container.show {
            display: block;
        }

        .error-message {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .error-icon {
            flex-shrink: 0;
        }

        .error-text {
            font-size: 0.875rem;
            line-height: 1.25rem;
        }

        .error-message {
            color: ${errorColor};
            background-color: ${errorColor}15;
            border: 1px solid ${errorColor};
            border-radius: 4px;
            padding: 0.75rem;
            font-size: 0.9rem;
            display: block;
            width: 100%;
            box-sizing: border-box;
            animation: fadeIn 0.3s ease-in-out;
        }

        .error-message.system-error {
            color: #d32f2f;
            background-color: #ffebee;
            border-color: #d32f2f;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .error-message.system-error::before {
            content: "⚠️";
            font-size: 1.1rem;
        }

        .validating-message {
            color: ${textColor};
            opacity: 0.8;
            font-size: 0.9rem;
            margin-top: 1rem;
            display: none;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem;
            background-color: var(--modal-content-bg);
        }

        .validating-message.show {
            display: flex !important;
        }

        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid ${textColor};
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
}
