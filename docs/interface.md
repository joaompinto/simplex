# WebSocket Interface Documentation

## Connection

WebSocket endpoint: `/ws`

All messages are JSON-encoded and follow this general structure:
```json
{
    "type": "message_type",
    "content": "message content or object",
    "metadata": {
        "user_input_id": "unique_message_id",
        ...other metadata
    }
}
```

## Message Types

### Client → Server

#### 1. Chat Message
Send a chat message to be processed by the AI.
```json
{
    "type": "message",
    "content": "user message text",
    "metadata": {
        "user_input_id": "unique_id"
    }
}
```

#### 2. Cancel Stream
Cancel an ongoing message stream.
```json
{
    "type": "cancel_stream",
    "metadata": {
        "user_input_id": "id_of_message_to_cancel"
    }
}
```

#### 3. Configuration
Get current configuration:
```json
{
    "type": "get_config"
}
```

Validate configuration:
```json
{
    "type": "validate_config",
    "content": {
        "provider": "provider_name",
        "api_key": "api_key_value"
    }
}
```

Set configuration:
```json
{
    "type": "set_config",
    "content": {
        "provider": "provider_name",
        "api_key": "api_key_value"
    }
}
```

Delete configuration:
```json
{
    "type": "delete_config"
}
```

### Server → Client

#### 1. Message Acknowledgment
Sent when a message is received:
```json
{
    "type": "ack",
    "metadata": {
        "user_input_id": "id_of_received_message"
    }
}
```

#### 2. Message Chunks
Streaming response chunks:
```json
{
    "type": "chunk",
    "content": "token or text chunk",
    "metadata": {
        "user_input_id": "original_message_id"
    }
}
```

#### 3. Stream End
Marks the end of a message stream:
```json
{
    "type": "end_stream",
    "metadata": {
        "user_input_id": "completed_message_id"
    }
}
```

#### 4. Stream Cancelled
Confirms message cancellation:
```json
{
    "type": "stream_cancelled",
    "metadata": {
        "user_input_id": "cancelled_message_id"
    }
}
```

#### 5. Configuration Responses

Config status:
```json
{
    "type": "config",
    "content": {
        "configured": true|false,
        "provider": "provider_name",  // if configured
        "provider_info": {
            "name": "PROVIDER_NAME",
            "api_key_prefix": "****"
        }
    }
}
```

Validation result:
```json
{
    "type": "validation_result",
    "content": {
        "valid": true|false,
        "provider_info": {  // if valid
            "name": "PROVIDER_NAME",
            "api_key_prefix": "****"
        },
        "error": "error message"  // if not valid
    }
}
```

Config set result:
```json
{
    "type": "config_set",
    "content": {
        "success": true|false,
        "provider_info": {  // if success
            "name": "PROVIDER_NAME",
            "api_key_prefix": "****"
        },
        "error": "error message"  // if not success
    }
}
```

Config deleted:
```json
{
    "type": "config_deleted",
    "content": {
        "success": true|false,
        "error": "error message"  // if not success
    }
}
```

#### 6. Errors
General error response:
```json
{
    "type": "error",
    "content": "error message",
    "metadata": {
        "error_type": "processing|connection|configuration",
        "user_input_id": "related_message_id"  // if applicable
    }
}
```

## Message Flow Examples

### Normal Chat Flow
1. Client sends message
2. Server sends acknowledgment
3. Server streams response chunks
4. Server sends end_stream

### Message Cancellation Flow
1. Client sends message
2. Server sends acknowledgment
3. Server starts streaming chunks
4. Client sends cancel_stream
5. Server stops streaming
6. Server sends stream_cancelled

### Configuration Flow
1. Client sends get_config
2. Server responds with config status
3. Client sends validate_config
4. Server responds with validation_result
5. Client sends set_config
6. Server responds with config_set result
