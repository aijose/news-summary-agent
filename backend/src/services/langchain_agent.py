"""
LangChain Agent Service for News Summary Agent.

This module configures and manages LangChain agents for article analysis,
summarization, and intelligent news processing using Claude.
"""

import logging
from typing import List, Dict, Any, Optional, Union
import asyncio
from datetime import datetime, timezone

from langchain.agents import AgentType, initialize_agent
from langchain.memory import ConversationBufferMemory
from langchain.tools import Tool
from langchain.schema import BaseMessage, HumanMessage, AIMessage
from langchain_anthropic import ChatAnthropic
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.schema.runnable import RunnableSequence

from ..config import settings
from ..database import SessionLocal, Article, Summary
from .vector_store import get_vector_store

logger = logging.getLogger(__name__)


class NewsAnalysisAgent:
    """
    LangChain agent for intelligent news analysis and summarization.

    Provides high-level analysis, summarization, and contextual understanding
    of news articles using Claude and vector search capabilities.
    """

    def __init__(self):
        self.llm = None
        self.vector_store = get_vector_store()
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        self._initialize_llm()
        self._setup_tools()
        self._setup_chains()

    def _initialize_llm(self):
        """Initialize Claude LLM for analysis."""
        try:
            if not settings.ANTHROPIC_API_KEY or settings.ANTHROPIC_API_KEY == "your_claude_api_key_here":
                logger.warning("Anthropic API key not configured. Using mock responses.")
                self.llm = None
                return

            self.llm = ChatAnthropic(
                model="claude-3-sonnet-20240229",
                anthropic_api_key=settings.ANTHROPIC_API_KEY,
                temperature=0.1,
                max_tokens=4000
            )
            logger.info("Claude LLM initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Claude LLM: {e}")
            self.llm = None

    def _setup_tools(self):
        """Setup tools for the LangChain agent."""
        self.tools = [
            Tool(
                name="search_similar_articles",
                description="Search for articles similar to a given query or topic. Input should be a search query string.",
                func=self._search_similar_articles_tool
            ),
            Tool(
                name="get_article_by_id",
                description="Get full article content by database ID. Input should be an integer article ID.",
                func=self._get_article_by_id_tool
            ),
            Tool(
                name="analyze_article_quality",
                description="Analyze the quality and credibility of an article. Input should be article content or ID.",
                func=self._analyze_article_quality_tool
            ),
            Tool(
                name="extract_key_topics",
                description="Extract key topics and themes from article content. Input should be article content.",
                func=self._extract_key_topics_tool
            )
        ]

    def _setup_chains(self):
        """Setup LangChain chains for different analysis tasks."""

        # Article summarization chain
        self.summarization_prompt = PromptTemplate(
            input_variables=["article_title", "article_content", "summary_type"],
            template="""
            Analyze and summarize the following news article:

            Title: {article_title}
            Content: {article_content}

            Create a {summary_type} summary that includes:
            1. Main points and key information
            2. Important context and background
            3. Significance and implications
            4. Any notable quotes or data points

            Keep the summary clear, objective, and informative.

            Summary:
            """
        )

        # Topic analysis chain
        self.topic_analysis_prompt = PromptTemplate(
            input_variables=["articles_content"],
            template="""
            Analyze the following news articles and identify:

            Articles: {articles_content}

            Please provide:
            1. Main topics and themes
            2. Trending subjects
            3. Connections between stories
            4. Overall narrative or pattern
            5. Important developments to watch

            Analysis:
            """
        )

        # Article comparison chain
        self.comparison_prompt = PromptTemplate(
            input_variables=["article1", "article2"],
            template="""
            Compare these two news articles and provide analysis:

            Article 1: {article1}
            Article 2: {article2}

            Comparison should include:
            1. Similarities and differences in coverage
            2. Different perspectives or viewpoints
            3. Additional context in each article
            4. Credibility and source quality
            5. Recommendations for readers

            Comparison Analysis:
            """
        )

        # Multi-perspective analysis chain
        self.multi_perspective_prompt = PromptTemplate(
            input_variables=["articles_content", "analysis_focus"],
            template="""
            Analyze the following news articles from multiple perspectives on the topic: {analysis_focus}

            Articles:
            {articles_content}

            Provide a comprehensive multi-perspective analysis that includes:

            1. **Source Diversity Analysis**:
               - Different news sources and their typical editorial perspectives
               - Geographic and cultural viewpoints represented
               - Potential biases or limitations in coverage

            2. **Perspective Breakdown**:
               - Conservative/traditional viewpoint
               - Progressive/liberal viewpoint
               - Economic/business perspective
               - Social/humanitarian perspective
               - International/global perspective
               - Expert/technical perspective

            3. **Key Points of Convergence**:
               - Facts and claims that most sources agree on
               - Shared concerns or priorities across perspectives

            4. **Key Points of Divergence**:
               - Where sources disagree or emphasize different aspects
               - Conflicting interpretations or predictions
               - Different proposed solutions or responses

            5. **Missing Perspectives**:
               - Important viewpoints not represented in these articles
               - Stakeholder groups whose voices may be absent
               - Geographical or demographic gaps in coverage

            6. **Synthesis and Insights**:
               - Balanced understanding of the issue
               - Implications for different stakeholder groups
               - Recommended follow-up questions or areas for further investigation

            Format the response with clear headers and bullet points for easy reading.

            Multi-Perspective Analysis:
            """
        )

        if self.llm:
            self.summarization_chain = LLMChain(
                llm=self.llm,
                prompt=self.summarization_prompt,
                verbose=False
            )

            self.topic_analysis_chain = LLMChain(
                llm=self.llm,
                prompt=self.topic_analysis_prompt,
                verbose=False
            )

            self.comparison_chain = LLMChain(
                llm=self.llm,
                prompt=self.comparison_prompt,
                verbose=False
            )

            self.multi_perspective_chain = LLMChain(
                llm=self.llm,
                prompt=self.multi_perspective_prompt,
                verbose=False
            )

    def _search_similar_articles_tool(self, query: str) -> str:
        """Tool function for searching similar articles."""
        try:
            results = self.vector_store.search_similar_articles(query, limit=5)
            if not results:
                return "No similar articles found."

            formatted_results = []
            for result in results:
                formatted_results.append(
                    f"ID: {result['article_id']}, "
                    f"Title: {result['title']}, "
                    f"Source: {result['source']}, "
                    f"Similarity: {result['similarity_score']:.2f}"
                )

            return "Similar articles found:\n" + "\n".join(formatted_results)

        except Exception as e:
            logger.error(f"Error in search tool: {e}")
            return f"Error searching articles: {str(e)}"

    def _get_article_by_id_tool(self, article_id: str) -> str:
        """Tool function for getting article by ID."""
        try:
            article_id = int(article_id)
            db = SessionLocal()
            article = db.query(Article).filter(Article.id == article_id).first()
            db.close()

            if not article:
                return f"Article with ID {article_id} not found."

            return f"Title: {article.title}\nSource: {article.source}\nContent: {article.content[:1000]}..."

        except Exception as e:
            logger.error(f"Error in get article tool: {e}")
            return f"Error retrieving article: {str(e)}"

    def _analyze_article_quality_tool(self, content: str) -> str:
        """Tool function for analyzing article quality."""
        try:
            # This would integrate with the article processing service
            # For now, provide basic analysis
            word_count = len(content.split())

            quality_indicators = []
            if word_count > 300:
                quality_indicators.append("Substantial content length")
            if any(phrase in content.lower() for phrase in ["according to", "reports", "said"]):
                quality_indicators.append("Contains attribution")
            if any(char.isdigit() for char in content):
                quality_indicators.append("Contains specific data/numbers")

            return f"Quality Analysis:\n- Word count: {word_count}\n- Indicators: {', '.join(quality_indicators) if quality_indicators else 'Basic content'}"

        except Exception as e:
            logger.error(f"Error in quality analysis tool: {e}")
            return f"Error analyzing quality: {str(e)}"

    def _extract_key_topics_tool(self, content: str) -> str:
        """Tool function for extracting key topics."""
        try:
            # Simple keyword extraction (would be enhanced with NLP)
            import re
            from collections import Counter

            words = re.findall(r'\b[A-Z][a-z]+\b', content)
            common_words = Counter(words).most_common(10)

            topics = [word for word, count in common_words if count > 1]
            return f"Key topics identified: {', '.join(topics[:5])}"

        except Exception as e:
            logger.error(f"Error in topic extraction tool: {e}")
            return f"Error extracting topics: {str(e)}"

    async def summarize_article(
        self,
        article: Union[Article, int],
        summary_type: str = "comprehensive"
    ) -> Optional[Dict[str, Any]]:
        """
        Create an AI-powered summary of an article.

        Args:
            article: Article object or article ID
            summary_type: Type of summary (brief, comprehensive, analytical)

        Returns:
            Summary data dictionary
        """
        try:
            # Get article object if ID provided
            if isinstance(article, int):
                db = SessionLocal()
                article = db.query(Article).filter(Article.id == article).first()
                db.close()

                if not article:
                    logger.error(f"Article with ID {article} not found")
                    return None

            if not self.llm:
                # Return mock summary if LLM not available
                return {
                    'summary_text': f"Mock summary of '{article.title}'. This would contain an AI-generated summary.",
                    'summary_type': summary_type,
                    'key_points': ['Mock key point 1', 'Mock key point 2'],
                    'confidence_score': 0.8,
                    'generated_at': datetime.now(timezone.utc).isoformat()
                }

            # Generate summary using LangChain
            result = await asyncio.to_thread(
                self.summarization_chain.run,
                article_title=article.title,
                article_content=article.content,
                summary_type=summary_type
            )

            summary_data = {
                'summary_text': result,
                'summary_type': summary_type,
                'article_id': article.id,
                'generated_at': datetime.now(timezone.utc).isoformat(),
                'model_info': {
                    'model': 'claude-3-sonnet',
                    'temperature': 0.1
                }
            }

            # Save summary to database
            db = SessionLocal()
            summary = Summary(
                article_id=article.id,
                summary_text=result,
                summary_type=summary_type,
                word_count=len(result.split()),
                summary_metadata=summary_data
            )
            db.add(summary)
            db.commit()
            db.refresh(summary)
            db.close()

            summary_data['summary_id'] = summary.id
            logger.info(f"Generated {summary_type} summary for article {article.id}")
            return summary_data

        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            return None

    async def analyze_trending_topics(
        self,
        hours_back: int = 24,
        min_articles: int = 3
    ) -> Optional[Dict[str, Any]]:
        """
        Analyze trending topics from recent articles.

        Args:
            hours_back: Hours to look back for articles
            min_articles: Minimum articles needed for topic analysis

        Returns:
            Trending topics analysis
        """
        try:
            # Get recent articles
            db = SessionLocal()
            from datetime import timedelta
            cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours_back)

            recent_articles = db.query(Article).filter(
                Article.created_at >= cutoff_time
            ).limit(50).all()
            db.close()

            if len(recent_articles) < min_articles:
                return {
                    'error': f'Insufficient articles for analysis. Found {len(recent_articles)}, need {min_articles}'
                }

            if not self.llm:
                # Return mock analysis if LLM not available
                return {
                    'trending_topics': ['Mock Topic 1', 'Mock Topic 2', 'Mock Topic 3'],
                    'article_count': len(recent_articles),
                    'analysis_period': f'{hours_back} hours',
                    'generated_at': datetime.now(timezone.utc).isoformat()
                }

            # Prepare articles content for analysis
            articles_content = "\n\n".join([
                f"Title: {article.title}\nSource: {article.source}\nContent: {article.content[:500]}..."
                for article in recent_articles[:10]  # Limit to avoid token limits
            ])

            # Generate analysis
            result = await asyncio.to_thread(
                self.topic_analysis_chain.run,
                articles_content=articles_content
            )

            analysis_data = {
                'analysis_text': result,
                'article_count': len(recent_articles),
                'analysis_period': f'{hours_back} hours',
                'generated_at': datetime.now(timezone.utc).isoformat(),
                'model_info': {
                    'model': 'claude-3-sonnet',
                    'temperature': 0.1
                }
            }

            logger.info(f"Generated trending topics analysis from {len(recent_articles)} articles")
            return analysis_data

        except Exception as e:
            logger.error(f"Error analyzing trending topics: {e}")
            return None

    async def compare_articles(self, article1_id: int, article2_id: int) -> Optional[Dict[str, Any]]:
        """
        Compare two articles and provide analysis.

        Args:
            article1_id: First article ID
            article2_id: Second article ID

        Returns:
            Comparison analysis
        """
        try:
            db = SessionLocal()
            article1 = db.query(Article).filter(Article.id == article1_id).first()
            article2 = db.query(Article).filter(Article.id == article2_id).first()
            db.close()

            if not article1 or not article2:
                return {'error': 'One or both articles not found'}

            if not self.llm:
                # Return mock comparison if LLM not available
                return {
                    'comparison_text': f"Mock comparison between '{article1.title}' and '{article2.title}'",
                    'article1_id': article1_id,
                    'article2_id': article2_id,
                    'generated_at': datetime.now(timezone.utc).isoformat()
                }

            # Prepare article content for comparison
            article1_text = f"Title: {article1.title}\nSource: {article1.source}\nContent: {article1.content[:800]}..."
            article2_text = f"Title: {article2.title}\nSource: {article2.source}\nContent: {article2.content[:800]}..."

            # Generate comparison
            result = await asyncio.to_thread(
                self.comparison_chain.run,
                article1=article1_text,
                article2=article2_text
            )

            comparison_data = {
                'comparison_text': result,
                'article1_id': article1_id,
                'article2_id': article2_id,
                'article1_title': article1.title,
                'article2_title': article2.title,
                'generated_at': datetime.now(timezone.utc).isoformat(),
                'model_info': {
                    'model': 'claude-3-sonnet',
                    'temperature': 0.1
                }
            }

            logger.info(f"Generated comparison between articles {article1_id} and {article2_id}")
            return comparison_data

        except Exception as e:
            logger.error(f"Error comparing articles: {e}")
            return None

    async def analyze_multiple_perspectives(
        self,
        article_ids: List[int],
        analysis_focus: str = "the main topic"
    ) -> Optional[Dict[str, Any]]:
        """
        Analyze multiple articles from different perspectives on a topic.

        Args:
            article_ids: List of article IDs to analyze
            analysis_focus: The topic or focus area for the analysis

        Returns:
            Multi-perspective analysis data
        """
        try:
            if len(article_ids) > 10:
                return {'error': 'Maximum 10 articles allowed for multi-perspective analysis'}

            db = SessionLocal()
            articles = db.query(Article).filter(Article.id.in_(article_ids)).all()
            db.close()

            if len(articles) < 2:
                return {'error': 'Minimum 2 articles required for multi-perspective analysis'}

            if not self.llm:
                # Return mock analysis if LLM not available
                return {
                    'analysis_text': f"Mock multi-perspective analysis of {len(articles)} articles on {analysis_focus}",
                    'articles_analyzed': len(articles),
                    'analysis_focus': analysis_focus,
                    'source_diversity': ['Mock Source 1', 'Mock Source 2'],
                    'perspectives_covered': ['Conservative', 'Progressive', 'Economic', 'Social'],
                    'generated_at': datetime.now(timezone.utc).isoformat()
                }

            # Prepare articles content for analysis
            articles_content = "\n\n".join([
                f"Article {i+1}:\nTitle: {article.title}\nSource: {article.source}\nURL: {article.url}\nContent: {article.content[:1000]}..."
                for i, article in enumerate(articles)
            ])

            # Generate multi-perspective analysis
            result = await asyncio.to_thread(
                self.multi_perspective_chain.run,
                articles_content=articles_content,
                analysis_focus=analysis_focus
            )

            # Extract source diversity information
            sources = list(set([article.source for article in articles]))

            analysis_data = {
                'analysis_text': result,
                'articles_analyzed': len(articles),
                'analysis_focus': analysis_focus,
                'article_details': [
                    {
                        'id': article.id,
                        'title': article.title,
                        'source': article.source,
                        'url': article.url,
                        'published_date': article.published_date.isoformat() if article.published_date else None
                    }
                    for article in articles
                ],
                'source_diversity': sources,
                'generated_at': datetime.now(timezone.utc).isoformat(),
                'model_info': {
                    'model': 'claude-3-sonnet',
                    'temperature': 0.1
                }
            }

            logger.info(f"Generated multi-perspective analysis for {len(articles)} articles on '{analysis_focus}'")
            return analysis_data

        except Exception as e:
            logger.error(f"Error in multi-perspective analysis: {e}")
            return None

    async def search_and_summarize(self, query: str, max_results: int = 5) -> Dict[str, Any]:
        """
        Search for articles and provide summarized results.

        Args:
            query: Search query
            max_results: Maximum number of results

        Returns:
            Search results with summaries
        """
        try:
            # Search for similar articles
            search_results = self.vector_store.search_similar_articles(query, limit=max_results)

            if not search_results:
                return {
                    'query': query,
                    'results': [],
                    'message': 'No articles found matching the query'
                }

            # Enhance results with summaries if LLM available
            enhanced_results = []
            for result in search_results:
                enhanced_result = result.copy()

                if self.llm and result.get('article_id'):
                    summary = await self.summarize_article(result['article_id'], 'brief')
                    if summary:
                        enhanced_result['ai_summary'] = summary['summary_text']

                enhanced_results.append(enhanced_result)

            return {
                'query': query,
                'results': enhanced_results,
                'total_found': len(search_results)
            }

        except Exception as e:
            logger.error(f"Error in search and summarize: {e}")
            return {
                'query': query,
                'error': str(e),
                'results': []
            }


# Global agent instance
_news_agent = None


def get_news_agent() -> NewsAnalysisAgent:
    """
    Get the global news analysis agent instance (singleton pattern).

    Returns:
        NewsAnalysisAgent: Initialized news analysis agent
    """
    global _news_agent
    if _news_agent is None:
        _news_agent = NewsAnalysisAgent()
    return _news_agent


# Convenience functions
async def generate_article_summary(article_id: int, summary_type: str = "comprehensive") -> Optional[Dict[str, Any]]:
    """Generate summary for an article."""
    agent = get_news_agent()
    return await agent.summarize_article(article_id, summary_type)


async def analyze_trending_topics(hours_back: int = 24) -> Optional[Dict[str, Any]]:
    """Analyze trending topics from recent articles."""
    agent = get_news_agent()
    return await agent.analyze_trending_topics(hours_back)


async def search_articles_with_ai(query: str, max_results: int = 5) -> Dict[str, Any]:
    """Search articles and enhance with AI summaries."""
    agent = get_news_agent()
    return await agent.search_and_summarize(query, max_results)


async def analyze_multiple_perspectives(article_ids: List[int], analysis_focus: str = "the main topic") -> Optional[Dict[str, Any]]:
    """Generate multi-perspective analysis for multiple articles."""
    agent = get_news_agent()
    return await agent.analyze_multiple_perspectives(article_ids, analysis_focus)