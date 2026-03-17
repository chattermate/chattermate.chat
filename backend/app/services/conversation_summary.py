"""
ChatterMate - Conversation Summary Service
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

from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone
from typing import Optional
from agno.agent import Agent

from app.models.session_to_agent import SessionToAgent
from app.models.chat_history import ChatHistory
from app.repositories.ai_config import AIConfigRepository
from app.utils.agno_utils import create_model
from app.core.security import decrypt_api_key
from app.core.logger import get_logger

logger = get_logger(__name__)

# Minimum messages before generating a summary
MIN_MESSAGES_FOR_SUMMARY = 5
# Number of new messages before auto-updating summary
NEW_MESSAGES_THRESHOLD = 5

SUMMARY_SYSTEM_PROMPT = """You are a conversation summarizer for a customer support platform called ChatterMate.
Your job is to create concise, actionable summaries of customer support conversations.

Rules:
- Write 2-3 sentences maximum
- Focus on: what the customer wanted, what was discussed, and the current status/outcome
- Use third person (e.g., "The customer asked about...", "The agent provided...")
- Include any key details like order numbers, product names, or specific issues
- If the conversation is ongoing, note what's pending
- Be factual and neutral in tone
- Do NOT include greetings, pleasantries, or filler content in the summary"""


def should_update_summary(session: SessionToAgent, current_message_count: int) -> bool:
    """
    Determine if the conversation summary should be updated.

    Returns True if:
    - No summary exists and there are enough messages
    - Enough new messages have been added since last summary
    """
    if session.summary is None:
        return current_message_count >= MIN_MESSAGES_FOR_SUMMARY

    if session.summary_message_count is None:
        return current_message_count >= MIN_MESSAGES_FOR_SUMMARY

    new_messages = current_message_count - session.summary_message_count
    return new_messages >= NEW_MESSAGES_THRESHOLD


async def generate_summary(
    db: Session,
    session_id: str | UUID,
    organization_id: str | UUID,
    force: bool = False
) -> Optional[str]:
    """
    Generate an AI-powered summary of a conversation.

    Args:
        db: Database session
        session_id: The session ID to summarize
        organization_id: The organization ID (for AI config lookup)
        force: If True, regenerate even if a recent summary exists

    Returns:
        The generated summary string, or None if generation failed
    """
    if isinstance(session_id, str):
        session_id = UUID(session_id)
    if isinstance(organization_id, str):
        organization_id = UUID(organization_id)

    try:
        # Get the session
        session = db.query(SessionToAgent).filter(
            SessionToAgent.session_id == session_id
        ).first()

        if not session:
            logger.warning(f"Session {session_id} not found for summary generation")
            return None

        # Get chat messages
        messages = db.query(ChatHistory).filter(
            ChatHistory.session_id == session_id
        ).order_by(ChatHistory.created_at.asc()).all()

        if not messages:
            logger.info(f"No messages found for session {session_id}")
            return None

        message_count = len(messages)

        # Check if we should update (unless forced)
        if not force and not should_update_summary(session, message_count):
            return session.summary

        # Get the organization's AI config
        ai_config_repo = AIConfigRepository(db)
        ai_config = ai_config_repo.get_active_config(str(organization_id))

        if not ai_config:
            logger.warning(f"No active AI config for org {organization_id}, using fallback summary")
            return _generate_fallback_summary(messages)

        # Decrypt the API key
        api_key = decrypt_api_key(ai_config.encrypted_api_key)

        # Create the AI model
        model = create_model(
            model_type=ai_config.model_type.value,
            api_key=api_key,
            model_name=ai_config.model_name,
            max_tokens=300
        )

        # Format conversation for the AI
        conversation_text = _format_conversation(messages)

        # Create summary agent
        summary_agent = Agent(
            name="Conversation Summarizer",
            model=model,
            instructions=SUMMARY_SYSTEM_PROMPT,
            debug_mode=False
        )

        # Generate summary
        response = await summary_agent.arun(
            message=f"Summarize this customer support conversation:\n\n{conversation_text}"
        )

        # Extract the summary text from the response
        summary_text = ""
        if response and response.messages:
            for msg in response.messages:
                if msg.role == "assistant" and msg.content:
                    summary_text = msg.content
                    break

        if not summary_text:
            logger.warning(f"Empty summary generated for session {session_id}")
            return _generate_fallback_summary(messages)

        # Update the session with the summary
        session.summary = summary_text
        session.summary_updated_at = datetime.now(timezone.utc)
        session.summary_message_count = message_count
        db.commit()

        logger.info(f"Generated summary for session {session_id} ({message_count} messages)")
        return summary_text

    except Exception as e:
        logger.error(f"Error generating summary for session {session_id}: {str(e)}")
        db.rollback()
        # Return fallback summary on error
        try:
            messages = db.query(ChatHistory).filter(
                ChatHistory.session_id == session_id
            ).order_by(ChatHistory.created_at.asc()).all()
            return _generate_fallback_summary(messages)
        except Exception:
            return None


def _format_conversation(messages: list) -> str:
    """Format chat messages into a readable conversation string."""
    formatted = []
    for msg in messages:
        role_label = {
            'user': 'Customer',
            'bot': 'AI Agent',
            'agent': 'Human Agent'
        }.get(msg.message_type, msg.message_type)

        # Truncate very long messages to keep within token limits
        text = msg.message
        if len(text) > 500:
            text = text[:500] + "..."

        formatted.append(f"{role_label}: {text}")

    # Limit total conversation to last 50 messages to stay within token limits
    if len(formatted) > 50:
        formatted = formatted[-50:]

    return "\n".join(formatted)


def _generate_fallback_summary(messages: list) -> str:
    """
    Generate a basic summary without AI when no AI config is available.
    Extracts key info from the first and last messages.
    """
    if not messages:
        return "No messages in this conversation."

    message_count = len(messages)
    first_customer_msg = None
    last_msg = messages[-1] if messages else None

    for msg in messages:
        if msg.message_type == 'user':
            first_customer_msg = msg
            break

    parts = [f"Conversation with {message_count} messages."]

    if first_customer_msg:
        # Take first 100 chars of the customer's first message
        preview = first_customer_msg.message[:100]
        if len(first_customer_msg.message) > 100:
            preview += "..."
        parts.append(f"Customer initially asked: \"{preview}\"")

    return " ".join(parts)


async def get_or_generate_summary(
    db: Session,
    session_id: str | UUID,
    organization_id: str | UUID
) -> Optional[str]:
    """
    Get existing summary or generate a new one if conditions are met.
    This is the primary entry point for getting a summary.
    """
    if isinstance(session_id, str):
        session_id = UUID(session_id)

    session = db.query(SessionToAgent).filter(
        SessionToAgent.session_id == session_id
    ).first()

    if not session:
        return None

    # If we have a recent summary, return it
    message_count = db.query(ChatHistory).filter(
        ChatHistory.session_id == session_id
    ).count()

    if session.summary and not should_update_summary(session, message_count):
        return session.summary

    # Generate or update summary
    return await generate_summary(db, session_id, organization_id, force=False)
