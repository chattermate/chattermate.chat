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

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.utils.phone import normalize_phone
from uuid import UUID
from app.core.logger import get_logger

logger = get_logger(__name__)

# Channels that declare the customer's phone on EVERY inbound message — i.e.
# where the platform id IS the number, so identity resolves by phone and the
# synthesized `{platform_id}@{channel}.channel` address is redundant. Keep in
# step with the adapters that set profile['phone']: app/channels/whatsapp.py
# and app/channels/sms/base.py.
#
# Telegram is deliberately absent. It can learn a phone (share-contact button)
# but never sends it with a message, so it is still found by its address.
PHONE_KEYED_CHANNELS = ('whatsapp', 'sms')

# The same fact expressed as address suffixes. Derived, not spelled out twice —
# the two must never disagree about which channels these are.
PHONE_KEYED_CHANNEL_SUFFIXES = tuple(f'@{c}.channel' for c in PHONE_KEYED_CHANNELS)


class CustomerRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_customer_by_email(
        self,
        email: str,
        organization_id: UUID
    ) -> Customer | None:
        """Get existing customer by email and organization ID"""
        try:
            customer = self.db.query(Customer).filter(
                Customer.email == email,
                Customer.organization_id == organization_id
            ).first()
            return customer
        except Exception as e:
            logger.error(f"Error getting customer by email: {str(e)}")
            return None

    def get_customer_by_phone(
        self,
        phone: str,
        organization_id: UUID
    ) -> Customer | None:
        """Get existing customer by normalized E.164 phone and organization ID.

        Callers must pass the output of normalize_phone — the column stores
        only that shape, so an unnormalized value would silently never match.

        Merged-away rows are excluded, as everywhere else a person is resolved
        (lead_capture, People). It matters more here than anywhere: this is the
        FIRST lookup on every inbound WhatsApp/SMS message, so a tombstone
        still holding a number would capture that conversation onto a row
        People hides and no drawer can edit.
        """
        try:
            return self.db.query(Customer).filter(
                Customer.phone == phone,
                Customer.organization_id == organization_id,
                Customer.merged_into_customer_id.is_(None)
            ).first()
        except Exception as e:
            logger.error(f"Error getting customer by phone: {str(e)}")
            return None

    def create_customer(
        self,
        email: str,
        organization_id: UUID,
        full_name: str = None,
        meta_data: dict = None,
        phone: str = None
    ) -> Customer:
        """Create a new customer"""
        try:
            customer = Customer(
                email=email,
                full_name=full_name,
                meta_data=meta_data,
                organization_id=organization_id,
                # Defensive normalize: the identity column only ever holds the
                # canonical E.164 shape, whoever the caller is.
                phone=normalize_phone(phone)
            )
            self.db.add(customer)
            self.db.commit()
            self.db.refresh(customer)
            return customer
        except Exception as e:
            logger.error(f"Error creating customer: {str(e)}")
            self.db.rollback()
            raise

    def update_meta_data(
        self,
        customer_id: UUID,
        meta_data: dict
    ) -> Customer | None:
        """Merge integrator-supplied fields (e.g. student_name, center_name) into a
        customer's existing meta_data, so agents see the latest values in the inbox.
        New keys are added and existing keys are overwritten; unrelated keys are kept.
        """
        if not meta_data:
            return None
        try:
            customer = self.get_by_id(customer_id)
            if not customer:
                return None
            customer.meta_data = {**(customer.meta_data or {}), **meta_data}
            self.db.commit()
            self.db.refresh(customer)
            return customer
        except Exception as e:
            logger.error(f"Error updating customer meta_data: {str(e)}")
            self.db.rollback()
            return None

    def set_phone_if_absent(self, customer: Customer, phone: str) -> bool:
        """Stage `phone` on a customer that has none, unless another customer
        in the org already owns it (then skip-and-log — never reassign or
        merge on a phone collision; that judgement belongs to a human).

        The single owner of the set-phone policy: get_or_create_customer's
        backfill and update_contact both go through here, so the conflict rule
        cannot drift between them. Stages only — the caller owns the commit.
        """
        if customer.phone:
            return False
        existing = self.get_customer_by_phone(phone, customer.organization_id)
        if existing and existing.id != customer.id:
            logger.warning(
                f"Phone {phone} already belongs to customer {existing.id} in org "
                f"{customer.organization_id}; not setting it on {customer.id}"
            )
            return False
        customer.phone = phone
        return True

    def get_or_create_customer(
        self,
        email: str,
        organization_id: UUID,
        full_name: str = None,
        phone: str = None
    ) -> Customer:
        """Resolve a person by phone first, then email; create if neither hits.

        Phone outranks email because where both exist the phone came verified
        from the channel (Meta/the SMS provider), while the email may be a
        synthesized per-channel placeholder. When the two match *different*
        customers, no merging happens here — auto-merge on a soft signal is how
        Chatwoot corrupted contacts (their #2811); the phone match wins the
        conversation and both records stay intact for a human.

        A customer found by email with no stored phone gets it backfilled, so
        pre-existing channel contacts become phone-addressable on their next
        message without any data migration.
        """
        # Defensive: the column must only ever hold the canonical shape, so an
        # unnormalized value from a future caller degrades to no-phone rather
        # than splitting one person into two spellings. Idempotent for the
        # already-normalized values today's callers pass.
        phone = normalize_phone(phone)
        customer = self._resolve_existing(email, organization_id, phone)
        if customer is not None:
            return customer

        try:
            return self.create_customer(email, organization_id, full_name, phone=phone)
        except IntegrityError:
            # Lost a race: a concurrent request created this person between our
            # lookup and our insert. Either unique key can be the one that
            # fired — (organization_id, email) or the partial index on
            # (organization_id, phone) — and the phone one is new, so a
            # WhatsApp customer messaging while an agent starts an outbound
            # send to them now collides on DIFFERENT emails, which the email
            # constraint never caught. Re-resolve: the winner's row is the
            # right answer. Without this the exception reaches
            # process_channel_message's blanket except and the customer's
            # message is silently never answered.
            self.db.rollback()
            customer = self._resolve_existing(email, organization_id, phone)
            if customer is None:
                raise
            return customer

    def _resolve_existing(
        self,
        email: str,
        organization_id: UUID,
        phone: str | None
    ) -> Customer | None:
        """Phone first, then email — the resolution order, without the create.

        Split out so the post-IntegrityError retry re-runs exactly the lookup
        that just lost the race, rather than a second, drifting copy of it.
        """
        by_phone = self.get_customer_by_phone(phone, organization_id) if phone else None

        if by_phone is not None:
            # The email lookup is diagnostic-only here, so skip it on the hot
            # path (every inbound message) when the emails trivially agree.
            if by_phone.email != email:
                by_email = self.get_customer_by_email(email, organization_id)
                if by_email is not None and by_email.id != by_phone.id:
                    logger.warning(
                        f"Identity conflict in org {organization_id}: phone matches "
                        f"customer {by_phone.id} but email {email} matches "
                        f"{by_email.id}; using the phone match and leaving both "
                        f"records for manual review"
                    )
            return by_phone

        customer = self.get_customer_by_email(email, organization_id)
        if not customer:
            return None

        if phone and self.set_phone_if_absent(customer, phone):
            try:
                self.db.commit()
            except Exception as e:
                # The partial unique index can race a concurrent insert; the
                # customer is still the right one, just without the backfill.
                self.db.rollback()
                logger.warning(f"Could not backfill phone for customer {customer.id}: {e}")
        return customer

    def get_by_id(self, customer_id: UUID) -> Customer | None:
        """Get customer by ID"""
        try:
            customer = self.db.query(Customer).filter(Customer.id == customer_id).first()
            return customer
        except Exception as e:
            logger.error(f"Error getting customer by ID: {str(e)}")
            return None

    def get_customer_email(self, customer_id: UUID) -> str | None:
        """Get customer email by ID"""
        try:
            customer = self.get_by_id(customer_id)
            return customer.email if customer else None
        except Exception as e:
            logger.error(f"Error getting customer email: {str(e)}")
            return None

    @staticmethod
    def is_placeholder_email(email: str | None) -> bool:
        """True if the email is missing or an auto-generated stand-in.

        Two kinds exist, and neither can receive mail:
        - ``…@noemail.com`` — an anonymous widget visitor.
        - ``…@<channel>.channel`` — synthesized from a platform id (a wa_id, a
          Telegram user id) so channel people have an identity key at all. It
          was never an address, and treating it as one is why a channel
          customer's captured email was silently dropped and why the handoff
          form never asked them for one.
        """
        return (not email) or ('@noemail.com' in email) or email.endswith('.channel')

    @staticmethod
    def display_email(email: str | None) -> str | None:
        """The email to show a human — None when we only ever had a stand-in.
        Showing `916…@whatsapp.channel` in an Email field states something
        untrue about the person."""
        return None if CustomerRepository.is_placeholder_email(email) else email

    @staticmethod
    def _email_is_identity_key(customer) -> bool:
        """True when this customer is *found* by their synthesized address.

        `_get_or_create_customer` resolves by phone first, but only for channels
        whose adapter declares one on EVERY inbound message — WhatsApp and SMS,
        where the platform id is the number. For those, the phone is the key and
        the address is free to become the person's real one.

        Every other channel is found by `{platform_id}@{channel}.channel` alone.
        Telegram is the trap: it can learn a phone via the share-contact button,
        so the customer HAS one — but its inbound messages never carry it, so
        the lookup is still by address. Overwrite it and their next message
        finds nobody and mints a duplicate. Storing a phone must not be mistaken
        for being found by it.
        """
        email = customer.email or ''
        if not email.endswith('.channel'):
            return False
        return not (email.endswith(PHONE_KEYED_CHANNEL_SUFFIXES) and customer.phone)

    def update_contact(
        self,
        customer_id: UUID,
        email: str = None,
        full_name: str = None,
        phone: str = None
    ) -> dict:
        """Update an existing customer's contact details (used by human-handoff capture).

        - Replaces a placeholder ``…@noemail.com`` (or empty) email with the supplied one,
          respecting the ``(email, organization_id)`` unique constraint — if the email already
          belongs to a different customer, the email update is skipped (logged) but the name
          can still be updated. A real existing email is never overwritten.
        - Sets ``full_name`` when a non-empty value is supplied.
        - Sets ``phone`` (normalized E.164) only when the customer has none — automatic
          capture paths must not overwrite a channel-verified number — and skips it when the
          phone belongs to another customer in the org (same rule as email). Correcting an
          existing phone is an explicit human act, not this method's job.

        Returns ``{'email_updated': bool, 'name_updated': bool, 'phone_updated': bool,
        'email': str|None}``.
        """
        result = {'email_updated': False, 'name_updated': False,
                  'phone_updated': False, 'email': None}
        try:
            customer = self.get_by_id(customer_id)
            if not customer:
                return result

            if email:
                email = email.strip()
                # Only replace a placeholder/empty email — don't clobber a real one,
                # and never one that is still doing duty as the identity key.
                if email and self.is_placeholder_email(customer.email) \
                        and not self._email_is_identity_key(customer) \
                        and email.lower() != (customer.email or '').lower():
                    existing = self.get_customer_by_email(email, customer.organization_id)
                    if existing and existing.id != customer.id:
                        logger.warning(
                            f"Email {email} already belongs to another customer in org "
                            f"{customer.organization_id}; skipping email update for {customer_id}"
                        )
                    else:
                        customer.email = email
                        result['email_updated'] = True

            if full_name is not None:
                full_name = full_name.strip()
                if full_name:
                    customer.full_name = full_name
                    result['name_updated'] = True

            if phone and not customer.phone:
                normalized = normalize_phone(phone)
                if not normalized:
                    logger.warning(
                        f"Captured phone {phone!r} for customer {customer_id} is not a "
                        f"resolvable E.164 number; skipping"
                    )
                elif self.set_phone_if_absent(customer, normalized):
                    result['phone_updated'] = True

            if result['email_updated'] or result['name_updated'] or result['phone_updated']:
                self.db.commit()
                self.db.refresh(customer)

            result['email'] = customer.email
            return result
        except Exception as e:
            logger.error(f"Error updating customer contact: {str(e)}")
            self.db.rollback()
            return result
