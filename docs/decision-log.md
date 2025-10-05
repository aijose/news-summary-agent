# Decision Log

**Purpose**: Track important architectural and technical decisions made during development.

## Decision Format
- **Date**: When the decision was made
- **Decision**: What was decided
- **Context**: Why the decision was needed
- **Rationale**: Reasoning behind the choice
- **Alternatives**: Other options considered
- **Status**: Current status of the decision

---

## 2025-10-04: Three-Tier AI Summary System

**Decision**: Implement three distinct summary types with specialized prompts
**Context**: Users have different information needs - some want quick facts, others need deep analysis
**Rationale**:
- **Brief (100-150 words)**: For users scanning headlines, time-constrained reading
- **Comprehensive (250-400 words)**: Balanced approach with context and significance
- **Analytical (300-500 words)**: For in-depth understanding with implications and outlook
- **Distinct prompts**: Each type has specific requirements ensuring meaningful differentiation
- **User choice**: Empowers users to match summary depth to their current needs

**Implementation Details**:
- Conditional prompt templates in `langchain_agent.py`
- Summary type dropdown on all ArticleCard components
- Structured output formats:
  - Brief: Paragraph + bullet points
  - Comprehensive: Main points + context + details + significance
  - Analytical: Executive summary + findings + analysis + outlook + questions

**Alternatives Considered**:
- Single summary with length parameter: Rejected - wouldn't change structure/depth
- Fixed length summaries: Rejected - doesn't address different use cases
- Auto-detect from context: Rejected - users know their needs better than algorithm

**Status**: ✅ Implemented and deployed

---

## 2025-10-04: On-Demand Trending Insights

**Decision**: Make trending insights on-demand rather than auto-load
**Context**: Trending analysis uses significant API calls and users may not always need it
**Rationale**:
- **Performance**: Saves API calls and page load time
- **User control**: Users explicitly request analysis when interested
- **Sample articles**: Include 5 sample trending articles for context
- **Time periods**: Flexible analysis windows (24h, 48h, Week)
- **Caching**: 5-minute cache reduces repeated API calls

**Implementation Details**:
- `enabled: false` in React Query config prevents auto-fetch
- "Show Trending Insights" button in Latest News section
- Sample articles fetched from trending API's article_ids
- Clickable article cards navigate to full article detail

**Alternatives Considered**:
- Auto-load on every page visit: Rejected - unnecessary API usage
- Widget on sidebar: Rejected - takes valuable screen space
- Scheduled updates: Rejected - complexity not worth it for MVP

**Status**: ✅ Implemented and deployed

---

## 2025-10-04: Article Content Formatting Enhancement

**Decision**: Parse and format article content with proper paragraph breaks
**Context**: Articles and summaries appeared as walls of text, reducing readability
**Rationale**:
- **Paragraph breaks**: Split content on double newlines (`\n\n`)
- **Line breaks**: Preserve single newlines within paragraphs
- **Typography**: Larger text, better spacing, improved hierarchy
- **Visual consistency**: Primary color scheme throughout

**Implementation Details**:
- Article content: `content.split('\n\n').map(paragraph => <p>)`
- Summary formatting: Handle both `\n\n` (paragraphs) and `\n` (lines)
- Enhanced styling: text-4xl titles, text-lg content, space-y-4 paragraphs
- Color updates: gray → neutral, blue → primary

**Alternatives Considered**:
- Markdown rendering: Rejected - content isn't markdown formatted
- HTML content: Rejected - security concerns with dangerouslySetInnerHTML
- Rich text editor: Rejected - overkill for display-only content

**Status**: ✅ Implemented and deployed

---

## 2025-10-03: RSS Feed Tag System Architecture

**Decision**: Implement tag-based feed organization with database-backed storage
**Context**: Users need to organize and filter RSS feeds by category (Technology, Science, etc.)
**Rationale**:
- **Database-backed tags**: Allows dynamic tag creation without code changes
- **Many-to-many relationships**: Feeds can have multiple tags, tags can belong to multiple feeds
- **Color coding**: Visual differentiation improves UX and quick identification
- **Flexible filtering**: Tag-based filtering works across all article viewing pages
- **Migration from .env**: Moving RSS feeds to database enables full CRUD operations

**Implementation Details**:
- Tag model: name, description, color (hex code), timestamps
- RSSFeed model: name, url, description, is_active, timestamps
- Association table: rss_feed_tags with cascade delete for data integrity
- Client-side search filtering: Preserves vector search performance while allowing categorization

**Alternatives Considered**:
- Hardcoded categories (too inflexible)
- Tag strings in metadata (no relational queries)
- Separate microservice (overengineered)
- Server-side search filtering (would require vector store changes)

**Status**: ✅ Implemented

---

## 2025-10-03: Tag Filtering Strategy

**Decision**: Use server-side filtering for article listing, client-side for search results
**Context**: Different pages have different data retrieval patterns
**Rationale**:
- **Article listing** (Home/Browse): Backend filtering via query parameters is efficient and scalable
- **Semantic search**: Client-side filtering preserves vector search ranking and avoids backend complexity
- **Performance**: useMemo caching ensures client-side filtering is fast
- **Consistency**: Same TagFilter component works across all pages

**Implementation**:
- Backend: `/api/v1/articles/?tags=1,2` filters by tag IDs with flexible source matching
- Frontend: useMemo filters search results after vector similarity search completes
- Smart matching: Handles source name variations ("Science Daily" vs "ScienceDaily")

**Alternatives Considered**:
- All server-side (would require modifying vector search logic)
- All client-side (inefficient for large article lists)
- Separate endpoints (code duplication)

**Status**: ✅ Implemented

---

## 2025-09-27: Frontend Framework Selection

**Decision**: Use React + TypeScript instead of Streamlit
**Context**: Need for user interface that can scale beyond simple prototyping
**Rationale**:
- Streamlit too limited for custom UI components and professional design
- React provides flexibility for complex news analysis interfaces
- TypeScript adds type safety and better development experience
- Rich ecosystem for data visualization and responsive design

**Alternatives Considered**:
- Streamlit (too limited)
- Gradio (similar limitations to Streamlit)
- Vue.js (less mature ecosystem for our use case)

**Status**: ✅ Implemented

---

## 2025-09-27: Database Strategy

**Decision**: Start with PostgreSQL instead of SQLite migration path
**Context**: Need for production-ready database with concurrent access
**Rationale**:
- Avoid migration complexity from SQLite to PostgreSQL
- Better concurrent user support for future scaling
- JSON field support for flexible article metadata
- pgvector integration potential for hybrid search

**Alternatives Considered**:
- SQLite → PostgreSQL migration (adds complexity)
- NoSQL databases like MongoDB (less structured query needs)

**Status**: ✅ Implemented

---

## 2025-09-27: LLM Provider Selection

**Decision**: Use Claude via LangChain Anthropic integration
**Context**: Need reliable, high-quality LLM for news analysis and summarization
**Rationale**:
- Excellent reasoning capabilities for multi-perspective analysis
- Large context window for processing multiple articles
- Good cost-performance ratio for personal project
- Strong integration with LangChain ecosystem

**Alternatives Considered**:
- OpenAI GPT-4 (higher costs, similar capabilities)
- Local models (complex setup, hardware requirements)
- Cohere (less mature ecosystem)

**Status**: ✅ Implemented

---

## 2025-09-27: Vector Database Choice

**Decision**: ChromaDB in persistent mode
**Context**: Need vector storage for RAG patterns with article embeddings
**Rationale**:
- Simple setup and maintenance for personal project
- Excellent LangChain integration out of the box
- Persistent mode provides data durability
- No ongoing hosting costs like cloud solutions

**Alternatives Considered**:
- Pinecone (ongoing hosting costs)
- Qdrant (more complex setup)
- Weaviate (overkill for current requirements)

**Status**: ✅ Implemented

---

## 2025-09-27: Build Tool Selection

**Decision**: Use Vite instead of Create React App
**Context**: Need fast development server and optimized production builds
**Rationale**:
- Significantly faster development server with HMR
- Better build performance and smaller bundles
- Modern ES modules support
- More active development than CRA

**Alternatives Considered**:
- Create React App (slower, less actively maintained)
- Webpack (more complex configuration)
- Parcel (less ecosystem support)

**Status**: ✅ Implemented

---

## 2025-09-27: State Management Approach

**Decision**: Zustand for client state, TanStack Query for server state
**Context**: Need simple state management without Redux complexity
**Rationale**:
- Zustand: Minimal boilerplate, TypeScript-first, perfect for simple apps
- TanStack Query: Excellent caching, background updates, perfect for REST APIs
- Separation of concerns between client and server state

**Alternatives Considered**:
- Redux Toolkit (too complex for current needs)
- Context API only (no caching, complex for server state)
- Jotai (similar to Zustand but prefer Zustand's approach)

**Status**: ✅ Implemented

---

## 2025-09-27: Python Package Management Tool

**Decision**: Use uv instead of Poetry for Python package management
**Context**: Need for fast, modern Python dependency management and virtual environment handling
**Rationale**:
- Significantly faster installation and dependency resolution (10-100x faster than pip/Poetry)
- Built with Rust for performance and reliability
- Drop-in replacement for pip with better dependency resolution
- Built-in virtual environment management
- Single tool for multiple package management tasks
- Modern tool designed for current Python ecosystem

**Alternatives Considered**:
- Poetry (slower, more complex for simple projects)
- pip + venv (manual virtual environment management)
- pipenv (less actively maintained, slower)

**Status**: ✅ Implemented

---

## 2025-09-30: Frontend State Management with TanStack Query

**Decision**: Use TanStack Query (React Query) for server state instead of custom hooks with useState
**Context**: Need efficient data fetching, caching, and synchronization between frontend and backend
**Rationale**:
- Automatic caching reduces unnecessary API calls and improves performance
- Built-in loading/error states simplify component logic
- Background refetching keeps data fresh without manual refresh triggers
- Query invalidation automatically updates related data across components
- Mutations handle optimistic updates and cache synchronization
- Superior developer experience with TypeScript integration

**Alternatives Considered**:
- Custom hooks with useState/useEffect (manual cache management, more boilerplate)
- SWR (similar but less feature-rich than TanStack Query)
- Redux + RTK Query (unnecessary complexity for current app size)

**Implementation Details**:
- Created `useArticlesQuery.ts` with comprehensive query hooks
- Created `useSearchQuery.ts` for search operations
- Configured intelligent stale times (2-15 minutes based on data volatility)
- Implemented automatic cache invalidation on mutations
- Updated all components (Home, Search, Admin) to use new hooks

**Status**: ✅ Implemented

---

## 2025-09-30: Phase 3 Feature Descoping

**Decision**: Remove Phase 3 advanced features (timelines, impact analysis, credibility scoring, alerts)
**Context**: Project scope assessment after completing Phase 2 core functionality
**Rationale**:
- Core features (search, summarization, multi-perspective analysis) provide sufficient value
- Advanced features add complexity without proportional benefit for personal use case
- Focus resources on production readiness, testing, and deployment instead
- Simpler scope enables faster iteration and maintenance

**Features Removed**:
- Timeline creation and event tracking
- Impact analysis engine
- Source credibility scoring system
- Proactive alert system

**New Focus Areas**:
- Performance optimization and bundle size reduction
- Comprehensive testing coverage
- Production deployment and CI/CD pipeline
- Enhanced documentation and user guides

**Status**: ✅ Implemented

---

## 2025-10-02: Database Setup Strategy Revision

**Decision**: Use SQLite as default for development, PostgreSQL as optional for production
**Context**: Fresh repository setup revealed unnecessary complexity with PostgreSQL requirement
**Rationale**:
- SQLite provides zero-setup experience for developers on new machines
- No dependency on Docker/containers for basic development
- Reduces onboarding friction and setup documentation complexity  
- PostgreSQL can be optionally enabled via Docker Compose when needed
- Most development work doesn't require PostgreSQL-specific features

**Key Findings**:
- The `.env.example` already included working SQLite configuration
- Server starts immediately with SQLite, no external dependencies
- PostgreSQL connection errors were the primary setup roadblock
- Development database needs are fully met by SQLite

**Implementation Changes**:
- Updated documentation to recommend SQLite first
- PostgreSQL positioned as optional production enhancement
- Setup instructions prioritize working configuration over "ideal" configuration

**Alternatives Considered**:
- Keep PostgreSQL as requirement (creates unnecessary setup complexity)
- Use in-memory database (loses data between restarts)

**Status**: ✅ Implemented

---

## 2025-10-02: Server Process Management Fix

**Decision**: Use background processes (nohup) for uvicorn development server
**Context**: Server startup appeared successful but API was inaccessible during testing
**Rationale**:
- Interactive terminal commands with timeouts terminate the server process
- Background processes remain accessible for API testing and development
- Prevents confusion between "server started" logs and actual accessibility
- Provides consistent development experience across different terminal environments

**Root Cause Discovery**:
- `uv run uvicorn` started successfully but was killed on command timeout
- Server logs showed successful startup in both cases
- Only background mode (`nohup ... &`) remained accessible for API calls

**Implementation Fix**:
```bash
# OLD (problematic)
uv run uvicorn src.main:app --reload --port 8000

# NEW (reliable)  
nohup uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload > server.log 2>&1 &
```

**Status**: ✅ Implemented

---

## Future Considerations

### Potential Enhancements (If Needed)
- Browser extension for quick news lookup
- Mobile-responsive improvements
- Export functionality (PDF, markdown)
- Saved searches and article collections

### Decision Criteria for Future Choices
1. **Simplicity**: Favor simple solutions for personal project scope
2. **Cost Effectiveness**: Minimize ongoing operational costs
3. **Value-to-Effort Ratio**: High impact features with low implementation cost
4. **Maintainability**: Choose technologies with good documentation and community support