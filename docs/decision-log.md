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