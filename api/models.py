from pydantic import BaseModel

class AIConfig(BaseModel):
    provider: str
    api_key: str

class Message(BaseModel):
    content: str
    stream: bool = False
