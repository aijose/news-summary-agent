# Usage Guide

## Getting Started

This guide walks you through using Distill's features to efficiently consume and analyze news.

---

## First Time Setup

### 1. Access the Application

After starting the development servers:
- **Frontend**: Open http://localhost:3001 in your browser
- **Backend API**: Available at http://localhost:8000
- **API Docs**: Interactive documentation at http://localhost:8000/docs

### 2. Initial Article Ingestion

Before using search and analysis features, you need articles in the database:

1. Navigate to the **Admin** page (link in top navigation)
2. Click the **"Ingest Articles"** button
3. Wait for ingestion to complete (1-3 minutes for initial load)
4. You'll see statistics: articles added, updated, and any failures

**Note**: Initial ingestion may take a few minutes as it fetches from all configured RSS feeds.

### 3. Explore the Interface

- **Home**: Latest news and trending insights
- **Browse**: All articles with filtering options
- **Search**: Semantic search across all articles
- **Reading List**: Your saved articles
- **Research Agent**: Complex multi-step research
- **Admin**: Feed management and article ingestion
- **Help**: Feature guide and tips

---

## Core Workflows

### Workflow 1: Morning News Briefing (5-10 minutes)

**Goal**: Get up to speed on the day's news quickly.

1. **Check Trending Insights**
   - Open the **Home** page
   - Click **"Show Trending Insights"**
   - Select **24 hours** time period
   - Read the AI-generated analysis
   - Click sample articles that interest you

2. **Filter by Interest**
   - Click tag chips to filter by topics (e.g., **Technology**, **Science**)
   - Browse latest news in your selected categories

3. **Generate Brief Summaries**
   - On article cards, select **"Brief"** from dropdown
   - Click **"Generate Summary"**
   - Read 100-150 word quick summaries
   - Save interesting articles to Reading List

**Time**: 5-10 minutes for 10-15 articles

---

### Workflow 2: Deep Topic Research (30-60 minutes)

**Goal**: Thoroughly understand a specific topic from multiple angles.

1. **Search for Topic**
   - Navigate to **Search** page
   - Enter your topic (e.g., "artificial intelligence regulation")
   - Toggle **"AI-Enhanced Search"** for better contextual results

2. **Review Search Results**
   - Browse through relevant articles
   - Check sources and publication dates
   - Select 5-10 most relevant articles using checkboxes

3. **Generate Multi-Perspective Analysis**
   - With articles selected, right panel shows analysis option
   - Click **"Analyze Selected Articles"**
   - Review comprehensive comparison:
     - Common themes across sources
     - Unique perspectives from each
     - Bias detection and framing differences
     - Coverage gaps

4. **Generate Analytical Summaries**
   - For key articles, select **"Analytical"** summary type
   - Get 300-500 word deep analysis with:
     - Executive summary
     - Key findings and analysis
     - Future outlook
     - Critical questions

5. **Save for Later**
   - Bookmark important articles to Reading List
   - Return later for deeper reading

**Time**: 30-60 minutes for comprehensive research

---

### Workflow 3: Using Research Agent (10-20 minutes)

**Goal**: Let AI handle complex multi-step research automatically.

1. **Navigate to Research Agent**
   - Click **"Research Agent"** in navigation
   - Read the description and examples

2. **Enter Research Question**
   - Input a complex, multi-faceted question
   - Examples:
     - "Find recent articles on climate policy and analyze perspectives from different political viewpoints"
     - "Research the impact of AI on employment across different industries"
     - "Analyze media coverage of cryptocurrency regulation from US and EU sources"

3. **Review Execution Plan**
   - Agent shows step-by-step plan:
     - Search queries it will perform
     - Articles it will analyze
     - Analysis it will conduct
   - Review to ensure it matches your intent

4. **Watch Agent Execute**
   - Agent autonomously executes each step
   - Shows progress as it works
   - Retrieves and analyzes articles
   - Identifies different perspectives

5. **Review Comprehensive Results**
   - Detailed findings with source citations
   - Perspective analysis across sources
   - Thematic connections and patterns
   - Click citation links to read source articles

**Time**: 10-20 minutes including agent execution

---

### Workflow 4: Managing Feeds & Tags (15-30 minutes)

**Goal**: Customize your news sources and organization.

#### Managing Tags

1. **Navigate to Admin Panel**
   - Click **"Admin"** in navigation
   - Scroll to **Tag Management** section

2. **Create New Tags**
   - Click **"Add Tag"**
   - Enter:
     - **Name**: e.g., "AI & ML", "Climate", "Economics"
     - **Description**: Optional, helps remember tag purpose
     - **Color**: Pick a hex color for visual identification
   - Click **"Create"**

3. **Edit Existing Tags**
   - Click **"Edit"** on any tag
   - Update name, description, or color
   - Click **"Save"**

4. **Delete Tags**
   - Click **"Delete"** on tag to remove
   - Confirmation required
   - Cascades: removes tag assignments but keeps feeds

#### Managing RSS Feeds

1. **View Current Feeds**
   - Scroll to **RSS Feed Management** section
   - See all feeds with their tags and status

2. **Add New Feed**
   - Click **"Add Feed"**
   - Enter:
     - **Name**: Display name (e.g., "TechCrunch")
     - **URL**: RSS feed URL
     - **Description**: Optional
   - Assign tags using tag selector
   - Click **"Create"**

3. **Edit Feed**
   - Click **"Edit"** on any feed
   - Update name, URL, description, or tags
   - Click **"Save"**

4. **Toggle Feed Active/Inactive**
   - Use toggle switch to enable/disable
   - Inactive feeds won't be ingested
   - Useful for temporary exclusion

5. **Delete Feed**
   - Click **"Delete"** to remove permanently
   - Confirmation required
   - Deletes feed but not already-ingested articles

#### Testing New Feeds

1. **Add feed** using steps above
2. Click **"Ingest Articles"** to fetch immediately
3. Navigate to **Browse** page
4. Filter by the tags you assigned
5. Verify articles appear from new source

**Time**: 15-30 minutes for initial setup

---

## Feature-Specific Guides

### Using Semantic Search

**What it does**: Finds articles by meaning, not just keywords.

**Example**:
- **Keyword search** (traditional): "machine learning healthcare"
  - Finds only articles with those exact words
- **Semantic search** (Distill): "using AI to diagnose diseases"
  - Finds relevant articles even if they use different terminology

**Best Practices**:
1. **Use natural language**: Ask questions naturally
2. **Be specific**: "impact of remote work on mental health" vs "remote work"
3. **AI-enhanced toggle**: Enable for better contextual understanding
4. **Try variations**: Rephrase if results aren't what you expected

**Advanced Tips**:
- Combine with tag filters for focused results
- Use multi-word concepts for precision
- Compare standard vs AI-enhanced results

---

### Choosing Summary Types

**When to use each type**:

#### Brief (100-150 words)
- **Morning news scanning**: Quick overview of many articles
- **Time-constrained reading**: Only have a few minutes
- **Decision-making**: "Should I read the full article?"
- **Fact-checking**: Just need the core facts
- **Example**: Daily news briefing before work

#### Comprehensive (250-400 words)
- **Standard news consumption**: Regular reading sessions
- **Topic understanding**: Need context and background
- **Balanced view**: Facts + significance without deep analysis
- **Informed decisions**: Enough detail for most purposes
- **Example**: Lunch break news reading

#### Analytical (300-500 words)
- **Strategic thinking**: Need to understand implications
- **Investment research**: Financial and business decisions
- **Policy analysis**: Government and regulatory topics
- **Deep understanding**: Want expert-level insights
- **Future planning**: Need to know what's coming next
- **Example**: Research for work presentation

**Pro Tip**: Start with Brief for many articles, then use Comprehensive or Analytical for the ones that matter most to you.

---

### Filtering Effectively

**Tag Filtering**:
- **Single tag**: Click one tag to see only that category
- **Multiple tags**: Click several tags (OR logic - shows articles with ANY selected tag)
- **Clear all**: One-click reset to see all articles
- **Persistence**: Filters stay applied as you browse

**Time Range Filtering** (Browse page):
- **Last 24 hours**: Today's news only
- **Last 7 days**: This week's articles
- **Last 30 days**: This month's content
- **All time**: Everything in database

**Combining Filters**:
- Use tags + time range together
- Example: "Technology" tag + "Last 7 days" = This week's tech news
- Filters work across pagination - "Load More" respects filters

**Search Page Filtering**:
- Tag filters apply AFTER search results
- Useful for narrowing semantic search by category
- Client-side filtering preserves search relevance ranking

---

### Using Trending Insights

**When to check**:
- **Morning routine**: See what's dominating news cycle
- **Before meetings**: Quick context on current events
- **Weekly review**: Use "Week" view for broader perspective

**Understanding the Analysis**:
- **Main topics**: What stories are getting most coverage
- **Themes**: Underlying patterns and connections
- **Connections**: How different stories relate
- **Context**: Why these topics are trending now

**Working with Sample Articles**:
- 5 representative articles from the analysis
- Click any to read full article + generate summaries
- Not random - these are the specific articles analyzed
- Good starting point for deeper exploration

**Time Period Selection**:
- **24 hours**: Current day's immediate trends
- **48 hours**: Short-term patterns and developing stories
- **Week**: Broader trends and sustained coverage
- **Refresh**: Update with latest articles

**Pro Tip**: Compare 24h vs Week views to see if trends are new or sustained.

---

### Multi-Perspective Analysis

**Selecting Articles**:
- **Minimum**: 2 articles (for comparison)
- **Optimal**: 4-6 articles (balanced analysis)
- **Maximum**: 10 articles (comprehensive but slower)

**Best Selection Strategy**:
1. Search for a specific topic
2. Choose articles from DIFFERENT sources
3. Include various perspectives (if topic is controversial)
4. Mix publication dates for evolution of coverage
5. Select diverse article types (news, opinion, analysis)

**Reading the Analysis**:

The multi-perspective analysis includes:
- **Common Themes**: What all sources agree on
  - Core facts that are undisputed
  - Shared narrative elements
  - Universal concerns or interests

- **Unique Perspectives**: What each source emphasizes
  - Different angles on the same story
  - Exclusive information or sources
  - Varying editorial focus

- **Bias Detection**: Editorial slant and framing
  - Language choices that reveal bias
  - What's emphasized vs. downplayed
  - Framing techniques used

- **Coverage Gaps**: What some sources omit
  - Facts mentioned by some but not others
  - Different levels of detail
  - Selective coverage patterns

**Use Cases**:
- **Controversial topics**: Get balanced view of polarizing issues
- **Investment decisions**: See how different financial sources analyze
- **Policy understanding**: Compare different political perspectives
- **Fact-checking**: Identify common ground and disputes
- **Media literacy**: Understand how framing shapes narratives

**Pro Tip**: For best results, include sources you know have different editorial stances.

---

### Building Your Reading List

**Strategic Saving**:
1. **Save liberally during scanning**: Bookmark anything that looks interesting
2. **Dedicated reading time**: Set aside time to read saved articles
3. **Generate summaries**: Use Comprehensive or Analytical for saved articles
4. **Prune regularly**: Remove articles after reading

**Organization Strategy**:
- Reading List doesn't have folders (yet)
- Use consistently: daily save + weekly review
- Generate Brief summaries to re-evaluate if still interested
- Remove outdated articles to keep list manageable

**Reading List Workflow**:
1. **Morning**: Save 10-15 articles during news scan
2. **Lunch**: Review Reading List, generate Comprehensive summaries
3. **Evening**: Deep read 3-5 most important articles (Analytical)
4. **Weekly**: Clear read articles, carry over still-relevant items

---

## Admin Functions

### Article Ingestion

**When to Run**:
- **Initial setup**: First time running application
- **Daily**: Scheduled or manual to get latest articles
- **After adding feeds**: Test new RSS sources
- **Low article count**: When search returns few results

**Running Ingestion**:
1. Navigate to Admin page
2. Click **"Ingest Articles"** button
3. Watch real-time progress
4. Review statistics:
   - **New**: Articles added to database
   - **Updated**: Existing articles refreshed
   - **Failed**: Errors encountered

**Troubleshooting**:
- **High failure rate**: Check RSS feed URLs
- **No new articles**: Feeds may not have updates
- **Slow ingestion**: Normal for initial run (100+ articles)
- **Errors**: Check server logs for details

**Performance**:
- **100 articles**: ~1-2 minutes
- **500 articles**: ~5-10 minutes
- Depends on feed response times and article length

---

### Feed Management Best Practices

**Choosing Feeds**:
- **Quality over quantity**: Better to have 10 great feeds than 50 mediocre
- **Diverse sources**: Include different perspectives
- **Update frequency**: Mix daily and weekly update feeds
- **Topic coverage**: Ensure tags cover your interests

**Feed Organization**:
1. Create tags BEFORE adding feeds
2. Assign tags as you add each feed
3. Use descriptive names (feed name should match source brand)
4. Add descriptions for obscure or niche feeds

**Maintenance**:
- **Monthly review**: Check which feeds you actually read
- **Remove unused**: Delete feeds that don't provide value
- **Update tags**: Refine categorization as you learn patterns
- **Test new feeds**: Try one at a time to evaluate quality

---

## Tips & Tricks

### Power User Tips

1. **Tag Strategy**
   - Create 5-10 broad tags initially (Technology, Science, Business, etc.)
   - Add specific tags as interests develop (AI/ML, Climate, Crypto, etc.)
   - Use colors consistently (blue for tech, green for environment, etc.)

2. **Search Efficiency**
   - Start broad, then narrow with filters
   - Use AI-enhanced for complex questions
   - Standard search for simple keyword matching
   - Save interesting queries mentally for future use

3. **Summary Generation**
   - Generate Brief for everything during scanning
   - Upgrade to Comprehensive for interesting articles
   - Reserve Analytical for important research
   - Summaries are cached - regenerate if article is updated

4. **Reading List Management**
   - Set a maximum (e.g., 20 articles)
   - Weekly cleanup of read items
   - Use Brief summaries to decide what to read
   - Bookmark system = triage, not archive

5. **Trending Insights**
   - Check 24h view every morning
   - Compare to week view for context
   - Refresh before important meetings
   - Use sample articles as research starting points

### Keyboard Shortcuts

Currently, the application doesn't have custom keyboard shortcuts, but standard browser shortcuts work:
- **Ctrl/Cmd + F**: Search within page
- **Ctrl/Cmd + Click**: Open article in new tab
- **Tab**: Navigate between interactive elements
- **Enter**: Activate focused button

### Browser Bookmarks

Bookmark these pages for quick access:
- `http://localhost:3001` - Home
- `http://localhost:3001/search` - Search
- `http://localhost:3001/browse` - Browse
- `http://localhost:3001/reading-list` - Reading List
- `http://localhost:3001/admin` - Admin

---

## Common Questions

### "Why don't I see any articles?"

**Solution**:
1. Check if articles have been ingested (Admin → Ingest Articles)
2. Verify database connection is working
3. Check backend logs for errors
4. Try refreshing the page

### "Search returns no results"

**Solution**:
1. Verify articles exist in Browse page
2. Try broader search terms
3. Remove tag filters temporarily
4. Check if ChromaDB is running
5. Try standard search instead of AI-enhanced

### "Summary generation is slow"

**Causes**:
- First summary for an article (not cached)
- Analytical summaries (larger, take longer)
- Claude API rate limits (during high usage)

**Solution**:
- Wait patiently (usually completes in 5-10 seconds)
- Try again if it fails (occasional API issues)
- Check backend logs for errors

### "Trending Insights not loading"

**Solution**:
1. Check if you have articles from selected time period
2. Verify Claude API key is configured
3. Try different time period (24h → Week)
4. Check browser console for errors
5. Refresh the page

### "Tags not filtering correctly"

**Solution**:
1. Verify feeds have tags assigned (Admin → Feed Management)
2. Check if feed name matches article source
3. Try ingesting articles again after tag assignment
4. Clear all tags and select again

### "Reading List disappeared"

**Cause**: Browser localStorage was cleared

**Prevention**:
- Don't clear browser data for localhost
- Use browser's "Keep local data" setting
- Backup bookmarked article IDs if needed

---

## Troubleshooting

### Backend Connection Issues

**Symptoms**: "Failed to fetch" errors, blank pages

**Solutions**:
1. Check backend is running: `curl http://localhost:8000/health`
2. Restart backend: `pkill -f uvicorn` then start again
3. Check for port conflicts: `lsof -i :8000`
4. Review backend logs: `tail -f backend/server.log`

### Frontend Issues

**Symptoms**: Blank page, JavaScript errors

**Solutions**:
1. Check browser console for errors (F12)
2. Verify frontend is running: http://localhost:3001
3. Restart frontend: Stop (Ctrl+C) and `npm run dev`
4. Clear browser cache and refresh (Ctrl+Shift+R)

### Database Issues

**Symptoms**: "No such table" errors, data not persisting

**Solutions**:
1. Check database file exists: `ls backend/news_agent.db`
2. Run migrations: `cd backend && uv run alembic upgrade head`
3. Check database permissions
4. Review backend logs for SQL errors

### API Key Issues

**Symptoms**: Summaries fail, trending insights don't work

**Solutions**:
1. Verify `.env` file has `ANTHROPIC_API_KEY`
2. Check API key is valid (Anthropic console)
3. Verify no extra spaces or quotes in `.env`
4. Restart backend after updating `.env`
5. Check API rate limits (Anthropic dashboard)

---

## Best Practices

### Daily Routine

**Morning (10 minutes)**:
1. Check Trending Insights (24h)
2. Filter by interest tags
3. Generate Brief summaries for 10-15 articles
4. Save 3-5 to Reading List

**Lunch (20 minutes)**:
1. Review Reading List
2. Generate Comprehensive summaries
3. Read top 3-5 articles
4. Remove read items from list

**Evening (30 minutes, optional)**:
1. Deep research on one topic (Search → Multi-Perspective)
2. Generate Analytical summaries
3. Use Research Agent for complex questions
4. Save important findings

**Weekly Review (30 minutes)**:
1. Check Trending Insights (Week view)
2. Review and clean Reading List
3. Evaluate feed quality (Admin panel)
4. Adjust tags and feeds as needed

### Quality Reading

1. **Start with summaries**: Don't read full articles until you know they're valuable
2. **Use multi-perspective**: Get balanced view before forming opinions
3. **Follow citations**: Research Agent and Analysis provide source links
4. **Cross-reference**: Compare different sources on important topics
5. **Time-box**: Set limits to avoid information overload

### Managing Information Overload

1. **Limit tag selection**: Focus on 2-3 topics at a time
2. **Use time filters**: Don't try to read everything ever written
3. **Trust summaries**: Brief and Comprehensive are designed to be sufficient
4. **Schedule reading**: Set specific times instead of constant checking
5. **Curate feeds**: Remove low-value sources regularly

---

## Getting Help

### Resources

- **Help Page**: In-app guide (Help link in navigation)
- **API Docs**: http://localhost:8000/docs (interactive)
- **Project Docs**: `docs/` folder in repository
- **Source Code**: Check `frontend/` and `backend/` directories

### Reporting Issues

If you encounter bugs or issues:
1. Check browser console (F12) for errors
2. Check backend logs: `tail -f backend/server.log`
3. Note steps to reproduce
4. Check GitHub issues for similar reports
5. File new issue with details

### Feature Requests

For suggesting improvements:
1. Check `docs/features.md` for planned features
2. Review open GitHub issues
3. Submit detailed feature request with use case
4. Consider contributing if you can code!
