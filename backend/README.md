# News Summary Agent Backend

## Prerequisites

- Python 3.11 or higher
- [uv](https://github.com/astral-sh/uv) - Modern Python package manager (recommended)
- **Database**: SQLite (default, no setup required) OR PostgreSQL (via Docker Compose)

## Quick Start with uv (Recommended)

1. **Install uv** (if not already installed):
   ```bash
   # macOS/Linux
   curl -LsSf https://astral.sh/uv/install.sh | sh

   # Or via pip
   pip install uv
   ```

2. **Copy the example environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file**:
   ```bash
   # REQUIRED: Add your actual Anthropic API key (when using AI features)
   ANTHROPIC_API_KEY=your_actual_api_key_here
   
   # DATABASE: The default SQLite configuration works out of the box
   DATABASE_URL=sqlite:///./test_newsdb.db
   
   # OPTIONAL: Add any additional frontend development ports if needed
   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:3002,http://127.0.0.1:3002
   ```

   **Note**: The API key is only required when using AI features. The server will start without it for basic functionality.

4. **Create virtual environment and install dependencies**:
   ```bash
   # uv will automatically create a venv and install all dependencies
   uv sync
   ```

5. **Run the development server**:
   ```bash
   # Option 1: Run in background (recommended for development)
   nohup uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload > server.log 2>&1 &
   
   # Option 2: Run in foreground (stops when terminal closes)
   uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
   
   # Option 3: Direct Python execution
   uv run python -m src.main
   ```

   **Server will be available at:**
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

   **To stop background server:**
   ```bash
   pkill -f uvicorn
   ```

## Alternative: Traditional pip Installation

If you prefer using pip:

1. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -e .
   # Or for development with testing tools:
   pip install -e ".[dev]"
   ```

3. **Run the development server**:
   ```bash
   python -m src.main
   ```

## Important Security Notes

- **Never commit `.env` files to version control**
- The `.env.example` file contains safe placeholder values for documentation
- Add real API keys only to your local `.env` file
- The `.env` file is ignored by git to prevent accidental commits of secrets

## API Documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation.

## Troubleshooting

### Common Setup Issues

#### 1. "Connection refused" when accessing API
**Problem**: Server appears to start but curl/browser can't connect.
**Solution**: Use background process to keep server running:
```bash
nohup uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 > server.log 2>&1 &
```

#### 2. PostgreSQL connection errors
**Problem**: `psycopg2.OperationalError: connection to server at "localhost" (127.0.0.1), port 5432 failed`
**Solution**: Use SQLite (default) or start PostgreSQL:
```bash
# Option A: Use SQLite (already configured in .env.example)
cp .env.example .env
# DATABASE_URL=sqlite:///./test_newsdb.db is already set

# Option B: Start PostgreSQL with Docker
cd /path/to/project/root
docker-compose up postgres redis -d
```

#### 3. Import errors or missing dependencies
**Problem**: ModuleNotFoundError or import issues
**Solution**: Ensure you're in the backend directory and resync:
```bash
cd backend
uv sync
```

#### 4. Server starts but no response
**Problem**: Server logs show startup but API doesn't respond
**Cause**: Process management - server gets terminated when command times out
**Solution**: Always use background process or nohup for development

#### 5. Permission denied or port already in use
**Problem**: Port 8000 already in use
**Solution**: Check for existing processes and kill them:
```bash
# Check what's using port 8000
lsof -i :8000

# Kill existing uvicorn processes
pkill -f uvicorn

# Or use a different port
uv run uvicorn src.main:app --host 0.0.0.0 --port 8001
```

### Database Configuration Options

The project supports two database configurations:

1. **SQLite (Default - No setup required)**:
   ```bash
   DATABASE_URL=sqlite:///./test_newsdb.db
   ```

2. **PostgreSQL (Full production setup)**:
   ```bash
   DATABASE_URL=postgresql://newsuser:newspass@localhost:5432/newsdb
   ```

For development, SQLite is recommended as it requires no additional setup.