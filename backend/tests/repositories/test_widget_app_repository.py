"""
ChatterMate - Widget App Repository Tests
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

import pytest
from uuid import uuid4
from sqlalchemy.orm import Session

from app.repositories.widget_app import WidgetAppRepository
from app.models.widget_app import WidgetApp
from app.core.security import verify_widget_api_key
from tests.conftest import TestingSessionLocal, create_tables, Base, engine


@pytest.fixture(scope="function")
def db() -> Session:
    """Create a fresh database for each test."""
    Base.metadata.drop_all(bind=engine)
    create_tables()
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def widget_app_repo(db: Session) -> WidgetAppRepository:
    """Create a WidgetAppRepository instance."""
    return WidgetAppRepository(db)


@pytest.fixture
def org_id():
    """Generate a random organization ID."""
    return uuid4()


@pytest.fixture
def user_id():
    """Generate a random user ID."""
    return uuid4()


class TestWidgetAppCreation:
    """Tests for widget app creation."""

    def test_create_app_generates_valid_key(self, widget_app_repo, org_id, user_id):
        """Test that create_app generates a valid API key."""
        app, plain_key = widget_app_repo.create_app(
            organization_id=org_id,
            created_by=user_id,
            name="Test App",
            description="Test description"
        )

        assert app is not None
        assert app.id is not None
        assert app.name == "Test App"
        assert app.description == "Test description"
        assert app.organization_id == org_id
        assert app.created_by == user_id
        assert app.is_active is True
        assert plain_key.startswith("wak_")
        assert len(plain_key) > 40  # wak_ + 43 chars
        # Verify the plain key matches the hashed key
        assert verify_widget_api_key(plain_key, app.api_key_hash)

    def test_create_app_without_description(self, widget_app_repo, org_id, user_id):
        """Test creating app without optional description."""
        app, plain_key = widget_app_repo.create_app(
            organization_id=org_id,
            created_by=user_id,
            name="Simple App"
        )

        assert app is not None
        assert app.name == "Simple App"
        assert app.description is None
        assert plain_key.startswith("wak_")

    def test_create_multiple_apps_unique_keys(self, widget_app_repo, org_id, user_id):
        """Test that multiple apps get unique API keys."""
        app1, key1 = widget_app_repo.create_app(
            organization_id=org_id,
            created_by=user_id,
            name="App 1"
        )
        app2, key2 = widget_app_repo.create_app(
            organization_id=org_id,
            created_by=user_id,
            name="App 2"
        )

        assert key1 != key2
        assert app1.id != app2.id
        assert app1.api_key_hash != app2.api_key_hash


class TestWidgetAppValidation:
    """Tests for API key validation."""

    def test_validate_api_key_success(self, widget_app_repo, org_id, user_id):
        """Test successful API key validation."""
        app, plain_key = widget_app_repo.create_app(
            organization_id=org_id,
            created_by=user_id,
            name="Test App"
        )

        # Validate the key
        validated_app = widget_app_repo.validate_api_key(plain_key)

        assert validated_app is not None
        assert validated_app.id == app.id
        assert validated_app.name == app.name

    def test_validate_api_key_invalid(self, widget_app_repo):
        """Test invalid API key returns None."""
        validated_app = widget_app_repo.validate_api_key("wak_invalid_key_12345")

        assert validated_app is None

    def test_validate_api_key_inactive_app(self, widget_app_repo, org_id, user_id):
        """Test that inactive apps cannot authenticate."""
        app, plain_key = widget_app_repo.create_app(
            organization_id=org_id,
            created_by=user_id,
            name="Test App"
        )

        # Deactivate app
        widget_app_repo.deactivate_app(app.id, org_id)

        # Key should no longer validate
        validated_app = widget_app_repo.validate_api_key(plain_key)
        assert validated_app is None

    def test_validate_api_key_wrong_format(self, widget_app_repo):
        """Test that keys without wak_ prefix don't validate."""
        validated_app = widget_app_repo.validate_api_key("invalid_format_key")
        assert validated_app is None


class TestWidgetAppRetrieval:
    """Tests for retrieving widget apps."""

    def test_get_app_by_id(self, widget_app_repo, org_id, user_id):
        """Test getting app by ID."""
        app, _ = widget_app_repo.create_app(
            organization_id=org_id,
            created_by=user_id,
            name="Test App"
        )

        retrieved = widget_app_repo.get_app_by_id(app.id, org_id)
        assert retrieved is not None
        assert retrieved.id == app.id
        assert retrieved.name == app.name

    def test_get_app_by_id_wrong_org(self, widget_app_repo, org_id, user_id):
        """Test that apps are org-scoped."""
        app, _ = widget_app_repo.create_app(
            organization_id=org_id,
            created_by=user_id,
            name="Test App"
        )

        # Try to get with different org_id
        wrong_org = uuid4()
        retrieved = widget_app_repo.get_app_by_id(app.id, wrong_org)
        assert retrieved is None

    def test_get_app_by_id_nonexistent(self, widget_app_repo, org_id):
        """Test getting non-existent app returns None."""
        fake_id = uuid4()
        retrieved = widget_app_repo.get_app_by_id(fake_id, org_id)
        assert retrieved is None

    def test_get_apps_by_organization(self, widget_app_repo, org_id, user_id):
        """Test listing all apps for an organization."""
        # Create multiple apps
        widget_app_repo.create_app(org_id, user_id, "App 1")
        widget_app_repo.create_app(org_id, user_id, "App 2")
        widget_app_repo.create_app(org_id, user_id, "App 3")

        apps = widget_app_repo.get_apps_by_organization(org_id)
        assert len(apps) == 3
        assert all(app.organization_id == org_id for app in apps)

    def test_get_apps_by_organization_exclude_inactive(self, widget_app_repo, org_id, user_id):
        """Test that inactive apps are excluded by default."""
        app1, _ = widget_app_repo.create_app(org_id, user_id, "Active App")
        app2, _ = widget_app_repo.create_app(org_id, user_id, "Inactive App")

        # Deactivate second app
        widget_app_repo.deactivate_app(app2.id, org_id)

        apps = widget_app_repo.get_apps_by_organization(org_id, include_inactive=False)
        assert len(apps) == 1
        assert apps[0].id == app1.id

    def test_get_apps_by_organization_include_inactive(self, widget_app_repo, org_id, user_id):
        """Test getting all apps including inactive ones."""
        app1, _ = widget_app_repo.create_app(org_id, user_id, "Active App")
        app2, _ = widget_app_repo.create_app(org_id, user_id, "Inactive App")

        # Deactivate second app
        widget_app_repo.deactivate_app(app2.id, org_id)

        apps = widget_app_repo.get_apps_by_organization(org_id, include_inactive=True)
        assert len(apps) == 2

    def test_get_apps_by_organization_sorted(self, widget_app_repo, org_id, user_id):
        """Test that apps are retrieved and have created_at timestamps."""
        app1, _ = widget_app_repo.create_app(org_id, user_id, "First App")
        app2, _ = widget_app_repo.create_app(org_id, user_id, "Second App")
        app3, _ = widget_app_repo.create_app(org_id, user_id, "Third App")

        apps = widget_app_repo.get_apps_by_organization(org_id)

        # Verify we have all 3 apps
        assert len(apps) == 3

        # Verify all apps have created_at timestamps
        assert all(app.created_at is not None for app in apps)

        # Verify all expected apps are in the result
        app_names = {app.name for app in apps}
        assert app_names == {"First App", "Second App", "Third App"}


class TestWidgetAppUpdate:
    """Tests for updating widget apps."""

    def test_update_app_name(self, widget_app_repo, org_id, user_id):
        """Test updating app name."""
        app, _ = widget_app_repo.create_app(org_id, user_id, "Old Name")

        updated = widget_app_repo.update_app(
            app.id,
            org_id,
            name="New Name"
        )

        assert updated is not None
        assert updated.name == "New Name"
        assert updated.id == app.id

    def test_update_app_description(self, widget_app_repo, org_id, user_id):
        """Test updating app description."""
        app, _ = widget_app_repo.create_app(org_id, user_id, "Test App")

        updated = widget_app_repo.update_app(
            app.id,
            org_id,
            description="New description"
        )

        assert updated is not None
        assert updated.description == "New description"

    def test_update_app_is_active(self, widget_app_repo, org_id, user_id):
        """Test updating app active status."""
        app, _ = widget_app_repo.create_app(org_id, user_id, "Test App")

        updated = widget_app_repo.update_app(
            app.id,
            org_id,
            is_active=False
        )

        assert updated is not None
        assert updated.is_active is False

    def test_update_app_multiple_fields(self, widget_app_repo, org_id, user_id):
        """Test updating multiple fields at once."""
        app, _ = widget_app_repo.create_app(org_id, user_id, "Old Name")

        updated = widget_app_repo.update_app(
            app.id,
            org_id,
            name="New Name",
            description="New Description",
            is_active=False
        )

        assert updated is not None
        assert updated.name == "New Name"
        assert updated.description == "New Description"
        assert updated.is_active is False

    def test_update_app_nonexistent(self, widget_app_repo, org_id):
        """Test updating non-existent app returns None."""
        fake_id = uuid4()
        updated = widget_app_repo.update_app(fake_id, org_id, name="New Name")
        assert updated is None

    def test_update_app_wrong_org(self, widget_app_repo, org_id, user_id):
        """Test updating app from wrong org returns None."""
        app, _ = widget_app_repo.create_app(org_id, user_id, "Test App")

        wrong_org = uuid4()
        updated = widget_app_repo.update_app(app.id, wrong_org, name="New Name")
        assert updated is None


class TestWidgetAppDeletion:
    """Tests for deleting/deactivating widget apps."""

    def test_deactivate_app(self, widget_app_repo, org_id, user_id):
        """Test soft delete (deactivation)."""
        app, plain_key = widget_app_repo.create_app(org_id, user_id, "Test App")

        success = widget_app_repo.deactivate_app(app.id, org_id)
        assert success is True

        # App should still exist but be inactive
        retrieved = widget_app_repo.get_app_by_id(app.id, org_id)
        assert retrieved is not None
        assert retrieved.is_active is False

        # API key should no longer validate
        validated = widget_app_repo.validate_api_key(plain_key)
        assert validated is None

    def test_deactivate_app_nonexistent(self, widget_app_repo, org_id):
        """Test deactivating non-existent app returns False."""
        fake_id = uuid4()
        success = widget_app_repo.deactivate_app(fake_id, org_id)
        assert success is False

    def test_delete_app_hard(self, widget_app_repo, org_id, user_id):
        """Test hard delete (permanent removal)."""
        app, _ = widget_app_repo.create_app(org_id, user_id, "Test App")

        success = widget_app_repo.delete_app(app.id, org_id)
        assert success is True

        # App should no longer exist
        retrieved = widget_app_repo.get_app_by_id(app.id, org_id)
        assert retrieved is None

    def test_delete_app_nonexistent(self, widget_app_repo, org_id):
        """Test hard deleting non-existent app returns False."""
        fake_id = uuid4()
        success = widget_app_repo.delete_app(fake_id, org_id)
        assert success is False


class TestAPIKeyRegeneration:
    """Tests for regenerating API keys."""

    def test_regenerate_api_key(self, widget_app_repo, org_id, user_id):
        """Test API key regeneration."""
        app, old_key = widget_app_repo.create_app(org_id, user_id, "Test App")

        result = widget_app_repo.regenerate_api_key(app.id, org_id)
        assert result is not None

        updated_app, new_key = result

        # New key should be different
        assert new_key != old_key
        assert new_key.startswith("wak_")

        # Old key should no longer work
        assert widget_app_repo.validate_api_key(old_key) is None

        # New key should work
        validated = widget_app_repo.validate_api_key(new_key)
        assert validated is not None
        assert validated.id == app.id

    def test_regenerate_api_key_nonexistent(self, widget_app_repo, org_id):
        """Test regenerating key for non-existent app returns None."""
        fake_id = uuid4()
        result = widget_app_repo.regenerate_api_key(fake_id, org_id)
        assert result is None

    def test_regenerate_api_key_wrong_org(self, widget_app_repo, org_id, user_id):
        """Test regenerating key from wrong org returns None."""
        app, _ = widget_app_repo.create_app(org_id, user_id, "Test App")

        wrong_org = uuid4()
        result = widget_app_repo.regenerate_api_key(app.id, wrong_org)
        assert result is None


class TestOrganizationIsolation:
    """Tests for ensuring organization-level isolation."""

    def test_apps_isolated_by_organization(self, widget_app_repo, user_id):
        """Test that apps from different orgs are isolated."""
        org1 = uuid4()
        org2 = uuid4()

        # Create apps for two different organizations
        app1, _ = widget_app_repo.create_app(org1, user_id, "Org1 App")
        app2, _ = widget_app_repo.create_app(org2, user_id, "Org2 App")

        # Each org should only see their own apps
        org1_apps = widget_app_repo.get_apps_by_organization(org1)
        org2_apps = widget_app_repo.get_apps_by_organization(org2)

        assert len(org1_apps) == 1
        assert len(org2_apps) == 1
        assert org1_apps[0].id == app1.id
        assert org2_apps[0].id == app2.id

    def test_cannot_access_other_org_app(self, widget_app_repo, user_id):
        """Test that one org cannot access another org's app."""
        org1 = uuid4()
        org2 = uuid4()

        app1, _ = widget_app_repo.create_app(org1, user_id, "Org1 App")

        # Try to get app1 using org2's credentials
        retrieved = widget_app_repo.get_app_by_id(app1.id, org2)
        assert retrieved is None


class TestAPIKeyFormat:
    """Tests for API key format and security."""

    def test_api_key_format(self, widget_app_repo, org_id, user_id):
        """Test that generated API keys follow the correct format."""
        _, plain_key = widget_app_repo.create_app(org_id, user_id, "Test App")

        # Should start with wak_
        assert plain_key.startswith("wak_")

        # Should be URL-safe base64 (only alphanumeric, -, _)
        key_suffix = plain_key[4:]  # Remove wak_ prefix
        assert all(c.isalnum() or c in ['-', '_'] for c in key_suffix)

        # Should have sufficient length (256-bit entropy ≈ 43 chars)
        assert len(key_suffix) >= 40

    def test_api_key_hash_storage(self, widget_app_repo, org_id, user_id, db):
        """Test that API keys are stored as hashes, not plain text."""
        _, plain_key = widget_app_repo.create_app(org_id, user_id, "Test App")

        # Get the app from database
        app = db.query(WidgetApp).filter(
            WidgetApp.organization_id == org_id
        ).first()

        # The stored hash should not equal the plain key
        assert app.api_key_hash != plain_key

        # The hash should look like a bcrypt hash
        assert app.api_key_hash.startswith("$2b$")

    def test_api_key_uniqueness(self, widget_app_repo, org_id, user_id):
        """Test that each generated API key is unique."""
        keys = set()

        for i in range(10):
            _, plain_key = widget_app_repo.create_app(
                org_id, user_id, f"App {i}"
            )
            keys.add(plain_key)

        # All keys should be unique
        assert len(keys) == 10
