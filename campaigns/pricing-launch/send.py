#!/usr/bin/env python3
"""Send one pricing email. Runs on the HOST with plain python3, never in a container.

Dry run is the default: it screens and renders every recipient, prints what would
go out, and opens no SMTP connection.

  python3 send.py launch data/launch.json
  python3 send.py launch data/launch.json --test-to admin@chattermate.chat
  python3 send.py launch data/launch.json --send --confirm launch:212

--confirm must match the count the dry run printed, so a send can't happen by
accident or against a list nobody looked at. data/sent.<campaign>.log is written
after each send, so an interrupted run resumes without double-sending.

Env for anything that sends: SMTP_SERVER SMTP_PORT SMTP_USERNAME SMTP_PASSWORD
FROM_EMAIL UNSUBSCRIBE_SECRET
"""
import argparse
import base64
import hashlib
import hmac
import json
import os
import smtplib
import sys
import time
from datetime import date, datetime, timedelta, timezone
from email.message import EmailMessage
from email.utils import formataddr, formatdate, make_msgid
from pathlib import Path
from typing import Dict, List, Optional, Set
from urllib.parse import urlencode
from uuid import UUID

from audience import Exclusions, load_exclusions, screen
from blocks import Rendered
from catalog import HERE, Settings, load_settings
from emails import CAMPAIGNS
from theme import SUPPORT_EMAIL

FROM_NAME = "Runix, ChatterMate"  # as the app's own emails
SMTP_KEYS = ("SMTP_SERVER", "SMTP_PORT", "SMTP_USERNAME", "SMTP_PASSWORD", "FROM_EMAIL", "UNSUBSCRIBE_SECRET")
DATA_DIR = HERE / "data"
PREVIEW_SECRET = "dry-run-only"
MAX_EXPORT_AGE_HOURS = 24
DEFAULT_DELAY_SECONDS = 1.5
# Brevo's plan allows 300 emails a day across everything we send, app email
# included. Campaigns share 100 of them in any 24 hours, so sign-up codes and
# trial emails always have room whichever timezone Brevo counts its day in. A
# run sends up to what is left; the rest wait for a later run, and the sent
# logs keep anyone from getting two.
DEFAULT_DAILY_LIMIT = 100
CAP_WINDOW = timedelta(hours=24)


def unsubscribe_url(user_id: str, secret: str, backend_url: str) -> str:
    """The link enterprise's services/unsubscribe.py checks. Same HMAC, kept here so
    this script needs no app import. The test pins it to a value that module made."""
    user_hex = UUID(str(user_id)).hex
    digest = hmac.new(secret.encode(), f"v1:{user_hex}:lifecycle".encode(), hashlib.sha256).digest()[:16]
    signature = base64.urlsafe_b64encode(digest).rstrip(b"=").decode()
    query = urlencode({"t": f"{user_hex}.{signature}"})
    return f"{backend_url.rstrip('/')}/api/v1/enterprise/email/unsubscribe?{query}"


def build_message(rendered: Rendered, to_email: str, from_email: str, unsubscribe: str,
                  subject_prefix: str = "") -> EmailMessage:
    message = EmailMessage()
    message["Subject"] = f"{subject_prefix}{rendered.subject}"
    message["From"] = formataddr((FROM_NAME, from_email))
    message["To"] = to_email
    message["Reply-To"] = SUPPORT_EMAIL
    message["Date"] = formatdate(localtime=False)
    message["Message-ID"] = make_msgid(domain=from_email.rsplit("@", 1)[-1])
    message["List-Unsubscribe"] = f"<{unsubscribe}>, <mailto:{SUPPORT_EMAIL}?subject=unsubscribe>"
    message["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
    message.set_content(rendered.text)
    message.add_alternative(rendered.html, subtype="html")
    return message


def read_sent(log: Path) -> Set[str]:
    if not log.exists():
        return set()
    return {line.split("\t")[0] for line in log.read_text(encoding="utf-8").splitlines() if line.strip()}


def _sent_at(line: str) -> Optional[datetime]:
    parts = line.split("\t")
    try:
        return datetime.fromisoformat(parts[1]) if len(parts) > 1 else None
    except ValueError:
        return None


def sent_recently(data_dir: Path, now: datetime) -> int:
    """Campaign emails sent in the last 24 hours, across every campaign's log."""
    since = now - CAP_WINDOW
    return sum(
        1
        for log in data_dir.glob("sent.*.log")
        for line in log.read_text(encoding="utf-8").splitlines()
        if (_sent_at(line) or since) > since
    )


def todays_batch(items: List[tuple], limit: int, already_today: int) -> List[tuple]:
    return items[:max(0, limit - already_today)]


def record_sent(log: Path, email: str) -> None:
    log.parent.mkdir(exist_ok=True)
    with log.open("a", encoding="utf-8") as handle:
        handle.write(f"{email}\t{datetime.now(timezone.utc).isoformat()}\n")
        handle.flush()
        os.fsync(handle.fileno())  # the log has to survive an abrupt kill


def connect(env: Dict[str, str]) -> smtplib.SMTP:
    server = smtplib.SMTP(env["SMTP_SERVER"], int(env["SMTP_PORT"]), timeout=30)
    server.starttls()
    server.login(env["SMTP_USERNAME"], env["SMTP_PASSWORD"])
    return server


def smtp_env(environ) -> Dict[str, str]:
    missing = [key for key in SMTP_KEYS if not environ.get(key)]
    if missing:
        raise SystemExit(f"Not sending: missing env {', '.join(missing)}")
    return {key: environ[key] for key in SMTP_KEYS}


def live_send_problem(args, cfg: Settings, recipients_path: Path, pending: int, today: date,
                      now_timestamp: float) -> Optional[str]:
    """Why a real send must not run, or None. Checked before any connection."""
    expected = f"{args.campaign}:{pending}"
    if args.confirm != expected:
        return f"--confirm must be exactly {expected}, the count from this dry run"
    if cfg.is_sample:
        return "the catalog is the sample. Export the real one with export/catalog.sql"
    if args.campaign == "launch" and cfg.offer and not args.offer_is_live:
        return "launch mentions the offer: pass --offer-is-live once it works at checkout, or --without-offer"
    earliest = CAMPAIGNS[args.campaign].earliest(cfg)
    if earliest and today < earliest:
        return f"{args.campaign} can't go out before {earliest}"
    age_hours = (now_timestamp - recipients_path.stat().st_mtime) / 3600
    if age_hours > MAX_EXPORT_AGE_HOURS:
        return f"the export is {age_hours:.0f} hours old. Export again, so recent unsubscribes count"
    return None


def render_all(queue: List[dict], args, cfg: Settings, secret: str) -> List[tuple]:
    """Every email rendered up front, so a bad row stops the run before the first send."""
    spec = CAMPAIGNS[args.campaign]
    rendered = []
    for row in queue:
        unsubscribe = unsubscribe_url(row["user_id"], secret, cfg.backend_url)
        rendered.append((row, spec.build(row, cfg, unsubscribe), unsubscribe))
    return rendered


def print_report(items: List[tuple], skipped: List[tuple], already: int) -> None:
    for email, reason in skipped:
        print(f"skip  {email}: {reason}")
    variants: Dict[str, int] = {}
    for row, rendered, _ in items:
        variants[rendered.variant] = variants.get(rendered.variant, 0) + 1
        print(f"send  {row['email']}  [{rendered.variant}]  {row.get('org_name')!r}  {rendered.subject!r}")
    print(f"\n{len(items)} to send, {len(skipped)} skipped, {already} already sent")
    print("variants: " + (", ".join(f"{name} {count}" for name, count in sorted(variants.items())) or "none"))


def send_test(item: tuple, to_email: str, env: Dict[str, str]) -> None:
    _, rendered, unsubscribe = item
    server = connect(env)
    server.send_message(build_message(rendered, to_email, env["FROM_EMAIL"], unsubscribe, "[TEST] "))
    server.quit()
    print(f"test sent to {to_email}")


def send_live(items: List[tuple], log: Path, env: Dict[str, str], delay: float) -> int:
    server = connect(env)
    failed = 0
    for index, (row, rendered, unsubscribe) in enumerate(items, 1):
        message = build_message(rendered, row["email"], env["FROM_EMAIL"], unsubscribe)
        try:
            try:
                server.send_message(message)
            except (smtplib.SMTPServerDisconnected, smtplib.SMTPConnectError):
                server = connect(env)  # long batches outlive the connection; retry once
                server.send_message(message)
            record_sent(log, row["email"])
            print(f"[{index}/{len(items)}] sent {row['email']}", flush=True)
        except Exception as error:  # one bad address must not stop the batch
            failed += 1
            print(f"[{index}/{len(items)}] FAILED {row['email']}: {error}", flush=True)
        time.sleep(delay)
    try:
        server.quit()
    except smtplib.SMTPException:
        pass
    print(f"\ndone: sent {len(items) - failed}, failed {failed}", flush=True)
    return 1 if failed else 0


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description="Send a pricing email (dry run unless --send)")
    parser.add_argument("campaign", choices=sorted(CAMPAIGNS))
    parser.add_argument("recipients", type=Path, help="JSON from export/<campaign>.sql")
    parser.add_argument("--catalog", type=Path, help="JSON from export/catalog.sql (default: the sample)")
    parser.add_argument("--exclusions", type=Path, default=DATA_DIR / "exclusions.json")
    parser.add_argument("--without-offer", action="store_true", help="leave the trial offer out of the launch email")
    parser.add_argument("--offer-is-live", action="store_true", help="the offer has been checked at live checkout")
    parser.add_argument("--test-to", help="send the first email to this one address, marked [TEST]")
    parser.add_argument("--send", action="store_true", help="really send; needs --confirm")
    parser.add_argument("--confirm", help="campaign:count, as printed by the dry run")
    parser.add_argument("--delay", type=float, default=DEFAULT_DELAY_SECONDS, help="seconds between sends")
    parser.add_argument("--daily-limit", type=int, default=DEFAULT_DAILY_LIMIT,
                        help="campaign emails in any 24 hours, across all campaigns (the rest wait)")
    args = parser.parse_args(argv)
    if args.send and args.test_to:
        parser.error("--send and --test-to can't be used together")
    return args


def main(argv=None, environ=None, today: Optional[date] = None, now: Optional[datetime] = None) -> int:
    args = parse_args(argv)
    environ = os.environ if environ is None else environ
    now = now or datetime.now(timezone.utc)
    today = today or now.date()
    cfg = load_settings(args.catalog, with_offer=not args.without_offer)
    spec = CAMPAIGNS[args.campaign]

    if not args.exclusions.exists():
        raise SystemExit(f"No exclusions file at {args.exclusions}. See samples/exclusions.sample.json")
    rules: Exclusions = load_exclusions(args.exclusions)
    rows = json.loads(args.recipients.read_text(encoding="utf-8"))
    queue, skipped = screen(rows, rules, spec.required, today, spec.min_trial_days(cfg))

    log = DATA_DIR / f"sent.{args.campaign}.log"
    already = read_sent(log)
    pending = [row for row in queue if row["email"] not in already]

    env = smtp_env(environ) if (args.send or args.test_to) else {"UNSUBSCRIBE_SECRET": PREVIEW_SECRET}
    items = render_all(pending, args, cfg, env["UNSUBSCRIBE_SECRET"])
    print_report(items, skipped, len(queue) - len(pending))

    if args.test_to:
        if not items:
            raise SystemExit("Nothing to test with: every recipient was skipped")
        send_test(items[0], args.test_to, env)
        return 0
    batch = todays_batch(items, args.daily_limit, sent_recently(DATA_DIR, now))
    waiting = len(items) - len(batch)
    print(f"this run: {len(batch)} of {len(items)} (limit {args.daily_limit} in 24 hours)"
          + (f"; {waiting} wait for later days" if waiting else ""))
    if not args.send:
        print(f"\nDry run: nothing sent. To send: --send --confirm {args.campaign}:{len(batch)}")
        if cfg.is_sample:
            print("Rendered with the SAMPLE catalog; a real send will refuse it.")
        return 0

    if not items:
        print("Nothing left to send.")
        return 0
    if not batch:
        print("Not sending: the 24-hour limit is used up. Run again later.", file=sys.stderr)
        return 2
    problem = live_send_problem(args, cfg, args.recipients, len(batch), today, time.time())
    if problem:
        print(f"Not sending: {problem}", file=sys.stderr)
        return 2
    return send_live(batch, log, env, args.delay)


if __name__ == "__main__":
    raise SystemExit(main())
