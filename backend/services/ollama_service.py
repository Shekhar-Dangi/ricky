import httpx
import json
import logging
from typing import AsyncGenerator, Dict, Any, Optional
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class ChatRequest(BaseModel):
    """Request model for chat completions."""
    model: str = "llama3.2"
    messages: list[Dict[str, str]]
    stream: bool = True
    temperature: float = 0.7
    max_tokens: Optional[int] = None


class OllamaService:
    """Service for interacting with Ollama API."""
    
    def __init__(self, base_url: str = "http://127.0.0.1:11434"):
        self.base_url = base_url
        self.timeout = 60.0  # 60 seconds timeout
        
    async def test_connection(self) -> bool:
        """Test if Ollama is running and accessible."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                return True
        except Exception as e:
            logger.error(f"Ollama connection test failed: {e}")
            raise Exception(f"Ollama not accessible at {self.base_url}: {e}")
    
    async def get_available_models(self) -> list[str]:
        """Get list of available Ollama models."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                data = response.json()
                return [model["name"] for model in data.get("models", [])]
        except Exception as e:
            logger.error(f"Failed to get models: {e}")
            return []
    
