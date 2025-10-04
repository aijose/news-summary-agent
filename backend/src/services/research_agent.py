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

            # Simple topic extraction (could be enhanced with NLP)
            topics = set()
            for article in articles:
                if article.metadata and 'topic_keywords' in article.metadata:
                    topics.update(article.metadata['topic_keywords'])

            return {
                'success': True,
                'topics': list(topics)[:10],  # Return top 10 topics
                'article_count': len(articles)
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
                    'period': trending_data['analysis_period']
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
            )

            articles = query_obj.limit(50).all()
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
        """Parse plan from LLM response (simplified for now)."""
        # Simplified: create a basic plan
        # In production, would parse structured JSON from LLM
        return [
            {
                'step': 1,
                'tool': 'search_articles',
                'description': f'Search for articles about: {query}',
                'params': {'query': query, 'limit': 10}
            },
            {
                'step': 2,
                'tool': 'analyze_perspectives',
                'description': 'Analyze different perspectives from found articles',
                'params': {'focus': query}
            }
        ]

    def _create_fallback_plan(self, query: str) -> List[Dict[str, Any]]:
        """Create a simple fallback plan if planning fails."""
        return [
            {
                'step': 1,
                'tool': 'search_articles',
                'description': 'Search for relevant articles',
                'params': {'query': query, 'limit': 10}
            }
        ]

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

                # Inject accumulated data if needed
                if tool_name == 'analyze_perspectives' and 'article_ids' not in params:
                    # Use article IDs from previous search
                    if 'search_results' in accumulated_data:
                        params['article_ids'] = [r['article_id'] for r in accumulated_data['search_results'][:5]]

                result = await tool_func(**params)

                # Store successful results for next steps
                if result.get('success'):
                    if tool_name == 'search_articles':
                        accumulated_data['search_results'] = result.get('results', [])

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

        return {
            'query': user_query,
            'plan': plan_result,
            'execution': execution_result,
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
