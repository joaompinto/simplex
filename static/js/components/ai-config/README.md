# AI Configuration Component

A web component for managing AI provider configuration in the Simplex chat application.

## Responsibility

This component is responsible for:
1. Displaying and managing the configuration modal UI
2. Handling form input for provider selection and API key
3. Managing validation states and error display
4. Dispatching events for configuration changes

The component does NOT:
- Directly modify any external DOM elements
- Manage application state outside its scope
- Handle WebSocket connections or chat functionality

## Events

### Outgoing Events

1. `validate-config`
   - Dispatched when the form is submitted
   - Detail: `{ provider: string, api_key: string }`
   - Purpose: Request validation of the configuration

2. `provider-info-update`
   - Dispatched when provider information changes
   - Detail: Provider information object
   - Purpose: Notify application of provider changes

3. `config-updated`
   - Dispatched when configuration is successfully validated
   - Detail: Validation result including provider info
   - Purpose: Notify application of successful configuration

4. `config-error`
   - Dispatched when configuration validation fails
   - Detail: Error information
   - Purpose: Notify application of configuration errors

### Incoming Events

1. `show-ai-config`
   - Shows the configuration modal
   - No detail required
   - Purpose: Allow external components to trigger the config UI

## Usage

```html
<!-- Add the component to your HTML -->
<ai-config></ai-config>

<!-- Show the config modal -->
<button onclick="document.dispatchEvent(new CustomEvent('show-ai-config'))">
    Configure AI
</button>
```

## Event Handling Example

```javascript
// Listen for configuration events
document.addEventListener('config-updated', (event) => {
    // Handle successful configuration
    const { provider_info } = event.detail;
    // Update application state...
});

document.addEventListener('config-error', (event) => {
    // Handle configuration error
    const { error } = event.detail;
    // Update error state...
});
```

## File Structure

- `index.js`: Main component implementation
- `styles.js`: Component styles
- `template.js`: HTML template
- `providers.js`: Provider-specific configuration and instructions

## Best Practices

1. **Event-Driven Communication**: The component communicates with the rest of the application exclusively through events
2. **Single Responsibility**: Only manages configuration UI and validation state
3. **Encapsulation**: Uses Shadow DOM for style isolation
4. **Error Handling**: Provides clear error feedback within its own UI
5. **State Management**: Maintains only configuration-related state

## Dependencies

- No external dependencies required
- Uses native Web Components API
- Relies on FastAPI backend for configuration validation
