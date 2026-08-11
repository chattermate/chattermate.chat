"""
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

from typing import Dict, Any
from datetime import datetime
import asyncio
import pytz
from agno.agent import Agent
from app.agents.guardrail_policy import INJECTION_CLAUSE, visitor_data_block
from app.utils.agno_utils import create_model
from app.repositories.agent import AgentRepository
from app.repositories.customer import CustomerRepository
from app.core.logger import get_logger
from app.database import get_db
from app.repositories.group import GroupRepository
from app.tools.jira_toolkit import JiraTools
from app.models.schemas.chat import ChatResponse
from app.utils.response_parser import parse_response_content
from app.core.config import settings
logger = get_logger(__name__)

# Wording used when the model can't produce a handoff line in time. The routing
# decision itself is computed from business hours and agent availability, so a
# timeout costs only the phrasing — the handoff still goes ahead.
TRANSFER_TIMEOUT_MESSAGE = "Let me connect you with someone from our team."
FOLLOW_UP_TIMEOUT_MESSAGE = "Our team will get back to you shortly."
# Same fallback, for when nobody is available AND we have no way to reach them —
# it still has to ask, or the follow-up it promises can never happen.
FOLLOW_UP_NEEDS_EMAIL_TIMEOUT_MESSAGE = (
    "Our team will get back to you shortly. What's the best email address to reach you on?"
)

class TransferResponseAgent:
    def __init__(self, api_key: str, model_name: str, model_type: str = "OPENAI", agent_id: str = None):
        # Initialize model based on type using the utility function
        model = create_model(
            model_type=model_type,
            api_key=api_key,
            model_name=model_name,
            max_tokens=1000
        )

        # Define instructions for transfer response agent
        instructions = [
            INJECTION_CLAUSE,
            "You need to explain why you're transferring the chat to a another agent.",
            "If within business hours and agents are available, explain that you need to transfer to a better qualified agent to help.",
            "If outside business hours or no agents available, apologize and explain that the team will contact them via email.",
            "Be empathetic and professional in your response.",
            "Keep responses concise and clear.",
            "If already transferred, do not transfer again. Tell that someone will get back to them shortly."
        ]

        agent_data_repo = AgentRepository(next(get_db()))
        agent_data = agent_data_repo.get_by_agent_id(
            agent_id) if agent_id else None

        if agent_data:
            # Prepend the identity instruction to the list instead of replacing all instructions
            agent_identity = f"You are {agent_data.display_name if agent_data.display_name else agent_data.name}, representing our company."
            instructions = [agent_identity] + instructions

        self.agent = Agent(
            name="Transfer Response Agent",
            model=model,
            instructions=instructions,
            markdown=True,
            debug_mode=settings.ENVIRONMENT == "development",
            system_message_role="system",
            user_message_role="user",
            num_history_responses=10

        )
        logger.debug(f"Transfer Response Agent: {self.agent.instructions}")

    async def get_business_context(self, business_hours: dict, available_agents: int) -> str:
        """Format business context for the agent"""
        try:
            # Format business hours for each day
            business_hours_text = []
            days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            
            for day in days:
                if day in business_hours:
                    day_hours = business_hours[day]
                    if day_hours.get('enabled', True):
                        business_hours_text.append(
                            f"{day.capitalize()}: {day_hours['start']} - {day_hours['end']}"
                        )
                    else:
                        business_hours_text.append(f"{day.capitalize()}: Closed")

            return (
                "Business Hours:\n" + 
                "\n".join(business_hours_text) + 
                f"\nAvailable Agents: {available_agents}\n"
            )
        except Exception as e:
            logger.error(f"Error formatting business context: {str(e)}")
            # Fallback to basic format
            return f"Business Hours: Standard working hours\nAvailable Agents: {available_agents}\n"

    async def get_transfer_response(
        self,
        chat_history: list,
        business_hours: dict,
        available_agents: int,
        is_business_hours: bool,
        customer_email: str = None,
    ) -> Dict[str, Any]:
        """Get contextual transfer response from agent"""
        logger.debug(f"Transfer Response Agent: {self.agent.instructions}")
        # Format context for agent
        business_context = await self.get_business_context(business_hours, available_agents)
        
        # Add customer email context if available
        email_context = f"\nCustomer email: {customer_email}" if customer_email else "\nNo customer email available"
        
        # Format chat history
        formatted_history = []
        for msg in chat_history:
            role = "User" if msg.message_type == "user" else "Bot"
            formatted_history.append(f"{role}: {msg.message}")
        
        chat_history_text = "\n".join(formatted_history[-5:])  # Get last 5 messages
        
        will_transfer = is_business_hours and available_agents > 0

        # What to say about contact details depends on whether anyone is about to
        # pick this chat up:
        #   - known email        -> name it, so the promise is concrete.
        #   - nobody picking up  -> ASK for an email. Promising a follow-up with no
        #                           way to reach them is a dead end: the visitor
        #                           leaves, and the team opens a chat with no
        #                           contact details at all.
        #   - live transfer      -> stay quiet; a human is arriving in this chat,
        #                           and the handoff form collects details anyway.
        if customer_email:
            contact_instruction = f"Tell them the team will follow up at {customer_email}. "
        elif not will_transfer:
            contact_instruction = (
                "No email is on file and nobody is available to pick this up, so the team "
                "has no way to reach them. ASK them to reply with their email address so the "
                "team can follow up. Ask plainly, in one short sentence. Do NOT mention, "
                "reference, or link to any form; never write a URL, a bracketed placeholder, "
                "or any example email address. "
            )
        else:
            contact_instruction = (
                "No email is on file, but a human agent is joining this chat now, so do NOT "
                "ask for an email. Do NOT mention, reference, or link to any form; never write "
                "a URL, a bracketed placeholder, or any email address. "
            )

        prompt = (
            f"Based on the following context, generate an appropriate response for communicating the transfer of the chat to the different agent:\n\n"
            f"Business Context:\n{business_context}\n"
            f"Currently within business hours: {is_business_hours}"
            f"{email_context}\n\n"
            f"{visitor_data_block('CONVERSATION', chat_history_text)}\n\n"
            f"Instructions for response:\n"
            f"1. If within business hours ({is_business_hours}) and agents available ({available_agents} online), "
            f"explain that you need to transfer to a human agent who can better assist them.\n"
            f"2. If outside business hours or no agents available, if jira tool is available, "
            f"create a ticket so the team can follow up. "
            f"{contact_instruction}"
            f"\n"
            f"3. Keep the response professional and empathetic.\n"
            f"4. Never show a placeholder or fake email address. Make it clear whether they should expect "
            f"immediate help (transfer) or a follow-up.\n"
            f"Generate a natural-sounding response:"
        )

        # Bounded like the chat run: this call happens inside the visitor's turn,
        # so a stuck run would hang the widget even though the handoff decision
        # is already made (#269).
        try:
            response = await asyncio.wait_for(
                self.agent.arun(message=prompt, stream=False),
                timeout=settings.AGENT_RUN_TIMEOUT
            )
        except asyncio.TimeoutError:
            logger.warning(
                f"Transfer agent run timed out after {settings.AGENT_RUN_TIMEOUT}s and was "
                f"cancelled; falling back to a plain handoff line "
                f"(will_transfer={will_transfer})"
            )
            if will_transfer:
                fallback = TRANSFER_TIMEOUT_MESSAGE
            elif customer_email:
                fallback = FOLLOW_UP_TIMEOUT_MESSAGE
            else:
                fallback = FOLLOW_UP_NEEDS_EMAIL_TIMEOUT_MESSAGE
            return {
                "message": fallback,
                "transfer_to_human": will_transfer
            }

        # Use the utility function to parse the response
        response_content = parse_response_content(response)

        return {
            "message": response_content.message,
            "transfer_to_human": will_transfer
        }

async def get_agent_availability_response(
    agent,
    customer_id: str,
    chat_history: list,
    db,
    api_key: str,
    model_name: str,
    model_type: str,
    session_id: str,
    transfer_group_id: str = None
) -> dict:
    customer_repo = CustomerRepository(db)
    group_repo = GroupRepository(db)

    # Check if we have a specific transfer group ID (for workflow transfers)
    if transfer_group_id:
        # For workflow transfers, use the specific group
        try:
            db_group = group_repo.get_group_with_users(transfer_group_id)
            if not db_group:
                return {
                    "message": "I apologize, but I'm unable to transfer the chat at this time.",
                    "transfer_to_human": False
                }
            agent_groups = [db_group]
        except Exception as e:
            logger.error(f"Error getting transfer group {transfer_group_id}: {str(e)}")
            return {
                "message": "I apologize, but I'm unable to transfer the chat at this time.",
                "transfer_to_human": False
            }
    else:
        # Check if agent has groups (normal transfer)
        agent_groups = agent.get("groups") if isinstance(agent, dict) else agent.groups
        if not agent or not agent_groups:
            return {
                "message": "I apologize, but I'm unable to transfer the chat at this time.",
                "transfer_to_human": False
            }

    # Get customer email if customer_id provided. Treat the auto-generated anonymous
    # placeholder (…@noemail.com) as "no email" so the bot never promises to follow up
    # at a fake address — the handoff contact form collects a real one instead.
    customer_email = None
    if customer_id:
        customer_email = customer_repo.get_customer_email(customer_id)
        if CustomerRepository.is_placeholder_email(customer_email):
            customer_email = None

    # Get available users with proper session handling
    available_users = []
    for group in agent_groups:
        # Reload group with users relationship
        db_group = group_repo.get_group_with_users(group.id)
        if db_group:
            for user in db_group.users:
                if user.is_online and user.is_active:
                    available_users.append(user)

    # Get organization's business hours
    org = agent.get("organization") if isinstance(agent, dict) else getattr(agent, 'organization', None)
    
    business_hours = org.business_hours if org and hasattr(org, 'business_hours') else {
        'monday': {'start': '09:00', 'end': '17:00', 'enabled': True},
        'tuesday': {'start': '09:00', 'end': '17:00', 'enabled': True},
        'wednesday': {'start': '09:00', 'end': '17:00', 'enabled': True},
        'thursday': {'start': '09:00', 'end': '17:00', 'enabled': True},
        'friday': {'start': '09:00', 'end': '17:00', 'enabled': True},
        'saturday': {'start': '09:00', 'end': '17:00', 'enabled': False},
        'sunday': {'start': '09:00', 'end': '17:00', 'enabled': False}
    }

    # Get organization timezone
    org_tz_name = org.timezone if org and hasattr(org, 'timezone') else 'UTC'
    try:
        org_tz = pytz.timezone(org_tz_name)
    except pytz.UnknownTimeZoneError:
        logger.warning(f"Invalid timezone {org_tz_name}, using UTC")
        org_tz = pytz.UTC

    # Get current time in organization timezone
    current_time = datetime.now(org_tz)
    current_day = current_time.strftime('%A').lower()

    # Get today's business hours with proper fallbacks
    today_hours = business_hours.get(current_day, {
        'start': '09:00',
        'end': '17:00',
        'enabled': False
    })

    # Parse hours correctly with error handling
    try:
        start_hour, start_minute = map(int, today_hours.get('start', '09:00').split(':'))
        end_hour, end_minute = map(int, today_hours.get('end', '17:00').split(':'))
    except ValueError as e:
        logger.error(f"Error parsing business hours: {str(e)}")
        # Fallback to default hours
        start_hour, start_minute = 9, 0
        end_hour, end_minute = 17, 0

    # Calculate time in minutes correctly
    current_time_in_minutes = current_time.hour * 60 + current_time.minute
    start_time_in_minutes = start_hour * 60 + start_minute
    end_time_in_minutes = end_hour * 60 + end_minute

    # Determine if within business hours
    is_enabled = today_hours.get('enabled', False)
    is_within_hours = start_time_in_minutes <= current_time_in_minutes <= end_time_in_minutes
    is_business_hours = is_enabled and is_within_hours


    # Create transfer response agent
    transfer_agent = TransferResponseAgent(
        api_key=api_key,
        model_name=model_name,
        model_type=model_type,
        agent_id=agent.get("id") if isinstance(agent, dict) else agent.id
    )

    # Check if Jira is enabled for this agent
    jira_enabled = False
    if isinstance(agent, dict):
        jira_enabled = agent.get("jira_enabled", False)
    else:
        # Handle the case when jira_enabled attribute doesn't exist
        jira_enabled = getattr(agent, 'jira_enabled', False)

    if jira_enabled:
        jira_tools = JiraTools(
            agent_id=agent.get("id") if isinstance(agent, dict) else agent.id,
            org_id=org.id,
            session_id=session_id
        )
        transfer_agent.agent.tools = [jira_tools]

    # Get contextual response
    response = await transfer_agent.get_transfer_response(
        chat_history=chat_history or [],
        business_hours=business_hours,
        available_agents=len(available_users),
        is_business_hours=is_business_hours,
        customer_email=customer_email,
    )

    return response 