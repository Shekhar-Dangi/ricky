import { Bot, User } from "lucide-react";
import { Button } from "../ui/Button";

interface ChatMessageProps {
  type: "user" | "assistant";
  content: string;
  timestamp?: Date;
  suggestions?: string[];
  isStreaming?: boolean;
  onSuggestionClick?: (suggestion: string) => void;
}

export function ChatMessage({
  type,
  content,
  suggestions,
  isStreaming = false,
  onSuggestionClick,
}: ChatMessageProps) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-8 h-8 grid place-items-center rounded-xl border border-white/10 ${
          type === "assistant"
            ? "bg-gradient-to-br from-cyan-400/20 to-fuchsia-400/20"
            : "bg-white/10"
        }`}
      >
        {type === "assistant" ? (
          <Bot size={16} className={isStreaming ? "animate-pulse" : ""} />
        ) : (
          <User size={16} />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm text-slate-200 tracking-tight leading-relaxed">
            {content}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse"></span>
            )}
          </p>
        </div>

        {suggestions && suggestions.length > 0 && !isStreaming && (
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                size="sm"
                variant="secondary"
                className="text-xs"
                onClick={() => onSuggestionClick?.(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
