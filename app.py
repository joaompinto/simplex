import logging
from pathlib import Path
from fastapi import Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from webapp import app
from webapp.ws.routes import websocket_endpoint

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Setup templates
templates = Jinja2Templates(directory="templates")

# Register WebSocket endpoint
app.add_api_websocket_route("/ws", websocket_endpoint)

@app.get("/")
async def get_index(request: Request):
    """Serve the main index page."""
    return templates.TemplateResponse(
        "index.html",
        {"request": request}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
