# Architecture Documentation

## System Overview

Distill (News Summary Agent) is a full-stack AI-powered news aggregation and analysis platform built with modern web technologies and leveraging advanced LLM capabilities.

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │         React Frontend (TypeScript + Vite)              │ │
│  │  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐  │ │
│  │  │   Pages &    │  │  TanStack     │  │   Zustand   │  │ │
│  │  │  Components  │  │    Query      │  │    Store    │  │ │
│  │  └──────────────┘  └───────────────┘  └─────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────┬──────HTTP/JSON───────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   FastAPI Backend (Python)                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │          RESTful API Layer (Routers)                    │ │
│  │  Articles│Search│Tags│RSS Feeds│Analysis│Trending      │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌──────────────┬────────────────┬────────────────────────┐ │
│  │   Business   │  LangChain     │   Data Access          │ │
│  │    Logic     │  Agent Layer   │   Layer (SQLAlchemy)   │ │
│  └──────────────┴────────────────┴────────────────────────┘ │
└─────────┬──────────────────┬──────────────────┬────────────┘
          │                  │                  │
          │                  │                  │
    ┌─────▼──────┐   ┌──────▼────────┐   ┌────▼──────────┐
    │PostgreSQL/ │   │   ChromaDB    │   │  Anthropic    │
    │  SQLite    │   │ Vector Store  │   │  Claude API   │
    │  Database  │   │  (Embeddings) │   │    (LLM)      │
    └────────────┘   └───────────────┘   └───────────────┘
```

---

## Frontend Architecture

### Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast HMR, optimized builds)
- **Styling**: Tailwind CSS (utility-first)
- **State Management**:
  - TanStack Query (server state, caching)
  - Zustand (client state, Reading List)
- **Routing**: React Router v6
- **HTTP Client**: Axios with custom API client

### Directory Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── articles/        # Article-related components
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── ArticleList.tsx
│   │   │   └── ArticleDetail.tsx
│   │   ├── TagFilter.tsx
│   │   ├── Layout.tsx
│   │   └── icons/          # Custom icon components
│   ├── pages/              # Route-level page components
│   │   ├── Home.tsx
│   │   ├── Search.tsx
│   │   ├── Browse.tsx
│   │   ├── ArticleDetail.tsx
│   │   ├── ReadingList.tsx
│   │   ├── ResearchAgent.tsx
│   │   ├── Admin.tsx
│   │   └── Help.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useArticlesQuery.ts
│   │   ├── useSearchQuery.ts
│   │   └── useTags.ts
│   ├── services/           # API and external services
│   │   └── api.ts          # Axios-based API client
│   ├── store/              # Zustand stores
│   │   └── useReadingListStore.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx             # Root component with routing
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

### Component Architecture

#### Core Components

**Layout.tsx**
- Global navigation and layout structure
- Responsive navigation bar
- Page wrapper with consistent styling
- Used on all pages

**ArticleCard.tsx**
- Displays individual article preview
- Summary generation UI with type selection
- Bookmark functionality
- Click-through to article detail
- Used on: Home, Browse, Search, Reading List

**ArticleList.tsx**
- Renders collection of ArticleCard components
- Handles loading and error states
- Pagination with "Load More" functionality
- Reusable across multiple pages

**TagFilter.tsx**
- Tag selection UI with color-coded chips
- Multi-select with checkmark indicators
- "Clear all" functionality
- Used on: Home, Browse, Search

#### Page Components

**Home.tsx**
- Landing page and primary entry point
- Hero section with branding and search
- Trending Insights feature
- Latest news with tag filtering
- Feature showcase cards

**Search.tsx**
- Semantic search interface
- AI-enhanced search toggle
- Multi-perspective analysis panel
- Article selection with checkboxes
- Tag filtering of results

**Browse.tsx**
- Comprehensive article browsing
- Tag and time range filtering
- Infinite scroll pagination
- Refresh functionality

**ArticleDetail.tsx**
- Full article display
- Enhanced formatting (paragraphs, typography)
- Summary generation and display
- Reading time estimate
- Source link and metadata

**ReadingList.tsx**
- Saved articles display
- Uses localStorage for persistence
- Remove functionality
- Summary generation

**ResearchAgent.tsx**
- Complex research query input
- Execution plan display
- Step-by-step progress tracking
- Comprehensive results presentation

**Admin.tsx**
- Tag management (CRUD)
- RSS feed management (CRUD)
- Article ingestion trigger
- Real-time ingestion progress

**Help.tsx**
- Feature documentation
- Usage instructions
- Pro tips and best practices

### State Management Strategy

#### Server State (TanStack Query)

```typescript
// Query hooks for server data
useInfiniteArticles()   // Paginated article lists
useArticle(id)          // Single article
useTags()               // Tag list
useRSSFeeds()           // Feed list
useSearch(query)        // Search results
useTrendingTopics()     // Trending analysis

// Mutation hooks for data modification
useCreateTag()          // Create tag
useUpdateTag()          // Update tag
useDeleteTag()          // Delete tag
useCreateFeed()         // Create feed
useUpdateFeed()         // Update feed
useDeleteFeed()         // Delete feed
useGenerateSummary()    // Generate summary
```

**Caching Strategy**:
- Article lists: 2-minute stale time
- Individual articles: 5-minute stale time
- Tags/Feeds: 15-minute stale time
- Search results: No stale time (always fresh)
- Automatic cache invalidation on mutations

#### Client State (Zustand)

```typescript
// Reading List store
useReadingListStore:
  - savedArticles: number[]
  - addArticle(id)
  - removeArticle(id)
  - isArticleSaved(id)
  - Persisted to localStorage
```

### Data Flow

```
User Action
    ↓
React Component
    ↓
TanStack Query Hook / Zustand Action
    ↓
API Client (services/api.ts)
    ↓
HTTP Request to Backend
    ↓
Backend Processing
    ↓
JSON Response
    ↓
TanStack Query Cache / Zustand Store
    ↓
Component Re-render
    ↓
Updated UI
```

### Routing Structure

```typescript
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/search" element={<Search />} />
  <Route path="/browse" element={<Browse />} />
  <Route path="/article/:id" element={<ArticleDetail />} />
  <Route path="/reading-list" element={<ReadingList />} />
  <Route path="/research-agent" element={<ResearchAgent />} />
  <Route path="/admin" element={<Admin />} />
  <Route path="/help" element={<Help />} />
</Routes>
```

---

## Backend Architecture

### Technology Stack

- **Framework**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy 2.0
- **Database**: PostgreSQL / SQLite
- **Vector Store**: ChromaDB (persistent mode)
- **LLM**: Claude (Anthropic) via LangChain
- **Package Manager**: uv
- **Migrations**: Alembic

### Directory Structure

```
backend/
├── src/
│   ├── routers/              # API route handlers
│   │   ├── articles.py       # Article endpoints
│   │   ├── search.py         # Search endpoints
│   │   ├── tags.py           # Tag CRUD
│   │   └── rss_feeds.py      # Feed CRUD
│   ├── models/               # SQLAlchemy models
│   │   ├── article.py        # Article model
│   │   ├── tag.py            # Tag model
│   │   ├── rss_feed.py       # RSS feed model
│   │   └── associations.py   # Association tables
│   ├── schemas/              # Pydantic schemas
│   │   ├── article.py        # Article schemas
│   │   ├── tag.py            # Tag schemas
│   │   └── rss_feed.py       # Feed schemas
│   ├── services/             # Business logic
│   │   ├── langchain_agent.py    # LangChain integration
│   │   ├── rss_ingestion.py      # RSS feed processing
│   │   └── vector_store.py       # ChromaDB operations
│   ├── database.py           # Database connection
│   ├── config.py             # Configuration management
│   └── main.py               # FastAPI application
├── alembic/                  # Database migrations
│   ├── versions/             # Migration scripts
│   └── env.py               # Alembic config
├── tests/                    # Test suite
│   ├── test_api/            # API endpoint tests
│   ├── test_models.py       # Model tests
│   └── conftest.py          # Test fixtures
├── .env.example             # Environment template
├── pyproject.toml           # Python dependencies (uv)
└── alembic.ini              # Alembic configuration
```

### API Layer (Routers)

FastAPI routers provide RESTful API endpoints:

```python
# articles.py
@router.get("/articles")              # List articles
@router.get("/articles/{id}")         # Get article
@router.get("/articles/trending")     # Trending analysis
@router.post("/articles/{id}/summarize")  # Generate summary
@router.post("/articles/ingest")      # Trigger ingestion

# search.py
@router.get("/search")                # Semantic search
@router.post("/analyze")              # Multi-perspective

# tags.py
@router.get("/tags")                  # List tags
@router.post("/tags")                 # Create tag
@router.put("/tags/{id}")             # Update tag
@router.delete("/tags/{id}")          # Delete tag

# rss_feeds.py
@router.get("/rss-feeds")             # List feeds
@router.post("/rss-feeds")            # Create feed
@router.put("/rss-feeds/{id}")        # Update feed
@router.delete("/rss-feeds/{id}")     # Delete feed
```

### Database Models

#### Article Model
```python
class Article(Base):
    id: int (PK)
    title: str
    content: str
    url: str (unique)
    source: str
    author: str | None
    published_at: datetime
    ingested_at: datetime
    quality_score: float
    summary_brief: str | None
    summary_comprehensive: str | None
    summary_analytical: str | None
```

#### Tag Model
```python
class Tag(Base):
    id: int (PK)
    name: str (unique)
    description: str | None
    color: str  # Hex color code
    created_at: datetime
    updated_at: datetime

    # Relationships
    feeds: List[RSSFeed]  # Many-to-many
```

#### RSSFeed Model
```python
class RSSFeed(Base):
    id: int (PK)
    name: str
    url: str (unique)
    description: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    # Relationships
    tags: List[Tag]  # Many-to-many
```

#### Association Tables
```python
# rss_feed_tags
rss_feed_id: int (FK → rss_feeds.id)
tag_id: int (FK → tags.id)
```

### Service Layer

#### LangChain Agent (`langchain_agent.py`)

Handles all LLM interactions:

```python
class NewsAgent:
    def __init__(self):
        self.llm = ChatAnthropic(model="claude-3-5-sonnet-20241022")
        self.summarization_prompt = PromptTemplate(...)
        self.trending_prompt = PromptTemplate(...)
        self.analysis_prompt = PromptTemplate(...)

    async def summarize_article(article_id, summary_type):
        # Generate summary with type-specific prompt
        # Cache result in database

    async def analyze_trending_topics(hours_back):
        # Fetch recent articles
        # Generate AI narrative analysis
        # Return with sample article IDs

    async def analyze_multiple_articles(article_ids):
        # Cross-article perspective analysis
        # Identify themes, bias, gaps
```

**Prompt Engineering**:
- Distinct prompts for Brief/Comprehensive/Analytical summaries
- Structured outputs with clear formatting
- Context-aware instructions
- Length and structure constraints

#### RSS Ingestion (`rss_ingestion.py`)

```python
class RSSIngestionService:
    async def ingest_all_feeds():
        # Fetch all active RSS feeds
        # For each feed:
        #   - Parse RSS/Atom feed
        #   - Extract articles
        #   - Check for duplicates
        #   - Store in database
        #   - Generate embeddings
        # Return statistics

    async def parse_feed(feed_url):
        # Fetch feed XML
        # Parse with feedparser
        # Extract article metadata
        # Return article dictionaries
```

**Quality Assessment**:
- Content length scoring
- Metadata completeness
- Source reputation (future)
- Duplicate detection

#### Vector Store (`vector_store.py`)

```python
class VectorStoreService:
    def __init__(self):
        self.client = chromadb.PersistentClient(path="./chroma_db")
        self.collection = self.client.get_or_create_collection("articles")

    async def add_articles(articles):
        # Generate embeddings
        # Store in ChromaDB

    async def semantic_search(query, limit):
        # Generate query embedding
        # Search ChromaDB
        # Return ranked results

    async def ai_enhanced_search(query, limit):
        # Use LLM to expand query
        # Perform semantic search
        # Re-rank with AI understanding
```

**Embedding Strategy**:
- Embed article title + first 500 words of content
- Store full article ID for retrieval
- Persistent storage (survives restarts)

### Database Layer

#### Connection Management

```python
# database.py
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./news_agent.db")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Database Choices**:
- **Development**: SQLite (zero configuration)
- **Production**: PostgreSQL (recommended)
- Migration path: Same SQLAlchemy models work with both

#### Migrations (Alembic)

```bash
# Generate migration
uv run alembic revision --autogenerate -m "Add tags table"

# Apply migrations
uv run alembic upgrade head

# Rollback
uv run alembic downgrade -1
```

---

## Data Flow Patterns

### Article Ingestion Flow

```
RSS Feed URL
    ↓
RSS Ingestion Service
    ↓
Parse XML (feedparser)
    ↓
Extract Article Metadata
    ↓
Check for Duplicates (URL)
    ↓
Create Article Record (SQLAlchemy)
    ↓
Generate Vector Embedding
    ↓
Store in ChromaDB
    ↓
Return Statistics
```

### Search Flow

```
User Search Query
    ↓
Frontend Search Component
    ↓
API Client (GET /search)
    ↓
Backend Search Router
    ↓
Vector Store Service
    ↓
ChromaDB Similarity Search
    ↓
Rank by Relevance Score
    ↓
Fetch Full Articles (SQLAlchemy)
    ↓
Return Enriched Results
    ↓
Frontend Display
```

### Summary Generation Flow

```
User Clicks "Generate Summary"
    ↓
Frontend ArticleCard
    ↓
API Client (POST /articles/{id}/summarize)
    ↓
Backend Articles Router
    ↓
Check Database Cache (summary_type)
    ↓
If Cached: Return Immediately
    ↓
If Not Cached:
    ↓
LangChain Agent
    ↓
Claude API (Anthropic)
    ↓
Parse Response
    ↓
Store in Database
    ↓
Return Summary
    ↓
Frontend Display & Cache (TanStack Query)
```

### Multi-Perspective Analysis Flow

```
User Selects Articles (2-10)
    ↓
Frontend Search Component
    ↓
API Client (POST /analyze)
    ↓
Backend Articles Router
    ↓
Fetch All Selected Articles
    ↓
LangChain Agent
    ↓
Claude API with Multi-Article Prompt
    ↓
Parse Structured Analysis
    ↓
Return Analysis Object:
  - Common Themes
  - Unique Perspectives
  - Bias Detection
  - Coverage Gaps
    ↓
Frontend Analysis Panel Display
```

---

## External Integrations

### Anthropic Claude API

**Purpose**: LLM for all AI features

**Usage**:
- Article summarization (3 types)
- Trending topic analysis
- Multi-perspective analysis
- Research agent execution

**Configuration**:
```python
# .env
ANTHROPIC_API_KEY=sk-ant-api03-...

# Code
llm = ChatAnthropic(
    model="claude-3-5-sonnet-20241022",
    temperature=0.3,
    max_tokens=4000
)
```

**Rate Limiting**:
- Tier-based (based on API plan)
- Backend implements queuing (future)
- Frontend caching reduces calls

### ChromaDB

**Purpose**: Vector database for semantic search

**Configuration**:
```python
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(
    name="articles",
    embedding_function=default_ef  # Uses sentence-transformers
)
```

**Storage**:
- Persistent mode (survives restarts)
- Stores embeddings + article IDs
- Automatic similarity search

### RSS Feeds

**Purpose**: Article content sources

**Parsing**:
- Python `feedparser` library
- Supports RSS 2.0 and Atom formats
- Handles various feed structures

**Configured Feeds** (examples):
- Hacker News: https://hnrss.org/newest
- TechCrunch: https://techcrunch.com/feed/
- Ars Technica: https://feeds.arstechnica.com/arstechnica/index
- Science Daily: https://www.sciencedaily.com/rss/all.xml

---

## Security Architecture

### API Key Management

**Environment Variables**:
```bash
# .env (never committed to git)
ANTHROPIC_API_KEY=sk-ant-api03-...
DATABASE_URL=postgresql://user:pass@localhost/db
```

**Security Measures**:
- API keys stored in `.env` file
- `.env` in `.gitignore`
- `.env.example` template with placeholders
- Backend only - never exposed to frontend

### CORS Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Production**: Restrict to specific domains

### Input Validation

**Pydantic Schemas**:
```python
class TagCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    description: str | None = Field(None, max_length=200)
    color: str = Field(..., regex=r'^#[0-9A-Fa-f]{6}$')
```

**SQLAlchemy Constraints**:
```python
url = Column(String, unique=True, nullable=False)
name = Column(String(50), nullable=False)
```

### SQL Injection Prevention

- SQLAlchemy ORM (parameterized queries)
- No raw SQL with user input
- Pydantic validation before DB operations

### XSS Prevention

- React automatically escapes JSX content
- API returns plain text (no HTML)
- Tailwind classes (no inline styles from data)

---

## Performance Optimizations

### Frontend

**Code Splitting**:
```typescript
// Lazy load routes
const Admin = lazy(() => import('./pages/Admin'))
const ResearchAgent = lazy(() => import('./pages/ResearchAgent'))
```

**Asset Optimization**:
- Vite automatic tree-shaking
- Production builds with minification
- Image lazy loading (future)

**Query Optimization**:
- TanStack Query caching
- Stale-while-revalidate pattern
- Prefetching on hover (future)

### Backend

**Database Indexing**:
```python
# Indexed columns
url = Column(String, unique=True, index=True)
published_at = Column(DateTime, index=True)
source = Column(String, index=True)
```

**Query Optimization**:
- Eager loading relationships
- Pagination for large datasets
- Filter before fetch (not client-side)

**Caching**:
- Summary results cached in database
- In-memory cache for tags/feeds (future)

### Vector Search

**ChromaDB Optimization**:
- Persistent storage (faster than rebuild)
- Batch embedding generation
- Approximate nearest neighbor (fast)

---

## Scalability Considerations

### Current Capacity

- **Articles**: Tested with 1000+ articles
- **Concurrent Users**: Single-server handles ~10-20 concurrent
- **Search**: Sub-second for thousands of documents
- **Storage**: ~1GB for 10,000 articles (DB + vectors)

### Scaling Strategies

**Horizontal Scaling** (future):
- Multiple FastAPI instances behind load balancer
- Shared PostgreSQL database
- Distributed vector store (Qdrant, Weaviate)

**Vertical Scaling**:
- Increase server resources
- More RAM for in-memory caching
- Faster storage for ChromaDB

**Database Scaling**:
- PostgreSQL replication (read replicas)
- Connection pooling
- Partitioning by date (old articles)

**Caching Layer** (future):
- Redis for API response caching
- CDN for static assets
- Query result caching

---

## Deployment Architecture

### Development

```
Developer Machine
├── Frontend (npm run dev) → http://localhost:3001
├── Backend (uvicorn) → http://localhost:8000
├── Database (SQLite) → ./backend/news_agent.db
└── Vector Store (ChromaDB) → ./backend/chroma_db/
```

### Production (Planned)

```
                    ┌─────────────┐
                    │  Cloudflare │
                    │     CDN     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Nginx     │
                    │ Reverse Proxy│
                    └──────┬──────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
    ┌───────▼────────┐          ┌────────▼────────┐
    │  React (Static)│          │ FastAPI (Docker)│
    │   Vercel/S3    │          │   AWS ECS/GCP   │
    └────────────────┘          └────────┬────────┘
                                         │
                            ┌────────────┼────────────┐
                            │            │            │
                     ┌──────▼──────┐ ┌──▼───────┐ ┌──▼──────┐
                     │ PostgreSQL  │ │ ChromaDB │ │  Redis  │
                     │  RDS/Cloud  │ │ Instance │ │  Cache  │
                     └─────────────┘ └──────────┘ └─────────┘
```

**Components**:
- Frontend: Static hosting (Vercel, Netlify, S3+CloudFront)
- Backend: Containerized FastAPI (Docker, Kubernetes)
- Database: Managed PostgreSQL (RDS, Cloud SQL)
- Vector Store: Dedicated ChromaDB instance or managed service
- Cache: Redis for API caching and rate limiting

---

## Testing Architecture

### Frontend Tests

**Unit Tests** (Vitest + React Testing Library):
```typescript
// Component tests
test('ArticleCard renders correctly', () => { ... })
test('TagFilter handles selection', () => { ... })

// Hook tests
test('useArticlesQuery fetches articles', async () => { ... })
```

**E2E Tests** (Playwright):
```typescript
test('User can search and view articles', async ({ page }) => {
  await page.goto('/search')
  await page.fill('input[type="text"]', 'AI healthcare')
  await page.click('button:text("Search")')
  await expect(page.locator('.article-card')).toBeVisible()
})
```

### Backend Tests

**API Tests** (pytest + httpx):
```python
def test_get_articles(client):
    response = client.get("/api/v1/articles")
    assert response.status_code == 200
    assert "articles" in response.json()

def test_create_tag(client, db):
    response = client.post("/api/v1/tags", json={
        "name": "Test Tag",
        "color": "#FF0000"
    })
    assert response.status_code == 201
```

**Model Tests** (pytest + SQLAlchemy):
```python
def test_article_model(db):
    article = Article(
        title="Test",
        content="Content",
        url="https://test.com/article"
    )
    db.add(article)
    db.commit()
    assert article.id is not None
```

**Test Fixtures**:
```python
@pytest.fixture
def db():
    # In-memory SQLite for isolated tests
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(bind=engine)
    yield TestingSessionLocal()
```

---

## Monitoring & Observability (Planned)

### Logging

**Backend**:
```python
import logging

logger = logging.getLogger(__name__)
logger.info("Article ingestion started")
logger.error(f"Failed to fetch feed: {feed_url}", exc_info=True)
```

**Levels**:
- DEBUG: Development debugging
- INFO: Normal operations
- WARNING: Non-critical issues
- ERROR: Operation failures
- CRITICAL: System failures

### Metrics (Future)

**Application Metrics**:
- Request count and latency
- Error rates by endpoint
- LLM API usage and costs
- Cache hit rates

**Business Metrics**:
- Articles ingested per day
- Summaries generated
- Popular search queries
- User engagement patterns

### Error Tracking (Future)

**Tools**:
- Sentry (error tracking)
- CloudWatch (AWS)
- Stackdriver (GCP)

---

## Development Workflow

### Local Development

1. **Start Backend**:
```bash
cd backend
uv run uvicorn src.main:app --reload --port 8000
```

2. **Start Frontend**:
```bash
cd frontend
npm run dev
```

3. **Run Tests**:
```bash
# Backend
cd backend
uv run python -m pytest tests/ -v

# Frontend
cd frontend
npm test
```

### Code Quality

**Backend**:
- Linting: `ruff` (fast Python linter)
- Formatting: `black` (code formatter)
- Type checking: `mypy` (static types)

**Frontend**:
- Linting: `eslint` (TS/React rules)
- Formatting: `prettier`
- Type checking: `tsc --noEmit`

### Git Workflow

1. Feature branches from `main`
2. Develop and test locally
3. Commit with conventional commits
4. Push and create PR
5. CI runs tests
6. Review and merge

---

## Technology Decisions

### Why React?

- **Component-based**: Reusable UI components
- **Ecosystem**: Rich library ecosystem (TanStack Query, etc.)
- **TypeScript**: Strong typing for reliability
- **Developer experience**: Fast HMR with Vite
- **Community**: Large community and resources

### Why FastAPI?

- **Performance**: Async support, fast execution
- **Developer experience**: Auto-generated OpenAPI docs
- **Type hints**: Pydantic validation
- **Modern**: Async/await, type hints, dependency injection
- **Python**: Easy AI/ML integration

### Why ChromaDB?

- **Simplicity**: Easy to set up and use
- **Persistence**: Data survives restarts
- **Performance**: Fast similarity search
- **Integration**: Works well with LangChain
- **Cost**: No hosting fees (self-hosted)

### Why TanStack Query?

- **Caching**: Intelligent caching out of the box
- **DevTools**: Excellent debugging tools
- **TypeScript**: First-class TS support
- **Features**: Auto-refetch, optimistic updates, infinite queries
- **Performance**: Reduces unnecessary API calls

### Why Tailwind CSS?

- **Productivity**: Fast UI development
- **Consistency**: Design system via config
- **Performance**: Purges unused CSS
- **Responsive**: Mobile-first utilities
- **Customization**: Easy to customize theme

---

## Future Enhancements

### Planned Features

1. **User Authentication**
   - User accounts and login
   - Personalized reading lists
   - Preference storage

2. **Advanced Search**
   - Saved search queries
   - Search filters (date, source, etc.)
   - Search history

3. **Notifications**
   - Email digests
   - Trending topic alerts
   - New article notifications

4. **Export Functionality**
   - PDF export
   - Markdown export
   - Share functionality

5. **Mobile App**
   - React Native
   - iOS and Android
   - Offline reading

### Technical Debt

- Add comprehensive error boundaries
- Implement proper logging strategy
- Add performance monitoring
- Improve test coverage to >90%
- Add integration tests
- Implement proper CI/CD pipeline
- Add database backups
- Implement rate limiting
- Add request caching
- Optimize bundle size

---

## Appendix

### Key Dependencies

**Frontend**:
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "@tanstack/react-query": "^5.12.0",
  "zustand": "^4.4.7",
  "axios": "^1.6.2",
  "tailwindcss": "^3.3.6",
  "lucide-react": "^0.294.0"
}
```

**Backend**:
```toml
[project.dependencies]
fastapi = "^0.104.1"
uvicorn = "^0.24.0"
sqlalchemy = "^2.0.23"
alembic = "^1.12.1"
chromadb = "^0.4.18"
langchain = "^0.0.340"
langchain-anthropic = "^0.1.0"
feedparser = "^6.0.10"
pydantic = "^2.5.2"
```

### Glossary

- **RAG**: Retrieval-Augmented Generation (combining search with LLM)
- **LLM**: Large Language Model (like Claude)
- **Vector Embedding**: Numerical representation of text for similarity search
- **Semantic Search**: Search by meaning, not keywords
- **TanStack Query**: React library for server state management (formerly React Query)
- **FastAPI**: Modern Python web framework
- **ChromaDB**: Vector database for AI applications
- **SQLAlchemy**: Python SQL toolkit and ORM
- **Pydantic**: Data validation using Python type hints
