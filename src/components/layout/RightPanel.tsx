import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ChevronRight, FolderOpen, Code2, Database, Plug } from "lucide-react";

interface RightPanelProps {
  isVisible: boolean;
}

export function RightPanel({ isVisible }: RightPanelProps) {
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

        {/* Quick Actions */}
        <Card
          className={`pointer-events-auto w-[19rem] max-w-[85vw] p-4 transition-all duration-700 delay-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
            isVisible
              ? "translate-x-0 opacity-100 scale-100"
              : "translate-x-6 opacity-0 scale-[0.98]"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm tracking-tight text-slate-100">
              Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              className="flex-col gap-1 h-auto p-3 text-left"
            >
              <div className="flex items-center gap-2 self-start">
                <FolderOpen size={14} className="text-slate-300" />
                <span className="text-xs tracking-tight text-slate-200">
                  Analyze Files
                </span>
              </div>
              <div className="text-[10px] text-slate-400 self-start">
                Vector search
              </div>
            </Button>
            <Button
              variant="ghost"
              className="flex-col gap-1 h-auto p-3 text-left"
            >
              <div className="flex items-center gap-2 self-start">
                <Code2 size={14} className="text-slate-300" />
                <span className="text-xs tracking-tight text-slate-200">
                  Execute Code
                </span>
              </div>
              <div className="text-[10px] text-slate-400 self-start">
                Sandboxed
              </div>
            </Button>
            <Button
              variant="ghost"
              className="flex-col gap-1 h-auto p-3 text-left"
            >
              <div className="flex items-center gap-2 self-start">
                <Database size={14} className="text-slate-300" />
                <span className="text-xs tracking-tight text-slate-200">
                  Query Memory
                </span>
              </div>
              <div className="text-[10px] text-slate-400 self-start">
                Semantic search
              </div>
            </Button>
            <Button
              variant="ghost"
              className="flex-col gap-1 h-auto p-3 text-left"
            >
              <div className="flex items-center gap-2 self-start">
                <Plug size={14} className="text-slate-300" />
                <span className="text-xs tracking-tight text-slate-200">
                  Run Plugin
                </span>
              </div>
              <div className="text-[10px] text-slate-400 self-start">
                Integrations
              </div>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
