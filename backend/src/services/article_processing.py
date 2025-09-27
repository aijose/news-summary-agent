"""
Article Processing and Validation Service for News Summary Agent.

This module handles article content validation, processing, analysis,
and quality assessment for the news aggregation pipeline.
"""

import re
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone
import asyncio
from urllib.parse import urlparse
import string
from collections import Counter

from ..database import SessionLocal, Article
from ..config import settings

logger = logging.getLogger(__name__)


class ArticleProcessor:
    """
    Service for processing and validating news articles.

    Handles content validation, quality assessment, metadata extraction,
    and content enrichment for news articles.
    """

    def __init__(self):
        self.min_content_length = 100
        self.max_content_length = 50000
        self.min_title_length = 10
        self.max_title_length = 500

        # Quality thresholds
        self.min_readability_score = 30
        self.min_content_quality_score = 0.6

        # Language patterns (basic English detection)
        self.english_words = {
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
            'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
        }

    def validate_article_basic(self, article_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Perform basic validation on article data.

        Args:
            article_data: Article data dictionary

        Returns:
            Tuple of (is_valid, error_messages)
        """
        errors = []

        # Check required fields
        required_fields = ['title', 'content', 'url', 'source']
        for field in required_fields:
            if not article_data.get(field):
                errors.append(f"Missing required field: {field}")

        if errors:
            return False, errors

        # Validate title
        title = article_data['title'].strip()
        if len(title) < self.min_title_length:
            errors.append(f"Title too short: {len(title)} < {self.min_title_length}")
        elif len(title) > self.max_title_length:
            errors.append(f"Title too long: {len(title)} > {self.max_title_length}")

        # Validate content length
        content = article_data['content'].strip()
        if len(content) < self.min_content_length:
            errors.append(f"Content too short: {len(content)} < {self.min_content_length}")
        elif len(content) > self.max_content_length:
            errors.append(f"Content too long: {len(content)} > {self.max_content_length}")

        # Validate URL format
        try:
            parsed_url = urlparse(article_data['url'])
            if not parsed_url.scheme or not parsed_url.netloc:
                errors.append("Invalid URL format")
        except Exception:
            errors.append("Invalid URL format")

        # Check for spam indicators
        spam_check = self.detect_spam_content(title, content)
        if spam_check['is_spam']:
            errors.extend(spam_check['reasons'])

        return len(errors) == 0, errors

    def detect_spam_content(self, title: str, content: str) -> Dict[str, Any]:
        """
        Detect potential spam or low-quality content.

        Args:
            title: Article title
            content: Article content

        Returns:
            Dictionary with spam detection results
        """
        is_spam = False
        reasons = []

        # Check for excessive capitalization
        title_caps_ratio = sum(1 for c in title if c.isupper()) / len(title) if title else 0
        if title_caps_ratio > 0.7:
            is_spam = True
            reasons.append("Excessive capitalization in title")

        # Check for excessive punctuation
        punct_ratio = sum(1 for c in title if c in string.punctuation) / len(title) if title else 0
        if punct_ratio > 0.3:
            is_spam = True
            reasons.append("Excessive punctuation in title")

        # Check for repetitive content
        if self.is_repetitive_content(content):
            is_spam = True
            reasons.append("Repetitive content detected")

        # Check for promotional keywords
        promotional_keywords = [
            'click here', 'buy now', 'limited time', 'act now', 'free money',
            'make money fast', 'get rich', 'work from home', 'lose weight fast'
        ]

        combined_text = (title + ' ' + content).lower()
        for keyword in promotional_keywords:
            if keyword in combined_text:
                is_spam = True
                reasons.append(f"Promotional content detected: '{keyword}'")
                break

        return {
            'is_spam': is_spam,
            'reasons': reasons,
            'title_caps_ratio': title_caps_ratio,
            'punct_ratio': punct_ratio
        }

    def is_repetitive_content(self, content: str) -> bool:
        """
        Check if content is repetitive or low quality.

        Args:
            content: Article content

        Returns:
            True if content appears repetitive
        """
        if len(content) < 100:
            return False

        # Split into sentences
        sentences = re.split(r'[.!?]+', content)
        if len(sentences) < 3:
            return False

        # Check for repeated sentences
        sentence_counts = Counter(s.strip().lower() for s in sentences if len(s.strip()) > 10)

        # If any sentence appears more than 3 times, it's likely repetitive
        for count in sentence_counts.values():
            if count > 3:
                return True

        # Check for very similar sentences (basic approach)
        unique_sentences = set()
        for sentence in sentences:
            s = sentence.strip().lower()
            if len(s) > 10:
                # Simple similarity check based on first few words
                words = s.split()[:5]
                key = ' '.join(words)
                if key in unique_sentences:
                    return True
                unique_sentences.add(key)

        return False

    def assess_content_quality(self, article_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Assess the overall quality of article content.

        Args:
            article_data: Article data dictionary

        Returns:
            Quality assessment results
        """
        title = article_data.get('title', '')
        content = article_data.get('content', '')

        quality_score = 1.0
        factors = {}

        # Language detection (basic English check)
        lang_score = self.detect_language_quality(content)
        factors['language_score'] = lang_score
        quality_score *= lang_score

        # Readability assessment
        readability = self.assess_readability(content)
        factors['readability'] = readability
        quality_score *= min(readability / 100, 1.0)

        # Content structure assessment
        structure_score = self.assess_content_structure(content)
        factors['structure_score'] = structure_score
        quality_score *= structure_score

        # Title quality
        title_score = self.assess_title_quality(title, content)
        factors['title_score'] = title_score
        quality_score *= title_score

        # Information density
        info_density = self.assess_information_density(content)
        factors['information_density'] = info_density
        quality_score *= info_density

        return {
            'overall_score': round(quality_score, 3),
            'is_high_quality': quality_score >= self.min_content_quality_score,
            'factors': factors,
            'recommendations': self.generate_quality_recommendations(factors)
        }

    def detect_language_quality(self, content: str) -> float:
        """
        Basic English language quality detection.

        Args:
            content: Article content

        Returns:
            Language quality score (0-1)
        """
        if not content:
            return 0.0

        words = re.findall(r'\b\w+\b', content.lower())
        if len(words) < 10:
            return 0.5

        # Count common English words
        english_count = sum(1 for word in words if word in self.english_words)
        english_ratio = english_count / len(words)

        # Basic score based on English word ratio
        if english_ratio >= 0.3:
            return min(english_ratio * 2, 1.0)
        else:
            return 0.3

    def assess_readability(self, content: str) -> float:
        """
        Simple readability assessment based on sentence and word structure.

        Args:
            content: Article content

        Returns:
            Readability score (0-100, higher is more readable)
        """
        if not content:
            return 0.0

        sentences = re.split(r'[.!?]+', content)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 5]

        if not sentences:
            return 0.0

        words = re.findall(r'\b\w+\b', content)
        if not words:
            return 0.0

        # Average sentence length
        avg_sentence_length = len(words) / len(sentences)

        # Average word length
        avg_word_length = sum(len(word) for word in words) / len(words)

        # Simple readability score (modified Flesch-like approach)
        # Ideal: 15-20 words per sentence, 4-6 characters per word
        sentence_score = max(0, 100 - abs(avg_sentence_length - 17.5) * 2)
        word_score = max(0, 100 - abs(avg_word_length - 5) * 10)

        readability_score = (sentence_score + word_score) / 2
        return max(min(readability_score, 100), 0)

    def assess_content_structure(self, content: str) -> float:
        """
        Assess content structure and organization.

        Args:
            content: Article content

        Returns:
            Structure quality score (0-1)
        """
        if not content:
            return 0.0

        score = 1.0

        # Check for paragraph structure
        paragraphs = content.split('\n\n')
        if len(paragraphs) < 2:
            score *= 0.8

        # Check for varied sentence lengths
        sentences = re.split(r'[.!?]+', content)
        sentence_lengths = [len(s.split()) for s in sentences if len(s.strip()) > 5]

        if sentence_lengths:
            length_variance = len(set(sentence_lengths)) / len(sentence_lengths)
            score *= min(length_variance * 2, 1.0)

        # Check for punctuation variety
        punct_types = set(c for c in content if c in '.!?,:;')
        if len(punct_types) >= 3:
            score *= 1.1
        elif len(punct_types) < 2:
            score *= 0.9

        return min(score, 1.0)

    def assess_title_quality(self, title: str, content: str) -> float:
        """
        Assess title quality and relevance to content.

        Args:
            title: Article title
            content: Article content

        Returns:
            Title quality score (0-1)
        """
        if not title or not content:
            return 0.0

        score = 1.0

        # Title length assessment
        title_length = len(title.split())
        if 5 <= title_length <= 15:
            score *= 1.0
        elif title_length < 5:
            score *= 0.7
        else:
            score *= 0.8

        # Title-content relevance (basic keyword overlap)
        title_words = set(re.findall(r'\b\w+\b', title.lower()))
        content_words = set(re.findall(r'\b\w+\b', content.lower()[:500]))  # First 500 chars

        common_words = title_words & content_words
        if title_words and len(common_words) / len(title_words) >= 0.3:
            score *= 1.1
        else:
            score *= 0.9

        # Check for clickbait indicators
        clickbait_patterns = [
            r'\b(you won\'t believe|shocking|amazing|incredible)\b',
            r'\b\d+\s+(things|ways|reasons|secrets)\b',
            r'\bthis\s+will\s+(shock|amaze|surprise)\b'
        ]

        for pattern in clickbait_patterns:
            if re.search(pattern, title, re.IGNORECASE):
                score *= 0.8
                break

        return min(score, 1.0)

    def assess_information_density(self, content: str) -> float:
        """
        Assess information density and value of content.

        Args:
            content: Article content

        Returns:
            Information density score (0-1)
        """
        if not content:
            return 0.0

        # Check for presence of numbers, dates, names (information indicators)
        info_patterns = [
            r'\b\d{4}\b',  # Years
            r'\b\d+%\b',   # Percentages
            r'\b\$\d+\b',  # Dollar amounts
            r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b',  # Proper names
            r'\b(said|according to|reported|announced)\b'  # Attribution
        ]

        info_count = 0
        for pattern in info_patterns:
            info_count += len(re.findall(pattern, content))

        # Normalize by content length (per 100 words)
        words = re.findall(r'\b\w+\b', content)
        if not words:
            return 0.0

        density = (info_count / len(words)) * 100
        return min(density / 5, 1.0)  # Scale to 0-1

    def generate_quality_recommendations(self, factors: Dict[str, float]) -> List[str]:
        """
        Generate recommendations for improving content quality.

        Args:
            factors: Quality assessment factors

        Returns:
            List of improvement recommendations
        """
        recommendations = []

        if factors.get('language_score', 1) < 0.7:
            recommendations.append("Consider improving language clarity and grammar")

        if factors.get('readability', 100) < 50:
            recommendations.append("Improve readability by using shorter sentences and simpler words")

        if factors.get('structure_score', 1) < 0.7:
            recommendations.append("Enhance content structure with better paragraph organization")

        if factors.get('title_score', 1) < 0.7:
            recommendations.append("Consider a more descriptive and relevant title")

        if factors.get('information_density', 1) < 0.5:
            recommendations.append("Add more specific details, facts, or supporting information")

        return recommendations

    def extract_article_metadata(self, article_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract and enrich article metadata.

        Args:
            article_data: Article data dictionary

        Returns:
            Enhanced metadata dictionary
        """
        content = article_data.get('content', '')
        title = article_data.get('title', '')

        metadata = article_data.get('metadata', {})

        # Add processing metadata
        metadata.update({
            'processed_at': datetime.now(timezone.utc).isoformat(),
            'word_count': len(re.findall(r'\b\w+\b', content)),
            'character_count': len(content),
            'estimated_read_time': max(1, len(re.findall(r'\b\w+\b', content)) // 200),  # Assuming 200 WPM
            'content_type': self.classify_content_type(title, content),
            'topic_keywords': self.extract_topic_keywords(content),
            'quality_indicators': self.assess_content_quality(article_data)
        })

        return metadata

    def classify_content_type(self, title: str, content: str) -> str:
        """
        Classify the type of news content.

        Args:
            title: Article title
            content: Article content

        Returns:
            Content type classification
        """
        combined_text = (title + ' ' + content).lower()

        # Define patterns for different content types
        patterns = {
            'breaking_news': [r'\bbreaking\b', r'\burgent\b', r'\bjust in\b'],
            'analysis': [r'\banalysis\b', r'\bexplained\b', r'\bwhy\b', r'\bhow\b'],
            'opinion': [r'\bopinion\b', r'\bcommentary\b', r'\beditorial\b', r'\bi think\b'],
            'sports': [r'\bsports?\b', r'\bgame\b', r'\bmatch\b', r'\bteam\b', r'\bplayer\b'],
            'business': [r'\bbusiness\b', r'\beconomy?\b', r'\bmarket\b', r'\bstock\b'],
            'technology': [r'\btechnology?\b', r'\btech\b', r'\bsoftware\b', r'\bapp\b'],
            'politics': [r'\bpolitics?\b', r'\belection\b', r'\bgovernment\b', r'\bpolicy\b'],
            'health': [r'\bhealth\b', r'\bmedical\b', r'\bdoctor\b', r'\bpatient\b']
        }

        for content_type, type_patterns in patterns.items():
            for pattern in type_patterns:
                if re.search(pattern, combined_text):
                    return content_type

        return 'general'

    def extract_topic_keywords(self, content: str, max_keywords: int = 10) -> List[str]:
        """
        Extract topic keywords from content.

        Args:
            content: Article content
            max_keywords: Maximum number of keywords to return

        Returns:
            List of extracted keywords
        """
        if not content:
            return []

        # Simple keyword extraction based on word frequency
        words = re.findall(r'\b[a-zA-Z]{3,}\b', content.lower())

        # Filter out common stop words
        stop_words = {
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
            'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
            'said', 'says', 'also', 'more', 'new', 'one', 'two', 'first',
            'last', 'time', 'year', 'day', 'week', 'month', 'get', 'got',
            'make', 'made', 'take', 'took', 'see', 'saw', 'come', 'came'
        }

        filtered_words = [word for word in words if word not in stop_words and len(word) > 3]

        # Count word frequencies
        word_counts = Counter(filtered_words)

        # Return most common words
        return [word for word, count in word_counts.most_common(max_keywords)]

    async def process_article(self, article_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Complete article processing pipeline.

        Args:
            article_data: Raw article data

        Returns:
            Processed article data with validation results
        """
        processing_result = {
            'original_data': article_data,
            'is_valid': False,
            'validation_errors': [],
            'quality_assessment': None,
            'processed_metadata': None,
            'recommendations': []
        }

        try:
            # Basic validation
            is_valid, validation_errors = self.validate_article_basic(article_data)
            processing_result['is_valid'] = is_valid
            processing_result['validation_errors'] = validation_errors

            if not is_valid:
                return processing_result

            # Quality assessment
            quality_assessment = self.assess_content_quality(article_data)
            processing_result['quality_assessment'] = quality_assessment

            # Extract enhanced metadata
            enhanced_metadata = self.extract_article_metadata(article_data)
            processing_result['processed_metadata'] = enhanced_metadata

            # Update article data with enhanced metadata
            article_data['metadata'] = enhanced_metadata

            logger.info(f"Processed article: {article_data.get('title', 'Unknown')}")
            return processing_result

        except Exception as e:
            logger.error(f"Error processing article: {e}")
            processing_result['validation_errors'].append(f"Processing error: {str(e)}")
            return processing_result


# Global processor instance
_article_processor = None


def get_article_processor() -> ArticleProcessor:
    """
    Get the global article processor instance (singleton pattern).

    Returns:
        ArticleProcessor: Initialized article processor
    """
    global _article_processor
    if _article_processor is None:
        _article_processor = ArticleProcessor()
    return _article_processor


# Convenience functions
async def process_article_data(article_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process article data through validation and quality assessment."""
    processor = get_article_processor()
    return await processor.process_article(article_data)


def validate_article(article_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """Validate article data with basic checks."""
    processor = get_article_processor()
    return processor.validate_article_basic(article_data)