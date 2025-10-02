# News Summary Agent Backend

## Prerequisites

- Python 3.11 or higher
- [uv](https://github.com/astral-sh/uv) - Modern Python package manager (recommended)
- PostgreSQL (via Docker Compose or local installation)

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

3. **Edit `.env` and add your actual API keys**:
   ```bash
   # Add your actual Anthropic API key
   ANTHROPIC_API_KEY=your_actual_api_key_here

   # Add any additional frontend development ports if needed
   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:3002,http://127.0.0.1:3002
   ```

4. **Create virtual environment and install dependencies**:
   ```bash
   # uv will automatically create a venv and install all dependencies
   uv sync
   ```

5. **Run the development server**:
   ```bash
   uv run python -m src.main
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