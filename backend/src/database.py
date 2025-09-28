"""
Database configuration and models for News Summary Agent.

This module sets up SQLAlchemy database connection, session management,
and base model classes for the application.
"""

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import func
from datetime import datetime
from typing import Generator
import logging

from .config import settings

logger = logging.getLogger(__name__)

# Create SQLAlchemy engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,    # Recycle connections every 5 minutes
    echo=settings.LOG_LEVEL.upper() == "DEBUG"  # Log SQL queries in debug mode
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Create database session dependency for FastAPI.

    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


class Article(Base):
    """
    Article model for storing news articles.

    This model stores all news articles ingested from RSS feeds
    with metadata for search and categorization.
    """
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    content = Column(Text, nullable=False)
    source = Column(String(100), nullable=False, index=True)
    published_date = Column(DateTime, nullable=False, index=True)
    url = Column(String(1000), unique=True, nullable=False, index=True)

    # Metadata stored as JSON for flexibility
    article_metadata = Column("metadata", JSON, default=dict)

    # Content hash for deduplication
    content_hash = Column(String(32), unique=True, nullable=True, index=True)

    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<Article(id={self.id}, title='{self.title[:50]}...', source='{self.source}')>"

    def to_dict(self) -> dict:
        """Convert article to dictionary for API responses."""
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "source": self.source,
            "published_date": self.published_date.isoformat() if self.published_date else None,
            "url": self.url,
            "metadata": self.article_metadata or {},
            "content_hash": self.content_hash,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class UserPreference(Base):
    """
    User preferences model for personalization.

    This model will store user preferences for future personalization
    features in Phase 2.
    """
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), unique=True, nullable=False, index=True)

    # Preferences stored as JSON for flexibility
    preferences = Column(JSON, default=dict)

    # Interaction history for learning
    interaction_history = Column(JSON, default=list)

    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<UserPreference(user_id='{self.user_id}')>"

    def to_dict(self) -> dict:
        """Convert user preferences to dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "preferences": self.preferences or {},
            "interaction_history": self.interaction_history or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class Summary(Base):
    """
    Summary model for caching generated summaries.

    This model caches article summaries to improve performance
    and reduce LLM API costs.
    """
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, nullable=False, index=True)  # Foreign key to articles
    summary_type = Column(String(50), nullable=False)  # short, medium, long
    summary_text = Column(Text, nullable=False)

    # Summary metadata
    word_count = Column(Integer, nullable=False)
    confidence_score = Column(Integer, default=0)  # 0-100 quality score
    summary_metadata = Column("metadata", JSON, default=dict)

    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<Summary(id={self.id}, article_id={self.article_id}, type='{self.summary_type}')>"

    def to_dict(self) -> dict:
        """Convert summary to dictionary for API responses."""
        return {
            "id": self.id,
            "article_id": self.article_id,
            "summary_type": self.summary_type,
            "summary_text": self.summary_text,
            "word_count": self.word_count,
            "confidence_score": self.confidence_score,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


def create_tables():
    """Create all database tables."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise


def drop_tables():
    """Drop all database tables (use with caution)."""
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("Database tables dropped successfully")
    except Exception as e:
        logger.error(f"Error dropping database tables: {e}")
        raise


# Initialize database tables on import (for development)
if __name__ == "__main__":
    create_tables()