import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ChevronRight, ChevronDown, Cpu, Cloud, HardDrive } from "lucide-react";

interface Model {
  name: string;
  provider: string;
  type: string;
  description: string;
  supports_streaming: boolean;
  supports_tools: boolean;
  status: string;
}

interface RightPanelProps {
  isVisible: boolean;
  availableModels: Model[];
  selectedModel: string;
  onModelSelect: (model: string) => void;
}

export function RightPanel({
  isVisible,
  availableModels,
  selectedModel,
  onModelSelect,
}: RightPanelProps) {
  const getModelIcon = (type: string, provider: string) => {
    if (type === "local") {
      return <HardDrive size={14} className="text-slate-300" />;
    } else if (provider === "gemini") {
      return <Cloud size={14} className="text-slate-300" />;
    }
    return <Cpu size={14} className="text-slate-300" />;
  };

  const getModelDisplayName = (name: string) => {
    if (name === "gemini-2.5-flash") {
      return "Gemini 2.5 Flash";
    } else if (name === "gemini-2.5-pro") {
      return "Gemini 2.5 Pro";
    }
    return name;
  };
  return (
    <div
      className={`fixed z-20 right-4 top-4 bottom-4 pointer-events-none transition-all duration-500 ${
        isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-6 pointer-events-none"
      }`}
    >
      <div className="relative h-full flex flex-col items-end gap-3">
        {/* Conversation History */}
        <Card
          className={`pointer-events-auto w-[19rem] max-w-[85vw] mt-16 p-4 transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
            isVisible
              ? "translate-x-0 opacity-100 scale-100"
              : "translate-x-6 opacity-0 scale-[0.98]"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm tracking-tight text-slate-100">
              Chat History
            </h3>
            <Button size="sm" variant="secondary">
              View All
            </Button>
          </div>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto"
            >
              <span className="text-xs text-slate-200 tracking-tight line-clamp-1">
                Memory System Design
              </span>
              <ChevronRight size={14} className="text-slate-400" />{" "}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto"
            >
              <span className="text-xs text-slate-200 tracking-tight line-clamp-1">
                API Integration Planning
              </span>
              <ChevronRight size={14} className="text-slate-400" />
            </Button>
          </div>
        </Card>

        {/* Knowledge Base */}
        <Card
          className={`pointer-events-auto w-[19rem] max-w-[85vw] p-4 transition-all duration-700 delay-150 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
            isVisible
              ? "translate-x-0 opacity-100 scale-100"
              : "translate-x-6 opacity-0 scale-[0.98]"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm tracking-tight text-slate-100">
              Knowledge Base
            </h3>
            <Button size="sm" variant="secondary">
              Index
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-2xl px-3 py-2 bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-400/30 to-sky-500/20 border border-white/10"></div>
                <div>
                  <div className="text-xs tracking-tight text-slate-100">
                    /docs/codebase
                  </div>
                  <div className="text-[10px] text-slate-400">156 chunks</div>
                </div>
              </div>
              <Button size="sm" variant="secondary">
                Update
              </Button>
            </div>
          </div>
        </Card>

        {/* Model Selection */}
        <Card
          className={`pointer-events-auto w-[19rem] max-w-[85vw] p-4 transition-all duration-700 delay-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
            isVisible
              ? "translate-x-0 opacity-100 scale-100"
              : "translate-x-6 opacity-0 scale-[0.98]"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm tracking-tight text-slate-100">LLM</h3>
            <div className="text-xs text-slate-400">
              {availableModels.length} available
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableModels.map((model) => (
              <Button
                key={model.name}
                variant={selectedModel === model.name ? "secondary" : "ghost"}
                className="w-full justify-start p-3 h-auto"
                onClick={() => {
                  onModelSelect(model.name);
                }}
              >
                <div className="flex items-center gap-2">
                  {getModelIcon(model.type, model.provider)}
                  <div className="text-left">
                    <div className="text-xs tracking-tight text-slate-200">
                      {getModelDisplayName(model.name)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {model.type === "local" ? "Local" : "Online"} •{" "}
                      {model.provider}
                    </div>
                  </div>
                </div>
                {selectedModel === model.name && (
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                )}
              </Button>
            ))}
            {availableModels.length === 0 && (
              <div className="text-xs text-slate-400 text-center py-4">
                No models available
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
