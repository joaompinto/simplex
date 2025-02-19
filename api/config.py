from fastapi import APIRouter, HTTPException
import json
from pathlib import Path
from joao import AsyncAgent
from .models import AIConfig

router = APIRouter(prefix="/api/config")

# Config file path
CONFIG_DIR = Path.home() / '.janito'
CONFIG_FILE = CONFIG_DIR / 'config.json'

PROVIDER_INFO = {
    'gemini': {
        'vendor': 'Google',
        'model': 'Gemini Flash 2.0'
    },
    'openai': {
        'vendor': 'OpenAI',
        'model': 'GPT-4'
    }
}

async def validate_api_key(provider: str, api_key: str):
    """Validate API key by making a test request."""
    try:
        agent = AsyncAgent(
            "You are an expert software developer",
            api_key=api_key,
            tenant_prefix=provider.upper()
        )
        # Make a minimal test request
        await agent.request("Test")
        return True
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg:
            error_msg = "API quota exceeded. Please try again later or use a different API key."
        elif "401" in error_msg or "403" in error_msg:
            error_msg = "Invalid API key. Please check your key and try again."
        raise HTTPException(
            status_code=400, 
            detail=f"Error validating {provider} API key: {error_msg}"
        )

def get_provider_info(provider: str, api_key: str):
    base_info = PROVIDER_INFO.get(provider.lower(), {
        'vendor': provider.title(),
        'model': 'Unknown'
    })
    # Add api_key to the info
    return {**base_info, 'api_key': api_key}

def load_config():
    try:
        if CONFIG_FILE.exists():
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f)
        return None
    except Exception as e:
        print(f"Error loading config: {e}")
        return None

def save_config(config: dict):
    try:
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=4)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving config: {str(e)}")

@router.get("")
async def get_config():
    config = load_config()
    if config:
        provider_info = get_provider_info(config["provider"], config["api_key"])
        return {
            "configured": True,
            "provider": config["provider"],
            "provider_info": provider_info
        }
    return {"configured": False}

@router.get("/validate")
async def validate_config(provider: str, api_key: str):
    """Validate AI configuration without saving."""
    try:
        # Validate the API key
        await validate_api_key(provider, api_key)
        
        # Return provider info
        provider_info = get_provider_info(provider, api_key)
        return {"status": "success", "provider_info": provider_info}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/validate")
async def validate_config(config: AIConfig):
    """Validate AI configuration without saving."""
    try:
        # Validate the API key
        await validate_api_key(config.provider, config.api_key)
        
        # Return provider info
        provider_info = get_provider_info(config.provider, config.api_key)
        return {"status": "success", "provider_info": provider_info}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
async def set_config(config: AIConfig):
    """Set and save AI configuration."""
    try:
        # Save the config
        config_dict = config.dict()
        save_config(config_dict)
        
        # Return provider info
        provider_info = get_provider_info(config.provider, config.api_key)
        return {"status": "success", "provider_info": provider_info}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("")
async def delete_config():
    try:
        if CONFIG_FILE.exists():
            CONFIG_FILE.unlink()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
