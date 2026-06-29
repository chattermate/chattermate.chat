"""
ChatterMate - Customer
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

from sqlalchemy.orm import Session
from app.models.customer import Customer
from uuid import UUID
from app.core.logger import get_logger

logger = get_logger(__name__)

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

    def create_customer(
        self,
        email: str,
        organization_id: UUID,
        full_name: str = None
    ) -> Customer:
        """Create a new customer"""
        try:
            customer = Customer(
                email=email,
                full_name=full_name,
                organization_id=organization_id
            )
            self.db.add(customer)
            self.db.commit()
            self.db.refresh(customer)
            return customer
        except Exception as e:
            logger.error(f"Error creating customer: {str(e)}")
            self.db.rollback()
            raise

    def get_or_create_customer(
        self,
        email: str,
        organization_id: UUID,
        full_name: str = None
    ) -> Customer:
        """Get existing customer or create new one"""
        customer = self.get_customer_by_email(email, organization_id)

        if not customer:
            customer = self.create_customer(email, organization_id, full_name)
        else:
            logger.info(f"Customer already exists: {customer.id}")

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
        """True if the email is missing or an auto-generated anonymous placeholder."""
        return (not email) or ('@noemail.com' in email)

    def update_contact(
        self,
        customer_id: UUID,
        email: str = None,
        full_name: str = None
    ) -> dict:
        """Update an existing customer's contact details (used by human-handoff capture).

        - Replaces a placeholder ``…@noemail.com`` (or empty) email with the supplied one,
          respecting the ``(email, organization_id)`` unique constraint — if the email already
          belongs to a different customer, the email update is skipped (logged) but the name
          can still be updated. A real existing email is never overwritten.
        - Sets ``full_name`` when a non-empty value is supplied.

        Returns ``{'email_updated': bool, 'name_updated': bool, 'email': str|None}``.
        """
        result = {'email_updated': False, 'name_updated': False, 'email': None}
        try:
            customer = self.get_by_id(customer_id)
            if not customer:
                return result

            if email:
                email = email.strip()
                # Only replace a placeholder/empty email — don't clobber a real one
                if email and self.is_placeholder_email(customer.email) \
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

            if result['email_updated'] or result['name_updated']:
                self.db.commit()
                self.db.refresh(customer)

            result['email'] = customer.email
            return result
        except Exception as e:
            logger.error(f"Error updating customer contact: {str(e)}")
            self.db.rollback()
            return result
