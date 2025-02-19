# Chat Box Component

A web component for displaying chat messages, cards, and handling user input in the Simplex chat application.

## API Methods

### Message Management

#### `addMessage(options)`
Add a plain text message to the chat.
```javascript
chatBox.addMessage({
    content: "Hello world",
    type: "received", // or "sent"
    metadata: { id: "custom-id" }, // optional
    isHtml: false // default
});
```

#### `addMessageMD(options)`
Add a markdown-formatted message to the chat.
```javascript
chatBox.addMessageMD({
    content: "# Hello\nThis is **markdown**",
    type: "received",
    metadata: { id: "custom-id" }
});
```

#### `updateMessage(messageId, content, append = false)`
Update an existing message's content.
```javascript
chatBox.updateMessage("msg-123", "Updated content");
```

### Card Management

#### `addCard(options)`
Add an interactive card to the chat.
```javascript
chatBox.addCard({
    content: "# Configuration Required\nPlease configure settings",
    actions: [{
        label: "Configure",
        event: "show-config"
    }],
    metadata: {
        id: "config-card"
    }
});
```

#### `removeCard(cardId)`
Remove a card from the chat by its ID.
```javascript
chatBox.removeCard("config-card");
```

### Input Control

#### `setInputEnabled(enabled)`
Enable or disable the chat input.
```javascript
chatBox.setInputEnabled(false); // Disable input
```

#### `clearMessages()`
Clear all messages from the chat.
```javascript
chatBox.clearMessages();
```

## Events

### Outgoing Events

1. `message-sent`
   - Dispatched when user sends a message
   - Detail: `{ content: string }`

2. `card-action`
   - Dispatched when a card action button is clicked
   - Detail: `{ cardId: string, action: object }`

## CSS Custom Properties

The component's appearance can be customized using CSS variables:
```css
chat-box {
    --chat-bg: #ffffff;
    --message-bg: #f0f0f0;
    --sent-message-bg: #007bff;
    --card-bg: #f8f9fa;
}
```

## Best Practices

1. **Card Management**
   - Always provide unique IDs for cards that you'll need to remove later
   - Use the component's API methods (addCard/removeCard) instead of direct DOM manipulation
   - Handle card actions through event listeners

2. **Message Updates**
   - Store message IDs if you need to update them later
   - Use markdown for formatted messages
   - Consider using append mode for streaming content

## Example Usage

```javascript
// Initialize
const chatBox = document.querySelector('chat-box');

// Add a configuration card
const cardId = chatBox.addCard({
    content: "# Configuration Required",
    actions: [{
        label: "Configure",
        event: "show-config"
    }],
    metadata: { id: "config-card" }
});

// Listen for card actions
document.addEventListener('card-action', (event) => {
    const { cardId, action } = event.detail;
    if (action.event === 'show-config') {
        // Handle configuration
        // ...
        // Remove the card when done
        chatBox.removeCard(cardId);
    }
});
```
