from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from typing import List, Optional
from joao import AsyncAgent
from .models import Message, AIConfig
from .config import load_config
import traceback

router = APIRouter(prefix="/api")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    async def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@router.post("/chat")
async def chat(message: Message):
    config = load_config()
    if not config:
        raise HTTPException(status_code=400, detail="AI not configured")

    try:
        agent = AsyncAgent(
            "You are an expert software developer",
            api_key=config["api_key"],
            tenant_prefix=config["provider"].upper()
        )
        response = await agent.request(message.content)
        return {"response": response}
    except Exception as e:
        error_detail = f"Agent error: {str(e)}\nTraceback:\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)

@router.post("/hello")
async def hello(config: Optional[AIConfig] = None):
    # If config is provided, use it for testing
    if config:
        test_config = config.dict()
    else:
        test_config = load_config()
        
    if not test_config:
        raise HTTPException(status_code=400, detail="AI not configured")

    try:
        agent = AsyncAgent(
            "You are an expert software developer",
            api_key=test_config["api_key"],
            tenant_prefix=test_config["provider"].upper()
        )
        response = await agent.request("Hello! Please introduce yourself briefly.")
        return {"response": response}
    except Exception as e:
        error_detail = f"Agent error: {str(e)}\nTraceback:\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        config = load_config()
        if not config:
            await websocket.send_json({
                "type": "error",
                "content": "AI not configured",
                "metadata": {"error_type": "configuration"}
            })
            await manager.disconnect(websocket)
            return

        agent = AsyncAgent(
            "You are an expert software developer",
            api_key=config["api_key"],
            tenant_prefix=config["provider"].upper()
        )

        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            try:
                # Process the message
                if data["type"] == "message":
                    # Get metadata
                    metadata = data.get("metadata", {})
                    user_input_id = metadata.get("user_input_id")

                    # Send acknowledgment that message was received
                    await websocket.send_json({
                        "type": "status",
                        "content": "processing",
                        "metadata": {"user_input_id": user_input_id}
                    })

                    # Get response from agent with streaming
                    response_stream = await agent.request(data["content"], stream=True)
                    async for chunk in response_stream:
                        await websocket.send_json({
                            "type": "chunk",
                            "content": chunk,
                            "metadata": {"user_input_id": user_input_id}
                        })

                    # Send completion message
                    await websocket.send_json({
                        "type": "status",
                        "content": "complete",
                        "metadata": {"user_input_id": user_input_id}
                    })
                else:
                    await websocket.send_json({
                        "type": "error",
                        "content": "Unknown message type",
                        "metadata": {"error_type": "invalid_message"}
                    })

            except Exception as e:
                error_detail = f"Agent error: {str(e)}"
                await websocket.send_json({
                    "type": "error",
                    "content": error_detail,
                    "metadata": {
                        "error_type": "agent_error",
                        "user_input_id": metadata.get("user_input_id") if "metadata" in data else None
                    }
                })

    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception as e:
        error_detail = f"WebSocket error: {str(e)}"
        try:
            await websocket.send_json({
                "type": "error",
                "content": error_detail,
                "metadata": {"error_type": "websocket_error"}
            })
        except:
            pass  # Connection might be already closed
        finally:
            await manager.disconnect(websocket)
