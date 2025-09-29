# News Summary Agent Backend

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your actual API keys:
   ```bash
   # Add your actual Anthropic API key
   ANTHROPIC_API_KEY=your_actual_api_key_here

   # Add any additional frontend development ports if needed
   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:3002,http://127.0.0.1:3002
   ```

3. Install dependencies:
   ```bash
   uv sync
   ```

4. Run the development server:
   ```bash
   uv run python -m src.main
   ```

## Important Security Notes

- **Never commit `.env` files to version control**
- The `.env.example` file contains safe placeholder values for documentation
- Add real API keys only to your local `.env` file
- The `.env` file is ignored by git to prevent accidental commits of secrets

## API Documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation.