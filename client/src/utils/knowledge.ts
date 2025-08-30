import type { KnowledgeSource } from "./api";

/**
 * Format file size from backend data
 */
export function formatFileSize(totalFiles: number): string {
  if (totalFiles === 0) return "0 files";
  if (totalFiles === 1) return "1 file";
  return `${totalFiles} files`;
}

/**
 * Format the last modified time from ISO string
 */
export function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Get processing progress as percentage
 */
export function getProcessingProgress(source: KnowledgeSource): number {
  if (source.total_files === 0) return 0;
  return Math.round((source.processed_files / source.total_files) * 100);
}

/**
 * Get status display text and color
 */
export function getStatusInfo(source: KnowledgeSource) {
  switch (source.status) {
    case "completed":
      return {
        text: "Indexed",
        color: "text-green-400",
        bgColor: "bg-green-400/10",
      };
    case "processing":
      const progress = getProcessingProgress(source);
      return {
        text: `Processing ${progress}%`,
        color: "text-yellow-400",
        bgColor: "bg-yellow-400/10",
      };
    case "pending":
      return {
        text: "Pending",
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
      };
    case "failed":
      return {
        text: "Failed",
        color: "text-red-400",
        bgColor: "bg-red-400/10",
      };
    default:
      return {
        text: "Unknown",
        color: "text-slate-400",
        bgColor: "bg-slate-400/10",
      };
  }
}

/**
 * Extract filename from path
 */
export function getFilenameFromPath(path: string): string {
  return path.split("/").pop() || path;
}

/**
 * Validate if a path looks reasonable
 */
export function isValidPath(path: string): boolean {
  if (!path || path.trim().length === 0) return false;
  
  // Basic validation - should start with / or ~ or contain a drive letter on Windows
  const trimmedPath = path.trim();
  return (
    trimmedPath.startsWith("/") || 
    trimmedPath.startsWith("~") ||
    trimmedPath.startsWith("./") ||
    trimmedPath.startsWith("../") ||
    /^[A-Za-z]:[/\\]/.test(trimmedPath) // Windows drive path
  );
}