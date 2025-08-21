import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Sparkles, Mic, ArrowUpRight } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // In a real app, integrate with Web Speech API here
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.code === "Space") {
        e.preventDefault();
        toggleListening();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-3 py-2">
        <Sparkles className="text-slate-300" size={16} />
        <Input
          ref={inputRef}
          variant="ghost"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
          className="flex-1"
        />
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={`w-8 h-8 p-0 ${
              isListening ? "ring-2 ring-cyan-400/50 bg-cyan-400/20" : ""
            }`}
            onClick={toggleListening}
          >
            <Mic size={14} />
          </Button>
          <Button
            type="submit"
            size="sm"
            variant="primary"
            className="w-8 h-8 p-0"
            disabled={!message.trim() || disabled}
          >
            <ArrowUpRight size={14} />
          </Button>
        </div>
      </div>

      {/* Voice indicator */}
      {isListening && (
        <div className="flex items-center justify-center gap-1 mt-2">
          <span className="w-1.5 h-3 rounded-full bg-cyan-400/70 animate-bounce"></span>
          <span className="w-1.5 h-5 rounded-full bg-cyan-300/70 animate-bounce delay-150"></span>
          <span className="w-1.5 h-7 rounded-full bg-cyan-200/70 animate-bounce delay-300"></span>
          <span className="w-1.5 h-5 rounded-full bg-cyan-300/70 animate-bounce delay-150"></span>
          <span className="w-1.5 h-3 rounded-full bg-cyan-400/70 animate-bounce"></span>
        </div>
      )}
    </form>
  );
}
