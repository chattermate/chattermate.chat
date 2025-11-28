"""
ChatterMate - Slack Chat Handler
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

import re
import json
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime

from sqlalchemy.orm import Session

from app.core.logger import get_logger
from app.core.security import decrypt_api_key
from app.database import SessionLocal
from app.agents.chat_agent import ChatAgent
from app.models.slack import StorageMode
from app.repositories.slack import SlackRepository
from app.repositories.ai_config import AIConfigRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.repositories.chat import ChatRepository
from app.repositories.customer import CustomerRepository
from app.repositories.agent import AgentRepository
from app.services.slack import slack_service

logger = get_logger(__name__)


def clean_mention_text(text: str, bot_user_id: str = None) -> str:
    """Remove @bot mentions from message text."""
    if not text:
        return ""
    # Remove <@UXXXXXX> mentions
    cleaned = re.sub(r'<@[A-Z0-9]+>', '', text).strip()
    return cleaned


async def get_or_create_slack_customer(
    db: Session,
    slack_user_id: str,
    organization_id: str
) -> str:
    """Get or create a customer for the Slack user."""
    from uuid import UUID as PyUUID
    customer_repo = CustomerRepository(db)

    # Use slack user id as email to find/create customer
    slack_email = f"{slack_user_id}@slack.user"
    org_uuid = PyUUID(organization_id) if isinstance(organization_id, str) else organization_id

    customer = customer_repo.get_or_create_customer(
        email=slack_email,
        organization_id=org_uuid,
        full_name=f"Slack User {slack_user_id[:8]}"
    )
    return str(customer.id)


async def store_message_with_mode(
    db: Session,
    session_id: str,
    message: str,
    message_type: str,
    storage_mode: StorageMode,
    slack_user_id: str,
    attributes: Dict[str, Any] = None
):
    """Store message based on storage mode configuration."""
    chat_repo = ChatRepository(db)

    base_attributes = attributes or {}
    base_attributes["source"] = "slack"
    base_attributes["slack_user_id"] = slack_user_id

    if storage_mode == StorageMode.FULL_CONTENT:
        # Store complete message text
        chat_repo.create_message({
            "session_id": session_id,
            "message": message,
            "message_type": message_type,
            "attributes": base_attributes
        })
    elif storage_mode == StorageMode.METADATA_ONLY:
        # Store only metadata, no message content
        base_attributes["has_content"] = False
        chat_repo.create_message({
            "session_id": session_id,
            "message": "[content not stored per privacy settings]",
            "message_type": message_type,
            "attributes": base_attributes
        })
    elif storage_mode == StorageMode.EMBEDDINGS_ONLY:
        # Store placeholder (embeddings would be generated separately)
        base_attributes["embeddings_only"] = True
        chat_repo.create_message({
            "session_id": session_id,
            "message": "[embedding stored]",
            "message_type": message_type,
            "attributes": base_attributes
        })


async def process_slack_event(event_payload: Dict[str, Any], db: Session):
    """Process a Slack event in the background."""
    try:
        event = event_payload.get("event", {})
        event_type = event.get("type")
        team_id = event_payload.get("team_id")

        logger.info(f"Processing Slack event: {event_type} from team {team_id}")

        # Create a new database session for background task
        db = SessionLocal()

        try:
            if event_type == "app_mention":
                await handle_mention(event, team_id, db)
            elif event_type == "message" and event.get("channel_type") == "im":
                # DM to bot
                await handle_direct_message(event, team_id, db)
            elif event_type == "member_joined_channel":
                await handle_bot_joined_channel(event, team_id, event_payload, db)
            elif event_type == "assistant_thread_started":
                await handle_assistant_thread_started(event, team_id, db)
            elif event_type == "assistant_thread_context_changed":
                await handle_assistant_context_changed(event, team_id, db)
            elif event_type == "app_home_opened":
                await handle_app_home_opened(event, team_id, db)
            else:
                logger.debug(f"Unhandled event type: {event_type}")
        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error processing Slack event: {e}")
        import traceback
        traceback.print_exc()


async def handle_bot_joined_channel(event: Dict[str, Any], team_id: str, event_payload: Dict[str, Any], db: Session):
    """Handle when the bot is added to a channel - send setup message."""
    slack_repo = SlackRepository(db)

    # Get token for this team
    token = slack_repo.get_token_by_team(team_id)
    if not token:
        logger.error(f"No token found for team {team_id}")
        return

    user_id = event.get("user")
    channel_id = event.get("channel")

    # Only trigger when the BOT is added, not other users
    if user_id != token.bot_user_id:
        logger.debug(f"User {user_id} joined channel, not bot {token.bot_user_id}")
        return

    logger.info(f"Bot added to channel {channel_id} in team {team_id}")

    # Check if agent is already configured for this channel
    existing_config = slack_repo.get_config_by_channel(team_id, channel_id)
    if existing_config:
        logger.debug(f"Channel {channel_id} already has agent configured")
        return

    # Get channel info for the message
    try:
        channel_info = await slack_service.get_conversation_info(token.access_token, channel_id)
        channel_name = channel_info.get("name", "this channel")
    except Exception:
        channel_name = "this channel"

    # Send setup message with "Select Agent" button
    setup_blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Hey! I'm ChatterMate* :wave:\n\nI've been added to #{channel_name}. To get started, select which AI agent should handle questions in this channel."
            }
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Select Agent", "emoji": True},
                    "style": "primary",
                    "action_id": "cm_select_agent_modal",
                    "value": f'{{"channel_id":"{channel_id}","channel_name":"{channel_name}"}}'
                }
            ]
        },
        {
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": "Once configured, I can respond to @mentions and `/chattermate` commands."
                }
            ]
        }
    ]

    try:
        await slack_service.send_message(
            access_token=token.access_token,
            channel=channel_id,
            text="ChatterMate has been added to this channel. Click 'Select Agent' to configure.",
            blocks=setup_blocks
        )
        logger.info(f"Sent setup message to channel {channel_id}")
    except Exception as e:
        logger.error(f"Failed to send setup message: {e}")


async def handle_assistant_thread_started(event: Dict[str, Any], team_id: str, db: Session):
    """Handle when user opens AI assistant sidebar (Agents & AI Apps feature)."""
    slack_repo = SlackRepository(db)
    token = slack_repo.get_token_by_team(team_id)
    if not token:
        logger.error(f"No token found for team {team_id}")
        return

    # The assistant_thread event contains assistant_thread object
    assistant_thread = event.get("assistant_thread", {})
    channel_id = assistant_thread.get("channel_id")
    thread_ts = assistant_thread.get("thread_ts")

    if not channel_id or not thread_ts:
        logger.error("Missing channel_id or thread_ts in assistant_thread_started event")
        return

    logger.info(f"Assistant thread started in channel {channel_id}, thread {thread_ts}")

    # Set thinking status
    try:
        await slack_service.set_assistant_status(
            access_token=token.access_token,
            channel=channel_id,
            thread_ts=thread_ts,
            status="is getting ready..."
        )
    except Exception as e:
        logger.debug(f"Could not set assistant status: {e}")

    # Get organization agents for context
    agent_repo = AgentRepository(db)
    agents = agent_repo.get_org_agents(token.organization_id)

    # Build dynamic suggested prompts from available agents
    prompts = []
    if agents:
        for agent in agents[:4]:  # Max 4 prompts
            prompts.append({
                "title": f"Ask {agent.name}",
                "message": f"Hi! I'd like to chat with {agent.name}"
            })

    # Set suggested prompts via API
    if prompts:
        try:
            await slack_service.set_suggested_prompts(
                access_token=token.access_token,
                channel=channel_id,
                thread_ts=thread_ts,
                prompts=prompts,
                title="Choose an agent to chat with:"
            )
            logger.info(f"Set {len(prompts)} suggested prompts for thread {thread_ts}")
        except Exception as e:
            logger.debug(f"Could not set suggested prompts: {e}")

    # Build welcome message
    if agents:
        agent_names = [agent.name for agent in agents[:4]]
        agent_list = ", ".join(agent_names)
        welcome_text = (
            f"Hi! I'm ChatterMate. 👋\n\n"
            f"I have {len(agents)} agent{'s' if len(agents) > 1 else ''} available: {agent_list}.\n\n"
            f"Select a prompt above to chat with a specific agent, or just ask me anything!"
        )
    else:
        welcome_text = (
            "Hi! I'm ChatterMate. 👋\n\n"
            "No agents are configured yet. Please set up an agent in ChatterMate first."
        )

    # Send welcome message
    try:
        await slack_service.send_message(
            access_token=token.access_token,
            channel=channel_id,
            text=welcome_text,
            thread_ts=thread_ts
        )
        logger.info(f"Sent assistant welcome message to thread {thread_ts}")
    except Exception as e:
        logger.error(f"Failed to send assistant welcome message: {e}")


async def handle_assistant_context_changed(event: Dict[str, Any], team_id: str, db: Session):
    """Handle when user switches channel while in assistant sidebar."""
    # This event fires when the user navigates to a different channel
    # while the assistant sidebar is open. We can use this to provide
    # context-aware suggestions or update the conversation.

    assistant_thread = event.get("assistant_thread", {})
    channel_id = assistant_thread.get("channel_id")
    context = assistant_thread.get("context", {})
    new_channel_id = context.get("channel_id")

    logger.info(f"Assistant context changed: thread channel {channel_id}, viewing channel {new_channel_id}")

    # For now, we just log the context change
    # Future enhancement: Could update suggested prompts or provide channel-specific help
    pass


async def handle_app_home_opened(event: Dict[str, Any], team_id: str, db: Session):
    """Handle when user opens the App Home tab."""
    from app.core.config import settings

    slack_repo = SlackRepository(db)
    token = slack_repo.get_token_by_team(team_id)
    if not token:
        logger.error(f"No token found for team {team_id}")
        return

    user_id = event.get("user")
    tab = event.get("tab")

    # Only handle the home tab
    if tab != "home":
        return

    logger.info(f"App Home opened by user {user_id} in team {team_id}")

    # Get organization agents
    agent_repo = AgentRepository(db)
    agents = agent_repo.get_org_agents(token.organization_id)

    # Build agent blocks - each agent as a card with status and instructions
    agent_blocks = []
    if agents:
        agent_blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Your AI Agents*"
            }
        })

        for agent in agents[:10]:
            status_emoji = ":large_green_circle:" if agent.is_active else ":white_circle:"
            status_text = "Online" if agent.is_active else "Offline"

            # Use display_name if available, otherwise name
            agent_name = agent.display_name or agent.name

            # Get first instruction (truncated to 100 chars)
            instructions = agent.instructions if hasattr(agent, 'instructions') else []
            if instructions and len(instructions) > 0:
                first_instruction = instructions[0]
                if len(first_instruction) > 100:
                    first_instruction = first_instruction[:97] + "..."
                instruction_text = f"_{first_instruction}_"
            else:
                instruction_text = "_No instructions set_"

            agent_blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"{status_emoji}  *{agent_name}*  •  {status_text}\n{instruction_text}"
                }
            })
    else:
        agent_blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*No agents configured yet*\nCreate your first AI agent in the ChatterMate dashboard."
            }
        })

    # Build the home view
    home_view = {
        "type": "home",
        "blocks": [
            # Header with logo feel
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "ChatterMate",
                    "emoji": True
                }
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "AI-powered support & sales assistant for your team"
                    }
                ]
            },
            {"type": "divider"},

            # Agents section
            *agent_blocks,
            {"type": "divider"},

            # Quick start guide
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Quick Start*"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": ":speech_balloon:  *@mention* me in any channel\n"
                            ":zap:  Use */chattermate [question]*\n"
                            ":robot_face:  Open *Agents & AI Apps* sidebar"
                }
            },
            {"type": "divider"},

            # Footer
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": ":gear: Manage agents, prompts & settings in the <" + settings.FRONTEND_URL + "|ChatterMate Dashboard>"
                    }
                ]
            }
        ]
    }

    # Publish the home view
    try:
        await slack_service.publish_home_view(
            access_token=token.access_token,
            user_id=user_id,
            view=home_view
        )
        logger.info(f"Published App Home view for user {user_id}")
    except Exception as e:
        logger.error(f"Failed to publish App Home view: {e}")


async def handle_mention(event: Dict[str, Any], team_id: str, db: Session):
    """Handle @mention events."""
    slack_repo = SlackRepository(db)

    # Get token for this team
    token = slack_repo.get_token_by_team(team_id)
    if not token:
        logger.error(f"No token found for team {team_id}")
        return

    channel_id = event.get("channel")
    user_id = event.get("user")
    text = event.get("text", "")
    thread_ts = event.get("thread_ts") or event.get("ts")
    message_ts = event.get("ts")

    # Ignore bot's own messages
    if user_id == token.bot_user_id:
        return

    # Get workspace config and check channel allowlist
    workspace_config = slack_repo.get_workspace_config_by_team(team_id)
    if not workspace_config:
        logger.error(f"No workspace config found for team {team_id}")
        return

    # Check channel allowlist
    if workspace_config.allowed_channel_ids:
        if channel_id not in workspace_config.allowed_channel_ids:
            logger.debug(f"Channel {channel_id} not in allowlist, ignoring")
            return

    # Get agent config for this channel
    agent_config = slack_repo.get_config_by_channel(team_id, channel_id)

    if agent_config:
        if not agent_config.enabled or not agent_config.respond_to_mentions:
            logger.debug(f"Mentions disabled for channel {channel_id}")
            return
        agent_id = str(agent_config.agent_id)
    else:
        # Use default agent
        if not workspace_config.default_agent_id:
            logger.debug(f"No agent configured for channel {channel_id}")
            return
        agent_id = str(workspace_config.default_agent_id)

    # Clean message text
    cleaned_text = clean_mention_text(text, token.bot_user_id)

    if not cleaned_text:
        logger.debug("Empty message after cleaning, ignoring")
        return

    # Process the chat
    await process_slack_chat(
        db=db,
        slack_repo=slack_repo,
        token=token,
        workspace_config=workspace_config,
        agent_id=agent_id,
        team_id=team_id,
        channel_id=channel_id,
        thread_ts=thread_ts,
        user_id=user_id,
        text=cleaned_text,
        organization_id=str(token.organization_id)
    )


async def handle_direct_message(event: Dict[str, Any], team_id: str, db: Session):
    """Handle direct messages to the bot (including AI assistant sidebar)."""
    slack_repo = SlackRepository(db)

    token = slack_repo.get_token_by_team(team_id)
    if not token:
        return

    user_id = event.get("user")
    text = event.get("text", "")
    channel_id = event.get("channel")
    thread_ts = event.get("thread_ts") or event.get("ts")

    # Ignore bot's own messages
    if user_id == token.bot_user_id:
        return

    # Get workspace config
    workspace_config = slack_repo.get_workspace_config_by_team(team_id)
    if not workspace_config:
        logger.debug("No workspace config found for DMs")
        return

    # Check for agent selection from AI assistant prompts
    # Format: "Hi! I'd like to chat with {agent_name}"
    selected_agent_id = None
    agent_selection_match = re.match(r"Hi!\s*I'd like to chat with (.+)", text, re.IGNORECASE)
    if agent_selection_match:
        requested_agent_name = agent_selection_match.group(1).strip()
        # Find agent by name
        agent_repo = AgentRepository(db)
        agents = agent_repo.get_org_agents(token.organization_id)
        for agent in agents:
            if agent.name.lower() == requested_agent_name.lower():
                selected_agent_id = str(agent.id)
                text = f"Hello! I'm ready to help."  # Replace with greeting
                logger.info(f"Agent '{agent.name}' selected via prompt")
                break

    # Determine which agent to use
    if selected_agent_id:
        # User selected specific agent via AI assistant prompt
        agent_id = selected_agent_id
    elif workspace_config.default_agent_id:
        # Use default agent
        agent_id = str(workspace_config.default_agent_id)
    else:
        # No default agent - try to find any available agent for this org
        agent_repo = AgentRepository(db)
        agents = agent_repo.get_org_agents(token.organization_id)
        if agents:
            agent_id = str(agents[0].id)
            logger.info(f"Using first available agent {agent_id} for DM (no default set)")
        else:
            logger.debug("No agents available for DMs")
            try:
                await slack_service.send_message(
                    access_token=token.access_token,
                    channel=channel_id,
                    text="No agents are configured yet. Please set up an agent in ChatterMate first.",
                    thread_ts=thread_ts
                )
            except Exception:
                pass
            return

    # If message is empty after removing prefix, send help text
    if not text:
        try:
            await slack_service.send_message(
                access_token=token.access_token,
                channel=channel_id,
                text="How can I help you today? Just type your question!",
                thread_ts=thread_ts
            )
        except Exception as e:
            logger.error(f"Failed to send help message: {e}")
        return

    # Set "thinking" status for AI assistant threads
    try:
        await slack_service.set_assistant_status(
            access_token=token.access_token,
            channel=channel_id,
            thread_ts=thread_ts,
            status="is thinking..."
        )
    except Exception:
        pass  # Status is optional, don't fail if it doesn't work

    await process_slack_chat(
        db=db,
        slack_repo=slack_repo,
        token=token,
        workspace_config=workspace_config,
        agent_id=agent_id,
        team_id=team_id,
        channel_id=channel_id,
        thread_ts=thread_ts,
        user_id=user_id,
        text=text,
        organization_id=str(token.organization_id)
    )




async def process_slack_chat(
    db: Session,
    slack_repo: SlackRepository,
    token,
    workspace_config,
    agent_id: str,
    team_id: str,
    channel_id: str,
    thread_ts: str,
    user_id: str,
    text: str,
    organization_id: str
):
    """Process a Slack chat message and send response."""
    try:
        # Get or create customer
        customer_id = await get_or_create_slack_customer(db, user_id, organization_id)

        # Get AI config
        ai_config_repo = AIConfigRepository(db)
        ai_config = ai_config_repo.get_active_config(organization_id)

        if not ai_config:
            logger.error(f"No AI config found for org {organization_id}")
            await slack_service.send_message(
                access_token=token.access_token,
                channel=channel_id,
                text="Sorry, I'm not properly configured yet. Please contact an administrator.",
                thread_ts=thread_ts
            )
            return

        # Get or create conversation/session
        existing_conversation = slack_repo.get_conversation_by_thread(team_id, channel_id, thread_ts)

        if existing_conversation:
            session_id = str(existing_conversation.session_id)
        else:
            # Create new session
            session_repo = SessionToAgentRepository(db)
            session_id = str(uuid.uuid4())
            session_repo.create_session(
                session_id=session_id,
                agent_id=agent_id,
                customer_id=customer_id,
                organization_id=organization_id
            )

            # Create conversation tracking record
            slack_repo.get_or_create_conversation(
                team_id=team_id,
                channel_id=channel_id,
                thread_ts=thread_ts,
                session_id=uuid.UUID(session_id),
                agent_id=uuid.UUID(agent_id),
                organization_id=uuid.UUID(organization_id),
                slack_user_id=user_id
            )

        # Store user message
        await store_message_with_mode(
            db=db,
            session_id=session_id,
            message=text,
            message_type="user",
            storage_mode=workspace_config.storage_mode,
            slack_user_id=user_id,
            attributes={
                "slack_channel_id": channel_id,
                "slack_thread_ts": thread_ts,
                "slack_team_id": team_id
            }
        )

        # Create ChatAgent and get response
        api_key = decrypt_api_key(ai_config.encrypted_api_key)

        chat_agent = ChatAgent(
            api_key=api_key,
            model_name=ai_config.model_name,
            model_type=ai_config.model_type.value,
            org_id=organization_id,
            agent_id=agent_id,
            customer_id=customer_id,
            session_id=session_id,
            source='slack'
        )

        response = await chat_agent.get_response(
            message=text,
            session_id=session_id,
            org_id=organization_id,
            agent_id=agent_id,
            customer_id=customer_id
        )

        # Store assistant response
        await store_message_with_mode(
            db=db,
            session_id=session_id,
            message=response.message,
            message_type="assistant",
            storage_mode=workspace_config.storage_mode,
            slack_user_id=token.bot_user_id,
            attributes={
                "slack_channel_id": channel_id,
                "slack_thread_ts": thread_ts,
                "slack_team_id": team_id
            }
        )

        # Send response in thread
        await slack_service.send_message(
            access_token=token.access_token,
            channel=channel_id,
            text=response.message,
            thread_ts=thread_ts
        )

    except Exception as e:
        logger.error(f"Error processing Slack chat: {e}")
        import traceback
        traceback.print_exc()

        # Send error message
        try:
            await slack_service.send_message(
                access_token=token.access_token,
                channel=channel_id,
                text="Sorry, I encountered an error processing your request. Please try again.",
                thread_ts=thread_ts
            )
        except Exception:
            pass


async def process_slash_command(form_data: Dict[str, str], db: Session):
    """Process a slash command in the background."""
    try:
        # Create a new database session for background task
        db = SessionLocal()

        try:
            team_id = form_data.get("team_id")
            channel_id = form_data.get("channel_id")
            user_id = form_data.get("user_id")
            text = form_data.get("text", "").strip()
            response_url = form_data.get("response_url")

            if not text:
                await slack_service.respond_to_response_url(
                    response_url=response_url,
                    text="Please provide a question. Usage: `/chattermate [your question]`"
                )
                return

            slack_repo = SlackRepository(db)
            token = slack_repo.get_token_by_team(team_id)

            if not token:
                await slack_service.respond_to_response_url(
                    response_url=response_url,
                    text="Chattermate is not properly configured for this workspace."
                )
                return

            workspace_config = slack_repo.get_workspace_config_by_team(team_id)
            if not workspace_config:
                await slack_service.respond_to_response_url(
                    response_url=response_url,
                    text="Chattermate is not properly configured for this workspace."
                )
                return

            # Check channel allowlist
            if workspace_config.allowed_channel_ids:
                if channel_id not in workspace_config.allowed_channel_ids:
                    await slack_service.respond_to_response_url(
                        response_url=response_url,
                        text="Chattermate is not enabled for this channel."
                    )
                    return

            # Get agent config
            agent_config = slack_repo.get_config_by_channel(team_id, channel_id)
            if agent_config:
                if not agent_config.enabled or not agent_config.respond_to_commands:
                    await slack_service.respond_to_response_url(
                        response_url=response_url,
                        text="Chattermate commands are not enabled for this channel."
                    )
                    return
                agent_id = str(agent_config.agent_id)
            else:
                if not workspace_config.default_agent_id:
                    await slack_service.respond_to_response_url(
                        response_url=response_url,
                        text="No agent is configured for this channel."
                    )
                    return
                agent_id = str(workspace_config.default_agent_id)

            # Get or create customer
            organization_id = str(token.organization_id)
            customer_id = await get_or_create_slack_customer(db, user_id, organization_id)

            # Get AI config
            ai_config_repo = AIConfigRepository(db)
            ai_config = ai_config_repo.get_active_config(organization_id)

            if not ai_config:
                await slack_service.respond_to_response_url(
                    response_url=response_url,
                    text="Chattermate AI is not configured. Please contact an administrator."
                )
                return

            # Create session for slash command
            session_repo = SessionToAgentRepository(db)
            session_id = str(uuid.uuid4())
            session_repo.create_session(
                session_id=session_id,
                agent_id=agent_id,
                customer_id=customer_id,
                organization_id=organization_id
            )

            # Store user message
            await store_message_with_mode(
                db=db,
                session_id=session_id,
                message=text,
                message_type="user",
                storage_mode=workspace_config.storage_mode,
                slack_user_id=user_id,
                attributes={
                    "slack_channel_id": channel_id,
                    "slack_team_id": team_id,
                    "interaction_type": "slash_command"
                }
            )

            # Create ChatAgent and get response
            api_key = decrypt_api_key(ai_config.encrypted_api_key)

            chat_agent = ChatAgent(
                api_key=api_key,
                model_name=ai_config.model_name,
                model_type=ai_config.model_type.value,
                org_id=organization_id,
                agent_id=agent_id,
                customer_id=customer_id,
                session_id=session_id,
                source='slack'
            )

            response = await chat_agent.get_response(
                message=text,
                session_id=session_id,
                org_id=organization_id,
                agent_id=agent_id,
                customer_id=customer_id
            )

            # Store assistant response
            await store_message_with_mode(
                db=db,
                session_id=session_id,
                message=response.message,
                message_type="assistant",
                storage_mode=workspace_config.storage_mode,
                slack_user_id=token.bot_user_id,
                attributes={
                    "slack_channel_id": channel_id,
                    "slack_team_id": team_id,
                    "interaction_type": "slash_command"
                }
            )

            # Send response via response_url
            await slack_service.respond_to_response_url(
                response_url=response_url,
                text=response.message,
                response_type="in_channel"  # Make response visible to everyone
            )

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error processing slash command: {e}")
        import traceback
        traceback.print_exc()

        try:
            await slack_service.respond_to_response_url(
                response_url=form_data.get("response_url"),
                text="Sorry, I encountered an error. Please try again."
            )
        except Exception:
            pass


async def process_message_shortcut(payload: Dict[str, Any], db: Session):
    """Process a message shortcut (right-click menu action)."""
    try:
        db = SessionLocal()

        try:
            team_id = payload.get("team", {}).get("id")
            channel_id = payload.get("channel", {}).get("id")
            user_id = payload.get("user", {}).get("id")
            message = payload.get("message", {})
            message_text = message.get("text", "")
            message_ts = message.get("ts")
            response_url = payload.get("response_url")

            if not message_text:
                await slack_service.respond_to_response_url(
                    response_url=response_url,
                    text="Could not read the message content."
                )
                return

            slack_repo = SlackRepository(db)
            token = slack_repo.get_token_by_team(team_id)

            if not token:
                await slack_service.respond_to_response_url(
                    response_url=response_url,
                    text="Chattermate is not configured for this workspace."
                )
                return

            workspace_config = slack_repo.get_workspace_config_by_team(team_id)
            if not workspace_config or not workspace_config.default_agent_id:
                await slack_service.respond_to_response_url(
                    response_url=response_url,
                    text="No agent is configured for message analysis."
                )
                return

            agent_id = str(workspace_config.default_agent_id)
            organization_id = str(token.organization_id)
            customer_id = await get_or_create_slack_customer(db, user_id, organization_id)

            # Get AI config
            ai_config_repo = AIConfigRepository(db)
            ai_config = ai_config_repo.get_active_config(organization_id)

            if not ai_config:
                await slack_service.respond_to_response_url(
                    response_url=response_url,
                    text="AI is not configured. Please contact an administrator."
                )
                return

            # Create session
            session_repo = SessionToAgentRepository(db)
            session_id = str(uuid.uuid4())
            session_repo.create_session(
                session_id=session_id,
                agent_id=agent_id,
                customer_id=customer_id,
                organization_id=organization_id
            )

            # Create prompt for analyzing the message
            analysis_prompt = f"Please analyze and respond to this message:\n\n\"{message_text}\""

            # Get AI response
            api_key = decrypt_api_key(ai_config.encrypted_api_key)

            chat_agent = ChatAgent(
                api_key=api_key,
                model_name=ai_config.model_name,
                model_type=ai_config.model_type.value,
                org_id=organization_id,
                agent_id=agent_id,
                customer_id=customer_id,
                session_id=session_id,
                source='slack'
            )

            response = await chat_agent.get_response(
                message=analysis_prompt,
                session_id=session_id,
                org_id=organization_id,
                agent_id=agent_id,
                customer_id=customer_id
            )

            # Send response in thread
            await slack_service.send_message(
                access_token=token.access_token,
                channel=channel_id,
                text=response.message,
                thread_ts=message_ts
            )

            # Also respond to the shortcut
            await slack_service.respond_to_response_url(
                response_url=response_url,
                text="I've analyzed the message and replied in a thread.",
                replace_original=False
            )

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error processing message shortcut: {e}")
        import traceback
        traceback.print_exc()


def build_agent_selection_modal(channel_id: str, channel_name: str, agents: List[Any]) -> Dict[str, Any]:
    """Build the modal view for agent selection."""
    agent_options = [
        {
            "text": {"type": "plain_text", "text": agent.name[:75]},  # Slack limit
            "value": str(agent.id)
        }
        for agent in agents
    ]

    return {
        "type": "modal",
        "callback_id": "cm_agent_selected",
        "private_metadata": json.dumps({"channel_id": channel_id, "channel_name": channel_name}),
        "title": {"type": "plain_text", "text": "Configure Channel"},
        "submit": {"type": "plain_text", "text": "Save"},
        "close": {"type": "plain_text", "text": "Cancel"},
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"Select which AI agent should handle questions in *#{channel_name}*."
                }
            },
            {
                "type": "input",
                "block_id": "agent_picker",
                "label": {"type": "plain_text", "text": "Choose Agent"},
                "element": {
                    "type": "static_select",
                    "action_id": "agent_selection",
                    "placeholder": {"type": "plain_text", "text": "Pick an agent"},
                    "options": agent_options
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Response triggers:*"
                }
            },
            {
                "type": "input",
                "block_id": "respond_mentions",
                "optional": True,
                "label": {"type": "plain_text", "text": "Respond to @mentions"},
                "element": {
                    "type": "checkboxes",
                    "action_id": "mentions_check",
                    "initial_options": [{"text": {"type": "plain_text", "text": "Enable"}, "value": "true"}],
                    "options": [{"text": {"type": "plain_text", "text": "Enable"}, "value": "true"}]
                }
            },
            {
                "type": "input",
                "block_id": "respond_commands",
                "optional": True,
                "label": {"type": "plain_text", "text": "Respond to /chattermate command"},
                "element": {
                    "type": "checkboxes",
                    "action_id": "commands_check",
                    "initial_options": [{"text": {"type": "plain_text", "text": "Enable"}, "value": "true"}],
                    "options": [{"text": {"type": "plain_text", "text": "Enable"}, "value": "true"}]
                }
            }
        ]
    }


async def process_slack_interaction(payload: Dict[str, Any]):
    """Process Slack interaction payloads (button clicks, modal submissions)."""
    try:
        db = SessionLocal()

        try:
            interaction_type = payload.get("type")
            team_id = payload.get("team", {}).get("id")

            logger.info(f"Processing Slack interaction: {interaction_type} from team {team_id}")

            if interaction_type == "block_actions":
                await handle_block_action(payload, team_id, db)
            elif interaction_type == "view_submission":
                return await handle_view_submission(payload, team_id, db)
            elif interaction_type == "message_action" or interaction_type == "shortcut":
                callback_id = payload.get("callback_id")
                if callback_id == "cm_ask_about_message":
                    await process_message_shortcut(payload, db)

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error processing Slack interaction: {e}")
        import traceback
        traceback.print_exc()

    return None


async def handle_block_action(payload: Dict[str, Any], team_id: str, db: Session):
    """Handle button clicks and other block actions."""
    actions = payload.get("actions", [])
    trigger_id = payload.get("trigger_id")

    for action in actions:
        action_id = action.get("action_id")

        if action_id == "cm_select_agent_modal":
            # User clicked "Select Agent" button
            try:
                value_data = json.loads(action.get("value", "{}"))
                channel_id = value_data.get("channel_id")
                channel_name = value_data.get("channel_name", "channel")

                slack_repo = SlackRepository(db)
                token = slack_repo.get_token_by_team(team_id)

                if not token:
                    logger.error(f"No token found for team {team_id}")
                    return

                # Get agents for this organization
                agent_repo = AgentRepository(db)
                agents = agent_repo.get_org_agents(token.organization_id)

                if not agents:
                    # No agents - send ephemeral message
                    await slack_service.respond_to_response_url(
                        response_url=payload.get("response_url"),
                        text="No agents available. Please create an agent in ChatterMate first.",
                        response_type="ephemeral"
                    )
                    return

                # Build and open the modal
                modal = build_agent_selection_modal(channel_id, channel_name, agents)

                await slack_service.open_view(
                    access_token=token.access_token,
                    trigger_id=trigger_id,
                    view=modal
                )

                logger.info(f"Opened agent selection modal for channel {channel_id}")

            except Exception as e:
                logger.error(f"Error opening agent selection modal: {e}")
                import traceback
                traceback.print_exc()


async def handle_view_submission(payload: Dict[str, Any], team_id: str, db: Session) -> Optional[Dict]:
    """Handle modal form submissions."""
    view = payload.get("view", {})
    callback_id = view.get("callback_id")

    if callback_id == "cm_agent_selected":
        try:
            # Extract data from submission
            private_metadata = json.loads(view.get("private_metadata", "{}"))
            channel_id = private_metadata.get("channel_id")
            channel_name = private_metadata.get("channel_name")

            values = view.get("state", {}).get("values", {})

            # Get selected agent
            agent_id = values.get("agent_picker", {}).get("agent_selection", {}).get("selected_option", {}).get("value")

            if not agent_id:
                return {"response_action": "errors", "errors": {"agent_picker": "Please select an agent"}}

            # Get checkbox values (checked = list with value, unchecked = empty list)
            respond_mentions = bool(values.get("respond_mentions", {}).get("mentions_check", {}).get("selected_options"))
            respond_commands = bool(values.get("respond_commands", {}).get("commands_check", {}).get("selected_options"))

            slack_repo = SlackRepository(db)
            token = slack_repo.get_token_by_team(team_id)

            if not token:
                logger.error(f"No token found for team {team_id}")
                return None

            # Create or update the agent config for this channel
            existing_config = slack_repo.get_config_by_channel(team_id, channel_id)

            if existing_config:
                # Update existing
                slack_repo.update_agent_config(
                    existing_config.id,
                    agent_id=uuid.UUID(agent_id),
                    enabled=True,
                    respond_to_mentions=respond_mentions,
                    respond_to_reactions=False,
                    respond_to_commands=respond_commands
                )
                logger.info(f"Updated agent config for channel {channel_id}")
            else:
                # Create new
                slack_repo.create_agent_config(
                    organization_id=token.organization_id,
                    team_id=team_id,
                    agent_id=uuid.UUID(agent_id),
                    channel_id=channel_id,
                    channel_name=channel_name,
                    enabled=True,
                    respond_to_mentions=respond_mentions,
                    respond_to_reactions=False,
                    respond_to_commands=respond_commands
                )
                logger.info(f"Created agent config for channel {channel_id}")

            # Send confirmation message to the channel
            agent_repo = AgentRepository(db)
            agent = agent_repo.get_by_id(agent_id)
            agent_name = agent.name if agent else "the selected agent"

            await slack_service.send_message(
                access_token=token.access_token,
                channel=channel_id,
                text=f":white_check_mark: *{agent_name}* is now configured for this channel!\n\n"
                     f"You can:\n"
                     f"{'• @mention me to ask questions\n' if respond_mentions else ''}"
                     f"{'• Use `/chattermate [question]` command\n' if respond_commands else ''}"
            )

            return None  # Close modal

        except Exception as e:
            logger.error(f"Error saving agent selection: {e}")
            import traceback
            traceback.print_exc()
            return {"response_action": "errors", "errors": {"agent_picker": "Failed to save. Please try again."}}

    return None
