from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import logging
import json
from typing import List, Dict, Any
import asyncio


from services.ollama_service import OllamaService
from orchestrator import create_orchestrator

logger = logging.getLogger(__name__)

# Create router for chat endpoints
router = APIRouter(prefix="/chat", tags=["chat"])


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
    Stream chat response with orchestration support.
    
    This endpoint accepts a chat request and streams the response back
    token by token using Server-Sent Events (SSE) format. It now includes
    tool orchestration capabilities.
    """
    try:
        # Convert history to the format expected by orchestrator
        history = []
        for msg in request.history:
            history.append({
                "role": msg.role,
                "content": msg.content
            })
        logger.info(f"Starting orchestrated chat stream for model: {request.model}")
        
        async def generate_stream():
            """Generator function for streaming response with orchestration."""
            try:
                
                # Create orchestrator
                orchestrator = await create_orchestrator(model=request.model)
                
                # Process message through orchestration pipeline
                async for chunk in orchestrator.process_message(request.message, history):
                    # Send each chunk in SSE format
                    yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"
                    await asyncio.sleep(0)
                
                # Send completion signal
                yield f"data: {json.dumps({'chunk': '', 'done': True})}\n\n"
                
            except Exception as e:
                logger.error(f"Error in orchestrated stream generation: {e}")
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
    Get complete (non-streaming) chat response with orchestration support.
    
    This endpoint returns the full response at once, useful for
    cases where streaming is not needed.
    """
    try:
        # Convert history to the format expected by orchestrator
        history = []
        for msg in request.history:
            history.append({
                "role": msg.role,
                "content": msg.content
            })
        
        logger.info(f"Getting complete orchestrated response for model: {request.model}")
        
        # Create orchestrator
        orchestrator = await create_orchestrator(model=request.model)
        
        # Collect all chunks into a complete response
        complete_response = ""
        async for chunk in orchestrator.process_message(request.message, history):
            complete_response += chunk
        
        return ChatResponse(
            response=complete_response,
            model=request.model,
            total_tokens=0  # Ollama doesn't provide token counts yet
        )
        
    except Exception as e:
        logger.error(f"Error in chat_complete endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models")
async def get_models():
    """
    Get list of available models from all providers.
    
    Returns a list of models that can be used for chat completions.
    """
    try:
        from services.model_manager import get_model_manager
        
        model_manager = await get_model_manager()
        models = await model_manager.get_available_models()
        
        return {
            "models": models,
            "default": "mistral:7b"
        }
        
    except Exception as e:
        logger.error(f"Error getting models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def chat_status():
    """
    Check chat service status and model providers connectivity.
    """
    try:
        from services.model_manager import get_model_manager
        
        # Test Ollama service
        ollama_service = OllamaService()
        await ollama_service.test_connection()
        ollama_status = "connected"
        
        # Test model manager
        try:
            model_manager = await get_model_manager()
            models = await model_manager.get_available_models()
            model_manager_status = f"ready ({len(models)} models available)"
        except Exception as e:
            model_manager_status = f"error: {str(e)}"
        
        # Test orchestrator creation
        try:
            orchestrator = await create_orchestrator()
            orchestration_status = "ready"
        except Exception as e:
            orchestration_status = f"error: {str(e)}"
        
        # Test Google Calendar connection
        try:
            from services.google_calendar_service import test_calendar_connection
            calendar_status = await test_calendar_connection()
        except Exception as e:
            calendar_status = {"status": "error", "message": str(e)}
        
        return {
            "status": "healthy",
            "ollama": ollama_status,
            "model_manager": model_manager_status,
            "orchestration": orchestration_status,
            "google_calendar": calendar_status,
            "tools": ["google_calendar_events"],
            "message": "Chat service with multi-model support is ready"
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "ollama": "disconnected",
            "model_manager": "unavailable",
            "orchestration": "unavailable",
            "google_calendar": {"status": "error", "message": "Not tested due to service failure"},
            "error": str(e),
            "message": "Chat service is not ready"
        }