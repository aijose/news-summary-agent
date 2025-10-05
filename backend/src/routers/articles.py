"""
Article API endpoints for News Summary Agent.

This module provides REST API endpoints for article retrieval,
search, management, and related operations.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import logging

from ..database import get_db, Article, Summary, RSSFeed, Tag, rss_feed_tags
from ..services.vector_store import get_vector_store, search_articles_by_query
from ..services.langchain_agent import get_news_agent, search_articles_with_ai
from ..services.rss_ingestion import ingest_rss_feeds, ingest_single_feed
from ..schemas import (
    ArticleResponse,
    ArticleListResponse,
    SearchRequest,
    SearchResponse,
    SummaryRequest,
    SummaryResponse,
    IngestionRequest,
    IngestionResponse
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/articles", tags=["articles"])


@router.get("/")
async def get_articles(
    skip: int = Query(0, ge=0, description="Number of articles to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of articles to return"),
    source: Optional[str] = Query(None, description="Filter by source"),
    hours_back: Optional[int] = Query(None, ge=1, le=168, description="Hours back to search"),
    tags: Optional[str] = Query(None, description="Comma-separated tag IDs to filter by"),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of articles with optional filtering.

    - **skip**: Number of articles to skip (pagination)
    - **limit**: Maximum number of articles to return
    - **source**: Optional source filter
    - **hours_back**: Optional time filter (hours back from now)
    - **tags**: Optional comma-separated tag IDs (e.g., "1,2,3")
    """
    try:
        query = db.query(Article)

        # Apply tag filter - filter by RSS feeds that have the specified tags
        if tags:
            try:
                tag_ids = [int(tid.strip()) for tid in tags.split(',') if tid.strip()]
                if tag_ids:
                    # Get RSS feed URLs that have any of the specified tags
                    feeds_with_tags = db.query(RSSFeed.url).join(
                        rss_feed_tags, RSSFeed.id == rss_feed_tags.c.feed_id
                    ).filter(
                        rss_feed_tags.c.tag_id.in_(tag_ids)
                    ).distinct().all()

                    feed_urls = [feed.url for feed in feeds_with_tags]

                    if feed_urls:
                        # Match articles by source
                        # Articles source field contains the RSS feed's title from XML
                        # We need to match flexibly against feed names
                        feed_sources = []
                        for feed_url in feed_urls:
                            feed = db.query(RSSFeed).filter(RSSFeed.url == feed_url).first()
                            if feed:
                                # Try to match by feed name or parts of it
                                # For "Science Daily" -> match "ScienceDaily" or "Science"
                                feed_sources.append(feed.name)
                                # Also add URL-based matching for better coverage
                                if 'sciencedaily' in feed_url.lower():
                                    feed_sources.append('ScienceDaily')
                                elif 'techcrunch' in feed_url.lower():
                                    feed_sources.append('TechCrunch')
                                elif 'arstechnica' in feed_url.lower():
                                    feed_sources.append('Ars Technica')

                        if feed_sources:
                            # Build OR filter for all feed sources
                            feed_filter = None
                            for source_name in feed_sources:
                                if feed_filter is None:
                                    feed_filter = Article.source.ilike(f"%{source_name}%")
                                else:
                                    feed_filter = feed_filter | Article.source.ilike(f"%{source_name}%")

                            if feed_filter is not None:
                                query = query.filter(feed_filter)
                    else:
                        # No feeds found with those tags, return empty result
                        return {
                            "articles": [],
                            "total": 0,
                            "skip": skip,
                            "limit": limit
                        }
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid tag IDs format")

        # Apply source filter
        if source:
            query = query.filter(Article.source.ilike(f"%{source}%"))

        # Apply time filter
        if hours_back:
            cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours_back)
            query = query.filter(Article.created_at >= cutoff_time)

        # Order by creation time (newest first) and apply pagination
        articles = query.order_by(Article.created_at.desc()).offset(skip).limit(limit).all()

        # Get total count for pagination
        total_count = query.count()

        return {
            "articles": [article.to_dict() for article in articles],
            "total": total_count,
            "skip": skip,
            "limit": limit
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving articles: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve articles")


@router.get("/trending")
async def get_trending_topics(
    hours_back: int = Query(24, ge=1, le=168, description="Hours back to analyze")
):
    """
    Get trending topics analysis from recent articles.

    - **hours_back**: Number of hours back to analyze (1-168)
    """
    try:
        agent = get_news_agent()
        analysis = await agent.analyze_trending_topics(hours_back)

        if not analysis:
            raise HTTPException(status_code=500, detail="Failed to analyze trending topics")

        return analysis

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing trending topics: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze trending topics")


@router.get("/{article_id}")
async def get_article(article_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific article by ID.

    - **article_id**: The ID of the article to retrieve
    """
    try:
        article = db.query(Article).filter(Article.id == article_id).first()

        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        return article.to_dict()

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving article {article_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve article")


@router.post("/search", response_model=SearchResponse)
async def search_articles(request: SearchRequest):
    """
    Search articles using vector similarity search.

    - **query**: Natural language search query
    - **limit**: Maximum number of results to return
    - **source_filter**: Optional list of sources to filter by
    - **use_ai**: Whether to enhance results with AI summaries
    """
    try:
        if request.use_ai:
            # Use AI-enhanced search
            results = await search_articles_with_ai(request.query, request.limit)
            return SearchResponse(
                query=request.query,
                results=results.get('results', []),
                total_found=results.get('total_found', 0),
                ai_enhanced=True
            )
        else:
            # Use basic vector search
            results = search_articles_by_query(request.query, request.limit)
            return SearchResponse(
                query=request.query,
                results=results,
                total_found=len(results),
                ai_enhanced=False
            )

    except Exception as e:
        logger.error(f"Error searching articles: {e}")
        raise HTTPException(status_code=500, detail="Failed to search articles")


@router.get("/{article_id}/similar", response_model=SearchResponse)
async def get_similar_articles(
    article_id: int,
    limit: int = Query(5, ge=1, le=20, description="Number of similar articles to return"),
    db: Session = Depends(get_db)
):
    """
    Find articles similar to a given article.

    - **article_id**: ID of the reference article
    - **limit**: Maximum number of similar articles to return
    """
    try:
        # Get the reference article
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        # Use title and content for similarity search
        search_query = f"{article.title} {article.content[:200]}"
        vector_store = get_vector_store()
        results = vector_store.search_similar_articles(search_query, limit + 1)

        # Filter out the reference article itself
        filtered_results = [r for r in results if r.get('article_id') != article_id][:limit]

        return SearchResponse(
            query=f"Similar to: {article.title}",
            results=filtered_results,
            total_found=len(filtered_results),
            ai_enhanced=False
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error finding similar articles for {article_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to find similar articles")


@router.post("/{article_id}/summarize", response_model=SummaryResponse)
async def summarize_article(
    article_id: int,
    request: SummaryRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Generate an AI summary of an article.

    - **article_id**: ID of the article to summarize
    - **summary_type**: Type of summary (brief, comprehensive, analytical)
    """
    try:
        # Check if article exists
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        # Check for existing summary
        existing_summary = db.query(Summary).filter(
            Summary.article_id == article_id,
            Summary.summary_type == request.summary_type
        ).first()

        if existing_summary:
            return SummaryResponse(
                summary_id=existing_summary.id,
                article_id=article_id,
                summary_text=existing_summary.summary_text,
                summary_type=existing_summary.summary_type,
                generated_at=existing_summary.created_at.isoformat(),
                cached=True
            )

        # Generate new summary
        agent = get_news_agent()
        summary_data = await agent.summarize_article(article_id, request.summary_type)

        if not summary_data:
            raise HTTPException(status_code=500, detail="Failed to generate summary")

        return SummaryResponse(
            summary_id=summary_data.get('summary_id'),
            article_id=article_id,
            summary_text=summary_data['summary_text'],
            summary_type=request.summary_type,
            generated_at=summary_data['generated_at'],
            cached=False
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error summarizing article {article_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate summary")


@router.get("/{article_id}/summaries")
async def get_article_summaries(article_id: int, db: Session = Depends(get_db)):
    """
    Get all summaries for a specific article.

    - **article_id**: ID of the article
    """
    try:
        # Check if article exists
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        # Get all summaries for the article
        summaries = db.query(Summary).filter(Summary.article_id == article_id).all()

        return {
            "article_id": article_id,
            "article_title": article.title,
            "summaries": [
                {
                    "summary_id": summary.id,
                    "summary_type": summary.summary_type,
                    "summary_text": summary.summary_text,
                    "created_at": summary.created_at.isoformat()
                }
                for summary in summaries
            ],
            "total_summaries": len(summaries)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving summaries for article {article_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve summaries")


@router.post("/compare/{article1_id}/{article2_id}")
async def compare_articles(article1_id: int, article2_id: int, db: Session = Depends(get_db)):
    """
    Compare two articles and provide analysis.

    - **article1_id**: ID of the first article
    - **article2_id**: ID of the second article
    """
    try:
        # Check if both articles exist
        article1 = db.query(Article).filter(Article.id == article1_id).first()
        article2 = db.query(Article).filter(Article.id == article2_id).first()

        if not article1:
            raise HTTPException(status_code=404, detail=f"Article {article1_id} not found")
        if not article2:
            raise HTTPException(status_code=404, detail=f"Article {article2_id} not found")

        # Generate comparison
        agent = get_news_agent()
        comparison_data = await agent.compare_articles(article1_id, article2_id)

        if not comparison_data:
            raise HTTPException(status_code=500, detail="Failed to generate comparison")

        return comparison_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing articles {article1_id} and {article2_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to compare articles")


@router.post("/ingest", response_model=IngestionResponse)
async def trigger_ingestion(
    request: IngestionRequest,
    background_tasks: BackgroundTasks
):
    """
    Trigger RSS feed ingestion.

    - **feed_url**: Optional specific feed URL to ingest
    - **max_articles**: Maximum articles per feed
    - **background**: Whether to run in background
    """
    try:
        if request.background:
            # Run ingestion in background
            if request.feed_url:
                background_tasks.add_task(ingest_single_feed, request.feed_url, request.max_articles)
            else:
                background_tasks.add_task(ingest_rss_feeds, request.max_articles)

            return IngestionResponse(
                status="started",
                message="Ingestion started in background",
                background=True
            )
        else:
            # Run ingestion synchronously
            if request.feed_url:
                results = await ingest_single_feed(request.feed_url, request.max_articles)
            else:
                results = await ingest_rss_feeds(request.max_articles)

            return IngestionResponse(
                status="completed",
                message="Ingestion completed",
                results=results,
                background=False
            )

    except Exception as e:
        logger.error(f"Error during ingestion: {e}")
        raise HTTPException(status_code=500, detail="Failed to trigger ingestion")


@router.get("/stats/general")
async def get_article_stats(db: Session = Depends(get_db)):
    """
    Get general statistics about articles in the database.
    """
    try:
        # Basic counts
        total_articles = db.query(Article).count()
        total_summaries = db.query(Summary).count()

        # Recent articles (last 24 hours)
        cutoff_24h = datetime.now(timezone.utc) - timedelta(hours=24)
        recent_articles = db.query(Article).filter(Article.created_at >= cutoff_24h).count()

        # Articles by source
        source_stats = db.query(Article.source, func.count(Article.id)).group_by(Article.source).all()

        # Vector store stats
        vector_store = get_vector_store()
        vector_stats = vector_store.get_collection_stats()

        return {
            "database_stats": {
                "total_articles": total_articles,
                "total_summaries": total_summaries,
                "recent_articles_24h": recent_articles
            },
            "source_breakdown": [{"source": source, "count": count} for source, count in source_stats],
            "vector_store_stats": vector_stats
        }

    except Exception as e:
        logger.error(f"Error retrieving article stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")


@router.delete("/{article_id}")
async def delete_article(article_id: int, db: Session = Depends(get_db)):
    """
    Delete an article and its associated data.

    - **article_id**: ID of the article to delete
    """
    try:
        # Get the article
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        # Delete from vector store
        vector_store = get_vector_store()
        vector_store.delete_article(article_id)

        # Delete summaries
        db.query(Summary).filter(Summary.article_id == article_id).delete()

        # Delete article
        db.delete(article)
        db.commit()

        logger.info(f"Deleted article {article_id} and associated data")
        return {"message": f"Article {article_id} deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting article {article_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete article")