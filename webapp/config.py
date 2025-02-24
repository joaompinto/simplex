import json
from pathlib import Path
from typing import Optional, Dict

# Constants
CONFIG_FILE = Path.home() / ".simplex" / "config.json"

def load_config() -> Optional[Dict]:
    """Load configuration from file."""
    try:
        if CONFIG_FILE.exists():
            with open(CONFIG_FILE) as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading config: {e}")
    return None

def save_config(config: Dict) -> bool:
    """Save configuration to file."""
    try:
        CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f)
        return True
    except Exception as e:
        print(f"Error saving config: {e}")
        return False

def get_provider_info(provider: str, api_key: str) -> Dict:
    """Get provider information."""
    if provider.lower() == "gemini":
        return {
            "vendor": "Google",
            "model": "Gemini Flash 2.0",
            "api_key_prefix": api_key[:4] if api_key else ""
        }
    return {
        "vendor": provider.upper(),
        "model": "AI Assistant",
        "api_key_prefix": api_key[:4] if api_key else ""
    }

async def validate_api_key(provider: str, api_key: str) -> tuple[bool, str]:
    """Validate API key with provider by trying to send a simple test message."""
    try:
        from joao import AsyncAgent
        
        # Create agent with the provided config
        agent = AsyncAgent(
            "You are an expert software developer",
            api_key=api_key,
            tenant_prefix=provider.upper()
        )
        
        # Try to send a test message with streaming
        stream = await agent.request("hello", stream=True)
        response = ""
        try:
            async for token in stream:
                if token:
                    response = token
                    break  # We just need one valid token
            return True, ""
        except Exception as e:
            return False, str(e)
            
    except Exception as e:
        return False, str(e)
