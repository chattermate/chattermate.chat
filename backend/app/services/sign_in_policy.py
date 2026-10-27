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

Whether a user who has proven who they are may sign in this way.

Every dashboard sign-in asks check_sign_in() once the credentials are good:
password login with the password checked, SSO with the account linked, and
every token refresh again with how its session was opened (an SSO refresh
has no `identity`), so a policy that changes reaches sessions already open. The
community edition's one rule is PASSWORD_LOGIN_ENABLED=false (see below); an
installed enterprise module adds its own through
app.enterprise.services.sign_in_policy.check_sign_in, e.g. per-organization
SSO enforcement or domain restrictions.
"""

from typing import Callable, Optional

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.enterprise_hooks import EnterpriseHookBroken, enterprise_hook
from app.core.logger import get_logger
from app.models.user import User
from app.services.auth_sessions import PASSWORD_LOGIN, revoke_non_sso_sessions
from app.services.sso import SsoIdentity
from app.services.sso_accounts import has_identity
from app.services.sso_providers import providers

logger = get_logger(__name__)

_ENTERPRISE_HOOK = "app.enterprise.services.sign_in_policy"


class SignInRefused(Exception):
    """The credentials are fine but this sign-in is not allowed. The message
    is shown to the person."""


def password_form_primary() -> bool:
    """Whether the login page leads with the e-mail/password form. With
    PASSWORD_LOGIN_ENABLED=false and a provider configured it leads with SSO
    and keeps the form one click away for people who haven't linked an
    account yet."""
    return settings.PASSWORD_LOGIN_ENABLED or not providers()


def _community_rules(db: Session, user: User, method: str) -> None:
    # PASSWORD_LOGIN_ENABLED=false: once someone has signed in with a configured
    # provider their password stops working. Until then it still does, so a
    # provider that can't vouch for someone's address (or an operator still
    # setting SSO up) never locks anyone out.
    if method == PASSWORD_LOGIN and not settings.PASSWORD_LOGIN_ENABLED and has_identity(db, user.id, providers().keys()):
        raise SignInRefused("Password sign-in is switched off for your account. Use single sign-on.")


def end_refused_sessions(db: Session, user: User) -> None:
    """After an SSO sign-in: with PASSWORD_LOGIN_ENABLED=false the user is now
    (or already was) linked, so the password sessions they still have are ones
    the policy would refuse; end them rather than let them refresh on. The
    caller commits."""
    if not settings.PASSWORD_LOGIN_ENABLED:
        revoke_non_sso_sessions(db, user.id)


def _enterprise_rules() -> Optional[Callable]:
    try:
        return enterprise_hook(_ENTERPRISE_HOOK, "check_sign_in")
    except EnterpriseHookBroken as e:
        # Installed but can't load: refuse sign-ins rather than quietly drop
        # whatever it enforces.
        logger.error(f"Enterprise sign-in policy failed to load: {e}")
        return _refuse_all


def _refuse_all(db: Session, user: User, method: str, identity: Optional[SsoIdentity] = None) -> None:
    raise SignInRefused("Sign-in is unavailable right now. Contact your administrator.")


def check_sign_in(db: Session, user: User, method: str, identity: Optional[SsoIdentity] = None) -> None:
    """Raise SignInRefused when `user` may not sign in with `method`
    (PASSWORD_LOGIN or SSO_LOGIN; `identity` is the SSO account for SSO)."""
    _community_rules(db, user, method)
    enterprise_check = _enterprise_rules()
    if enterprise_check is not None:
        enterprise_check(db, user, method, identity)
