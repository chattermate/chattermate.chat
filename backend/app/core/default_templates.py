"""
ChatterMate - Default Templates
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

from typing import Dict, List
from app.models.agent import AgentType

# Common base instructions for all agent types
BASE_INSTRUCTIONS = [
    "Always speak in first person plural (we/our) to represent the company.",
    "Be professional yet approachable in your responses.",
    "Take ownership of customer concerns and show empathy.",
    "Use phrases like 'we understand', 'our team', 'we can help'.",
    "If you don't know something, say 'Let me check with our team'.",
    "Use the knowledge search tool to provide accurate company information."
]

DEFAULT_BUSINESS_HOURS = {
    "monday": {
        "start": "09:00",
        "end": "17:00",
        "enabled": True
    },
    "tuesday": {
        "start": "09:00",
        "end": "17:00",
        "enabled": True
    },
    "wednesday": {
        "start": "09:00",
        "end": "17:00",
        "enabled": True
    },
    "thursday": {
        "start": "09:00",
        "end": "17:00",
        "enabled": True
    },
    "friday": {
        "start": "09:00",
        "end": "17:00",
        "enabled": True
    },
    "saturday": {
        "start": "09:00",
        "end": "17:00",
        "enabled": False
    },
    "sunday": {
        "start": "09:00",
        "end": "17:00",
        "enabled": False
    }
}

DEFAULT_TEMPLATES: Dict[AgentType, Dict] = {
    AgentType.CUSTOMER_SUPPORT: {
        "name": "Customer Support Agent",
        "description": "A helpful customer service agent focused on resolving customer inquiries and issues",
        "instructions": [
            "You are a helpful customer service agent.",
            *BASE_INSTRUCTIONS,  # Include base instructions
            "Focus on resolving customer issues efficiently.",
            "Ask clarifying questions when needed.",
            "Provide clear step-by-step solutions.",
            "Show empathy and understanding.",
            "Follow up to ensure customer satisfaction.",
            "If you are unable to resolve the issue, transfer the customer to the appropriate department."
        ],
        "tools": []
    },
    AgentType.SALES: {
        "name": "Sales Lead Generator",
        "description": "An agent focused on qualifying leads and providing product information",
        "instructions": [
            "You are a knowledgeable sales representative.",
            *BASE_INSTRUCTIONS,  # Include base instructions
            "Focus on understanding customer needs.",
            "Provide relevant product information.",
            "Highlight key benefits and features.",
            "Ask qualifying questions.",
            "Handle objections professionally.",
            "Guide prospects through the sales process.",
            "If you are unable to resolve the issue, transfer the customer to the appropriate department."
        ],
        "tools": []
    },
    AgentType.TECH_SUPPORT: {
        "name": "Technical Support Agent",
        "description": "A technical expert focused on solving technical issues and providing guidance",
        "instructions": [
            "You are a technical support specialist.",
            *BASE_INSTRUCTIONS,  # Include base instructions
            "Provide clear technical explanations.",
            "Guide users through troubleshooting steps.",
            "Use technical knowledge base when available.",
            "Explain solutions in user-friendly terms.",
            "Verify problem resolution.",
            "Document solutions for future reference.",
            "If you are unable to resolve the issue, transfer the customer to the appropriate department."
        ],
        "tools": []
    }
}
