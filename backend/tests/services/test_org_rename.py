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

import pytest

from app.models.agent import Agent, AgentCustomization, AgentType
from app.models.organization import Organization
from app.services.org_rename import carry_org_rename, name_pattern


@pytest.mark.parametrize("text, expected", [
    ("Welcome to Bodhiorchard", "Welcome to GlideShip"),
    ("Bodhiorchard Sales & Product Guide", "GlideShip Sales & Product Guide"),
    ("Bodhiorchard's team.", "GlideShip's team."),
    # Only the name as the org spelt it
    ("Ask bodhiorchard anything.", "Ask bodhiorchard anything."),
    # Addresses and longer words are left alone
    ("See bodhiorchard.com/pricing", "See bodhiorchard.com/pricing"),
    ("Mail hello@bodhiorchard.com", "Mail hello@bodhiorchard.com"),
    ("https://app.bodhiorchard.io", "https://app.bodhiorchard.io"),
    ("Bodhiorchard-Pay and Bodhiorchards", "Bodhiorchard-Pay and Bodhiorchards"),
])
def test_name_pattern_swaps_only_the_name(text, expected):
    assert name_pattern("Bodhiorchard").sub("GlideShip", text) == expected


def _agent(db, org, **fields):
    agent = Agent(organization_id=org.id, agent_type=AgentType.CUSTOMER_SUPPORT, **fields)
    db.add(agent)
    db.flush()
    return agent


@pytest.fixture
def org(db):
    org = Organization(name="Bodhiorchard", domain="bodhiorchard.com", timezone="UTC")
    db.add(org)
    db.commit()
    return org


def test_rename_carries_into_agent_and_widget_copy(db, org):
    agent = _agent(
        db, org,
        name="Bodhiorchard Sales & Product Guide",
        display_name="GlideAgent",
        description="Public website assistant for Bodhiorchard product questions.",
        instructions=["You represent Bodhiorchard.", "Link to https://bodhiorchard.com/demo"],
        topic_scope="Bodhiorchard products",
        guardrail_prompt="You are Bodhiorchard's assistant.",
    )
    db.add(AgentCustomization(agent_id=agent.id, welcome_title="Welcome to Bodhiorchard",
                              welcome_subtitle="AI-native delivery", welcome_message=None))
    db.commit()

    assert carry_org_rename(db, org.id, "Bodhiorchard", "GlideShip") == 1
    db.commit()
    db.refresh(agent)

    assert agent.name == "GlideShip Sales & Product Guide"
    assert agent.display_name == "GlideAgent"
    assert agent.description == "Public website assistant for GlideShip product questions."
    assert agent.instructions == ["You represent GlideShip.", "Link to https://bodhiorchard.com/demo"]
    assert agent.topic_scope == "GlideShip products"
    assert agent.guardrail_prompt == "You are GlideShip's assistant."
    assert agent.customization.welcome_title == "Welcome to GlideShip"
    assert agent.customization.welcome_subtitle == "AI-native delivery"
    assert agent.customization.welcome_message is None


def test_rename_leaves_other_orgs_alone(db, org):
    other = Organization(name="Other", domain="other.com", timezone="UTC")
    db.add(other)
    db.flush()
    theirs = _agent(db, other, name="Bodhiorchard fan club", instructions=["x"])
    db.commit()

    assert carry_org_rename(db, org.id, "Bodhiorchard", "GlideShip") == 0
    db.refresh(theirs)
    assert theirs.name == "Bodhiorchard fan club"


def test_rename_skips_a_role_line_it_would_overflow(db, org):
    agent = _agent(db, org, name="Bodhiorchard " + "x" * 80, instructions=["x"])
    db.commit()
    carry_org_rename(db, org.id, "Bodhiorchard", "G" * 30)
    db.commit()
    db.refresh(agent)
    assert agent.name.startswith("Bodhiorchard ")


def test_a_common_word_name_swaps_only_its_own_spelling(db, org):
    org.name = "Help"
    agent = _agent(db, org, name="Help desk", instructions=["Help customers.", "Ask for help."])
    db.commit()
    carry_org_rename(db, org.id, "Help", "Acme")
    db.commit()
    db.refresh(agent)
    assert agent.instructions == ["Acme customers.", "Ask for help."]


@pytest.mark.parametrize("old, new", [("", "GlideShip"), ("Bodhiorchard", ""), ("Acme", "Acme"), (None, "X")])
def test_no_rename_means_no_change(db, org, old, new):
    agent = _agent(db, org, name="Acme guide", instructions=["x"])
    db.commit()
    assert carry_org_rename(db, org.id, old, new) == 0
    db.refresh(agent)
    assert agent.name == "Acme guide"
