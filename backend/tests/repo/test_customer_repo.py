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
            full_name="Priya", phone="+911234567890")

        # Same human arrives via WhatsApp: synthesized email, same phone.
        resolved = customer_repo.get_or_create_customer(
            email="911234567890@whatsapp.channel",
            organization_id=test_organization_id,
            full_name="Whatsapp user 91123456",
            phone="+911234567890")

        assert resolved.id == existing.id
        assert resolved.full_name == "Priya"          # nothing overwritten
        assert resolved.email == "priya@example.com"  # no junk row minted

    def test_backfills_phone_when_found_by_email(self, customer_repo, test_organization_id):
        existing = customer_repo.create_customer(
            email="911234567890@whatsapp.channel", organization_id=test_organization_id)
        assert existing.phone is None

        resolved = customer_repo.get_or_create_customer(
            email="911234567890@whatsapp.channel",
            organization_id=test_organization_id,
            phone="+911234567890")

        assert resolved.id == existing.id
        assert resolved.phone == "+911234567890"

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
            phone="+911234567890")
        by_email = customer_repo.create_customer(
            email="911234567890@whatsapp.channel", organization_id=test_organization_id)

        resolved = customer_repo.get_or_create_customer(
            email="911234567890@whatsapp.channel",
            organization_id=test_organization_id,
            phone="+911234567890")

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
        result = customer_repo.update_contact(customer.id, phone="+91 12345 67890")
        assert result['phone_updated'] is True
        assert customer_repo.get_by_id(customer.id).phone == "+911234567890"

    def test_never_overwrites_an_existing_phone(self, customer_repo, test_organization_id):
        customer = customer_repo.create_customer(
            email="lead@example.com", organization_id=test_organization_id,
            phone="+911234567890")
        result = customer_repo.update_contact(customer.id, phone="+15550001111")
        assert result['phone_updated'] is False
        assert customer_repo.get_by_id(customer.id).phone == "+911234567890"

    def test_skips_a_phone_owned_by_someone_else(self, customer_repo, test_organization_id):
        customer_repo.create_customer(
            email="owner@example.com", organization_id=test_organization_id,
            phone="+911234567890")
        other = customer_repo.create_customer(
            email="other@example.com", organization_id=test_organization_id)

        result = customer_repo.update_contact(other.id, phone="+911234567890")

        assert result['phone_updated'] is False
        assert customer_repo.get_by_id(other.id).phone is None

    def test_skips_an_unresolvable_number_rather_than_guessing(self, customer_repo, test_organization_id):
        customer = customer_repo.create_customer(
            email="lead@example.com", organization_id=test_organization_id)
        # Bare national digits: normalize_phone (strict) rejects them.
        result = customer_repo.update_contact(customer.id, phone="1234567890")
        assert result['phone_updated'] is False
        assert customer_repo.get_by_id(customer.id).phone is None

    def test_phone_update_composes_with_email_and_name(self, customer_repo, test_organization_id):
        customer = customer_repo.create_customer(
            email="1712345@noemail.com", organization_id=test_organization_id)
        result = customer_repo.update_contact(
            customer.id, email="real@example.com", full_name="Priya",
            phone="+911234567890")
        assert result == {'email_updated': True, 'name_updated': True,
                          'phone_updated': True, 'email': 'real@example.com'}


class TestPlaceholderEmails:
    """A `{id}@{channel}.channel` address is a synthesized identity key, not an
    address — but it is still the ONLY key a phone-less channel has."""

    def test_channel_addresses_are_placeholders(self, customer_repo):
        assert CustomerRepository.is_placeholder_email("911234567890@whatsapp.channel") is True
        assert CustomerRepository.is_placeholder_email("555@telegram.channel") is True
        assert CustomerRepository.is_placeholder_email("1712345@noemail.com") is True
        assert CustomerRepository.is_placeholder_email(None) is True
        assert CustomerRepository.is_placeholder_email("priya@example.com") is False

    def test_display_email_hides_stand_ins(self, customer_repo):
        assert CustomerRepository.display_email("911234567890@whatsapp.channel") is None
        assert CustomerRepository.display_email("1712345@noemail.com") is None
        assert CustomerRepository.display_email("priya@example.com") == "priya@example.com"

    def test_captured_email_lands_when_a_phone_holds_the_identity(self, customer_repo, test_organization_id):
        """WhatsApp/SMS: the phone is the key, so the email is free to become real."""
        customer = customer_repo.create_customer(
            email="911234567890@whatsapp.channel", organization_id=test_organization_id,
            phone="+911234567890")

        result = customer_repo.update_contact(customer.id, email="priya@example.com")

        assert result['email_updated'] is True
        assert customer_repo.get_by_id(customer.id).email == "priya@example.com"

    def test_phoneless_channel_keeps_its_key_so_no_duplicate_is_minted(self, customer_repo, test_organization_id):
        """Telegram has no phone: the .channel address is how the next inbound
        message finds this person. Overwriting it would create a second row."""
        customer = customer_repo.create_customer(
            email="555@telegram.channel", organization_id=test_organization_id)

        result = customer_repo.update_contact(customer.id, email="ada@example.com")

        assert result['email_updated'] is False
        assert customer_repo.get_by_id(customer.id).email == "555@telegram.channel"
        # And the lookup that every inbound message does still resolves.
        assert customer_repo.get_customer_by_email(
            "555@telegram.channel", test_organization_id).id == customer.id

    def test_telegram_keeps_its_key_even_after_sharing_a_phone(self, customer_repo, test_organization_id):
        """The trap: Telegram CAN learn a phone (share-contact button), but its
        inbound messages never carry one — so the address is still the lookup
        key. Having a phone must not be mistaken for being found by it."""
        customer = customer_repo.create_customer(
            email="555@telegram.channel", organization_id=test_organization_id)
        # They tapped "Share my phone number" during a handover.
        customer_repo.update_contact(customer.id, phone="+447700900123")
        db_customer = customer_repo.get_by_id(customer.id)
        assert db_customer.phone == "+447700900123"

        # Now the handoff form captures their real email.
        result = customer_repo.update_contact(customer.id, email="ada@example.com")

        assert result['email_updated'] is False
        # The key survives, so their next Telegram message still finds them.
        assert customer_repo.get_customer_by_email(
            "555@telegram.channel", test_organization_id).id == customer.id

    def test_widget_placeholder_still_replaceable(self, customer_repo, test_organization_id):
        """Unchanged behaviour: @noemail.com was never an identity key."""
        customer = customer_repo.create_customer(
            email="1712345@noemail.com", organization_id=test_organization_id)
        result = customer_repo.update_contact(customer.id, email="real@example.com")
        assert result['email_updated'] is True


class TestPhoneIdentityHazards:
    """The ways a phone key can attach a conversation to the wrong row."""

    def test_merged_row_never_owns_a_live_number(self, customer_repo, test_organization_id):
        """A merged-away row is invisible in People and uneditable — so if it
        kept a phone, the phone lookup (the FIRST thing every inbound WhatsApp
        message does) would attach that conversation to a row nobody can see."""
        survivor = customer_repo.create_customer(
            email="real@example.com", organization_id=test_organization_id,
            phone="+447700900111")
        tombstone = customer_repo.create_customer(
            email="old@example.com", organization_id=test_organization_id,
            phone="+447700900222")
        tombstone.merged_into_customer_id = survivor.id
        customer_repo.db.commit()

        # The number the tombstone still holds must not resolve to it.
        assert customer_repo.get_customer_by_phone(
            "+447700900222", test_organization_id) is None

    def test_inbound_wins_a_race_instead_of_being_dropped(
            self, customer_repo, test_organization_id, monkeypatch):
        """A concurrent insert on the phone index must not surface as an
        exception: process_channel_message swallows it and the customer's
        message is never answered. The winner's row is the right answer."""
        from sqlalchemy.exc import IntegrityError

        winner = customer_repo.create_customer(
            email="919999900001@whatsapp.channel",
            organization_id=test_organization_id, phone="+919999900001")

        # Simulate losing the race: our lookup saw nothing, the insert collides.
        calls = {"n": 0}
        real_create = customer_repo.create_customer

        def racing_create(*args, **kwargs):
            calls["n"] += 1
            raise IntegrityError("duplicate key", None, Exception("conflict"))

        monkeypatch.setattr(customer_repo, "create_customer", racing_create)
        monkeypatch.setattr(customer_repo, "_resolve_existing",
                            lambda e, o, p: None if calls["n"] == 0 else winner)

        resolved = customer_repo.get_or_create_customer(
            email="919999900001@whatsapp.channel",
            organization_id=test_organization_id, phone="+919999900001")

        assert resolved.id == winner.id
        assert calls["n"] == 1

    def test_race_with_no_winner_still_raises(
            self, customer_repo, test_organization_id, monkeypatch):
        """The retry must not swallow a genuine IntegrityError — if re-resolving
        finds nobody, the constraint fired for a reason we don't understand."""
        from sqlalchemy.exc import IntegrityError

        def always_conflicts(*args, **kwargs):
            raise IntegrityError("duplicate key", None, Exception("conflict"))

        monkeypatch.setattr(customer_repo, "create_customer", always_conflicts)
        monkeypatch.setattr(customer_repo, "_resolve_existing", lambda e, o, p: None)

        with pytest.raises(IntegrityError):
            customer_repo.get_or_create_customer(
                email="x@whatsapp.channel", organization_id=test_organization_id,
                phone="+919999900009")
