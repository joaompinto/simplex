# Janito

A simple and elegant chat interface for AI interactions.

## Components

| Component | File | Purpose |
|-----------|------|---------|
| ChatBox | `static/js/chat-box.js` | Pure web component for message display and input. Handles message rendering, user input, and basic message styling. No business logic. |
| AI Configuration | `static/js/ai-config.js` | Dialog component for configuring AI provider settings. Handles validation and submission of API keys. |
| Main App | `static/js/index.js` | Core application logic. Manages configuration state, provider info, and message handling. Coordinates between components. |
| API Routes | `api/*.py` | Backend API endpoints: |
| | `api/config.py` | Handles saving/loading AI provider configuration |
| | `api/chat.py` | Processes chat messages and returns AI responses |
| | `api/hello.py` | Validates AI provider configuration |

## Events

The application uses custom events for component communication:

| Event | Emitted By | Purpose |
|-------|------------|---------|
| `chat-box-ready` | ChatBox | Signals chat box initialization complete |
| `message-sent` | ChatBox | User has sent a new message |
| `show-config-dialog` | Index | Request to show the configuration dialog |
| `validate-config` | AI Config | Request to validate provider configuration |
| `ai-config-updated` | AI Config | Provider configuration has been updated |

## API

### ChatBox Component

Pure message display and input component:

```javascript
// Add a message to the chat
chatBox.addMessage({
    content: string,    // Message content
    type: string,      // 'sent', 'received', or 'system'
    metadata: object,  // Additional message metadata
    isHtml: boolean   // Whether content contains HTML
});

// Enable/disable user input
chatBox.setInputEnabled(boolean);

// Clear all messages
chatBox.clearMessages();
```

### Backend API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/config` | GET | Get current configuration |
| `/api/config` | POST | Save new configuration |
| `/api/config` | DELETE | Remove configuration |
| `/api/chat` | POST | Send message to AI |
| `/api/hello` | POST | Validate configuration |

## Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the development server:
```bash
uvicorn main:app --reload
```

## Configuration

The application supports multiple AI providers:

- Google Gemini
- OpenAI

Configuration is stored in `~/.janito/config.json` and includes:
- Provider selection
- API key
- Model settings
