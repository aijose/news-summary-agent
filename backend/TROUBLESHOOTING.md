# Backend Troubleshooting Guide

## Article Ingestion Issues

### Problem: "no such table: articles" Error
**Symptoms**: Database errors when trying to ingest articles
**Cause**: Database migrations haven't been run
**Solution**:
```bash
# Create versions directory if missing
mkdir -p alembic/versions

# Generate initial migration
uv run alembic revision --autogenerate -m "Create initial database tables"

# Apply migrations
uv run alembic upgrade head

# Verify tables created
uv run python3 -c "
import sqlite3
conn = sqlite3.connect('test_newsdb.db')
cursor = conn.cursor()
cursor.execute(\"SELECT name FROM sqlite_master WHERE type='table'\")
print('Tables:', [row[0] for row in cursor.fetchall()])
conn.close()
"
```

### Problem: RSS Feed 404/403 Errors
**Symptoms**: Empty error logs, feed failures in ingestion
**Cause**: RSS feed URLs returning HTTP errors
**Solution**:
```bash
# Test RSS feeds manually
uv run python3 -c "
import asyncio
import aiohttp

async def test_feeds():
    feeds = ['https://hnrss.org/newest', 'https://techcrunch.com/feed/']
    async with aiohttp.ClientSession() as session:
        for url in feeds:
            async with session.get(url) as response:
                print(f'{url}: HTTP {response.status}')

asyncio.run(test_feeds())
"

# Update .env.example and .env files with working URLs
# Remove feeds that return 403/404 consistently
```

**Working RSS Feeds** (as of Oct 2025):
- ✅ `https://techcrunch.com/feed/`
- ✅ `http://feeds.arstechnica.com/arstechnica/index`
- ✅ `https://www.sciencedaily.com/rss/all.xml`
- ✅ `https://hnrss.org/newest`
- ✅ `https://feeds.npr.org/1001/rss.xml`
- ❌ `https://storage.googleapis.com/hnrss/newest.xml` (404)
- ❌ `https://news.mit.edu/rss/feed` (403)

### Problem: Configuration Changes Not Applied
**Symptoms**: Old RSS URLs still being used after .env update
**Cause**: Server needs restart to reload environment variables
**Solution**:
```bash
# Find backend process
ps aux | grep uvicorn

# Gracefully stop
kill -TERM <pid>

# Restart
cd backend
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000
```

### Problem: Empty Error Messages in Logs
**Symptoms**: Logs show "Error fetching RSS feed: " with no details
**Cause**: Exception-to-string conversion returns empty
**Solution**: Enhanced error logging in `src/services/rss_ingestion.py`:
```python
except Exception as e:
    logger.error(f"Error fetching RSS feed {feed_url}: {type(e).__name__}: {str(e) or 'No error message'}")
```

## Database Issues

### Problem: ChromaDB Connection Errors
**Symptoms**: Vector database initialization failures
**Solution**:
```bash
# Verify ChromaDB directory exists and is writable
ls -la chroma_db/
mkdir -p chroma_db

# Check environment variables
grep CHROMA .env
```

### Problem: SQLite Database Permissions
**Symptoms**: "database is locked" errors
**Solution**:
```bash
# Check file permissions
ls -la test_newsdb.db

# Ensure write permissions
chmod 664 test_newsdb.db
```

## Environment Setup

### Required Dependencies
Ensure all dependencies are installed:
```bash
# Install Python dependencies
uv sync

# Verify key packages
uv run python3 -c "import aiohttp, feedparser, sqlalchemy; print('✅ Dependencies OK')"
```

### Environment Variables Checklist
Required in `.env` file:
```bash
# Database
DATABASE_URL=sqlite:///./test_newsdb.db

# LLM (Required for processing)
ANTHROPIC_API_KEY=your_actual_api_key

# RSS Feeds (Working URLs only)
RSS_FEEDS=https://techcrunch.com/feed/,https://hnrss.org/newest

# ChromaDB
CHROMA_PERSIST_DIR=./chroma_db
CHROMA_COLLECTION_NAME=news_articles
```

## Platform-Specific Issues

### Ubuntu/Linux
- ✅ esbuild platform issues (frontend only)
- ✅ RSS feed networking works correctly
- ✅ SQLite database permissions handled

### macOS
- Check for different Python path requirements
- Verify similar uv/pip behavior

## Debugging Commands

### Test Article Ingestion
```bash
# Trigger ingestion manually
curl -X POST "http://localhost:8000/api/v1/articles/ingest" \
  -H "Content-Type: application/json" \
  -d '{"max_articles": 5}'

# Check logs
tail -20 logs/news_agent.log

# Verify database
uv run python3 -c "
import sqlite3
conn = sqlite3.connect('test_newsdb.db')
cursor = conn.cursor()
cursor.execute('SELECT COUNT(*) FROM articles')
print(f'Articles: {cursor.fetchone()[0]}')
conn.close()
"
```

### Check RSS Feeds Configuration
```bash
# Via API
curl -s "http://localhost:8000/api/v1/rss-feeds" | python3 -m json.tool

# Direct from settings
uv run python3 -c "from src.config import settings; print(settings.RSS_FEEDS_LIST)"
```

### Verify Server Status
```bash
# Check if running
curl -s "http://localhost:8000/health" || echo "Server not responding"

# Check logs
tail -f logs/news_agent.log
```

## Prevention Checklist

### Before Deployment
- [ ] Run database migrations: `uv run alembic upgrade head`
- [ ] Test all RSS feeds: `python3 test_feeds.py`
- [ ] Verify environment variables: `env | grep -E "(DATABASE|RSS|ANTHROPIC)"`
- [ ] Test ingestion: `curl POST /api/v1/articles/ingest`
- [ ] Check logs for errors: `tail logs/news_agent.log`

### After Environment Changes
- [ ] Update both `.env.example` and `.env`
- [ ] Restart server to reload config
- [ ] Test ingestion with new config
- [ ] Verify API shows updated feeds

### Regular Maintenance
- [ ] Monitor RSS feed health (monthly)
- [ ] Update broken/dead feeds
- [ ] Check database growth and cleanup if needed
- [ ] Verify ChromaDB persistence directory