# Technology Stack

**Last Updated**: September 27, 2025
**Status**: Finalized after brainstorming session

## Overview

The News Summary Agent uses a modern, scalable tech stack optimized for AI-powered applications with a focus on RAG (Retrieval-Augmented Generation) patterns.

## Backend Stack

### Core Framework
- **FastAPI**: High-performance, modern Python web framework
  - Automatic OpenAPI documentation
  - Type safety with Pydantic
  - Async support for concurrent requests
  - Excellent integration with AI/ML libraries

### AI & Language Models
- **Claude**: Primary LLM via Anthropic API
  - High-quality text generation and analysis
  - Strong reasoning capabilities for news analysis
  - Good cost-performance ratio for personal projects
- **LangChain**: AI application framework
  - Pre-built RAG patterns and chains
  - Integration with ChromaDB and Anthropic
  - Agent orchestration and tool management
- **LangSmith**: Observability and monitoring
  - LLM call tracking and debugging
  - Performance monitoring and optimization

### Data Storage
- **PostgreSQL**: Primary database
  - Robust ACID compliance
  - JSON field support for flexible article metadata
  - Future pgvector integration for hybrid search
  - Better concurrency than SQLite
- **ChromaDB**: Vector database
  - Persistent mode for data durability
  - Built-in embedding generation
  - Excellent LangChain integration
  - Simple setup and maintenance

### Development Tools
- **uv**: Modern Python package management
  - Extremely fast installation and dependency resolution
  - Built-in virtual environment management
  - Drop-in replacement for pip and pip-tools
  - Better performance than Poetry and pip
- **SQLAlchemy**: Database ORM
  - Type-safe database interactions
  - Migration management with Alembic
  - Async support for FastAPI integration

## Frontend Stack

### Core Framework
- **React 18**: Modern JavaScript library
  - Mature ecosystem and community
  - Excellent TypeScript integration
  - Rich component libraries available
- **TypeScript**: Type safety for JavaScript
  - Better development experience
  - Compile-time error catching
  - Excellent IDE support

### Build & Development
- **Vite**: Next-generation build tool
  - Fast development server with HMR
  - Optimized production builds
  - Modern ES modules support
  - Better performance than Create React App

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
  - Rapid UI development
  - Consistent design system
  - Responsive design utilities
  - Small production bundle size

### State & Data Management
- **Zustand**: Lightweight state management
  - Simple API, minimal boilerplate
  - TypeScript-first design
  - Better than Redux for simple apps
- **TanStack Query (React Query)**: Data fetching
  - Intelligent caching and synchronization
  - Background updates and optimistic updates
  - Excellent developer experience
  - Perfect for REST API integration

## Development Environment

### Containerization
- **Docker**: Application containerization
  - Consistent development environment
  - Production parity
  - Easy dependency management
- **Docker Compose**: Multi-service orchestration
  - PostgreSQL database container
  - Redis for caching (future)
  - Simplified development workflow

### Package Management
- **uv** (Python): Modern, fast dependency management and virtual environments
- **npm/yarn** (Frontend): Node.js package management

## Architecture Decisions

### Why React over Streamlit?
- **Flexibility**: Custom UI components and interactions
- **Professional UI**: Modern, responsive design capabilities
- **Scalability**: Can grow from personal project to larger application
- **Ecosystem**: Rich component libraries and tooling

### Why PostgreSQL from Start?
- **No Migration Complexity**: Avoid SQLite → PostgreSQL migration
- **Concurrent Access**: Better multi-user support
- **JSON Support**: Flexible article metadata storage
- **Future-Proofing**: pgvector for hybrid search capabilities

### Why ChromaDB over Alternatives?
- **Simplicity**: Easy setup and maintenance for personal project
- **LangChain Integration**: Excellent built-in support
- **Persistent Mode**: Data durability without complex setup
- **Cost-Effective**: No hosting costs like Pinecone

### Why Claude over OpenAI?
- **Quality**: Excellent reasoning for news analysis tasks
- **Context Window**: Large context for multi-article analysis
- **Safety**: Built-in safety features for content analysis
- **API Stability**: Reliable service with good rate limits

### Why uv over Poetry?
- **Performance**: 10-100x faster than pip and Poetry for installations
- **Simplicity**: Single tool for package management and virtual environments
- **Modern**: Built with Rust, designed for speed and reliability
- **Compatibility**: Drop-in replacement for pip with better dependency resolution

## Alternative Considerations

### Evaluated but Not Selected

**Frontend Alternatives:**
- **Streamlit**: Too limited for custom UI requirements
- **Gradio**: Similar limitations to Streamlit
- **Vue.js**: React ecosystem more mature for this use case

**Backend Alternatives:**
- **Django**: Too heavy for API-focused application
- **Flask**: Less modern than FastAPI, weaker typing
- **Node.js**: Team more familiar with Python AI ecosystem

**Vector Database Alternatives:**
- **Pinecone**: Hosted service with ongoing costs
- **Qdrant**: More complex setup for personal project
- **Weaviate**: Overkill for current requirements

**LLM Alternatives:**
- **OpenAI GPT-4**: More expensive, similar capabilities
- **Local Models**: Complex setup, hardware requirements
- **Cohere**: Less mature ecosystem integration

## Future Considerations

### Potential Upgrades
- **Vector Database**: ChromaDB → Qdrant if scaling needs arise
- **Caching**: Redis for session and query caching
- **Monitoring**: Custom dashboards beyond LangSmith
- **CDN**: Frontend asset optimization for production

### Scaling Considerations
- **Database**: PostgreSQL clustering for high availability
- **API**: Load balancing and horizontal scaling
- **Vector Search**: Distributed vector database if needed
- **Caching**: Multi-layer caching strategy

## Development Tooling

### Code Quality
- **Black**: Python code formatting
- **Pylint/Flake8**: Python linting
- **Prettier**: Frontend code formatting
- **ESLint**: TypeScript/React linting

### Testing
- **pytest**: Python backend testing
- **Vitest**: Frontend unit testing
- **Playwright**: End-to-end testing (future)

### CI/CD (Future)
- **GitHub Actions**: Automated testing and deployment
- **Docker**: Containerized deployment
- **Environment Management**: Development, staging, production