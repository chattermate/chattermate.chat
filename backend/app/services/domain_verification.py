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

Custom-domain verification for the public help center.

The customer proves control of the domain with a TXT record
(_chattermate.<domain> = cm-verify=<token>) and routes traffic with a CNAME
to HELP_CENTER_CNAME_TARGET (A/AAAA records matching HELP_CENTER_TARGET_IPS
are accepted for providers that flatten CNAMEs). Both must pass before the
host dispatcher will ever serve the domain. SSL turns active once an HTTPS
probe against /healthz succeeds with a valid certificate.
"""

import os
import secrets
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logger import get_logger
from app.models.help_center import HelpCenterSettings, SSLStatus
from app.repositories.help_center import HelpCenterRepository

logger = get_logger(__name__)

DNS_LIFETIME_SECONDS = 5.0
SSL_PROBE_TIMEOUT_SECONDS = 10.0
TXT_RECORD_PREFIX = "_chattermate"
# Public resolvers for verification lookups. The container's own resolver is
# Docker's embedded DNS (127.0.0.11) for service discovery — it negatively
# caches names that didn't exist when first queried (so a TXT added *after* the
# customer set up the domain keeps returning NXDOMAIN). Query public DNS
# directly, and let self-hosters override if their network blocks these.
_PUBLIC_DNS_RESOLVERS = [
    ip.strip()
    for ip in os.getenv("DOMAIN_VERIFY_DNS_RESOLVERS", "1.1.1.1,8.8.8.8,9.9.9.9").split(",")
    if ip.strip()
]


def generate_verification_token() -> str:
    return secrets.token_hex(16)


def txt_record_host(domain: str) -> str:
    return f"{TXT_RECORD_PREFIX}.{domain}"


def expected_txt_value(row: HelpCenterSettings) -> str:
    return f"cm-verify={row.domain_verification_token}"


def _resolver():
    import dns.resolver

    resolver = dns.resolver.Resolver()
    if _PUBLIC_DNS_RESOLVERS:
        resolver.nameservers = _PUBLIC_DNS_RESOLVERS
    resolver.lifetime = DNS_LIFETIME_SECONDS
    return resolver


def check_txt_record(row: HelpCenterSettings) -> bool:
    """True when the verification TXT record is present."""
    import dns.resolver

    expected = expected_txt_value(row)
    try:
        answers = _resolver().resolve(txt_record_host(row.custom_domain), "TXT")
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.NoNameservers,
            dns.resolver.LifetimeTimeout):
        return False
    for record in answers:
        value = b"".join(record.strings).decode("utf-8", errors="replace")
        if value.strip() == expected:
            return True
    return False


def check_cname_record(domain: str) -> bool:
    """True when the domain points at us: CNAME to the target, or (for
    CNAME-flattening providers) A/AAAA records matching the target IPs."""
    import dns.resolver

    target = settings.HELP_CENTER_CNAME_TARGET.rstrip(".").lower()
    try:
        answers = _resolver().resolve(domain, "CNAME")
        return any(str(record.target).rstrip(".").lower() == target for record in answers)
    except (dns.resolver.NXDOMAIN, dns.resolver.NoNameservers, dns.resolver.LifetimeTimeout):
        return False
    except dns.resolver.NoAnswer:
        pass  # no CNAME — fall through to flattened A/AAAA comparison
    if not settings.HELP_CENTER_TARGET_IPS:
        return False
    resolved = set()
    for rtype in ("A", "AAAA"):
        try:
            resolved.update(str(r) for r in _resolver().resolve(domain, rtype))
        except Exception:
            continue
    return bool(resolved) and resolved <= settings.HELP_CENTER_TARGET_IPS


def probe_ssl(domain: str) -> bool:
    """HTTPS reachability + certificate validation, resolving via PUBLIC DNS.
    The container's own resolver (Docker embedded DNS) negatively caches a
    custom domain that didn't exist before its cert was provisioned — so httpx
    (which uses the system resolver) would keep failing. Resolve the A record
    ourselves and connect to that IP with SNI = the domain, which also verifies
    the served cert is actually issued for this domain."""
    import socket
    import ssl

    try:
        ip = str(_resolver().resolve(domain, "A")[0])
    except Exception as e:
        logger.info(f"SSL probe DNS for {domain} not ready: {e}")
        return False
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((ip, 443), timeout=SSL_PROBE_TIMEOUT_SECONDS) as sock:
            with ctx.wrap_socket(sock, server_hostname=domain) as tls:
                tls.sendall(
                    f"GET /healthz HTTP/1.1\r\nHost: {domain}\r\nConnection: close\r\n\r\n".encode()
                )
                status_line = tls.recv(128).split(b"\r\n", 1)[0]
        return b" 200 " in status_line
    except (OSError, ssl.SSLError) as e:
        logger.info(f"SSL probe for {domain} not ready: {e}")
        return False


def set_custom_domain(db: Session, row: HelpCenterSettings, domain: str) -> HelpCenterSettings:
    """Claim a (normalized) domain: fresh token, verification state reset."""
    base_suffix = f".{settings.HELP_CENTER_BASE_DOMAIN}"
    if domain == settings.HELP_CENTER_BASE_DOMAIN or domain.endswith(base_suffix):
        raise ValueError(f"{settings.HELP_CENTER_BASE_DOMAIN} subdomains are assigned automatically and cannot be claimed.")
    row.custom_domain = domain
    row.domain_verification_token = generate_verification_token()
    row.txt_record_verified = False
    row.cname_record_verified = False
    row.ssl_status = SSLStatus.NONE
    row.domain_verified_at = None
    return HelpCenterRepository(db).update(row)


def clear_custom_domain(db: Session, row: HelpCenterSettings) -> HelpCenterSettings:
    row.custom_domain = None
    row.domain_verification_token = None
    row.txt_record_verified = False
    row.cname_record_verified = False
    row.ssl_status = SSLStatus.NONE
    row.domain_verified_at = None
    return HelpCenterRepository(db).update(row)


def verify_custom_domain(db: Session, row: HelpCenterSettings) -> HelpCenterSettings:
    """Run both DNS checks (and the SSL probe once verified) and persist the
    outcome. Blocking (DNS/HTTP I/O) — callers run it off the event loop."""
    if not row.custom_domain:
        raise ValueError("No custom domain configured.")
    row.txt_record_verified = check_txt_record(row)
    row.cname_record_verified = check_cname_record(row.custom_domain)
    if row.domain_verified:
        if not row.domain_verified_at:
            row.domain_verified_at = datetime.now(timezone.utc)
        if row.ssl_status != SSLStatus.ACTIVE.value:
            row.ssl_status = (
                SSLStatus.ACTIVE if probe_ssl(row.custom_domain) else SSLStatus.PENDING
            )
    else:
        row.domain_verified_at = None
        row.ssl_status = SSLStatus.NONE
    return HelpCenterRepository(db).update(row)
