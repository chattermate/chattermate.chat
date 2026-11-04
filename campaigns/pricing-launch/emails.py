"""The three pricing emails.

Copy rules: lead with "Pay for what your AI answers" and unlimited team members,
never frame it against seats, and never say a channel stops: on Free the inbox
keeps working and only the AI pauses.
"""
from datetime import date
from typing import Callable, Dict, NamedTuple, Optional, Tuple

from audience import first_name, sentence_start, workspace
from blocks import (Rendered, b, call_to_action, checklist, document, esc, headline, highlight,
                    link, paragraphs, signoff, strong)
from catalog import Settings, date_label, short_date_label, usd

STARTER, GROWTH, FREE, FREE_LEGACY = "Starter", "Growth", "Free", "Free (legacy)"


def _hello(row: dict) -> str:
    return f"Hi {esc(first_name(row))},"


def _org(row: dict) -> str:
    return esc(workspace(row))


def _joined(items) -> str:
    return items[0] if len(items) == 1 else f"{', '.join(items[:-1])} and {items[-1]}"


def _shared(cfg: Settings, unsubscribe_url: str) -> dict:
    return {"dashboard_url": cfg.dashboard_url, "unsubscribe_url": unsubscribe_url}


# --- Email 1: launch --------------------------------------------------------

def _offer_sentence(cfg: Settings) -> str:
    if not cfg.offer:
        return ""
    code = f'<strong style="color:{b.ACCENT};">{esc(cfg.offer.code)}</strong>'
    return (f" Keep it before the trial ends with {code} for {cfg.offer.percent}% off "
            f"your first year of Growth or Pro, billed yearly.")


def _after_trial(row: dict, cfg: Settings) -> str:
    if row.get("legacy_free"):
        return (f"When the trial ends you're back on Free, which keeps its {cfg.replies(FREE_LEGACY)} "
                f"AI replies a month until {date_label(cfg.legacy_free_end)}.")
    return f"When the trial ends you move to Free, with {cfg.replies(FREE)} AI replies a month."


def launch(row: dict, cfg: Settings, unsubscribe_url: str) -> Rendered:
    trial_end = date_label(date.fromisoformat(row["trial_end"]))
    org = _org(row)
    entry = f"{cfg.usd(STARTER)} a month ({cfg.inr(STARTER)} + GST)"
    return document(
        subject=f"Our new plans, and {cfg.trial_days()} days of Growth on us",
        preheader=f"Unlimited team members, and you're on Growth free until {trial_end}.",
        variant="legacy-free" if row.get("legacy_free") else "new-free",
        blocks=[
            headline("NEW PRICING", "Pay for what your AI answers."),
            paragraphs([
                _hello(row),
                "We've changed how ChatterMate is priced. You pay for the replies your AI writes, and that's all.",
            ]),
            checklist([
                f"{strong('Unlimited team members.')} Invite your whole team on any paid plan.",
                f"{strong('Only AI replies count.')} Visitor messages and your team's replies are free.",
                f"{strong(f'Plans from {entry}')}, with {_joined(cfg.entry_plan_includes())} included.",
            ]),
            highlight(
                "ON US",
                f"{sentence_start(org)} is on Growth, free, until {trial_end}.",
                f"WhatsApp and the other channels, workflows, no ChatterMate branding and "
                f"{cfg.replies(GROWTH)} AI replies.{_offer_sentence(cfg)}",
                cfg.channels_url,
                "Set up WhatsApp",
            ),
            paragraphs([f"{_after_trial(row, cfg)} {link(cfg.plans_url, 'See the new plans')}."], top=22),
            signoff(),
        ],
        **_shared(cfg, unsubscribe_url),
    )


# --- Email 2: win-back ------------------------------------------------------

def _growth_offer(cfg: Settings) -> str:
    title = f"Growth at {cfg.usd(GROWTH)}:"
    return (f"{strong(title)} {cfg.replies(GROWTH)} AI replies a month, your whole team, "
            f"WhatsApp and the other channels, workflows and the help center.")


def _starter_offer(cfg: Settings) -> str:
    title = f"Starter at {cfg.usd(STARTER)}:"
    return f"{strong(title)} {cfg.replies(STARTER)} AI replies a month and your whole team."


def _ai_improved() -> str:
    return f"{strong('The AI is much better')} than when you left, with guardrails and AI ticketing."


def winback(row: dict, cfg: Settings, unsubscribe_url: str) -> Rendered:
    old_price = float(row["old_price"])
    old_plan = esc(row["old_plan"])
    org = _org(row)
    trial_end = date_label(date.fromisoformat(row["trial_end"]))
    price_is_back = old_price >= cfg.plans[GROWTH]["usd"]

    if price_is_back:
        subject = "Your old price is back"
        intro = f"We've redone our pricing, and {usd(old_price)} is back."
        offers = [_growth_offer(cfg), _ai_improved()]
    else:
        # Their old price is below Growth, so "your old price is back" would be untrue.
        subject = "Your first month of Growth is on us"
        intro = f"We've redone our pricing. Plans now start at {cfg.usd(STARTER)}."
        offers = [_starter_offer(cfg), _growth_offer(cfg), _ai_improved()]

    still_there = " Your old setup and knowledge are still there." if row.get("knowledge_sources") else ""
    return document(
        subject=subject,
        preheader=f"I've switched {workspace(row)} to Growth for {cfg.winback_trial_days} days.",
        variant="same-price" if price_is_back else "below-growth",
        blocks=[
            paragraphs([
                _hello(row),
                f"You used ChatterMate on {old_plan} at {usd(old_price)} a month. {intro}",
            ], top=30),
            checklist(offers),
            paragraphs([
                f"Your first month is on us. I've switched {org} to Growth for "
                f"{cfg.winback_trial_days} days, until {trial_end}.{still_there} "
                f"{link(cfg.dashboard_url, 'Log in here')}.",
                "If something made you leave, I'd like to hear it. Just reply.",
            ], top=22),
            signoff(),
        ],
        **_shared(cfg, unsubscribe_url),
    )


# --- Email 3: free plan change ----------------------------------------------

def _usage_sentence(row: dict) -> str:
    replies = row["last_month_replies"]
    if not replies:
        return f"Last month {_org(row)} didn't use any."
    noun = "AI reply" if replies == 1 else "AI replies"
    return f"Last month {_org(row)} used {replies:,} {noun}."


def _free_change_next_step(row: dict, cfg: Settings) -> Tuple[str, str]:
    """The closing advice and its variant. Channel AI needs Growth, not Starter."""
    if row["has_channels"]:
        return (
            f"Your connected channels stay connected and messages keep reaching your inbox, but on Free "
            f"the AI won't answer them. To keep it answering there, Growth is {cfg.usd(GROWTH)} a month "
            f"for {cfg.replies(GROWTH)} replies.",
            "channels",
        )
    if row["last_month_replies"] > cfg.upsell_above_replies:
        return (
            f"To keep your AI answering, Starter is {cfg.usd(STARTER)} a month "
            f"for {cfg.replies(STARTER)} replies.",
            "upsell",
        )
    return "That fits inside the new limit, so you don't need to do anything.", "fits"


def free_change(row: dict, cfg: Settings, unsubscribe_url: str) -> Rendered:
    change_date = date_label(cfg.legacy_free_end)
    next_step, variant = _free_change_next_step(row, cfg)
    return document(
        subject=f"Your free plan changes on {short_date_label(cfg.legacy_free_end)}",
        preheader=f"From {change_date} the free plan includes {cfg.replies(FREE)} AI replies a month.",
        variant=variant,
        blocks=[
            headline("PLAN UPDATE", f"Your free plan changes on {short_date_label(cfg.legacy_free_end)}."),
            paragraphs([
                _hello(row),
                f"From {change_date} the free plan includes {cfg.replies(FREE)} AI replies a month, "
                f"down from {cfg.replies(FREE_LEGACY)}. {_usage_sentence(row)}",
                next_step,
                f"If you reach {cfg.replies(FREE)}, your AI pauses until the next month. "
                f"Your inbox keeps working and no message is lost.",
            ]),
            call_to_action(cfg.plans_url, "See plans"),
            signoff(),
        ],
        **_shared(cfg, unsubscribe_url),
    )


# --- Registry ---------------------------------------------------------------

class Spec(NamedTuple):
    build: Callable[[dict, Settings, str], Rendered]
    required: Tuple[str, ...]
    min_trial_days: Callable[[Settings], Optional[int]]
    earliest: Callable[[Settings], Optional[date]]


# A win-back says "30 days", so allow two days between setting the trial and sending.
WINBACK_SLACK_DAYS = 2

CAMPAIGNS: Dict[str, Spec] = {
    "launch": Spec(launch, ("trial_end", "legacy_free"), lambda cfg: 1, lambda cfg: None),
    "winback": Spec(winback, ("trial_end", "old_plan", "old_price", "knowledge_sources"),
                    lambda cfg: cfg.winback_trial_days - WINBACK_SLACK_DAYS, lambda cfg: None),
    "free_change": Spec(free_change, ("last_month_replies", "has_channels"),
                        lambda cfg: None, lambda cfg: cfg.free_change_send_on),
}
