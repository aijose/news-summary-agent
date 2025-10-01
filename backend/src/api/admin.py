"""
Admin API endpoints for system administration tasks.

This module provides administrative functions like bulk deletion,
database cleanup, and system maintenance operations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, timedelta
from typing import Optional, List
import logging

from ..database import get_db, Article, Summary
from ..services.vector_store import get_vector_store
from pydantic import BaseModel, Field, validator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])


class DeleteArticlesRequest(BaseModel):
    """Request model for bulk article deletion."""
    before_date: Optional[datetime] = Field(
        None,
        description="Delete articles published before this date (ISO 8601 format)"
    )
    sources: Optional[List[str]] = Field(
        None,
        description="Delete articles from these sources only"
    )
    delete_summaries: bool = Field(
        True,
        description="Also delete associated summaries"
    )
    delete_from_vector_store: bool = Field(
        True,
        description="Also delete from vector store"
    )

    @validator('before_date')
    def validate_date(cls, v):
        if v and v > datetime.now():
            raise ValueError('before_date cannot be in the future')
        return v

    @validator('sources')
    def validate_sources(cls, v):
        if v is not None and len(v) == 0:
            raise ValueError('sources list cannot be empty')
        return v


class DeleteArticlesResponse(BaseModel):
    """Response model for bulk article deletion."""
    deleted_count: int
    deleted_summaries_count: int = 0
    deleted_from_vector_store: int = 0
    remaining_articles: int
    filters_applied: dict


@router.post("/delete-articles", response_model=DeleteArticlesResponse)
async def delete_articles(
    request: DeleteArticlesRequest,
    db: Session = Depends(get_db)
):
    """
    Bulk delete articles based on date and/or source filters.

    This endpoint allows deletion of:
    - Articles published before a specific date
    - Articles from specific sources
    - Both filters combined

    Optionally deletes associated summaries and vector store entries.

    Args:
        request: Deletion criteria
        db: Database session

    Returns:
        DeleteArticlesResponse with deletion statistics
    """
    try:
        # Validate that at least one filter is provided
        if not request.before_date and not request.sources:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one filter (before_date or sources) must be provided"
            )

        # Build query filters
        filters = []
        if request.before_date:
            filters.append(Article.published_date < request.before_date)
        if request.sources:
            filters.append(Article.source.in_(request.sources))

        # Get articles to delete (for vector store cleanup)
        articles_to_delete = db.query(Article).filter(and_(*filters)).all()
        article_ids = [article.id for article in articles_to_delete]
        deleted_count = len(article_ids)

        if deleted_count == 0:
            logger.info("No articles match the deletion criteria")
            return DeleteArticlesResponse(
                deleted_count=0,
                deleted_summaries_count=0,
                deleted_from_vector_store=0,
                remaining_articles=db.query(Article).count(),
                filters_applied={
                    "before_date": request.before_date.isoformat() if request.before_date else None,
                    "sources": request.sources
                }
            )

        # Delete associated summaries if requested
        deleted_summaries_count = 0
        if request.delete_summaries and article_ids:
            deleted_summaries_count = db.query(Summary).filter(
                Summary.article_id.in_(article_ids)
            ).delete(synchronize_session=False)
            logger.info(f"Deleted {deleted_summaries_count} associated summaries")

        # Delete from vector store if requested
        deleted_from_vector_store = 0
        if request.delete_from_vector_store and article_ids:
            vector_store = get_vector_store()
            for article in articles_to_delete:
                try:
                    # Remove from vector store using article ID as document ID
                    vector_store.collection.delete(
                        where={"article_id": article.id}
                    )
                    deleted_from_vector_store += 1
                except Exception as e:
                    logger.warning(f"Failed to delete article {article.id} from vector store: {e}")
            logger.info(f"Deleted {deleted_from_vector_store} articles from vector store")

        # Delete articles from database
        db.query(Article).filter(and_(*filters)).delete(synchronize_session=False)
        db.commit()

        remaining_articles = db.query(Article).count()

        logger.info(
            f"Bulk deletion completed: {deleted_count} articles, "
            f"{deleted_summaries_count} summaries, "
            f"{deleted_from_vector_store} vector store entries deleted"
        )

        return DeleteArticlesResponse(
            deleted_count=deleted_count,
            deleted_summaries_count=deleted_summaries_count,
            deleted_from_vector_store=deleted_from_vector_store,
            remaining_articles=remaining_articles,
            filters_applied={
                "before_date": request.before_date.isoformat() if request.before_date else None,
                "sources": request.sources
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error during bulk deletion: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete articles: {str(e)}"
        )


@router.get("/sources", response_model=List[str])
async def get_all_sources(db: Session = Depends(get_db)):
    """
    Get list of all unique article sources in the database.

    Useful for building deletion UIs and filtering.

    Returns:
        List of unique source names
    """
    try:
        sources = db.query(Article.source).distinct().all()
        return [source[0] for source in sources if source[0]]
    except Exception as e:
        logger.error(f"Error fetching sources: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sources: {str(e)}"
        )


@router.get("/article-count", response_model=dict)
async def get_article_count_by_criteria(
    before_date: Optional[datetime] = None,
    sources: Optional[str] = None,  # Comma-separated
    db: Session = Depends(get_db)
):
    """
    Preview how many articles would be deleted with given criteria.

    Useful for showing users impact before deletion.

    Args:
        before_date: Count articles before this date
        sources: Comma-separated list of sources
        db: Database session

    Returns:
        Dictionary with count and breakdown
    """
    try:
        filters = []

        if before_date:
            filters.append(Article.published_date < before_date)

        if sources:
            source_list = [s.strip() for s in sources.split(',')]
            filters.append(Article.source.in_(source_list))

        if not filters:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one filter must be provided"
            )

        query = db.query(Article).filter(and_(*filters))
        total_count = query.count()

        # Get breakdown by source
        source_breakdown = {}
        if total_count > 0:
            articles = query.all()
            for article in articles:
                source_breakdown[article.source] = source_breakdown.get(article.source, 0) + 1

        return {
            "total_count": total_count,
            "source_breakdown": source_breakdown,
            "filters": {
                "before_date": before_date.isoformat() if before_date else None,
                "sources": [s.strip() for s in sources.split(',')] if sources else None
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error counting articles: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to count articles: {str(e)}"
        )
