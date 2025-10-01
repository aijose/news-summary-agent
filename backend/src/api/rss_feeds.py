"""
RSS Feed Management API

Endpoints for managing RSS feed sources dynamically.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, HttpUrl, validator
from typing import List, Dict, Any
import os
from pathlib import Path
import logging

from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/rss-feeds", tags=["rss-feeds"])


class RSSFeedCreate(BaseModel):
    """Model for creating a new RSS feed."""
    url: HttpUrl
    name: str

    @validator('name')
    def name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Feed name cannot be empty')
        return v.strip()


class RSSFeed(BaseModel):
    """Model for RSS feed response."""
    url: str
    name: str


def get_env_file_path() -> Path:
    """Get the path to the .env file."""
    return Path(__file__).parent.parent.parent / ".env"


def read_rss_feeds_from_env() -> List[Dict[str, str]]:
    """Read RSS feeds from .env file and return as list of dicts with name and url."""
    env_path = get_env_file_path()

    if not env_path.exists():
        logger.warning(f".env file not found at {env_path}")
        return []

    # Read current .env file
    with open(env_path, 'r') as f:
        lines = f.readlines()

    # Find RSS_FEEDS line
    for line in lines:
        if line.strip().startswith('RSS_FEEDS='):
            feeds_str = line.split('=', 1)[1].strip()
            if not feeds_str:
                return []

            # Parse comma-separated URLs
            urls = [url.strip() for url in feeds_str.split(',') if url.strip()]

            # Extract feed names from URLs
            feeds = []
            for url in urls:
                name = extract_feed_name(url)
                feeds.append({"name": name, "url": url})

            return feeds

    return []


def extract_feed_name(url: str) -> str:
    """Extract a human-readable name from RSS feed URL."""
    url_lower = url.lower()

    # Map of common RSS feeds to their names
    name_mappings = {
        'bbc': 'BBC News',
        'reuters': 'Reuters',
        'guardian': 'The Guardian',
        'techcrunch': 'TechCrunch',
        'arstechnica': 'Ars Technica',
        'sciencedaily': 'Science Daily',
        'mit.edu': 'MIT News',
        'hnrss': 'Hacker News',
        'npr.org': 'NPR',
        'ap.org': 'Associated Press',
    }

    for key, name in name_mappings.items():
        if key in url_lower:
            return name

    # Extract domain name as fallback
    try:
        from urllib.parse import urlparse
        domain = urlparse(url).netloc
        # Remove www. prefix and common TLDs
        domain = domain.replace('www.', '').split('.')[0]
        return domain.title()
    except:
        return url


def write_rss_feeds_to_env(feeds: List[Dict[str, str]]) -> None:
    """Write RSS feeds list back to .env file."""
    env_path = get_env_file_path()

    if not env_path.exists():
        raise FileNotFoundError(f".env file not found at {env_path}")

    # Read current .env file
    with open(env_path, 'r') as f:
        lines = f.readlines()

    # Update RSS_FEEDS line
    feeds_str = ','.join([feed['url'] for feed in feeds])
    updated = False

    for i, line in enumerate(lines):
        if line.strip().startswith('RSS_FEEDS='):
            lines[i] = f'RSS_FEEDS={feeds_str}\n'
            updated = True
            break

    # If RSS_FEEDS line doesn't exist, add it
    if not updated:
        lines.append(f'RSS_FEEDS={feeds_str}\n')

    # Write back to file
    with open(env_path, 'w') as f:
        f.writelines(lines)

    logger.info(f"Updated RSS feeds in .env file: {len(feeds)} feeds")


@router.get("", response_model=List[RSSFeed])
async def get_rss_feeds():
    """
    Get all configured RSS feed sources.

    Returns:
        List of RSS feeds with their names and URLs
    """
    try:
        feeds = read_rss_feeds_from_env()
        return [RSSFeed(name=feed['name'], url=feed['url']) for feed in feeds]
    except Exception as e:
        logger.error(f"Error reading RSS feeds: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read RSS feeds: {str(e)}"
        )


@router.post("", response_model=RSSFeed, status_code=status.HTTP_201_CREATED)
async def add_rss_feed(feed: RSSFeedCreate):
    """
    Add a new RSS feed source.

    Args:
        feed: RSS feed to add with name and URL

    Returns:
        The created RSS feed
    """
    try:
        # Read current feeds
        feeds = read_rss_feeds_from_env()

        # Check if URL already exists
        feed_url = str(feed.url)
        if any(f['url'] == feed_url for f in feeds):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="RSS feed URL already exists"
            )

        # Add new feed
        feeds.append({"name": feed.name, "url": feed_url})

        # Write back to .env
        write_rss_feeds_to_env(feeds)

        logger.info(f"Added RSS feed: {feed.name} ({feed_url})")

        return RSSFeed(name=feed.name, url=feed_url)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding RSS feed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add RSS feed: {str(e)}"
        )


@router.delete("/{feed_url:path}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rss_feed(feed_url: str):
    """
    Delete an RSS feed source by URL.

    Args:
        feed_url: URL of the RSS feed to delete (URL-encoded)
    """
    try:
        # Read current feeds
        feeds = read_rss_feeds_from_env()

        # Find and remove the feed
        original_count = len(feeds)
        feeds = [f for f in feeds if f['url'] != feed_url]

        if len(feeds) == original_count:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RSS feed not found"
            )

        # Write back to .env
        write_rss_feeds_to_env(feeds)

        logger.info(f"Deleted RSS feed: {feed_url}")

        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting RSS feed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete RSS feed: {str(e)}"
        )
