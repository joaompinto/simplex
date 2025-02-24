import logging
import traceback
import asyncio
from fastapi import WebSocket
from starlette.websockets import WebSocketDisconnect
from .connection import manager
from .handlers import (
    handle_chat_message,
    handle_config_request
)
from ..config import (
    validate_api_key,
    save_config,
    CONFIG_FILE,
    get_provider_info
)

logger = logging.getLogger(__name__)

async def handle_message(websocket: WebSocket, data: dict):
    """Handle a single message."""
    try:
        if data["type"] == "cancel_stream":
            # Handle cancellation immediately in the main task
            user_input_id = data.get("metadata", {}).get("user_input_id")
            if user_input_id:
                logger.info(f"Canceling stream for user input ID: {user_input_id}")
                manager.cancel_stream(user_input_id)
                await websocket.send_json({
                    "type": "stream_cancelled",
                    "metadata": {"user_input_id": user_input_id}
                })
            return

        if data["type"] == "message":
            # Create a new task for chat message processing
            task = asyncio.create_task(handle_chat_message(websocket, data))
            manager.active_tasks[websocket].add(task)
            task.add_done_callback(lambda t: manager.active_tasks[websocket].remove(t))
        else:
            # Handle other message types in the main task
            if data["type"] == "get_config":
                await handle_config_request(websocket)
            elif data["type"] == "validate_config":
                await handle_validate_config(websocket, data)
            elif data["type"] == "set_config":
                await handle_set_config(websocket, data)
            elif data["type"] == "delete_config":
                await handle_delete_config(websocket)

    except Exception as e:
        error_detail = f"Error processing message: {str(e)}\nTraceback:\n{traceback.format_exc()}"
        logger.error(error_detail)
        await websocket.send_json({
            "type": "error",
            "content": str(e),
            "metadata": {"error_type": "processing"}
        })

async def handle_validate_config(websocket: WebSocket, data: dict):
    """Handle validate config request."""
    provider = data["content"]["provider"]
    api_key = data["content"]["api_key"]
    is_valid, error_msg = await validate_api_key(provider, api_key)
    
    if is_valid:
        await websocket.send_json({
            "type": "validation_result",
            "content": {
                "valid": True,
                "provider_info": get_provider_info(provider, api_key)
            }
        })
    else:
        await websocket.send_json({
            "type": "validation_result",
            "content": {
                "valid": False,
                "error": error_msg
            }
        })

async def handle_set_config(websocket: WebSocket, data: dict):
    """Handle set config request."""
    config = data["content"]
    if save_config(config):
        await websocket.send_json({
            "type": "config_set",
            "content": {
                "success": True,
                "provider_info": get_provider_info(config["provider"], config["api_key"])
            }
        })
    else:
        await websocket.send_json({
            "type": "config_set",
            "content": {
                "success": False,
                "error": "Failed to save configuration"
            }
        })

async def handle_delete_config(websocket: WebSocket):
    """Handle delete config request."""
    try:
        CONFIG_FILE.unlink(missing_ok=True)
        await websocket.send_json({
            "type": "config_deleted",
            "content": {"success": True}
        })
    except Exception as e:
        await websocket.send_json({
            "type": "config_deleted",
            "content": {
                "success": False,
                "error": str(e)
            }
        })

async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint handler."""
    await websocket.accept()
    manager.add_connection(websocket)
    
    try:
        while True:
            # Main loop keeps receiving messages
            data = await websocket.receive_json()
            await handle_message(websocket, data)
    except WebSocketDisconnect:
        manager.remove_connection(websocket)
    except Exception as e:
        error_detail = f"Error in websocket connection: {str(e)}\nTraceback:\n{traceback.format_exc()}"
        logger.error(error_detail)
        try:
            await websocket.send_json({
                "type": "error",
                "content": str(e),
                "metadata": {"error_type": "connection"}
            })
        except:
            pass  # Connection might be closed
        manager.remove_connection(websocket)
