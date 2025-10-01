# Development Guide

**Last Updated**: September 27, 2025
**Purpose**: Complete setup and development workflow for News Summary Agent

## Prerequisites

### Required Software
- **Python 3.9+**: Modern Python with type hints support
- **Node.js 18+**: For React frontend development
- **Docker & Docker Compose**: Containerized development environment
- **uv**: Fast Python package management (`pip install uv`)
- **Git**: Version control

### Recommended Tools
- **VS Code**: With Python, TypeScript, and Docker extensions
- **PostgreSQL Client**: pgAdmin, DBeaver, or psql CLI
- **API Testing**: Postman, Insomnia, or VS Code REST Client

## Initial Setup

### 1. Repository Setup

```bash
# Clone repository
git clone <repository-url>
cd news-summary-agent

# Verify current structure
ls -la
# Should see: README.md, CLAUDE.md, docs/, news_agent_prd.md
```

### 2. Environment Configuration

**IMPORTANT SECURITY NOTE:** Never commit `.env` files to git. They are already in `.gitignore`.

```bash
# Copy environment template to create your local .env file
cp backend/.env.example backend/.env

# Edit backend/.env with your actual API key
# Get your API key from: https://console.anthropic.com/settings/keys
nano backend/.env  # or use your preferred editor

# Update this line in backend/.env:
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-api-key-here

# Other settings (already have good defaults):
DATABASE_URL=sqlite:///./test_newsdb.db  # Using SQLite for simplicity
CHROMA_PERSIST_DIR=./chroma_db
LOG_LEVEL=INFO
```

**Security Checklist Before Committing:**
- ✅ Verify `.env` is NOT in `git status`
- ✅ Only commit `.env.example` (with placeholders)
- ✅ Real API keys only in local `.env` file
- ❌ NEVER commit files containing `sk-ant-api03-...`

### 3. Docker Development Environment

```bash
# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps
# Should show: postgres, backend, frontend containers

# Check logs
docker-compose logs backend
docker-compose logs frontend
```

**Docker Compose Configuration** (to be created):

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: newsdb
      POSTGRES_USER: newsuser
      POSTGRES_PASSWORD: newspass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/scripts/init.sql:/docker-entrypoint-initdb.d/init.sql

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://newsuser:newspass@postgres:5432/newsdb
    volumes:
      - ./backend:/app
      - ./chroma_db:/app/chroma_db
    depends_on:
      - postgres
    command: uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_BASE_URL=http://localhost:8000
    command: npm run dev -- --host 0.0.0.0

volumes:
  postgres_data:
```

## Backend Development

### Setup Backend Environment

```bash
cd backend

# Create virtual environment
uv venv

# Install dependencies
uv pip install -r requirements.txt

# Run database migrations (after implementing Alembic)
uv run alembic upgrade head

# Start development server
uv run uvicorn src.main:app --reload

# API will be available at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

### Backend Project Structure

```
backend/
├── src/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration settings
│   ├── database.py             # Database connection
│   ├── models/
│   │   ├── __init__.py
│   │   ├── article.py          # Article SQLAlchemy model
│   │   └── user.py             # User preferences model
│   ├── services/
│   │   ├── __init__.py
│   │   ├── rss_ingestion.py    # RSS feed processing
│   │   ├── search_service.py   # Semantic search
│   │   ├── summary_service.py  # Article summarization
│   │   └── vector_store.py     # ChromaDB operations
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── base_agent.py       # Base LangChain agent
│   │   ├── search_agent.py     # Search specialist
│   │   └── summary_agent.py    # Summarization specialist
│   ├── api/
│   │   ├── __init__.py
│   │   ├── articles.py         # Article endpoints
│   │   ├── search.py           # Search endpoints
│   │   └── summaries.py        # Summary endpoints
│   └── utils/
│       ├── __init__.py
│       ├── text_processing.py  # Text utilities
│       └── validation.py       # Input validation
├── tests/
│   ├── test_services/
│   ├── test_agents/
│   └── test_api/
├── scripts/
│   ├── init.sql               # Database initialization
│   └── seed_data.py           # Sample data creation
├── requirements.txt           # Python dependencies
├── Dockerfile                # Container configuration
└── .env.example              # Environment template
```

### Key Backend Development Commands

```bash
# Development server with auto-reload
uv run uvicorn src.main:app --reload

# Run tests
uv run pytest

# Format code
uv run black src/
uv run isort src/

# Type checking
uv run mypy src/

# Database migrations
uv run alembic revision --autogenerate -m "Description"
uv run alembic upgrade head

# CLI tools (after implementation)
uv run python -m src.cli search "query"
uv run python -m src.cli ingest
```

## Frontend Development

### Setup Frontend Environment

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Application available at http://localhost:3000
```

### Frontend Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── search/            # Search-related components
│   │   ├── articles/          # Article display components
│   │   └── layout/            # Layout components
│   ├── pages/
│   │   ├── Home.tsx           # Landing page
│   │   ├── Search.tsx         # Search interface
│   │   └── Article.tsx        # Article detail view
│   ├── services/
│   │   ├── api.ts             # API client configuration
│   │   ├── articles.ts        # Article API calls
│   │   └── search.ts          # Search API calls
│   ├── hooks/
│   │   ├── useSearch.ts       # Search functionality
│   │   ├── useArticles.ts     # Article management
│   │   └── useSummary.ts      # Summarization hooks
│   ├── types/
│   │   ├── article.ts         # Article type definitions
│   │   ├── search.ts          # Search type definitions
│   │   └── api.ts             # API response types
│   ├── utils/
│   │   ├── formatters.ts      # Text/date formatting
│   │   └── validation.ts      # Form validation
│   ├── stores/
│   │   ├── searchStore.ts     # Search state (Zustand)
│   │   └── userStore.ts       # User preferences
│   ├── App.tsx                # Main application component
│   ├── main.tsx               # Application entry point
│   └── index.css              # Global styles
├── public/                    # Static assets
├── package.json               # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS config
├── tsconfig.json             # TypeScript configuration
└── .env.example              # Environment template
```

### Key Frontend Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Run tests
npm run test
```

## Database Management

### Database Access

```bash
# Connect to PostgreSQL container
docker exec -it newsagent_postgres_1 psql -U newsuser -d newsdb

# Or use connection string
psql postgresql://newsuser:newspass@localhost:5432/newsdb
```

### Common Database Operations

```sql
-- Check articles table
SELECT COUNT(*) FROM articles;
SELECT source, COUNT(*) FROM articles GROUP BY source;

-- Recent articles
SELECT title, source, published_date
FROM articles
ORDER BY published_date DESC
LIMIT 10;

-- Search by source
SELECT title, published_date
FROM articles
WHERE source = 'BBC News'
ORDER BY published_date DESC;
```

### Database Migrations

```bash
# Create new migration
uv run alembic revision --autogenerate -m "Add article metadata"

# Apply migrations
uv run alembic upgrade head

# Migration history
uv run alembic history

# Rollback
uv run alembic downgrade -1
```

## Testing Strategy

### Backend Testing

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=src

# Run specific test file
uv run pytest tests/test_services/test_search.py

# Run tests with output
uv run pytest -v -s
```

### Frontend Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Integration Testing

```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
uv run pytest tests/integration/

# API testing with Newman (if using Postman collections)
newman run postman_collection.json
```

## Code Quality Standards

### Python Code Style

```bash
# Format code
uv run black src/ tests/
uv run isort src/ tests/

# Lint code
uv run flake8 src/ tests/
uv run pylint src/

# Type checking
uv run mypy src/
```

### TypeScript Code Style

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/article-ingestion

# Make changes and commit
git add .
git commit -m "feat: implement RSS feed ingestion service"

# Update documentation
git add docs/
git commit -m "docs: update implementation progress"

# Push feature branch
git push origin feature/article-ingestion
```

## Debugging and Monitoring

### Backend Debugging

```bash
# View application logs
docker-compose logs -f backend

# Debug with breakpoints (in VS Code)
# Set breakpoints and use "Python: FastAPI" debug configuration

# Database query logging
# Set LOG_LEVEL=DEBUG in .env
```

### Frontend Debugging

```bash
# View build logs
npm run dev -- --debug

# Browser developer tools
# Network tab for API calls
# Console for JavaScript errors
# React Developer Tools extension
```

### Performance Monitoring

```bash
# Monitor PostgreSQL performance
docker exec -it newsagent_postgres_1 psql -U newsuser -d newsdb -c "
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;"

# Monitor ChromaDB performance
# Check query response times in application logs

# Monitor API response times
# Use FastAPI metrics endpoint (to be implemented)
```

## Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check what's using port 8000
lsof -i :8000

# Kill process if needed
kill -9 <PID>
```

**Database connection issues:**
```bash
# Restart PostgreSQL container
docker-compose restart postgres

# Check database logs
docker-compose logs postgres
```

**ChromaDB persistence issues:**
```bash
# Check chroma_db directory permissions
ls -la chroma_db/

# Reset ChromaDB (development only)
rm -rf chroma_db/
```

**Python dependency issues:**
```bash
# Recreate virtual environment
rm -rf .venv
uv venv
uv pip install -r requirements.txt
```

### Performance Issues

**Slow API responses:**
- Check database query performance
- Monitor ChromaDB vector search times
- Profile LLM API call latency
- Enable FastAPI middleware logging

**High memory usage:**
- Monitor ChromaDB memory usage
- Check for memory leaks in long-running processes
- Optimize embedding batch sizes

## Production Considerations

### Environment Variables

```bash
# Production environment settings
DATABASE_URL=postgresql://user:pass@prod-host:5432/newsdb
ANTHROPIC_API_KEY=prod_api_key
LOG_LEVEL=WARNING
CORS_ORIGINS=https://yourdomain.com
```

### Security Checklist

- [ ] API key management (use environment variables)
- [ ] Database connection security (SSL)
- [ ] CORS configuration for frontend
- [ ] Input validation and sanitization
- [ ] Rate limiting on API endpoints
- [ ] HTTPS enforcement

### Deployment Preparation

- [ ] Docker production builds
- [ ] Database migration scripts
- [ ] Environment configuration templates
- [ ] Health check endpoints
- [ ] Logging and monitoring setup