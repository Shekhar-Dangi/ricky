"""
Gemini model provider for Google AI models.
"""

import os
import logging
from typing import AsyncGenerator, List, Dict, Any
import asyncio
from pathlib import Path
from dotenv import load_dotenv


from .base import ModelProvider, ModelType, ProviderType

# Load environment variables from backend/.env
backend_dir = Path(__file__).parent.parent.parent
load_dotenv(backend_dir / '.env')

logger = logging.getLogger(__name__)


class GeminiProvider(ModelProvider):
    """
    Gemini provider for Google AI models.
    """
    
    def __init__(self, model: str, **kwargs):
        """
        Initialize Gemini provider.
        
        Args:
            model: Gemini model name (e.g., "gemini-2.5-flash", "gemini-2.5-pro")
            **kwargs: Additional configuration
        """
        super().__init__(model, **kwargs)
        
        self.temperature = kwargs.get('temperature', 0.7)
        self.api_key = os.getenv('GEMINI_API_KEY')
        
        # Initialize Gemini client lazily
        self._client = None
        
        if not self.api_key:
            logger.warning("⚠️ GEMINI_API_KEY environment variable not set")
        
        logger.info(f"🤖 Initialized Gemini provider with model: {model}")
    
    def _get_client(self):
        """
        Get or create Gemini client instance.
        
        Returns:
            Gemini client instance
        """
        if self._client is None:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
                logger.info("✅ Gemini client initialized successfully")
            except ImportError:
                logger.error("❌ Google GenAI library not installed. Run: pip install google-generativeai")
                raise ImportError("Google GenAI library not installed")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Gemini client: {e}")
                raise
        
        return self._client
    
    def _convert_to_gemini_messages(self, messages: List[Dict[str, str]]) -> str:
        """
        Convert chat messages to Gemini format.
        
        For now, we'll concatenate messages into a single prompt.
        In the future, we can implement proper conversation format.
        
        Args:
            messages: List of chat messages
            
        Returns:
            str: Formatted prompt for Gemini
        """
        formatted_messages = []
        
        for msg in messages:
            role = msg.get("role", "")
            content = msg.get("content", "")
            
            if role == "system":
                formatted_messages.append(f"System: {content}")
            elif role == "user":
                formatted_messages.append(f"User: {content}")
            elif role == "assistant":
                formatted_messages.append(f"Assistant: {content}")
        
        return "\n\n".join(formatted_messages)
    
    async def generate_stream(
        self, 
        messages: List[Dict[str, str]], 
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """
        Generate streaming response using Gemini.
        
        Args:
            messages: List of messages in chat format
            **kwargs: Additional generation parameters
            
        Yields:
            str: Response chunks
        """
        try:
            client = self._get_client()
            
            # Convert messages to Gemini format
            prompt = self._convert_to_gemini_messages(messages)
            
            logger.info(f"🤖 Generating Gemini stream with model: {self.model}")
            
            # Generate response
            # Note: Gemini API might not support streaming yet, so we'll simulate it
            response = await asyncio.to_thread(
                client.models.generate_content,
                model=self.model,
                contents=prompt
            )
            
            # Simulate streaming by yielding chunks
            if hasattr(response, 'text') and response.text:
                words = response.text.split()
                for i, word in enumerate(words):
                    if i == 0:
                        yield word
                    else:
                        yield " " + word
                    # Small delay to simulate streaming
                    await asyncio.sleep(0.01)
            else:
                yield "Sorry, I couldn't generate a response."
        
        except ImportError as e:
            logger.error(f"❌ Gemini import error: {e}")
            yield "Gemini provider not available. Please install google-generativeai library."
        except Exception as e:
            logger.error(f"❌ Gemini generation error: {e}")
            yield f"Error generating response with Gemini: {str(e)}"
    
    async def is_available(self) -> bool:
        """
        Check if Gemini is available.
        
        Returns:
            bool: True if Gemini is available
        """
        # Temporarily disabled until Google GenAI library is installed
        return False
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get Gemini model information.
        
        Returns:
            Dict containing model information
        """
        return {
            "name": self.model,
            "provider": ProviderType.GEMINI,
            "type": ModelType.ONLINE,
            "description": f"Google Gemini model: {self.model}",
            "temperature": self.temperature,
            "supports_streaming": True,  # Simulated for now
            "supports_tools": False,     # To be implemented
            "requires_api_key": True
        }
