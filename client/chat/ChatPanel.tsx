import { useEffect, useRef } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useChat } from "../hooks/useChat";

interface ChatPanelProps {
  isVisible: boolean;
  onClose?: () => void;
}

export function ChatPanel({ isVisible }: ChatPanelProps) {
  const { messages, isLoading, sendMessage, clearChat, stopGeneration } =
    useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message if no messages
  useEffect(() => {
    if (messages.length === 0 && isVisible) {
      // Add welcome message when chat becomes visible
      setTimeout(() => {
        // This simulates a system message
        // sendMessage(
        //   "Hello! I'm Ricky, your AI assistant. I can help you with questions, analysis, and much more. What would you like to work on today?"
        // );
      }, 100);
    }
  }, [isVisible, messages.length]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  const handleNewChat = () => {
    clearChat();
  };

  const handleStopGeneration = () => {
    stopGeneration();
  };

  return (
    <div
      className={`relative w-full max-w-3xl mt-10 transition-all duration-700 ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 -translate-y-4 scale-[0.98] pointer-events-none"
      }`}
    >
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/90 shadow-[0_0_16px_rgba(16,185,129,0.9)]"></div>
            <h2 className="text-base tracking-tight text-slate-100">Ricky</h2>
            {isLoading && (
              <span className="text-xs text-slate-400 animate-pulse">
                Thinking...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleNewChat}
              disabled={isLoading}
            >
              New Chat
            </Button>
            {isLoading && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleStopGeneration}
                className="text-red-400 hover:text-red-300"
              >
                Stop
              </Button>
            )}
          </div>
        </div>

        <div className="h-px bg-white/10"></div>

        {/* Messages */}
        <div className="px-5 py-5 space-y-4 max-h-[45vh] overflow-y-auto">
          {messages.length === 0 && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 grid place-items-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-fuchsia-400/20 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-200 tracking-tight leading-relaxed">
                  Hey! I'm Ricky, your AI assistant. I can help you with memory
                  management, file analysis, code execution, and much more. What
                  would you like to work on today?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "Analyze my codebase",
                    "Search my documents",
                    "Execute a script",
                    "Create a reminder",
                  ].map((suggestion, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="secondary"
                      className="text-xs"
                      onClick={() => handleSendMessage(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              type={message.type}
              content={message.content}
              timestamp={message.timestamp}
              suggestions={message.suggestions}
              isStreaming={message.isStreaming}
              onSuggestionClick={handleSendMessage}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div className="h-px bg-white/10"></div>

        {/* Input */}
        <div className="px-4 py-3">
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </Card>
    </div>
  );
}
