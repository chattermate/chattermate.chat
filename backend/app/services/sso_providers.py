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

The single sign-on providers an operator can configure, and what differs
between them.

`Provider` is a plain OpenID Connect provider: the issuer its discovery
document publishes, `sub` as the account id, `email_verified` as the only
word on the address, no profile photo. Google and Microsoft override what
they do differently, so another OIDC provider is a new subclass (or just a
`Provider`) and configuration, not another branch in the flow.
"""

import re
from dataclasses import dataclass
from typing import Any, Dict, Optional, Tuple
from urllib.parse import urlparse

from app.core.config import settings

GOOGLE = "google"
MICROSOFT = "microsoft"

# A photo to fetch: (URL, request headers).
PhotoRequest = Tuple[str, Dict[str, str]]


class SsoError(Exception):
    """A sign-in that must stop. `code` is what the login page gets told; the
    detail stays in the log, since most of these describe our own config."""

    def __init__(self, code: str, detail: str = ""):
        super().__init__(detail or code)
        self.code = code
        self.detail = detail


def claim_true(value: Any) -> bool:
    """Booleans arrive as JSON true, or as "true"/"1" in some optional claims."""
    return str(value).lower() in ("true", "1")


def _domain_of(email: str) -> str:
    return email.rpartition("@")[2]


@dataclass(frozen=True)
class Provider:
    key: str
    label: str
    discovery_url: str
    scopes: str
    client_id: str
    client_secret: str

    def authorize_params(self) -> Dict[str, str]:
        """Extra parameters for the authorization request."""
        return {}

    def issuer_ok(self, claims: dict, doc: dict) -> bool:
        published = doc.get("issuer")
        return bool(published) and claims.get("iss") == published

    def issuer(self, claims: dict) -> str:
        """The issuer to store with a link, in one spelling per issuer."""
        return claims.get("iss", "")

    def subject(self, claims: dict) -> str:
        """The stable account id within the issuer."""
        return str(claims.get("sub") or "")

    def email(self, claims: dict) -> str:
        return (claims.get("email") or "").strip().lower()

    def email_trusted(self, claims: dict, email: str) -> bool:
        """Whether the provider vouches that `email` belongs to this account,
        so it may link the account to the team member with that address."""
        return claim_true(claims.get("email_verified"))

    def check_claims(self, claims: dict) -> None:
        """Refuse an account the operator's configuration rules out."""

    def hosted_domain(self, claims: dict) -> Optional[str]:
        return None

    def tenant_id(self, claims: dict) -> Optional[str]:
        return None

    def photo_request(self, claims: dict, access_token: Optional[str]) -> Optional[PhotoRequest]:
        return None


# Google is the authority for an address only on its own consumer domains or
# when the account is a Workspace account of that domain (`hd`). Otherwise
# `email_verified` only says the address was confirmed once, when the account
# was made, which a lapsed or re-registered domain no longer backs.
_GOOGLE_CONSUMER_DOMAINS = ("gmail.com", "googlemail.com")
_GOOGLE_ISSUERS = ("https://accounts.google.com", "accounts.google.com")


@dataclass(frozen=True)
class GoogleProvider(Provider):
    # GOOGLE_SSO_HOSTED_DOMAIN: only accounts of this Workspace domain.
    required_domain: Optional[str] = None

    def authorize_params(self) -> Dict[str, str]:
        return {"hd": self.required_domain} if self.required_domain else {}

    def issuer_ok(self, claims: dict, doc: dict) -> bool:
        # Google documents both spellings.
        return claims.get("iss") in _GOOGLE_ISSUERS

    def issuer(self, claims: dict) -> str:
        return _GOOGLE_ISSUERS[0]

    def email_trusted(self, claims: dict, email: str) -> bool:
        if not claim_true(claims.get("email_verified")):
            return False
        domain = _domain_of(email)
        return domain in _GOOGLE_CONSUMER_DOMAINS or domain == self.hosted_domain(claims)

    def check_claims(self, claims: dict) -> None:
        if self.required_domain and self.hosted_domain(claims) != self.required_domain:
            raise SsoError("wrong_domain", f"Google account is not in {self.required_domain}")

    def hosted_domain(self, claims: dict) -> Optional[str]:
        return (claims.get("hd") or "").strip().lower() or None

    def photo_request(self, claims: dict, access_token: Optional[str]) -> Optional[PhotoRequest]:
        url = claims.get("picture") or ""
        parsed = urlparse(url)
        host = (parsed.hostname or "").lower()
        if parsed.scheme != "https" or not (host == "googleusercontent.com" or host.endswith(".googleusercontent.com")):
            return None
        # The token links a 96px thumbnail; the same URL serves larger sizes.
        return re.sub(r"=s\d+(-c)?$", "=s256-c", url), {}


# MICROSOFT_SSO_TENANT values that accept accounts from any directory.
_MICROSOFT_SHARED_TENANTS = {"common", "organizations", "consumers"}
# The tenant personal Microsoft accounts sign in from. Microsoft verifies their
# address itself, unlike a work directory, whose admin can type in any address.
MICROSOFT_CONSUMER_TENANT_ID = "9188040d-6c67-4c5b-b112-36a304b66dad"
MICROSOFT_ISSUER_TEMPLATE = "https://login.microsoftonline.com/{tenantid}/v2.0"
MICROSOFT_GRAPH_PHOTO_URL = "https://graph.microsoft.com/v1.0/me/photo/$value"


@dataclass(frozen=True)
class MicrosoftProvider(Provider):
    # True when the operator pinned Microsoft to their own directory, whose
    # addresses they manage and so may link accounts by.
    trusts_directory_email: bool = False

    def issuer_ok(self, claims: dict, doc: dict) -> bool:
        published = doc.get("issuer") or ""
        if "{tenantid}" in published:
            # Multi-tenant: the issuer is per tenant and the token says which
            # one signed it; the discovery document only gives the shape.
            tenant = claims.get("tid")
            return bool(tenant) and claims.get("iss") == MICROSOFT_ISSUER_TEMPLATE.replace("{tenantid}", tenant)
        return super().issuer_ok(claims, doc)

    def subject(self, claims: dict) -> str:
        # `sub` is different for every app registration; `oid` is the account's
        # id in its tenant (which the issuer names), so links survive moving
        # to a new client id.
        return str(claims.get("oid") or claims.get("sub") or "")

    def email(self, claims: dict) -> str:
        email = super().email(claims)
        if email:
            return email
        # Accounts without an `email` claim: the sign-in name, when it is an address.
        upn = (claims.get("preferred_username") or "").strip().lower()
        return upn if "@" in upn else ""

    def email_trusted(self, claims: dict, email: str) -> bool:
        # In a work directory the admin sets the address, so a stranger's tenant
        # could claim anyone's: it counts only for a personal account, a domain
        # Microsoft checked (the optional `xms_edov` claim), or a tenant the
        # operator pinned as their own.
        return (
            self.trusts_directory_email
            or claims.get("tid") == MICROSOFT_CONSUMER_TENANT_ID
            or claim_true(claims.get("xms_edov"))
        )

    def tenant_id(self, claims: dict) -> Optional[str]:
        return claims.get("tid")

    def photo_request(self, claims: dict, access_token: Optional[str]) -> Optional[PhotoRequest]:
        if not access_token:
            return None
        return MICROSOFT_GRAPH_PHOTO_URL, {"Authorization": f"Bearer {access_token}"}


def microsoft_tenant_is_shared() -> bool:
    """Whether Microsoft is configured to accept accounts from any directory."""
    return (settings.MICROSOFT_SSO_TENANT or "common").strip().lower() in _MICROSOFT_SHARED_TENANTS


def providers() -> Dict[str, Provider]:
    """The providers an operator has configured, in the order the login page shows them."""
    out: Dict[str, Provider] = {}
    if settings.GOOGLE_SSO_CLIENT_ID and settings.GOOGLE_SSO_CLIENT_SECRET:
        out[GOOGLE] = GoogleProvider(
            key=GOOGLE,
            label="Google",
            discovery_url="https://accounts.google.com/.well-known/openid-configuration",
            scopes="openid email profile",
            client_id=settings.GOOGLE_SSO_CLIENT_ID,
            client_secret=settings.GOOGLE_SSO_CLIENT_SECRET,
            required_domain=(settings.GOOGLE_SSO_HOSTED_DOMAIN or "").strip().lower() or None,
        )
    if settings.MICROSOFT_SSO_CLIENT_ID and settings.MICROSOFT_SSO_CLIENT_SECRET:
        tenant = (settings.MICROSOFT_SSO_TENANT or "common").strip()
        out[MICROSOFT] = MicrosoftProvider(
            key=MICROSOFT,
            label="Microsoft",
            discovery_url=f"https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration",
            # User.Read is what lets us read the profile photo from Graph.
            scopes="openid email profile User.Read",
            client_id=settings.MICROSOFT_SSO_CLIENT_ID,
            client_secret=settings.MICROSOFT_SSO_CLIENT_SECRET,
            trusts_directory_email=not microsoft_tenant_is_shared(),
        )
    return out


def get_provider(key: str) -> Optional[Provider]:
    return providers().get((key or "").lower())
