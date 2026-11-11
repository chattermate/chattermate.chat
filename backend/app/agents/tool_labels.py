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

What the visitor sees while the agent uses a tool: a kind (for the icon) and a
label for the start and the end of the step. Only the tool's name is read,
never its arguments or result.
"""

from dataclasses import dataclass
from typing import Mapping, Optional


@dataclass(frozen=True)
class ToolLabel:
    kind: str
    label: str
    done_label: str


_KNOWLEDGE = ToolLabel('knowledge', 'Searching the help center', 'Searched the help center')
_PRODUCTS = ToolLabel('products', 'Looking through the store', 'Looked through the store')
_ORDER = ToolLabel('order', 'Checking your order', 'Checked your order')
_TICKET_STATUS = ToolLabel('ticket', 'Checking your ticket', 'Checked your ticket')
_TICKET_NEW = ToolLabel('ticket', 'Opening a ticket', 'Opened a ticket')
_DATA = ToolLabel('mcp', 'Looking up your account', 'Looked up your account')

TOOL_LABELS: Mapping[str, ToolLabel] = {
    'search_knowledge_base': _KNOWLEDGE,
    'search_faqs': _KNOWLEDGE,
    'list_products': _PRODUCTS,
    'get_product': _PRODUCTS,
    'search_products': _PRODUCTS,
    'recommend_products': _PRODUCTS,
    'search_orders': _ORDER,
    'get_order_status': _ORDER,
    'create_ticket': _TICKET_NEW,
    'create_jira_ticket': _TICKET_NEW,
    'get_ticket_status': _TICKET_STATUS,
    'check_existing_ticket': _TICKET_STATUS,
    'list_database_tables': _DATA,
    'describe_database_table': _DATA,
    'query_database': _DATA,
}

_GENERIC = ToolLabel('other', 'Working on it', 'Done')

# Plumbing, not work the visitor should see: the Groq structured-output tool.
HIDDEN_TOOLS = frozenset({'json'})


def label_for(function_name: str, connector: Optional[str] = None) -> ToolLabel:
    """The label for a tool call; a connector's tool reads "Checking <connector>"."""
    known = TOOL_LABELS.get(function_name)
    if known is not None:
        return known
    if connector:
        return ToolLabel('mcp', f'Checking {connector}', f'Checked {connector}')
    return _GENERIC
