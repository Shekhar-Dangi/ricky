import { useState } from "react";
import { Button } from "../ui/Button";
import { Database, MessageCircle, File, Settings, Zap } from "lucide-react";

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const modules = [
    { id: "chat", label: "Chat", icon: <MessageCircle size={16} /> },
    { id: "memory", label: "Memory", icon: <Database size={16} /> },
    { id: "files", label: "Files", icon: <File size={16} /> },
    { id: "actions", label: "Actions", icon: <Zap size={16} /> },
    { id: "settings", label: "Settings", icon: <Settings size={16} /> },
  ];

  return (
    <aside
      className={`group fixed z-30 left-4 top-4 bottom-4 transition-[width] duration-500 ease-out ${
        isExpanded ? "w-48" : "w-[4.25rem]"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="h-full rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden">
        {/* Brand */}
        <div className="mx-3 mb-2 h-px bg-white/10"></div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-1">
          {modules.map((module) => (
            <Button
              key={module.id}
              variant="ghost"
              className={`w-full justify-center gap-3 px-3 py-3 cursor-pointer ${
                activeModule === module.id ? "bg-white/10 text-slate-100" : ""
              } ${isExpanded ? "justify-start" : "justify-center"}`}
              onClick={() => onModuleChange(module.id)}
            >
              <span
                className={`transition-opacity duration-300 text-sm tracking-tight `}
              >
                {" "}
                {module.icon}
              </span>

              <span
                className={`transition-display duration-300 text-xs tracking-tight ${
                  isExpanded ? "block" : "hidden"
                }`}
              >
                {module.label}
              </span>
            </Button>
          ))}
        </nav>

        <div className="mx-3 my-2 h-px bg-white/10"></div>
      </div>
    </aside>
  );
}
