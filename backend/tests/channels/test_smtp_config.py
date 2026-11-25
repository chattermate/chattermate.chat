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

The SMTP connection settings every sender shares: an inbox's own credentials,
or the platform account (which local development points at Mailpit).
"""

import smtplib
import ssl

import pytest

from app.channels import email as email_channel
from app.channels.email import inbox_smtp_config, open_smtp, platform_smtp_config
from app.core.config import settings


@pytest.fixture
def platform(monkeypatch):
    def configure(port, username="", password=""):
        monkeypatch.setattr(settings, "SMTP_SERVER", "smtp.example.com")
        monkeypatch.setattr(settings, "SMTP_PORT", port)
        monkeypatch.setattr(settings, "SMTP_USERNAME", username)
        monkeypatch.setattr(settings, "SMTP_PASSWORD", password)
    return configure


@pytest.mark.parametrize("port,use_ssl", [(587, False), (465, True), ("1025", False)])
def test_platform_config(platform, port, use_ssl):
    platform(port, "relay-user", "relay-pass")
    assert platform_smtp_config("noreply@example.com") == {
        "host": "smtp.example.com", "port": int(port), "username": "relay-user",
        "password": "relay-pass", "from_email": "noreply@example.com", "use_ssl": use_ssl,
    }


def test_inbox_config_defaults():
    cfg = inbox_smtp_config({"smtp_host": "smtp.acme.com"}, "support@acme.com")
    assert cfg["port"] == 587 and cfg["use_ssl"] is False
    assert cfg["from_email"] == "support@acme.com"


@pytest.mark.parametrize("port,explicit,expected", [(465, False, False), (587, True, True), (465, None, True)])
def test_inbox_explicit_ssl_wins(port, explicit, expected):
    creds = {"smtp_host": "smtp.acme.com", "smtp_port": port, "smtp_use_ssl": explicit}
    assert inbox_smtp_config(creds, "support@acme.com")["use_ssl"] is expected


class FakeSMTP:
    def __init__(self, host, port, timeout=None):
        self.calls = []

    def starttls(self, context=None):
        self.context = context
        raise smtplib.SMTPNotSupportedError("STARTTLS extension not supported by server.")

    def login(self, username, password):
        self.calls.append(("login", username))

    def close(self):
        self.calls.append(("close",))


def test_platform_without_username_skips_login(platform, monkeypatch):
    """Mailpit: no STARTTLS offered, no credentials configured."""
    platform(1025)
    monkeypatch.setattr(email_channel.smtplib, "SMTP", FakeSMTP)
    assert open_smtp(platform_smtp_config("noreply@example.com")).calls == []


def test_a_server_without_starttls_is_refused_when_tls_is_required(monkeypatch):
    """A merchant's own server: no password goes out in the clear."""
    made = []
    monkeypatch.setattr(email_channel.smtplib, "SMTP", lambda *a, **k: made.append(FakeSMTP(*a, **k)) or made[-1])
    cfg = {**inbox_smtp_config({"smtp_host": "mail.example.com", "smtp_port": 587,
                                "smtp_username": "u", "smtp_password": "p"}, "a@example.com"),
           "require_tls": True}
    with pytest.raises(smtplib.SMTPNotSupportedError):
        open_smtp(cfg)
    assert made[0].calls == [("close",)]



class TlsSMTP(FakeSMTP):
    def starttls(self, context=None):
        self.context = context


def test_required_tls_checks_the_certificate_and_its_name(monkeypatch):
    """Required TLS uses a verifying context, so a stranger's certificate is refused."""
    made = []
    monkeypatch.setattr(email_channel.smtplib, "SMTP", lambda *a, **k: made.append(TlsSMTP(*a, **k)) or made[-1])
    cfg = {**inbox_smtp_config({"smtp_host": "mail.example.com", "smtp_port": 587}, "a@example.com"), "require_tls": True}
    open_smtp(cfg)
    assert made[0].context.verify_mode == ssl.CERT_REQUIRED and made[0].context.check_hostname


def test_a_pinned_connection_dials_the_checked_address_but_keeps_the_name(monkeypatch):
    """The name can't be re-pointed after the check: the socket goes to the
    checked address, and TLS still checks the certificate for the name."""
    dialled = []
    monkeypatch.setattr(smtplib.socket, "create_connection",
                        lambda address, *a, **k: dialled.append(address) or (_ for _ in ()).throw(OSError("stop")))
    with pytest.raises(OSError):
        email_channel._PinnedSMTP("mail.example.com", 587, "203.0.113.7", timeout=1)
    assert dialled == [("203.0.113.7", 587)]
