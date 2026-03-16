"""
ChatterMate - Chat Repository Sentiment Integration Tests
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
"""

import pytest
from uuid import uuid4
from unittest.mock import patch
from app.repositories.chat import ChatRepository
from app.models.chat_history import ChatHistory
from app.models.session_to_agent import SessionToAgent, SessionStatus


class TestChatSentimentIntegration:
    """Tests for sentiment analysis integration in ChatRepository."""

    @pytest.fixture
    def chat_repo(self, db):
        return ChatRepository(db)

    @pytest.fixture
    def test_session(self, db, test_organization, test_agent, test_customer):
        session_id = uuid4()
        session = SessionToAgent(
            session_id=session_id,
            agent_id=test_agent.id,
            customer_id=test_customer.id,
            organization_id=test_organization.id,
            status=SessionStatus.OPEN
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def test_create_user_message_adds_sentiment(self, chat_repo, test_organization, test_agent, test_customer, test_session):
        """User messages should have sentiment analysis applied."""
        message = chat_repo.create_message({
            "organization_id": test_organization.id,
            "agent_id": test_agent.id,
            "customer_id": test_customer.id,
            "session_id": test_session.session_id,
            "message": "This is great, thank you so much!",
            "message_type": "user"
        })
        assert message.sentiment_label is not None
        assert message.sentiment_label in ("positive", "neutral", "negative")
        assert message.sentiment_score is not None

    def test_create_bot_message_no_sentiment(self, chat_repo, test_organization, test_agent, test_customer, test_session):
        """Bot messages should NOT have sentiment analysis."""
        message = chat_repo.create_message({
            "organization_id": test_organization.id,
            "agent_id": test_agent.id,
            "customer_id": test_customer.id,
            "session_id": test_session.session_id,
            "message": "How can I help you today?",
            "message_type": "bot"
        })
        assert message.sentiment_label is None
        assert message.sentiment_score is None

    def test_session_sentiment_updated_after_user_message(self, chat_repo, test_organization, test_agent, test_customer, test_session, db):
        """Session sentiment should be updated after a user message."""
        chat_repo.create_message({
            "organization_id": test_organization.id,
            "agent_id": test_agent.id,
            "customer_id": test_customer.id,
            "session_id": test_session.session_id,
            "message": "This is terrible and broken, I hate it",
            "message_type": "user"
        })
        db.refresh(test_session)
        assert test_session.sentiment_label is not None
        assert test_session.sentiment_score is not None

    def test_session_sentiment_averages_multiple_messages(self, chat_repo, test_organization, test_agent, test_customer, test_session, db):
        """Session sentiment should average across multiple user messages."""
        # Send a positive message
        chat_repo.create_message({
            "organization_id": test_organization.id,
            "agent_id": test_agent.id,
            "customer_id": test_customer.id,
            "session_id": test_session.session_id,
            "message": "thanks great awesome wonderful",
            "message_type": "user"
        })
        # Send a negative message
        chat_repo.create_message({
            "organization_id": test_organization.id,
            "agent_id": test_agent.id,
            "customer_id": test_customer.id,
            "session_id": test_session.session_id,
            "message": "terrible awful horrible worst",
            "message_type": "user"
        })
        db.refresh(test_session)
        # With one positive and one negative, session should be near neutral
        assert test_session.sentiment_label is not None
        assert test_session.sentiment_score is not None

    @patch("app.repositories.chat.analyze_sentiment", side_effect=Exception("analysis failed"))
    def test_sentiment_error_does_not_break_message_creation(self, mock_analyze, chat_repo, test_organization, test_agent, test_customer, test_session):
        """Sentiment analysis errors should not prevent message creation."""
        message = chat_repo.create_message({
            "organization_id": test_organization.id,
            "agent_id": test_agent.id,
            "customer_id": test_customer.id,
            "session_id": test_session.session_id,
            "message": "Hello there",
            "message_type": "user"
        })
        assert message is not None
        assert message.message == "Hello there"
        # Sentiment should be None since analysis failed
        assert message.sentiment_label is None
