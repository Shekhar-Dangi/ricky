from sqlmodel import SQLModel, Field, Column, Text
from datetime import datetime
from typing import Optional
from enum import Enum

class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing" 
    COMPLETED = "completed"
    FAILED = "failed"

class SourceType(str, Enum):
    FILE = "file"
    FOLDER = "folder"

class KnowledgeSource(SQLModel, table=True):
    __tablename__ = "knowledge_sources"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)  # Display name
    path: str = Field(max_length=1000)  # Original file/folder path
    type: SourceType = Field(default=SourceType.FILE)
    status: ProcessingStatus = Field(default=ProcessingStatus.PENDING)
    
    # Processing details
    total_chunks: int = Field(default=0)
    processed_chunks: int = Field(default=0)
    file_size: Optional[int] = Field(default=None)  # in bytes
    file_count: Optional[int] = Field(default=None)  # for folders
    
    # Metadata
    error_message: Optional[str] = Field(default=None, sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    last_processed_at: Optional[datetime] = Field(default=None)
    
    # ChromaDB collection info
    collection_name: Optional[str] = Field(default=None, max_length=255)

class SourceFile(SQLModel, table=True):
    """Stores original file content and metadata for files within a KnowledgeSource."""
    __tablename__ = "source_files"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    source_id: int = Field(foreign_key="knowledge_sources.id")
    
    # File identification
    file_path: str = Field(max_length=1000)  
    file_name: str = Field(max_length=255)
    file_extension: str = Field(max_length=10)
    
    # File content and metadata
    raw_content: str = Field(sa_column=Column(Text))  # Original file content
    content_hash: str = Field(max_length=64)  # SHA-256 hash for change detection
    encoding: str = Field(default="utf-8", max_length=20)
    file_size: int = Field(ge=0)  # Size in bytes
    line_count: int = Field(ge=0)
    
    # Processing status
    is_processed: bool = Field(default=False)
    chunk_count: int = Field(default=0)
    
    # Timestamps
    file_modified_at: datetime  # Original file modification time
    created_at: datetime = Field(default_factory=datetime.now)
    processed_at: Optional[datetime] = Field(default=None)

class FileChunk(SQLModel, table=True):
    """Individual text chunks extracted from source files."""
    __tablename__ = "file_chunks"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    source_id: int = Field(foreign_key="knowledge_sources.id")
    file_id: int = Field(foreign_key="source_files.id")  # Link to original file
    
    # Chunk details
    chunk_index: int = Field(ge=0)  # Order within the file
    chunk_text: str = Field(sa_column=Column(Text))
    chunk_size: int = Field(ge=0)  # Character count
    
    # Position in original file
    start_char: Optional[int] = Field(default=None, ge=0)  # Character offset
    end_char: Optional[int] = Field(default=None, ge=0)
    start_line: Optional[int] = Field(default=None, ge=0)
    end_line: Optional[int] = Field(default=None, ge=0)
    
    # ChromaDB reference
    chroma_id: str = Field(max_length=255)  # UUID in ChromaDB
    
    created_at: datetime = Field(default_factory=datetime.now)