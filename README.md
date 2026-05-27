# 🤖 Ricky - Local AI Assistant

A personal AI assistant that runs entirely on your machine. Chat with your documents using local LLMs.
This is a good LLM.
[![Ricky Demo](https://img.youtube.com/vi/JA3602zM1L0/maxresdefault.jpg)](https://youtu.be/JA3602zM1L0)

## Why Ricky?

I wanted an AI assistant that:

- **Runs locally** - No data leaves your machine
- **Works with my files** - Upload documents and chat about them
- **Uses local LLMs** - No API costs or internet dependency
- **Keeps it simple** - Just chat and knowledge management

## What it does

- **Upload documents** (markdown, text files) to build your knowledge base
- **Chat naturally** and get answers from your documents
- **See sources** - Know exactly which files the AI used to answer
- **Works offline** - Everything runs on your computer

## Installation

### 1. Prerequisites

- Python 3.11+
- Node.js 18+
- [Ollama](https://ollama.ai) for local LLMs

### 2. Backend Setup

```bash
git clone <your-repo>
cd ricky/backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend
python -m uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd ../client
npm install
npm run dev
```

### 4. Setup Ollama

```bash
# Install Ollama
brew install ollama  # macOS
# Or download from ollama.ai

# Pull a model
ollama pull llama3.2

# Start Ollama
ollama serve
```

## Usage

1. **Add documents**: Go to Files → Add Source → paste your file/folder path
2. **Wait for processing**: Watch the progress as it chunks and indexes your files
3. **Start chatting**: Ask questions about your documents
4. **See sources**: Responses show which files were used

## Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: FastAPI + Python
- **LLMs**: Ollama (local) + Gemini (optional)
- **Vector DB**: ChromaDB
- **Database**: SQLite

---

_Built for privacy-conscious users who want AI assistance without cloud dependency._

## ✨ Features

### 🧠 **Intelligent Chat System**

- **Streaming conversations** with local LLMs (Llama, Gemini)
- **RAG-powered responses** using your personal knowledge base
- **Real-time message streaming** with proper error handling
- **Multiple LLM provider support** (Ollama, Gemini)

### 📚 **Knowledge Base Management**

- **Smart document ingestion** - Upload files or entire folders
- **Semantic search** across all your documents
- **Chunk-based processing** with sliding window technique
- **Progress tracking** for large document processing
- **Automatic embedding generation** using sentence-transformers

## 🏗️ Architecture

```
Frontend (React + TypeScript)     Backend (FastAPI + Python)
├── Chat Interface                ├── LLM Orchestration
├── Knowledge Management          ├── RAG Search Engine
├── File Upload System           ├── Document Processing
└── Real-time Updates            └── Vector Storage (ChromaDB)

                    Storage Layer
            ├── SQLite (Metadata)
            ├── ChromaDB (Embeddings)
            └── Local File System
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Ollama** (for local LLM inference)

### Backend Setup

```bash
# Clone and navigate
git clone <your-repo-url>
cd ricky/backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
# Navigate to client
cd ../client

# Install dependencies
npm install

# Start development server
npm run dev
```

### Ollama Setup

```bash
# Install Ollama (macOS)
brew install ollama

# Pull a model
ollama pull llama3.2

# Start Ollama service
ollama serve
```

## 📖 Usage

### 1. **Upload Knowledge Sources**

- Navigate to the **Files** module
- Click "Add Source" and paste your file/folder path
- Monitor processing progress in real-time
- Supported formats: `.md`, `.txt` (more coming soon)

### 2. **Chat with Your Knowledge**

- Start a conversation in the **Chat** module
- Ask questions about your uploaded documents
- See source citations in responses
- Responses automatically include relevant context from your knowledge base

### 3. **Search Your Knowledge**

- Use the search functionality in the Files module
- Semantic search finds content by meaning, not just keywords
- Adjust similarity thresholds for precision vs. recall

## 🛠️ API Endpoints

### Knowledge Management

```bash
# Ingest documents
POST /api/v1/resource/ingest
Body: { "path": "/path/to/document" }

# List all sources
GET /api/v1/resource/list

# Search knowledge base
GET /api/v1/resource/search?query=your+query&limit=10&threshold=0.7

# Delete source
DELETE /api/v1/resource/{source_id}
```

### Chat

```bash
# Streaming chat with RAG
POST /api/v1/chat/stream
Body: { "message": "Your question", "history": [...], "model": "llama3.2" }

# Get available models
GET /api/v1/chat/models

# Health check
GET /api/v1/chat/status
```

## 🔧 Configuration

### Environment Variables

```bash
# Optional: For Gemini support
GOOGLE_API_KEY=your_gemini_api_key

# Default model settings
DEFAULT_MODEL=llama3.2
DEFAULT_TEMPERATURE=0.7
```

### Supported File Types

- **Text**: `.txt`, `.md`
- **Coming Soon**: `.pdf`, `.docx`, `.py`, `.js`, `.ts`

## 📁 Project Structure

```
ricky/
├── backend/                 # FastAPI backend
│   ├── api/routes/         # API endpoints
│   ├── database/           # SQLModel schemas
│   ├── services/           # Business logic
│   ├── prompts/            # System prompts
│   └── main.py            # FastAPI app
├── client/                 # React frontend
│   ├── src/components/    # UI components
│   ├── hooks/             # Custom React hooks
│   └── utils/             # API utilities
├── chroma_db/             # Vector database (auto-created)
├── knowledge_base.db      # SQLite database (auto-created)
└── README.md
```

## 🎯 What's Working

- ✅ **Document ingestion** with progress tracking
- ✅ **RAG-powered chat** with source citations
- ✅ **Semantic search** across knowledge base
- ✅ **Multiple LLM providers** (Ollama, Gemini)
- ✅ **Real-time streaming** responses
- ✅ **Knowledge management** UI
- ✅ **Session persistence** and error handling

## 🚧 Coming Next

- � **Chat history** - Persistent conversation storage and retrieval
- � **Reference system** - Use @ to reference specific files or past chats
- ✍️ **Auto journaling** - Generate daily notes/summaries based on conversations
- ⚡ **Task execution** - Run local scripts and commands through chat
- � **Offline tasks** - Local reminders and task management
- � **Smart notifications** - Context-aware alerts and updates
- 📁 **More file formats** (PDF, DOCX, code files)
- 🧠 **Conversation memory** - Reference past discussions in new chats

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
