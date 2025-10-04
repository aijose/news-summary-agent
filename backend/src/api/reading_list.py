"""
Reading List API endpoints for News Summary Agent.

This module provides REST API endpoints for managing user's reading list -
saving articles to read later with optional notes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import logging

from ..database import get_db, ReadingList, Article

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reading-list", tags=["reading-list"])


class ReadingListAdd(BaseModel):
    """Model for adding an article to reading list."""
    article_id: int
    notes: Optional[str] = None


class ReadingListUpdate(BaseModel):
    """Model for updating reading list notes."""
    notes: Optional[str] = None


class ReadingListItemResponse(BaseModel):
    """Model for reading list item with article details."""
    id: int
    article_id: int
    notes: Optional[str]
    added_at: str
    article: Dict[str, Any]


@router.get("", response_model=List[ReadingListItemResponse])
async def get_reading_list(db: Session = Depends(get_db)):
    """
    Get all articles in the reading list.

    Returns reading list items with full article details,
    ordered by most recently added first.
    """
    try:
        # Get all reading list items with their articles
        reading_list_items = db.query(ReadingList).order_by(
            ReadingList.added_at.desc()
        ).all()

        result = []
        for item in reading_list_items:
            article = db.query(Article).filter(Article.id == item.article_id).first()
            if article:
                result.append(ReadingListItemResponse(
                    id=item.id,
                    article_id=item.article_id,
                    notes=item.notes,
                    added_at=item.added_at.isoformat(),
                    article=article.to_dict()
                ))

        return result

    except Exception as e:
        logger.error(f"Error retrieving reading list: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve reading list")


@router.post("", status_code=status.HTTP_201_CREATED)
async def add_to_reading_list(
    request: ReadingListAdd,
    db: Session = Depends(get_db)
):
    """
    Add an article to the reading list.

    - **article_id**: ID of the article to save
    - **notes**: Optional notes about the article
    """
    try:
        # Check if article exists
        article = db.query(Article).filter(Article.id == request.article_id).first()
        if not article:
            raise HTTPException(
                status_code=404,
                detail={"error": {"message": f"Article with ID {request.article_id} not found", "code": "ARTICLE_NOT_FOUND"}}
            )

        # Check if already in reading list
        existing = db.query(ReadingList).filter(
            ReadingList.article_id == request.article_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=400,
                detail={"error": {"message": "Article already in reading list", "code": "ALREADY_IN_LIST"}}
            )

        # Add to reading list
        reading_list_item = ReadingList(
            article_id=request.article_id,
            notes=request.notes
        )

        db.add(reading_list_item)
        db.commit()
        db.refresh(reading_list_item)

        return {
            "message": f"Article added to reading list",
            "reading_list_item": reading_list_item.to_dict()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding to reading list: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to add article to reading list")


@router.delete("/{article_id}", status_code=status.HTTP_200_OK)
async def remove_from_reading_list(article_id: int, db: Session = Depends(get_db)):
    """
    Remove an article from the reading list.

    - **article_id**: ID of the article to remove
    """
    try:
        reading_list_item = db.query(ReadingList).filter(
            ReadingList.article_id == article_id
        ).first()

        if not reading_list_item:
            raise HTTPException(
                status_code=404,
                detail={"error": {"message": f"Article {article_id} not found in reading list", "code": "NOT_IN_LIST"}}
            )

        db.delete(reading_list_item)
        db.commit()

        return {"message": f"Article {article_id} removed from reading list"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing from reading list: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to remove article from reading list")


@router.get("/check/{article_id}")
async def check_in_reading_list(article_id: int, db: Session = Depends(get_db)):
    """
    Check if an article is in the reading list.

    - **article_id**: ID of the article to check
    """
    try:
        exists = db.query(ReadingList).filter(
            ReadingList.article_id == article_id
        ).first() is not None

        return {"in_reading_list": exists}

    except Exception as e:
        logger.error(f"Error checking reading list: {e}")
        raise HTTPException(status_code=500, detail="Failed to check reading list")


@router.put("/{article_id}")
async def update_reading_list_notes(
    article_id: int,
    request: ReadingListUpdate,
    db: Session = Depends(get_db)
):
    """
    Update notes for a reading list item.

    - **article_id**: ID of the article
    - **notes**: Updated notes
    """
    try:
        reading_list_item = db.query(ReadingList).filter(
            ReadingList.article_id == article_id
        ).first()

        if not reading_list_item:
            raise HTTPException(
                status_code=404,
                detail={"error": {"message": f"Article {article_id} not found in reading list", "code": "NOT_IN_LIST"}}
            )

        # Update notes
        reading_list_item.notes = request.notes
        db.commit()
        db.refresh(reading_list_item)

        return {
            "message": "Notes updated successfully",
            "reading_list_item": reading_list_item.to_dict()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating reading list notes: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update notes")
