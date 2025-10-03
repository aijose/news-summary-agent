"""
Tests for RSS Feeds API endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestGetRSSFeeds:
    """Tests for GET /rss-feeds endpoint."""

    def test_get_feeds_empty(self, client: TestClient):
        """Test getting feeds when database is empty."""
        response = client.get("/api/v1/rss-feeds")
        assert response.status_code == 200
        assert response.json() == []

    def test_get_feeds_with_data(self, client: TestClient, sample_rss_feeds):
        """Test getting feeds when feeds exist."""
        response = client.get("/api/v1/rss-feeds")
        assert response.status_code == 200

        data = response.json()
        assert len(data) == 2
        # Should be ordered by name
        assert data[0]["name"] == "Science Daily"
        assert data[1]["name"] == "TechCrunch"

    def test_get_feeds_response_structure(self, client: TestClient, sample_rss_feed):
        """Test that feed response has correct structure."""
        response = client.get("/api/v1/rss-feeds")
        assert response.status_code == 200

        data = response.json()
        assert len(data) == 1

        feed = data[0]
        assert "id" in feed
        assert "name" in feed
        assert "url" in feed
        assert "description" in feed
        assert "is_active" in feed
        assert "tags" in feed
        assert "created_at" in feed
        assert "updated_at" in feed
        assert "last_fetched_at" in feed

        assert feed["name"] == "TechCrunch"
        assert feed["url"] == "https://techcrunch.com/feed/"
        assert feed["is_active"] is True

    def test_get_feeds_with_tags(self, client: TestClient, sample_rss_feed):
        """Test that feeds include associated tags."""
        response = client.get("/api/v1/rss-feeds")
        assert response.status_code == 200

        data = response.json()
        feed = data[0]

        assert "tags" in feed
        assert len(feed["tags"]) == 1
        assert feed["tags"][0]["name"] == "Technology"
        assert "id" in feed["tags"][0]
        assert "color" in feed["tags"][0]


class TestCreateRSSFeed:
    """Tests for POST /rss-feeds endpoint."""

    def test_create_feed_success(self, client: TestClient):
        """Test creating a new feed successfully."""
        feed_data = {
            "name": "HackerNews",
            "url": "https://news.ycombinator.com/rss",
            "description": "Tech and startup news",
            "tag_ids": []
        }

        response = client.post("/api/v1/rss-feeds", json=feed_data)
        assert response.status_code == 201

        data = response.json()
        assert data["name"] == "HackerNews"
        assert data["url"] == "https://news.ycombinator.com/rss"
        assert data["description"] == "Tech and startup news"
        assert data["is_active"] is True
        assert data["tags"] == []
        assert "id" in data
        assert "created_at" in data

    def test_create_feed_with_tags(self, client: TestClient, sample_tag):
        """Test creating a feed with tags."""
        feed_data = {
            "name": "HackerNews",
            "url": "https://news.ycombinator.com/rss",
            "description": "Tech news",
            "tag_ids": [sample_tag.id]
        }

        response = client.post("/api/v1/rss-feeds", json=feed_data)
        assert response.status_code == 201

        data = response.json()
        assert len(data["tags"]) == 1
        assert data["tags"][0]["id"] == sample_tag.id
        assert data["tags"][0]["name"] == "Technology"

    def test_create_feed_minimal(self, client: TestClient):
        """Test creating a feed with only required fields."""
        feed_data = {
            "name": "MinimalFeed",
            "url": "https://example.com/feed.xml"
        }

        response = client.post("/api/v1/rss-feeds", json=feed_data)
        assert response.status_code == 201

        data = response.json()
        assert data["name"] == "MinimalFeed"
        assert data["description"] is None
        assert data["tags"] == []

    def test_create_feed_duplicate_url(self, client: TestClient, sample_rss_feed):
        """Test creating a feed with duplicate URL."""
        feed_data = {
            "name": "Different Name",
            "url": "https://techcrunch.com/feed/"
        }

        response = client.post("/api/v1/rss-feeds", json=feed_data)
        assert response.status_code == 400
        assert "already exists" in response.json()["error"]["message"].lower()

    def test_create_feed_empty_name(self, client: TestClient):
        """Test creating a feed with empty name."""
        feed_data = {
            "name": "  ",
            "url": "https://example.com/feed.xml"
        }

        response = client.post("/api/v1/rss-feeds", json=feed_data)
        assert response.status_code == 422  # Validation error

    def test_create_feed_invalid_url(self, client: TestClient):
        """Test creating a feed with invalid URL."""
        feed_data = {
            "name": "Test",
            "url": "not-a-valid-url"
        }

        response = client.post("/api/v1/rss-feeds", json=feed_data)
        assert response.status_code == 422  # Validation error

    def test_create_feed_invalid_tag_ids(self, client: TestClient):
        """Test creating a feed with non-existent tag IDs."""
        feed_data = {
            "name": "Test Feed",
            "url": "https://example.com/feed.xml",
            "tag_ids": [999, 1000]
        }

        response = client.post("/api/v1/rss-feeds", json=feed_data)
        assert response.status_code == 400
        assert "tag" in response.json()["error"]["message"].lower()

    def test_create_feed_name_trimming(self, client: TestClient):
        """Test that feed names are trimmed of whitespace."""
        feed_data = {
            "name": "  Test Feed  ",
            "url": "https://example.com/feed.xml"
        }

        response = client.post("/api/v1/rss-feeds", json=feed_data)
        assert response.status_code == 201
        assert response.json()["name"] == "Test Feed"


class TestUpdateRSSFeed:
    """Tests for PUT /rss-feeds/{feed_id} endpoint."""

    def test_update_feed_name(self, client: TestClient, sample_rss_feed):
        """Test updating a feed's name."""
        update_data = {"name": "TechCrunch Updated"}

        response = client.put(f"/api/v1/rss-feeds/{sample_rss_feed.id}", json=update_data)
        assert response.status_code == 200

        data = response.json()
        assert data["name"] == "TechCrunch Updated"
        assert data["id"] == sample_rss_feed.id

    def test_update_feed_description(self, client: TestClient, sample_rss_feed):
        """Test updating a feed's description."""
        update_data = {"description": "Updated description"}

        response = client.put(f"/api/v1/rss-feeds/{sample_rss_feed.id}", json=update_data)
        assert response.status_code == 200

        data = response.json()
        assert data["description"] == "Updated description"

    def test_update_feed_is_active(self, client: TestClient, sample_rss_feed):
        """Test updating a feed's active status."""
        update_data = {"is_active": False}

        response = client.put(f"/api/v1/rss-feeds/{sample_rss_feed.id}", json=update_data)
        assert response.status_code == 200

        data = response.json()
        assert data["is_active"] is False

    def test_update_feed_tags(self, client: TestClient, sample_rss_feeds, sample_tags):
        """Test updating a feed's tags."""
        # Use first feed from sample_rss_feeds (already has tag associated)
        feed_id = sample_rss_feeds[0].id

        # Update to use different tags
        update_data = {"tag_ids": [sample_tags[1].id, sample_tags[2].id]}

        response = client.put(f"/api/v1/rss-feeds/{feed_id}", json=update_data)
        assert response.status_code == 200

        data = response.json()
        assert len(data["tags"]) == 2
        tag_ids = [tag["id"] for tag in data["tags"]]
        assert sample_tags[1].id in tag_ids
        assert sample_tags[2].id in tag_ids

    def test_update_feed_remove_tags(self, client: TestClient, sample_rss_feed):
        """Test removing all tags from a feed."""
        update_data = {"tag_ids": []}

        response = client.put(f"/api/v1/rss-feeds/{sample_rss_feed.id}", json=update_data)
        assert response.status_code == 200

        data = response.json()
        assert data["tags"] == []

    def test_update_feed_multiple_fields(self, client: TestClient, sample_rss_feed):
        """Test updating multiple fields at once."""
        update_data = {
            "name": "Updated TechCrunch",
            "description": "New description",
            "is_active": False
        }

        response = client.put(f"/api/v1/rss-feeds/{sample_rss_feed.id}", json=update_data)
        assert response.status_code == 200

        data = response.json()
        assert data["name"] == "Updated TechCrunch"
        assert data["description"] == "New description"
        assert data["is_active"] is False

    def test_update_feed_not_found(self, client: TestClient):
        """Test updating a non-existent feed."""
        update_data = {"name": "Test"}

        response = client.put("/api/v1/rss-feeds/999", json=update_data)
        assert response.status_code == 404
        assert "not found" in response.json()["error"]["message"].lower()

    def test_update_feed_invalid_tag_ids(self, client: TestClient, sample_rss_feed):
        """Test updating feed with non-existent tag IDs."""
        update_data = {"tag_ids": [999]}

        response = client.put(f"/api/v1/rss-feeds/{sample_rss_feed.id}", json=update_data)
        assert response.status_code == 400
        assert "tag" in response.json()["error"]["message"].lower()

    def test_update_feed_partial_update(self, client: TestClient, sample_rss_feed):
        """Test partial update preserves unchanged fields."""
        original_name = sample_rss_feed.name
        original_url = sample_rss_feed.url

        update_data = {"description": "New description only"}

        response = client.put(f"/api/v1/rss-feeds/{sample_rss_feed.id}", json=update_data)
        assert response.status_code == 200

        data = response.json()
        assert data["name"] == original_name
        assert data["url"] == original_url
        assert data["description"] == "New description only"


class TestDeleteRSSFeed:
    """Tests for DELETE /rss-feeds/{feed_id} endpoint."""

    def test_delete_feed_success(self, client: TestClient, sample_rss_feed):
        """Test deleting a feed successfully."""
        response = client.delete(f"/api/v1/rss-feeds/{sample_rss_feed.id}")
        assert response.status_code == 204

        # Verify feed is deleted
        get_response = client.get("/api/v1/rss-feeds")
        assert len(get_response.json()) == 0

    def test_delete_feed_not_found(self, client: TestClient):
        """Test deleting a non-existent feed."""
        response = client.delete("/api/v1/rss-feeds/999")
        assert response.status_code == 404
        assert "not found" in response.json()["error"]["message"].lower()

    def test_delete_feed_with_tags(self, client: TestClient, sample_rss_feed, sample_tag):
        """Test deleting a feed with tag associations."""
        # Verify feed has tags
        get_response = client.get("/api/v1/rss-feeds")
        assert len(get_response.json()[0]["tags"]) == 1

        # Delete feed
        response = client.delete(f"/api/v1/rss-feeds/{sample_rss_feed.id}")
        assert response.status_code == 204

        # Verify feed is deleted
        get_response = client.get("/api/v1/rss-feeds")
        assert len(get_response.json()) == 0

        # Verify tag still exists
        tags_response = client.get("/api/v1/tags")
        assert len(tags_response.json()) == 1

    def test_delete_multiple_feeds(self, client: TestClient, sample_rss_feeds):
        """Test deleting multiple feeds."""
        # Delete first feed
        response1 = client.delete(f"/api/v1/rss-feeds/{sample_rss_feeds[0].id}")
        assert response1.status_code == 204

        # Verify only 1 feed remains
        get_response = client.get("/api/v1/rss-feeds")
        assert len(get_response.json()) == 1

        # Delete second feed
        response2 = client.delete(f"/api/v1/rss-feeds/{sample_rss_feeds[1].id}")
        assert response2.status_code == 204

        # Verify no feeds remain
        get_response = client.get("/api/v1/rss-feeds")
        assert len(get_response.json()) == 0

    def test_delete_feed_idempotent(self, client: TestClient, sample_rss_feed):
        """Test that deleting the same feed twice returns 404."""
        # First delete
        response1 = client.delete(f"/api/v1/rss-feeds/{sample_rss_feed.id}")
        assert response1.status_code == 204

        # Second delete
        response2 = client.delete(f"/api/v1/rss-feeds/{sample_rss_feed.id}")
        assert response2.status_code == 404


class TestRSSFeedIntegration:
    """Integration tests for RSS feed workflows."""

    def test_complete_feed_lifecycle(self, client: TestClient, sample_tag):
        """Test complete CRUD lifecycle for a feed."""
        # Create
        create_data = {
            "name": "Test Feed",
            "url": "https://example.com/feed.xml",
            "description": "Test description",
            "tag_ids": [sample_tag.id]
        }
        create_response = client.post("/api/v1/rss-feeds", json=create_data)
        assert create_response.status_code == 201
        feed_id = create_response.json()["id"]

        # Read
        get_response = client.get("/api/v1/rss-feeds")
        assert len(get_response.json()) == 1

        # Update
        update_data = {"name": "Updated Feed", "is_active": False}
        update_response = client.put(f"/api/v1/rss-feeds/{feed_id}", json=update_data)
        assert update_response.status_code == 200
        assert update_response.json()["name"] == "Updated Feed"
        assert update_response.json()["is_active"] is False

        # Delete
        delete_response = client.delete(f"/api/v1/rss-feeds/{feed_id}")
        assert delete_response.status_code == 204

        # Verify deleted
        final_get = client.get("/api/v1/rss-feeds")
        assert len(final_get.json()) == 0

    def test_feed_ordering(self, client: TestClient):
        """Test that feeds are returned in alphabetical order."""
        feeds = [
            {"name": "Zebra Feed", "url": "https://zebra.com/feed.xml"},
            {"name": "Alpha Feed", "url": "https://alpha.com/feed.xml"},
            {"name": "Beta Feed", "url": "https://beta.com/feed.xml"},
        ]

        for feed in feeds:
            client.post("/api/v1/rss-feeds", json=feed)

        response = client.get("/api/v1/rss-feeds")
        data = response.json()

        assert data[0]["name"] == "Alpha Feed"
        assert data[1]["name"] == "Beta Feed"
        assert data[2]["name"] == "Zebra Feed"

    def test_feed_tag_management(self, client: TestClient, sample_tags):
        """Test managing tags on feeds."""
        # Create feed with one tag
        feed_data = {
            "name": "Test Feed",
            "url": "https://example.com/feed.xml",
            "tag_ids": [sample_tags[0].id]
        }
        create_response = client.post("/api/v1/rss-feeds", json=feed_data)
        feed_id = create_response.json()["id"]
        assert len(create_response.json()["tags"]) == 1

        # Add more tags
        update_response = client.put(
            f"/api/v1/rss-feeds/{feed_id}",
            json={"tag_ids": [sample_tags[0].id, sample_tags[1].id, sample_tags[2].id]}
        )
        assert len(update_response.json()["tags"]) == 3

        # Remove some tags
        update_response = client.put(
            f"/api/v1/rss-feeds/{feed_id}",
            json={"tag_ids": [sample_tags[1].id]}
        )
        assert len(update_response.json()["tags"]) == 1
        assert update_response.json()["tags"][0]["id"] == sample_tags[1].id
