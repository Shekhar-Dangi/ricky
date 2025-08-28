import { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Zap, Calendar, Mail, FileText, Globe, Settings, Plus, Play, Pause, Edit } from "lucide-react";

interface Action {
  id: string;
  name: string;
  description: string;
  category: "calendar" | "email" | "files" | "web" | "custom";
  isEnabled: boolean;
  lastUsed?: string;
  usageCount: number;
}

export function ActionsModule() {
  const [actions, setActions] = useState<Action[]>([
    {
      id: "1",
      name: "Google Calendar Events",
      description: "Get upcoming events from your Google Calendar",
      category: "calendar",
      isEnabled: true,
      lastUsed: "2 hours ago",
      usageCount: 24
    },
    {
      id: "2",
      name: "Send Email",
      description: "Compose and send emails through Gmail",
      category: "email", 
      isEnabled: false,
      usageCount: 0
    },
    {
      id: "3",
      name: "Create Note",
      description: "Create and save notes to your knowledge base",
      category: "files",
      isEnabled: true,
      lastUsed: "1 day ago",
      usageCount: 8
    },
    {
      id: "4",
      name: "Web Search",
      description: "Search the web for current information",
      category: "web",
      isEnabled: false,
      usageCount: 0
    },
    {
      id: "5",
      name: "Weather Check",
      description: "Get current weather conditions",
      category: "web",
      isEnabled: true,
      lastUsed: "3 days ago", 
      usageCount: 12
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "calendar": return <Calendar size={16} className="text-blue-400" />;
      case "email": return <Mail size={16} className="text-green-400" />;
      case "files": return <FileText size={16} className="text-purple-400" />;
      case "web": return <Globe size={16} className="text-cyan-400" />;
      case "custom": return <Zap size={16} className="text-yellow-400" />;
      default: return <Zap size={16} className="text-slate-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "calendar": return "from-blue-400/20 to-blue-500/20 border-blue-500/30";
      case "email": return "from-green-400/20 to-green-500/20 border-green-500/30";
      case "files": return "from-purple-400/20 to-purple-500/20 border-purple-500/30";
      case "web": return "from-cyan-400/20 to-cyan-500/20 border-cyan-500/30";
      case "custom": return "from-yellow-400/20 to-yellow-500/20 border-yellow-500/30";
      default: return "from-slate-400/20 to-slate-500/20 border-slate-500/30";
    }
  };

  const categories = [
    { id: "all", name: "All Actions", count: actions.length },
    { id: "calendar", name: "Calendar", count: actions.filter(a => a.category === "calendar").length },
    { id: "email", name: "Email", count: actions.filter(a => a.category === "email").length },
    { id: "files", name: "Files", count: actions.filter(a => a.category === "files").length },
    { id: "web", name: "Web", count: actions.filter(a => a.category === "web").length },
    { id: "custom", name: "Custom", count: actions.filter(a => a.category === "custom").length }
  ];

  const filteredActions = selectedCategory === "all" 
    ? actions 
    : actions.filter(action => action.category === selectedCategory);

  const enabledActions = actions.filter(a => a.isEnabled).length;

  const toggleAction = (id: string) => {
    setActions(actions.map(action => 
      action.id === id ? { ...action, isEnabled: !action.isEnabled } : action
    ));
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Actions</h1>
          <p className="text-sm text-slate-400">Manage available tools and integrations</p>
        </div>
        <Button className="gap-2">
          <Plus size={16} />
          Create Action
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400/20 to-emerald-500/20 border border-white/10 flex items-center justify-center">
              <Zap size={16} className="text-green-300" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Active</div>
              <div className="text-lg font-semibold text-slate-100">{enabledActions}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
              <Settings size={16} className="text-blue-300" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Total</div>
              <div className="text-lg font-semibold text-slate-100">{actions.length}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
              <Play size={16} className="text-purple-300" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Used Today</div>
              <div className="text-lg font-semibold text-slate-100">7</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-white/10 flex items-center justify-center">
              <Calendar size={16} className="text-yellow-300" />
            </div>
            <div>
              <div className="text-sm text-slate-400">This Week</div>
              <div className="text-lg font-semibold text-slate-100">45</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories */}
        <Card className="p-4">
          <h2 className="text-lg font-medium text-slate-100 mb-4">Categories</h2>
          <div className="space-y-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "secondary" : "ghost"}
                className="w-full justify-between"
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="text-sm">{category.name}</span>
                <span className="text-xs text-slate-400">{category.count}</span>
              </Button>
            ))}
          </div>
        </Card>

        {/* Actions List */}
        <Card className="lg:col-span-3 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-slate-100">
              {selectedCategory === "all" ? "All Actions" : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <div className="text-sm text-slate-400">
              {filteredActions.length} actions
            </div>
          </div>

          <div className="space-y-3">
            {filteredActions.map((action) => (
              <div
                key={action.id}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br border ${getCategoryColor(action.category)} flex items-center justify-center`}>
                      {getCategoryIcon(action.category)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-slate-100">
                          {action.name}
                        </div>
                        <div className={`w-2 h-2 rounded-full ${action.isEnabled ? "bg-green-400" : "bg-slate-500"}`}></div>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {action.description}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>Used {action.usageCount} times</span>
                        {action.lastUsed && <span>Last used {action.lastUsed}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Edit size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant={action.isEnabled ? "ghost" : "secondary"}
                      className="h-8 w-8 p-0"
                      onClick={() => toggleAction(action.id)}
                    >
                      {action.isEnabled ? <Pause size={14} /> : <Play size={14} />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredActions.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                  <Zap size={24} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-200 mb-2">No actions in this category</h3>
                <p className="text-slate-400 mb-4">
                  Create your first action to get started
                </p>
                <Button className="gap-2">
                  <Plus size={16} />
                  Create Action
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}