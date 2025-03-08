"""
ChatterMate - Transfer Agent
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

from typing import Dict, Any
from datetime import datetime
import pytz
from phi.agent import Agent
from phi.model.openai import OpenAIChat
from app.repositories.agent import AgentRepository
from app.repositories.customer import CustomerRepository
from app.core.logger import get_logger
from app.database import get_db
from app.repositories.group import GroupRepository

logger = get_logger(__name__)

class TransferResponseAgent:
    def __init__(self, api_key: str, model_name: str, model_type: str = "OPENAI", agent_id: str = None):
        # Initialize model based on type
        if model_type == 'OPENAI':
            model = OpenAIChat(api_key=api_key, id=model_name, max_tokens=1000)
        elif model_type == 'ANTHROPIC':
            from phi.model.anthropic import Claude
            model = Claude(api_key=api_key, id=model_name, max_tokens=1000)
        elif model_type == 'DEEPSEEK':
            from phi.model.deepseek import DeepSeekChat
            model = DeepSeekChat(api_key=api_key, id=model_name, max_tokens=1000)
        elif model_type == 'GOOGLE':
            from phi.model.google import Gemini
            model = Gemini(api_key=api_key, id=model_name, max_tokens=1000)
        elif model_type == 'GOOGLEVERTEX':
            from phi.model.vertexai import Gemini
            model = Gemini(api_key=api_key, id=model_name, max_tokens=1000)
        elif model_type == 'GROQ':
            from phi.model.groq import Groq
            model = Groq(api_key=api_key, id=model_name, max_tokens=1000)
        elif model_type == 'MISTRAL':
            from phi.model.mistral import MistralChat
            model = MistralChat(api_key=api_key, id=model_name, max_tokens=1000)
        elif model_type == 'HUGGINGFACE':
            from phi.model.huggingface import HuggingFaceChat
            model = HuggingFaceChat(api_key=api_key, id=model_name, max_tokens=1000)
        elif model_type == 'OLLAMA':
            from phi.model.ollama import Ollama
            model = Ollama(id=model_name)
        elif model_type == 'XAI':
            from phi.model.xai import xAI
            model = xAI(api_key=api_key, id=model_name, max_tokens=1000)
        else:
            raise ValueError(f"Unsupported model type: {model_type}")


        # Define instructions for transfer response agent
        instructions = [
            "You need to explain why you're transferring the chat to a another agent.",
            "If within business hours and agents are available, explain that you need to transfer to a better qualified agent to help.",
            "If outside business hours or no agents available, apologize and explain that the team will contact them via email.",
            "Be empathetic and professional in your response.",
            "Keep responses concise and clear."
        ]

        agent_data_repo = AgentRepository(next(get_db()))
        agent_data = agent_data_repo.get_by_agent_id(
            agent_id) if agent_id else None

        if agent_data:
            instructions = [
                f"You are {agent_data.display_name if agent_data.display_name else agent_data.name}, representing our company.",
                *agent_data.instructions
            ]

        self.agent = Agent(
            name="Transfer Response Agent",
            model=model,
            instructions=instructions,
            markdown=True,
            debug_mode=True
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
        customer_email: str = None
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
        
        prompt = (
            f"Based on the following context, generate an appropriate response for communicating the transfer of the chat to the different agent:\n\n"
            f"Business Context:\n{business_context}\n"
            f"Currently within business hours: {is_business_hours}"
            f"{email_context}\n\n"
            f"Recent conversation history:\n"
            f"{chat_history_text}\n\n"
            f"Instructions for response:\n"
            f"1. If within business hours ({is_business_hours}) and agents available ({available_agents} online), "
            f"explain that you need to transfer to a human agent who can better assist them.\n"
            f"2. If outside business hours or no agents available, "
            f"apologize and inform that the team will contact them"
            f"{' at ' + customer_email if customer_email else ''}.\n"
            f"3. Keep the response professional and empathetic.\n"
            f"4. Make it clear whether they should expect immediate help (transfer) "
            f"or a follow-up email.\n"
            f"Generate a natural-sounding response:"
        )

        response = await self.agent.arun(message=prompt, stream=False)
        
        return {
            "message": response.content,
            "transfer_to_human": is_business_hours and available_agents > 0
        }

async def get_agent_availability_response(
    agent,
    customer_id: str,
    chat_history: list,
    db,
    api_key: str,
    model_name: str,
    model_type: str
) -> dict:
    customer_repo = CustomerRepository(db)
    group_repo = GroupRepository(db)

    # Check if agent has groups
    agent_groups = agent.get("groups") if isinstance(agent, dict) else agent.groups
    if not agent or not agent_groups:
        return {
            "message": "I apologize, but I'm unable to transfer the chat at this time.",
            "transfer_to_human": False
        }

    # Get customer email if customer_id provided
    customer_email = None
    if customer_id:
        customer_email = customer_repo.get_customer_email(customer_id)

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


    # Get contextual response
    response = await transfer_agent.get_transfer_response(
        chat_history=chat_history or [],
        business_hours=business_hours,
        available_agents=len(available_users),
        is_business_hours=is_business_hours,
        customer_email=customer_email
    )

    return response 