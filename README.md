# News Summary Agent

An intelligent news aggregation and analysis system that uses RAG (Retrieval-Augmented Generation) and AI agents to transform how users consume and understand news.

## Overview

The News Summary Agent combines intelligent article retrieval with AI-powered analysis to provide personalized, contextual, and multi-perspective news experiences. Rather than just aggregating news, it offers intelligent insights, comparative analysis, and context-aware summaries.

## Key Features

- **Semantic News Search**: Natural language queries to find relevant articles
- **Multi-Perspective Analysis**: Compare how different sources cover the same story
- **Personalized Briefings**: AI-generated news summaries tailored to user interests
- **Context & Background**: Historical context and connections for current events
- **RAG-Powered Intelligence**: Retrieval-augmented generation for informed responses

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

## Development Phases

### Phase 1: MVP (Weeks 1-2)
- Basic article ingestion pipeline
- Semantic search functionality
- Simple summarization agent
- CLI interface for testing

### Phase 2: Core Agent (Weeks 3-4)
- Multi-perspective analysis
- Personalized briefings
- Context and background information
- React web interface with responsive design

### Phase 3: Advanced Features (Weeks 5-8)
- Timeline creation
- Impact analysis
- Source credibility scoring
- Alert system

### Phase 4: Polish & Scale (Weeks 9-12)
- Frontend performance optimization
- Enhanced UI/UX with accessibility compliance
- Production deployment with CI/CD pipeline
- Comprehensive testing

## Getting Started

> **Note**: This project is currently in the planning phase. Implementation will begin with Phase 1 MVP development.

### Prerequisites
- Python 3.9+
- Node.js 18+
- Docker & Docker Compose
- uv (Python package management)

### Quick Start (Planned)
```bash
# Clone the repository
git clone <repository-url>
cd news-summary-agent

# Start development environment
docker-compose up -d

# Install backend dependencies
cd backend && uv venv && uv pip install -r requirements.txt

# Install frontend dependencies
cd frontend && npm install

# Start development servers
# Backend: uv run uvicorn main:app --reload
# Frontend: npm run dev
```

## Contributing

This is a personal project currently in active development. The project follows a structured development approach with clear phases and deliverables.

## License

This project is currently private and under development.

---

For detailed technical specifications and requirements, see [news_agent_prd.md](./news_agent_prd.md).