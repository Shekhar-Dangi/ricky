import { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Brain, MessageCircle, Search, Calendar, User, Settings, Trash2, Eye, Filter } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  messageCount: number;
  lastMessage: string;
  timestamp: string;
  duration: string;
}

interface MemoryInsight {
  id: string;
  type: "preference" | "pattern" | "context";
  title: string;
  description: string;
  confidence: number;
  lastSeen: string;
}

export function MemoryModule() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Memory System Design Discussion",
      messageCount: 24,
      lastMessage: "Let's implement the vector database for semantic search...",
      timestamp: "2 hours ago",
      duration: "45 min"
    },
    {
      id: "2",
      title: "API Integration Planning", 
      messageCount: 18,
      lastMessage: "The orchestrator should handle tool validation...",
      timestamp: "1 day ago",
      duration: "32 min"
    },
    {
      id: "3",
      title: "Frontend Architecture Review",
      messageCount: 31,
      lastMessage: "React components look good, let's add the sidebar...",
      timestamp: "2 days ago",
      duration: "1h 12min"
    }
  ]);

  const [insights, setInsights] = useState<MemoryInsight[]>([
    {
      id: "1",
      type: "preference",
      title: "Prefers TypeScript",
      description: "User consistently asks for TypeScript implementations",
      confidence: 95,
      lastSeen: "2 hours ago"
    },
    {
      id: "2", 
      type: "pattern",
      title: "Backend-First Development",
      description: "Typically implements backend logic before frontend",
      confidence: 88,
      lastSeen: "1 day ago"
    },
    {
      id: "3",
      type: "context",
      title: "Working on Personal Assistant",
      description: "Building an AI assistant called 'Ricky' with multi-model support",
      confidence: 100,
      lastSeen: "Active"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "recent" | "important">("all");

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "preference": return <User size={14} className="text-blue-400" />;
      case "pattern": return <Brain size={14} className="text-purple-400" />;
      case "context": return <MessageCircle size={14} className="text-green-400" />;
      default: return <Brain size={14} className="text-slate-400" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-400";
    if (confidence >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Memory</h1>
          <p className="text-sm text-slate-400">Conversation history and learned insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="gap-2">
            <Settings size={16} />
            Settings
          </Button>
          <Button variant="ghost" className="gap-2 text-red-400 hover:text-red-300">
            <Trash2 size={16} />
            Clear All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
              <MessageCircle size={16} className="text-blue-300" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Conversations</div>
              <div className="text-lg font-semibold text-slate-100">{conversations.length}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
              <Brain size={16} className="text-purple-300" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Insights</div>
              <div className="text-lg font-semibold text-slate-100">{insights.length}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400/20 to-emerald-500/20 border border-white/10 flex items-center justify-center">
              <Calendar size={16} className="text-green-300" />
            </div>
            <div>
              <div className="text-sm text-slate-400">This Week</div>
              <div className="text-lg font-semibold text-slate-100">12</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-white/10 flex items-center justify-center">
              <Brain size={16} className="text-yellow-300" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Memory Size</div>
              <div className="text-lg font-semibold text-slate-100">2.4 MB</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-slate-100">Recent Conversations</h2>
            <Button size="sm" variant="ghost">View All</Button>
          </div>

          <div className="space-y-1 mb-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm font-medium text-slate-100 line-clamp-1">
                    {conv.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <Eye size={12} />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400">
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-slate-400 line-clamp-2 mb-2">
                  {conv.lastMessage}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{conv.messageCount} messages</span>
                  <span>{conv.timestamp}</span>
                  <span>{conv.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Memory Insights */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-slate-100">Memory Insights</h2>
            <Button size="sm" variant="ghost">Manage</Button>
          </div>

          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <div className="text-sm font-medium text-slate-100">
                      {insight.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${getConfidenceColor(insight.confidence)}`}>
                      {insight.confidence}%
                    </span>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400">
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-slate-400 mb-2">
                  {insight.description}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="capitalize">{insight.type}</span>
                  <span>Last seen: {insight.lastSeen}</span>
                </div>
              </div>
            ))}
          </div>

          <Button variant="ghost" className="w-full mt-4 text-slate-400">
            View All Insights
          </Button>
        </Card>
      </div>
    </div>
  );
}