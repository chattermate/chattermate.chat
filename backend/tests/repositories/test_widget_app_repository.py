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
from unittest.mock import Mock, MagicMock, patch, PropertyMock
from datetime import datetime

from app.repositories.widget_app import WidgetAppRepository
from app.models.widget_app import WidgetApp


@pytest.fixture
def mock_db():
    """Create a mock database session."""
    db = MagicMock()
    db.query = MagicMock()
    db.add = MagicMock()
    db.commit = MagicMock()
    db.refresh = MagicMock()
    db.delete = MagicMock()
    db.rollback = MagicMock()
    return db


@pytest.fixture
def widget_app_repo(mock_db) -> WidgetAppRepository:
    """Create a WidgetAppRepository instance with mock db."""
    return WidgetAppRepository(mock_db)


@pytest.fixture
def org_id():
    """Generate a random organization ID."""
    return uuid4()


@pytest.fixture
def user_id():
    """Generate a random user ID."""
    return uuid4()


@pytest.fixture
def mock_widget_app(org_id, user_id):
    """Create a mock WidgetApp object."""
    app = Mock(spec=WidgetApp)
    app.id = uuid4()
    app.name = "Test App"
    app.description = "Test description"
    app.organization_id = org_id
    app.created_by = user_id
    app.is_active = True
    app.api_key_hash = "$2b$12$mockedhashvalue"
    app.created_at = datetime.utcnow()
    app.updated_at = datetime.utcnow()
    return app


class TestWidgetAppCreation:
    """Tests for widget app creation."""

    @patch('app.repositories.widget_app.generate_widget_api_key')
    @patch('app.repositories.widget_app.hash_widget_api_key')
    def test_create_app_generates_valid_key(
        self, mock_hash, mock_generate, widget_app_repo, mock_db, org_id, user_id
    ):
        """Test that create_app generates a valid API key."""
        mock_generate.return_value = "wak_test_key_12345678901234567890123456789012345"
        mock_hash.return_value = "$2b$12$hashedkey"

        # Mock refresh to set the id on the app
        def mock_refresh(app):
            app.id = uuid4()
        mock_db.refresh.side_effect = mock_refresh

        app, plain_key = widget_app_repo.create_app(
            organization_id=org_id,
            created_by=user_id,
            name="Test App",
            description="Test description"
        )

        assert app is not None
        assert app.name == "Test App"
        assert app.description == "Test description"
        assert app.organization_id == org_id
        assert app.created_by == user_id
        assert app.is_active is True
        assert plain_key == "wak_test_key_12345678901234567890123456789012345"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    @patch('app.repositories.widget_app.generate_widget_api_key')
    @patch('app.repositories.widget_app.hash_widget_api_key')
    def test_create_app_without_description(
        self, mock_hash, mock_generate, widget_app_repo, mock_db, org_id, user_id
    ):
        """Test creating app without optional description."""
        mock_generate.return_value = "wak_test_key_12345678901234567890123456789012345"
        mock_hash.return_value = "$2b$12$hashedkey"

        def mock_refresh(app):
            app.id = uuid4()
        mock_db.refresh.side_effect = mock_refresh

        app, plain_key = widget_app_repo.create_app(
            organization_id=org_id,
            created_by=user_id,
            name="Simple App"
        )

        assert app is not None
        assert app.name == "Simple App"
        assert app.description is None
        assert plain_key.startswith("wak_")

    @patch('app.repositories.widget_app.generate_widget_api_key')
    @patch('app.repositories.widget_app.hash_widget_api_key')
    def test_create_multiple_apps_unique_keys(
        self, mock_hash, mock_generate, widget_app_repo, mock_db, org_id, user_id
    ):
        """Test that multiple apps get unique API keys."""
        keys = [
            "wak_key1_12345678901234567890123456789012345",
            "wak_key2_12345678901234567890123456789012345"
        ]
        mock_generate.side_effect = keys
        mock_hash.return_value = "$2b$12$hashedkey"

        ids = [uuid4(), uuid4()]
        call_count = [0]

        def mock_refresh(app):
            app.id = ids[call_count[0]]
            call_count[0] += 1
        mock_db.refresh.side_effect = mock_refresh

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


class TestWidgetAppValidation:
    """Tests for API key validation."""

    @patch('app.repositories.widget_app.get_cached_widget_api_key')
    @patch('app.repositories.widget_app.verify_widget_api_key')
    @patch('app.repositories.widget_app.cache_widget_api_key')
    def test_validate_api_key_success(
        self, mock_cache, mock_verify, mock_get_cache,
        widget_app_repo, mock_db, mock_widget_app
    ):
        """Test successful API key validation."""
        mock_get_cache.return_value = None  # Cache miss
        mock_verify.return_value = True

        # Setup query chain
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.all.return_value = [mock_widget_app]
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        validated_app = widget_app_repo.validate_api_key("wak_test_key")

        assert validated_app is not None
        assert validated_app.id == mock_widget_app.id
        mock_cache.assert_called_once()

    @patch('app.repositories.widget_app.get_cached_widget_api_key')
    @patch('app.repositories.widget_app.verify_widget_api_key')
    def test_validate_api_key_invalid(
        self, mock_verify, mock_get_cache, widget_app_repo, mock_db
    ):
        """Test invalid API key returns None."""
        mock_get_cache.return_value = None
        mock_verify.return_value = False

        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.all.return_value = []
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        validated_app = widget_app_repo.validate_api_key("wak_invalid_key_12345")

        assert validated_app is None

    @patch('app.repositories.widget_app.get_cached_widget_api_key')
    def test_validate_api_key_from_cache(
        self, mock_get_cache, widget_app_repo, mock_db, mock_widget_app
    ):
        """Test API key validation from cache."""
        mock_get_cache.return_value = {
            "app_id": str(mock_widget_app.id),
            "organization_id": str(mock_widget_app.organization_id)
        }

        # Setup query chain for cache hit path
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = mock_widget_app
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        validated_app = widget_app_repo.validate_api_key("wak_cached_key")

        assert validated_app is not None
        assert validated_app.id == mock_widget_app.id


class TestWidgetAppRetrieval:
    """Tests for retrieving widget apps."""

    def test_get_app_by_id(self, widget_app_repo, mock_db, mock_widget_app, org_id):
        """Test getting app by ID."""
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = mock_widget_app
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        retrieved = widget_app_repo.get_app_by_id(mock_widget_app.id, org_id)

        assert retrieved is not None
        assert retrieved.id == mock_widget_app.id
        assert retrieved.name == mock_widget_app.name

    def test_get_app_by_id_wrong_org(self, widget_app_repo, mock_db, org_id):
        """Test that apps are org-scoped."""
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = None
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        wrong_org = uuid4()
        retrieved = widget_app_repo.get_app_by_id(uuid4(), wrong_org)

        assert retrieved is None

    def test_get_app_by_id_nonexistent(self, widget_app_repo, mock_db, org_id):
        """Test getting non-existent app returns None."""
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = None
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        fake_id = uuid4()
        retrieved = widget_app_repo.get_app_by_id(fake_id, org_id)

        assert retrieved is None

    def test_get_apps_by_organization(self, widget_app_repo, mock_db, org_id, user_id):
        """Test listing all apps for an organization."""
        apps = [
            Mock(spec=WidgetApp, id=uuid4(), name=f"App {i}", organization_id=org_id, is_active=True)
            for i in range(3)
        ]

        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter2 = MagicMock()
        mock_order = MagicMock()
        mock_filter.filter.return_value = mock_filter2
        mock_filter2.order_by.return_value = mock_order
        mock_order.all.return_value = apps
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        result = widget_app_repo.get_apps_by_organization(org_id)

        assert len(result) == 3
        assert all(app.organization_id == org_id for app in result)

    def test_get_apps_by_organization_exclude_inactive(self, widget_app_repo, mock_db, org_id):
        """Test that inactive apps are excluded by default."""
        active_app = Mock(spec=WidgetApp, id=uuid4(), name="Active App", is_active=True)

        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter2 = MagicMock()
        mock_order = MagicMock()
        mock_filter.filter.return_value = mock_filter2
        mock_filter2.order_by.return_value = mock_order
        mock_order.all.return_value = [active_app]
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        apps = widget_app_repo.get_apps_by_organization(org_id, include_inactive=False)

        assert len(apps) == 1
        assert apps[0].id == active_app.id

    def test_get_apps_by_organization_include_inactive(self, widget_app_repo, mock_db, org_id):
        """Test getting all apps including inactive ones."""
        apps = [
            Mock(spec=WidgetApp, id=uuid4(), name="Active App", is_active=True),
            Mock(spec=WidgetApp, id=uuid4(), name="Inactive App", is_active=False)
        ]

        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_order = MagicMock()
        mock_filter.order_by.return_value = mock_order
        mock_order.all.return_value = apps
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        result = widget_app_repo.get_apps_by_organization(org_id, include_inactive=True)

        assert len(result) == 2

    def test_get_apps_by_organization_sorted(self, widget_app_repo, mock_db, org_id):
        """Test that apps are retrieved and have created_at timestamps."""
        # Create mock apps with explicit attribute values
        app1 = MagicMock()
        app1.id = uuid4()
        app1.name = "First App"
        app1.created_at = datetime.utcnow()

        app2 = MagicMock()
        app2.id = uuid4()
        app2.name = "Second App"
        app2.created_at = datetime.utcnow()

        app3 = MagicMock()
        app3.id = uuid4()
        app3.name = "Third App"
        app3.created_at = datetime.utcnow()

        apps = [app1, app2, app3]

        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter2 = MagicMock()
        mock_order = MagicMock()
        mock_filter.filter.return_value = mock_filter2
        mock_filter2.order_by.return_value = mock_order
        mock_order.all.return_value = apps
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        result = widget_app_repo.get_apps_by_organization(org_id)

        assert len(result) == 3
        assert all(app.created_at is not None for app in result)
        app_names = {app.name for app in result}
        assert app_names == {"First App", "Second App", "Third App"}


class TestWidgetAppUpdate:
    """Tests for updating widget apps."""

    def test_update_app_name(self, widget_app_repo, mock_db, mock_widget_app, org_id):
        """Test updating app name."""
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = mock_widget_app
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        updated = widget_app_repo.update_app(
            mock_widget_app.id,
            org_id,
            name="New Name"
        )

        assert updated is not None
        assert updated.name == "New Name"
        mock_db.commit.assert_called_once()

    def test_update_app_description(self, widget_app_repo, mock_db, mock_widget_app, org_id):
        """Test updating app description."""
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = mock_widget_app
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        updated = widget_app_repo.update_app(
            mock_widget_app.id,
            org_id,
            description="New description"
        )

        assert updated is not None
        assert updated.description == "New description"

    def test_update_app_is_active(self, widget_app_repo, mock_db, mock_widget_app, org_id):
        """Test updating app active status."""
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = mock_widget_app
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        updated = widget_app_repo.update_app(
            mock_widget_app.id,
            org_id,
            is_active=False
        )

        assert updated is not None
        assert updated.is_active is False

    def test_update_app_multiple_fields(self, widget_app_repo, mock_db, mock_widget_app, org_id):
        """Test updating multiple fields at once."""
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = mock_widget_app
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        updated = widget_app_repo.update_app(
            mock_widget_app.id,
            org_id,
            name="New Name",
            description="New Description",
            is_active=False
        )

        assert updated is not None
        assert updated.name == "New Name"
        assert updated.description == "New Description"
        assert updated.is_active is False

    def test_update_app_nonexistent(self, widget_app_repo, mock_db, org_id):
        """Test updating non-existent app returns None."""
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = None
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        fake_id = uuid4()
        updated = widget_app_repo.update_app(fake_id, org_id, name="New Name")

        assert updated is None

    def test_update_app_wrong_org(self, widget_app_repo, mock_db, mock_widget_app):
        """Test updating app from wrong org returns None."""
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = None
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        wrong_org = uuid4()
        updated = widget_app_repo.update_app(mock_widget_app.id, wrong_org, name="New Name")

        assert updated is None


class TestWidgetAppDeletion:
    """Tests for deleting/deactivating widget apps."""

    def test_deactivate_app(self, widget_app_repo, mock_db, mock_widget_app, org_id):
        """Test soft delete (deactivation)."""
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = mock_widget_app
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        success = widget_app_repo.deactivate_app(mock_widget_app.id, org_id)

        assert success is True
        assert mock_widget_app.is_active is False
        mock_db.commit.assert_called_once()

    def test_deactivate_app_nonexistent(self, widget_app_repo, mock_db, org_id):
        """Test deactivating non-existent app returns False."""
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = None
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        fake_id = uuid4()
        success = widget_app_repo.deactivate_app(fake_id, org_id)

        assert success is False

    def test_delete_app_hard(self, widget_app_repo, mock_db, mock_widget_app, org_id):
        """Test hard delete (permanent removal)."""
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = mock_widget_app
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        success = widget_app_repo.delete_app(mock_widget_app.id, org_id)

        assert success is True
        mock_db.delete.assert_called_once_with(mock_widget_app)
        mock_db.commit.assert_called_once()

    def test_delete_app_nonexistent(self, widget_app_repo, mock_db, org_id):
        """Test hard deleting non-existent app returns False."""
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = None
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        fake_id = uuid4()
        success = widget_app_repo.delete_app(fake_id, org_id)

        assert success is False


class TestAPIKeyRegeneration:
    """Tests for regenerating API keys."""

    @patch('app.repositories.widget_app.generate_widget_api_key')
    @patch('app.repositories.widget_app.hash_widget_api_key')
    def test_regenerate_api_key(
        self, mock_hash, mock_generate, widget_app_repo, mock_db, mock_widget_app, org_id
    ):
        """Test API key regeneration."""
        old_hash = mock_widget_app.api_key_hash
        mock_generate.return_value = "wak_new_key_12345678901234567890123456789012345"
        mock_hash.return_value = "$2b$12$newhash"

        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = mock_widget_app
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        result = widget_app_repo.regenerate_api_key(mock_widget_app.id, org_id)

        assert result is not None
        updated_app, new_key = result
        assert new_key == "wak_new_key_12345678901234567890123456789012345"
        assert new_key.startswith("wak_")
        mock_db.commit.assert_called_once()

    def test_regenerate_api_key_nonexistent(self, widget_app_repo, mock_db, org_id):
        """Test regenerating key for non-existent app returns None."""
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = None
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        fake_id = uuid4()
        result = widget_app_repo.regenerate_api_key(fake_id, org_id)

        assert result is None

    def test_regenerate_api_key_wrong_org(self, widget_app_repo, mock_db, mock_widget_app):
        """Test regenerating key from wrong org returns None."""
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = None
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        wrong_org = uuid4()
        result = widget_app_repo.regenerate_api_key(mock_widget_app.id, wrong_org)

        assert result is None


class TestOrganizationIsolation:
    """Tests for ensuring organization-level isolation."""

    def test_apps_isolated_by_organization(self, widget_app_repo, mock_db, user_id):
        """Test that apps from different orgs are isolated."""
        org1 = uuid4()
        org2 = uuid4()

        app1 = Mock(spec=WidgetApp, id=uuid4(), name="Org1 App", organization_id=org1)
        app2 = Mock(spec=WidgetApp, id=uuid4(), name="Org2 App", organization_id=org2)

        call_count = [0]

        def get_apps_for_org(org_id):
            if org_id == org1:
                return [app1]
            elif org_id == org2:
                return [app2]
            return []

        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter2 = MagicMock()
        mock_order = MagicMock()

        def setup_filter(*args):
            mock_filter.filter.return_value = mock_filter2
            mock_filter2.order_by.return_value = mock_order
            # Return different results based on call
            if call_count[0] == 0:
                mock_order.all.return_value = [app1]
            else:
                mock_order.all.return_value = [app2]
            call_count[0] += 1
            return mock_filter

        mock_query.filter.side_effect = setup_filter
        mock_db.query.return_value = mock_query

        org1_apps = widget_app_repo.get_apps_by_organization(org1)
        org2_apps = widget_app_repo.get_apps_by_organization(org2)

        assert len(org1_apps) == 1
        assert len(org2_apps) == 1
        assert org1_apps[0].id == app1.id
        assert org2_apps[0].id == app2.id

    def test_cannot_access_other_org_app(self, widget_app_repo, mock_db):
        """Test that one org cannot access another org's app."""
        org1 = uuid4()
        org2 = uuid4()

        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = None  # App not found for wrong org
        mock_query.filter.return_value = mock_filter
        mock_db.query.return_value = mock_query

        app1_id = uuid4()
        retrieved = widget_app_repo.get_app_by_id(app1_id, org2)

        assert retrieved is None


class TestAPIKeyFormat:
    """Tests for API key format and security."""

    @patch('app.repositories.widget_app.generate_widget_api_key')
    @patch('app.repositories.widget_app.hash_widget_api_key')
    def test_api_key_format(
        self, mock_hash, mock_generate, widget_app_repo, mock_db, org_id, user_id
    ):
        """Test that generated API keys follow the correct format."""
        # Test key with proper format
        test_key = "wak_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmno"
        mock_generate.return_value = test_key
        mock_hash.return_value = "$2b$12$hashedkey"

        def mock_refresh(app):
            app.id = uuid4()
        mock_db.refresh.side_effect = mock_refresh

        _, plain_key = widget_app_repo.create_app(org_id, user_id, "Test App")

        # Should start with wak_
        assert plain_key.startswith("wak_")

        # Should be URL-safe base64 (only alphanumeric, -, _)
        key_suffix = plain_key[4:]  # Remove wak_ prefix
        assert all(c.isalnum() or c in ['-', '_'] for c in key_suffix)

        # Should have sufficient length
        assert len(key_suffix) >= 40

    @patch('app.repositories.widget_app.generate_widget_api_key')
    @patch('app.repositories.widget_app.hash_widget_api_key')
    def test_api_key_hash_storage(
        self, mock_hash, mock_generate, widget_app_repo, mock_db, org_id, user_id
    ):
        """Test that API keys are stored as hashes, not plain text."""
        plain_key = "wak_plaintext_key_12345678901234567890"
        hashed_key = "$2b$12$hashedvalue123456789012345678901234"
        mock_generate.return_value = plain_key
        mock_hash.return_value = hashed_key

        def mock_refresh(app):
            app.id = uuid4()
        mock_db.refresh.side_effect = mock_refresh

        app, returned_key = widget_app_repo.create_app(org_id, user_id, "Test App")

        # The stored hash should not equal the plain key
        assert app.api_key_hash != returned_key
        # The hash should look like a bcrypt hash
        assert app.api_key_hash.startswith("$2b$")

    @patch('app.repositories.widget_app.generate_widget_api_key')
    @patch('app.repositories.widget_app.hash_widget_api_key')
    def test_api_key_uniqueness(
        self, mock_hash, mock_generate, widget_app_repo, mock_db, org_id, user_id
    ):
        """Test that each generated API key is unique."""
        keys = [f"wak_unique_key_{i}_{'x' * 30}" for i in range(10)]
        mock_generate.side_effect = keys
        mock_hash.return_value = "$2b$12$hashedkey"

        ids = [uuid4() for _ in range(10)]
        call_count = [0]

        def mock_refresh(app):
            app.id = ids[call_count[0]]
            call_count[0] += 1
        mock_db.refresh.side_effect = mock_refresh

        generated_keys = set()
        for i in range(10):
            _, plain_key = widget_app_repo.create_app(
                org_id, user_id, f"App {i}"
            )
            generated_keys.add(plain_key)

        # All keys should be unique
        assert len(generated_keys) == 10


class TestErrorHandling:
    """Tests for error handling."""

    @patch('app.repositories.widget_app.generate_widget_api_key')
    @patch('app.repositories.widget_app.hash_widget_api_key')
    def test_create_app_rollback_on_error(
        self, mock_hash, mock_generate, widget_app_repo, mock_db, org_id, user_id
    ):
        """Test that database rollback occurs on error during creation."""
        mock_generate.return_value = "wak_test_key"
        mock_hash.return_value = "$2b$12$hash"
        mock_db.commit.side_effect = Exception("Database error")

        with pytest.raises(Exception, match="Database error"):
            widget_app_repo.create_app(org_id, user_id, "Test App")

        mock_db.rollback.assert_called_once()
