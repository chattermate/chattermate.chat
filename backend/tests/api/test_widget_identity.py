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

Keeping an identified visitor identified.

A visitor the embedding app vouched for used to become a brand-new anonymous
customer the moment their token lapsed and anything re-checked it - which, on a page
left open, is exactly when they start a new chat. The widget now rotates a live token
before it expires, and a lapsed one is refused rather than quietly replaced.
"""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import token as token_router
from app.api import widget as widget_router
from app.database import get_db
from app.models.customer import Customer
from app.services import conversation_token


@pytest.fixture
def client(db) -> TestClient:
    app = FastAPI()
    app.include_router(widget_router.router, prefix="/api/v1/widgets")
    app.include_router(token_router.router, prefix="/api/v1")

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)


@pytest.fixture
def identified_customer(db, test_organization) -> Customer:
    """The customer POST /generate-token creates for a signed-in visitor."""
    customer = Customer(
        organization_id=test_organization.id,
        email="signed.in@example.com",
        full_name="Signed In",
        meta_data={"plan": "pro"},
        is_authenticated=True,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@pytest.fixture
def identified_token(test_widget, identified_customer) -> str:
    token, _, _ = conversation_token.mint(
        {
            "sub": str(identified_customer.id),
            "customer_id": str(identified_customer.id),
            "widget_id": str(test_widget.id),
            "customer_email": identified_customer.email,
            "customer_name": identified_customer.full_name,
            "custom_data": {"plan": "pro"},
        },
        ttl_seconds=600,
    )
    return token


@pytest.fixture
def token_has_lapsed(monkeypatch):
    """Every token's JTI is gone from Redis - expired, or revoked."""
    monkeypatch.setattr(conversation_token, "_is_token_in_redis", lambda jti: False)


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


class TestRefreshToken:
    def test_rotates_a_live_token_and_keeps_the_visitor(self, client, test_widget, identified_token):
        response = client.post(
            "/api/v1/refresh-token",
            json={"widget_id": str(test_widget.id)},
            headers=_auth(identified_token),
        )

        assert response.status_code == 200, response.text
        rotated = response.json()["data"]["token"]
        assert rotated != identified_token

        claims = conversation_token.inspect(rotated, str(test_widget.id)).payload
        assert claims["customer_email"] == "signed.in@example.com"
        assert claims["custom_data"] == {"plan": "pro"}
        assert response.json()["data"]["expires_in"] == 600

    def test_refuses_a_lapsed_token_instead_of_issuing_a_new_identity(
        self, client, test_widget, identified_token, token_has_lapsed
    ):
        response = client.post(
            "/api/v1/refresh-token",
            json={"widget_id": str(test_widget.id)},
            headers=_auth(identified_token),
        )

        assert response.status_code == 401
        assert response.json()["detail"]["code"] == conversation_token.IDENTITY_EXPIRED_CODE

    def test_refuses_a_token_issued_for_another_widget(self, client, identified_token):
        response = client.post(
            "/api/v1/refresh-token",
            json={"widget_id": "some-other-widget"},
            headers=_auth(identified_token),
        )

        assert response.status_code == 401

    def test_requires_a_token(self, client, test_widget):
        response = client.post("/api/v1/refresh-token", json={"widget_id": str(test_widget.id)})

        assert response.status_code == 401
        assert response.json()["detail"]["code"] == conversation_token.INVALID_TOKEN_CODE


class TestWidgetDataIdentity:
    def test_keeps_the_identity_of_a_live_token(self, client, test_widget, identified_token):
        response = client.get(f"/api/v1/widgets/{test_widget.id}", headers=_auth(identified_token))

        assert response.status_code == 200, response.text
        # No replacement token: the widget keeps the identity it arrived with.
        assert not response.json().get("token")

    def test_does_not_swap_a_lapsed_identity_for_an_anonymous_customer(
        self, client, db, test_widget, identified_token, token_has_lapsed
    ):
        customers_before = db.query(Customer).count()

        response = client.get(f"/api/v1/widgets/{test_widget.id}", headers=_auth(identified_token))

        assert response.status_code == 401
        assert response.json()["detail"]["code"] == conversation_token.IDENTITY_EXPIRED_CODE
        # The silent "@noemail.com" customer is the bug; there must be no new one.
        assert db.query(Customer).count() == customers_before

    def test_a_visitor_with_no_token_still_starts_anonymously(self, client, test_widget):
        response = client.get(f"/api/v1/widgets/{test_widget.id}")

        assert response.status_code == 200, response.text
        assert response.json()["token"]

    def test_widget_frame_refuses_to_render_a_lapsed_identity(
        self, client, test_widget, identified_token, token_has_lapsed
    ):
        response = client.get(
            f"/api/v1/widgets/{test_widget.id}/data", headers=_auth(identified_token)
        )

        assert response.status_code == 401
        assert response.json()["detail"]["code"] == conversation_token.IDENTITY_EXPIRED_CODE
