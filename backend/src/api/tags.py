"""
Tag Management API

Endpoints for managing tags and tag assignments to RSS feeds.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, validator
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
import logging

from ..database import get_db, Tag, RSSFeed, rss_feed_tags

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tags", tags=["tags"])


class TagCreate(BaseModel):
    """Model for creating a new tag."""
    name: str
    description: Optional[str] = None
    color: Optional[str] = None

    @validator('name')
    def name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Tag name cannot be empty')
        return v.strip()

    @validator('color')
    def validate_color(cls, v):
        if v and not v.startswith('#'):
            raise ValueError('Color must be a hex code starting with #')
        if v and len(v) != 7:
            raise ValueError('Color must be in format #RRGGBB')
        return v


class TagUpdate(BaseModel):
    """Model for updating a tag."""
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None

    @validator('name')
    def name_not_empty(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('Tag name cannot be empty')
        return v.strip() if v else None

    @validator('color')
    def validate_color(cls, v):
        if v and not v.startswith('#'):
            raise ValueError('Color must be a hex code starting with #')
        if v and len(v) != 7:
            raise ValueError('Color must be in format #RRGGBB')
        return v


class TagResponse(BaseModel):
    """Model for tag response."""
    id: int
    name: str
    description: Optional[str]
    color: Optional[str]
    created_at: str
    updated_at: str


class FeedTagAssignment(BaseModel):
    """Model for assigning tags to feeds."""
    feed_id: int
    tag_ids: List[int]


@router.get("", response_model=List[TagResponse])
async def get_tags(db: Session = Depends(get_db)):
    """
    Get all tags.

    Returns:
        List of all tags
    """
    try:
        tags = db.query(Tag).order_by(Tag.name).all()
        return [TagResponse(
            id=tag.id,
            name=tag.name,
            description=tag.description,
            color=tag.color,
            created_at=tag.created_at.isoformat(),
            updated_at=tag.updated_at.isoformat()
        ) for tag in tags]
    except Exception as e:
        logger.error(f"Error retrieving tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve tags"
        )


@router.post("", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(tag: TagCreate, db: Session = Depends(get_db)):
    """
    Create a new tag.

    Args:
        tag: Tag data with name, optional description and color

    Returns:
        The created tag
    """
    try:
        # Check if tag with same name already exists
        existing_tag = db.query(Tag).filter(Tag.name == tag.name).first()
        if existing_tag:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tag '{tag.name}' already exists"
            )

        # Create new tag
        db_tag = Tag(
            name=tag.name,
            description=tag.description,
            color=tag.color
        )
        db.add(db_tag)
        db.commit()
        db.refresh(db_tag)

        logger.info(f"Created tag: {tag.name}")

        return TagResponse(
            id=db_tag.id,
            name=db_tag.name,
            description=db_tag.description,
            color=db_tag.color,
            created_at=db_tag.created_at.isoformat(),
            updated_at=db_tag.updated_at.isoformat()
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating tag: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create tag"
        )


@router.put("/{tag_id}", response_model=TagResponse)
async def update_tag(tag_id: int, tag_update: TagUpdate, db: Session = Depends(get_db)):
    """
    Update an existing tag.

    Args:
        tag_id: ID of the tag to update
        tag_update: Updated tag data

    Returns:
        The updated tag
    """
    try:
        db_tag = db.query(Tag).filter(Tag.id == tag_id).first()
        if not db_tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found"
            )

        # Update fields if provided
        if tag_update.name is not None:
            # Check if new name conflicts with existing tag
            existing = db.query(Tag).filter(
                Tag.name == tag_update.name,
                Tag.id != tag_id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Tag '{tag_update.name}' already exists"
                )
            db_tag.name = tag_update.name

        if tag_update.description is not None:
            db_tag.description = tag_update.description

        if tag_update.color is not None:
            db_tag.color = tag_update.color

        db.commit()
        db.refresh(db_tag)

        logger.info(f"Updated tag: {db_tag.name}")

        return TagResponse(
            id=db_tag.id,
            name=db_tag.name,
            description=db_tag.description,
            color=db_tag.color,
            created_at=db_tag.created_at.isoformat(),
            updated_at=db_tag.updated_at.isoformat()
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating tag: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update tag"
        )


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    """
    Delete a tag.

    Args:
        tag_id: ID of the tag to delete
    """
    try:
        db_tag = db.query(Tag).filter(Tag.id == tag_id).first()
        if not db_tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found"
            )

        db.delete(db_tag)
        db.commit()

        logger.info(f"Deleted tag: {db_tag.name}")

        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting tag: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete tag"
        )


@router.get("/feed/{feed_id}", response_model=List[TagResponse])
async def get_feed_tags(feed_id: int, db: Session = Depends(get_db)):
    """
    Get all tags assigned to a specific RSS feed.

    Args:
        feed_id: ID of the RSS feed

    Returns:
        List of tags assigned to the feed
    """
    try:
        # Verify feed exists
        feed = db.query(RSSFeed).filter(RSSFeed.id == feed_id).first()
        if not feed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RSS feed not found"
            )

        # Get tags for this feed
        tags = db.query(Tag).join(
            rss_feed_tags, Tag.id == rss_feed_tags.c.tag_id
        ).filter(
            rss_feed_tags.c.feed_id == feed_id
        ).order_by(Tag.name).all()

        return [TagResponse(
            id=tag.id,
            name=tag.name,
            description=tag.description,
            color=tag.color,
            created_at=tag.created_at.isoformat(),
            updated_at=tag.updated_at.isoformat()
        ) for tag in tags]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving feed tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve feed tags"
        )


@router.post("/feed/assign", status_code=status.HTTP_200_OK)
async def assign_tags_to_feed(assignment: FeedTagAssignment, db: Session = Depends(get_db)):
    """
    Assign tags to an RSS feed.

    Args:
        assignment: Feed ID and list of tag IDs to assign

    Returns:
        Success message
    """
    try:
        # Verify feed exists
        feed = db.query(RSSFeed).filter(RSSFeed.id == assignment.feed_id).first()
        if not feed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RSS feed not found"
            )

        # Verify all tags exist
        tags = db.query(Tag).filter(Tag.id.in_(assignment.tag_ids)).all()
        if len(tags) != len(assignment.tag_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more tag IDs not found"
            )

        # Remove existing tag assignments for this feed
        db.execute(
            rss_feed_tags.delete().where(rss_feed_tags.c.feed_id == assignment.feed_id)
        )

        # Add new tag assignments
        for tag_id in assignment.tag_ids:
            db.execute(
                rss_feed_tags.insert().values(feed_id=assignment.feed_id, tag_id=tag_id)
            )

        db.commit()

        logger.info(f"Assigned {len(assignment.tag_ids)} tags to feed {assignment.feed_id}")

        return {"message": f"Successfully assigned {len(assignment.tag_ids)} tags to feed"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning tags to feed: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to assign tags to feed"
        )
