"""
Base model provider interface for multi-model support.
"""

from abc import ABC, abstractmethod
from typing import AsyncGenerator, List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class ModelProvider(ABC):
    """
    Abstract base class for all model providers.
    Defines the interface that all model providers must implement.
    """
    
    def __init__(self, model: str, **kwargs):
        """
        Initialize the model provider.
        
        Args:
            model: The specific model name/identifier
            **kwargs: Provider-specific configuration
        """
        self.model = model
        self.config = kwargs
        
    @abstractmethod
    async def generate_stream(
        self, 
        messages: List[Dict[str, str]], 
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """
        Generate streaming response from the model.
        
        Args:
            messages: List of messages in chat format
            **kwargs: Additional generation parameters
            
        Yields:
            str: Response chunks
        """
        pass
    
    @abstractmethod
    async def is_available(self) -> bool:
        """
        Check if the model provider is available and ready.
        
        Returns:
            bool: True if available, False otherwise
        """
        pass
    
    @abstractmethod
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the model.
        
        Returns:
            Dict containing model information
        """
        pass


class ModelType:
    """Constants for model types."""
    LOCAL = "local"
    ONLINE = "online"


class ProviderType:
    """Constants for provider types."""
    OLLAMA = "ollama"
    GEMINI = "gemini"
    OPENAI = "openai"  # For future use
    CLAUDE = "claude"  # For future use
