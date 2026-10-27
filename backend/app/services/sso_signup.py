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

Signing up with single sign-on.

The community edition doesn't: SSO there signs in team members an admin
added, never anyone new. An installed enterprise module (the hosted product,
where anyone may sign up) takes over a sign-in that started on its signup page
(`intent=signup`) and found no account to sign in to, through

    app.enterprise.services.sso_signup.begin_signup(db, provider, identity, carried) -> Response

`carried` is the signup page's parameters (a Shopify install, a ?redirect=).
The response is where the browser goes next; the callback adds nothing to it
but the spent state cookie's removal.
"""

from typing import Callable, Dict, Optional

from app.core.enterprise_hooks import EnterpriseHookBroken, enterprise_hook
from app.core.logger import get_logger
from app.services.sso_providers import SsoError

logger = get_logger(__name__)

SIGNUP_INTENT = "signup"
_HOOK = "app.enterprise.services.sso_signup"
# What linking says to someone with no account yet: none matches the address,
# or the provider doesn't vouch for it (the handler then falls back to an
# emailed code). Anything else is an answer for an existing account.
_NO_ACCOUNT_YET = {"no_account", "email_unverified"}


def signup_handler(carried: Dict[str, str], refused: SsoError) -> Optional[Callable]:
    """The enterprise handler for this refused sign-in, or None when it wasn't
    a signup, isn't one a signup answers, or nothing installed offers signup."""
    if carried.get("intent") != SIGNUP_INTENT or refused.code not in _NO_ACCOUNT_YET:
        return None
    try:
        return enterprise_hook(_HOOK, "begin_signup")
    except EnterpriseHookBroken as e:
        # Fails open into what the community edition does anyway: no signup.
        logger.error(f"SSO signup is unavailable: {e}")
        return None
