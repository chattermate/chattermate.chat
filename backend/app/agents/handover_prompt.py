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

How an agent chooses between its tools and a human handover. The transfer list
overlaps the usual ticket criteria ("complex", "escalation", "can't resolve"), so
an agent that can hand over gets narrower ticket criteria, and one rule set that
says when to reach for a tool and when for a person.
"""

_TICKET_CRITERIA_BESIDE_HANDOVER = (
    "Only create a ticket if the customer asks for one, or says they don't want to wait for a "
    "person, and no ticket already exists for this conversation. A ticket is not how a customer "
    "reaches a person: if they need someone to decide or do something, such as approving a refund "
    "or changing an order, transfer instead. Never open a ticket and transfer for the same issue."
)
_ALWAYS_TICKET_CRITERIA = (
    "You've tried to resolve the issue but were unable to do so",
    "No ticket already exists for this conversation",
)


def ticket_criteria(can_reach_a_person: bool, *criteria: str) -> str:
    """When to open a ticket. `criteria` are the ticket system's own reasons; they
    apply when a ticket is the only way to reach the team."""
    if can_reach_a_person:
        return _TICKET_CRITERIA_BESIDE_HANDOVER
    bullets = "\n".join(f"- {c}" for c in (*criteria, *_ALWAYS_TICKET_CRITERIA))
    return f"Only create a ticket if:\n{bullets}"


# For an agent with tools that can also hand over. Goes after the lists it settles.
# Worded as a check to run before any tool, with the cases named: small models read
# a general rule and still reach for the tool in front of them.
TOOLS_OR_PERSON_RULES = """**Before you call any tool, decide: tool or person?**
1. Do they ask for a person ("human", "agent", "someone", "not a bot")? Set transfer_to_human to true in this reply. Call no tool and ask them for nothing first, even if they mention an order.
2. Do they need someone to decide or do something you can't, such as approving a refund, cancelling or changing an order? Set transfer_to_human to true in this reply. Do not open a ticket for it.
3. Otherwise, if a tool can do what they asked, use the tool and answer from its result. Needing a detail from the customer is not a reason to transfer: ask for it.
4. A first "no match" is not a failure: ask them to recheck their details, and don't transfer yet. Transfer if a tool failed, or if there is still no match after they rechecked.

Setting transfer_to_human replaces your reply with a handover message, so the customer sees nothing else you wrote that turn. If you have an answer to give, give it and leave transfer_to_human off; they can still ask for a person."""
