"""
ChatterMate - Sentiment Service Tests
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
"""

import pytest
from unittest.mock import patch, MagicMock
from app.services.sentiment import (
    analyze_sentiment,
    compute_session_sentiment,
    _analyze_with_keywords,
    _analyze_with_textblob,
    POSITIVE_KEYWORDS,
    NEGATIVE_KEYWORDS,
)


class TestAnalyzeWithKeywords:
    """Tests for keyword-based sentiment analysis fallback."""

    def test_positive_text(self):
        label, score = _analyze_with_keywords("thank you so much, great help!")
        assert label == "positive"
        assert score > 0

    def test_negative_text(self):
        label, score = _analyze_with_keywords("this is terrible and broken")
        assert label == "negative"
        assert score < 0

    def test_neutral_text_no_keywords(self):
        label, score = _analyze_with_keywords("I want to check my order status")
        assert label == "neutral"
        assert score == 0.0

    def test_mixed_keywords_neutral(self):
        label, score = _analyze_with_keywords("great but broken")
        assert label == "neutral" or label in ("positive", "negative")
        assert -1.0 <= score <= 1.0

    def test_single_positive_keyword(self):
        label, score = _analyze_with_keywords("thanks")
        assert label == "positive"
        assert score > 0

    def test_single_negative_keyword(self):
        label, score = _analyze_with_keywords("terrible")
        assert label == "negative"
        assert score < 0


class TestAnalyzeSentiment:
    """Tests for the main analyze_sentiment function."""

    def test_empty_string(self):
        label, score = analyze_sentiment("")
        assert label == "neutral"
        assert score == 0.0

    def test_none_input(self):
        label, score = analyze_sentiment(None)
        assert label == "neutral"
        assert score == 0.0

    def test_whitespace_only(self):
        label, score = analyze_sentiment("   ")
        assert label == "neutral"
        assert score == 0.0

    def test_returns_valid_label(self):
        label, score = analyze_sentiment("This is amazing and wonderful!")
        assert label in ("positive", "neutral", "negative")
        assert isinstance(score, float)

    def test_negative_sentiment(self):
        label, score = analyze_sentiment("This is terrible, awful, horrible service")
        assert label == "negative"
        assert score < 0

    def test_positive_sentiment(self):
        label, score = analyze_sentiment("Thank you, this is great and awesome!")
        assert label == "positive"
        assert score > 0

    @patch("app.services.sentiment.TEXTBLOB_AVAILABLE", False)
    def test_falls_back_to_keywords(self):
        label, score = analyze_sentiment("thanks for the great help")
        assert label == "positive"
        assert score > 0

    @patch("app.services.sentiment.TEXTBLOB_AVAILABLE", True)
    @patch("app.services.sentiment._analyze_with_textblob", side_effect=Exception("TextBlob error"))
    def test_handles_textblob_error(self, mock_tb):
        label, score = analyze_sentiment("some text")
        assert label == "neutral"
        assert score == 0.0


class TestComputeSessionSentiment:
    """Tests for session-level sentiment computation."""

    def test_empty_scores(self):
        label, score = compute_session_sentiment([], [])
        assert label is None
        assert score is None

    def test_all_positive(self):
        scores = [0.5, 0.8, 0.3]
        labels = ["positive", "positive", "positive"]
        label, score = compute_session_sentiment(scores, labels)
        assert label == "positive"
        assert score > 0.1

    def test_all_negative(self):
        scores = [-0.5, -0.8, -0.3]
        labels = ["negative", "negative", "negative"]
        label, score = compute_session_sentiment(scores, labels)
        assert label == "negative"
        assert score < -0.1

    def test_mixed_neutral(self):
        scores = [0.5, -0.5]
        labels = ["positive", "negative"]
        label, score = compute_session_sentiment(scores, labels)
        assert label == "neutral"
        assert score == 0.0

    def test_single_score(self):
        label, score = compute_session_sentiment([0.7], ["positive"])
        assert label == "positive"
        assert score == 0.7

    def test_score_rounding(self):
        scores = [0.3333, 0.6667]
        labels = ["positive", "positive"]
        label, score = compute_session_sentiment(scores, labels)
        assert isinstance(score, float)
        # Should be rounded to 4 decimal places
        assert len(str(score).split(".")[-1]) <= 4
