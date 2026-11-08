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

WhatsApp numbers and Messenger Pages that live in the customer's own Meta
app (connected with manual credentials) rather than in ChatterMate's.

Meta signs their webhooks with the customer's app secret, which the shared
/webhooks/meta endpoint can't check. So each such account gets its own
webhook address, checked with its app's secret only. That address takes
events for the account and for the same organization's other accounts from
the same app (one Meta app has one Messenger callback, and possibly several
numbers), never for anyone else's: a payload signed with a secret someone
chose themselves can't reach another organization.

A WhatsApp number is pointed at its address with a per-number callback
override; Messenger has no override, so the customer pastes the address and
verify token into their app.
"""

import hashlib
import hmac
from dataclasses import dataclass
from typing import Callable, Optional

from sqlalchemy.orm import Session

from app.channels.meta_base import graph_detail, graph_get, graph_post_json
from app.core.config import settings, webhooks_base_url
from app.core.logger import get_logger
from app.models.channels import ChannelAccount, ChannelType
from app.core.security import decrypt_credentials
from app.repositories.channels.accounts import ChannelAccountRepository

logger = get_logger(__name__)

# In the account's encrypted credentials
APP_SECRET_KEY = "app_secret"
# In its (non-secret) settings: which app it's from, and whether Meta
# accepted our per-number callback for it
APP_ID_SETTING = "meta_app_id"
AUTO_WEBHOOK_SETTING = "webhook_auto_configured"
OWN_APP_CHANNELS = (ChannelType.WHATSAPP.value, ChannelType.MESSENGER.value)

# Meta's answer to an appsecret_proof made with another app's secret
_PROOF_ERROR = "appsecret_proof"


class AppSecretMismatch(Exception):
    """The secret isn't the one of the app that issued the token."""


class AppSecretRequired(Exception):
    """The token is from the customer's own app and no secret was given:
    without it, messages to the number or Page could never be verified."""


class AppCheckUnavailable(Exception):
    """Meta couldn't be asked (network, rate limit, an expired token…)."""


@dataclass
class OwnApp:
    app_id: str
    secret: str


def is_own_app(account: Optional[ChannelAccount]) -> bool:
    return (account is not None and account.channel_type in OWN_APP_CHANNELS
            and bool((account.settings or {}).get(APP_ID_SETTING)))


def own_app_secret(account: ChannelAccount) -> Optional[str]:
    return decrypt_credentials(account.encrypted_credentials).get(APP_SECRET_KEY) if is_own_app(account) else None


def own_app_token(account: Optional[ChannelAccount]) -> Optional[str]:
    """The customer's token, read before a reconnect replaces it: only it can
    take back a callback override made with it."""
    return decrypt_credentials(account.encrypted_credentials).get("access_token") if is_own_app(account) else None


def own_app_webhook_url(account: ChannelAccount) -> str:
    return f"{webhooks_base_url()}/meta/{account.id}"


async def resolve_own_app(access_token: str, entered_secret: Optional[str]) -> Optional[OwnApp]:
    """The customer's own app behind this token, proven with its secret.

    None for ChatterMate's own app, whose webhooks the shared address already
    gets. That is the only token that needs no secret (a number or Page from
    one-click signup, reconnected by hand), so a missing one is checked with
    ChatterMate's own secret: it proves only our app's tokens.

    Raises AppSecretRequired, AppSecretMismatch or AppCheckUnavailable."""
    secret = entered_secret or settings.META_APP_SECRET
    params = {"fields": "id"}
    if secret:
        params["appsecret_proof"] = hmac.new(secret.encode(), access_token.encode(), hashlib.sha256).hexdigest()
    # /app (the token's own app) needs no permission on the Page or number
    ok, data = await graph_get("app", access_token, params=params)
    if not ok:
        error = data.get("error") if isinstance(data.get("error"), dict) else {}
        if _PROOF_ERROR in str(error.get("message", "")):
            raise AppSecretMismatch() if entered_secret else AppSecretRequired()
        # Meta's own errors carry a code; anything else is ours (a timeout,
        # a socket error) and stays in the log
        logger.warning(f"Could not check an app secret with Meta: {error.get('message')}")
        raise AppCheckUnavailable(graph_detail(data, "") if "code" in error else "Meta did not answer")
    app_id = str(data.get("id") or "")
    if not app_id or app_id == settings.META_APP_ID:
        return None
    if not entered_secret:
        raise AppSecretRequired()
    return OwnApp(app_id=app_id, secret=entered_secret)


async def sync_own_app(db: Session, account: ChannelAccount, own: Optional[OwnApp],
                       access_token: str, previous_token: Optional[str]) -> None:
    """After a connect: route the account's webhooks to its own address when
    it's from the customer's app, or hand a number that used to be back."""
    repo = ChannelAccountRepository(db)
    is_whatsapp = account.channel_type == ChannelType.WHATSAPP.value
    if own is not None:
        # Moved to another app: the old app's override is still the old app's
        if is_whatsapp and previous_token and (account.settings or {}).get(APP_ID_SETTING) != own.app_id:
            await _set_number_callback(account, previous_token, "", None)
        # Saved first: Meta checks the address during the callback call, and
        # the address only answers for an account marked as from its own app
        repo.update_settings(account, {APP_ID_SETTING: own.app_id})
        if is_whatsapp:
            pointed = await _set_number_callback(
                account, access_token, own_app_webhook_url(account), account.webhook_secret)
            repo.update_settings(account, {AUTO_WEBHOOK_SETTING: pointed})
        return
    if previous_token is not None:
        if is_whatsapp:
            await _set_number_callback(account, previous_token, "", None)
        repo.update_settings(account, {}, remove=(APP_ID_SETTING, AUTO_WEBHOOK_SETTING))


async def leave_own_app(account: ChannelAccount) -> None:
    """Before a disconnect: send the number's webhooks back to the customer's
    app. Best effort — a disconnect must never fail over it."""
    if account.channel_type != ChannelType.WHATSAPP.value:
        return
    try:
        token = own_app_token(account)
    except Exception:
        logger.exception(f"Could not read {account.id}'s credentials to release its callback")
        return
    if token:
        await _set_number_callback(account, token, "", None)


def same_app_accounts(db: Session, account: ChannelAccount) -> Callable[[str], Optional[ChannelAccount]]:
    """Resolve an external id named in a webhook to one of this organization's
    accounts from the same app (and channel), or to nothing."""
    repo = ChannelAccountRepository(db)
    app_id = account.settings[APP_ID_SETTING]

    def resolve(external_id: str) -> Optional[ChannelAccount]:
        if external_id == account.external_account_id:
            return account
        other = repo.get_by_external_id(account.channel_type, external_id)
        if (other is not None and other.organization_id == account.organization_id
                and (other.settings or {}).get(APP_ID_SETTING) == app_id):
            return other
        return None
    return resolve


async def _set_number_callback(account: ChannelAccount, access_token: str, url: str,
                               verify_token: Optional[str]) -> bool:
    """Point a WhatsApp number's webhooks at `url` ("" sends them back to the
    app's own callback). Meta checks the address during the call."""
    configuration = {"override_callback_uri": url}
    if verify_token:
        configuration["verify_token"] = verify_token
    ok, data = await graph_post_json(account.external_account_id, access_token,
                                     {"webhook_configuration": configuration})
    if not ok:
        action = "point" if url else "release"
        logger.warning(f"Could not {action} the webhook callback of {account.external_account_id}: "
                       f"{graph_detail(data, 'no reason given')}")
    return ok
