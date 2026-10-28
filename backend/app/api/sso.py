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

Dashboard single sign-on (Google, Microsoft). See app.services.sso for the flow.
"""

import secrets
from typing import Dict, Optional
from urllib.parse import urlencode, urlsplit

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.auth import revoke_presented_sessions, set_session_cookies
from app.core.config import settings
from app.core.logger import get_logger
from app.database import get_db
from app.models.role import Role
from app.services import sso, sso_state
from app.services.auth_sessions import SSO_LOGIN, issue_tokens
from app.services.profile_pictures import adopt_provider_photo
from app.services.shopify_links import link_shop_at_sign_in
from app.services.sign_in_policy import SignInRefused, check_sign_in, end_refused_sessions, password_form_primary
from app.services.sso_accounts import user_for_identity
from app.services.sso_providers import Provider, SsoError, get_provider, providers
from app.services.sso_signup import SIGNUP_INTENT, signup_handler

logger = get_logger(__name__)
router = APIRouter()

# Login-page parameters that survive the provider round trip, so SSO finishes
# the Shopify install flows and ?redirect= the way a password login does.
# `intent=signup`: started from the signup page (see app.services.sso_signup).
CARRIED_LOGIN_PARAMS = ("redirect", "shopify_flow", "shop_id", "shop", "host", "return_to", "embedded", "intent")
# Destinations the dashboard navigates to after sign-in: only its own pages.
_DESTINATION_PARAMS = ("redirect", "return_to")
# Kept small: the parameters ride in the state cookie, which must stay under 4KB.
_MAX_CARRIED_LENGTH = 256


def _internal_path(value: str) -> bool:
    """A path on the dashboard itself, never another site. Browsers read "//host"
    and "/\\host" as another host, and drop tabs and newlines first, so
    "/<tab>/host" is one too: refuse control characters and spaces outright."""
    if not value.startswith("/") or any(ch <= " " or ch == "\\" for ch in value):
        return False
    return not value.startswith("//") and urlsplit(value).netloc == ""


def _carried(request: Request) -> Dict[str, str]:
    params = request.query_params
    carried = {}
    for name in CARRIED_LOGIN_PARAMS:
        value = params.get(name)
        # ASCII only: JSON escapes anything else six-fold, which could push the
        # state cookie past what browsers keep.
        if not value or len(value) > _MAX_CARRIED_LENGTH or not value.isascii():
            continue
        if name in _DESTINATION_PARAMS and not _internal_path(value):
            continue
        if name == "intent" and value != SIGNUP_INTENT:
            continue
        carried[name] = value
    return carried


def _page_redirect(page: str, **params: str) -> RedirectResponse:
    return RedirectResponse(f"{settings.FRONTEND_URL.rstrip('/')}{page}?{urlencode(params)}", status_code=302)


def _login_redirect(**params: str) -> RedirectResponse:
    return _page_redirect("/login", **params)


def _page_params(carried: Dict[str, str]) -> Dict[str, str]:
    """The carried parameters the dashboard page gets back; the intent was for us."""
    return {name: value for name, value in carried.items() if name != "intent"}


def _back_with_error(code: str, carried: Dict[str, str]) -> RedirectResponse:
    """To the page the sign-in started from, with the error and its parameters."""
    page = "/signup" if carried.get("intent") == SIGNUP_INTENT else "/login"
    return _page_redirect(page, sso_error=code, **_page_params(carried))


def _provider_or_404(key: str) -> Provider:
    provider = get_provider(key)
    if provider is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sign-in provider not available")
    return provider


@router.get("/config")
async def sign_in_config():
    """What the login page offers: a button per configured provider, and
    whether it leads with the e-mail/password form or with SSO."""
    return {
        "providers": [{"key": p.key, "label": p.label} for p in providers().values()],
        "password_login": password_form_primary(),
    }


@router.get("/{provider_key}/start")
async def start(provider_key: str, request: Request):
    """Send the browser to the provider, handing it the state cookie the
    callback redeems (see app.services.sso_state)."""
    provider = _provider_or_404(provider_key)
    carried = _carried(request)
    state = secrets.token_urlsafe(24)
    nonce = secrets.token_urlsafe(16)
    verifier, challenge = sso.new_pkce_pair()
    try:
        authorize_url = await sso.authorize_url(provider, state, nonce, challenge)
    except (SsoError, httpx.HTTPError) as e:
        logger.error(f"SSO {provider.key} sign-in could not start: {e}")
        return _back_with_error("provider_error", carried)

    response = RedirectResponse(authorize_url, status_code=302)
    sso_state.forget_abandoned(request, response)
    sso_state.remember(response, state, {"provider": provider.key, "nonce": nonce, "verifier": verifier, "carry": carried})
    return response


@router.get("/{provider_key}/callback")
async def callback(
    provider_key: str,
    request: Request,
    background_tasks: BackgroundTasks,
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Finish the sign-in and hand the browser back to the dashboard with the
    session cookies a password login would set. Problems land on the login
    page as `sso_error`; the detail stays in the log."""
    provider = get_provider(provider_key)
    started = sso_state.recall(request, state)
    if provider is None:
        # Switched off while the person was at the provider.
        response = _back_with_error("provider_error", sso_state.carried_after_expiry(request, state))
    elif not started or started.get("provider") != provider.key:
        # Took too long, or not this browser's sign-in: keep the flow it came
        # from (a Shopify install) so trying again lands in the same place.
        response = _back_with_error("invalid_state", sso_state.carried_after_expiry(request, state))
    else:
        carried = started.get("carry") or {}
        try:
            response = await _complete_sign_in(provider, started, carried, request, background_tasks, code, error, db)
        except SsoError as e:
            db.rollback()
            logger.warning(f"SSO {provider.key} sign-in rejected ({e.code}): {e.detail}")
            response = _back_with_error(e.code, carried)
        except httpx.HTTPError as e:
            db.rollback()
            logger.error(f"SSO {provider.key} provider unreachable: {e}")
            response = _back_with_error("provider_error", carried)
        except Exception:
            db.rollback()
            logger.exception(f"SSO {provider.key} sign-in failed")
            response = _back_with_error("server_error", carried)
    sso_state.forget(response, state)
    return response


async def _complete_sign_in(
    provider: Provider,
    started: dict,
    carried: Dict[str, str],
    request: Request,
    background_tasks: BackgroundTasks,
    code: Optional[str],
    error: Optional[str],
    db: Session,
) -> RedirectResponse:
    if error or not code:
        # The person cancelled at the provider, or it refused the request.
        raise SsoError("provider_error", f"returned without a code: {error or 'no code'}")

    tokens = await sso.exchange_code(provider, code, started.get("verifier") or "")
    claims = await sso.verify_id_token(provider, tokens["id_token"], started.get("nonce") or "")
    identity = sso.identity_from_claims(provider, claims)
    try:
        user, link = user_for_identity(db, provider.key, identity)
    except SsoError as refused:
        begin_signup = signup_handler(carried, refused)
        if begin_signup is None:
            raise
        db.rollback()
        return begin_signup(db, provider, identity, _page_params(carried))
    if user.organization is None or not user.organization.is_active:
        raise SsoError("account_inactive", f"organization of user {user.id} is inactive")
    try:
        check_sign_in(db, user, SSO_LOGIN, identity)
    except SignInRefused as refused:
        raise SsoError("sign_in_refused", str(refused))
    end_refused_sessions(db, user)

    if not user.full_name and identity.name:
        user.full_name = identity.name
    user.is_online = True
    user.last_seen = func.now()
    revoke_presented_sessions(db, request)
    access_token, refresh_token = issue_tokens(
        db, user.id, user.organization_id, auth_method=SSO_LOGIN, identity_id=link.id
    )
    db.commit()
    role = db.query(Role).filter(Role.id == user.role_id).first()

    if carried.get("shop_id"):
        link_shop_at_sign_in(db, carried["shop_id"], user.organization_id)
    if not user.profile_pic:
        # After the response: a slow photo host must not hold up the sign-in.
        background_tasks.add_task(adopt_provider_photo, user.id, provider, claims, tokens.get("access_token"))

    # Signed in, wherever it started: an account that exists is not signed up twice.
    response = _login_redirect(sso="ok", **_page_params(carried))
    set_session_cookies(response, user, role, access_token, refresh_token)
    logger.info(f"SSO {provider.key} sign-in for user {user.id}")
    return response
