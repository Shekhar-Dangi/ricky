/**
 * API utility functions for interacting with Ricky backend
 */

const BACKEND_URL = "http://127.0.0.1:8000";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  model?: string;
  temperature?: number;
  stream?: boolean;
}

export interface BackendStatus {
  status: string;
  ollama: string;
  message?: string;
  error?: string;
}

/**
 * Check if the backend is running and healthy
 */
export async function checkBackendStatus(): Promise<BackendStatus> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/chat/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return {
      status: "unreachable",
      ollama: "unknown",
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Cannot connect to backend",
    };
  }
}

/**
 * Get available models from Ollama
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/chat/models`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error("Failed to get models:", error);
    return [];
  }
}

/**
 * Test streaming chat functionality
 */
export async function testStreamingChat(
  message: string = "Hello, can you introduce yourself?"
): Promise<boolean> {
  try {
    const request: ChatRequest = {
      message,
      history: [],
      model: "llama3.2",
      temperature: 0.7,
      stream: true,
    };

    const response = await fetch(`${BACKEND_URL}/api/v1/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    return response.ok;
  } catch (error) {
    console.error("Streaming test failed:", error);
    return false;
  }
}

/**
 * Format error messages for user display
 */
export function formatApiError(error: any): string {
  if (error.name === "AbortError") {
    return "Request was cancelled.";
  }
  
  if (error.message?.includes("Failed to fetch")) {
    return "Cannot connect to the backend. Make sure the server is running at http://127.0.0.1:8000";
  }
  
  if (error.message?.includes("Ollama")) {
    return "Cannot connect to Ollama. Make sure Ollama is running with a model loaded.";
  }
  
  if (error.message?.includes("HTTP 500")) {
    return "Server error. Check the backend logs for details.";
  }
  
  if (error.message?.includes("HTTP 404")) {
    return "API endpoint not found. Make sure you're using the correct backend version.";
  }
  
  return error.message || "An unexpected error occurred.";
}