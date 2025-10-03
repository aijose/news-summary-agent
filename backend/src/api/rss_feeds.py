"""
RSS Feed Management API

Endpoints for managing RSS feed sources dynamically with database storage and tag support.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, HttpUrl, validator
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
import logging

from ..database import get_db, RSSFeed, Tag, rss_feed_tags
from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/rss-feeds", tags=["rss-feeds"])


class RSSFeedCreate(BaseModel):
    """Model for creating a new RSS feed."""
    url: HttpUrl
    name: str
    description: Optional[str] = None
    tag_ids: Optional[List[int]] = []

    @validator('name')
    def name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Feed name cannot be empty')
        return v.strip()


class RSSFeedUpdate(BaseModel):
    """Model for updating an RSS feed."""
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    tag_ids: Optional[List[int]] = None

    @validator('name')
    def name_not_empty(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('Feed name cannot be empty')
        return v.strip() if v else None


class TagInfo(BaseModel):
    """Model for tag information in feed response."""
    id: int
    name: str
    color: Optional[str]


class RSSFeedResponse(BaseModel):
    """Model for RSS feed response."""
    id: int
    url: str
    name: str
    description: Optional[str]
    is_active: bool
    tags: List[TagInfo]
    created_at: str
    updated_at: str
    last_fetched_at: Optional[str]


@router.get("", response_model=List[RSSFeedResponse])
async def get_rss_feeds(db: Session = Depends(get_db)):
    """
    Get all configured RSS feed sources with their tags.

    Returns:
        List of RSS feeds with their names, URLs, and tags
    """
    try:
        feeds = db.query(RSSFeed).order_by(RSSFeed.name).all()

        result = []
        for feed in feeds:
            # Get tags for this feed
            tags = db.query(Tag).join(
                rss_feed_tags, Tag.id == rss_feed_tags.c.tag_id
            ).filter(
                rss_feed_tags.c.feed_id == feed.id
            ).all()

            result.append(RSSFeedResponse(
                id=feed.id,
                name=feed.name,
                url=feed.url,
                description=feed.description,
                is_active=bool(feed.is_active),
                tags=[TagInfo(id=tag.id, name=tag.name, color=tag.color) for tag in tags],
                created_at=feed.created_at.isoformat(),
                updated_at=feed.updated_at.isoformat(),
                last_fetched_at=feed.last_fetched_at.isoformat() if feed.last_fetched_at else None
            ))

        return result
    except Exception as e:
        logger.error(f"Error reading RSS feeds: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read RSS feeds: {str(e)}"
        )


@router.post("", response_model=RSSFeedResponse, status_code=status.HTTP_201_CREATED)
async def add_rss_feed(feed: RSSFeedCreate, db: Session = Depends(get_db)):
    """
    Add a new RSS feed source with optional tags.

    Args:
        feed: RSS feed to add with name, URL, description, and tag IDs

    Returns:
        The created RSS feed with tags
    """
    try:
        feed_url = str(feed.url)

        # Check if URL already exists
        existing_feed = db.query(RSSFeed).filter(RSSFeed.url == feed_url).first()
        if existing_feed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="RSS feed URL already exists"
            )

        # Verify all tags exist if provided
        tags = []
        if feed.tag_ids:
            tags = db.query(Tag).filter(Tag.id.in_(feed.tag_ids)).all()
            if len(tags) != len(feed.tag_ids):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="One or more tag IDs not found"
                )

        # Create new feed
        db_feed = RSSFeed(
            name=feed.name,
            url=feed_url,
            description=feed.description,
            is_active=1
        )
        db.add(db_feed)
        db.flush()  # Get the feed ID

        # Add tag associations
        for tag_id in feed.tag_ids or []:
            db.execute(
                rss_feed_tags.insert().values(feed_id=db_feed.id, tag_id=tag_id)
            )

        db.commit()
        db.refresh(db_feed)

        logger.info(f"Added RSS feed: {feed.name} ({feed_url}) with {len(tags)} tags")

        return RSSFeedResponse(
            id=db_feed.id,
            name=db_feed.name,
            url=db_feed.url,
            description=db_feed.description,
            is_active=bool(db_feed.is_active),
            tags=[TagInfo(id=tag.id, name=tag.name, color=tag.color) for tag in tags],
            created_at=db_feed.created_at.isoformat(),
            updated_at=db_feed.updated_at.isoformat(),
            last_fetched_at=None
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding RSS feed: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add RSS feed: {str(e)}"
        )


@router.put("/{feed_id}", response_model=RSSFeedResponse)
async def update_rss_feed(feed_id: int, feed_update: RSSFeedUpdate, db: Session = Depends(get_db)):
    """
    Update an existing RSS feed.

    Args:
        feed_id: ID of the feed to update
        feed_update: Updated feed data

    Returns:
        The updated RSS feed with tags
    """
    try:
        db_feed = db.query(RSSFeed).filter(RSSFeed.id == feed_id).first()
        if not db_feed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RSS feed not found"
            )

        # Update fields if provided
        if feed_update.name is not None:
            db_feed.name = feed_update.name

        if feed_update.description is not None:
            db_feed.description = feed_update.description

        if feed_update.is_active is not None:
            db_feed.is_active = 1 if feed_update.is_active else 0

        # Update tags if provided
        if feed_update.tag_ids is not None:
            # Verify all tags exist
            tags = db.query(Tag).filter(Tag.id.in_(feed_update.tag_ids)).all()
            if len(tags) != len(feed_update.tag_ids):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="One or more tag IDs not found"
                )

            # Remove existing tag assignments
            db.execute(
                rss_feed_tags.delete().where(rss_feed_tags.c.feed_id == feed_id)
            )

            # Add new tag assignments
            for tag_id in feed_update.tag_ids:
                db.execute(
                    rss_feed_tags.insert().values(feed_id=feed_id, tag_id=tag_id)
                )

        db.commit()
        db.refresh(db_feed)

        # Get current tags
        tags = db.query(Tag).join(
            rss_feed_tags, Tag.id == rss_feed_tags.c.tag_id
        ).filter(
            rss_feed_tags.c.feed_id == feed_id
        ).all()

        logger.info(f"Updated RSS feed: {db_feed.name}")

        return RSSFeedResponse(
            id=db_feed.id,
            name=db_feed.name,
            url=db_feed.url,
            description=db_feed.description,
            is_active=bool(db_feed.is_active),
            tags=[TagInfo(id=tag.id, name=tag.name, color=tag.color) for tag in tags],
            created_at=db_feed.created_at.isoformat(),
            updated_at=db_feed.updated_at.isoformat(),
            last_fetched_at=db_feed.last_fetched_at.isoformat() if db_feed.last_fetched_at else None
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating RSS feed: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update RSS feed: {str(e)}"
        )


@router.delete("/{feed_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rss_feed(feed_id: int, db: Session = Depends(get_db)):
    """
    Delete an RSS feed source by ID.

    Args:
        feed_id: ID of the RSS feed to delete
    """
    try:
        db_feed = db.query(RSSFeed).filter(RSSFeed.id == feed_id).first()
        if not db_feed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RSS feed not found"
            )

        # Tag associations will be automatically deleted due to CASCADE
        db.delete(db_feed)
        db.commit()

        logger.info(f"Deleted RSS feed: {db_feed.name}")

        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting RSS feed: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete RSS feed: {str(e)}"
        )
