# Implementation Plan - News Summary Agent

**Created**: September 27, 2025
**Last Updated**: September 30, 2025
**Status**: Phase 1 & 2 Complete - Production Focus
**Based on**: PRD v1.0 and finalized tech stack decisions

## Overview

This implementation plan originally outlined the roadmap for building the News Summary Agent through Phase 4. **Phases 1 and 2 have been completed successfully.** Phase 3 advanced features have been descoped to focus on production readiness. This document now serves as a reference for what was implemented and future production tasks.

## Phase 1: MVP Development (Weeks 1-2)

**Goal**: Functional news search and summarization with CLI interface
**Success Criteria**: 80%+ relevant search results, 90%+ fact preservation in summaries

### 1.1 Development Environment Setup (Day 1)

#### Task 1.1.1: Project Structure Creation
- [ ] Create backend/ directory with FastAPI structure
- [ ] Create frontend/ directory with React TypeScript structure
- [ ] Set up Docker Compose configuration
- [ ] Configure PostgreSQL container with initialization scripts
- [ ] Create .env.example files for environment configuration

**Files to Create:**
```
backend/
├── src/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── database.py          # Database connection and models
│   ├── models/              # SQLAlchemy models
│   ├── services/            # Business logic services
│   ├── agents/              # LangChain agent implementations
│   └── api/                 # API route handlers
├── requirements.txt         # Python dependencies
├── Dockerfile              # Backend container
└── .env.example            # Environment template

frontend/
├── src/
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── services/           # API client services
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── package.json            # Node.js dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── Dockerfile              # Frontend container

docker-compose.yml           # Development environment
```

#### Task 1.1.2: Dependency Management
- [ ] Set up uv virtual environment for backend
- [ ] Install core Python dependencies (FastAPI, LangChain, ChromaDB, SQLAlchemy, psycopg2)
- [ ] Configure React project with TypeScript, Vite, Tailwind CSS, TanStack Query
- [ ] Test Docker Compose environment startup

**Core Dependencies:**

*Backend (requirements.txt):*
```
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
langchain>=0.1.0
langchain-anthropic>=0.1.0
chromadb>=0.4.0
sqlalchemy>=2.0.0
psycopg2-binary>=2.9.0
pydantic>=2.0.0
python-dotenv>=1.0.0
feedparser>=6.0.10
requests>=2.31.0
```

*Frontend (package.json):*
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "react-router-dom": "^6.15.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### 1.2 Database and Storage Setup (Days 1-2)

#### Task 1.2.1: PostgreSQL Schema Design
- [ ] Design articles table schema (id, title, content, source, date, url, metadata)
- [ ] Create user preferences table (for future personalization)
- [ ] Set up database migrations with Alembic
- [ ] Create database initialization scripts

**Articles Table Schema:**
```sql
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(100) NOT NULL,
    published_date TIMESTAMP NOT NULL,
    url VARCHAR(1000) UNIQUE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_articles_source ON articles(source);
CREATE INDEX idx_articles_date ON articles(published_date);
CREATE INDEX idx_articles_metadata ON articles USING GIN(metadata);
```

#### Task 1.2.2: ChromaDB Integration
- [ ] Set up ChromaDB persistent storage
- [ ] Configure embedding model (default or custom)
- [ ] Create article collection with metadata
- [ ] Implement article indexing service
- [ ] Test vector search functionality

**ChromaDB Configuration:**
```python
import chromadb
from chromadb.config import Settings

# Persistent ChromaDB setup
client = chromadb.PersistentClient(
    path="./chroma_db",
    settings=Settings(
        chroma_db_impl="duckdb+parquet",
        persist_directory="./chroma_db"
    )
)

# Article collection with metadata
collection = client.get_or_create_collection(
    name="news_articles",
    metadata={"description": "News articles with embeddings"}
)
```

### 1.3 News Ingestion Pipeline (Days 2-3)

#### Task 1.3.1: RSS Feed Parser
- [ ] Implement RSS/Atom feed parser using feedparser
- [ ] Configure initial news sources (BBC, Reuters, NYT, Guardian, AP)
- [ ] Handle common RSS formats and edge cases
- [ ] Implement article deduplication logic
- [ ] Add error handling and retry mechanisms

**RSS Sources Configuration:**
```python
RSS_FEEDS = [
    "http://feeds.bbci.co.uk/news/rss.xml",
    "https://feeds.reuters.com/reuters/topNews",
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    "https://www.theguardian.com/world/rss",
    "https://feeds.washingtonpost.com/rss/world"
]
```

#### Task 1.3.2: Article Processing Service
- [ ] Implement article content extraction and cleaning
- [ ] Generate embeddings for vector storage
- [ ] Store articles in PostgreSQL with metadata
- [ ] Index articles in ChromaDB for semantic search
- [ ] Create background task scheduler for periodic ingestion

**Article Processing Pipeline:**
1. Fetch RSS feeds
2. Parse and extract article data
3. Clean and normalize content
4. Generate embeddings
5. Store in PostgreSQL
6. Index in ChromaDB
7. Handle errors and log results

### 1.4 Core RAG Implementation (Days 3-4)

#### Task 1.4.1: Semantic Search Service
- [ ] Implement query embedding generation
- [ ] Create ChromaDB similarity search
- [ ] Add result ranking and filtering
- [ ] Support date and source filtering
- [ ] Return structured search results with metadata

**Search Service Interface:**
```python
class SearchService:
    def semantic_search(
        self,
        query: str,
        limit: int = 10,
        date_filter: Optional[DateRange] = None,
        source_filter: Optional[List[str]] = None
    ) -> List[SearchResult]:
        # Implementation
        pass
```

#### Task 1.4.2: LangChain Agent Setup
- [ ] Configure Claude integration via LangChain
- [ ] Create base agent with tool access
- [ ] Implement search tool for ChromaDB queries
- [ ] Create summarization tool for article processing
- [ ] Add intent classification for query routing

**Agent Tools:**
- `search_articles`: Semantic search in ChromaDB
- `summarize_article`: Generate article summaries
- `get_article_details`: Retrieve full article information
- `classify_intent`: Determine user query intent

### 1.5 Basic Summarization (Days 4-5)

#### Task 1.5.1: Summarization Service
- [ ] Implement multiple summary lengths (50, 150, 300 words)
- [ ] Create prompt templates for different summary types
- [ ] Add fact preservation validation
- [ ] Support single article and multi-article summarization
- [ ] Include source attribution in summaries

**Summarization Prompts:**
```python
SUMMARY_PROMPTS = {
    "short": "Summarize this article in exactly 50 words, preserving key facts...",
    "medium": "Provide a 150-word summary of this article...",
    "long": "Create a comprehensive 300-word summary..."
}
```

#### Task 1.5.2: Agent Integration
- [ ] Integrate summarization into main agent workflow
- [ ] Add summary caching for performance
- [ ] Implement batch summarization for multiple articles
- [ ] Add summary quality validation

### 1.6 CLI Interface (Days 5-6)

#### Task 1.6.1: CLI Implementation
- [ ] Create command-line interface using Click or Typer
- [ ] Support search, summarize, and ingest commands
- [ ] Add configuration management for API keys
- [ ] Include help documentation and examples
- [ ] Implement result formatting and display

**CLI Commands:**
```bash
# Search for articles
news-agent search "AI regulation news"

# Summarize specific article
news-agent summarize --url "https://..." --length medium

# Ingest from RSS feeds
news-agent ingest --source all

# Get article details
news-agent article --id 123
```

#### Task 1.6.2: Testing and Validation
- [ ] Test all CLI commands with sample data
- [ ] Validate search result relevance (target: 80%+)
- [ ] Test summarization fact preservation (target: 90%+)
- [ ] Performance testing for response times (<5 seconds)
- [ ] Error handling and edge case testing

## Phase 1 Success Criteria

### Functional Requirements ✅
- [ ] **F1.1**: Ingest 500+ articles daily from 5-10 RSS feeds
- [ ] **F1.2**: 80%+ relevant search results for user queries
- [ ] **F1.3**: Generate summaries with 90%+ fact preservation
- [ ] **F1.4**: Route queries with 85%+ intent classification accuracy

### Performance Requirements ✅
- [ ] Response time <5 seconds for standard queries
- [ ] Successfully parse common RSS formats (RSS 2.0, Atom)
- [ ] Handle article deduplication and error recovery
- [ ] Support basic filtering (date, source)

### Technical Requirements ✅
- [ ] PostgreSQL database with proper schema
- [ ] ChromaDB vector storage with persistent data
- [ ] Claude integration via LangChain
- [ ] Docker Compose development environment
- [ ] CLI interface for all core functionality

## Phase 1 Deliverables

1. **Backend API**: FastAPI application with core endpoints
2. **Database Schema**: PostgreSQL with articles and metadata
3. **Vector Storage**: ChromaDB with article embeddings
4. **Ingestion Pipeline**: Automated RSS feed processing
5. **Search Service**: Semantic search with filtering
6. **Summarization Service**: Multi-length article summaries
7. **CLI Interface**: Command-line tool for testing
8. **Documentation**: API docs and usage examples
9. **Docker Environment**: Complete development setup
10. **Test Suite**: Basic functionality and performance tests

## Phase 1 Risk Mitigation

### Technical Risks
- **ChromaDB Performance**: Monitor query times, optimize if needed
- **LLM Costs**: Implement usage tracking and prompt optimization
- **RSS Feed Reliability**: Add multiple fallback sources

### Development Risks
- **Complexity**: Start with minimal viable features, iterate
- **Integration**: Test each component independently before integration
- **Performance**: Profile and optimize bottlenecks early

## Implementation Status

### ✅ Phase 1: MVP (Completed)
- Backend API with FastAPI
- RSS feed ingestion from 10+ sources
- ChromaDB vector storage with 326+ articles
- Semantic search functionality
- AI-powered summarization with Claude

### ✅ Phase 2: Core Features (Completed)
- React TypeScript web interface
- TanStack Query for state management
- Multi-perspective analysis implementation
- Responsive design with Tailwind CSS
- Real-time article ingestion UI

### ❌ Phase 3: Advanced Features (DESCOPED)
**Removed on 2025-09-30**:
- ~~Timeline creation for evolving stories~~
- ~~Impact analysis and prediction~~
- ~~Source credibility scoring system~~
- ~~Proactive alert system~~

**Rationale**: Core features provide sufficient value. Focus shifted to production readiness.

### 🎯 Production Phase (Current)
- Performance optimization and monitoring
- Comprehensive testing (unit, integration, E2E)
- Production deployment and CI/CD pipeline
- Complete documentation and user guides

## Development Best Practices

### Code Quality
- [ ] Use type hints throughout Python code
- [ ] Implement comprehensive error handling
- [ ] Follow FastAPI and React best practices
- [ ] Write unit tests for core functionality

### Documentation
- [ ] Update docs/ folder with implementation progress
- [ ] Document API endpoints with OpenAPI
- [ ] Create usage examples and tutorials
- [ ] Maintain decision log for architectural choices

### Version Control
- [ ] Use feature branches for major components
- [ ] Write descriptive commit messages
- [ ] Update documentation with each commit
- [ ] Tag releases for each phase completion