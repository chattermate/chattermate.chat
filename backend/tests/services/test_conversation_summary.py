"""
Tests for conversation summary service
"""

import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from uuid import uuid4
from datetime import datetime, timezone

from app.services.conversation_summary import (
    should_update_summary,
    _format_conversation,
    _generate_fallback_summary,
    MIN_MESSAGES_FOR_SUMMARY,
    NEW_MESSAGES_THRESHOLD,
)


class TestShouldUpdateSummary:
    """Tests for should_update_summary function."""

    def test_no_existing_summary_enough_messages(self):
        session = MagicMock()
        session.summary = None
        session.summary_message_count = None
        assert should_update_summary(session, MIN_MESSAGES_FOR_SUMMARY) is True

    def test_no_existing_summary_not_enough_messages(self):
        session = MagicMock()
        session.summary = None
        session.summary_message_count = None
        assert should_update_summary(session, MIN_MESSAGES_FOR_SUMMARY - 1) is False

    def test_existing_summary_enough_new_messages(self):
        session = MagicMock()
        session.summary = "Existing summary"
        session.summary_message_count = 5
        assert should_update_summary(session, 5 + NEW_MESSAGES_THRESHOLD) is True

    def test_existing_summary_not_enough_new_messages(self):
        session = MagicMock()
        session.summary = "Existing summary"
        session.summary_message_count = 5
        assert should_update_summary(session, 5 + NEW_MESSAGES_THRESHOLD - 1) is False

    def test_existing_summary_null_message_count(self):
        session = MagicMock()
        session.summary = "Existing summary"
        session.summary_message_count = None
        assert should_update_summary(session, MIN_MESSAGES_FOR_SUMMARY) is True


class TestFormatConversation:
    """Tests for _format_conversation helper."""

    def test_formats_messages_correctly(self):
        msg1 = MagicMock()
        msg1.message_type = 'user'
        msg1.message = 'Hello, I need help'

        msg2 = MagicMock()
        msg2.message_type = 'bot'
        msg2.message = 'Hi! How can I help you today?'

        msg3 = MagicMock()
        msg3.message_type = 'agent'
        msg3.message = 'Let me take over this conversation.'

        result = _format_conversation([msg1, msg2, msg3])
        assert 'Customer: Hello, I need help' in result
        assert 'AI Agent: Hi! How can I help you today?' in result
        assert 'Human Agent: Let me take over this conversation.' in result

    def test_truncates_long_messages(self):
        msg = MagicMock()
        msg.message_type = 'user'
        msg.message = 'x' * 600

        result = _format_conversation([msg])
        assert '...' in result
        assert len(result) < 600

    def test_limits_to_50_messages(self):
        messages = []
        for i in range(60):
            msg = MagicMock()
            msg.message_type = 'user'
            msg.message = f'Message {i}'
            messages.append(msg)

        result = _format_conversation(messages)
        lines = result.strip().split('\n')
        assert len(lines) == 50


class TestGenerateFallbackSummary:
    """Tests for _generate_fallback_summary function."""

    def test_empty_messages(self):
        result = _generate_fallback_summary([])
        assert result == "No messages in this conversation."

    def test_with_customer_message(self):
        msg1 = MagicMock()
        msg1.message_type = 'user'
        msg1.message = 'I want to return my order #12345'

        msg2 = MagicMock()
        msg2.message_type = 'bot'
        msg2.message = 'I can help you with that.'

        result = _generate_fallback_summary([msg1, msg2])
        assert '2 messages' in result
        assert 'return my order' in result

    def test_only_bot_messages(self):
        msg = MagicMock()
        msg.message_type = 'bot'
        msg.message = 'Welcome! How can I help?'

        result = _generate_fallback_summary([msg])
        assert '1 messages' in result

    def test_long_first_message_truncated(self):
        msg = MagicMock()
        msg.message_type = 'user'
        msg.message = 'A' * 200

        result = _generate_fallback_summary([msg])
        assert '...' in result
