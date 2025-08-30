import { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import {
  FileText,
  Folder,
  Upload,
  Search,
  Trash2,
  Eye,
  Filter,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useKnowledge } from "../../../hooks/useKnowledge";
import {
  formatFileSize,
  formatTimeAgo,
  getStatusInfo,
  getFilenameFromPath,
  isValidPath,
} from "../../utils/knowledge";

export function FilesModule() {
  const {
    sources,
    isLoading,
    isIngesting,
    error,
    ingestSource,
    deleteSource,
    refreshSources,
    clearError,
  } = useKnowledge();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "file" | "folder">(
    "all"
  );
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [pathInput, setPathInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);

  const getStatusBadge = (
    status: string,
    totalFiles?: number,
    processedFiles?: number
  ) => {
    const statusInfo = getStatusInfo({
      status: status as any,
      total_files: totalFiles || 0,
      processed_files: processedFiles || 0,
    } as any);

    return (
      <span
        className={`text-xs px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}
      >
        {statusInfo.text}
      </span>
    );
  };

  const filteredSources = sources.filter((source) => {
    const matchesSearch =
      source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || source.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleIngest = async () => {
    if (!isValidPath(pathInput)) {
      return;
    }

    try {
      clearError();
      const displayName = nameInput.trim() || getFilenameFromPath(pathInput);
      await ingestSource(pathInput, displayName);

      // Reset form
      setPathInput("");
      setNameInput("");
      setShowUploadForm(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDelete = async (sourceId: number) => {
    if (
      confirm(
        "Are you sure you want to delete this knowledge source? This action cannot be undone."
      )
    ) {
      try {
        await deleteSource(sourceId);
      } catch (error) {
        // Error is handled by the hook
      }
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">
            Knowledge Base
          </h1>
          <p className="text-sm text-slate-400">
            Manage uploaded files and folders for AI context
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={refreshSources}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowUploadForm(true)}
            disabled={isIngesting}
            className="gap-2"
          >
            <Upload size={16} />
            {isIngesting ? "Ingesting..." : "Add Source"}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-3">
            <AlertCircle size={16} className="text-red-400" />
            <div className="flex-1">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={clearError}>
              ×
            </Button>
          </div>
        </Card>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-100">
                Add Knowledge Source
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowUploadForm(false)}
              >
                ×
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  File or Folder Path *
                </label>
                <input
                  type="text"
                  placeholder="/path/to/file/or/folder"
                  value={pathInput}
                  onChange={(e) => setPathInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Display Name (optional)
                </label>
                <input
                  type="text"
                  placeholder="Custom name for this source"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Supported: .md, .txt, .pdf, .docx, .py, .js, .ts and more
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowUploadForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    console.log("sup");

                    handleIngest();
                  }}
                  disabled={!isValidPath(pathInput) || isIngesting}
                  className="gap-2"
                >
                  <Upload size={16} />
                  {isIngesting ? "Processing..." : "Add Source"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-2 p-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search knowledge sources..."
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
              onChange={(e) =>
                setFilterType(e.target.value as "all" | "file" | "folder")
              }
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
            <div className="text-xs text-slate-400">Total Sources</div>
            <div className="text-lg font-semibold text-slate-100">
              {sources.length}
            </div>
          </div>
        </Card>
      </div>

      {/* Sources List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-100">
            Knowledge Sources
          </h2>
          <div className="text-sm text-slate-400">
            {filteredSources.length} of {sources.length} sources
          </div>
        </div>

        <div className="space-y-2">
          {filteredSources.map((source) => (
            <div
              key={source.id}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                selectedFile === source.id.toString()
                  ? "bg-cyan-500/10 border-cyan-500/30"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
              onClick={() => setSelectedFile(source.id.toString())}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    {source.type === "folder" ? (
                      <Folder size={16} className="text-purple-300" />
                    ) : (
                      <FileText size={16} className="text-purple-300" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-slate-100">
                        {source.name}
                      </div>
                      {getStatusBadge(
                        source.status,
                        source.total_files,
                        source.processed_files
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {source.path}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>{formatFileSize(source.total_files)}</span>
                      {source.total_chunks > 0 && (
                        <span>{source.total_chunks} chunks</span>
                      )}
                      <span>Added {formatTimeAgo(source.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Eye size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(source.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredSources.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                <FileText size={24} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-200 mb-2">
                {sources.length === 0
                  ? "No knowledge sources"
                  : "No sources match your filters"}
              </h3>
              <p className="text-slate-400 mb-4">
                {searchQuery || filterType !== "all"
                  ? "Try adjusting your search or filters"
                  : "Add files or folders to build your knowledge base"}
              </p>
              {sources.length === 0 && (
                <Button
                  onClick={() => setShowUploadForm(true)}
                  className="gap-2"
                >
                  <Upload size={16} />
                  Add Your First Source
                </Button>
              )}
            </div>
          )}

          {isLoading && sources.length === 0 && (
            <div className="text-center py-12">
              <RefreshCw
                size={24}
                className="text-slate-400 animate-spin mx-auto mb-4"
              />
              <p className="text-slate-400">Loading knowledge sources...</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
