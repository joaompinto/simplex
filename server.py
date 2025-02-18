from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse, FileResponse
from typing import List, Optional
from pydantic import BaseModel
import json
import os
from pathlib import Path
from joao import AsyncAgent
import asyncio

app = FastAPI()

# Config file path
CONFIG_FILE = "config.json"

# Templates and static files
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize the AsyncAgent with None, will be updated when config is set
agent = None
current_provider = None

def initialize_agent(api_key: str, provider: str):
    global agent, current_provider
    agent = AsyncAgent(
        "You are an expert software developer",
        api_key=api_key
    )
    current_provider = provider

def load_config() -> Optional[dict]:
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    return None

def save_config(config: dict):
    configs = load_all_configs() or {}
    configs[config['provider']] = config
    with open(CONFIG_FILE, 'w') as f:
        json.dump(configs, f)

def load_all_configs() -> Optional[dict]:
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    return None

@app.get('/favicon.ico')
async def favicon():
    return FileResponse(Path("static/favicon.ico"))

class AIConfig(BaseModel):
    provider: str
    api_key: str

class Message(BaseModel):
    content: str
    stream: bool = False

@app.get("/")
async def get_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/api/config")
async def get_config():
    configs = load_all_configs()
    return {
        "configured": configs is not None and len(configs) > 0,
        "configs": configs or {},
        "current": current_provider
    }

@app.post("/api/config")
async def set_config(config: AIConfig):
    save_config(config.dict())
    initialize_agent(config.api_key, config.provider)
    return {"status": "success"}

@app.delete("/api/config")
async def delete_config():
    global agent, current_provider
    if os.path.exists(CONFIG_FILE):
        os.remove(CONFIG_FILE)
        agent = None
        current_provider = None
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Configuration not found")

@app.post("/api/config/{provider}/select")
async def select_provider(provider: str):
    global current_provider
    configs = load_all_configs()
    if not configs or provider not in configs:
        raise HTTPException(status_code=404, detail="Provider configuration not found")
    
    config = configs[provider]
    initialize_agent(config['api_key'], provider)
    return {"status": "success"}

@app.post("/api/chat")
async def chat(message: Message):
    if agent is None:
        raise HTTPException(status_code=400, detail="AI agent not configured. Please set API key first.")
    try:
        if message.stream:
            response_text = ""
            async for token in agent.request(message.content, stream=True):
                response_text += token
            return {"response": response_text}
        else:
            response = await agent.request(message.content)
            return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Store active connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if agent is None:
                await websocket.send_text(json.dumps({"error": "AI agent not configured. Please set API key first."}))
                continue
                
            if message_data.get("stream", False):
                async for token in agent.request(message_data["content"], stream=True):
                    await websocket.send_text(json.dumps({"token": token}))
                await websocket.send_text(json.dumps({"done": True}))
            else:
                response = await agent.request(message_data["content"])
                await websocket.send_text(json.dumps({"response": response}))
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="localhost", port=8080, reload=True)
