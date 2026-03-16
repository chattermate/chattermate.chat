"""
ChatterMate - Sentiment Analysis Service
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
"""

from typing import Tuple, List, Optional
from app.core.logger import get_logger

logger = get_logger(__name__)

# Try to import TextBlob, fall back to basic keyword analysis if unavailable
try:
    from textblob import TextBlob
    TEXTBLOB_AVAILABLE = True
except ImportError:
    TEXTBLOB_AVAILABLE = False
    logger.warning("TextBlob not installed. Using basic keyword-based sentiment analysis. "
                   "Install with: pip install textblob")


# Basic keyword lists for fallback sentiment analysis
POSITIVE_KEYWORDS = {
    'thank', 'thanks', 'great', 'awesome', 'excellent', 'good', 'love',
    'perfect', 'amazing', 'wonderful', 'helpful', 'appreciate', 'happy',
    'pleased', 'fantastic', 'brilliant', 'nice', 'best', 'super', 'cool',
    'resolved', 'fixed', 'works', 'working', 'solved'
}

NEGATIVE_KEYWORDS = {
    'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'angry',
    'frustrated', 'annoyed', 'disappointed', 'useless', 'broken', 'bug',
    'error', 'fail', 'failed', 'wrong', 'issue', 'problem', 'slow',
    'crash', 'crashed', 'stuck', 'ridiculous', 'unacceptable', 'poor',
    'waste', 'stupid', 'pathetic', 'sucks', 'rubbish'
}


def _analyze_with_textblob(text: str) -> Tuple[str, float]:
    """Analyze sentiment using TextBlob."""
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity  # -1.0 to 1.0

    if polarity > 0.1:
        label = "positive"
    elif polarity < -0.1:
        label = "negative"
    else:
        label = "neutral"

    return label, round(polarity, 4)


def _analyze_with_keywords(text: str) -> Tuple[str, float]:
    """Fallback keyword-based sentiment analysis."""
    words = set(text.lower().split())

    positive_count = len(words & POSITIVE_KEYWORDS)
    negative_count = len(words & NEGATIVE_KEYWORDS)

    total = positive_count + negative_count
    if total == 0:
        return "neutral", 0.0

    # Simple scoring: range from -1 to 1
    score = (positive_count - negative_count) / total

    if score > 0.1:
        label = "positive"
    elif score < -0.1:
        label = "negative"
    else:
        label = "neutral"

    return label, round(score, 4)


def analyze_sentiment(text: str) -> Tuple[str, float]:
    """
    Analyze the sentiment of a text message.

    Returns:
        Tuple of (sentiment_label, sentiment_score)
        - sentiment_label: 'positive', 'neutral', or 'negative'
        - sentiment_score: float from -1.0 (most negative) to 1.0 (most positive)
    """
    if not text or not text.strip():
        return "neutral", 0.0

    try:
        if TEXTBLOB_AVAILABLE:
            return _analyze_with_textblob(text)
        else:
            return _analyze_with_keywords(text)
    except Exception as e:
        logger.error(f"Error analyzing sentiment: {str(e)}")
        return "neutral", 0.0


def compute_session_sentiment(
    sentiment_scores: List[float],
    sentiment_labels: List[str]
) -> Tuple[Optional[str], Optional[float]]:
    """
    Compute the overall sentiment for a session from individual message sentiments.

    Args:
        sentiment_scores: List of sentiment scores from customer messages
        sentiment_labels: List of sentiment labels from customer messages

    Returns:
        Tuple of (overall_label, overall_score) or (None, None) if no data
    """
    if not sentiment_scores:
        return None, None

    avg_score = sum(sentiment_scores) / len(sentiment_scores)

    if avg_score > 0.1:
        label = "positive"
    elif avg_score < -0.1:
        label = "negative"
    else:
        label = "neutral"

    return label, round(avg_score, 4)
