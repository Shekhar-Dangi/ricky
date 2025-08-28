import { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { FileText, Folder, Upload, Search, Download, Trash2, Eye, Filter } from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  size: string;
  modified: string;
  status: "uploaded" | "processing" | "indexed";
}

export function FilesModule() {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: "README.md",
      path: "/docs/README.md",
      type: "file",
      size: "12.5 KB",
      modified: "2 hours ago",
      status: "indexed"
    },
    {
      id: "2",
      name: "API Documentation",
      path: "/docs/api",
      type: "folder",
      size: "2.1 MB",
      modified: "1 day ago", 
      status: "indexed"
    },
    {
      id: "3",
      name: "project-notes.txt",
      path: "/notes/project-notes.txt",
      type: "file",
      size: "8.2 KB",
      modified: "3 days ago",
      status: "uploaded"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "file" | "folder">("all");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "indexed": return "text-green-400";
      case "processing": return "text-yellow-400";
      case "uploaded": return "text-blue-400";
      default: return "text-slate-400";
    }
  };

  const getStatusBadge = (status: string) => {
    const color = getStatusColor(status);
    return (
      <span className={`text-xs px-2 py-1 rounded-full bg-white/10 ${color}`}>
        {status}
      </span>
    );
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || file.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Files</h1>
          <p className="text-sm text-slate-400">Manage uploaded files and folders</p>
        </div>
        <Button className="gap-2">
          <Upload size={16} />
          Upload Files
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-2 p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as "all" | "file" | "folder")}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="all">All Types</option>
              <option value="file">Files Only</option>
              <option value="folder">Folders Only</option>
            </select>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-400">Total Files</div>
            <div className="text-lg font-semibold text-slate-100">{files.length}</div>
          </div>
        </Card>
      </div>

      {/* Files List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-100">Files & Folders</h2>
          <div className="text-sm text-slate-400">
            {filteredFiles.length} of {files.length} items
          </div>
        </div>

        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                selectedFile === file.id
                  ? "bg-cyan-500/10 border-cyan-500/30"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
              onClick={() => setSelectedFile(file.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    {file.type === "folder" ? (
                      <Folder size={16} className="text-purple-300" />
                    ) : (
                      <FileText size={16} className="text-purple-300" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-slate-100">
                        {file.name}
                      </div>
                      {getStatusBadge(file.status)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {file.path}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>{file.size}</span>
                      <span>Modified {file.modified}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Eye size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Download size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-300">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                <FileText size={24} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-200 mb-2">No files found</h3>
              <p className="text-slate-400 mb-4">
                {searchQuery ? "Try adjusting your search query" : "Upload files to get started"}
              </p>
              <Button className="gap-2">
                <Upload size={16} />
                Upload Your First File
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Upload Zone */}
      <Card className="p-6">
        <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
          <Upload size={32} className="text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-200 mb-2">Drag and Drop Files</h3>
          <p className="text-slate-400 mb-4">
            Support for .md, .txt, .pdf, .docx and many more formats
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="secondary" className="gap-2">
              <Upload size={16} />
              Browse Files
            </Button>
            <Button variant="ghost" className="gap-2">
              <Folder size={16} />
              Select Folder
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}