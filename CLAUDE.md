# Claude Code Instructions for News Summary Agent

## Project Overview
This is the News Summary Agent - an intelligent news aggregation and analysis system using RAG (Retrieval-Augmented Generation) and AI agents. The project transforms news consumption through personalized, contextual, and multi-perspective analysis.

## Critical Documentation Requirements

### 📁 docs/ Folder Maintenance
**IMPORTANT**: The `docs/` folder must be updated during each commit to ensure future sessions can understand the project context. This is essential for project continuity.

#### Required Updates on Each Commit:
1. **Update docs/project-status.md**:
   - Current development phase and progress
   - Recently completed features/tasks
   - Next planned development steps
   - Any blockers or technical challenges

2. **Update docs/decision-log.md**:
   - Log any architectural or technical decisions made
   - Include rationale, alternatives considered, and current status
   - Document any changes to the tech stack or approach

3. **Update docs/change-log.md** (create if doesn't exist):
   - Summary of changes in each commit
   - Feature additions, bug fixes, refactoring
   - Breaking changes or migration requirements

4. **Keep docs/tech-stack.md current**:
   - Update if any technology choices change
   - Add new dependencies or tools
   - Document integration patterns discovered

### Documentation Standards
- **Clarity**: Write for someone unfamiliar with the project
- **Completeness**: Include enough context for informed decisions
- **Accuracy**: Reflect the current state, not planned state
- **Actionability**: Provide concrete next steps and implementation guidance

## Tech Stack (Current)

### Backend
- **Framework**: Python + FastAPI
- **LLM**: Claude (via LangChain Anthropic integration)
- **Vector Database**: ChromaDB (persistent mode)
- **Database**: PostgreSQL
- **Orchestration**: LangChain + LangSmith

### Frontend
- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: TanStack Query

### Development
- **Containerization**: Docker + Docker Compose
- **Package Management**: Poetry (Python), npm/yarn (Frontend)
- **Database ORM**: SQLAlchemy

## Project Structure
```
news-summary-agent/
├── news_agent_prd.md          # Product Requirements Document
├── docs/                      # Project documentation (KEEP UPDATED!)
│   ├── README.md             # Documentation overview
│   ├── project-status.md     # Current status and progress
│   ├── tech-stack.md         # Technology decisions and rationale
│   ├── decision-log.md       # Important decisions made
│   └── change-log.md         # Changes and updates log
├── backend/                   # Python FastAPI backend (planned)
├── frontend/                  # React TypeScript frontend (planned)
├── docker-compose.yml         # Development environment (planned)
├── README.md                  # Project overview
└── CLAUDE.md                  # This file
```

## Development Principles

### For Implementation
- **RAG-First**: All features should leverage RAG patterns with ChromaDB
- **Type Safety**: Use TypeScript frontend, Python type hints backend
- **API-First**: Design RESTful APIs that React frontend can consume
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Testing**: Include unit tests for critical functionality

### For Documentation
- **Session Continuity**: Each session should be able to understand full context
- **Decision Tracking**: Document why choices were made, not just what was chosen
- **Progress Visibility**: Clear milestones and current development status
- **Knowledge Preservation**: Capture learnings and implementation details

## Current Phase: Planning Complete
- ✅ PRD finalized with tech stack decisions
- ✅ Repository structure established
- ✅ Documentation framework created
- ⏳ Ready to begin Phase 1 MVP implementation

## Next Session Priorities
1. Review docs/project-status.md for current state
2. Set up development environment (Docker Compose)
3. Begin Phase 1 MVP backend implementation
4. Update documentation with progress and decisions

## Commands and Workflows

### Starting a New Session
1. Read docs/project-status.md for current state
2. Review docs/decision-log.md for recent decisions
3. Check git log for recent changes
4. Update docs/ as work progresses

### Ending a Session
1. Update docs/project-status.md with current progress
2. Log any decisions made in docs/decision-log.md
3. Create/update docs/change-log.md with session summary
4. Commit all changes including documentation updates

## Integration Patterns

### RAG Implementation
- Use ChromaDB for vector storage of article embeddings
- LangChain for orchestrating retrieval and generation
- Claude for intelligent analysis and summarization
- Structure prompts for multi-perspective news analysis

### Frontend-Backend Communication
- RESTful API with OpenAPI documentation
- TanStack Query for intelligent caching and data fetching
- Zustand for client-side state management
- TypeScript interfaces shared between frontend/backend

Remember: **Always update docs/ folder with relevant session information!**