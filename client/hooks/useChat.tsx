import { useState, useCallback, useRef } from "react";
import { formatApiError } from "../src/utils/api";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  isStreaming?: boolean;
}

const BACKEND_URL = "http://127.0.0.1:8000";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Create assistant message placeholder for streaming
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        type: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      try {
        // Cancel any previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();

        // Convert messages to API format (exclude the placeholder we just added)
        const historyMessages = messages.map((msg) => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.content,
        }));

        // Prepare request payload
        const requestData = {
          message: content,
          history: historyMessages,
          model: "mistral:7b",
          temperature: 0.7,
          stream: true,
        };

        // Make streaming request to backend
        const response = await fetch(`${BACKEND_URL}/api/v1/chat/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        // Process streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = "";

        try {
          while (true) {
            const { value, done } = await reader.read();

            if (done) break;

            // Decode chunk and process each line
            const chunk = decoder.decode(value, { stream: true });
            console.log("Raw chunk received:", chunk);
            const lines = chunk.split("\n");

            for (const line of lines) {
              const trimmedLine = line.trim();

              // Skip empty lines
              if (!trimmedLine) continue;

              console.log("Processing line:", trimmedLine);

              // Parse Server-Sent Events format
              if (trimmedLine.startsWith("data: ")) {
                const dataStr = trimmedLine.slice(6); // Remove 'data: ' prefix

                try {
                  const data = JSON.parse(dataStr);
                  console.log("Parsed data:", data);

                  // Check for errors
                  if (data.error) {
                    throw new Error(data.error);
                  }

                  // Check if stream is complete
                  if (data.done) {
                    console.log("Stream completed");
                    // Mark streaming as complete and add suggestions
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? {
                              ...msg,
                              isStreaming: false,
                              suggestions: [
                                "Continue this topic",
                                "Ask follow-up",
                                "New question",
                                "Explain more",
                              ],
                            }
                          : msg
                      )
                    );
                    break;
                  }

                  // Update message with new chunk
                  if (data.chunk) {
                    accumulatedContent += data.chunk;
                    console.log(
                      "🔄 Adding chunk:",
                      JSON.stringify(data.chunk),
                      "Total length:",
                      accumulatedContent.length
                    );

                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: accumulatedContent }
                          : msg
                      )
                    );
                  }
                } catch (parseError) {
                  console.warn(
                    "Failed to parse SSE data:",
                    dataStr,
                    parseError
                  );
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      } catch (error: any) {
        console.error("Error sending message:", error);

        // Use utility function to format error message
        const errorMessage = formatApiError(error);

        // Update the assistant message with error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: errorMessage,
                  isStreaming: false,
                  suggestions: [
                    "Try again",
                    "Check connection",
                    "Restart services",
                  ],
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages]
  );

  const clearChat = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setIsLoading(false);
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);

    // Mark any streaming message as complete
    setMessages((prev) =>
      prev.map((msg) =>
        msg.isStreaming ? { ...msg, isStreaming: false } : msg
      )
    );
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    stopGeneration,
  };
}
