# Ricky Backend

Personal Assistant Backend with Ollama Integration

## Quick Start

1. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

2. **Make sure Ollama is running:**

   ```bash
   # Install Ollama if not already installed
   # Visit: https://ollama.ai/

   # Pull a model (e.g., llama3.2)
   ollama pull llama3.2

   # Start Ollama (if not already running)
   ollama serve
   ```

3. **Run the backend:**

   ```bash
   python run.py
   ```

   Server will start at: http://127.0.0.1:8000

## API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health check with Ollama status
- `POST /api/v1/chat/stream` - Stream chat response
- `POST /api/v1/chat/complete` - Get complete chat response
- `GET /api/v1/chat/models` - List available models
- `GET /api/v1/chat/status` - Chat service status

## Project Structure

```
backend/
├── main.py              # FastAPI app entry point
├── run.py              # Development server runner
├── requirements.txt    # Python dependencies
├── api/
│   └── routes/
│       └── chat.py     # Chat API endpoints
└── services/
    └── ollama_service.py # Ollama integration service
```

## Configuration

The backend is configured to:

- Run on port 8000
- Connect to Ollama at http://127.0.0.1:11434
- Allow CORS for frontend at http://localhost:5173
- Stream responses in real-time
- Handle errors gracefully

## Development

- Auto-reload is enabled in development mode
- Logs are configured at INFO level
- CORS is configured for Vite dev server
