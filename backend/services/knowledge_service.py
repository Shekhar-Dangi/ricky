from pydantic import List

class KnowledgeService:
    def __init__(self):
        self.embedding_model = None  # sentence-transformers model
        self.chroma_client = None    # ChromaDB client
        
    async def ingest_path(self, path: str) -> int:
        """
        Main ingestion method:
        1. Validate path exists
        2. Create KnowledgeSource record
        3. Process files (chunk + embed)
        4. Update status
        Returns: source_id
        """
        
    async def process_file(self, file_path: str, source_id: int):
        """
        Process single file:
        1. Read file content
        2. Create chunks using sliding window
        3. Generate embeddings
        4. Store in ChromaDB + database
        """
        
    def create_chunks(self, text: str, window_size: int = 512, overlap: int = 128) -> List[dict]:
        """
        Sliding window chunking:
        - Split text into overlapping chunks
        - Preserve sentence boundaries where possible
        - Return chunk metadata
        """
        
    async def embed_chunks(self, chunks: List[str]) -> List[List[float]]:
        """Generate embeddings for text chunks."""
        
    async def store_in_chroma(self, chunks_data: List[dict], collection_name: str):
        """Store chunks and embeddings in ChromaDB."""