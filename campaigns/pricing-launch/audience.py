"""Who gets an email: drop addresses we must not write to, clean up greetings.

The SQL exports already leave out unsubscribed users. This is the second gate:
internal and test accounts, throwaway mailboxes, duplicates and bad rows.
"""
import json
import re
from datetime import date
from pathlib import Path
from typing import Dict, List, NamedTuple, Optional, Sequence, Set, Tuple
from uuid import UUID

# Sending here earns hard bounces and spam-trap hits.
DISPOSABLE_DOMAINS = {
    "dropmail.me", "yopmail.com", "penfale.com", "futurejs.com", "lealking.com",
    "minitts.net", "xkxkud.com", "emlpro.com", "mailinator.com", "guerrillamail.com",
    "10minutemail.com", "trashmail.com", "sharklasers.com", "maildrop.cc",
    "temp-mail.org", "getnada.com", "throwawaymail.com",
}

# Placeholder text typed into signup forms: "Hi Test," reads worse than "Hi there,".
JUNK_NAMES = {
    "test", "tester", "sample", "admin", "user", "demo", "dummy", "none", "na",
    "aaa", "ddd", "abc", "xxx", "asd", "asdf", "qwe", "sdf", "sgasd",
}

# The app shows rupees to India and dollars elsewhere. It goes by the visitor's
# IP; an email can't, so it uses the org's timezone, the app's own fallback.
INDIAN_TIMEZONES = {"Asia/Kolkata", "Asia/Calcutta"}

GREETING_FALLBACK = "there"
WORKSPACE_FALLBACK = "your workspace"
_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class Exclusions(NamedTuple):
    domains: Set[str]
    emails: Set[str]
    email_prefixes: Tuple[str, ...]
    org_names: Set[str]


def load_exclusions(path: Path) -> Exclusions:
    raw = json.loads(Path(path).read_text(encoding="utf-8"))
    return Exclusions(
        domains={domain.lower() for domain in raw.get("domains", [])},
        emails={email.lower() for email in raw.get("emails", [])},
        email_prefixes=tuple(prefix.lower() for prefix in raw.get("email_prefixes", [])),
        org_names={name.strip().lower() for name in raw.get("org_names", [])},
    )


def _is_junk(name: str) -> bool:
    return not name or name.lower() in JUNK_NAMES or "@" in name or name.isdigit()


def first_name(row: dict) -> str:
    """The recipient's first name, or "there" when signup left us nothing usable."""
    parts = (row.get("full_name") or "").split()
    name = parts[0] if parts else ""
    if _is_junk(name):
        return GREETING_FALLBACK
    return name.capitalize() if name.islower() else name


def workspace(row: dict) -> str:
    """The org's name, or "your workspace" when it's a placeholder."""
    name = (row.get("org_name") or "").strip()
    return WORKSPACE_FALLBACK if _is_junk(name) else name


def currency(row: dict) -> str:
    """INR for an org on Indian time, USD for everyone else: one currency per org."""
    return "INR" if row.get("org_timezone") in INDIAN_TIMEZONES else "USD"


def sentence_start(text: str) -> str:
    return text[:1].upper() + text[1:]


def _exclusion_reason(row: dict, email: str, rules: Exclusions) -> Optional[str]:
    domain = email.rsplit("@", 1)[-1]
    if domain in DISPOSABLE_DOMAINS:
        return "disposable mailbox"
    if domain in rules.domains or email in rules.emails or email.startswith(rules.email_prefixes):
        return "internal or excluded address"
    if (row.get("org_name") or "").strip().lower() in rules.org_names:
        return "excluded org"
    return None


def _is_uuid(value) -> bool:
    try:
        UUID(str(value))
    except ValueError:
        return False
    return True


def _row_problem(row: dict, required: Sequence[str]) -> Optional[str]:
    if not _is_uuid(row.get("user_id")):
        return "no valid user_id for the unsubscribe link"
    missing = [field for field in required if row.get(field) is None]
    return f"missing {', '.join(missing)}" if missing else None


def _trial_problem(row: dict, today: date, min_trial_days: Optional[int]) -> Optional[str]:
    if min_trial_days is None:
        return None
    try:
        days_left = (date.fromisoformat(row["trial_end"]) - today).days
    except (KeyError, TypeError, ValueError):
        return "no readable trial_end"
    if days_left < min_trial_days:
        return f"trial has {days_left} days left, needs {min_trial_days}"
    return None


def screen(rows: List[dict], rules: Exclusions, required: Sequence[str], today: date,
           min_trial_days: Optional[int] = None) -> Tuple[List[dict], List[Tuple[str, str]]]:
    """Returns (rows to send to, [(address, why it was skipped)])."""
    queue: List[dict] = []
    skipped: List[Tuple[str, str]] = []
    seen: Dict[str, bool] = {}
    for row in rows:
        email = (row.get("email") or "").strip().lower()
        if not _EMAIL.match(email):
            skipped.append((email or "(blank)", "not an email address"))
            continue
        if email in seen:
            skipped.append((email, "duplicate"))
            continue
        seen[email] = True
        reason = (_exclusion_reason(row, email, rules) or _row_problem(row, required)
                  or _trial_problem(row, today, min_trial_days))
        if reason:
            skipped.append((email, reason))
            continue
        queue.append({**row, "email": email})
    return queue, skipped
