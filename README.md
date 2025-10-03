# News Summary Agent

An intelligent news aggregation and analysis system that uses RAG (Retrieval-Augmented Generation) and AI agents to transform how users consume and understand news.

## Overview

The News Summary Agent combines intelligent article retrieval with AI-powered analysis to provide personalized, contextual, and multi-perspective news experiences. Rather than just aggregating news, it offers intelligent insights, comparative analysis, and context-aware summaries.

## Key Features

- **Semantic News Search**: Natural language queries to find relevant articles using vector similarity
- **Tag-Based Organization**: Organize RSS feeds with customizable tags (Technology, Science, etc.) and filter articles by category
- **Multi-Perspective Analysis**: Compare how different sources cover the same story
- **AI-Powered Summaries**: Generate brief, comprehensive, or analytical summaries of articles
- **Customizable RSS Feeds**: Add, manage, and organize your own RSS feed sources with tag categorization
- **Smart Filtering**: Filter news by tags across Home, Browse, and Search pages
- **RAG-Powered Intelligence**: Retrieval-augmented generation for informed responses with ChromaDB vector store

## Tech Stack

### Backend
- **Framework**: Python + FastAPI
- **AI/LLM**: Claude (via LangChain Anthropic integration)
- **Vector Database**: ChromaDB (persistent mode)
- **Database**: PostgreSQL
- **Orchestration**: LangChain + LangSmith

### Frontend
- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: TanStack Query (React Query)

### Development
- **Containerization**: Docker + Docker Compose
- **Package Management**: uv (Python), npm/yarn (Frontend)
- **Database ORM**: SQLAlchemy

## Project Structure

```
news-summary-agent/
├── news_agent_prd.md          # Product Requirements Document
├── docs/                      # Project documentation
├── backend/                   # Python FastAPI backend (planned)
├── frontend/                  # React TypeScript frontend (planned)
├── docker-compose.yml         # Development environment (planned)
└── README.md                  # This file
```

## Documentation

Comprehensive project documentation is available in the `docs/` folder:

- **Architecture**: System design and component relationships
- **API Reference**: Backend API endpoints and schemas
- **Development Guide**: Setup instructions and contribution guidelines
- **RAG Implementation**: Detailed explanation of RAG patterns and workflows

## Development Status

### ✅ Phase 1: MVP - COMPLETED
- Article ingestion pipeline from 10+ RSS feeds
- Semantic search with vector similarity
- AI-powered article summarization
- ChromaDB integration with 300+ articles

### ✅ Phase 2: Core Agent - COMPLETED
- Multi-perspective analysis across sources
- React web interface with responsive design
- TanStack Query for efficient data management
- Real-time article ingestion and search

### ✅ Phase 3: Organization & Filtering - COMPLETED
- **RSS Feed Tag System**: Organize feeds with custom tags (colors, descriptions)
- **Database-Backed Feeds**: Migrated from .env to SQLite with full CRUD operations
- **Tag Management UI**: Create, edit, delete tags with visual color indicators
- **Multi-Page Filtering**: Filter articles by tags on Home, Browse, and Search pages
- **Smart Source Matching**: Flexible matching between feed names and article sources
- **Client-Side Search Filtering**: Fast tag filtering for semantic search results

### 🎯 Current Focus: Refinement & Production
- Performance optimization and monitoring
- Enhanced UI/UX improvements
- Production deployment preparation
- Comprehensive testing and documentation

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- uv (Python package management)
- **Database**: SQLite (default, no setup required) OR PostgreSQL (optional, via Docker)
- Anthropic API key for Claude (optional, only needed for AI features)

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd news-summary-agent

# Install backend dependencies
cd backend
uv sync

# Set up environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY (optional for basic functionality)

# Install frontend dependencies
cd ../frontend
npm install

# Start development servers (in separate terminals)
# Terminal 1 - Backend (run in background):
cd backend
nohup uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload > server.log 2>&1 &

# Terminal 2 - Frontend:
cd frontend
npm run dev

# To stop the backend server later:
pkill -f uvicorn
```

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Testing

The project has comprehensive test coverage for both backend and frontend.

### Backend Tests (106 tests)

Run all backend tests:
```bash
cd backend
uv run python -m pytest tests/ -v
```

Run specific test suites:
```bash
# Tags API tests (26 tests)
uv run python -m pytest tests/test_api/test_tags.py -v

# RSS Feeds API tests (29 tests)
uv run python -m pytest tests/test_api/test_rss_feeds.py -v

# Articles API tests (22 tests)
uv run python -m pytest tests/test_api/test_articles.py -v

# Database model tests (29 tests)
uv run python -m pytest tests/test_models.py -v
```

Run tests with coverage:
```bash
uv run python -m pytest tests/ --cov=src --cov-report=html
```

### Frontend Tests (87 tests)

Run all frontend tests:
```bash
cd frontend
npm test
```

Run unit tests only:
```bash
npm run test:unit
```

Run E2E tests (requires running dev server):
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run E2E tests
npm run test:e2e
```

Run tests in UI mode (interactive):
```bash
npm run test:ui
```

### Test Coverage

- **Backend**: 106 passing tests
  - API endpoints: CRUD operations, validation, pagination, filtering
  - Database models: Field validation, constraints, serialization
  - Fixtures: Isolated test database with SQLite in-memory

- **Frontend**: 87 passing tests
  - Unit tests: Components, hooks, utilities
  - E2E tests: User workflows, tag filtering, article management
  - Testing tools: Vitest, React Testing Library, Playwright

## Troubleshooting

### Quick Fixes for Common Issues

1. **"Connection refused" when accessing API**: Use the background server command above
2. **PostgreSQL connection errors**: The default SQLite configuration (in `.env.example`) works without any database setup
3. **Server starts but can't access**: Make sure you're using the `nohup` command to run the server in background
4. **Tests failing with "module not found"**: Run `uv sync` in backend or `npm install` in frontend to ensure dependencies are installed

## Contributing

This is a personal project currently in active development. The project follows a structured development approach with clear phases and deliverables.

## License

This project is currently private and under development.

---

For detailed technical specifications and requirements, see [news_agent_prd.md](./news_agent_prd.md).