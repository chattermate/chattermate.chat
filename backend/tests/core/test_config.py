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

from app.core.config import (
    Settings,
    check_secret_configuration,
    verify_secret_configuration,
)

# The key that used to ship as the ENCRYPTION_KEY default and in .env.example. It
# is public, so a deployment still using it must be flagged.
LEGACY_PUBLIC_KEY = "RFQ4SzhyRTVYdGtsLUxsc25SaDB0QlZpbTdQRmlVRlpsZUlCaFRlU2Vxbz0="
GOOD = {
    "SECRET_KEY": "a-real-secret",
    "CONVERSATION_SECRET_KEY": "another-real-secret",
    "ENCRYPTION_KEY": "a-real-key",
}


def _config(**overrides) -> Settings:
    return Settings(ENVIRONMENT="production", **{**GOOD, **overrides})


def test_configured_secrets_are_not_flagged():
    assert check_secret_configuration(_config()) == []


def test_unset_encryption_key_is_flagged():
    """ENCRYPTION_KEY no longer carries a default, so unset is the common case."""
    assert check_secret_configuration(_config(ENCRYPTION_KEY="")) == ["ENCRYPTION_KEY"]


def test_legacy_public_encryption_key_is_still_flagged():
    """Removing the default does not help deployments that already copied it."""
    assert check_secret_configuration(
        _config(ENCRYPTION_KEY=LEGACY_PUBLIC_KEY)
    ) == ["ENCRYPTION_KEY"]


def test_env_example_placeholder_is_flagged():
    assert check_secret_configuration(
        _config(ENCRYPTION_KEY="your_fernet_encryption_key_here")
    ) == ["ENCRYPTION_KEY"]


def test_default_jwt_secret_is_flagged():
    assert check_secret_configuration(
        _config(SECRET_KEY="your-secret-key")
    ) == ["SECRET_KEY"]


def test_development_is_exempt():
    """Local development runs on the defaults on purpose."""
    config = Settings(ENVIRONMENT="development", SECRET_KEY="your-secret-key",
                      ENCRYPTION_KEY="")
    assert check_secret_configuration(config) == []


@pytest.mark.parametrize("environment", ["test", "testing", "Development"])
def test_throwaway_environments_are_exempt(environment):
    """The audit and app.core.encryption must agree on what a real deployment is;
    they used to disagree on casing and on whether test runs counted."""
    config = Settings(ENVIRONMENT=environment, SECRET_KEY="your-secret-key",
                      ENCRYPTION_KEY="")
    assert check_secret_configuration(config) == []


def test_startup_passes_with_real_secrets():
    verify_secret_configuration(_config())


def test_startup_fails_on_default_jwt_secret():
    with pytest.raises(RuntimeError, match="Refusing to start") as exc:
        verify_secret_configuration(_config(SECRET_KEY="your-secret-key"))
    # The env var, not the setting name, plus a command that produces a value.
    assert "JWT_SECRET_KEY=$(openssl rand -hex 32)" in str(exc.value)


def test_startup_fails_on_public_encryption_key():
    with pytest.raises(RuntimeError, match="Refusing to start") as exc:
        verify_secret_configuration(_config(ENCRYPTION_KEY=LEGACY_PUBLIC_KEY))
    assert "Fernet.generate_key()" in str(exc.value)


def test_startup_error_names_every_offender():
    with pytest.raises(RuntimeError) as exc:
        verify_secret_configuration(
            Settings(ENVIRONMENT="production", SECRET_KEY="",
                     CONVERSATION_SECRET_KEY="", ENCRYPTION_KEY="")
        )
    message = str(exc.value)
    for name in ("SECRET_KEY", "CONVERSATION_SECRET_KEY", "ENCRYPTION_KEY"):
        assert name in message


def test_development_still_starts_on_defaults():
    """The escape hatch is for production; development must stay zero-config."""
    verify_secret_configuration(
        Settings(ENVIRONMENT="development", SECRET_KEY="your-secret-key",
                 ENCRYPTION_KEY="")
    )


def test_escape_hatch_allows_only_the_encryption_key():
    """An instance whose data is encrypted under the public key can still boot."""
    verify_secret_configuration(
        _config(ENCRYPTION_KEY=LEGACY_PUBLIC_KEY, ALLOW_INSECURE_ENCRYPTION_KEY=True)
    )


def test_escape_hatch_does_not_excuse_the_jwt_secrets():
    """Rotating a JWT secret only ends sessions, so it has no reason to be exempt."""
    with pytest.raises(RuntimeError, match="SECRET_KEY"):
        verify_secret_configuration(
            _config(SECRET_KEY="your-secret-key", ENCRYPTION_KEY=LEGACY_PUBLIC_KEY,
                    ALLOW_INSECURE_ENCRYPTION_KEY=True)
        )


@pytest.mark.parametrize("backend_url, expected", [
    ("https://api.example.com", True),
    (" HTTPS://api.example.com ", True),
    ("http://203.0.113.7:8171", False),
    ("http://localhost:8000", False),
])
def test_secure_cookies_follows_backend_url_scheme(monkeypatch, backend_url, expected):
    from app.core.config import secure_cookies, settings
    monkeypatch.setattr(settings, "BACKEND_URL", backend_url)
    assert secure_cookies() is expected
