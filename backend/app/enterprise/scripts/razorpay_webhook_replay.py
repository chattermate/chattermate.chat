#!/usr/bin/env python3
"""
ChatterMate - Razorpay Webhook Replay Helper (test/smoke tooling)
Copyright (C) 2024 ChatterMate

Signs a Razorpay webhook payload with the webhook secret and POSTs it to the
backend - used to simulate events that are hard to trigger from the dashboard
(renewals, halted, disputes) during local smoke testing.

Usage:
  python scripts/razorpay_webhook_replay.py --event subscription.charged \
      --sub-id sub_XXXX --org-id <uuid> --plan-id <uuid> --rzp-plan-id plan_XXXX \
      [--quantity 2] [--days 30] [--amount-paise 179800] \
      [--url http://localhost:8000/api/v1/enterprise/payment/razorpay/webhook] \
      [--secret $RAZORPAY_WEBHOOK_SECRET] [--payload-file custom.json]

  # replay a raw payload file verbatim (e.g. captured from the dashboard):
  python scripts/razorpay_webhook_replay.py --payload-file event.json
"""

import argparse
import hashlib
import hmac
import json
import os
import sys
import time
import uuid
import urllib.request

DEFAULT_URL = "http://localhost:8000/api/v1/enterprise/payment/razorpay/webhook"

SUBSCRIPTION_EVENTS = [
    "subscription.authenticated", "subscription.activated", "subscription.charged",
    "subscription.pending", "subscription.halted", "subscription.cancelled",
    "subscription.completed", "subscription.paused", "subscription.resumed",
]
DISPUTE_EVENTS = [
    "payment.dispute.created", "payment.dispute.lost",
    "payment.dispute.won", "payment.dispute.closed",
]


def build_payload(args) -> dict:
    now = int(time.time())
    if args.event in SUBSCRIPTION_EVENTS:
        entity = {
            "id": args.sub_id,
            "entity": "subscription",
            "plan_id": args.rzp_plan_id,
            "status": args.event.split(".")[-1],
            "quantity": args.quantity,
            "current_start": now,
            "current_end": now + args.days * 86400,
            "notes": {"org_id": args.org_id, "plan_id": args.plan_id},
        }
        if args.start_at_days:
            entity["start_at"] = now + args.start_at_days * 86400
        payload = {"subscription": {"entity": entity}}
        if args.event == "subscription.charged":
            payload["payment"] = {"entity": {
                "id": f"pay_replay{uuid.uuid4().hex[:8]}",
                "amount": args.amount_paise,
                "currency": args.currency,
            }}
        return {"entity": "event", "event": args.event,
                "contains": list(payload.keys()), "payload": payload, "created_at": now}

    if args.event in DISPUTE_EVENTS:
        return {
            "entity": "event", "event": args.event, "contains": ["dispute"],
            "payload": {"dispute": {"entity": {
                "id": f"disp_replay{uuid.uuid4().hex[:8]}",
                "payment_id": args.payment_id or f"pay_replay{uuid.uuid4().hex[:8]}",
                "amount": args.amount_paise,
                "status": args.event.split(".")[-1],
            }}},
            "created_at": now,
        }

    sys.exit(f"Unsupported event: {args.event}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--event", choices=SUBSCRIPTION_EVENTS + DISPUTE_EVENTS)
    parser.add_argument("--payload-file", help="raw event JSON to replay verbatim")
    parser.add_argument("--url", default=os.getenv("RAZORPAY_WEBHOOK_URL", DEFAULT_URL))
    parser.add_argument("--secret", default=os.getenv("RAZORPAY_WEBHOOK_SECRET", ""))
    parser.add_argument("--sub-id", default=f"sub_replay{uuid.uuid4().hex[:8]}")
    parser.add_argument("--org-id")
    parser.add_argument("--plan-id")
    parser.add_argument("--rzp-plan-id")
    parser.add_argument("--payment-id")
    parser.add_argument("--quantity", type=int, default=1)
    parser.add_argument("--days", type=int, default=30, help="billing period length")
    parser.add_argument("--start-at-days", type=int, default=0, help="future start offset (scheduled subs)")
    parser.add_argument("--amount-paise", type=int, default=89900)
    parser.add_argument("--currency", default="INR")
    parser.add_argument("--event-id", default=None, help="reuse to test dedupe")
    args = parser.parse_args()

    if not args.secret:
        sys.exit("Webhook secret required (--secret or RAZORPAY_WEBHOOK_SECRET)")

    if args.payload_file:
        body = open(args.payload_file, "rb").read()
    else:
        if not args.event:
            sys.exit("--event or --payload-file required")
        if args.event in SUBSCRIPTION_EVENTS and not (args.org_id and args.plan_id and args.rzp_plan_id):
            sys.exit("--org-id, --plan-id and --rzp-plan-id are required for subscription events")
        body = json.dumps(build_payload(args)).encode()

    signature = hmac.new(args.secret.encode(), body, hashlib.sha256).hexdigest()
    event_id = args.event_id or f"evt_replay{uuid.uuid4().hex[:10]}"

    request = urllib.request.Request(args.url, data=body, method="POST", headers={
        "Content-Type": "application/json",
        "X-Razorpay-Signature": signature,
        "x-razorpay-event-id": event_id,
    })
    print(f"POST {args.url}\n  event-id: {event_id}\n  body: {body.decode()[:200]}...")
    try:
        with urllib.request.urlopen(request) as response:
            print(f"  -> {response.status}: {response.read().decode()}")
    except urllib.error.HTTPError as e:
        print(f"  -> {e.code}: {e.read().decode()}")
        sys.exit(1)


if __name__ == "__main__":
    main()
