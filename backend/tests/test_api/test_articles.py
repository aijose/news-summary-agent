"""
Tests for Articles API endpoints (core functionality).
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestGetArticles:
    """Tests for GET /articles endpoint."""

    def test_get_articles_empty(self, client: TestClient):
        """Test getting articles when database is empty."""
        response = client.get("/api/v1/articles/")
        assert response.status_code == 200

        data = response.json()
        assert "articles" in data
        assert "total" in data
        assert "skip" in data
        assert "limit" in data
        assert data["articles"] == []
        assert data["total"] == 0

    def test_get_articles_with_data(self, client: TestClient, sample_articles):
        """Test getting articles when articles exist."""
        response = client.get("/api/v1/articles/")
        assert response.status_code == 200

        data = response.json()
        assert len(data["articles"]) == 3
        assert data["total"] == 3
        assert data["skip"] == 0
        assert data["limit"] == 10

    def test_get_articles_response_structure(self, client: TestClient, sample_article):
        """Test that article response has correct structure."""
        response = client.get("/api/v1/articles/")
        assert response.status_code == 200

        data = response.json()
        assert len(data["articles"]) == 1

        article = data["articles"][0]
        assert "id" in article
        assert "title" in article
        assert "content" in article
        assert "source" in article
        assert "url" in article

        assert article["title"] == "Sample Tech Article"
        assert article["source"] == "TechCrunch"

    def test_get_articles_pagination_skip(self, client: TestClient, sample_articles):
        """Test pagination with skip parameter."""
        response = client.get("/api/v1/articles/?skip=1")
        assert response.status_code == 200

        data = response.json()
        assert len(data["articles"]) == 2
        assert data["total"] == 3
        assert data["skip"] == 1

    def test_get_articles_pagination_limit(self, client: TestClient, sample_articles):
        """Test pagination with limit parameter."""
        response = client.get("/api/v1/articles/?limit=2")
        assert response.status_code == 200

        data = response.json()
        assert len(data["articles"]) == 2
        assert data["total"] == 3
        assert data["limit"] == 2

    def test_get_articles_pagination_skip_and_limit(self, client: TestClient, sample_articles):
        """Test pagination with both skip and limit."""
        response = client.get("/api/v1/articles/?skip=1&limit=1")
        assert response.status_code == 200

        data = response.json()
        assert len(data["articles"]) == 1
        assert data["total"] == 3

    def test_get_articles_filter_by_source(self, client: TestClient, sample_articles):
        """Test filtering articles by source."""
        response = client.get("/api/v1/articles/?source=TechCrunch")
        assert response.status_code == 200

        data = response.json()
        assert len(data["articles"]) == 1
        assert data["articles"][0]["source"] == "TechCrunch"

    def test_get_articles_filter_by_source_partial_match(self, client: TestClient, sample_articles):
        """Test filtering with partial source name."""
        response = client.get("/api/v1/articles/?source=Science")
        assert response.status_code == 200

        data = response.json()
        assert len(data["articles"]) == 1
        assert data["articles"][0]["source"] == "Science Daily"

    def test_get_articles_filter_by_source_case_insensitive(self, client: TestClient, sample_articles):
        """Test that source filtering is case-insensitive."""
        response = client.get("/api/v1/articles/?source=techcrunch")
        assert response.status_code == 200

        data = response.json()
        assert len(data["articles"]) == 1
        assert data["articles"][0]["source"] == "TechCrunch"

    def test_get_articles_filter_no_matches(self, client: TestClient, sample_articles):
        """Test filtering with no matching source."""
        response = client.get("/api/v1/articles/?source=NonExistentSource")
        assert response.status_code == 200

        data = response.json()
        assert data["articles"] == []
        assert data["total"] == 0

    def test_get_articles_invalid_skip(self, client: TestClient):
        """Test that negative skip values are rejected."""
        response = client.get("/api/v1/articles/?skip=-1")
        assert response.status_code == 422  # Validation error

    def test_get_articles_invalid_limit(self, client: TestClient):
        """Test that invalid limit values are rejected."""
        # Limit too low
        response = client.get("/api/v1/articles/?limit=0")
        assert response.status_code == 422

        # Limit too high
        response = client.get("/api/v1/articles/?limit=101")
        assert response.status_code == 422


class TestGetArticleById:
    """Tests for GET /articles/{article_id} endpoint."""

    def test_get_article_by_id_success(self, client: TestClient, sample_article):
        """Test getting a specific article by ID."""
        response = client.get(f"/api/v1/articles/{sample_article.id}")
        assert response.status_code == 200

        data = response.json()
        assert data["id"] == sample_article.id
        assert data["title"] == "Sample Tech Article"
        assert data["source"] == "TechCrunch"
        assert data["content"] == "This is a sample article about technology."

    def test_get_article_by_id_not_found(self, client: TestClient):
        """Test getting a non-existent article."""
        response = client.get("/api/v1/articles/999")
        assert response.status_code == 404
        assert "not found" in response.json()["error"]["message"].lower()

    def test_get_article_by_id_response_structure(self, client: TestClient, sample_article):
        """Test that single article response has correct structure."""
        response = client.get(f"/api/v1/articles/{sample_article.id}")
        assert response.status_code == 200

        data = response.json()
        assert "id" in data
        assert "title" in data
        assert "content" in data
        assert "source" in data
        assert "url" in data


class TestDeleteArticle:
    """Tests for DELETE /articles/{article_id} endpoint."""

    def test_delete_article_success(self, client: TestClient, sample_article):
        """Test deleting an article successfully."""
        article_id = sample_article.id

        response = client.delete(f"/api/v1/articles/{article_id}")
        assert response.status_code == 200

        data = response.json()
        assert "message" in data
        assert str(article_id) in data["message"]

        # Verify article is deleted
        get_response = client.get(f"/api/v1/articles/{article_id}")
        assert get_response.status_code == 404

    def test_delete_article_not_found(self, client: TestClient):
        """Test deleting a non-existent article."""
        response = client.delete("/api/v1/articles/999")
        assert response.status_code == 404
        assert "not found" in response.json()["error"]["message"].lower()

    def test_delete_article_removes_from_list(self, client: TestClient, sample_articles):
        """Test that deleted article is removed from article list."""
        # Get initial count
        response = client.get("/api/v1/articles/")
        initial_count = response.json()["total"]
        assert initial_count == 3

        # Delete first article
        article_id = sample_articles[0].id
        delete_response = client.delete(f"/api/v1/articles/{article_id}")
        assert delete_response.status_code == 200

        # Verify count decreased
        response = client.get("/api/v1/articles/")
        assert response.json()["total"] == initial_count - 1

    def test_delete_article_idempotent(self, client: TestClient, sample_article):
        """Test that deleting the same article twice returns 404."""
        article_id = sample_article.id

        # First delete
        response1 = client.delete(f"/api/v1/articles/{article_id}")
        assert response1.status_code == 200

        # Second delete
        response2 = client.delete(f"/api/v1/articles/{article_id}")
        assert response2.status_code == 404


class TestArticlesIntegration:
    """Integration tests for article workflows."""

    def test_complete_article_lifecycle(self, client: TestClient, sample_article):
        """Test complete retrieval and deletion workflow."""
        article_id = sample_article.id

        # Get all articles
        response = client.get("/api/v1/articles/")
        assert response.status_code == 200
        assert response.json()["total"] == 1

        # Get specific article
        response = client.get(f"/api/v1/articles/{article_id}")
        assert response.status_code == 200
        assert response.json()["id"] == article_id

        # Delete article
        response = client.delete(f"/api/v1/articles/{article_id}")
        assert response.status_code == 200

        # Verify deletion
        response = client.get("/api/v1/articles/")
        assert response.json()["total"] == 0

    def test_pagination_workflow(self, client: TestClient, sample_articles):
        """Test pagination through all articles."""
        # Get first page
        response = client.get("/api/v1/articles/?skip=0&limit=2")
        assert response.status_code == 200
        page1 = response.json()
        assert len(page1["articles"]) == 2
        assert page1["total"] == 3

        # Get second page
        response = client.get("/api/v1/articles/?skip=2&limit=2")
        assert response.status_code == 200
        page2 = response.json()
        assert len(page2["articles"]) == 1
        assert page2["total"] == 3

        # Verify no overlap
        page1_ids = [article["id"] for article in page1["articles"]]
        page2_ids = [article["id"] for article in page2["articles"]]
        assert len(set(page1_ids) & set(page2_ids)) == 0

    def test_source_filtering_workflow(self, client: TestClient, sample_articles):
        """Test filtering by source."""
        # Get all TechCrunch articles
        response = client.get("/api/v1/articles/?source=TechCrunch")
        techcrunch_articles = response.json()
        assert techcrunch_articles["total"] == 1

        # Get all Science Daily articles
        response = client.get("/api/v1/articles/?source=Science Daily")
        science_articles = response.json()
        assert science_articles["total"] == 1

        # Verify different sources
        assert techcrunch_articles["articles"][0]["source"] != science_articles["articles"][0]["source"]
