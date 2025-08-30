import os
import hashlib
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime

import chromadb
from sentence_transformers import SentenceTransformer

from database.connection import get_session
from database.models import KnowledgeSource, SourceFile, FileChunk, ProcessingStatus, SourceType


class KnowledgeService:
    def __init__(self):

        self._embedding_model = None
        self.chroma_client = chromadb.PersistentClient(path="./chroma_db")
        
    @property
    def embedding_model(self):
        """Lazy load the embedding model."""
        if self._embedding_model is None:
            print("Loading embedding model...")
            self._embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        return self._embedding_model
    
    def ingest_path(self, path: str) -> int:
        """
        Main ingestion method:
        1. Validate path exists
        2. Create KnowledgeSource record
        3. Process files (chunk + embed)
        4. Update status
        Returns: source_id
        """
        path_obj = Path(path)
        
        if not path_obj.exists():
            raise ValueError(f"Path does not exist: {path}")
        
        session = next(get_session())
        try:
            source = KnowledgeSource(
                name=path_obj.name,
                path=str(path_obj.absolute()),
                type=SourceType.FILE if path_obj.is_file() else SourceType.FOLDER,
                status=ProcessingStatus.PENDING
            )
            session.add(source)
            session.commit()
            source_id = source.id
            
            self._process_path(path_obj, source_id, session)
            
            source.status = ProcessingStatus.COMPLETED
            session.commit()
            
            return source_id
            
        except Exception as e:
            source.status = ProcessingStatus.FAILED
            source.error_message = str(e)
            session.commit()
            raise
        finally:
            session.close()
    
    def process_existing_source(self, source_id: int):
        """
        Process an existing KnowledgeSource record with single session:
        1. Get source from database
        2. Process files (chunk + embed)
        3. Update status
        """
        session = next(get_session())
        try:
            source = session.get(KnowledgeSource, source_id)
            if not source:
                raise ValueError(f"Source with ID {source_id} not found")
            
            source.status = ProcessingStatus.PROCESSING
            session.commit()
            
            path_obj = Path(source.path)
            self._process_path(path_obj, source_id, session)
            
            source.status = ProcessingStatus.COMPLETED
            session.commit()
            
        except Exception as e:
            session.rollback()
            
            try:
                source = session.get(KnowledgeSource, source_id)
                if source:
                    source.status = ProcessingStatus.FAILED
                    source.error_message = str(e)
                    session.commit()
            except:
                pass 
            raise
        finally:
            session.close()
    
    def _process_path(self, path: Path, source_id: int, session):
        """Process a file or folder."""
        if path.is_file():
            files = [path] if self._is_supported_file(path) else []
        else:
            files = self._discover_files(path)
        
        if not files:
            raise ValueError(f"No supported files found in: {path}")
        
        source = session.get(KnowledgeSource, source_id)
        source.file_count = len(files)
        source.status = ProcessingStatus.PROCESSING
        session.commit()
        
        for file_path in files:
            self._process_file(file_path, source_id, session)
    
    def _discover_files(self, folder_path: Path) -> List[Path]:

        supported_files = []
        for file_path in folder_path.rglob("*"):
            if file_path.is_file() and self._is_supported_file(file_path):
                supported_files.append(file_path)
        return supported_files
    
    def _is_supported_file(self, file_path: Path) -> bool:
        """Check if file type is supported."""
        return file_path.suffix.lower() in ['.md', '.txt']
    
    def _process_file(self, file_path: Path, source_id: int, session):
        """Process a single file: read → chunk → embed → store."""
        print(f"Processing file: {file_path}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            with open(file_path, 'r', encoding='latin-1') as f:
                content = f.read()
        
        content_hash = hashlib.sha256(content.encode()).hexdigest()
        
        source = session.get(KnowledgeSource, source_id)
        
        source_file = SourceFile(
            source_id=source_id,
            file_path=str(file_path.relative_to(Path(source.path).parent)),
            file_name=file_path.name,
            file_extension=file_path.suffix,
            raw_content=content,
            content_hash=content_hash,
            file_size=len(content.encode()),
            line_count=len(content.splitlines()),
            file_modified_at=datetime.fromtimestamp(file_path.stat().st_mtime),
            is_processed=False
        )
        session.add(source_file)
        session.flush() 
        
        chunks = self._create_chunks(content)
        
        if not chunks:
            print(f"Skipping {file_path.name} - no valid chunks generated (file too small or empty)")
            source_file.is_processed = True
            source_file.chunk_count = 0
            source_file.processed_at = datetime.now()
            session.commit()
            return
        
        chunk_texts = [chunk['text'] for chunk in chunks]
        embeddings = self.embedding_model.encode(chunk_texts).tolist()
        
        if not embeddings or len(embeddings) == 0:
            print(f"Skipping {file_path.name} - no embeddings generated")
            source_file.is_processed = True
            source_file.chunk_count = 0
            source_file.processed_at = datetime.now()
            session.commit()
            return

        collection_name = f"source_{source_id}"
        self._store_in_chroma(chunks, embeddings, collection_name, source_file.id)
        
        for i, chunk in enumerate(chunks):
            chunk_record = FileChunk(
                source_id=source_id,
                file_id=source_file.id,
                chunk_index=i,
                chunk_text=chunk['text'],
                chunk_size=len(chunk['text']),
                start_char=chunk['start_char'],
                end_char=chunk['end_char'],
                chroma_id=f"{collection_name}_{source_file.id}_{i}"
            )
            session.add(chunk_record)
        
        source_file.is_processed = True
        source_file.chunk_count = len(chunks)
        source_file.processed_at = datetime.now()
        
        source.processed_chunks += len(chunks)
        source.total_chunks += len(chunks)
        
        session.commit()
        print(f"Processed {len(chunks)} chunks from {file_path.name}")
    
    def _create_chunks(self, text: str, window_size: int = 512, overlap: int = 128) -> List[Dict]:
        """Create overlapping text chunks."""
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + window_size
            chunk_text = text[start:end]
            
            if len(chunk_text.strip()) < 50:
                break
            
            chunks.append({
                'text': chunk_text,
                'start_char': start,
                'end_char': end
            })
            
            start += window_size - overlap
        
        return chunks
    
    def _store_in_chroma(self, chunks: List[Dict], embeddings: List[List[float]], 
                        collection_name: str, file_id: int):
        """Store chunks and embeddings in ChromaDB."""
        # Guard against empty chunks or embeddings
        if not chunks or not embeddings or len(chunks) == 0 or len(embeddings) == 0:
            print(f"Skipping ChromaDB storage - empty chunks or embeddings")
            return
        
        if len(chunks) != len(embeddings):
            print(f"Mismatch: {len(chunks)} chunks vs {len(embeddings)} embeddings")
            return
        
        try:
            collection = self.chroma_client.get_or_create_collection(collection_name)
        except:
            collection = self.chroma_client.create_collection(collection_name)
        
        # Prepare data for ChromaDB
        ids = [f"{collection_name}_{file_id}_{i}" for i in range(len(chunks))]
        documents = [chunk['text'] for chunk in chunks]
        metadatas = [
            {
                'file_id': file_id,
                'chunk_index': i,
                'start_char': chunk['start_char'],
                'end_char': chunk['end_char']
            }
            for i, chunk in enumerate(chunks)
        ]
        
        # Add to ChromaDB
        collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )
        
        print(f"Stored {len(chunks)} chunks in ChromaDB collection: {collection_name}")
    
    def search_similar(self, query: str, source_id: Optional[int] = None, 
                      n_results: int = 5) -> List[Dict]:
        """Search for similar chunks."""
        query_embedding = self.embedding_model.encode([query]).tolist()[0]
        
        if source_id:
            collection_name = f"source_{source_id}"
            try:
                collection = self.chroma_client.get_collection(collection_name)
                results = collection.query(
                    query_embeddings=[query_embedding],
                    n_results=n_results
                )
                return results
            except:
                return []
        else:
            return []