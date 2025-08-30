import { useState, useCallback, useEffect } from "react";
import { 
  type KnowledgeSource, 
  ingestKnowledge, 
  listKnowledgeSources, 
  deleteKnowledgeSource 
} from "../src/utils/api";

export function useKnowledge() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sources on mount and set up polling for updates
  useEffect(() => {
    loadSources();
    
    // Poll every 3 seconds for status updates
    const interval = setInterval(loadSources, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const loadSources = useCallback(async () => {
    try {
      setError(null);
      const loadedSources = await listKnowledgeSources();
      setSources(loadedSources);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load sources");
    }
  }, []);

  const ingestSource = useCallback(async (path: string, name?: string) => {
    try {
      setIsIngesting(true);
      setError(null);
      
      const result = await ingestKnowledge(path, name);
      
      // Refresh sources list to show the new source
      await loadSources();
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to ingest source";
      setError(errorMessage);
      throw error;
    } finally {
      setIsIngesting(false);
    }
  }, [loadSources]);

  const deleteSource = useCallback(async (sourceId: number) => {
    try {
      setError(null);
      await deleteKnowledgeSource(sourceId);
      
      // Remove from local state immediately for better UX
      setSources(prev => prev.filter(source => source.id !== sourceId));
      
      // Refresh to ensure consistency
      await loadSources();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete source";
      setError(errorMessage);
      throw error;
    }
  }, [loadSources]);

  const refreshSources = useCallback(() => {
    setIsLoading(true);
    loadSources().finally(() => setIsLoading(false));
  }, [loadSources]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sources,
    isLoading,
    isIngesting,
    error,
    ingestSource,
    deleteSource,
    refreshSources,
    clearError,
  };
}