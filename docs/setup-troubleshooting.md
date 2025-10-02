# Setup Troubleshooting Guide

## Date: 2025-10-02
## Context: Fresh repository clone setup debugging

This document captures critical setup findings from debugging a fresh clone of the news-summary-agent repository.

## Key Discoveries

### 1. SQLite vs PostgreSQL Configuration

**Issue**: The project was initially configured to use PostgreSQL by default, but this creates unnecessary complexity for development.

**Finding**: The `.env.example` file already includes SQLite configuration that works out of the box:
```bash
DATABASE_URL=sqlite:///./test_newsdb.db
```

**Solution**: SQLite is now documented as the default/recommended option for development, with PostgreSQL as optional for production.

### 2. Server Startup Process Management

**Issue**: Server appeared to start successfully but was inaccessible via curl/browser.

**Root Cause**: When running `uv run uvicorn` in interactive terminal sessions, the process gets terminated when command timeouts occur, even though startup logs show success.

**Critical Fix**: Always run the server in background mode for development:
```bash
# CORRECT - runs in background
nohup uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload > server.log 2>&1 &

# PROBLEMATIC - gets terminated on timeout
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

**Verification**: 
- Server logs showed successful startup in both cases
- Only background mode remained accessible for API calls
- Process management tools confirmed the difference

### 3. API Key Requirements

**Finding**: The Anthropic API key is NOT required for server startup or basic functionality.

**Implication**: Developers can get the server running and test basic endpoints without needing to obtain API keys first. AI features will require the key when actually invoked.

### 4. Python Version Requirements

**Current Requirement**: Python 3.11+ (as specified in pyproject.toml)
**Reason**: Modern dependency requirements (FastAPI, LangChain, etc.)
**Testing**: Confirmed working with Python 3.12.3

## Updated Setup Sequence

Based on these findings, the correct setup sequence for a fresh clone is:

```bash
# 1. Clone and navigate
git clone <repo-url>
cd news-summary-agent/backend

# 2. Setup environment (SQLite default)
cp .env.example .env
# No need to edit unless using AI features

# 3. Install dependencies
uv sync

# 4. Start server in background
nohup uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload > server.log 2>&1 &

# 5. Verify server is running
curl http://localhost:8000/
# Should return: {"message":"News Summary Agent API","version":"1.0.0","status":"operational"}

# 6. Stop server when done
pkill -f uvicorn
```

## Process Management Lessons

### What Works
- ✅ Background processes with nohup
- ✅ Explicit host binding (0.0.0.0)
- ✅ Process verification with ps/curl

### What Doesn't Work
- ❌ Interactive terminal commands that timeout
- ❌ Assuming server accessibility from startup logs alone
- ❌ Relying on default localhost binding in some environments

## Database Lessons

### SQLite (Recommended for Development)
- ✅ Zero setup required
- ✅ File-based, portable
- ✅ Perfect for development and testing
- ✅ Already configured in .env.example

### PostgreSQL (Optional for Production)
- ⚠️ Requires Docker Compose setup
- ⚠️ More complex configuration
- ⚠️ Necessary only for production-like environments

## Documentation Updates Made

1. **backend/README.md**: Added comprehensive troubleshooting section
2. **README.md**: Updated prerequisites and startup instructions  
3. **This document**: Captures setup discoveries for future reference

## Testing Verification

All fixes were verified by:
1. Starting fresh server instance
2. Testing API accessibility with curl
3. Verifying interactive documentation at /docs
4. Confirming health check endpoint functionality

## Future Setup Notes

For anyone setting up this project on a new machine:

1. **Start with SQLite** - don't overcomplicate with PostgreSQL initially
2. **Always use background server processes** for development
3. **API key is optional** for basic server functionality
4. **Process management matters** - don't trust startup logs alone

These lessons should prevent the "uv run python command doesn't work" confusion that initially appeared to be a uv/Python issue but was actually a server process management issue.