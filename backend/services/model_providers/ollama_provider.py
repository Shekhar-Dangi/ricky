"""
Ollama model provider for local models.
"""

import json
import logging
from typing import AsyncGenerator, List, Dict, Any
from langchain_ollama import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from .base import ModelProvider, ModelType, ProviderType

logger = logging.getLogger(__name__)


class OllamaProvider(ModelProvider):
    """
    Ollama provider for local LLM models.
    """
    
    def __init__(self, model: str, **kwargs):
        """
        Initialize Ollama provider.
        
        Args:
            model: Ollama model name (e.g., "llama3.2", "mistral:7b")
            **kwargs: Additional configuration
        """
        super().__init__(model, **kwargs)
        
        # Set default temperature if not provided
        self.temperature = kwargs.get('temperature', 0.6)
        
        # Initialize ChatOllama
        self.llm = ChatOllama(
            model=model,
            temperature=self.temperature,
            validate_model_on_init=True
        )
        
        logger.info(f"🦙 Initialized Ollama provider with model: {model}")
    
    def _convert_to_langchain_messages(self, messages: List[Dict[str, str]]) -> List:
        """
        Convert chat messages to LangChain message format.
        
        Args:
            messages: List of chat messages
            
        Returns:
            List of LangChain message objects
        """
        langchain_messages = []
        
        for msg in messages:
            role = msg.get("role", "")
            content = msg.get("content", "")
            
            if role == "system":
                langchain_messages.append(SystemMessage(content=content))
            elif role == "user":
                langchain_messages.append(HumanMessage(content=content))
            elif role == "assistant":
                langchain_messages.append(AIMessage(content=content))
            else:
                logger.warning(f"Unknown message role: {role}")
        
        return langchain_messages
    
    async def generate_stream(
        self, 
        messages: List[Dict[str, str]], 
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """
        Generate streaming response using Ollama.
        
        Args:
            messages: List of messages in chat format
            **kwargs: Additional generation parameters
            
        Yields:
            str: Response chunks
        """
        try:
            # Convert messages to LangChain format
            langchain_messages = self._convert_to_langchain_messages(messages)
            
            logger.info(f"🦙 Generating stream with {len(langchain_messages)} messages")
            
            # Stream response from Ollama
            async for chunk in self.llm.astream(langchain_messages):
                if chunk.content:
                    yield chunk.content
        
        except Exception as e:
            logger.error(f"❌ Ollama generation error: {e}")
            yield f"Error generating response: {str(e)}"
    
    async def is_available(self) -> bool:
        """
        Check if Ollama is available.
        
        Returns:
            bool: True if Ollama is available
        """
        try:
            # Test with a simple message
            test_messages = [{"role": "user", "content": "test"}]
            langchain_messages = self._convert_to_langchain_messages(test_messages)
            
            # Try to get at least one chunk
            async for _ in self.llm.astream(langchain_messages):
                return True
            return False
        except Exception as e:
            logger.error(f"❌ Ollama availability check failed: {e}")
            return False
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get Ollama model information.
        
        Returns:
            Dict containing model information
        """
        return {
            "name": self.model,
            "provider": ProviderType.OLLAMA,
            "type": ModelType.LOCAL,
            "description": f"Local Ollama model: {self.model}",
            "temperature": self.temperature,
            "supports_streaming": True,
            "supports_tools": True
        }
