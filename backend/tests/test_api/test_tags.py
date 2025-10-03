"""
Tests for Tags API endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestGetTags:
    """Tests for GET /tags endpoint."""

    def test_get_tags_empty(self, client: TestClient):
        """Test getting tags when database is empty."""
        response = client.get("/api/v1/tags")
        assert response.status_code == 200
        assert response.json() == []

    def test_get_tags_with_data(self, client: TestClient, sample_tags):
        """Test getting tags when tags exist."""
        response = client.get("/api/v1/tags")
        assert response.status_code == 200

        data = response.json()
        assert len(data) == 3
        assert data[0]["name"] == "Business"  # Ordered by name
        assert data[1]["name"] == "Science"
        assert data[2]["name"] == "Technology"

    def test_get_tags_response_structure(self, client: TestClient, sample_tag):
        """Test that tag response has correct structure."""
        response = client.get("/api/v1/tags")
        assert response.status_code == 200

        data = response.json()
        assert len(data) == 1

        tag = data[0]
        assert "id" in tag
        assert "name" in tag
        assert "description" in tag
        assert "color" in tag
        assert "created_at" in tag
        assert "updated_at" in tag

        assert tag["name"] == "Technology"
        assert tag["description"] == "Tech news and updates"
        assert tag["color"] == "#3B82F6"


class TestCreateTag:
    """Tests for POST /tags endpoint."""

    def test_create_tag_success(self, client: TestClient):
        """Test creating a new tag successfully."""
        tag_data = {
            "name": "Health",
            "description": "Health and wellness news",
            "color": "#EF4444"
        }

        response = client.post("/api/v1/tags", json=tag_data)
        assert response.status_code == 201

        data = response.json()
        assert data["name"] == "Health"
        assert data["description"] == "Health and wellness news"
        assert data["color"] == "#EF4444"
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_tag_minimal(self, client: TestClient):
        """Test creating a tag with only required fields."""
        tag_data = {"name": "Politics"}

        response = client.post("/api/v1/tags", json=tag_data)
        assert response.status_code == 201

        data = response.json()
        assert data["name"] == "Politics"
        assert data["description"] is None
        assert data["color"] is None

    def test_create_tag_duplicate_name(self, client: TestClient, sample_tag):
        """Test creating a tag with duplicate name."""
        tag_data = {"name": "Technology"}

        response = client.post("/api/v1/tags", json=tag_data)
        assert response.status_code == 400
        assert "already exists" in response.json()["error"]["message"].lower()

    def test_create_tag_empty_name(self, client: TestClient):
        """Test creating a tag with empty name."""
        tag_data = {"name": "  "}

        response = client.post("/api/v1/tags", json=tag_data)
        assert response.status_code == 422  # Validation error

    def test_create_tag_invalid_color(self, client: TestClient):
        """Test creating a tag with invalid color format."""
        # Color without #
        tag_data = {"name": "Test", "color": "FF0000"}
        response = client.post("/api/v1/tags", json=tag_data)
        assert response.status_code == 422

        # Invalid hex length
        tag_data = {"name": "Test", "color": "#FF00"}
        response = client.post("/api/v1/tags", json=tag_data)
        assert response.status_code == 422

    def test_create_tag_valid_color_formats(self, client: TestClient):
        """Test creating tags with valid color formats."""
        test_colors = ["#FF0000", "#00ff00", "#0000FF", "#123ABC"]

        for i, color in enumerate(test_colors):
            tag_data = {"name": f"Test{i}", "color": color}
            response = client.post("/api/v1/tags", json=tag_data)
            assert response.status_code == 201
            assert response.json()["color"] == color

    def test_create_tag_name_trimming(self, client: TestClient):
        """Test that tag names are trimmed of whitespace."""
        tag_data = {"name": "  Sports  "}

        response = client.post("/api/v1/tags", json=tag_data)
        assert response.status_code == 201
        assert response.json()["name"] == "Sports"


class TestUpdateTag:
    """Tests for PUT /tags/{tag_id} endpoint."""

    def test_update_tag_name(self, client: TestClient, sample_tag):
        """Test updating a tag's name."""
        update_data = {"name": "Tech News"}

        response = client.put(f"/api/v1/tags/{sample_tag.id}", json=update_data)
        assert response.status_code == 200

        data = response.json()
        assert data["name"] == "Tech News"
        assert data["id"] == sample_tag.id

    def test_update_tag_description(self, client: TestClient, sample_tag):
        """Test updating a tag's description."""
        update_data = {"description": "Updated description"}

        response = client.put(f"/api/v1/tags/{sample_tag.id}", json=update_data)
        assert response.status_code == 200

        data = response.json()
        assert data["description"] == "Updated description"
        assert data["name"] == sample_tag.name  # Name unchanged

    def test_update_tag_color(self, client: TestClient, sample_tag):
        """Test updating a tag's color."""
        update_data = {"color": "#FF0000"}

        response = client.put(f"/api/v1/tags/{sample_tag.id}", json=update_data)
        assert response.status_code == 200

        data = response.json()
        assert data["color"] == "#FF0000"

    def test_update_tag_multiple_fields(self, client: TestClient, sample_tag):
        """Test updating multiple fields at once."""
        update_data = {
            "name": "Updated Tech",
            "description": "New description",
            "color": "#00FF00"
        }

        response = client.put(f"/api/v1/tags/{sample_tag.id}", json=update_data)
        assert response.status_code == 200

        data = response.json()
        assert data["name"] == "Updated Tech"
        assert data["description"] == "New description"
        assert data["color"] == "#00FF00"

    def test_update_tag_not_found(self, client: TestClient):
        """Test updating a non-existent tag."""
        update_data = {"name": "Test"}

        response = client.put("/api/v1/tags/999", json=update_data)
        assert response.status_code == 404
        assert "not found" in response.json()["error"]["message"].lower()

    def test_update_tag_duplicate_name(self, client: TestClient, sample_tags):
        """Test updating tag to a name that already exists."""
        update_data = {"name": "Science"}  # Second tag's name

        response = client.put(f"/api/v1/tags/{sample_tags[0].id}", json=update_data)
        assert response.status_code == 400
        assert "already exists" in response.json()["error"]["message"].lower()

    def test_update_tag_invalid_color(self, client: TestClient, sample_tag):
        """Test updating tag with invalid color."""
        update_data = {"color": "invalid"}

        response = client.put(f"/api/v1/tags/{sample_tag.id}", json=update_data)
        assert response.status_code == 422

    def test_update_tag_empty_name(self, client: TestClient, sample_tag):
        """Test updating tag with empty name."""
        update_data = {"name": "  "}

        response = client.put(f"/api/v1/tags/{sample_tag.id}", json=update_data)
        assert response.status_code == 422

    def test_update_tag_partial_update(self, client: TestClient, sample_tag):
        """Test partial update preserves unchanged fields."""
        original_name = sample_tag.name
        original_color = sample_tag.color

        update_data = {"description": "New description only"}

        response = client.put(f"/api/v1/tags/{sample_tag.id}", json=update_data)
        assert response.status_code == 200

        data = response.json()
        assert data["name"] == original_name
        assert data["color"] == original_color
        assert data["description"] == "New description only"


class TestDeleteTag:
    """Tests for DELETE /tags/{tag_id} endpoint."""

    def test_delete_tag_success(self, client: TestClient, sample_tag):
        """Test deleting a tag successfully."""
        response = client.delete(f"/api/v1/tags/{sample_tag.id}")
        assert response.status_code == 204

        # Verify tag is deleted
        get_response = client.get("/api/v1/tags")
        assert len(get_response.json()) == 0

    def test_delete_tag_not_found(self, client: TestClient):
        """Test deleting a non-existent tag."""
        response = client.delete("/api/v1/tags/999")
        assert response.status_code == 404
        assert "not found" in response.json()["error"]["message"].lower()

    def test_delete_tag_with_feeds(self, client: TestClient, db_session, sample_rss_feed, sample_tag):
        """Test deleting a tag that is assigned to RSS feeds."""
        # sample_rss_feed is associated with sample_tag in the fixture
        tag_id = sample_tag.id

        # Should succeed - cascade delete removes associations
        response = client.delete(f"/api/v1/tags/{tag_id}")
        assert response.status_code == 204

        # Verify tag is deleted
        get_response = client.get("/api/v1/tags")
        assert len(get_response.json()) == 0

    def test_delete_multiple_tags(self, client: TestClient, sample_tags):
        """Test deleting multiple tags."""
        # Delete first tag
        response1 = client.delete(f"/api/v1/tags/{sample_tags[0].id}")
        assert response1.status_code == 204

        # Verify only 2 tags remain
        get_response = client.get("/api/v1/tags")
        assert len(get_response.json()) == 2

        # Delete second tag
        response2 = client.delete(f"/api/v1/tags/{sample_tags[1].id}")
        assert response2.status_code == 204

        # Verify only 1 tag remains
        get_response = client.get("/api/v1/tags")
        assert len(get_response.json()) == 1

    def test_delete_tag_idempotent(self, client: TestClient, sample_tag):
        """Test that deleting the same tag twice returns 404."""
        # First delete
        response1 = client.delete(f"/api/v1/tags/{sample_tag.id}")
        assert response1.status_code == 204

        # Second delete
        response2 = client.delete(f"/api/v1/tags/{sample_tag.id}")
        assert response2.status_code == 404


class TestTagIntegration:
    """Integration tests for tag workflows."""

    def test_complete_tag_lifecycle(self, client: TestClient):
        """Test complete CRUD lifecycle for a tag."""
        # Create
        create_data = {"name": "Lifestyle", "description": "Lifestyle articles", "color": "#9333EA"}
        create_response = client.post("/api/v1/tags", json=create_data)
        assert create_response.status_code == 201
        tag_id = create_response.json()["id"]

        # Read
        get_response = client.get("/api/v1/tags")
        assert len(get_response.json()) == 1

        # Update
        update_data = {"name": "Lifestyle & Culture", "color": "#A855F7"}
        update_response = client.put(f"/api/v1/tags/{tag_id}", json=update_data)
        assert update_response.status_code == 200
        assert update_response.json()["name"] == "Lifestyle & Culture"

        # Delete
        delete_response = client.delete(f"/api/v1/tags/{tag_id}")
        assert delete_response.status_code == 204

        # Verify deleted
        final_get = client.get("/api/v1/tags")
        assert len(final_get.json()) == 0

    def test_tag_ordering(self, client: TestClient):
        """Test that tags are returned in alphabetical order."""
        tags = [
            {"name": "Zebra"},
            {"name": "Apple"},
            {"name": "Banana"},
        ]

        for tag in tags:
            client.post("/api/v1/tags", json=tag)

        response = client.get("/api/v1/tags")
        data = response.json()

        assert data[0]["name"] == "Apple"
        assert data[1]["name"] == "Banana"
        assert data[2]["name"] == "Zebra"
