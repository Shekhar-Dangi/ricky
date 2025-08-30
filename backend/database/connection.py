from sqlmodel import SQLModel, create_engine, Session
from pathlib import Path
from typing import Generator

# Database file path
DATABASE_DIR = Path(__file__).parent
DATABASE_URL = f"sqlite:///{DATABASE_DIR}/knowledge.db"

engine = create_engine(
    DATABASE_URL,
    echo=True, 
    connect_args={"check_same_thread": False}  
)

def create_db_and_tables():
    """Create database tables."""
    from .models import KnowledgeSource, SourceFile, FileChunk
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    """Get database session."""
    with Session(engine) as session:
        yield session