from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session
from pydantic import BaseModel
from typing import List
from pathlib import Path

from backend.database.connection import get_session


router = APIRouter(prefix="/resource", tags=["knowledge"])

class IngestRequest(BaseModel):
    path: str

class KnowledgeSourceResponse(BaseModel):
    id: int
    name: str
    path: str
    type: str
    status: str
    total_chunks: int
    processed_chunks: int
    file_size: Optional[int]
    created_at: datetime
    progress_percentage: float

@router.post("/ingest")
async def ingest_resource(
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

@router.get("/list", response_model=List[KnowledgeSourceResponse])
async def list_resources(session: Session = Depends(get_session)):
    """
    List all knowledge sources with status:
    1. Fetch from database
    2. Calculate progress percentage
    3. Return formatted response
    """

@router.delete("/{source_id}")
async def delete_resource(source_id: int, session: Session = Depends(get_session)):
    """Delete knowledge source and its chunks."""

@router.get("/{source_id}/status")
async def get_resource_status(source_id: int, session: Session = Depends(get_session)):
    """Get detailed status of a specific resource."""