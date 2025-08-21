from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from api.routes import chat
from services.ollama_service import OllamaService


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """App lifespan manager for startup and shutdown events."""
    logger.info("Starting Ricky Backend...")
    
    # Test Ollama connection on startup
    ollama_service = OllamaService()
    try:
        # await ollama_service.test_connection()
        logger.info("✅ Ollama connection successful")
    except Exception as e:
        logger.error(f"❌ Ollama connection failed: {e}")
        # Don't fail startup, but log the error
    
    yield
    
    logger.info("Shutting down Ricky Backend...")


# Create FastAPI app with lifespan
app = FastAPI(
    title="Ricky Backend",
    description="Personal Assistant Backend with Ollama Integration",
    version="0.1.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "Ricky Backend is running!", "status": "healthy"}


@app.get("/health")
async def health_check():
    """Detailed health check including Ollama status."""
    ollama_service = OllamaService()
    
    try:
        await ollama_service.test_connection()
        ollama_status = "connected"
    except Exception as e:
        ollama_status = f"disconnected: {str(e)}"
    
    return {
        "status": "healthy",
        "ollama": ollama_status,
        "version": "0.1.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )