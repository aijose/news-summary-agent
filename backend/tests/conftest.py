"""
Pytest configuration and shared fixtures for backend tests.
"""

import os
import pytest
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

# Set test environment variables before importing app
os.environ["TESTING"] = "1"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["ANTHROPIC_API_KEY"] = "test-key-dummy"

from src.main import app
from src.database import Base, get_db, Article, Tag, RSSFeed, rss_feed_tags


# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """
    Create a fresh database session for each test.
    """
    # Create all tables
    Base.metadata.create_all(bind=engine)

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        # Drop all tables after test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """
    Create a test client with overridden database dependency.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def sample_tag(db_session: Session) -> Tag:
    """
    Create a sample tag for testing.
    """
    tag = Tag(
        name="Technology",
        description="Tech news and updates",
        color="#3B82F6"
    )
    db_session.add(tag)
    db_session.commit()
    db_session.refresh(tag)
    return tag


@pytest.fixture
def sample_tags(db_session: Session) -> list[Tag]:
    """
    Create multiple sample tags for testing.
    """
    tags = [
        Tag(name="Technology", description="Tech news and updates", color="#3B82F6"),
        Tag(name="Science", description="Scientific discoveries", color="#10B981"),
        Tag(name="Business", description="Business and finance", color="#F59E0B"),
    ]
    db_session.add_all(tags)
    db_session.commit()
    for tag in tags:
        db_session.refresh(tag)
    return tags


@pytest.fixture
def sample_rss_feed(db_session: Session, sample_tag: Tag) -> RSSFeed:
    """
    Create a sample RSS feed for testing.
    """
    feed = RSSFeed(
        name="TechCrunch",
        url="https://techcrunch.com/feed/",
        description="Technology and startup news",
        is_active=True
    )
    db_session.add(feed)
    db_session.commit()
    db_session.refresh(feed)

    # Add tag association
    db_session.execute(
        rss_feed_tags.insert().values(feed_id=feed.id, tag_id=sample_tag.id)
    )
    db_session.commit()

    return feed


@pytest.fixture
def sample_rss_feeds(db_session: Session, sample_tags: list[Tag]) -> list[RSSFeed]:
    """
    Create multiple sample RSS feeds for testing.
    """
    feeds = [
        RSSFeed(
            name="TechCrunch",
            url="https://techcrunch.com/feed/",
            description="Technology and startup news",
            is_active=True
        ),
        RSSFeed(
            name="Science Daily",
            url="https://www.sciencedaily.com/rss/all.xml",
            description="Latest science news",
            is_active=True
        ),
    ]

    db_session.add_all(feeds)
    db_session.commit()
    for feed in feeds:
        db_session.refresh(feed)

    # Add tag associations
    db_session.execute(
        rss_feed_tags.insert().values(feed_id=feeds[0].id, tag_id=sample_tags[0].id)  # Technology
    )
    db_session.execute(
        rss_feed_tags.insert().values(feed_id=feeds[1].id, tag_id=sample_tags[1].id)  # Science
    )
    db_session.commit()

    return feeds


@pytest.fixture
def sample_article(db_session: Session) -> Article:
    """
    Create a sample article for testing.
    """
    from datetime import datetime

    article = Article(
        title="Sample Tech Article",
        content="This is a sample article about technology.",
        source="TechCrunch",
        url="https://techcrunch.com/sample-article",
        published_date=datetime(2025, 10, 3, 10, 0, 0)
    )
    db_session.add(article)
    db_session.commit()
    db_session.refresh(article)
    return article


@pytest.fixture
def sample_articles(db_session: Session) -> list[Article]:
    """
    Create multiple sample articles for testing.
    """
    from datetime import datetime

    articles = [
        Article(
            title="AI Breakthrough in 2025",
            content="Scientists announce major AI breakthrough...",
            source="TechCrunch",
            url="https://techcrunch.com/ai-breakthrough",
            published_date=datetime(2025, 10, 3, 10, 0, 0)
        ),
        Article(
            title="Quantum Computing Advances",
            content="New quantum computing research shows promise...",
            source="Science Daily",
            url="https://sciencedaily.com/quantum-computing",
            published_date=datetime(2025, 10, 3, 9, 0, 0)
        ),
        Article(
            title="Market Analysis October 2025",
            content="Stock markets show interesting trends...",
            source="Financial Times",
            url="https://ft.com/market-analysis",
            published_date=datetime(2025, 10, 3, 8, 0, 0)
        ),
    ]
    db_session.add_all(articles)
    db_session.commit()
    for article in articles:
        db_session.refresh(article)
    return articles
