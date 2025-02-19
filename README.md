# Janito

A simple and elegant chat interface for AI interactions.

## Features

- 🎨 Modern, clean interface with light/dark theme support
- ⚡ Real-time message streaming
- 📋 Copy functionality for:
  - Individual code blocks
  - Entire messages
- ⚙️ AI Integration:
  - Google's Gemini Pro model
  - Real-time streaming responses
  - API key validation
- 💬 Rich message formatting:
  - Markdown support
  - Code syntax highlighting
  - LaTeX math rendering
- 🔧 Dynamic configuration:
  - API key management
  - Connection status display
  - Real-time validation
- 📱 Responsive design:
  - Auto-expanding input
  - Left-aligned messages for better readability
  - Compact header with provider info
- 🛠️ Chat commands:
  - Built-in help system
  - Extensible command framework
  - Slash command syntax (/command args)

## Components

### Web Components

| Component | Description |
|-----------|-------------|
| ChatBox | Core chat interface component with modular structure: |
| | - `chat-box.js`: Main component definition |
| | - `message-handler.js`: Message rendering and management |
| | - `input-handler.js`: User input and submission |
| | - `template.js`: Component HTML structure |
| AI Config | Provider configuration dialog: |
| | - `ai-config/index.js`: Configuration component |
| | - `providers.js`: Provider-specific logic |
| | - `template.js`: Dialog structure |
| | - `styles.js`: Component styling |

### Core Services

| Service | File | Purpose |
|---------|------|---------|
| Message Manager | `message-manager.js` | Handles message processing and API communication |
| Config Manager | `config-manager.js` | Manages provider configuration and validation |
| Theme Manager | `theme-manager.js` | Handles light/dark theme switching |
| Command Manager | `command-manager.js` | Processes chat commands and help system |
| Main App | `index.js` | Application initialization and component coordination |

### Backend API

| Module | Purpose |
|--------|---------|
| `api/chat.py` | Message processing and AI communication |
| `api/config.py` | Configuration storage and retrieval |
| `api/hello.py` | API key and connection validation |

## Events

The application uses custom events for component communication:

| Event | Emitted By | Purpose |
|-------|------------|---------|
| `chat-box-ready` | ChatBox | Signals chat box initialization complete |
| `message-sent` | ChatBox | User has sent a new message |
| `show-ai-config` | Index/UI | Request to show the configuration dialog |
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

The backend exposes RESTful endpoints for chat and configuration:

```
POST /api/chat
- Send messages to the AI provider
- Supports server-sent events for streaming

POST /api/config
- Save provider configuration
- Validates API keys before saving

GET /api/config
- Retrieve current configuration

POST /api/hello
- Test provider configuration
- Validates API keys and models
```

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

The application supports the following AI provider:

- Google Gemini

Configuration is stored in `~/.janito/config.json` and includes:
- API key
- Model settings
