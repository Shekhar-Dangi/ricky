#!/bin/bash

# Ricky Backend Setup Script

set -e

echo "🚀 Setting up Ricky Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.8+ and try again."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Navigate to backend directory
cd "$(dirname "$0")"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Backend dependencies installed successfully!"

# Check if Ollama is running
echo "🔍 Checking Ollama status..."
if curl -s http://127.0.0.1:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is running and accessible"
    
    # Check if any models are available
    models=$(curl -s http://127.0.0.1:11434/api/tags | grep -o '"name":"[^"]*"' | head -5)
    if [ -n "$models" ]; then
        echo "📚 Available models:"
        echo "$models" | sed 's/"name":"//g' | sed 's/"//g' | sed 's/^/  - /'
    else
        echo "⚠️  No models found. You may need to pull a model:"
        echo "   ollama pull llama3.2"
    fi
else
    echo "⚠️  Ollama is not running or not accessible at http://127.0.0.1:11434"
    echo "Please make sure:"
    echo "  1. Ollama is installed (visit https://ollama.ai/)"
    echo "  2. Ollama is running: ollama serve"
    echo "  3. A model is pulled: ollama pull llama3.2"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the backend:"
echo "  1. Activate virtual environment: source venv/bin/activate"
echo "  2. Run the server: python run.py"
echo ""
echo "The backend will be available at: http://127.0.0.1:8000"