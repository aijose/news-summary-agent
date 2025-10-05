# Features Documentation

## Overview

Distill (News Summary Agent) is an intelligent news aggregation and analysis platform that transforms how you consume news through AI-powered insights, semantic search, and multi-perspective analysis.

---

## Core Features

### 1. Semantic News Search

**What it does**: Natural language search across all ingested articles using vector similarity matching.

**How it works**:
- Articles are converted to vector embeddings using ChromaDB
- Your search query is converted to the same vector space
- Results are ranked by semantic similarity, not just keyword matching
- AI-enhanced search option provides contextual understanding

**Use Cases**:
- Find articles about specific topics without exact keyword matches
- Discover related content across different sources
- Research topics with natural language queries
- Example: "What are the ethical implications of AI in healthcare?"

**Technical Details**:
- Backend: ChromaDB vector store with persistent storage
- Embeddings: Generated during article ingestion
- Search API: `/api/v1/search` endpoint with pagination
- Response time: Sub-second for typical queries

---

### 2. Three-Tier AI Summary System

**What it does**: Generate summaries at three distinct levels of depth and analysis.

**Summary Types**:

#### Brief (100-150 words)
- **Purpose**: Quick scanning and headline understanding
- **Structure**: Single paragraph + 2-3 bullet points
- **Content**: Facts only, no analysis or context
- **Best For**: Time-constrained reading, news scanning
- **Example Use**: Morning news briefing, quick updates

#### Comprehensive (250-400 words)
- **Purpose**: Balanced understanding with context
- **Structure**: Main points + context + details + significance
- **Content**: Facts, background, and importance
- **Best For**: Standard news consumption, topic understanding
- **Example Use**: Daily news reading, topic research

#### Analytical (300-500 words)
- **Purpose**: Deep understanding with future implications
- **Structure**: Executive summary + analysis + outlook + critical questions
- **Content**: Facts, analysis, implications, and strategic insights
- **Best For**: In-depth understanding, strategic thinking
- **Example Use**: Policy analysis, investment research, strategic planning

**Technical Implementation**:
- LLM: Claude (Anthropic) via LangChain
- Prompts: Distinct templates per summary type
- Storage: Database-backed with automatic caching
- API: `/api/v1/articles/{id}/summarize` with `summary_type` parameter

**Usage**:
1. Select summary type from dropdown (Brief/Comprehensive/Analytical)
2. Click "Generate Summary"
3. Summary is generated and saved for future views
4. Re-generate at any time with different type

---

### 3. Trending Insights

**What it does**: AI-powered analysis of what's trending in the news with narrative insights.

**Features**:
- **Time Periods**: Analyze last 24 hours, 48 hours, or full week
- **AI Narrative**: Claude generates cohesive analysis of main topics, themes, and connections
- **Sample Articles**: View 5 representative trending articles
- **On-Demand**: Generated only when requested to save API calls
- **Refresh**: Re-generate with latest articles at any time

**Analysis Includes**:
- Main trending topics and themes
- Connections between different stories
- Emerging patterns and narrative threads
- Context for why topics are trending

**Technical Details**:
- Endpoint: `/api/v1/articles/trending`
- Query params: `hours_back` (24, 48, or 168)
- Caching: 5-minute cache to reduce API calls
- Sample articles: Fetched from article_ids in response

**Usage Flow**:
1. Navigate to Home page
2. Click "Show Trending Insights" button
3. Select time period (24h/48h/Week)
4. View AI-generated analysis
5. Click sample articles to read full stories
6. Refresh to regenerate with latest data

---

### 4. RSS Feed Management

**What it does**: Full CRUD operations for managing RSS feed sources.

**Capabilities**:
- **Add Feeds**: Add new RSS/Atom feed URLs
- **Edit Feeds**: Update name, description, or URL
- **Delete Feeds**: Remove feeds with cascade deletion
- **Toggle Active**: Temporarily disable feeds without deletion
- **Tag Assignment**: Organize feeds with custom tags

**Feed Fields**:
- **Name**: Display name for the feed
- **URL**: RSS/Atom feed URL
- **Description**: Optional description of feed content
- **Active Status**: Enable/disable feed ingestion
- **Tags**: Multiple tags for categorization

**Technical Details**:
- Database: SQLite with SQLAlchemy ORM
- API: Full REST CRUD at `/api/v1/rss-feeds`
- Validation: URL format, uniqueness constraints
- Relationships: Many-to-many with tags

**Usage**:
1. Navigate to Admin panel
2. View all feeds in Feed Management section
3. Click "Add Feed" to create new feed
4. Assign tags using tag selector
5. Toggle active/inactive as needed
6. Delete feeds to remove permanently

---

### 5. Tag System

**What it does**: Organize feeds and filter articles by customizable categories.

**Tag Features**:
- **Custom Creation**: Create tags with name, description, color
- **Color Coding**: Visual differentiation with hex color codes
- **Feed Assignment**: Assign multiple tags to each feed
- **Multi-Page Filtering**: Filter by tags on Home, Browse, Search
- **Visual Display**: Color-coded chips with checkmark selection

**Tag Fields**:
- **Name**: Tag display name (e.g., "Technology", "Science")
- **Description**: Optional description of tag purpose
- **Color**: Hex color code for visual identification

**Filtering Behavior**:
- **Home Page**: Filter latest news by tags
- **Browse Page**: Tag + time range filtering
- **Search Page**: Client-side tag filtering of search results
- **Multi-Select**: Select multiple tags (OR logic)
- **Clear All**: One-click to reset filters

**Technical Details**:
- Database: Tag model with many-to-many feed relationship
- API: `/api/v1/tags` for CRUD operations
- Frontend: TanStack Query with automatic cache invalidation
- Filtering: Server-side for listings, client-side for search

**Usage**:
1. **Create Tags**: Admin panel → Tag Management → Add Tag
2. **Assign to Feeds**: Feed Management → Select tags for each feed
3. **Filter Articles**: Click tag chips on any page
4. **Multi-Select**: Click multiple tags to combine filters
5. **Clear**: Click "Clear all" to reset

---

### 6. Multi-Perspective Analysis

**What it does**: Compare how different sources cover the same story.

**Analysis Includes**:
- **Common Themes**: Shared narrative elements across sources
- **Unique Perspectives**: What each source emphasizes
- **Bias Detection**: Identifying editorial slant and framing
- **Coverage Gaps**: What some sources mention that others omit
- **Source Comparison**: Side-by-side perspective analysis

**Requirements**:
- Minimum: 2 articles
- Maximum: 10 articles
- Best practice: Select articles on the same topic from different sources

**Technical Implementation**:
- LLM: Claude for cross-article analysis
- Prompt: Structured comparison framework
- API: `/api/v1/analyze` with article IDs array
- Response: Structured analysis with sections

**Usage**:
1. Navigate to Search page
2. Search for a topic (e.g., "climate change")
3. Select 2-10 articles using checkboxes
4. Click "Analyze Selected Articles" in right panel
5. View comprehensive comparison analysis
6. Use for balanced understanding of controversial topics

---

### 7. Reading List

**What it does**: Save articles for later reading with persistent storage.

**Features**:
- **One-Click Save**: Bookmark icon on any article card
- **Persistent Storage**: Saved across browser sessions
- **Dedicated Page**: View all saved articles in one place
- **Easy Removal**: Click bookmark again to unsave
- **Summary Generation**: Generate summaries for saved articles

**Storage**:
- Browser localStorage for client-side persistence
- Synced with article data from API
- Automatic cleanup of deleted articles

**Usage**:
1. Click bookmark icon on article card
2. Navigate to "Reading List" to view saved articles
3. Click bookmark icon again to remove from list
4. Generate summaries as needed
5. Use for curating articles for deeper reading

---

### 8. Research Agent

**What it does**: Autonomous AI agent for complex multi-step research questions.

**Capabilities**:
- **Plan Creation**: Agent creates step-by-step research plan
- **Autonomous Execution**: Executes each step without intervention
- **Multi-Article Analysis**: Searches, retrieves, and analyzes multiple articles
- **Perspective Analysis**: Identifies different viewpoints automatically
- **Comprehensive Results**: Detailed findings with sources and citations

**Research Process**:
1. Understand research question
2. Create execution plan with specific steps
3. Search for relevant articles
4. Retrieve and analyze content
5. Identify perspectives and themes
6. Synthesize comprehensive results

**Example Queries**:
- "Find recent AI regulation articles and analyze different political perspectives"
- "Research the impact of remote work on productivity across industries"
- "Analyze media coverage of climate policy from different countries"

**Technical Details**:
- LangChain agent with custom tools
- Multi-step reasoning with plan execution
- Context-aware article retrieval
- Structured output with citations

**Usage**:
1. Navigate to Research Agent page
2. Enter complex research question
3. Review execution plan
4. Watch agent work through steps
5. Review comprehensive results
6. Follow citation links for source articles

---

### 9. Browse & Filter

**What it does**: Browse all articles with flexible filtering options.

**Filtering Options**:
- **Tags**: Filter by feed category (Technology, Science, etc.)
- **Time Range**: Last 24h, 7 days, 30 days, or all time
- **Pagination**: Load more articles as you scroll
- **Refresh**: Check for newly ingested articles

**View Options**:
- **Article Cards**: Visual preview with title, source, date
- **Summary Generation**: Generate summaries directly from cards
- **Detail Navigation**: Click any card for full article view

**Technical Details**:
- API: `/api/v1/articles` with query parameters
- Pagination: 20 articles per page with "Load More"
- Caching: TanStack Query with 2-minute stale time
- Filters: Combinable tag and time filters

**Usage**:
1. Navigate to Browse page
2. Select tags to filter by category
3. Select time range
4. Scroll and click "Load More" for additional articles
5. Click "Refresh" to check for new articles
6. Click any card to view full article

---

### 10. Real-Time Article Ingestion

**What it does**: Continuously ingest articles from configured RSS feeds.

**Ingestion Features**:
- **Scheduled Jobs**: Automatic ingestion at configured intervals
- **Manual Trigger**: Admin panel button to ingest immediately
- **Quality Assessment**: Evaluates article quality on ingestion
- **Duplicate Detection**: Prevents duplicate articles
- **Vector Embeddings**: Generates embeddings for search
- **Status Reporting**: Real-time progress updates

**Ingestion Process**:
1. Fetch RSS feeds from configured sources
2. Parse articles and extract metadata
3. Check for duplicates
4. Assess article quality
5. Store in PostgreSQL database
6. Generate vector embeddings in ChromaDB
7. Report ingestion statistics

**Technical Details**:
- RSS Parser: Python feedparser library
- Database: SQLAlchemy with PostgreSQL
- Vector Store: ChromaDB with persistent storage
- Background Jobs: Can be configured for automation

**Usage**:
1. Navigate to Admin panel
2. Click "Ingest Articles" button
3. View real-time ingestion progress
4. Check statistics (new, updated, failed)
5. Articles immediately available for search

---

## Feature Integration

### Workflow Examples

#### Daily News Consumption
1. Check **Trending Insights** for what's hot
2. Use **Tag Filters** to focus on interests
3. Generate **Brief Summaries** for quick updates
4. Save interesting articles to **Reading List**
5. Use **Comprehensive Summaries** for deeper reading later

#### Research & Analysis
1. Use **Semantic Search** to find relevant articles
2. Select multiple articles for **Multi-Perspective Analysis**
3. Generate **Analytical Summaries** for each source
4. Use **Research Agent** for complex questions
5. Compare different viewpoints and biases

#### Content Discovery
1. **Browse** recent articles by time range
2. Filter by **Tags** for specific topics
3. Check **Trending Insights** for emerging stories
4. Use **Search** for specific investigations
5. Save discoveries to **Reading List**

---

## Performance Characteristics

### Response Times
- **Search**: < 1 second for typical queries
- **Summary Generation**: 2-5 seconds depending on article length
- **Trending Analysis**: 5-10 seconds for comprehensive analysis
- **Multi-Perspective**: 10-20 seconds for 5-10 articles
- **Article Ingestion**: 1-3 minutes for 100 articles

### Scalability
- **Article Database**: Tested with 1000+ articles
- **Vector Search**: Sub-second with thousands of embeddings
- **Concurrent Users**: Supports multiple simultaneous users
- **API Rate Limiting**: Configured per Anthropic API limits

### Caching Strategy
- **Search Results**: No cache (always fresh)
- **Article Lists**: 2-minute cache
- **Trending Insights**: 5-minute cache
- **Summaries**: Permanent (database-backed)
- **Tags & Feeds**: 15-minute cache with invalidation

---

## Accessibility Features

### UI/UX
- **Responsive Design**: Mobile, tablet, desktop optimized
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Semantic HTML with ARIA labels
- **Color Contrast**: WCAG AA compliant
- **Focus Indicators**: Clear focus states

### Performance
- **Lazy Loading**: Images and components load on demand
- **Infinite Scroll**: Smooth pagination experience
- **Loading States**: Clear feedback for async operations
- **Error Handling**: User-friendly error messages

---

## Security & Privacy

### Data Handling
- **No User Tracking**: No analytics or tracking cookies
- **Local Storage**: Reading list stored locally only
- **API Security**: CORS configured, rate limiting
- **Input Validation**: All user input sanitized

### API Keys
- **Environment Variables**: API keys never exposed to frontend
- **Backend Only**: All LLM calls from secure backend
- **Rate Limiting**: Prevents abuse of AI services

---

## Browser Compatibility

### Supported Browsers
- **Chrome/Edge**: Version 90+ (recommended)
- **Firefox**: Version 88+
- **Safari**: Version 14+

### Required Features
- **JavaScript**: ES2020+ support required
- **LocalStorage**: For reading list persistence
- **Fetch API**: For backend communication

---

## Future Enhancements

### Planned Features
- User authentication and personalization
- Saved search queries
- Article export (PDF, markdown)
- Email notifications for trending topics
- Mobile app version
- Browser extension

### Under Consideration
- Multi-language support
- Podcast/video content integration
- Social sharing features
- Collaborative reading lists
- Advanced analytics dashboard
