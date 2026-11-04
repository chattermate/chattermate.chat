"""Prices and limits for the copy. Nothing in an email hard-codes a plan figure:
each one comes from the catalog file, which export/catalog.sql writes from the
plans table once the new plans are live."""
import json
from datetime import date
from pathlib import Path
from typing import List, NamedTuple, Optional

HERE = Path(__file__).resolve().parent
SAMPLE_CATALOG = HERE / "samples" / "catalog.sample.json"
REQUIRED_PLANS = ("Free", "Free (legacy)", "Starter", "Growth", "Pro")


class Offer(NamedTuple):
    code: str
    percent: int


class Settings(NamedTuple):
    """The campaign's own facts: catalog figures plus campaign.json."""
    plans: dict
    is_sample: bool
    legacy_free_end: date
    free_change_send_on: date
    upsell_above_replies: int
    winback_trial_days: int
    offer: Optional[Offer]
    plans_url: str
    channels_url: str
    dashboard_url: str
    backend_url: str

    def usd(self, plan: str) -> str:
        return usd(self.plans[plan]["usd"])

    def inr(self, plan: str) -> str:
        return f"₹{self.plans[plan]['inr']:,.0f}"

    def replies(self, plan: str) -> str:
        return f"{self.plans[plan]['max_messages']:,}"

    def trial_days(self) -> int:
        return self.plans["Growth"]["trial_days"]

    def entry_plan_includes(self) -> List[str]:
        """What the cheapest plan really includes, read from its feature flags."""
        features = self.plans["Starter"]["features"]
        items = ["live chat"]
        if features.get("help_center"):
            items.append("help center")
        if features.get("ai_ticketing"):
            items.append("tickets")
        if len(items) == 1:
            items.append("your AI agent")
        return items


def usd(amount: float) -> str:
    return f"${amount:,.2f}"


def date_label(value: date) -> str:
    return f"{value.day} {value:%b %Y}"


def short_date_label(value: date) -> str:
    return f"{value.day} {value:%b}"


def load_settings(catalog_path: Optional[Path] = None, with_offer: bool = True) -> Settings:
    catalog = json.loads(Path(catalog_path or SAMPLE_CATALOG).read_text(encoding="utf-8"))
    plans = catalog["plans"]
    missing = [name for name in REQUIRED_PLANS if name not in plans]
    if missing:
        raise SystemExit(f"Catalog is missing plans: {', '.join(missing)}")
    config = json.loads((HERE / "campaign.json").read_text(encoding="utf-8"))
    return Settings(
        plans=plans,
        is_sample=bool(catalog.get("sample")),
        legacy_free_end=date.fromisoformat(config["legacy_free_end"]),
        free_change_send_on=date.fromisoformat(config["free_change_send_on"]),
        upsell_above_replies=config["upsell_above_replies"],
        winback_trial_days=config["winback_trial_days"],
        offer=Offer(**config["offer"]) if with_offer and config.get("offer") else None,
        plans_url=config["plans_url"],
        channels_url=config["channels_url"],
        dashboard_url=config["dashboard_url"],
        backend_url=config["backend_url"],
    )
