"""
News Research Agent with Plan-and-Execute pattern.

This module provides a true autonomous agent that creates plans and executes
multi-step research tasks based on user queries.
"""

import logging
from typing import List, Dict, Any, Optional
import asyncio
from datetime import datetime, timezone, timedelta

from langchain_anthropic import ChatAnthropic
from langchain.tools import Tool
from langchain.prompts import PromptTemplate
from langchain.schema import SystemMessage, HumanMessage, AIMessage

from ..config import settings
from ..database import SessionLocal, Article
from .vector_store import get_vector_store
from .langchain_agent import NewsAnalysisAgent

logger = logging.getLogger(__name__)


class NewsResearchAgent:
    """
    Autonomous news research agent using Plan-and-Execute pattern.

    Creates upfront plans for complex queries, shows transparent execution,
    and provides predictable, controlled research workflows.
    """

    def __init__(self):
        self.llm = None
        self.vector_store = get_vector_store()
        self.analysis_agent = NewsAnalysisAgent()  # Reuse existing chains
        self._initialize_llm()
        self._setup_tools()

    def _initialize_llm(self):
        """Initialize Claude LLM for planning and execution."""
        try:
            if not settings.ANTHROPIC_API_KEY or settings.ANTHROPIC_API_KEY == "your_claude_api_key_here":
                logger.warning("Anthropic API key not configured. Agent will use mock mode.")
                self.llm = None
                return

            self.llm = ChatAnthropic(
                model="claude-3-5-sonnet-20241022",
                anthropic_api_key=settings.ANTHROPIC_API_KEY,
                temperature=0,  # Low temperature for predictable planning
                max_tokens=4000
            )
            logger.info("Research Agent LLM initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Research Agent LLM: {e}")
            self.llm = None

    def _setup_tools(self):
        """Setup tools available to the research agent."""
        self.tools = {
            'search_articles': self._search_articles_tool,
            'get_article_details': self._get_article_details_tool,
            'filter_by_source': self._filter_by_source_tool,
            'generate_summary': self._generate_summary_tool,
            'analyze_perspectives': self._analyze_perspectives_tool,
            'compare_articles': self._compare_articles_tool,
            'extract_topics': self._extract_topics_tool,
            'get_trending': self._get_trending_tool,
            'categorize_bias': self._categorize_bias_tool,
            'get_by_timerange': self._get_by_timerange_tool,
        }

    # ==================== TOOL IMPLEMENTATIONS ====================

    async def _search_articles_tool(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """Search for articles using vector similarity."""
        try:
            results = self.vector_store.search_similar_articles(query, limit=limit)
            return {
                'success': True,
                'results': results,
                'count': len(results)
            }
        except Exception as e:
            logger.error(f"Error in search_articles tool: {e}")
            return {'success': False, 'error': str(e)}

    async def _get_article_details_tool(self, article_id: int) -> Dict[str, Any]:
        """Get full details for a specific article."""
        try:
            db = SessionLocal()
            article = db.query(Article).filter(Article.id == article_id).first()
            db.close()

            if not article:
                return {'success': False, 'error': 'Article not found'}

            return {
                'success': True,
                'article': {
                    'id': article.id,
                    'title': article.title,
                    'content': article.content,
                    'source': article.source,
                    'url': article.url,
                    'published_date': article.published_date.isoformat() if article.published_date else None
                }
            }
        except Exception as e:
            logger.error(f"Error in get_article_details tool: {e}")
            return {'success': False, 'error': str(e)}

    async def _filter_by_source_tool(self, article_ids: List[int], source_types: List[str]) -> Dict[str, Any]:
        """Filter articles by source type."""
        try:
            db = SessionLocal()
            articles = db.query(Article).filter(Article.id.in_(article_ids)).all()
            db.close()

            # Simple source categorization
            categorized = {}
            for article in articles:
                source_lower = article.source.lower()
                for source_type in source_types:
                    if source_type.lower() in source_lower:
                        if source_type not in categorized:
                            categorized[source_type] = []
                        categorized[source_type].append(article.id)

            return {
                'success': True,
                'categorized': categorized,
                'total_filtered': sum(len(ids) for ids in categorized.values())
            }
        except Exception as e:
            logger.error(f"Error in filter_by_source tool: {e}")
            return {'success': False, 'error': str(e)}

    async def _generate_summary_tool(self, article_id: int, summary_type: str = 'comprehensive') -> Dict[str, Any]:
        """Generate AI summary for an article."""
        try:
            summary_data = await self.analysis_agent.summarize_article(article_id, summary_type)
            if summary_data:
                return {
                    'success': True,
                    'summary': summary_data['summary_text'],
                    'summary_type': summary_type
                }
            return {'success': False, 'error': 'Failed to generate summary'}
        except Exception as e:
            logger.error(f"Error in generate_summary tool: {e}")
            return {'success': False, 'error': str(e)}

    async def _analyze_perspectives_tool(self, article_ids: List[int], focus: str = "the main topic") -> Dict[str, Any]:
        """Analyze multiple perspectives across articles."""
        try:
            analysis_data = await self.analysis_agent.analyze_multiple_perspectives(article_ids, focus)
            if analysis_data and 'error' not in analysis_data:
                return {
                    'success': True,
                    'analysis': analysis_data['analysis_text'],
                    'articles_analyzed': analysis_data['articles_analyzed'],
                    'sources': analysis_data['source_diversity']
                }
            return {'success': False, 'error': analysis_data.get('error', 'Analysis failed')}
        except Exception as e:
            logger.error(f"Error in analyze_perspectives tool: {e}")
            return {'success': False, 'error': str(e)}

    async def _compare_articles_tool(self, article1_id: int, article2_id: int) -> Dict[str, Any]:
        """Compare two articles side-by-side."""
        try:
            comparison_data = await self.analysis_agent.compare_articles(article1_id, article2_id)
            if comparison_data:
                return {
                    'success': True,
                    'comparison': comparison_data['comparison_text']
                }
            return {'success': False, 'error': 'Comparison failed'}
        except Exception as e:
            logger.error(f"Error in compare_articles tool: {e}")
            return {'success': False, 'error': str(e)}

    async def _extract_topics_tool(self, article_ids: List[int]) -> Dict[str, Any]:
        """Extract key topics from multiple articles."""
        try:
            db = SessionLocal()
            articles = db.query(Article).filter(Article.id.in_(article_ids)).all()
            db.close()

            # Extract topics from titles and content
            topics = set()
            stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how'}

            for article in articles:
                # Extract from metadata if available
                if article.metadata and 'topic_keywords' in article.metadata:
                    topics.update(article.metadata['topic_keywords'])

                # Extract from title (simple keyword extraction)
                if article.title:
                    words = article.title.lower().split()
                    # Filter out stop words and short words, keep capitalized words from original title
                    title_words = article.title.split()
                    for i, word in enumerate(words):
                        clean_word = word.strip('.,!?;:"\'-')
                        # Keep words that are capitalized (likely proper nouns/topics) or longer keywords
                        if (clean_word not in stop_words and len(clean_word) > 3) or (title_words[i][0].isupper() and clean_word not in stop_words):
                            if title_words[i][0].isupper():
                                topics.add(title_words[i].strip('.,!?;:"\'-'))
                            elif len(clean_word) > 5:
                                topics.add(clean_word)

            # Create a summary with article titles
            article_list = [{'id': a.id, 'title': a.title, 'source': a.source} for a in articles]

            return {
                'success': True,
                'topics': list(topics)[:10],  # Return top 10 topics
                'article_count': len(articles),
                'articles': article_list
            }
        except Exception as e:
            logger.error(f"Error in extract_topics tool: {e}")
            return {'success': False, 'error': str(e)}

    async def _get_trending_tool(self, hours_back: int = 24) -> Dict[str, Any]:
        """Get trending topics from recent articles."""
        try:
            trending_data = await self.analysis_agent.analyze_trending_topics(hours_back)
            if trending_data and 'error' not in trending_data:
                return {
                    'success': True,
                    'analysis': trending_data['analysis_text'],
                    'article_count': trending_data['article_count'],
                    'period': trending_data['analysis_period'],
                    'article_ids': trending_data.get('article_ids', [])
                }
            return {'success': False, 'error': trending_data.get('error', 'Trending analysis failed')}
        except Exception as e:
            logger.error(f"Error in get_trending tool: {e}")
            return {'success': False, 'error': str(e)}

    async def _categorize_bias_tool(self, article_ids: List[int]) -> Dict[str, Any]:
        """Categorize articles by political bias/leaning."""
        try:
            db = SessionLocal()
            articles = db.query(Article).filter(Article.id.in_(article_ids)).all()
            db.close()

            # Simple bias categorization based on source
            # This is a placeholder - real implementation would use NLP/ML
            bias_categories = {
                'left': [],
                'center': [],
                'right': [],
                'unknown': []
            }

            # Placeholder logic (would be replaced with actual bias detection)
            for article in articles:
                bias_categories['unknown'].append(article.id)

            return {
                'success': True,
                'categorized': bias_categories,
                'note': 'Bias detection is placeholder - would use ML model in production'
            }
        except Exception as e:
            logger.error(f"Error in categorize_bias tool: {e}")
            return {'success': False, 'error': str(e)}

    async def _get_by_timerange_tool(self, start_date: str, end_date: str, query: str = None) -> Dict[str, Any]:
        """Get articles within a specific time range."""
        try:
            db = SessionLocal()

            start_dt = datetime.fromisoformat(start_date)
            end_dt = datetime.fromisoformat(end_date)

            query_obj = db.query(Article).filter(
                Article.published_date >= start_dt,
                Article.published_date <= end_dt
            ).order_by(Article.published_date.desc())

            articles = query_obj.limit(100).all()
            db.close()

            return {
                'success': True,
                'articles': [
                    {
                        'id': article.id,
                        'title': article.title,
                        'source': article.source,
                        'published_date': article.published_date.isoformat()
                    }
                    for article in articles
                ],
                'count': len(articles)
            }
        except Exception as e:
            logger.error(f"Error in get_by_timerange tool: {e}")
            return {'success': False, 'error': str(e)}

    # ==================== PLAN-AND-EXECUTE LOGIC ====================

    async def create_plan(self, user_query: str) -> Dict[str, Any]:
        """
        Create an execution plan based on user query.

        Returns a structured plan with steps and estimated complexity.
        """
        if not self.llm:
            # Mock plan for testing without API key
            return {
                'plan': [
                    {'step': 1, 'action': 'search_articles', 'description': 'Search for relevant articles', 'params': {'query': user_query}},
                    {'step': 2, 'action': 'generate_summary', 'description': 'Generate summaries', 'params': {}},
                ],
                'estimated_time': '30 seconds',
                'query': user_query
            }

        planning_prompt = f"""You are a news research planning assistant. Create a step-by-step plan to answer this query:

Query: {user_query}

Available tools:
1. search_articles(query, limit) - Search for articles
2. get_article_details(article_id) - Get full article content
3. filter_by_source(article_ids, source_types) - Filter by source type
4. generate_summary(article_id, type) - Generate AI summary
5. analyze_perspectives(article_ids, focus) - Multi-perspective analysis
6. compare_articles(id1, id2) - Compare two articles
7. extract_topics(article_ids) - Extract key topics
8. get_trending(hours_back) - Get trending topics
9. categorize_bias(article_ids) - Detect political bias
10. get_by_timerange(start, end, query) - Time-bounded search

Create a JSON plan with these fields:
- steps: Array of {{step_number, tool_name, description, parameters}}
- estimated_time: Rough time estimate
- rationale: Why this plan will answer the query

Keep plans simple (3-5 steps max). Be efficient."""

        try:
            response = await asyncio.to_thread(
                self.llm.invoke,
                [HumanMessage(content=planning_prompt)]
            )

            # Parse the plan from LLM response
            # For now, return a structured mock plan
            # In production, would parse JSON from LLM

            return {
                'plan': self._parse_plan_from_response(response.content, user_query),
                'estimated_time': '30-60 seconds',
                'query': user_query,
                'rationale': 'Plan created based on query analysis'
            }

        except Exception as e:
            logger.error(f"Error creating plan: {e}")
            return {
                'error': str(e),
                'fallback_plan': self._create_fallback_plan(user_query)
            }

    def _parse_plan_from_response(self, response_text: str, query: str) -> List[Dict[str, Any]]:
        """Parse plan from LLM response."""
        import json
        import re

        try:
            # Try to extract JSON from the response
            # LLM might wrap it in markdown code blocks or add explanation
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # Try to find raw JSON object
                json_match = re.search(r'\{.*"steps".*\}', response_text, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                else:
                    # No JSON found, create query-specific plan
                    return self._create_intelligent_plan(query)

            # Parse the JSON
            plan_data = json.loads(json_str)
            steps = plan_data.get('steps', [])

            # Validate and normalize steps
            normalized_steps = []
            for i, step in enumerate(steps):
                params = step.get('parameters', step.get('params', {}))

                # Remove placeholder strings like "results_from_step_2"
                # These will be filled in during execution from accumulated_data
                cleaned_params = {}
                for key, value in params.items():
                    if isinstance(value, str) and 'results_from_step' in value.lower():
                        # Skip this parameter - it will be injected during execution
                        continue
                    cleaned_params[key] = value

                normalized_steps.append({
                    'step': i + 1,
                    'tool': step.get('tool_name', step.get('tool', 'search_articles')),
                    'description': step.get('description', ''),
                    'params': cleaned_params
                })

            return normalized_steps if normalized_steps else self._create_intelligent_plan(query)

        except (json.JSONDecodeError, Exception) as e:
            logger.warning(f"Failed to parse LLM plan: {e}. Creating intelligent fallback.")
            return self._create_intelligent_plan(query)

    def _create_intelligent_plan(self, query: str) -> List[Dict[str, Any]]:
        """Create an intelligent plan based on query analysis."""
        query_lower = query.lower()
        plan = []
        step_num = 1

        # Detect query intent and create appropriate plan

        # Check for time range keywords (e.g., "past 5 days", "last week")
        import re
        time_match = re.search(r'(past|last)\s+(\d+)\s+(day|week|month|hour)s?', query_lower)
        if time_match:
            number = int(time_match.group(2))
            unit = time_match.group(3)

            # Calculate date range
            now = datetime.now(timezone.utc)
            if unit == 'hour':
                start_date = (now - timedelta(hours=number)).isoformat()
            elif unit == 'day':
                start_date = (now - timedelta(days=number)).isoformat()
            elif unit == 'week':
                start_date = (now - timedelta(weeks=number)).isoformat()
            elif unit == 'month':
                start_date = (now - timedelta(days=number * 30)).isoformat()

            plan.append({
                'step': step_num,
                'tool': 'get_by_timerange',
                'description': f'Get articles from past {number} {unit}{"s" if number > 1 else ""}',
                'params': {
                    'start_date': start_date,
                    'end_date': now.isoformat(),
                    'query': query
                }
            })
            step_num += 1
        # Check for trending/recent keywords
        elif any(word in query_lower for word in ['trending', 'recent', 'latest', 'this week', 'this month']):
            plan.append({
                'step': step_num,
                'tool': 'get_trending',
                'description': 'Analyze trending topics from recent articles',
                'params': {'hours_back': 168 if 'week' in query_lower else 720}  # 1 week or 1 month
            })
            step_num += 1
        # Default: search
        else:
            plan.append({
                'step': step_num,
                'tool': 'search_articles',
                'description': f'Search for articles about: {query}',
                'params': {'query': query, 'limit': 10}
            })
            step_num += 1

        # Check for perspective/bias analysis keywords
        if any(word in query_lower for word in ['perspective', 'bias', 'viewpoint', 'political', 'compare sources', 'different views']):
            plan.append({
                'step': step_num,
                'tool': 'analyze_perspectives',
                'description': 'Analyze different perspectives from found articles',
                'params': {'focus': query}
            })
            step_num += 1

        # Check for comparison keywords
        if any(word in query_lower for word in ['compare', 'difference', 'versus', 'vs']):
            plan.append({
                'step': step_num,
                'tool': 'compare_articles',
                'description': 'Compare articles from different sources',
                'params': {}
            })
            step_num += 1

        # Check for summary keywords
        if any(word in query_lower for word in ['summarize', 'summary', 'summaries', 'key points']):
            plan.append({
                'step': step_num,
                'tool': 'generate_summary',
                'description': 'Generate AI summaries of key articles',
                'params': {'summary_type': 'comprehensive'}
            })
            step_num += 1

        # Check for source filtering keywords (substack, techcrunch, etc.)
        source_keywords = ['substack', 'techcrunch', 'ars technica', 'wired', 'verge']
        detected_sources = [source for source in source_keywords if source in query_lower]
        if detected_sources:
            plan.append({
                'step': step_num,
                'tool': 'filter_by_source',
                'description': f'Filter to {", ".join(detected_sources)} sources',
                'params': {'source_types': detected_sources}
            })
            step_num += 1

        # Check for topic extraction keywords
        if any(word in query_lower for word in ['topics', 'themes', 'what are', 'top']):
            plan.append({
                'step': step_num,
                'tool': 'extract_topics',
                'description': 'Extract key topics and themes',
                'params': {}
            })
            step_num += 1

        # If no specific operations were detected, add a default analysis step
        if len(plan) == 1:  # Only search step
            plan.append({
                'step': step_num,
                'tool': 'analyze_perspectives',
                'description': 'Analyze the found articles',
                'params': {'focus': query}
            })

        return plan

    def _create_fallback_plan(self, query: str) -> List[Dict[str, Any]]:
        """Create a simple fallback plan if planning fails."""
        return self._create_intelligent_plan(query)

    async def execute_plan(self, plan: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a plan step-by-step.

        Returns execution results with status updates for each step.
        """
        steps = plan.get('plan', plan.get('fallback_plan', []))
        execution_results = []
        accumulated_data = {}  # Store data from previous steps

        for step_info in steps:
            step_num = step_info['step']
            tool_name = step_info['tool']
            params = step_info.get('params', {})

            logger.info(f"Executing step {step_num}: {tool_name}")

            try:
                # Execute the tool
                tool_func = self.tools.get(tool_name)
                if not tool_func:
                    execution_results.append({
                        'step': step_num,
                        'tool': tool_name,
                        'status': 'error',
                        'error': f'Unknown tool: {tool_name}'
                    })
                    continue

                # Fix parameter names for get_by_timerange
                if tool_name == 'get_by_timerange':
                    if 'start' in params:
                        params['start_date'] = params.pop('start')
                    if 'end' in params:
                        params['end_date'] = params.pop('end')

                # Fix parameter names for generate_summary
                if tool_name == 'generate_summary':
                    if 'type' in params:
                        params['summary_type'] = params.pop('type')

                    # Convert relative time strings to ISO dates
                    def parse_relative_time(time_str: str) -> str:
                        """Parse relative time strings like '5 days ago', '48_hours_ago', 'now'"""
                        time_str = time_str.lower().strip()

                        if time_str == 'now':
                            return datetime.now(timezone.utc).isoformat()

                        # Handle formats like "5 days ago", "3 weeks ago", "48 hours ago"
                        import re
                        match = re.match(r'(\d+)\s*(hour|day|week|month)s?\s*ago', time_str)
                        if match:
                            number = int(match.group(1))
                            unit = match.group(2)

                            if unit == 'hour':
                                delta = timedelta(hours=number)
                            elif unit == 'day':
                                delta = timedelta(days=number)
                            elif unit == 'week':
                                delta = timedelta(weeks=number)
                            elif unit == 'month':
                                delta = timedelta(days=number * 30)  # Approximate

                            return (datetime.now(timezone.utc) - delta).isoformat()

                        # Handle format like "48_hours_ago"
                        match = re.match(r'(\d+)_hours_ago', time_str)
                        if match:
                            hours = int(match.group(1))
                            return (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()

                        # If already ISO format or other format, return as-is
                        return time_str

                    if 'start_date' in params and isinstance(params['start_date'], str):
                        params['start_date'] = parse_relative_time(params['start_date'])
                    if 'end_date' in params and isinstance(params['end_date'], str):
                        params['end_date'] = parse_relative_time(params['end_date'])

                # Inject accumulated data if needed
                if tool_name == 'analyze_perspectives' and 'article_ids' not in params:
                    # Use article IDs from previous search
                    if 'search_results' in accumulated_data:
                        params['article_ids'] = [r['article_id'] for r in accumulated_data['search_results'][:5]]
                    elif 'article_ids' in accumulated_data:
                        params['article_ids'] = accumulated_data['article_ids'][:5]

                if tool_name == 'filter_by_source' and 'article_ids' not in params:
                    # Use article IDs from previous get_by_timerange or search
                    if 'timerange_articles' in accumulated_data:
                        params['article_ids'] = [a['id'] for a in accumulated_data['timerange_articles']]
                    elif 'search_results' in accumulated_data:
                        params['article_ids'] = [r['article_id'] for r in accumulated_data['search_results']]
                    elif 'article_ids' in accumulated_data:
                        params['article_ids'] = accumulated_data['article_ids']

                if tool_name == 'extract_topics' and 'article_ids' not in params:
                    # Use article IDs from previous filter_by_source, search, or timerange
                    if 'filtered_article_ids' in accumulated_data:
                        params['article_ids'] = accumulated_data['filtered_article_ids']
                    elif 'timerange_articles' in accumulated_data:
                        params['article_ids'] = [a['id'] for a in accumulated_data['timerange_articles']]
                    elif 'search_results' in accumulated_data:
                        params['article_ids'] = [r['article_id'] for r in accumulated_data['search_results']]
                    elif 'article_ids' in accumulated_data:
                        params['article_ids'] = accumulated_data['article_ids']

                if tool_name == 'generate_summary' and 'article_id' not in params:
                    # Use first article ID from previous search or timerange
                    if 'search_results' in accumulated_data and accumulated_data['search_results']:
                        params['article_id'] = accumulated_data['search_results'][0]['article_id']
                    elif 'timerange_articles' in accumulated_data and accumulated_data['timerange_articles']:
                        params['article_id'] = accumulated_data['timerange_articles'][0]['id']
                    elif 'filtered_article_ids' in accumulated_data and accumulated_data['filtered_article_ids']:
                        params['article_id'] = accumulated_data['filtered_article_ids'][0]
                    elif 'article_ids' in accumulated_data and accumulated_data['article_ids']:
                        params['article_id'] = accumulated_data['article_ids'][0]

                result = await tool_func(**params)

                # Store successful results for next steps
                if result.get('success'):
                    if tool_name == 'search_articles':
                        accumulated_data['search_results'] = result.get('results', [])
                    elif tool_name == 'get_by_timerange':
                        accumulated_data['timerange_articles'] = result.get('articles', [])
                        accumulated_data['article_ids'] = [a['id'] for a in result.get('articles', [])]
                    elif tool_name == 'get_trending':
                        accumulated_data['article_ids'] = result.get('article_ids', [])
                    elif tool_name == 'filter_by_source':
                        # Extract all article IDs from categorized results
                        categorized = result.get('categorized', {})
                        filtered_ids = []
                        for source_type, ids in categorized.items():
                            filtered_ids.extend(ids)
                        accumulated_data['filtered_article_ids'] = filtered_ids
                        accumulated_data['article_ids'] = filtered_ids

                execution_results.append({
                    'step': step_num,
                    'tool': tool_name,
                    'description': step_info['description'],
                    'status': 'success' if result.get('success') else 'error',
                    'result': result,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                })

            except Exception as e:
                logger.error(f"Error executing step {step_num}: {e}")
                execution_results.append({
                    'step': step_num,
                    'tool': tool_name,
                    'status': 'error',
                    'error': str(e)
                })

        return {
            'execution_results': execution_results,
            'completed_steps': len([r for r in execution_results if r['status'] == 'success']),
            'total_steps': len(steps),
            'final_data': accumulated_data
        }

    async def _synthesize_final_answer(self, user_query: str, execution_result: Dict[str, Any]) -> str:
        """
        Synthesize a final answer from execution results.

        Args:
            user_query: Original user query
            execution_result: Results from plan execution

        Returns:
            Final synthesized answer
        """
        try:
            logger.info("Starting final answer synthesis")
            # Gather all execution results
            results_summary = []
            for result in execution_result.get('execution_results', []):
                if result['status'] == 'success':
                    tool = result['tool']
                    data = result['result']

                    # Format based on tool type
                    if tool == 'get_trending':
                        results_summary.append(f"Trending Analysis: {data.get('analysis', '')}")
                    elif tool == 'extract_topics':
                        topics = data.get('topics', [])
                        results_summary.append(f"Extracted Topics: {', '.join(topics)}")
                    elif tool == 'search_articles':
                        count = data.get('count', 0)
                        results = data.get('results', [])
                        articles_list = "\n".join([f"  - {r.get('title', 'Untitled')} (ID: {r.get('article_id')})" for r in results[:10]])
                        results_summary.append(f"Found {count} relevant articles:\n{articles_list}")
                    elif tool == 'get_by_timerange':
                        count = data.get('count', 0)
                        articles = data.get('articles', [])
                        articles_list = "\n".join([f"  - {a.get('title', 'Untitled')} (ID: {a.get('id')})" for a in articles[:10]])
                        results_summary.append(f"Found {count} articles in time range:\n{articles_list}")
                    elif tool == 'filter_by_source':
                        total = data.get('total_filtered', 0)
                        results_summary.append(f"Filtered to {total} articles from specified sources")
                    elif tool == 'generate_summary':
                        summary = data.get('summary', 'No summary available')
                        results_summary.append(f"Article Summary: {summary}")

            logger.info(f"Collected {len(results_summary)} result summaries for synthesis")

            # Use LLM to synthesize final answer
            synthesis_prompt = f"""Based on the research results below, provide a direct, concise answer to this question:

Question: {user_query}

Research Results:
{chr(10).join(results_summary)}

Provide a clear, focused answer that directly addresses the question. If the question asks for a specific number of items (e.g., "top 3"), limit your answer to exactly that many items."""

            logger.info("Invoking LLM for final answer synthesis")
            final_answer = await asyncio.to_thread(
                self.analysis_agent.llm.invoke,
                synthesis_prompt
            )

            answer_text = final_answer.content if hasattr(final_answer, 'content') else str(final_answer)
            logger.info(f"Final answer synthesized: {len(answer_text)} characters")
            return answer_text

        except Exception as e:
            logger.error(f"Error synthesizing final answer: {e}", exc_info=True)
            return "Unable to synthesize final answer from research results."

    async def research(self, user_query: str) -> Dict[str, Any]:
        """
        Main entry point: Create plan and execute research.

        Args:
            user_query: Natural language research query

        Returns:
            Complete research results with plan and execution details
        """
        logger.info(f"Starting research for query: {user_query}")

        # Step 1: Create plan
        plan_result = await self.create_plan(user_query)

        # Step 2: Execute plan
        execution_result = await self.execute_plan(plan_result)

        # Step 3: Synthesize final answer
        final_answer = await self._synthesize_final_answer(user_query, execution_result)

        return {
            'query': user_query,
            'plan': plan_result,
            'execution': execution_result,
            'final_answer': final_answer,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }


# Global agent instance (singleton)
_research_agent = None


def get_research_agent() -> NewsResearchAgent:
    """Get the global research agent instance (singleton pattern)."""
    global _research_agent
    if _research_agent is None:
        _research_agent = NewsResearchAgent()
    return _research_agent
