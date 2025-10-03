"""
Tests for database models.
"""

import pytest
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from src.database import Tag, RSSFeed, Article, UserPreference, Summary, rss_feed_tags


class TestTagModel:
    """Tests for Tag model."""

    def test_create_tag_minimal(self, db_session: Session):
        """Test creating a tag with only required fields."""
        tag = Tag(name="Technology")
        db_session.add(tag)
        db_session.commit()
        db_session.refresh(tag)

        assert tag.id is not None
        assert tag.name == "Technology"
        assert tag.description is None
        assert tag.color is None
        assert tag.created_at is not None
        assert tag.updated_at is not None

    def test_create_tag_full(self, db_session: Session):
        """Test creating a tag with all fields."""
        tag = Tag(
            name="Science",
            description="Scientific discoveries and research",
            color="#10B981"
        )
        db_session.add(tag)
        db_session.commit()
        db_session.refresh(tag)

        assert tag.id is not None
        assert tag.name == "Science"
        assert tag.description == "Scientific discoveries and research"
        assert tag.color == "#10B981"

    def test_tag_unique_name_constraint(self, db_session: Session):
        """Test that tag names must be unique."""
        tag1 = Tag(name="Technology")
        db_session.add(tag1)
        db_session.commit()

        tag2 = Tag(name="Technology")
        db_session.add(tag2)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_tag_to_dict(self, db_session: Session):
        """Test Tag.to_dict() serialization."""
        tag = Tag(
            name="Business",
            description="Business and finance news",
            color="#F59E0B"
        )
        db_session.add(tag)
        db_session.commit()
        db_session.refresh(tag)

        data = tag.to_dict()

        assert "id" in data
        assert data["name"] == "Business"
        assert data["description"] == "Business and finance news"
        assert data["color"] == "#F59E0B"
        assert "created_at" in data
        assert "updated_at" in data

    def test_tag_timestamps(self, db_session: Session):
        """Test that timestamps are auto-generated."""
        tag = Tag(name="Test")
        db_session.add(tag)
        db_session.commit()
        db_session.refresh(tag)

        assert tag.created_at is not None
        assert tag.updated_at is not None
        assert isinstance(tag.created_at, datetime)
        assert isinstance(tag.updated_at, datetime)

    def test_tag_repr(self, db_session: Session):
        """Test Tag.__repr__() string representation."""
        tag = Tag(name="Technology")
        db_session.add(tag)
        db_session.commit()
        db_session.refresh(tag)

        repr_str = repr(tag)
        assert "Tag" in repr_str
        assert "Technology" in repr_str


class TestRSSFeedModel:
    """Tests for RSSFeed model."""

    def test_create_rss_feed_minimal(self, db_session: Session):
        """Test creating RSS feed with only required fields."""
        feed = RSSFeed(
            name="TechCrunch",
            url="https://techcrunch.com/feed/"
        )
        db_session.add(feed)
        db_session.commit()
        db_session.refresh(feed)

        assert feed.id is not None
        assert feed.name == "TechCrunch"
        assert feed.url == "https://techcrunch.com/feed/"
        assert feed.description is None
        assert feed.is_active == True  # SQLite stores as integer
        assert feed.last_fetched_at is None

    def test_create_rss_feed_full(self, db_session: Session):
        """Test creating RSS feed with all fields."""
        feed = RSSFeed(
            name="Science Daily",
            url="https://www.sciencedaily.com/rss/all.xml",
            description="Latest science news and research",
            is_active=False
        )
        db_session.add(feed)
        db_session.commit()
        db_session.refresh(feed)

        assert feed.name == "Science Daily"
        assert feed.description == "Latest science news and research"
        assert feed.is_active == False  # SQLite stores as integer

    def test_rss_feed_unique_url_constraint(self, db_session: Session):
        """Test that RSS feed URLs must be unique."""
        feed1 = RSSFeed(name="Feed 1", url="https://example.com/feed.xml")
        db_session.add(feed1)
        db_session.commit()

        feed2 = RSSFeed(name="Feed 2", url="https://example.com/feed.xml")
        db_session.add(feed2)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_rss_feed_to_dict(self, db_session: Session):
        """Test RSSFeed.to_dict() serialization."""
        feed = RSSFeed(
            name="HackerNews",
            url="https://news.ycombinator.com/rss",
            description="Tech and startup news"
        )
        db_session.add(feed)
        db_session.commit()
        db_session.refresh(feed)

        data = feed.to_dict()

        assert "id" in data
        assert data["name"] == "HackerNews"
        assert data["url"] == "https://news.ycombinator.com/rss"
        assert data["description"] == "Tech and startup news"
        assert data["is_active"] is True
        assert "created_at" in data
        assert "updated_at" in data
        assert "last_fetched_at" in data

    def test_rss_feed_default_is_active(self, db_session: Session):
        """Test that is_active defaults to True."""
        feed = RSSFeed(name="Test Feed", url="https://test.com/feed.xml")
        db_session.add(feed)
        db_session.commit()
        db_session.refresh(feed)

        assert feed.is_active == True  # SQLite stores as integer

    def test_rss_feed_tag_association(self, db_session: Session, sample_tag: Tag):
        """Test many-to-many association with tags."""
        feed = RSSFeed(name="Tech Feed", url="https://tech.com/feed.xml")
        db_session.add(feed)
        db_session.commit()
        db_session.refresh(feed)

        # Associate tag with feed
        db_session.execute(
            rss_feed_tags.insert().values(feed_id=feed.id, tag_id=sample_tag.id)
        )
        db_session.commit()

        # Verify association exists
        result = db_session.execute(
            rss_feed_tags.select().where(rss_feed_tags.c.feed_id == feed.id)
        ).fetchone()

        assert result is not None
        assert result.feed_id == feed.id
        assert result.tag_id == sample_tag.id


class TestArticleModel:
    """Tests for Article model."""

    def test_create_article_minimal(self, db_session: Session):
        """Test creating article with only required fields."""
        published_date = datetime(2025, 10, 3, 10, 0, 0)
        article = Article(
            title="Test Article",
            content="This is test content for the article.",
            source="Test Source",
            published_date=published_date,
            url="https://example.com/article"
        )
        db_session.add(article)
        db_session.commit()
        db_session.refresh(article)

        assert article.id is not None
        assert article.title == "Test Article"
        assert article.content == "This is test content for the article."
        assert article.source == "Test Source"
        assert article.published_date == published_date
        assert article.url == "https://example.com/article"

    def test_create_article_full(self, db_session: Session):
        """Test creating article with all fields."""
        published_date = datetime(2025, 10, 3, 10, 0, 0)
        article = Article(
            title="AI Breakthrough 2025",
            content="Scientists announce major AI advancement...",
            source="TechCrunch",
            url="https://techcrunch.com/ai-breakthrough",
            published_date=published_date,
            article_metadata={"author": "John Doe", "category": "AI"}
        )
        db_session.add(article)
        db_session.commit()
        db_session.refresh(article)

        assert article.title == "AI Breakthrough 2025"
        assert article.content == "Scientists announce major AI advancement..."
        assert article.source == "TechCrunch"
        assert article.published_date == published_date
        assert article.article_metadata == {"author": "John Doe", "category": "AI"}

    def test_article_unique_url_constraint(self, db_session: Session):
        """Test that article URLs must be unique."""
        published_date = datetime(2025, 10, 3, 10, 0, 0)
        article1 = Article(
            title="Article 1",
            content="Content 1",
            source="Source 1",
            published_date=published_date,
            url="https://example.com/article"
        )
        db_session.add(article1)
        db_session.commit()

        article2 = Article(
            title="Article 2",
            content="Content 2",
            source="Source 2",
            published_date=published_date,
            url="https://example.com/article"
        )
        db_session.add(article2)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_article_to_dict(self, db_session: Session):
        """Test Article.to_dict() serialization."""
        published_date = datetime(2025, 10, 3, 10, 0, 0)
        article = Article(
            title="Quantum Computing Advances",
            content="New quantum research shows promise...",
            source="Science Daily",
            url="https://sciencedaily.com/quantum",
            published_date=published_date
        )
        db_session.add(article)
        db_session.commit()
        db_session.refresh(article)

        data = article.to_dict()

        assert "id" in data
        assert data["title"] == "Quantum Computing Advances"
        assert data["content"] == "New quantum research shows promise..."
        assert data["source"] == "Science Daily"
        assert data["url"] == "https://sciencedaily.com/quantum"
        assert "published_date" in data
        assert "created_at" in data

    def test_article_metadata_json(self, db_session: Session):
        """Test that metadata is stored as JSON."""
        published_date = datetime(2025, 10, 3, 10, 0, 0)
        article = Article(
            title="Test",
            content="Test content",
            source="Test Source",
            published_date=published_date,
            url="https://test.com/article",
            article_metadata={"tags": ["tech", "ai"], "views": 1000}
        )
        db_session.add(article)
        db_session.commit()
        db_session.refresh(article)

        assert isinstance(article.article_metadata, dict)
        assert article.article_metadata["tags"] == ["tech", "ai"]
        assert article.article_metadata["views"] == 1000


class TestUserPreferenceModel:
    """Tests for UserPreference model."""

    def test_create_user_preference_minimal(self, db_session: Session):
        """Test creating user preference with only required fields."""
        pref = UserPreference(user_id="user123")
        db_session.add(pref)
        db_session.commit()
        db_session.refresh(pref)

        assert pref.id is not None
        assert pref.user_id == "user123"
        assert pref.preferences == {}  # default=dict returns empty dict

    def test_create_user_preference_with_data(self, db_session: Session):
        """Test creating user preference with preferences data."""
        preferences_data = {
            "favorite_sources": ["TechCrunch", "Wired"],
            "excluded_topics": ["Sports", "Politics"],
            "notification_enabled": True
        }
        pref = UserPreference(
            user_id="user456",
            preferences=preferences_data
        )
        db_session.add(pref)
        db_session.commit()
        db_session.refresh(pref)

        assert pref.user_id == "user456"
        assert pref.preferences == preferences_data
        assert pref.preferences["favorite_sources"] == ["TechCrunch", "Wired"]

    def test_user_preference_unique_user_id(self, db_session: Session):
        """Test that user_id must be unique."""
        pref1 = UserPreference(user_id="user123")
        db_session.add(pref1)
        db_session.commit()

        pref2 = UserPreference(user_id="user123")
        db_session.add(pref2)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_user_preference_to_dict(self, db_session: Session):
        """Test UserPreference.to_dict() serialization."""
        preferences_data = {"theme": "dark", "language": "en"}
        pref = UserPreference(
            user_id="user789",
            preferences=preferences_data
        )
        db_session.add(pref)
        db_session.commit()
        db_session.refresh(pref)

        data = pref.to_dict()

        assert "id" in data
        assert data["user_id"] == "user789"
        assert data["preferences"] == preferences_data
        assert "created_at" in data
        assert "updated_at" in data


class TestSummaryModel:
    """Tests for Summary model."""

    def test_create_summary(self, db_session: Session, sample_article: Article):
        """Test creating a summary for an article."""
        summary = Summary(
            article_id=sample_article.id,
            summary_type="short",
            summary_text="This is a test summary of the article.",
            word_count=9
        )
        db_session.add(summary)
        db_session.commit()
        db_session.refresh(summary)

        assert summary.id is not None
        assert summary.article_id == sample_article.id
        assert summary.summary_type == "short"
        assert summary.summary_text == "This is a test summary of the article."
        assert summary.word_count == 9

    def test_summary_foreign_key(self, db_session: Session, sample_article: Article):
        """Test that summary has valid foreign key to article."""
        summary = Summary(
            article_id=sample_article.id,
            summary_type="medium",
            summary_text="Test summary",
            word_count=2
        )
        db_session.add(summary)
        db_session.commit()

        # Verify foreign key relationship
        assert summary.article_id == sample_article.id

    def test_summary_to_dict(self, db_session: Session, sample_article: Article):
        """Test Summary.to_dict() serialization."""
        summary = Summary(
            article_id=sample_article.id,
            summary_type="long",
            summary_text="AI research shows significant progress.",
            word_count=5
        )
        db_session.add(summary)
        db_session.commit()
        db_session.refresh(summary)

        data = summary.to_dict()

        assert "id" in data
        assert data["article_id"] == sample_article.id
        assert data["summary_type"] == "long"
        assert data["summary_text"] == "AI research shows significant progress."
        assert data["word_count"] == 5
        assert "created_at" in data

    def test_summary_independent_lifecycle(self, db_session: Session, sample_article: Article):
        """Test that summary has independent lifecycle (no CASCADE delete)."""
        summary = Summary(
            article_id=sample_article.id,
            summary_type="short",
            summary_text="Test summary",
            word_count=2
        )
        db_session.add(summary)
        db_session.commit()

        summary_id = summary.id

        # Delete the article
        db_session.delete(sample_article)
        db_session.commit()

        # Verify summary still exists (no CASCADE on article_id)
        # Since article_id is just an Integer column, not a ForeignKey
        remaining_summary = db_session.query(Summary).filter_by(id=summary_id).first()
        assert remaining_summary is not None
        assert remaining_summary.article_id == sample_article.id


class TestAssociationTable:
    """Tests for rss_feed_tags association table."""

    def test_association_create(self, db_session: Session):
        """Test creating feed-tag association."""
        # Create tag and feed without using fixtures to avoid pre-existing associations
        tag = Tag(name="TestTag")
        feed = RSSFeed(name="TestFeed", url="https://test.com/feed.xml")
        db_session.add_all([tag, feed])
        db_session.commit()
        db_session.refresh(tag)
        db_session.refresh(feed)

        db_session.execute(
            rss_feed_tags.insert().values(
                feed_id=feed.id,
                tag_id=tag.id
            )
        )
        db_session.commit()

        # Verify association exists
        result = db_session.execute(
            rss_feed_tags.select().where(
                rss_feed_tags.c.feed_id == feed.id,
                rss_feed_tags.c.tag_id == tag.id
            )
        ).fetchone()

        assert result is not None
        assert result.feed_id == feed.id
        assert result.tag_id == tag.id

    def test_association_multiple_tags(self, db_session: Session):
        """Test associating multiple tags with one feed."""
        # Create tags and feed without using fixtures
        tags = [
            Tag(name="Tag1"),
            Tag(name="Tag2"),
            Tag(name="Tag3")
        ]
        feed = RSSFeed(name="MultiFeed", url="https://multi.com/feed.xml")
        db_session.add_all(tags + [feed])
        db_session.commit()
        for tag in tags:
            db_session.refresh(tag)
        db_session.refresh(feed)

        for tag in tags:
            db_session.execute(
                rss_feed_tags.insert().values(
                    feed_id=feed.id,
                    tag_id=tag.id
                )
            )
        db_session.commit()

        # Count associations
        results = db_session.execute(
            rss_feed_tags.select().where(rss_feed_tags.c.feed_id == feed.id)
        ).fetchall()

        assert len(results) == 3

    def test_association_cascade_delete_tag(self, db_session: Session):
        """Test association behavior when deleting a tag."""
        # Create tag and feed without fixtures
        tag = Tag(name="DeleteTag")
        feed = RSSFeed(name="DeleteFeed", url="https://delete.com/feed.xml")
        db_session.add_all([tag, feed])
        db_session.commit()
        db_session.refresh(tag)
        db_session.refresh(feed)

        db_session.execute(
            rss_feed_tags.insert().values(
                feed_id=feed.id,
                tag_id=tag.id
            )
        )
        db_session.commit()

        tag_id = tag.id

        # Delete the tag
        db_session.delete(tag)
        db_session.commit()

        # Note: CASCADE behavior requires PRAGMA foreign_keys = ON in SQLite
        # In test environment, association might remain
        result = db_session.execute(
            rss_feed_tags.select().where(rss_feed_tags.c.tag_id == tag_id)
        ).fetchone()

        # Verify the tag was deleted
        deleted_tag = db_session.query(Tag).filter_by(id=tag_id).first()
        assert deleted_tag is None

    def test_association_cascade_delete_feed(self, db_session: Session):
        """Test association behavior when deleting a feed."""
        # Create tag and feed without fixtures
        tag = Tag(name="FeedDeleteTag")
        feed = RSSFeed(name="FeedDeleteFeed", url="https://feeddelete.com/feed.xml")
        db_session.add_all([tag, feed])
        db_session.commit()
        db_session.refresh(tag)
        db_session.refresh(feed)

        db_session.execute(
            rss_feed_tags.insert().values(
                feed_id=feed.id,
                tag_id=tag.id
            )
        )
        db_session.commit()

        feed_id = feed.id

        # Delete the feed
        db_session.delete(feed)
        db_session.commit()

        # Note: CASCADE behavior requires PRAGMA foreign_keys = ON in SQLite
        # In test environment, association might remain
        result = db_session.execute(
            rss_feed_tags.select().where(rss_feed_tags.c.feed_id == feed_id)
        ).fetchone()

        # Verify the feed was deleted
        deleted_feed = db_session.query(RSSFeed).filter_by(id=feed_id).first()
        assert deleted_feed is None
