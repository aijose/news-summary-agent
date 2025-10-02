"""
RSS Feed Ingestion Service for News Summary Agent.

This module handles RSS feed parsing, article extraction, and
content processing for the news aggregation pipeline.
"""

import feedparser
import asyncio
import aiohttp
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
import logging
from urllib.parse import urljoin, urlparse
import hashlib
from bs4 import BeautifulSoup
import re

from ..config import settings
from ..database import SessionLocal, Article
from .vector_store import get_vector_store
from .article_processing import get_article_processor

logger = logging.getLogger(__name__)


class RSSIngestionService:
    """
    Service for ingesting articles from RSS feeds.

    Handles feed parsing, content extraction, deduplication,
    and integration with database and vector store.
    """

    def __init__(self):
        self.session = None
        self.vector_store = get_vector_store()
        self.article_processor = get_article_processor()

    async def __aenter__(self):
        """Async context manager entry."""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'User-Agent': 'News-Summary-Agent/1.0'}
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()

    async def fetch_rss_feed(self, feed_url: str) -> Optional[Dict[str, Any]]:
        """
        Fetch and parse RSS feed from URL.

        Args:
            feed_url: RSS feed URL to fetch

        Returns:
            Parsed feed data or None if failed
        """
        try:
            async with self.session.get(feed_url) as response:
                if response.status == 200:
                    content = await response.text()
                    feed = feedparser.parse(content)

                    if feed.bozo:
                        logger.warning(f"RSS feed has parsing issues: {feed_url}")

                    return feed
                else:
                    logger.error(f"Failed to fetch RSS feed {feed_url}: HTTP {response.status}")
                    return None

        except Exception as e:
            logger.error(f"Error fetching RSS feed {feed_url}: {type(e).__name__}: {str(e) or 'No error message'}")
            return None

    def extract_article_data(self, entry: Any, feed_info: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Extract article data from RSS feed entry.

        Args:
            entry: RSS feed entry object
            feed_info: Feed metadata

        Returns:
            Extracted article data dictionary
        """
        try:
            # Extract basic information
            title = getattr(entry, 'title', '').strip()
            link = getattr(entry, 'link', '').strip()

            if not title or not link:
                logger.warning("Article missing title or link, skipping")
                return None

            # Extract content with fallback options
            content = ''
            if hasattr(entry, 'content') and entry.content:
                content = entry.content[0].value if isinstance(entry.content, list) else entry.content
            elif hasattr(entry, 'summary'):
                content = entry.summary
            elif hasattr(entry, 'description'):
                content = entry.description

            # Clean HTML content
            content = self.clean_html_content(content)

            if len(content.strip()) < 50:  # Too short to be useful
                logger.warning(f"Article content too short, skipping: {title}")
                return None

            # Extract publication date
            published_date = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                published_date = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
            elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                published_date = datetime(*entry.updated_parsed[:6], tzinfo=timezone.utc)
            else:
                published_date = datetime.now(timezone.utc)

            # Extract source information
            source = feed_info.get('title', urlparse(link).netloc)

            # Generate content hash for deduplication
            content_hash = hashlib.md5(f"{title}{content}".encode()).hexdigest()

            # Extract additional metadata
            metadata = {
                'author': getattr(entry, 'author', ''),
                'tags': [tag.term for tag in getattr(entry, 'tags', [])],
                'feed_title': feed_info.get('title', ''),
                'feed_description': feed_info.get('description', ''),
                'content_hash': content_hash
            }

            return {
                'title': title,
                'content': content,
                'url': link,
                'source': source,
                'published_date': published_date,
                'metadata': metadata,
                'content_hash': content_hash
            }

        except Exception as e:
            logger.error(f"Error extracting article data: {e}")
            return None

    def clean_html_content(self, html_content: str) -> str:
        """
        Clean HTML content and extract readable text.

        Args:
            html_content: Raw HTML content

        Returns:
            Cleaned plain text content
        """
        if not html_content:
            return ''

        try:
            # Parse HTML
            soup = BeautifulSoup(html_content, 'html.parser')

            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()

            # Get text content
            text = soup.get_text()

            # Clean up whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)

            # Remove excessive whitespace
            text = re.sub(r'\s+', ' ', text).strip()

            return text

        except Exception as e:
            logger.error(f"Error cleaning HTML content: {e}")
            return html_content  # Return original if cleaning fails

    async def save_article(self, article_data: Dict[str, Any]) -> Optional[Article]:
        """
        Save article to database and vector store with processing.

        Args:
            article_data: Article data dictionary

        Returns:
            Saved Article object or None if failed
        """
        try:
            # Process and validate article
            processing_result = await self.article_processor.process_article(article_data)

            if not processing_result['is_valid']:
                logger.warning(f"Article validation failed: {processing_result['validation_errors']}")
                return None

            # Use processed metadata
            if processing_result['processed_metadata']:
                article_data['metadata'] = processing_result['processed_metadata']

            db = SessionLocal()

            # Check for existing article by content hash
            existing = db.query(Article).filter(
                Article.content_hash == article_data['content_hash']
            ).first()

            if existing:
                logger.debug(f"Article already exists: {article_data['title']}")
                db.close()
                return existing

            # Create new article with enhanced metadata
            article = Article(
                title=article_data['title'],
                content=article_data['content'],
                url=article_data['url'],
                source=article_data['source'],
                published_date=article_data['published_date'],
                article_metadata=article_data['metadata'],
                content_hash=article_data['content_hash']
            )

            db.add(article)
            db.commit()
            db.refresh(article)

            # Add to vector store
            vector_success = self.vector_store.add_article(article)
            if not vector_success:
                logger.warning(f"Failed to add article to vector store: {article.id}")

            db.close()

            # Log quality information
            quality_score = article_data['metadata'].get('quality_indicators', {}).get('overall_score', 0)
            logger.info(f"Saved new article: {article.title} (Quality: {quality_score:.2f})")
            return article

        except Exception as e:
            logger.error(f"Error saving article: {e}")
            if 'db' in locals():
                db.rollback()
                db.close()
            return None

    async def ingest_feed(self, feed_url: str, max_articles: int = None) -> Dict[str, Any]:
        """
        Ingest articles from a single RSS feed.

        Args:
            feed_url: RSS feed URL
            max_articles: Maximum number of articles to process

        Returns:
            Ingestion results summary
        """
        results = {
            'feed_url': feed_url,
            'total_entries': 0,
            'new_articles': 0,
            'duplicate_articles': 0,
            'failed_articles': 0,
            'errors': []
        }

        try:
            # Fetch RSS feed
            feed = await self.fetch_rss_feed(feed_url)
            if not feed:
                results['errors'].append("Failed to fetch RSS feed")
                return results

            # Extract feed metadata
            feed_info = {
                'title': getattr(feed.feed, 'title', ''),
                'description': getattr(feed.feed, 'description', ''),
                'link': getattr(feed.feed, 'link', '')
            }

            entries = feed.entries
            if max_articles:
                entries = entries[:max_articles]

            results['total_entries'] = len(entries)

            # Process each entry
            for entry in entries:
                try:
                    # Extract article data
                    article_data = self.extract_article_data(entry, feed_info)
                    if not article_data:
                        results['failed_articles'] += 1
                        continue

                    # Save article
                    saved_article = await self.save_article(article_data)
                    if saved_article:
                        if saved_article.created_at.replace(tzinfo=timezone.utc) >= \
                           (datetime.now(timezone.utc) - timedelta(minutes=5)):
                            results['new_articles'] += 1
                        else:
                            results['duplicate_articles'] += 1
                    else:
                        results['failed_articles'] += 1

                except Exception as e:
                    logger.error(f"Error processing article from {feed_url}: {e}")
                    results['failed_articles'] += 1
                    results['errors'].append(str(e))

            logger.info(f"Ingested {results['new_articles']} new articles from {feed_url}")
            return results

        except Exception as e:
            logger.error(f"Error ingesting feed {feed_url}: {e}")
            results['errors'].append(str(e))
            return results

    async def ingest_all_feeds(self, max_articles_per_feed: int = None) -> Dict[str, Any]:
        """
        Ingest articles from all configured RSS feeds.

        Args:
            max_articles_per_feed: Maximum articles per feed

        Returns:
            Overall ingestion results
        """
        feed_urls = settings.RSS_FEEDS_LIST
        if not feed_urls:
            logger.warning("No RSS feeds configured")
            return {'error': 'No RSS feeds configured'}

        max_articles = max_articles_per_feed or settings.MAX_ARTICLES_PER_FEED

        overall_results = {
            'feeds_processed': 0,
            'total_new_articles': 0,
            'total_duplicates': 0,
            'total_failures': 0,
            'feed_results': [],
            'errors': []
        }

        # Process feeds concurrently
        tasks = []
        for feed_url in feed_urls:
            feed_url = feed_url.strip()
            if feed_url:
                tasks.append(self.ingest_feed(feed_url, max_articles))

        if tasks:
            feed_results = await asyncio.gather(*tasks, return_exceptions=True)

            for i, result in enumerate(feed_results):
                if isinstance(result, Exception):
                    logger.error(f"Feed ingestion failed: {result}")
                    overall_results['errors'].append(str(result))
                else:
                    overall_results['feeds_processed'] += 1
                    overall_results['total_new_articles'] += result['new_articles']
                    overall_results['total_duplicates'] += result['duplicate_articles']
                    overall_results['total_failures'] += result['failed_articles']
                    overall_results['feed_results'].append(result)

        logger.info(f"Ingestion complete: {overall_results['total_new_articles']} new articles")
        return overall_results


# Convenience functions
async def ingest_rss_feeds(max_articles_per_feed: int = None) -> Dict[str, Any]:
    """Ingest articles from all configured RSS feeds."""
    async with RSSIngestionService() as service:
        return await service.ingest_all_feeds(max_articles_per_feed)


async def ingest_single_feed(feed_url: str, max_articles: int = None) -> Dict[str, Any]:
    """Ingest articles from a single RSS feed."""
    async with RSSIngestionService() as service:
        return await service.ingest_feed(feed_url, max_articles)