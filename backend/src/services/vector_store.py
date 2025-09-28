"""
ChromaDB Vector Store Service for News Summary Agent.

This module handles all ChromaDB operations including collection management,
embedding storage, and vector similarity search for articles.
"""

import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
from typing import List, Dict, Any, Optional, Tuple
import logging
import os
from datetime import datetime

from ..config import settings
from ..database import Article

logger = logging.getLogger(__name__)


class VectorStoreService:
    """
    Service class for managing ChromaDB vector operations.

    This class provides a high-level interface for storing and searching
    article embeddings using ChromaDB as the vector database.
    """

    def __init__(self):
        """Initialize ChromaDB client and collection."""
        self.client = None
        self.collection = None
        self.embedding_function = None
        self._initialize_chroma()

    def _initialize_chroma(self) -> None:
        """Initialize ChromaDB client and create/get collection."""
        try:
            # Ensure persist directory exists
            persist_dir = settings.CHROMA_PERSIST_DIR
            os.makedirs(persist_dir, exist_ok=True)

            # Initialize ChromaDB client with persistent storage (updated configuration)
            self.client = chromadb.PersistentClient(
                path=persist_dir
            )

            # Initialize embedding function
            # Using default all-MiniLM-L6-v2 sentence transformer
            self.embedding_function = embedding_functions.DefaultEmbeddingFunction()

            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name=settings.CHROMA_COLLECTION_NAME,
                embedding_function=self.embedding_function,
                metadata={"description": "News articles with semantic embeddings"}
            )

            logger.info(f"ChromaDB initialized successfully with collection: {settings.CHROMA_COLLECTION_NAME}")
            logger.info(f"Persist directory: {persist_dir}")

        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            raise

    def add_article(self, article: Article) -> bool:
        """
        Add an article to the vector store.

        Args:
            article: Article object from database

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Prepare document text for embedding
            # Combine title and content for better semantic representation
            document_text = f"{article.title}\n\n{article.content}"

            # Prepare metadata
            metadata = {
                "article_id": article.id,
                "title": article.title,
                "source": article.source,
                "published_date": article.published_date.isoformat() if article.published_date else None,
                "url": article.url,
                "created_at": article.created_at.isoformat() if article.created_at else None,
                "content_length": len(article.content),
            }

            # Add custom metadata if available (filter out complex types for ChromaDB compatibility)
            if article.article_metadata:
                for key, value in article.article_metadata.items():
                    # ChromaDB supports basic types: str, int, float, bool
                    # Skip None, empty collections, and complex objects
                    if value is not None:
                        if isinstance(value, (str, int, float, bool)):
                            metadata[key] = value
                        elif isinstance(value, list):
                            # Skip empty lists, convert non-empty lists to comma-separated string
                            if len(value) > 0 and all(isinstance(item, (str, int, float, bool)) for item in value):
                                metadata[key] = ",".join(str(item) for item in value)
                        elif isinstance(value, dict):
                            # Skip empty dicts, convert non-empty dicts to JSON string
                            if len(value) > 0:
                                try:
                                    import json
                                    metadata[key] = json.dumps(value)
                                except (TypeError, ValueError):
                                    # Skip if can't serialize
                                    pass

            # Add to collection
            self.collection.add(
                documents=[document_text],
                ids=[f"article_{article.id}"],
                metadatas=[metadata]
            )

            logger.debug(f"Added article {article.id} to vector store")
            return True

        except Exception as e:
            logger.error(f"Failed to add article {article.id} to vector store: {e}")
            return False

    def search_similar_articles(
        self,
        query: str,
        limit: int = 10,
        source_filter: Optional[List[str]] = None,
        date_filter: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for articles similar to the given query.

        Args:
            query: Natural language search query
            limit: Maximum number of results to return
            source_filter: Optional list of sources to filter by
            date_filter: Optional date range filter

        Returns:
            List of search results with metadata and similarity scores
        """
        try:
            # Build where clause for filtering
            where_clause = {}

            if source_filter:
                where_clause["source"] = {"$in": source_filter}

            # TODO: Add date filtering support
            # ChromaDB filtering syntax for dates needs careful handling

            # Perform similarity search
            results = self.collection.query(
                query_texts=[query],
                n_results=limit,
                where=where_clause if where_clause else None,
                include=["documents", "metadatas", "distances"]
            )

            # Format results
            formatted_results = []

            if results["documents"] and len(results["documents"]) > 0:
                documents = results["documents"][0]
                metadatas = results["metadatas"][0] if results["metadatas"] else []
                distances = results["distances"][0] if results["distances"] else []

                for i, doc in enumerate(documents):
                    # Convert distance to similarity score (0-1, higher is more similar)
                    # ChromaDB returns distances, lower distance = higher similarity
                    distance = distances[i] if i < len(distances) else 1.0
                    similarity_score = max(0, 1 - distance)

                    result = {
                        "article_id": metadatas[i].get("article_id") if i < len(metadatas) else None,
                        "title": metadatas[i].get("title") if i < len(metadatas) else "Unknown",
                        "source": metadatas[i].get("source") if i < len(metadatas) else "Unknown",
                        "url": metadatas[i].get("url") if i < len(metadatas) else "",
                        "published_date": metadatas[i].get("published_date") if i < len(metadatas) else None,
                        "similarity_score": round(similarity_score, 4),
                        "snippet": doc[:200] + "..." if len(doc) > 200 else doc,
                        "metadata": metadatas[i] if i < len(metadatas) else {}
                    }
                    formatted_results.append(result)

            logger.info(f"Vector search for '{query}' returned {len(formatted_results)} results")
            return formatted_results

        except Exception as e:
            logger.error(f"Vector search failed for query '{query}': {e}")
            return []

    def get_collection_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the vector collection.

        Returns:
            Dictionary with collection statistics
        """
        try:
            count = self.collection.count()

            return {
                "total_documents": count,
                "collection_name": settings.CHROMA_COLLECTION_NAME,
                "persist_directory": settings.CHROMA_PERSIST_DIR,
                "embedding_function": str(self.embedding_function),
                "last_updated": datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Failed to get collection stats: {e}")
            return {"error": str(e)}

    def delete_article(self, article_id: int) -> bool:
        """
        Delete an article from the vector store.

        Args:
            article_id: Database ID of the article to delete

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            self.collection.delete(ids=[f"article_{article_id}"])
            logger.debug(f"Deleted article {article_id} from vector store")
            return True

        except Exception as e:
            logger.error(f"Failed to delete article {article_id} from vector store: {e}")
            return False

    def update_article(self, article: Article) -> bool:
        """
        Update an existing article in the vector store.

        Args:
            article: Updated article object

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Delete existing entry
            self.delete_article(article.id)

            # Add updated entry
            return self.add_article(article)

        except Exception as e:
            logger.error(f"Failed to update article {article.id} in vector store: {e}")
            return False

    def reset_collection(self) -> bool:
        """
        Reset the collection (delete all documents).

        WARNING: This will delete all stored embeddings!

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Delete the collection
            self.client.delete_collection(settings.CHROMA_COLLECTION_NAME)

            # Recreate the collection
            self.collection = self.client.create_collection(
                name=settings.CHROMA_COLLECTION_NAME,
                embedding_function=self.embedding_function,
                metadata={"description": "News articles with semantic embeddings"}
            )

            logger.warning("Vector collection has been reset - all embeddings deleted")
            return True

        except Exception as e:
            logger.error(f"Failed to reset collection: {e}")
            return False


# Global vector store instance
_vector_store = None


def get_vector_store() -> VectorStoreService:
    """
    Get the global vector store instance (singleton pattern).

    Returns:
        VectorStoreService: Initialized vector store service
    """
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStoreService()
    return _vector_store


# Convenience functions for common operations
def add_article_to_vector_store(article: Article) -> bool:
    """Add article to vector store."""
    return get_vector_store().add_article(article)


def search_articles_by_query(query: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Search articles by natural language query."""
    return get_vector_store().search_similar_articles(query, limit)


def get_vector_store_stats() -> Dict[str, Any]:
    """Get vector store statistics."""
    return get_vector_store().get_collection_stats()