from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from joao import AsyncAgent

"""
For details about the joao API check:
    https://github.com/joaompinto/joao
"""


router = APIRouter(prefix="/api/agent")

# Store the agent instance
agent: Optional[AsyncAgent] = None

def get_agent():
    return agent

def set_agent(new_agent: AsyncAgent):
    global agent
    agent = new_agent

def initialize_agent(api_key: str, provider: str):
    global agent
    agent = AsyncAgent(
        "You are an expert software developer",
        api_key=api_key
    )
