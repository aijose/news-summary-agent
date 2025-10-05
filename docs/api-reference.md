# API Reference

## Base URL

```
Development: http://localhost:8000
Production: TBD
```

All API endpoints are prefixed with `/api/v1` unless otherwise noted.

---

## Interactive Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These interfaces allow you to test all endpoints directly from your browser.

---

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible in development mode.

**Future**: User authentication will be added in a future release.

---

## Common Response Formats

### Success Response
```json
{
  "data": { ... },
  "message": "Success message (optional)"
}
```

### Error Response
```json
{
  "detail": "Error message description"
}
```

### Paginated Response
```json
{
  "articles": [ ... ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "has_more": true
}
```

---

## Articles Endpoints

### GET /api/v1/articles

Get a paginated list of articles with optional filtering.

**Query Parameters**:
- `skip` (integer, default: 0): Number of articles to skip
- `limit` (integer, default: 20, max: 100): Number of articles to return
- `hours_back` (integer, optional): Only return articles from last N hours
- `tags` (string, optional): Comma-separated tag IDs to filter by (e.g., "1,2,3")

**Example Requests**:
```bash
# Get first 20 articles
GET /api/v1/articles

# Get next 20 articles (pagination)
GET /api/v1/articles?skip=20&limit=20

# Get articles from last 24 hours
GET /api/v1/articles?hours_back=24

# Get technology and science articles
GET /api/v1/articles?tags=1,2

# Combined filters
GET /api/v1/articles?hours_back=48&tags=1,2&limit=50
```

**Response** (200 OK):
```json
{
  "articles": [
    {
      "id": 1,
      "title": "Article Title",
      "content": "Full article content...",
      "url": "https://source.com/article",
      "source": "Source Name",
      "author": "Author Name",
      "published_at": "2025-10-04T10:30:00",
      "ingested_at": "2025-10-04T11:00:00",
      "quality_score": 8.5,
      "summary_brief": "Brief summary text...",
      "summary_comprehensive": "Comprehensive summary text...",
      "summary_analytical": "Analytical summary text..."
    }
  ],
  "total": 150,
  "skip": 0,
  "limit": 20
}
```

---

### GET /api/v1/articles/{article_id}

Get a single article by ID.

**Path Parameters**:
- `article_id` (integer, required): The article ID

**Example Request**:
```bash
GET /api/v1/articles/42
```

**Response** (200 OK):
```json
{
  "id": 42,
  "title": "Article Title",
  "content": "Full article content...",
  "url": "https://source.com/article",
  "source": "Source Name",
  "author": "Author Name",
  "published_at": "2025-10-04T10:30:00",
  "ingested_at": "2025-10-04T11:00:00",
  "quality_score": 8.5,
  "summary_brief": "Brief summary text...",
  "summary_comprehensive": "Comprehensive summary text...",
  "summary_analytical": "Analytical summary text..."
}
```

**Error Responses**:
- `404 Not Found`: Article with given ID doesn't exist

---

### GET /api/v1/articles/trending

Get trending topics analysis from recent articles.

**Query Parameters**:
- `hours_back` (integer, default: 24, min: 1, max: 168): Hours back to analyze

**Example Requests**:
```bash
# Trending in last 24 hours
GET /api/v1/articles/trending

# Trending in last week
GET /api/v1/articles/trending?hours_back=168
```

**Response** (200 OK):
```json
{
  "analysis_text": "AI-generated narrative analysis of trending topics, themes, and connections...",
  "article_count": 45,
  "analysis_period": "24 hours",
  "article_ids": [12, 45, 67, 89, 103],
  "model_info": {
    "model": "claude-3-5-sonnet-20241022",
    "tokens_used": 1250
  },
  "generated_at": "2025-10-04T12:00:00"
}
```

**Error Responses**:
- `500 Internal Server Error`: Failed to analyze trending topics

---

### POST /api/v1/articles/{article_id}/summarize

Generate an AI summary for an article.

**Path Parameters**:
- `article_id` (integer, required): The article ID

**Request Body**:
```json
{
  "summary_type": "comprehensive"
}
```

**Summary Types**:
- `brief`: 100-150 words, facts only
- `comprehensive`: 250-400 words, balanced depth (default)
- `analytical`: 300-500 words, deep analysis

**Example Request**:
```bash
POST /api/v1/articles/42/summarize
Content-Type: application/json

{
  "summary_type": "analytical"
}
```

**Response** (200 OK):
```json
{
  "article_id": 42,
  "summary_type": "analytical",
  "summary_text": "Generated summary content...",
  "generated_at": "2025-10-04T12:00:00",
  "model_info": {
    "model": "claude-3-5-sonnet-20241022",
    "tokens_used": 850
  }
}
```

**Error Responses**:
- `404 Not Found`: Article doesn't exist
- `500 Internal Server Error`: Summary generation failed

**Notes**:
- Summaries are cached in the database
- Re-generating with same type returns cached version
- Different types generate new summaries

---

### POST /api/v1/articles/ingest

Manually trigger article ingestion from all active RSS feeds.

**Request Body**: None

**Example Request**:
```bash
POST /api/v1/articles/ingest
```

**Response** (200 OK):
```json
{
  "message": "Article ingestion completed",
  "statistics": {
    "new_articles": 25,
    "updated_articles": 3,
    "failed_feeds": 0,
    "total_feeds_processed": 8,
    "duration_seconds": 45.2
  }
}
```

**Error Responses**:
- `500 Internal Server Error`: Ingestion process failed

**Notes**:
- Processes all RSS feeds marked as active
- Generates vector embeddings for new articles
- Updates existing articles if content changed
- Can take 1-10 minutes depending on feed count

---

## Search Endpoints

### GET /api/v1/search

Perform semantic search across all articles.

**Query Parameters**:
- `query` (string, required): Search query
- `limit` (integer, default: 20, max: 100): Number of results
- `ai_enhanced` (boolean, default: false): Use AI-enhanced contextual search

**Example Requests**:
```bash
# Basic semantic search
GET /api/v1/search?query=artificial%20intelligence%20healthcare

# AI-enhanced search with more results
GET /api/v1/search?query=climate%20change%20policy&ai_enhanced=true&limit=50
```

**Response** (200 OK):
```json
{
  "query": "artificial intelligence healthcare",
  "results": [
    {
      "article": {
        "id": 42,
        "title": "AI Transforms Medical Diagnosis",
        "content": "...",
        "url": "...",
        "source": "...",
        "published_at": "2025-10-04T10:00:00"
      },
      "relevance_score": 0.89,
      "matched_concepts": ["AI", "healthcare", "diagnosis", "machine learning"]
    }
  ],
  "total_results": 15,
  "search_type": "ai_enhanced",
  "search_time_ms": 245
}
```

**Error Responses**:
- `400 Bad Request`: Missing or invalid query parameter
- `500 Internal Server Error`: Search failed

---

### POST /api/v1/analyze

Perform multi-perspective analysis on selected articles.

**Request Body**:
```json
{
  "article_ids": [12, 45, 67, 89]
}
```

**Constraints**:
- Minimum: 2 articles
- Maximum: 10 articles
- All article IDs must exist

**Example Request**:
```bash
POST /api/v1/analyze
Content-Type: application/json

{
  "article_ids": [12, 45, 67]
}
```

**Response** (200 OK):
```json
{
  "analysis": {
    "common_themes": [
      "Theme 1: Description of shared narrative...",
      "Theme 2: Another common element..."
    ],
    "unique_perspectives": [
      {
        "source": "Source A",
        "article_id": 12,
        "perspective": "What this source uniquely emphasizes..."
      }
    ],
    "bias_detection": [
      {
        "source": "Source B",
        "bias_indicators": ["Language choices", "Framing techniques"],
        "assessment": "Description of detected bias..."
      }
    ],
    "coverage_gaps": [
      "Facts mentioned by some but not others..."
    ]
  },
  "articles_analyzed": 3,
  "model_info": {
    "model": "claude-3-5-sonnet-20241022",
    "tokens_used": 3200
  },
  "generated_at": "2025-10-04T12:00:00"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid article IDs or count outside 2-10 range
- `404 Not Found`: One or more article IDs don't exist
- `500 Internal Server Error`: Analysis failed

---

## Tags Endpoints

### GET /api/v1/tags

Get all tags with optional feed information.

**Query Parameters**:
- `include_feeds` (boolean, default: false): Include associated feeds in response

**Example Requests**:
```bash
# Get all tags
GET /api/v1/tags

# Get tags with feed associations
GET /api/v1/tags?include_feeds=true
```

**Response** (200 OK):
```json
{
  "tags": [
    {
      "id": 1,
      "name": "Technology",
      "description": "Tech news and innovation",
      "color": "#3B82F6",
      "created_at": "2025-10-01T10:00:00",
      "updated_at": "2025-10-01T10:00:00",
      "feeds": [
        {
          "id": 5,
          "name": "TechCrunch",
          "url": "https://techcrunch.com/feed/"
        }
      ]
    }
  ],
  "total": 8
}
```

---

### POST /api/v1/tags

Create a new tag.

**Request Body**:
```json
{
  "name": "Climate",
  "description": "Climate and environmental news",
  "color": "#10B981"
}
```

**Validation**:
- `name`: Required, 1-50 characters, unique
- `description`: Optional, max 200 characters
- `color`: Required, valid hex color code (e.g., "#RRGGBB")

**Example Request**:
```bash
POST /api/v1/tags
Content-Type: application/json

{
  "name": "Climate",
  "description": "Climate and environmental news",
  "color": "#10B981"
}
```

**Response** (201 Created):
```json
{
  "id": 9,
  "name": "Climate",
  "description": "Climate and environmental news",
  "color": "#10B981",
  "created_at": "2025-10-04T12:00:00",
  "updated_at": "2025-10-04T12:00:00"
}
```

**Error Responses**:
- `400 Bad Request`: Validation failed (missing name, invalid color, etc.)
- `409 Conflict`: Tag name already exists

---

### PUT /api/v1/tags/{tag_id}

Update an existing tag.

**Path Parameters**:
- `tag_id` (integer, required): The tag ID

**Request Body**:
```json
{
  "name": "AI & ML",
  "description": "Artificial Intelligence and Machine Learning",
  "color": "#8B5CF6"
}
```

**Example Request**:
```bash
PUT /api/v1/tags/1
Content-Type: application/json

{
  "name": "AI & ML",
  "description": "Artificial Intelligence and Machine Learning",
  "color": "#8B5CF6"
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "AI & ML",
  "description": "Artificial Intelligence and Machine Learning",
  "color": "#8B5CF6",
  "created_at": "2025-10-01T10:00:00",
  "updated_at": "2025-10-04T12:00:00"
}
```

**Error Responses**:
- `404 Not Found`: Tag doesn't exist
- `400 Bad Request`: Validation failed
- `409 Conflict`: New name conflicts with existing tag

---

### DELETE /api/v1/tags/{tag_id}

Delete a tag.

**Path Parameters**:
- `tag_id` (integer, required): The tag ID

**Example Request**:
```bash
DELETE /api/v1/tags/9
```

**Response** (204 No Content)

**Error Responses**:
- `404 Not Found`: Tag doesn't exist

**Notes**:
- Cascade delete: Removes tag from all feeds
- Does NOT delete feeds or articles
- Cannot be undone

---

## RSS Feeds Endpoints

### GET /api/v1/rss-feeds

Get all RSS feeds with optional tag information.

**Query Parameters**:
- `include_tags` (boolean, default: true): Include associated tags
- `active_only` (boolean, default: false): Only return active feeds

**Example Requests**:
```bash
# Get all feeds with tags
GET /api/v1/rss-feeds

# Get only active feeds
GET /api/v1/rss-feeds?active_only=true
```

**Response** (200 OK):
```json
{
  "feeds": [
    {
      "id": 1,
      "name": "TechCrunch",
      "url": "https://techcrunch.com/feed/",
      "description": "Technology and startup news",
      "is_active": true,
      "created_at": "2025-10-01T10:00:00",
      "updated_at": "2025-10-01T10:00:00",
      "tags": [
        {
          "id": 1,
          "name": "Technology",
          "color": "#3B82F6"
        }
      ]
    }
  ],
  "total": 12,
  "active_count": 10
}
```

---

### POST /api/v1/rss-feeds

Create a new RSS feed.

**Request Body**:
```json
{
  "name": "MIT News",
  "url": "https://news.mit.edu/rss/feed",
  "description": "MIT research and innovation news",
  "is_active": true,
  "tag_ids": [1, 2]
}
```

**Validation**:
- `name`: Required, 1-100 characters
- `url`: Required, valid URL, unique
- `description`: Optional, max 500 characters
- `is_active`: Optional, default true
- `tag_ids`: Optional, array of existing tag IDs

**Example Request**:
```bash
POST /api/v1/rss-feeds
Content-Type: application/json

{
  "name": "MIT News",
  "url": "https://news.mit.edu/rss/feed",
  "description": "MIT research and innovation news",
  "tag_ids": [1, 2]
}
```

**Response** (201 Created):
```json
{
  "id": 13,
  "name": "MIT News",
  "url": "https://news.mit.edu/rss/feed",
  "description": "MIT research and innovation news",
  "is_active": true,
  "created_at": "2025-10-04T12:00:00",
  "updated_at": "2025-10-04T12:00:00",
  "tags": [
    {
      "id": 1,
      "name": "Technology",
      "color": "#3B82F6"
    },
    {
      "id": 2,
      "name": "Science",
      "color": "#10B981"
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request`: Validation failed (invalid URL, missing name, etc.)
- `409 Conflict`: URL already exists
- `404 Not Found`: One or more tag IDs don't exist

---

### PUT /api/v1/rss-feeds/{feed_id}

Update an existing RSS feed.

**Path Parameters**:
- `feed_id` (integer, required): The feed ID

**Request Body**:
```json
{
  "name": "MIT News - Science",
  "url": "https://news.mit.edu/rss/feed",
  "description": "Updated description",
  "is_active": false,
  "tag_ids": [1, 2, 3]
}
```

**Example Request**:
```bash
PUT /api/v1/rss-feeds/13
Content-Type: application/json

{
  "name": "MIT News - Science",
  "is_active": false
}
```

**Response** (200 OK):
```json
{
  "id": 13,
  "name": "MIT News - Science",
  "url": "https://news.mit.edu/rss/feed",
  "description": "Updated description",
  "is_active": false,
  "created_at": "2025-10-04T12:00:00",
  "updated_at": "2025-10-04T12:15:00",
  "tags": [...]
}
```

**Error Responses**:
- `404 Not Found`: Feed doesn't exist
- `400 Bad Request`: Validation failed
- `409 Conflict`: New URL conflicts with existing feed

---

### DELETE /api/v1/rss-feeds/{feed_id}

Delete an RSS feed.

**Path Parameters**:
- `feed_id` (integer, required): The feed ID

**Example Request**:
```bash
DELETE /api/v1/rss-feeds/13
```

**Response** (204 No Content)

**Error Responses**:
- `404 Not Found`: Feed doesn't exist

**Notes**:
- Does NOT delete articles already ingested from this feed
- Removes all tag associations
- Cannot be undone

---

## Health & Status Endpoints

### GET /health

Check API health status.

**Example Request**:
```bash
GET /health
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2025-10-04T12:00:00",
  "version": "1.0.0",
  "database": "connected",
  "vector_store": "connected"
}
```

---

### GET /api/v1/stats

Get system statistics.

**Example Request**:
```bash
GET /api/v1/stats
```

**Response** (200 OK):
```json
{
  "articles": {
    "total": 1523,
    "last_24h": 45,
    "last_7d": 312
  },
  "feeds": {
    "total": 12,
    "active": 10
  },
  "tags": {
    "total": 8
  },
  "vector_store": {
    "embeddings": 1523,
    "last_updated": "2025-10-04T11:30:00"
  },
  "cache": {
    "hit_rate": 0.78,
    "size_mb": 24.5
  }
}
```

---

## Rate Limiting

### Current Limits

No rate limiting is currently enforced in development mode.

### Future Implementation

Production deployment will include:
- **Per IP**: 100 requests/minute for general endpoints
- **Search**: 20 requests/minute (resource-intensive)
- **AI operations**: 10 requests/minute (API quota management)
- **Admin operations**: 30 requests/minute

### Rate Limit Headers

When implemented, responses will include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1696435200
```

---

## Error Codes

### HTTP Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `204 No Content`: Request succeeded, no content to return
- `400 Bad Request`: Invalid request parameters or body
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Resource conflict (duplicate name/URL)
- `422 Unprocessable Entity`: Validation failed
- `429 Too Many Requests`: Rate limit exceeded (future)
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

### Error Response Format

```json
{
  "detail": "Descriptive error message",
  "error_code": "VALIDATION_ERROR",
  "field": "email",
  "timestamp": "2025-10-04T12:00:00"
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `DUPLICATE`: Resource already exists
- `RATE_LIMIT`: Too many requests
- `API_KEY_INVALID`: Invalid Anthropic API key
- `SEARCH_FAILED`: Vector search operation failed
- `GENERATION_FAILED`: AI generation failed

---

## Pagination

### Query Parameters

- `skip` (integer, default: 0): Number of items to skip
- `limit` (integer, default: 20): Number of items to return

### Response Format

```json
{
  "items": [...],
  "total": 150,
  "skip": 20,
  "limit": 20,
  "has_more": true
}
```

### Calculating Pages

```python
# Python example
page = 1
limit = 20
skip = (page - 1) * limit

# JavaScript example
const page = 1;
const limit = 20;
const skip = (page - 1) * limit;
```

---

## Filtering

### Tag Filtering

Use comma-separated tag IDs:
```
/api/v1/articles?tags=1,2,3
```

This uses OR logic (articles with ANY of the specified tags).

### Time Filtering

Use `hours_back` parameter:
```
/api/v1/articles?hours_back=24  # Last 24 hours
/api/v1/articles?hours_back=168 # Last week
```

### Combined Filtering

```
/api/v1/articles?tags=1,2&hours_back=48&limit=50
```

---

## Caching

### Server-Side Caching

- **Summaries**: Cached indefinitely in database
- **Trending Analysis**: 5-minute cache
- **Search Results**: No cache (always fresh)
- **Feed Lists**: 15-minute cache

### Client-Side Caching (TanStack Query)

Frontend uses intelligent caching:
- **Article Lists**: 2-minute stale time
- **Individual Articles**: 5-minute stale time
- **Tags/Feeds**: 15-minute stale time
- **Search Results**: No stale time (always fresh)

### Cache Invalidation

- **Automatic**: After create/update/delete operations
- **Manual**: Refresh buttons trigger `refetch()`

---

## WebSocket Support

**Status**: Not currently implemented

**Future**: WebSocket support planned for:
- Real-time article ingestion progress
- Live search suggestions
- Multi-user collaboration features

---

## CORS Configuration

### Development

CORS is configured to allow:
- **Origins**: http://localhost:3001
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization
- **Credentials**: Allowed

### Production

Production CORS will be configured for specific domains only.

---

## API Versioning

### Current Version

- **Version**: v1
- **Prefix**: `/api/v1`
- **Status**: Active development

### Future Versions

Breaking changes will use new version prefix (e.g., `/api/v2`).

v1 will be maintained for backwards compatibility during transition period.

---

## SDK & Client Libraries

### JavaScript/TypeScript

Frontend uses custom API client (see `frontend/src/services/api.ts`):

```typescript
import { articleApi } from '@/services/api'

// Get articles
const articles = await articleApi.getArticles({ limit: 20 })

// Search
const results = await articleApi.search('AI healthcare', { aiEnhanced: true })

// Generate summary
const summary = await articleApi.generateSummary(42, 'analytical')
```

### Python

Direct usage example:

```python
import requests

BASE_URL = "http://localhost:8000"

# Get articles
response = requests.get(f"{BASE_URL}/api/v1/articles?limit=20")
articles = response.json()

# Search
response = requests.get(
    f"{BASE_URL}/api/v1/search",
    params={"query": "AI healthcare", "ai_enhanced": True}
)
results = response.json()

# Generate summary
response = requests.post(
    f"{BASE_URL}/api/v1/articles/42/summarize",
    json={"summary_type": "analytical"}
)
summary = response.json()
```

---

## Testing

### Interactive Testing

Use Swagger UI for interactive testing:
1. Open http://localhost:8000/docs
2. Click on any endpoint
3. Click "Try it out"
4. Fill in parameters
5. Click "Execute"

### cURL Examples

```bash
# Get articles
curl http://localhost:8000/api/v1/articles

# Search
curl "http://localhost:8000/api/v1/search?query=AI&ai_enhanced=true"

# Create tag
curl -X POST http://localhost:8000/api/v1/tags \
  -H "Content-Type: application/json" \
  -d '{"name":"Climate","color":"#10B981"}'

# Generate summary
curl -X POST http://localhost:8000/api/v1/articles/42/summarize \
  -H "Content-Type: application/json" \
  -d '{"summary_type":"comprehensive"}'
```

---

## Best Practices

### Pagination

- Use reasonable `limit` values (20-50 recommended)
- Cache results on client-side when appropriate
- Use `has_more` field to determine if more pages exist

### Error Handling

```typescript
try {
  const articles = await articleApi.getArticles()
} catch (error) {
  if (error.response?.status === 404) {
    // Handle not found
  } else if (error.response?.status === 500) {
    // Handle server error
  } else {
    // Handle other errors
  }
}
```

### Performance

- Use tag filtering instead of client-side filtering when possible
- Batch operations when creating multiple resources
- Use time filters to limit dataset size
- Enable AI-enhanced search only when needed

### Security

- Never expose API keys in frontend code
- Validate and sanitize all user input
- Use HTTPS in production
- Implement authentication before production deployment
