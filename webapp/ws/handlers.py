import logging
import traceback
from fastapi import WebSocket
from joao import AsyncAgent
from ..config import load_config, get_provider_info
from .connection import manager

logger = logging.getLogger(__name__)

# System prompt for the agent
SYSTEM_PROMPT = """You are a helpful AI assistant."""

async def handle_chat_message(websocket: WebSocket, data: dict):
    """Handle a chat message."""
    config = load_config()
    if not config:
        await websocket.send_json({
            "type": "error",
            "content": "AI not configured",
            "metadata": {"error_type": "configuration"}
        })
        return

    agent = AsyncAgent(
        SYSTEM_PROMPT,
        api_key=config["api_key"],
        tenant_prefix=config["provider"].upper()
    )

    metadata = data.get("metadata", {})
    user_input_id = metadata.get("user_input_id")
    user_message = data["content"]

    logger.info(f"Sending message to agent (ID: {user_input_id}): {user_message[:100]}...")

    # Send acknowledgment
    await websocket.send_json({
        "type": "ack",
        "metadata": {"user_input_id": user_input_id}
    })

    # Start tracking the stream
    manager.start_stream(user_input_id)

    try:
        # Process message using streaming
        stream = await agent.request(user_message, stream=True)
        try:
            async for token in stream:
                # Check if cancelled
                if manager.is_cancelled(user_input_id):
                    logger.info(f"Stream cancelled, stopping for user input ID: {user_input_id}")
                    break

                logger.info(f"Received token from agent (ID: {user_input_id}): {token[:50]}...")
                await websocket.send_json({
                    "type": "chunk",
                    "content": token,
                    "metadata": {"user_input_id": user_input_id}
                })

        except Exception as e:
            logger.error(f"Error in stream processing: {e}")
            if not manager.is_cancelled(user_input_id):
                raise  # Only re-raise if not cancelled
        finally:
            # Clean up stream state
            manager.end_stream(user_input_id)
            if not manager.is_cancelled(user_input_id):
                await websocket.send_json({
                    "type": "end_stream",
                    "metadata": {"user_input_id": user_input_id}
                })

    except Exception as e:
        error_msg = f"Error processing message: {str(e)}"
        logger.error(error_msg)
        await websocket.send_json({
            "type": "error",
            "content": error_msg,
            "metadata": {"user_input_id": user_input_id}
        })

async def handle_config_request(websocket: WebSocket):
    """Handle get config request."""
    config = load_config()
    if config:
        provider_info = get_provider_info(config["provider"], config["api_key"])
        await websocket.send_json({
            "type": "config",
            "content": {
                "configured": True,
                "provider": config["provider"],
                "provider_info": provider_info
            }
        })
    else:
        await websocket.send_json({
            "type": "config",
            "content": {"configured": False}
        })
