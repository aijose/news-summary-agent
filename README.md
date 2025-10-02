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

## Troubleshooting

### Quick Fixes for Common Issues

1. **"Connection refused" when accessing API**: Use the background server command above
2. **PostgreSQL connection errors**: The default SQLite configuration (in `.env.example`) works without any database setup
3. **Server starts but can't access**: Make sure you're using the `nohup` command to run the server in background

For detailed troubleshooting, see [backend/README.md](./backend/README.md#troubleshooting).

## Contributing

This is a personal project currently in active development. The project follows a structured development approach with clear phases and deliverables.

## License

This project is currently private and under development.

---

For detailed technical specifications and requirements, see [news_agent_prd.md](./news_agent_prd.md).