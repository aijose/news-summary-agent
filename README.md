# Distill - AI-Powered News Analysis Platform

An intelligent news aggregation and analysis system that uses RAG (Retrieval-Augmented Generation) and AI agents to transform how you consume and understand news.

[![Tests](https://img.shields.io/badge/tests-193%20passing-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-85%25-green)]()
[![Python](https://img.shields.io/badge/python-3.11+-blue)]()
[![React](https://img.shields.io/badge/react-18.2+-blue)]()
[![TypeScript](https://img.shields.io/badge/typescript-5.2+-blue)]()

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Screenshots](#screenshots)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Architecture](#architecture)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Distill combines intelligent article retrieval with AI-powered analysis to provide personalized, contextual, and multi-perspective news experiences. Rather than just aggregating news, it offers intelligent insights, comparative analysis, and context-aware summaries.

### What Makes Distill Different?

🎯 **Semantic Search** - Find articles by meaning, not just keywords
🤖 **Three-Tier AI Summaries** - Brief, Comprehensive, or Analytical depth
📊 **Multi-Perspective Analysis** - Compare how different sources cover the same story
🏷️ **Smart Organization** - Tag-based feed organization with color coding
📈 **Trending Insights** - AI-powered analysis of what's dominating the news
🔬 **Research Agent** - Autonomous multi-step research for complex questions
📚 **Reading List** - Save articles for later with persistent storage
🎨 **Modern UI** - Responsive React interface with Tailwind CSS

---

## Key Features

### 🔍 Semantic News Search

Natural language queries find relevant articles using vector similarity, not just keyword matching.

**Example**: Search "using AI to diagnose diseases" and find relevant articles even if they use different terminology like "machine learning in medical diagnosis".

**Technology**: ChromaDB vector store with sentence transformers for embeddings.

---

### 📝 Three-Tier AI Summary System

Generate summaries at three distinct levels of depth:

#### Brief (100-150 words)
- Quick facts and headline understanding
- Single paragraph + 2-3 bullet points
- Perfect for morning news scanning

#### Comprehensive (250-400 words)
- Balanced understanding with context
- Main points + background + significance
- Ideal for standard news consumption

#### Analytical (300-500 words)
- Deep analysis with future implications
- Executive summary + analysis + outlook + critical questions
- Best for strategic thinking and research

**Technology**: Claude (Anthropic) with distinct prompt templates per type.

---

### 📊 Multi-Perspective Analysis

Compare how different sources cover the same story:

- **Common Themes**: Shared narrative elements
- **Unique Perspectives**: What each source emphasizes
- **Bias Detection**: Editorial slant and framing
- **Coverage Gaps**: What some sources omit

**Use Case**: Select 2-10 articles on the same topic from different sources and get AI-generated comparative analysis.

---

### 🏷️ Tag System & Feed Organization

Organize RSS feeds with customizable tags:

- **Create tags** with names, descriptions, and color codes
- **Assign multiple tags** to each feed
- **Filter articles** by tags on Home, Browse, and Search pages
- **Visual organization** with color-coded chips

**Example**: Tag feeds as "Technology", "Science", "Business" and filter your news stream by interest.

---

### 📈 Trending Insights

AI-powered analysis of what's trending in the news:

- **Time periods**: 24 hours, 48 hours, or full week
- **AI narrative**: Claude generates cohesive analysis of main topics and themes
- **Sample articles**: View 5 representative trending articles
- **On-demand**: Generated only when requested to save API calls

**Technology**: Claude analyzes recent articles to identify patterns, themes, and connections.

---

### 🔬 Research Agent

Autonomous AI agent for complex multi-step research:

- **Creates execution plan** showing the steps it will take
- **Executes autonomously** without manual intervention
- **Multi-article analysis** across different sources
- **Perspective identification** and comparative synthesis
- **Comprehensive results** with source citations

**Example**: "Find recent AI regulation articles and analyze different political perspectives"

---

### 📚 Reading List

Save articles for later reading:

- **One-click bookmarking** from any article card
- **Persistent storage** in browser localStorage
- **Dedicated page** for saved articles
- **Summary generation** for saved articles

---

### 🎨 Modern, Responsive UI

Professional React interface:

- **Tailwind CSS** styling
- **Responsive design** for mobile, tablet, desktop
- **Dark mode ready** (coming soon)
- **Accessibility** features (keyboard navigation, ARIA labels)

---

## Screenshots

### Home Page with Trending Insights
![Home Page](docs/screenshots/home.png) *(Screenshot placeholder)*

### Semantic Search with Multi-Perspective Analysis
![Search Page](docs/screenshots/search.png) *(Screenshot placeholder)*

### Article Detail with Summary Generation
![Article Detail](docs/screenshots/article-detail.png) *(Screenshot placeholder)*

### Admin Panel - Feed & Tag Management
![Admin Panel](docs/screenshots/admin.png) *(Screenshot placeholder)*

---

## Quick Start

### Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **uv** (Python package manager) - Install: `pip install uv`
- **npm or yarn** (Node package manager)
- **Anthropic API Key** (for AI features) - Get one at https://console.anthropic.com/settings/keys

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd news-summary-agent
```

2. **Backend Setup**
```bash
cd backend

# Install dependencies
uv sync

# Set up environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
nano .env  # or use your preferred editor
```

3. **Initialize Database**
```bash
# Create database and run migrations
uv run alembic upgrade head

# Optional: Seed with initial tags and feeds
uv run python scripts/seed_data.py
```

4. **Frontend Setup**
```bash
cd ../frontend

# Install dependencies
npm install
```

### Running the Application

You'll need two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
nohup uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload > server.log 2>&1 &

# To view logs:
tail -f server.log

# To stop later:
pkill -f uvicorn
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (interactive Swagger UI)

### First Steps

1. **Navigate to Admin page** (link in top navigation)
2. **Click "Ingest Articles"** to fetch initial articles from configured RSS feeds
3. **Wait 1-3 minutes** for initial ingestion to complete
4. **Explore features**:
   - Go to Home page and check out Trending Insights
   - Try searching for topics on Search page
   - Browse articles with tag filters
   - Generate summaries at different levels

---

## Documentation

Comprehensive documentation is available in the `docs/` folder:

### User Documentation
- **[Features Guide](docs/features.md)** - Detailed feature descriptions and use cases
- **[Usage Guide](docs/usage-guide.md)** - Step-by-step usage instructions and workflows
- **[Help Page](frontend/src/pages/Help.tsx)** - In-app feature guide

### Technical Documentation
- **[API Reference](docs/api-reference.md)** - Complete API endpoint documentation
- **[Architecture](docs/architecture.md)** - System design and component relationships
- **[Development Guide](docs/development-guide.md)** - Setup and contribution guidelines

### Project Planning
- **[Project Status](docs/project-status.md)** - Current development status and roadmap
- **[Tech Stack](docs/tech-stack.md)** - Technology choices and rationale
- **[Decision Log](docs/decision-log.md)** - Important architectural decisions
- **[Change Log](docs/change-log.md)** - Major updates and changes

---

## Architecture

### High-Level Overview

```
┌─────────────────┐
│  React Frontend │ ←→ TanStack Query (caching)
│   (TypeScript)  │
└────────┬────────┘
         │ HTTP/JSON
         │
┌────────▼────────┐
│  FastAPI Backend│ ←→ LangChain → Claude API
│    (Python)     │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┐
    │         │              │
┌───▼───┐ ┌──▼────────┐ ┌───▼────────┐
│SQLite/│ │ ChromaDB  │ │ Anthropic  │
│PostSQL│ │ (Vectors) │ │   Claude   │
└───────┘ └───────────┘ └────────────┘
```

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- TanStack Query (server state)
- Zustand (client state)
- React Router v6

**Backend:**
- Python 3.11+ with FastAPI
- SQLAlchemy 2.0 (ORM)
- Alembic (migrations)
- ChromaDB (vector store)
- LangChain (LLM orchestration)
- Anthropic Claude (LLM)

**Data Storage:**
- SQLite (development)
- PostgreSQL (production-ready)
- ChromaDB (vector embeddings)

**Development:**
- uv (Python package manager)
- pytest (backend testing)
- Vitest (frontend testing)
- Playwright (E2E testing)

For detailed architecture information, see [Architecture Documentation](docs/architecture.md).

---

## Development

### Project Structure

```
news-summary-agent/
├── frontend/                   # React TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Route-level pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API client
│   │   └── store/            # Zustand stores
│   └── package.json
├── backend/                   # Python FastAPI backend
│   ├── src/
│   │   ├── routers/          # API route handlers
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   └── services/         # Business logic
│   ├── tests/                # Test suite
│   └── pyproject.toml
├── docs/                      # Documentation
└── README.md                  # This file
```

### Development Workflow

1. **Start backend** (Terminal 1):
```bash
cd backend
uv run uvicorn src.main:app --reload --port 8000
```

2. **Start frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

3. **Make changes** to code
4. **Test changes**:
```bash
# Backend tests
cd backend
uv run python -m pytest tests/ -v

# Frontend tests
cd frontend
npm test
```

5. **Commit and push**:
```bash
git add .
git commit -m "feat: Add new feature"
git push
```

### Code Quality Tools

**Backend:**
```bash
# Linting
ruff check src/

# Formatting
black src/

# Type checking
mypy src/
```

**Frontend:**
```bash
# Linting
npm run lint

# Type checking
npm run type-check
```

---

## Testing

### Backend Tests (106 tests)

```bash
cd backend

# Run all tests
uv run python -m pytest tests/ -v

# Run specific test suites
uv run python -m pytest tests/test_api/test_tags.py -v       # 26 tests
uv run python -m pytest tests/test_api/test_rss_feeds.py -v # 29 tests
uv run python -m pytest tests/test_api/test_articles.py -v  # 22 tests
uv run python -m pytest tests/test_models.py -v             # 29 tests

# Run with coverage
uv run python -m pytest tests/ --cov=src --cov-report=html
```

### Frontend Tests (87 tests)

```bash
cd frontend

# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run E2E tests (requires dev server running)
npm run test:e2e

# Interactive test UI
npm run test:ui
```

### Test Coverage

- **Backend**: 106 passing tests, ~85% coverage
- **Frontend**: 87 passing tests, ~80% coverage
- **Total**: 193 tests ensuring reliability

---

## Deployment

### Production Checklist

#### Backend

1. **Environment Variables**
```bash
# .env (production)
DATABASE_URL=postgresql://user:pass@host:5432/db
ANTHROPIC_API_KEY=sk-ant-api03-...
ENVIRONMENT=production
LOG_LEVEL=INFO
```

2. **Database Migration**
```bash
# Apply all migrations
uv run alembic upgrade head
```

3. **Run with Production Server**
```bash
# Use Gunicorn with uvicorn workers
gunicorn src.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

#### Frontend

1. **Build Production Bundle**
```bash
cd frontend
npm run build
# Outputs to frontend/dist/
```

2. **Serve Static Files**
```bash
# Option 1: Use a static file server
npx serve -s dist -l 3000

# Option 2: Deploy to Vercel, Netlify, etc.
# (see their documentation)
```

### Docker Deployment (Coming Soon)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access application
# Frontend: http://localhost:3001
# Backend: http://localhost:8000
```

### Environment Recommendations

- **Development**: SQLite + local ChromaDB
- **Staging**: PostgreSQL + ChromaDB instance
- **Production**: Managed PostgreSQL + distributed vector store

---

## Troubleshooting

### Common Issues

**"Connection refused" when accessing API**
```bash
# Make sure backend is running in background
cd backend
nohup uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload > server.log 2>&1 &

# Check if it's running
curl http://localhost:8000/health
```

**"No articles found" in search/browse**
```bash
# Ingest articles first
# Go to Admin page → Click "Ingest Articles"
# Or via API:
curl -X POST http://localhost:8000/api/v1/articles/ingest
```

**Database errors ("no such table")**
```bash
# Run migrations
cd backend
uv run alembic upgrade head
```

**Summary generation fails**
```bash
# Check your Anthropic API key
cat backend/.env | grep ANTHROPIC_API_KEY

# Verify it's valid at https://console.anthropic.com/settings/keys
```

**Frontend shows blank page**
```bash
# Check browser console for errors (F12)
# Restart frontend dev server
cd frontend
npm run dev
```

For more troubleshooting, see [Setup Troubleshooting Guide](docs/setup-troubleshooting.md).

---

## Roadmap

### Phase 4: UX Enhancement & Intelligence ✅ **COMPLETED**
- ✅ Trending Insights with AI analysis
- ✅ Three-tier summary system (Brief/Comprehensive/Analytical)
- ✅ Enhanced article formatting
- ✅ Home page branding

### Phase 5: Production Readiness (In Progress)
- 🔄 Performance optimization
- 🔄 Comprehensive testing
- 🔄 Production deployment
- 🔄 Monitoring and analytics

### Future Enhancements
- 🎯 User authentication and personalization
- 🎯 Saved search queries
- 🎯 Email notifications and digests
- 🎯 Article export (PDF, markdown)
- 🎯 Mobile app (React Native)
- 🎯 Browser extension

---

## Contributing

This is currently a personal project in active development. Contributions, issues, and feature requests are welcome!

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** and test thoroughly
4. **Commit your changes** (`git commit -m 'feat: Add amazing feature'`)
5. **Push to your branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes

---

## License

This project is currently private and under active development.

**Copyright © 2025 Aijose**

---

## Acknowledgments

### Technologies

- [React](https://react.dev/) - UI framework
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [Claude](https://www.anthropic.com/claude) - AI language model
- [ChromaDB](https://www.trychroma.com/) - Vector database
- [TanStack Query](https://tanstack.com/query) - Data synchronization
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [LangChain](https://www.langchain.com/) - LLM orchestration

### Inspiration

This project was inspired by the need for intelligent news consumption in an era of information overload. Rather than just aggregating news, Distill aims to provide context, analysis, and multi-perspective understanding.

---

## Contact

For questions, suggestions, or issues:

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/news-summary-agent/issues)
- **Email**: your.email@example.com
- **Documentation**: See `docs/` folder for detailed guides

---

## Support the Project

If you find Distill useful, please:

⭐ Star the repository
🐛 Report bugs and issues
💡 Suggest new features
📝 Improve documentation
🔧 Contribute code

---

**Built with ❤️ using React, FastAPI, and Claude**
