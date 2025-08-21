from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import logging
import json
from typing import List, Dict, Any
from langchain_ollama import ChatOllama
import asyncio

from services.ollama_service import OllamaService

logger = logging.getLogger(__name__)

# Create router for chat endpoints
router = APIRouter(prefix="/chat", tags=["chat"])
llm = ChatOllama(model="mistral:7b", validate_model_on_init=True)


class ChatMessage(BaseModel):
    """Individual chat message."""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    """Request model for chat completions."""
    message: str = Field(..., description="User message content")
    history: List[ChatMessage] = Field(default=[], description="Chat history")
    model: str = Field(default="llama3.2", description="Ollama model to use")
    temperature: float = Field(default=0.7, ge=0.0, le=1.0, description="Sampling temperature")
    stream: bool = Field(default=True, description="Whether to stream the response")


class ChatResponse(BaseModel):
    """Response model for non-streaming chat."""
    response: str = Field(..., description="Assistant response")
    model: str = Field(..., description="Model used")
    total_tokens: int = Field(default=0, description="Total tokens used (if available)")


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """
    Stream chat response from Ollama.
    
    This endpoint accepts a chat request and streams the response back
    token by token using Server-Sent Events (SSE) format.
    """
    try:
        # Build message history for Ollama
        messages = []
        
        # Add history messages
        for msg in request.history:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        logger.info(f"Starting chat stream for model: {request.model}")
        
        async def generate_stream():
            """Generator function for streaming response."""
            try:
                for chunk in llm.stream(messages):
                    # Each chunk is sent as a data field
                    yield f"data: {json.dumps({'chunk': chunk.content, 'done': False})}\n\n"
                    await asyncio.sleep(0)
                # Send completion signal
                yield f"data: {json.dumps({'chunk': '', 'done': True})}\n\n"
                
            except Exception as e:
                logger.error(f"Error in stream generation: {e}")
                # Send error in SSE format
                error_data = {
                    "error": str(e),
                    "done": True
                }
                yield f"data: {json.dumps(error_data)}\n\n"
        
        # Return streaming response with appropriate headers
        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"  # Disable nginx buffering
            }
        )
        
    except Exception as e:
        logger.error(f"Error in chat_stream endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/complete", response_model=ChatResponse)
async def chat_complete(request: ChatRequest):
    """
    Get complete (non-streaming) chat response from Ollama.
    
    This endpoint returns the full response at once, useful for
    cases where streaming is not needed.
    """
    try:
        # Initialize Ollama service
        ollama_service = OllamaService()
        
        # Build message history for Ollama
        messages = []
        
        # Add history messages
        for msg in request.history:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        logger.info(f"Getting complete response for model: {request.model}")
        
        response = await llm.invoke(messages).content
        
        return ChatResponse(
            response=response,
            model=request.model,
            total_tokens=0  # Ollama doesn't provide token counts yet
        )
        
    except Exception as e:
        logger.error(f"Error in chat_complete endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models")
async def get_models():
    """
    Get list of available Ollama models.
    
    Returns a list of models that can be used for chat completions.
    """
    try:
        ollama_service = OllamaService()
        models = await ollama_service.get_available_models()
        
        return {
            "models": models,
            "default": "llama3.2"
        }
        
    except Exception as e:
        logger.error(f"Error getting models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def chat_status():
    """
    Check chat service status and Ollama connectivity.
    """
    try:
        ollama_service = OllamaService()
        await ollama_service.test_connection()
        
        return {
            "status": "healthy",
            "ollama": "connected",
            "message": "Chat service is ready"
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "ollama": "disconnected",
            "error": str(e),
            "message": "Chat service is not ready"
        }