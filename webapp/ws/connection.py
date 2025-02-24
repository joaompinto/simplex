import asyncio
import logging
from typing import Dict, Set
from fastapi import WebSocket
from starlette.websockets import WebSocketDisconnect

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections = set()
        self.active_streams = {}  # Map of user_input_id to cancellation flag
        self.cancel_events: Dict[str, asyncio.Event] = {}  # Map of user_input_id to cancel event
        self.active_tasks: Dict[WebSocket, Set[asyncio.Task]] = {}  # Track tasks per connection

    def add_connection(self, websocket: WebSocket):
        """Add a new WebSocket connection."""
        self.active_connections.add(websocket)
        self.active_tasks[websocket] = set()

    def remove_connection(self, websocket: WebSocket):
        """Remove and cleanup a WebSocket connection."""
        self.active_connections.remove(websocket)
        # Cancel all tasks for this connection
        if websocket in self.active_tasks:
            for task in self.active_tasks[websocket]:
                if not task.done():
                    task.cancel()
            del self.active_tasks[websocket]

    def start_stream(self, user_input_id: str):
        """Track a new active stream."""
        self.active_streams[user_input_id] = False
        self.cancel_events[user_input_id] = asyncio.Event()

    def cancel_stream(self, user_input_id: str):
        """Mark a stream as cancelled."""
        if user_input_id in self.active_streams:
            self.active_streams[user_input_id] = True
            if user_input_id in self.cancel_events:
                self.cancel_events[user_input_id].set()
            logger.info(f"Stream cancelled for user input ID: {user_input_id}")

    def is_cancelled(self, user_input_id: str) -> bool:
        """Check if a stream has been cancelled."""
        return self.active_streams.get(user_input_id, False)

    def end_stream(self, user_input_id: str):
        """Clean up a completed stream."""
        if user_input_id in self.active_streams:
            del self.active_streams[user_input_id]
            if user_input_id in self.cancel_events:
                del self.cancel_events[user_input_id]
            logger.info(f"Stream ended for user input ID: {user_input_id}")

# Global connection manager instance
manager = ConnectionManager()
