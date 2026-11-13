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

The widget framed on our own origin: the frame page, its bootstrap call, and
the allowed-domains settings behind its frame-ancestors.
"""

import re
import uuid

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import widget as widget_router
from app.api import widget_common
from app.api import widget_frame as frame_router
from app.core.auth import get_current_user
from app.core.config import settings
from app.database import get_db
from app.models.agent import Agent, AgentCustomization
from app.models.customer import Customer
from app.models.organization import Organization
from app.models.widget import Widget
from app.services import conversation_token, widget_bootstrap, widget_plan


@pytest.fixture
def app(db, test_user):
    app = FastAPI()
    app.include_router(widget_router.router, prefix="/api/v1/widgets")
    app.include_router(frame_router.router, prefix="/api/v1/widgets")

    def override_get_db():
        yield db

    async def override_user():
        return test_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_user
    return app


@pytest.fixture
def client(app) -> TestClient:
    return TestClient(app)


@pytest.fixture
def identified_token(db, test_widget, test_organization) -> str:
    customer = Customer(organization_id=test_organization.id, email="signed.in@example.com", is_authenticated=True)
    db.add(customer)
    db.commit()
    token, _, _ = conversation_token.mint(
        {
            "sub": str(customer.id),
            "customer_id": str(customer.id),
            "widget_id": str(test_widget.id),
            "customer_email": customer.email,
        },
        ttl_seconds=600,
    )
    return token


@pytest.fixture
def restricted(db, test_widget):
    test_widget.allowed_domains = ["acme.com"]
    db.commit()
    return test_widget


def frame_url(widget) -> str:
    return f"/api/v1/widgets/{widget.id}/frame"


def bootstrap(client, widget, token=None, **body):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    return client.post(f"/api/v1/widgets/{widget.id}/bootstrap", json=body, headers=headers)


class TestFramePage:
    def test_serves_the_widget_shell_without_a_token(self, client, test_widget):
        response = client.get(frame_url(test_widget))

        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]
        assert response.headers["cache-control"] == "no-store"
        assert "__CM_FRAME__" in response.text
        assert f'"widgetId": "{test_widget.id}"' in response.text
        assert "initialToken" not in response.text
        assert "__INITIAL_DATA__" not in response.text

    def test_loads_the_bundle_from_its_own_api_base(self, client, test_widget, monkeypatch):
        monkeypatch.setattr(settings, "BACKEND_URL", "https://api.example.com")
        response = client.get(frame_url(test_widget))
        assert 'src="https://api.example.com/assets/widget.js' in response.text
        assert 'href="https://api.example.com/assets/widget.css' in response.text

    def test_scripts_run_only_from_the_bundle_folder(self, client, test_widget, monkeypatch):
        monkeypatch.setattr(settings, "BACKEND_URL", "https://api.example.com")
        csp = client.get(frame_url(test_widget)).headers["content-security-policy"]
        assert "script-src https://api.example.com/assets/ 'nonce-" in csp

    def test_builds_the_allowed_domains_once_per_load(self, client, restricted, monkeypatch):
        from app.services import widget_embed_policy
        calls = []
        original = widget_embed_policy.frame_ancestors
        monkeypatch.setattr(widget_embed_policy, "frame_ancestors", lambda *a: calls.append(a) or original(*a))
        client.get(frame_url(restricted), headers={"Sec-Fetch-Dest": "iframe", "Referer": "https://elsewhere.example/"})
        assert len(calls) == 1

    def test_inline_config_runs_only_with_the_csp_nonce(self, client, test_widget):
        response = client.get(frame_url(test_widget))
        csp = response.headers["content-security-policy"]
        nonce = re.search(r"'nonce-([^']+)'", csp).group(1)

        assert f'<script nonce="{nonce}">' in response.text
        assert "object-src 'none'" in csp
        assert "base-uri 'none'" in csp

    def test_a_new_nonce_every_time(self, client, test_widget):
        first = client.get(frame_url(test_widget)).headers["content-security-policy"]
        second = client.get(frame_url(test_widget)).headers["content-security-policy"]
        assert first != second

    def test_embeddable_anywhere_by_default(self, client, test_widget):
        csp = client.get(frame_url(test_widget)).headers["content-security-policy"]
        assert "frame-ancestors" not in csp
        assert "x-frame-options" not in client.get(frame_url(test_widget)).headers

    def test_allowed_domains_become_frame_ancestors(self, client, restricted):
        csp = client.get(frame_url(restricted)).headers["content-security-policy"]
        assert "frame-ancestors https://admin.shopify.com" in csp
        assert "'self'" not in csp.split("frame-ancestors", 1)[1]
        assert " https://acme.com" in csp

    def test_unknown_widget(self, client):
        assert client.get(f"/api/v1/widgets/{uuid.uuid4()}/frame").status_code == 404

    @pytest.mark.parametrize("bad", [["a.com:\uff18\uff10"], ["a.com:\u0668\u0660"], [123], [None], ["x; script-src *"]])
    def test_a_hand_edited_bad_row_never_takes_the_widget_down(self, client, db, test_widget, bad):
        test_widget.allowed_domains = bad + ["acme.com"]
        db.commit()

        for path in ("frame", "data"):
            response = client.get(f"/api/v1/widgets/{test_widget.id}/{path}")
            assert response.status_code == 200
            assert " https://acme.com" in response.headers["content-security-policy"]

    def test_reports_a_site_its_allowed_domains_refuse(self, client, restricted, monkeypatch):
        seen = []
        monkeypatch.setattr(frame_router, "note_install", lambda db, widget, origin, request, bg, load: seen.append((origin, load)))

        client.get(frame_url(restricted), headers={"Sec-Fetch-Dest": "iframe", "Referer": "https://elsewhere.io/"})
        client.get(frame_url(restricted), headers={"Sec-Fetch-Dest": "iframe", "Referer": "https://www.acme.com/page"})
        client.get(frame_url(restricted), headers={"Sec-Fetch-Dest": "document", "Referer": "https://elsewhere.io/"})
        client.get(frame_url(restricted), headers={"Sec-Fetch-Dest": "iframe"})

        assert seen == [("https://elsewhere.io", "refused")]

    def test_an_open_widget_reports_no_refusals(self, client, test_widget, monkeypatch):
        seen = []
        monkeypatch.setattr(frame_router, "note_install", lambda *a: seen.append(a))
        client.get(frame_url(test_widget), headers={"Sec-Fetch-Dest": "iframe", "Referer": "https://elsewhere.io/"})
        assert seen == []

    def test_json_in_the_shell_cannot_close_its_script(self, client, test_widget, monkeypatch):
        monkeypatch.setattr(settings, "WIDGET_FRAME_URL", "https://x.example/</script><script>alert(1)//")
        response = client.get(frame_url(test_widget), headers={"Host": "x.example"})
        assert "</script><script>alert(1)" not in response.text

    def test_talks_to_the_frame_host_when_one_is_configured(self, client, test_widget, monkeypatch):
        monkeypatch.setattr(settings, "WIDGET_FRAME_URL", "https://widget.example.com")
        response = client.get(frame_url(test_widget), headers={"Host": "widget.example.com"})

        assert response.status_code == 200
        assert '"API_URL": "https://widget.example.com/api/v1"' in response.text
        assert '"WS_URL": "wss://widget.example.com"' in response.text
        assert "connect-src 'self' https://widget.example.com wss://widget.example.com" in response.headers["content-security-policy"]

    def test_sends_a_request_on_the_api_host_to_the_frame_host(self, client, test_widget, monkeypatch):
        monkeypatch.setattr(settings, "WIDGET_FRAME_URL", "https://widget.example.com")
        monkeypatch.setattr(settings, "BACKEND_URL", "https://api.example.com")
        response = client.get(
            f"{frame_url(test_widget)}?host=1",
            headers={"Host": "api.example.com"},
            follow_redirects=False,
        )

        assert response.status_code == 302
        assert response.headers["location"] == (
            f"https://widget.example.com/api/v1/widgets/{test_widget.id}/frame?host=1&cm_hop=1"
        )

    def test_the_redirect_is_cacheable(self, client, test_widget, monkeypatch):
        # Same for every visitor: the browser keeps it instead of a round trip per page view
        monkeypatch.setattr(settings, "WIDGET_FRAME_URL", "https://widget.example.com")
        response = client.get(frame_url(test_widget), headers={"Host": "api.example.com"}, follow_redirects=False)
        assert response.headers["cache-control"] == "public, max-age=3600"

    @pytest.mark.parametrize("frame_url_setting,host", [
        ("https://widget.example.com:443", "widget.example.com"),
        ("https://widget.example.com", "widget.example.com:443"),
        ("https://Widget.Example.com", "widget.example.com"),
    ])
    def test_a_default_port_or_case_still_names_the_frame_host(self, client, test_widget, monkeypatch,
                                                              frame_url_setting, host):
        monkeypatch.setattr(settings, "WIDGET_FRAME_URL", frame_url_setting)
        response = client.get(frame_url(test_widget), headers={"Host": host}, follow_redirects=False)
        assert response.status_code == 200

    def test_a_hop_to_a_cookie_host_written_with_its_default_port_is_refused(self, client, test_widget, monkeypatch):
        monkeypatch.setattr(settings, "WIDGET_FRAME_URL", "https://widget.example.com")
        monkeypatch.setattr(settings, "BACKEND_URL", "https://api.example.com")
        response = client.get(f"{frame_url(test_widget)}?cm_hop=1", headers={"Host": "api.example.com:443"},
                              follow_redirects=False)
        assert response.status_code == 421

    def test_any_other_cookie_carrying_host_is_sent_over_too(self, client, test_widget, monkeypatch):
        # e.g. a dashboard host that proxies /api/: its cookies must not reach the frame
        monkeypatch.setattr(settings, "WIDGET_FRAME_URL", "https://widget.example.com")
        response = client.get(frame_url(test_widget), headers={"Host": "app.example.com"}, follow_redirects=False)
        assert response.status_code == 302
        assert response.headers["location"].startswith("https://widget.example.com/")

    def test_a_proxy_forwarding_an_internal_host_is_served_after_one_hop(self, client, test_widget, monkeypatch):
        # The frame host's proxy rewrote Host: bouncing again would loop forever
        monkeypatch.setattr(settings, "WIDGET_FRAME_URL", "https://widget.example.com")
        response = client.get(f"{frame_url(test_widget)}?host=1&cm_hop=1", headers={"Host": "backend:8000"},
                              follow_redirects=False)
        assert response.status_code == 200

    @pytest.mark.parametrize("host", ["api.example.com", "app.example.com"])
    def test_a_hop_never_lands_the_frame_on_a_cookie_host(self, client, test_widget, monkeypatch, host):
        monkeypatch.setattr(settings, "WIDGET_FRAME_URL", "https://widget.example.com")
        monkeypatch.setattr(settings, "BACKEND_URL", "https://api.example.com")
        monkeypatch.setattr(settings, "FRONTEND_URL", "https://app.example.com")
        response = client.get(f"{frame_url(test_widget)}?cm_hop=1", headers={"Host": host}, follow_redirects=False)
        assert response.status_code == 421
        assert "__CM_FRAME__" not in response.text

    def test_loads_the_bundle_under_the_api_base_behind_a_path_prefix(self, client, test_widget, monkeypatch):
        monkeypatch.setattr(settings, "WIDGET_FRAME_URL", "https://example.com/chat")
        response = client.get(frame_url(test_widget), headers={"Host": "example.com"})
        assert 'src="https://example.com/chat/assets/widget.js' in response.text

    def test_without_a_frame_host_it_serves_wherever_it_is_asked(self, client, test_widget, monkeypatch):
        monkeypatch.setattr(settings, "WIDGET_FRAME_URL", "")
        response = client.get(frame_url(test_widget), headers={"Host": "api.example.com"}, follow_redirects=False)
        assert response.status_code == 200


class TestDataPageEmbedding:
    """A raw <iframe src=.../data> must not dodge the allowed domains."""

    def test_a_raw_iframe_of_the_data_page_is_sent_to_the_frame(self, client, test_widget):
        response = client.get(f"/api/v1/widgets/{test_widget.id}/data?widget_id=x",
                              headers={"Sec-Fetch-Dest": "iframe"}, follow_redirects=False)
        assert response.status_code == 302
        assert response.headers["location"] == f"/api/v1/widgets/{test_widget.id}/frame"

    def test_an_old_loaders_fetch_still_gets_the_page(self, client, test_widget):
        response = client.get(f"/api/v1/widgets/{test_widget.id}/data", headers={"Sec-Fetch-Dest": "empty"})
        assert response.status_code == 200
        assert "__INITIAL_DATA__" in response.text

    def test_unrestricted_widget_sends_no_frame_ancestors(self, client, test_widget):
        assert "content-security-policy" not in client.get(f"/api/v1/widgets/{test_widget.id}/data").headers

    def test_an_in_page_widget_on_a_site_the_list_refuses_is_refused(self, client, restricted):
        # An older loader, or the current one's in-page fallback: frame-ancestors
        # can't hold it to the list, so the origin is checked here
        response = client.get(f"/api/v1/widgets/{restricted.id}/data", headers={"Origin": "https://elsewhere.example"})
        assert response.status_code == 403
        assert response.json()["detail"]["code"] == "origin_not_allowed"
        assert "__INITIAL_DATA__" not in response.text

    @pytest.mark.parametrize("origin", ["https://acme.com", "https://www.acme.com"])
    def test_an_in_page_widget_on_an_allowed_site_loads(self, client, restricted, origin):
        assert client.get(f"/api/v1/widgets/{restricted.id}/data", headers={"Origin": origin}).status_code == 200

    def test_an_unrestricted_widget_loads_in_page_anywhere(self, client, test_widget):
        response = client.get(f"/api/v1/widgets/{test_widget.id}/data", headers={"Origin": "https://anywhere.example"})
        assert response.status_code == 200

    def test_restricted_widget_sends_its_frame_ancestors(self, client, restricted):
        csp = client.get(f"/api/v1/widgets/{restricted.id}/data").headers["content-security-policy"]
        assert csp.startswith("frame-ancestors ")
        assert "'self'" not in csp
        assert " https://acme.com" in csp


class TestBootstrap:
    def test_the_plan_decides_on_the_branding(self, client, test_widget, monkeypatch):
        monkeypatch.setattr(widget_bootstrap, "plan_hides_branding", lambda *a: True)
        assert bootstrap(client, test_widget).json()["hideBranding"] is True

    def test_branding_stays_by_default(self, client, test_widget, monkeypatch):
        monkeypatch.setattr(widget_bootstrap, "plan_hides_branding", lambda *a: False)
        assert bootstrap(client, test_widget).json()["hideBranding"] is False

    def test_the_live_help_center_is_offered(self, client, test_widget, monkeypatch):
        monkeypatch.setattr(widget_bootstrap, "help_center_url", lambda *a: "https://help.acme.example")
        assert bootstrap(client, test_widget).json()["helpCenterUrl"] == "https://help.acme.example"

    def test_every_agent_is_served_the_redesign(self, client, db, test_widget, test_agent):
        # An agent that once chose the classic widget gets the redesign all the same.
        db.add(AgentCustomization(agent_id=test_agent.id, customization_metadata={"widget_ui": {"version": 1}}))
        db.commit()
        metadata = bootstrap(client, test_widget).json()["customization"]["customization_metadata"]
        assert metadata["widget_ui"] == {"version": 2}

    def test_the_html_page_bakes_in_the_help_center(self, client, test_widget, monkeypatch):
        monkeypatch.setattr(widget_bootstrap, "help_center_url", lambda *a: "https://help.acme.example/</script>")
        page = client.get(f"/api/v1/widgets/{test_widget.id}/data").text
        assert "helpCenterUrl: " in page
        # Escaped for a script block: the URL cannot close the tag.
        assert "https://help.acme.example/</script>" not in page

    def test_free_serves_no_quick_actions_greeting_or_past_chats(self, client, db, test_widget, test_agent,
                                                                  monkeypatch):
        db.add(AgentCustomization(agent_id=test_agent.id, quick_actions=["Track my order"],
                                  chat_initiation_messages=["Need a hand?"]))
        db.commit()
        monkeypatch.setattr(widget_plan, "plan_flag_on", lambda *a: False)
        data = bootstrap(client, test_widget).json()
        assert data["customization"]["quick_actions"] == []
        assert data["customization"]["chat_initiation_messages"] == []
        assert data["planFeatures"] == {"conversation_history": False, "shop_in_chat": False}
        # The widget data route serves the same rows
        assert data["widgetData"]["data"]["agent"]["customization"]["quick_actions"] == []
        assert data["widgetData"]["data"]["agent"]["customization"]["chat_initiation_messages"] == []
        # The HTML page bakes the flags in for the widget to read
        assert 'planFeatures: {"conversation_history": false, "shop_in_chat": false}' in \
            client.get(f"/api/v1/widgets/{test_widget.id}/data").text

    def test_a_paid_plan_serves_what_the_agent_saved(self, client, db, test_widget, test_agent, monkeypatch):
        db.add(AgentCustomization(agent_id=test_agent.id, quick_actions=["Track my order"],
                                  chat_initiation_messages=["Need a hand?"]))
        db.commit()
        monkeypatch.setattr(widget_plan, "plan_flag_on", lambda *a: True)
        customization = bootstrap(client, test_widget).json()["customization"]
        assert customization["quick_actions"] == ["Track my order"]
        assert customization["chat_initiation_messages"] == ["Need a hand?"]

    def test_no_help_center_by_default(self, client, test_widget):
        assert bootstrap(client, test_widget).json()["helpCenterUrl"] is None

    def test_a_plan_without_workflows_boots_a_plain_chat(self, client, db, test_widget, test_agent, monkeypatch):
        test_agent.use_workflow = True
        test_agent.active_workflow_id = uuid.uuid4()
        monkeypatch.setattr(widget_bootstrap, "plan_feature_on", lambda *a: False)

        assert bootstrap(client, test_widget).json()["workflow"] is False

    def test_a_new_visitor_gets_an_anonymous_token_and_the_widget_data(self, client, test_widget, test_agent):
        response = bootstrap(client, test_widget)

        assert response.status_code == 200
        assert response.headers["cache-control"] == "no-store"
        data = response.json()
        assert set(data) == {
            "widgetId", "agentName", "customization", "customerId", "initialToken",
            "customer", "workflow", "allowAttachments", "presence", "hideBranding",
            "helpCenterUrl", "planFeatures", "widgetData",
        }
        # Community install: every widget feature is on
        assert data["planFeatures"] == {"conversation_history": True, "shop_in_chat": True}
        assert data["widgetId"] == test_widget.id
        assert data["agentName"] == (test_agent.display_name or test_agent.name)
        assert data["customerId"] == ""
        assert conversation_token.inspect(data["initialToken"], test_widget.id).is_live
        assert data["presence"] == {"mode": "ai", "available": True}

    def test_matches_what_the_html_page_bakes_in(self, client, test_widget):
        data = bootstrap(client, test_widget).json()
        page = client.get(f"/api/v1/widgets/{test_widget.id}/data").text

        assert f'agentName: "{data["agentName"]}"' in page
        assert f'workflow: {str(data["workflow"]).lower()}' in page
        assert f'allowAttachments: {str(data["allowAttachments"]).lower()}' in page
        assert "helpCenterUrl: null" in page

    def test_an_identified_visitor_keeps_their_identity(self, client, test_widget, identified_token):
        data = bootstrap(client, test_widget, identified_token).json()

        assert data["initialToken"] == identified_token
        assert data["customerId"] == conversation_token.inspect(identified_token, test_widget.id).payload["sub"]

    def test_a_lapsed_identity_is_reported_not_replaced(self, client, test_widget, identified_token, monkeypatch):
        monkeypatch.setattr(conversation_token, "_is_token_in_redis", lambda jti: False)
        response = bootstrap(client, test_widget, identified_token)

        assert response.status_code == 401
        assert response.json()["detail"]["code"] == conversation_token.IDENTITY_EXPIRED_CODE

    def test_a_token_only_agent_refuses_an_anonymous_visitor(self, client, db, test_widget, test_agent):
        test_agent.require_token_auth = True
        db.commit()
        response = bootstrap(client, test_widget)

        assert response.status_code == 401
        assert response.json()["detail"]["code"] == "token_required"

    def test_a_token_only_agent_accepts_an_identified_visitor(self, client, db, test_widget, test_agent, identified_token):
        test_agent.require_token_auth = True
        db.commit()
        assert bootstrap(client, test_widget, identified_token).status_code == 200

    def test_a_garbage_token_starts_a_fresh_anonymous_visitor(self, client, test_widget):
        data = bootstrap(client, test_widget, "not-a-token").json()
        assert data["initialToken"] != "not-a-token"
        assert data["customerId"] == ""

    def test_a_token_for_another_widget_is_not_reused(self, client, db, test_widget, test_organization, test_agent):
        other = Widget(name="Other", organization_id=test_organization.id, agent_id=test_agent.id)
        db.add(other)
        db.commit()
        foreign = bootstrap(client, other).json()["initialToken"]

        assert bootstrap(client, test_widget, foreign).json()["initialToken"] != foreign

    def test_the_explore_source_rides_in_the_token(self, client, test_widget, monkeypatch):
        monkeypatch.setattr(settings, "EXPLORE_WIDGET_ID", test_widget.id)
        token = bootstrap(client, test_widget, source="https://visitor-site.example").json()["initialToken"]
        assert conversation_token.inspect(token, test_widget.id).payload.get("source") == "https://visitor-site.example"

    def test_source_is_ignored_for_other_widgets(self, client, test_widget):
        token = bootstrap(client, test_widget, source="https://visitor-site.example").json()["initialToken"]
        assert "source" not in conversation_token.inspect(token, test_widget.id).payload

    def test_answers_the_widget_data_request_up_front(self, client, db, test_widget, test_agent):
        before = db.query(Customer).count()
        data = bootstrap(client, test_widget).json()
        widget_data = data["widgetData"]

        assert widget_data["status"] == 200
        # The same answer GET /widgets/{id} gives for that token: a customer of
        # its own, bound into a new token for this widget
        asked = client.get(f"/api/v1/widgets/{test_widget.id}",
                           headers={"Authorization": f"Bearer {data['initialToken']}"}).json()
        assert set(widget_data["data"]) == set(asked)
        assert widget_data["data"]["agent"] == asked["agent"]
        bound = conversation_token.inspect(widget_data["data"]["token"], test_widget.id)
        assert bound.is_live and bound.payload["sub"]
        # One customer for the bootstrap, one for the GET made here to compare
        assert db.query(Customer).count() == before + 2

    def test_an_identified_visitor_gets_their_own_widget_data(self, client, test_widget, identified_token):
        widget_data = bootstrap(client, test_widget, identified_token).json()["widgetData"]

        assert widget_data["status"] == 200
        # Their token already names them: no new one, so they stay who they are
        assert widget_data["data"].get("token") is None

    def test_an_email_first_agent_gets_the_refusal_up_front(self, client, db, test_widget, test_agent):
        from app.models.agent import AgentCustomization
        customization = db.query(AgentCustomization).filter_by(agent_id=test_agent.id).first()
        if customization is None:
            customization = AgentCustomization(agent_id=test_agent.id)
            db.add(customization)
        customization.collect_email = True
        db.commit()

        response = bootstrap(client, test_widget)
        assert response.status_code == 200
        assert response.json()["widgetData"] == {"status": 401, "detail": "Unauthorized"}

    def test_unknown_widget(self, client):
        response = client.post(f"/api/v1/widgets/{uuid.uuid4()}/bootstrap", json={})
        assert response.status_code == 404

    def test_too_many_opens_are_refused(self, client, test_widget, monkeypatch):
        monkeypatch.setattr(widget_router, "allow_widget_open", lambda request, widget_id: False)
        monkeypatch.setattr(frame_router, "allow_widget_open", lambda request, widget_id: False)

        response = bootstrap(client, test_widget)
        assert response.status_code == 429
        assert response.json()["detail"]["code"] == "rate_limited"
        assert client.get(f"/api/v1/widgets/{test_widget.id}/data").status_code == 429

    def test_the_host_origin_is_what_install_tracking_sees(self, client, test_widget, monkeypatch):
        seen = []
        monkeypatch.setattr(frame_router, "note_install", lambda db, widget, origin, request, bg, load: seen.append(origin) or loads.append(load))
        loads = []

        bootstrap(client, test_widget, host_origin="https://shop.acme.com")
        bootstrap(client, test_widget, host_origin="https://shop.acme.com/pricing")
        bootstrap(client, test_widget, host_origin="https://shop.acme.com;evil")
        bootstrap(client, test_widget, host_origin="javascript:alert(1)")
        bootstrap(client, test_widget)

        # Only a real origin is recorded; garbage and absent ones are not
        assert seen == ["https://shop.acme.com", "https://shop.acme.com"]
        assert set(loads) == {"framed"}

    def test_a_self_reported_site_outside_the_list_is_not_recorded(self, client, restricted, monkeypatch):
        seen = []
        monkeypatch.setattr(frame_router, "note_install", lambda db, widget, origin, request, bg, load: seen.append(origin))

        bootstrap(client, restricted, host_origin="https://verify-billing.example")
        bootstrap(client, restricted, host_origin="https://www.acme.com")

        assert seen == ["https://www.acme.com"]


class TestRateLimit:
    @staticmethod
    def request(peer, forwarded=None):
        headers = {"x-forwarded-for": forwarded} if forwarded else {}
        return type("R", (), {"headers": headers, "client": type("C", (), {"host": peer})() if peer else None})()

    def test_a_direct_loopback_peer_is_never_limited(self, monkeypatch):
        monkeypatch.setattr(widget_common, "allow_request", lambda *a: False)
        assert widget_common.allow_widget_open(self.request("127.0.0.1"), "w-1") is True

    def test_a_forged_loopback_header_earns_no_exemption(self, monkeypatch):
        monkeypatch.setattr(widget_common, "allow_request", lambda *a: False)
        assert widget_common.allow_widget_open(self.request("203.0.113.9", forwarded="127.0.0.1"), "w-1") is False

    def test_a_proxy_on_the_same_machine_is_still_limited(self, monkeypatch):
        # host nginx/Caddy to 127.0.0.1:8000: loopback peer, but it forwarded a visitor
        monkeypatch.setattr(widget_common, "allow_request", lambda *a: False)
        assert widget_common.allow_widget_open(self.request("127.0.0.1", forwarded="203.0.113.9"), "w-1") is False

    def test_limited_per_visitor_and_widget(self, monkeypatch):
        keys = []
        monkeypatch.setattr(widget_common, "allow_request", lambda key, limit, window: keys.append(key) or False)

        assert widget_common.allow_widget_open(self.request("10.0.0.2", forwarded="203.0.113.9"), "w-1") is False
        assert keys == ["widget_open:203.0.113.9:w-1"]


class TestOlderEnterpriseModule:
    """Install tracking must not break (or spam the log) when the enterprise
    module predates load kinds."""

    def test_page_loads_are_reported_the_old_way(self, monkeypatch):
        calls = []
        old = type("Old", (), {"claim_write": staticmethod(lambda db, widget, origin, ip: calls.append(origin)),
                               "record": staticmethod(lambda *a: None)})
        monkeypatch.setattr(widget_common, "widget_install", old)
        monkeypatch.setattr(widget_common, "_claim_with_load", False)
        request = TestRateLimit.request("10.0.0.2", forwarded="203.0.113.9")
        widget = type("W", (), {"id": "w-1"})()

        widget_common.note_install(None, widget, "https://acme.com", request, None, widget_common.PAGE_LOAD)
        widget_common.note_install(None, widget, "https://acme.com", request, None, widget_common.FRAMED)

        assert calls == ["https://acme.com"]


class TestEmbedSettings:
    def url(self, widget) -> str:
        return f"/api/v1/widgets/{widget.id}/embed-settings"

    def test_a_new_widget_allows_any_site(self, client, test_widget):
        assert client.get(self.url(test_widget)).json()["allowed_domains"] == []

    def test_names_the_frame_host_a_sites_frame_src_needs_beside_the_api(self, client, test_widget, monkeypatch):
        monkeypatch.setattr(settings, "WIDGET_FRAME_URL", "https://widget.example.com/")
        assert client.get(self.url(test_widget)).json()["frame_host"] == "https://widget.example.com"

    def test_without_a_frame_host_the_api_alone_frames_it(self, client, test_widget, monkeypatch):
        monkeypatch.setattr(settings, "WIDGET_FRAME_URL", "")
        assert client.get(self.url(test_widget)).json()["frame_host"] is None

    def test_saved_domains_are_normalised(self, client, db, test_widget):
        response = client.put(self.url(test_widget), json={"allowed_domains": ["https://ACME.com/", "localhost:3000", "acme.com"]})

        assert response.status_code == 200
        assert response.json() == {"allowed_domains": ["acme.com", "localhost:3000"]}
        db.refresh(test_widget)
        assert test_widget.allowed_domains == ["acme.com", "localhost:3000"]

    def test_an_empty_list_lifts_the_restriction(self, client, db, restricted):
        assert client.put(self.url(restricted), json={"allowed_domains": []}).json() == {"allowed_domains": []}
        db.refresh(restricted)
        assert restricted.allowed_domains is None
        assert "frame-ancestors" not in client.get(frame_url(restricted)).headers["content-security-policy"]

    def test_an_invalid_domain_is_refused_and_nothing_changes(self, client, db, restricted):
        response = client.put(self.url(restricted), json={"allowed_domains": ["good.com", "bad domain;"]})

        assert response.status_code == 422
        assert "isn't a valid domain" in response.json()["detail"]
        db.refresh(restricted)
        assert restricted.allowed_domains == ["acme.com"]

    @pytest.mark.parametrize("entries", [["a.com:\u00b2"], ["a.com:\uff18\uff10"], ["*.com"], ["a" * 400 + ".com"]])
    def test_entries_that_could_break_the_header_are_refused_not_crashed_on(self, client, test_widget, entries):
        assert client.put(self.url(test_widget), json={"allowed_domains": entries}).status_code == 422

    def test_too_many_domains_are_refused_in_plain_words(self, client, test_widget):
        response = client.put(self.url(test_widget), json={"allowed_domains": [f"s{i}.com" for i in range(21)]})
        assert response.status_code == 422
        assert response.json()["detail"] == "At most 20 domains"

    def test_an_overlong_entry_is_refused_in_plain_words(self, client, test_widget):
        response = client.put(self.url(test_widget), json={"allowed_domains": ["a" * 330]})
        assert response.status_code == 422
        assert "is too long for a domain" in response.json()["detail"]

    def test_another_orgs_widget_is_not_found(self, client, db, test_agent):
        other_org = Organization(name="Other", domain="other.example", timezone="UTC")
        db.add(other_org)
        db.commit()
        theirs = Widget(name="Theirs", organization_id=other_org.id, agent_id=test_agent.id)
        db.add(theirs)
        db.commit()

        assert client.get(self.url(theirs)).status_code == 404
        assert client.put(self.url(theirs), json={"allowed_domains": ["evil.com"]}).status_code == 404
        db.refresh(theirs)
        assert theirs.allowed_domains is None

    def test_needs_permission_to_manage_agents(self, app, db, test_user, test_widget):
        test_user.role.permissions = [p for p in test_user.role.permissions if p.name != "manage_agents"]
        db.commit()
        client = TestClient(app)

        assert client.get(self.url(test_widget)).status_code == 403
        assert client.put(self.url(test_widget), json={"allowed_domains": []}).status_code == 403

    def test_never_exposed_on_the_public_widget_response(self, client, restricted):
        token = bootstrap(client, restricted).json()["initialToken"]
        public = client.get(f"/api/v1/widgets/{restricted.id}", headers={"Authorization": f"Bearer {token}"}).json()
        assert "allowed_domains" not in str(public)
