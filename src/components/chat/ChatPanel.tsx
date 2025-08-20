import { useState, useEffect, useRef } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface ChatPanelProps {
  isVisible: boolean;
  onClose?: () => void;
}

export function ChatPanel({ isVisible }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hey! I'm Ricky, your AI assistant. I can help you with memory management, file analysis, code execution, and much more. What would you like to work on today?",
      timestamp: new Date(),
      suggestions: [
        "Analyze my codebase",
        "Search my documents",
        "Execute a script",
        "Create a reminder",
      ],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API call - replace with actual Ollama API call
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `I understand you're asking about "${content}". In the full implementation, I would process this through my memory system, check my knowledge base, and provide a comprehensive response. For now, this is just the UI phase.`,
        timestamp: new Date(),
        suggestions: [
          "Tell me more",
          "Search related docs",
          "Execute this",
          "Save to memory",
        ],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
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
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary">
              New Chat
            </Button>
            <Button size="sm" variant="secondary">
              Save
            </Button>
          </div>
        </div>

        <div className="h-px bg-white/10"></div>

        {/* Messages */}
        <div className="px-5 py-5 space-y-4 max-h-[45vh] overflow-y-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              type={message.type}
              content={message.content}
              timestamp={message.timestamp}
              suggestions={message.suggestions}
            />
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 grid place-items-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-fuchsia-400/20 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-400 tracking-tight">
                  Thinking...
                </p>
              </div>
            </div>
          )}

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
