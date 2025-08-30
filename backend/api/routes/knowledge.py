from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from pathlib import Path

from database.connection import get_session
from database.models import KnowledgeSource, SourceFile, FileChunk, ProcessingStatus
from services.knowledge_service import KnowledgeService

router = APIRouter(prefix="/resource", tags=["knowledge"])

class IngestRequest(BaseModel):
    path: str

class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 10
    threshold: Optional[float] = 0.7
    source_id: Optional[int] = None

class SearchResult(BaseModel):
    chunk_text: str
    similarity_score: float
    source_id: Optional[int]
    source_name: str
    source_path: str
    source_type: str
    file_id: Optional[int]
    file_name: str
    file_path: str
    file_extension: str
    chunk_index: Optional[int]
    start_char: Optional[int]
    end_char: Optional[int]
    chroma_id: str
    query: str

class KnowledgeSourceResponse(BaseModel):
    id: int
    name: str
    path: str
    type: str
    status: str
    total_chunks: int
    processed_chunks: int
    file_count: Optional[int]
    created_at: datetime
    progress_percentage: float

def process_ingestion(source_id: int):
    """Background task to process ingestion."""
    try:
        service = KnowledgeService()
        service.process_existing_source(source_id)
        print(f"✅ Successfully processed source {source_id}")
    except Exception as e:
        print(f"❌ Error processing source {source_id}: {e}")
        # Update status to failed
        session = next(get_session())
        source = session.get(KnowledgeSource, source_id)
        if source:
            source.status = ProcessingStatus.FAILED
            source.error_message = str(e)
            session.commit()
        session.close()

@router.post("/ingest")
def ingest_resource(
    request: IngestRequest,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    """
    Endpoint to ingest file/folder:
    1. Validate path exists and is accessible
    2. Create database record
    3. Start background processing
    4. Return immediate response with source_id
    """
    # Validate path exists
    path_obj = Path(request.path)
    if not path_obj.exists():
        raise HTTPException(status_code=400, detail=f"Path does not exist: {request.path}")
    
    # Check if path is already being processed
    existing = session.exec(
        select(KnowledgeSource).where(KnowledgeSource.path == str(path_obj.absolute()))
    ).first()
    
    if existing:
        if existing.status in [ProcessingStatus.PENDING, ProcessingStatus.PROCESSING]:
            raise HTTPException(
                status_code=409, 
                detail=f"Path is already being processed. Source ID: {existing.id}"
            )
        elif existing.status == ProcessingStatus.COMPLETED:
            raise HTTPException(
                status_code=409,
                detail=f"Path already processed. Source ID: {existing.id}. Use re-process if needed."
            )
        # Allow re-processing if status is FAILED
        elif existing.status == ProcessingStatus.FAILED:
            # Update existing record instead of creating new one
            existing.status = ProcessingStatus.PENDING
            existing.error_message = None
            session.commit()
            session.refresh(existing)
            
            # Start background processing
            background_tasks.add_task(process_ingestion, existing.id)
            
            return {
                "success": True,
                "source_id": existing.id,
                "message": f"Restarted processing {request.path}",
                "status": "pending"
            }
    
    # Create initial record
    source = KnowledgeSource(
        name=path_obj.name,
        path=str(path_obj.absolute()),
        type="file" if path_obj.is_file() else "folder",
        status=ProcessingStatus.PENDING
    )
    session.add(source)
    session.commit()
    session.refresh(source)
    
    # Start background processing
    background_tasks.add_task(process_ingestion, source.id)
    
    return {
        "success": True,
        "source_id": source.id,
        "message": f"Started processing {request.path}",
        "status": "pending"
    }

@router.post("/search", response_model=List[SearchResult])
def search_knowledge(
    request: SearchRequest,
    session: Session = Depends(get_session)
):
    """
    Search for similar content in the knowledge base.
    
    Args:
        request: Search parameters (query, limit, threshold, optional source_id)
        
    Returns:
        List of matching chunks with similarity scores and metadata
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    try:
        service = KnowledgeService()
        
        # Use the enhanced search method
        results = service.search_knowledge(
            query=request.query,
            limit=request.limit,
            threshold=request.threshold
        )
        
        if not results:
            return []
        
        # Convert to response model
        search_results = []
        for result in results:
            search_result = SearchResult(
                chunk_text=result['chunk_text'],
                similarity_score=result['similarity_score'],
                source_id=result['source_id'],
                source_name=result['source_name'],
                source_path=result['source_path'],
                source_type=result['source_type'],
                file_id=result['file_id'],
                file_name=result['file_name'],
                file_path=result['file_path'],
                file_extension=result['file_extension'],
                chunk_index=result['chunk_index'],
                start_char=result['start_char'],
                end_char=result['end_char'],
                chroma_id=result['chroma_id'],
                query=result['query']
            )
            search_results.append(search_result)
        
        return search_results
        
    except Exception as e:
        print(f"❌ Error searching knowledge: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error searching knowledge base: {str(e)}"
        )

@router.get("/search")
def search_knowledge_get(
    query: str,
    limit: int = 10,
    threshold: float = 0.7,
    source_id: Optional[int] = None,
    session: Session = Depends(get_session)
):
    """
    Search for similar content in the knowledge base (GET version).
    
    Query parameters:
        query: Search query text
        limit: Maximum number of results (default: 10)
        threshold: Minimum similarity threshold 0-1 (default: 0.7)
        source_id: Optional source ID to limit search scope
    """
    # Convert to SearchRequest and use POST endpoint logic
    request = SearchRequest(
        query=query,
        limit=limit,
        threshold=threshold,
        source_id=source_id
    )
    
    return search_knowledge(request, session)

@router.get("/list", response_model=List[KnowledgeSourceResponse])
def list_resources(session: Session = Depends(get_session)):
    """
    List all knowledge sources with status:
    1. Fetch from database
    2. Calculate progress percentage
    3. Return formatted response
    """
    sources = session.exec(select(KnowledgeSource)).all()
    
    result = []
    for source in sources:
        # Calculate progress percentage
        if source.total_chunks > 0:
            progress = (source.processed_chunks / source.total_chunks) * 100
        else:
            progress = 0 if source.status == ProcessingStatus.PENDING else 100
        
        result.append(KnowledgeSourceResponse(
            id=source.id,
            name=source.name,
            path=source.path,
            type=source.type,
            status=source.status,
            total_chunks=source.total_chunks,
            processed_chunks=source.processed_chunks,
            file_count=source.file_count,
            created_at=source.created_at,
            progress_percentage=round(progress, 2)
        ))
    
    return result

@router.delete("/{source_id}")
def delete_resource(source_id: int, session: Session = Depends(get_session)):
    """Delete knowledge source and all its related data."""
    source = session.get(KnowledgeSource, source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Knowledge source not found")
    
    try:
        # 1. Delete from ChromaDB first
        collection_name = f"source_{source_id}"
        try:
            from services.knowledge_service import KnowledgeService
            service = KnowledgeService()
            collection = service.chroma_client.get_collection(collection_name)
            service.chroma_client.delete_collection(collection_name)
            print(f"✅ Deleted ChromaDB collection: {collection_name}")
        except Exception as e:
            print(f"⚠️ ChromaDB collection deletion failed (might not exist): {e}")
        
        # 2. Delete all file chunks (will cascade to remove embeddings)
        chunks = session.exec(
            select(FileChunk).where(FileChunk.source_id == source_id)
        ).all()
        
        for chunk in chunks:
            session.delete(chunk)
        
        # 3. Delete all source files
        source_files = session.exec(
            select(SourceFile).where(SourceFile.source_id == source_id)
        ).all()
        
        for source_file in source_files:
            session.delete(source_file)
        
        # 4. Finally delete the knowledge source
        session.delete(source)
        session.commit()
        
        print(f"✅ Deleted knowledge source {source_id} and all related data")
        
        return {
            "success": True, 
            "message": f"Deleted source {source_id} and all related data",
            "deleted_chunks": len(chunks),
            "deleted_files": len(source_files)
        }
        
    except Exception as e:
        session.rollback()
        print(f"❌ Error deleting source {source_id}: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error deleting knowledge source: {str(e)}"
        )

@router.get("/{source_id}/status")
def get_resource_status(source_id: int, session: Session = Depends(get_session)):
    """Get detailed status of a specific resource."""
    source = session.get(KnowledgeSource, source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Knowledge source not found")
    
    # Calculate progress
    if source.total_chunks > 0:
        progress = (source.processed_chunks / source.total_chunks) * 100
    else:
        progress = 0 if source.status == ProcessingStatus.PENDING else 100
    
    return {
        "id": source.id,
        "name": source.name,
        "path": source.path,
        "type": source.type,
        "status": source.status,
        "total_chunks": source.total_chunks,
        "processed_chunks": source.processed_chunks,
        "file_count": source.file_count,
        "progress_percentage": round(progress, 2),
        "created_at": source.created_at,
        "last_processed_at": source.last_processed_at,
        "error_message": source.error_message
    }