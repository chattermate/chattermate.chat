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
from app.models.customer import Customer
from app.repositories.customer import CustomerRepository
from uuid import UUID, uuid4

@pytest.fixture
def customer_repo(db):
    """Create a customer repository instance"""
    return CustomerRepository(db)

def test_get_or_create_customer_new(customer_repo, test_organization_id):
    """Test creating a new customer when one doesn't exist"""
    email = "newcustomer@example.com"
    full_name = "New Customer"

    customer = customer_repo.get_or_create_customer(
        email=email,
        organization_id=test_organization_id,
        full_name=full_name
    )

    assert customer is not None
    assert customer.email == email
    assert customer.full_name == full_name
    assert customer.organization_id == test_organization_id

def test_get_or_create_customer_existing(customer_repo, test_organization_id):
    """Test retrieving an existing customer"""
    email = "existing@example.com"
    full_name = "Existing Customer"

    # Create initial customer
    customer1 = customer_repo.get_or_create_customer(
        email=email,
        organization_id=test_organization_id,
        full_name=full_name
    )

    # Try to create/get the same customer again
    customer2 = customer_repo.get_or_create_customer(
        email=email,
        organization_id=test_organization_id,
        full_name="Different Name"  # This should be ignored as customer exists
    )

    assert customer2 is not None
    assert customer2.id == customer1.id
    assert customer2.email == email
    assert customer2.full_name == full_name  # Should keep original name
    assert customer2.organization_id == test_organization_id

def test_get_or_create_customer_different_org(customer_repo, test_organization_id, db):
    """Test creating customers with same email but different organizations"""
    email = "customer@example.com"
    
    # Create second test organization
    from app.models.organization import Organization
    other_org = Organization(
        id=uuid4(),
        name="Other Test Org",
        domain="other-test-org.com",
        timezone="UTC"
    )
    db.add(other_org)
    db.commit()

    # Create customer in first organization
    customer1 = customer_repo.get_or_create_customer(
        email=email,
        organization_id=test_organization_id,
        full_name="Customer One"
    )

    # Create customer with same email in different organization
    customer2 = customer_repo.get_or_create_customer(
        email=email,
        organization_id=other_org.id,
        full_name="Customer Two"
    )

    assert customer1.id != customer2.id
    assert customer1.email == customer2.email
    assert customer1.organization_id != customer2.organization_id

def test_get_by_id(customer_repo, test_organization_id):
    """Test retrieving a customer by ID"""
    # Create test customer
    customer = customer_repo.get_or_create_customer(
        email="test@example.com",
        organization_id=test_organization_id,
        full_name="Test Customer"
    )

    # Retrieve customer by ID
    retrieved_customer = customer_repo.get_by_id(customer.id)
    assert retrieved_customer is not None
    assert retrieved_customer.id == customer.id
    assert retrieved_customer.email == customer.email

def test_get_by_id_nonexistent(customer_repo):
    """Test retrieving a non-existent customer by ID"""
    non_existent_id = uuid4()
    customer = customer_repo.get_by_id(non_existent_id)
    assert customer is None

def test_get_customer_email(customer_repo, test_organization_id):
    """Test retrieving a customer's email by ID"""
    email = "test@example.com"
    
    # Create test customer
    customer = customer_repo.get_or_create_customer(
        email=email,
        organization_id=test_organization_id,
        full_name="Test Customer"
    )

    # Get customer email
    retrieved_email = customer_repo.get_customer_email(customer.id)
    assert retrieved_email == email

def test_get_customer_email_nonexistent(customer_repo):
    """Test retrieving email for a non-existent customer"""
    non_existent_id = uuid4()
    email = customer_repo.get_customer_email(non_existent_id)
    assert email is None

def test_get_or_create_customer_no_name(customer_repo, test_organization_id):
    """Test creating a customer without a full name"""
    email = "noname@example.com"

    customer = customer_repo.get_or_create_customer(
        email=email,
        organization_id=test_organization_id
    )

    assert customer is not None
    assert customer.email == email
    assert customer.full_name is None
    assert customer.organization_id == test_organization_id

def test_create_customer_with_meta_data(customer_repo, test_organization_id):
    """Test creating a customer with integrator-supplied meta_data"""
    email = "student@example.com"
    meta_data = {"student_name": "Aarav Krishnan", "center_name": "Special Academy U12"}

    customer = customer_repo.create_customer(
        email=email,
        organization_id=test_organization_id,
        full_name="Parent Name",
        meta_data=meta_data
    )

    assert customer is not None
    assert customer.meta_data == meta_data

def test_create_customer_without_meta_data(customer_repo, test_organization_id):
    """Test creating a customer with no meta_data leaves the column null"""
    customer = customer_repo.create_customer(
        email="nometa@example.com",
        organization_id=test_organization_id
    )

    assert customer.meta_data is None

def test_update_meta_data_merges_new_keys(customer_repo, test_organization_id):
    """A second call adds new keys and overwrites changed ones, keeping the rest"""
    customer = customer_repo.create_customer(
        email="merge@example.com",
        organization_id=test_organization_id,
        meta_data={"student_name": "Aarav", "grade": "U12"}
    )

    updated = customer_repo.update_meta_data(
        customer.id,
        {"student_name": "Aarav Krishnan", "center_name": "Special Academy U12"}
    )

    assert updated is not None
    assert updated.meta_data == {
        "student_name": "Aarav Krishnan",  # overwritten
        "grade": "U12",                    # preserved
        "center_name": "Special Academy U12"  # added
    }

def test_update_meta_data_on_customer_with_no_existing_data(customer_repo, test_organization_id):
    """Merging onto a customer created without meta_data starts from an empty dict"""
    customer = customer_repo.create_customer(
        email="firstmeta@example.com",
        organization_id=test_organization_id
    )

    updated = customer_repo.update_meta_data(customer.id, {"plan": "premium"})

    assert updated.meta_data == {"plan": "premium"}

def test_update_meta_data_empty_input_is_noop(customer_repo, test_organization_id):
    """Calling with no data returns None and leaves the customer untouched"""
    customer = customer_repo.create_customer(
        email="noop@example.com",
        organization_id=test_organization_id,
        meta_data={"a": "b"}
    )

    result = customer_repo.update_meta_data(customer.id, {})

    assert result is None
    assert customer_repo.get_by_id(customer.id).meta_data == {"a": "b"}

def test_update_meta_data_nonexistent_customer(customer_repo):
    """Updating meta_data for a customer that doesn't exist returns None"""
    result = customer_repo.update_meta_data(uuid4(), {"a": "b"})
    assert result is None 

class TestPhoneIdentity:
    """customers.phone is the second identity key: phone-first resolution,
    organic backfill, and the never-silently-merge conflict rule."""

    def test_phone_lookup_beats_email_creation(self, customer_repo, test_organization_id):
        existing = customer_repo.create_customer(
            email="priya@example.com", organization_id=test_organization_id,
            full_name="Priya", phone="+916366602824")

        # Same human arrives via WhatsApp: synthesized email, same phone.
        resolved = customer_repo.get_or_create_customer(
            email="916366602824@whatsapp.channel",
            organization_id=test_organization_id,
            full_name="Whatsapp user 91636660",
            phone="+916366602824")

        assert resolved.id == existing.id
        assert resolved.full_name == "Priya"          # nothing overwritten
        assert resolved.email == "priya@example.com"  # no junk row minted

    def test_backfills_phone_when_found_by_email(self, customer_repo, test_organization_id):
        existing = customer_repo.create_customer(
            email="916366602824@whatsapp.channel", organization_id=test_organization_id)
        assert existing.phone is None

        resolved = customer_repo.get_or_create_customer(
            email="916366602824@whatsapp.channel",
            organization_id=test_organization_id,
            phone="+916366602824")

        assert resolved.id == existing.id
        assert resolved.phone == "+916366602824"

    def test_creates_with_phone_when_nobody_matches(self, customer_repo, test_organization_id):
        customer = customer_repo.get_or_create_customer(
            email="447700900123@whatsapp.channel",
            organization_id=test_organization_id,
            phone="+447700900123")
        assert customer.phone == "+447700900123"

    def test_conflict_uses_phone_match_and_keeps_both_rows(self, customer_repo, test_organization_id, db):
        """The Chatwoot trap: phone says A, email says B -> A wins the
        conversation, nobody gets merged or overwritten."""
        by_phone = customer_repo.create_customer(
            email="a@example.com", organization_id=test_organization_id,
            phone="+916366602824")
        by_email = customer_repo.create_customer(
            email="916366602824@whatsapp.channel", organization_id=test_organization_id)

        resolved = customer_repo.get_or_create_customer(
            email="916366602824@whatsapp.channel",
            organization_id=test_organization_id,
            phone="+916366602824")

        assert resolved.id == by_phone.id
        db.refresh(by_email)
        assert by_email.merged_into_customer_id is None   # intact
        assert by_email.phone is None                     # not clobbered

    def test_without_phone_behaviour_is_unchanged(self, customer_repo, test_organization_id):
        """Channels that declare no phone must take the exact old path."""
        first = customer_repo.get_or_create_customer(
            email="D7@telegram.channel", organization_id=test_organization_id,
            full_name="Telegram user D7")
        again = customer_repo.get_or_create_customer(
            email="D7@telegram.channel", organization_id=test_organization_id)
        assert again.id == first.id
        assert again.phone is None


class TestUpdateContactPhone:
    """Set-if-absent with the same conflict-skip rule as email."""

    def test_sets_phone_when_absent(self, customer_repo, test_organization_id):
        customer = customer_repo.create_customer(
            email="lead@example.com", organization_id=test_organization_id)
        result = customer_repo.update_contact(customer.id, phone="+91 63666 02824")
        assert result['phone_updated'] is True
        assert customer_repo.get_by_id(customer.id).phone == "+916366602824"

    def test_never_overwrites_an_existing_phone(self, customer_repo, test_organization_id):
        customer = customer_repo.create_customer(
            email="lead@example.com", organization_id=test_organization_id,
            phone="+916366602824")
        result = customer_repo.update_contact(customer.id, phone="+15550001111")
        assert result['phone_updated'] is False
        assert customer_repo.get_by_id(customer.id).phone == "+916366602824"

    def test_skips_a_phone_owned_by_someone_else(self, customer_repo, test_organization_id):
        customer_repo.create_customer(
            email="owner@example.com", organization_id=test_organization_id,
            phone="+916366602824")
        other = customer_repo.create_customer(
            email="other@example.com", organization_id=test_organization_id)

        result = customer_repo.update_contact(other.id, phone="+916366602824")

        assert result['phone_updated'] is False
        assert customer_repo.get_by_id(other.id).phone is None

    def test_skips_an_unresolvable_number_rather_than_guessing(self, customer_repo, test_organization_id):
        customer = customer_repo.create_customer(
            email="lead@example.com", organization_id=test_organization_id)
        # Bare national digits: normalize_phone (strict) rejects them.
        result = customer_repo.update_contact(customer.id, phone="6366602824")
        assert result['phone_updated'] is False
        assert customer_repo.get_by_id(customer.id).phone is None

    def test_phone_update_composes_with_email_and_name(self, customer_repo, test_organization_id):
        customer = customer_repo.create_customer(
            email="1712345@noemail.com", organization_id=test_organization_id)
        result = customer_repo.update_contact(
            customer.id, email="real@example.com", full_name="Priya",
            phone="+916366602824")
        assert result == {'email_updated': True, 'name_updated': True,
                          'phone_updated': True, 'email': 'real@example.com'}
