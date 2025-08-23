"""
Model manager for handling multiple LLM providers.
"""

import logging
from typing import Dict, List, Any, Optional
from .model_providers.base import ModelProvider, ModelType, ProviderType
from .model_providers.ollama_provider import OllamaProvider
from .model_providers.gemini_provider import GeminiProvider
from .ollama_service import OllamaService

logger = logging.getLogger(__name__)


class ModelManager:
    """
    Manages multiple model providers and handles model selection.
    """
    
    def __init__(self):
        """Initialize the model manager."""
        self.providers: Dict[str, ModelProvider] = {}
        self.ollama_service = OllamaService()
        
        # Predefined online models
        self.online_models = {
            "gemini-2.5-flash": {
                "name": "gemini-2.5-flash",
                "provider": ProviderType.GEMINI,
                "type": ModelType.ONLINE,
                "description": "Fast and efficient Gemini 2.5 Flash model",
                "supports_streaming": True,
                "supports_tools": False
            },
            "gemini-2.5-pro": {
                "name": "gemini-2.5-pro", 
                "provider": ProviderType.GEMINI,
                "type": ModelType.ONLINE,
                "description": "Advanced Gemini 2.5 Pro model with enhanced capabilities",
                "supports_streaming": True,
                "supports_tools": False
            }
        }
        
        logger.info("🎯 ModelManager initialized")
    
    async def get_provider(self, model: str) -> ModelProvider:
        """
        Get or create a provider for the specified model.
        
        Args:
            model: Model name/identifier
            
        Returns:
            ModelProvider instance
            
        Raises:
            ValueError: If model is not supported
        """
        # Check if provider already exists
        if model in self.providers:
            return self.providers[model]
        
        # Determine provider type and create instance
        if model in self.online_models:
            model_info = self.online_models[model]
            
            if model_info["provider"] == ProviderType.GEMINI:
                provider = GeminiProvider(model)
                self.providers[model] = provider
                return provider
            else:
                raise ValueError(f"Online provider not implemented: {model_info['provider']}")
        
        else:
            # Assume it's a local Ollama model
            try:
                provider = OllamaProvider(model)
                self.providers[model] = provider
                return provider
            except Exception as e:
                logger.error(f"❌ Failed to create Ollama provider for {model}: {e}")
                raise ValueError(f"Failed to create provider for model: {model}")
    
    async def get_available_models(self) -> List[Dict[str, Any]]:
        """
        Get list of all available models (local + online).
        
        Returns:
            List of model information dictionaries
        """
        models = []
        
        # Get local models from Ollama
        try:
            local_models = await self.ollama_service.get_available_models()
            for model_name in local_models:
                models.append({
                    "name": model_name,
                    "provider": ProviderType.OLLAMA,
                    "type": ModelType.LOCAL,
                    "description": f"Local Ollama model: {model_name}",
                    "supports_streaming": True,
                    "supports_tools": True,
                    "status": "available"
                })
        except Exception as e:
            logger.error(f"❌ Failed to get Ollama models: {e}")
        
        # Add online models
        for model_name, model_info in self.online_models.items():
            models.append({
                **model_info,
                "status": "available"  # We'll check availability separately if needed
            })
        
        return models
    
    async def check_model_availability(self, model: str) -> bool:
        """
        Check if a specific model is available.
        
        Args:
            model: Model name to check
            
        Returns:
            bool: True if model is available
        """
        try:
            provider = await self.get_provider(model)
            return await provider.is_available()
        except Exception as e:
            logger.error(f"❌ Failed to check availability for {model}: {e}")
            return False
    
    def get_model_info(self, model: str) -> Optional[Dict[str, Any]]:
        """
        Get information about a specific model.
        
        Args:
            model: Model name
            
        Returns:
            Model information dictionary or None if not found
        """
        # Check online models first
        if model in self.online_models:
            return self.online_models[model]
        
        # For local models, return basic info
        return {
            "name": model,
            "provider": ProviderType.OLLAMA,
            "type": ModelType.LOCAL,
            "description": f"Local Ollama model: {model}",
            "supports_streaming": True,
            "supports_tools": True
        }


# Global model manager instance
_model_manager = None


async def get_model_manager() -> ModelManager:
    """
    Get the global model manager instance.
    
    Returns:
        ModelManager instance
    """
    global _model_manager
    if _model_manager is None:
        _model_manager = ModelManager()
    return _model_manager
