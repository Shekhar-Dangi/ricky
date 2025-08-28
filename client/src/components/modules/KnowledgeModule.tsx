import { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { FileText, Folder, Upload, Search, Plus, Trash2, RefreshCw, Eye } from "lucide-react";

interface ReferenceSource {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  status: "processing" | "ready" | "error";
  chunkCount: number;
  lastUpdated: string;
  size?: string;
}

export function KnowledgeModule() {
  const [references, setReferences] = useState<ReferenceSource[]>([
    {
      id: "1",
      name: "Project Documentation",
      path: "/docs/codebase",
      type: "folder",
      status: "ready",
      chunkCount: 156,
      lastUpdated: "2 hours ago",
      size: "2.3 MB"
    },
    {
      id: "2", 
      name: "React Components",
      path: "/src/components",
      type: "folder",
      status: "processing",
      chunkCount: 89,
      lastUpdated: "Processing...",
      size: "1.8 MB"
    },
    {
      id: "3",
      name: "API Reference",
      path: "/docs/api.md",
      type: "file",
      status: "ready",
      chunkCount: 24,
      lastUpdated: "1 day ago",
      size: "156 KB"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReference, setSelectedReference] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "text-green-400";
      case "processing": return "text-yellow-400";
      case "error": return "text-red-400";
      default: return "text-slate-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready": return <div className="w-2 h-2 rounded-full bg-green-400"></div>;
      case "processing": return <RefreshCw size={8} className="animate-spin text-yellow-400" />;
      case "error": return <div className="w-2 h-2 rounded-full bg-red-400"></div>;
      default: return <div className="w-2 h-2 rounded-full bg-slate-400"></div>;
    }
  };

  const filteredReferences = references.filter(ref =>
    ref.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ref.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Knowledge Base</h1>
          <p className="text-sm text-slate-400">Manage your reference files and folders</p>
        </div>
        <Button className="gap-2">
          <Plus size={16} />
          Add Reference
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search references..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <div className="text-xs text-slate-400">Total References</div>
            <div className="text-2xl font-semibold text-slate-100">{references.length}</div>
            <div className="text-xs text-slate-400">
              {references.reduce((acc, ref) => acc + ref.chunkCount, 0)} total chunks
            </div>
          </div>
        </Card>
      </div>

      {/* References List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-100">References</h2>
          <div className="text-sm text-slate-400">
            {filteredReferences.length} of {references.length}
          </div>
        </div>

        <div className="space-y-3">
          {filteredReferences.map((reference) => (
            <div
              key={reference.id}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                selectedReference === reference.id
                  ? "bg-cyan-500/10 border-cyan-500/30"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
              onClick={() => setSelectedReference(reference.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                    {reference.type === "folder" ? (
                      <Folder size={16} className="text-cyan-300" />
                    ) : (
                      <FileText size={16} className="text-cyan-300" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-slate-100">
                        {reference.name}
                      </div>
                      {getStatusIcon(reference.status)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {reference.path}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>{reference.chunkCount} chunks</span>
                      <span>{reference.size}</span>
                      <span className={getStatusColor(reference.status)}>
                        {reference.lastUpdated}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Eye size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <RefreshCw size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-300">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredReferences.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                <FileText size={24} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-200 mb-2">No references found</h3>
              <p className="text-slate-400 mb-4">
                {searchQuery ? "Try adjusting your search query" : "Add files or folders to get started"}
              </p>
              <Button className="gap-2">
                <Plus size={16} />
                Add Your First Reference
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Upload Zone */}
      <Card className="p-6">
        <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
          <Upload size={32} className="text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-200 mb-2">Drag and Drop Files or Folders</h3>
          <p className="text-slate-400 mb-4">
            Support for .md, .txt, .pdf, .docx files and entire folders
          </p>
          <Button variant="secondary" className="gap-2">
            <Plus size={16} />
            Browse Files
          </Button>
        </div>
      </Card>
    </div>
  );
}