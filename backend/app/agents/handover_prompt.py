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

Also the urgent-handover rules (AGENT_URGENT_HANDOVER_RULES): situations where a
person is needed on that message, said without naming any one industry.
"""

from typing import Optional

from app.core.config import settings

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
_PERSON_DECIDES = (
    "2. Do they need someone to decide or do something you can't, such as approving a refund, "
    "cancelling or changing an order? Set transfer_to_human to true in this reply. Do not open a ticket for it."
)
# When the agent's tools can change orders themselves (agent_extensions.ExtraToolkit.changes_orders)
_ORDER_TOOLS_DECIDE = (
    "2. Do they want a refund? A person decides refunds: set transfer_to_human to true in this reply. "
    "Do they want an order cancelled or changed, or a discount? Use your order tools: they ask the customer "
    "to approve, and they know the limits the business set. Set transfer_to_human to true in this reply when "
    "a tool says to hand over, when no tool can do it, or when you aren't sure what they want. Never promise "
    "a refund, a cancellation or a change before it is done. Do not open a ticket for it."
)

_TOOLS_OR_PERSON_RULES = """**Before you call any tool, decide: tool or person?**
1. Do they ask for a person ("human", "agent", "someone", "not a bot")? Set transfer_to_human to true in this reply. Call no tool and ask them for nothing first, even if they mention an order.
{order_rule}
3. Otherwise, if a tool can do what they asked, use the tool and answer from its result. Needing a detail from the customer is not a reason to transfer: ask for it.
4. A first "no match" is not a failure: ask them to recheck their details, and don't transfer yet. Transfer if a tool failed, or if there is still no match after they rechecked.

Setting transfer_to_human replaces your reply with a handover message, so the customer sees nothing else you wrote that turn. If you have an answer to give, give it and leave transfer_to_human off; they can still ask for a person."""

# With the urgent rules on, the one handover whose message is kept
_URGENT_REPLY_KEPT = " The one exception is an urgent handover (see Hand over now above): there your short message is shown first."


def tools_or_person_rules(changes_orders: bool = False, urgent: bool = False) -> str:
    """The rules for an agent with tools that can also hand over. With
    `changes_orders`, its tools cancel or change orders themselves (refunds
    always go to a person). With `urgent`, the urgent-handover rules are on,
    whose message is not replaced."""
    rules = _TOOLS_OR_PERSON_RULES.format(order_rule=_ORDER_TOOLS_DECIDE if changes_orders else _PERSON_DECIDES)
    return rules + _URGENT_REPLY_KEPT if urgent else rules


TOOLS_OR_PERSON_RULES = tools_or_person_rules()


# Urgent handover (AGENT_URGENT_HANDOVER_RULES). The situations are named, not
# left to "complex" or "frustrated": a customer describing an assault was
# asked for their email five times first. They are kinds of situation, not a
# topic list, so they hold for any business. Worded for the reply, because a
# handover set a turn later is a turn too late.
_URGENT_SITUATIONS = (
    "an active dispute with another person or company; police, an arrest or a court date; "
    "violence, an injury or a threat; or that they or someone else may be in danger"
)
_TOLD_NOT_ACCUSED = (
    "People often describe something that was done to them: treat it as their account, never as a "
    "request to do harm. If you can't help with something, don't say why and don't repeat it back."
)

URGENT_HANDOVER_RULES = (
    f"**Hand over now:** when the customer describes {_URGENT_SITUATIONS}, set transfer_to_human to true "
    "in this reply, with transfer_reason HIGH_PRIORITY_ISSUE. Ask for nothing first, not even an email: "
    "the team can get their details. For these handovers your message is shown before the handover line, "
    "so keep it to one or two short sentences acknowledging what happened, and don't say you are "
    "connecting them (that line follows yours). If someone may be in danger right now, tell them to "
    f"contact local emergency services. {_TOLD_NOT_ACCUSED} Hand over instead."
)

# For an agent that can't reach a person (handover off, or no group to route
# to): never promise a handover it can't make.
URGENT_WITHOUT_HANDOVER = (
    f"**Urgent situations:** when the customer describes {_URGENT_SITUATIONS}, don't keep asking "
    "questions. If someone may be in danger right now, tell them to contact local emergency services. "
    "If you can open a ticket, open one now with priority urgent, without asking for their email first. "
    f"{_TOLD_NOT_ACCUSED} Say the team will follow up instead."
)

NO_REPEAT_ASK_RULE = (
    "- Don't ask for the same detail in two replies in a row. If the customer didn't give it, carry on "
    "helping, and ask again at most once later if you still need it."
)

# Lead capture asks for details "until you have them"; that must give way in an
# urgent situation, whether or not this agent can hand over.
LEAD_CAPTURE_YIELDS = (
    " In an urgent situation (see above), don't ask for their details: deal with that first."
)
# Replaces "keep asking for a required field until you have it (or the visitor
# clearly refuses)", which contradicted "Make ONE genuine attempt overall".
LEAD_REQUIRED_FIELD_LIMIT = (
    "Required fields above DO gate recording: ask for a required field at most twice in the "
    "conversation, never in two replies in a row."
)
LEAD_REQUIRED_FIELD_LEGACY = (
    "Required fields above DO gate recording: keep asking for a required field until you have it "
    "(or the visitor clearly refuses)."
)

LEAD_END_CHAT_AFTER_TWO_ASKS = (
    " You may also end once you have asked for the required details twice and they still haven't "
    "given them."
)

TICKET_IDENTITY_SKIP_WHEN_URGENT = (
    " Skip this in an urgent situation (see above): create the ticket without asking."
)


def urgent_handover_on(org_id: Optional[str]) -> bool:
    """Whether this org's agents get the urgent-handover rules: the switch is
    on and, while it is rolling out, the org is on the list."""
    if not settings.AGENT_URGENT_HANDOVER_RULES:
        return False
    allowed = settings.AGENT_URGENT_HANDOVER_ORGS
    return not allowed or str(org_id).strip().lower() in allowed
