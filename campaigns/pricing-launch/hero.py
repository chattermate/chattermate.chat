"""The launch email's hero: the four plan cards, drawn like the website's.

Prices and reply counts come from the catalog, one image per currency, so an
org only ever sees its own currency. Chrome renders the HTML at 2x for a sharp
PNG on retina screens; the email shows it at BODY_WIDTH.

    python3 hero.py --catalog data/catalog.json
"""
import argparse
import subprocess
import tempfile
from html import escape
from pathlib import Path

from catalog import load_settings

HERE = Path(__file__).resolve().parent
OUT_DIR = HERE / "previews"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
WIDTH, HEIGHT, SCALE = 600, 380, 2
CURRENCIES = ("USD", "INR")
# (catalog name, label on the card), cheapest first
PLANS = (("Free", "Free"), ("Starter", "Starter"), ("Growth", "Growth"), ("Pro", "Pro"))
HIGHLIGHT = "Growth"  # the trial's plan
FONTS = ("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800"
         "&family=JetBrains+Mono:wght@500&display=swap")

# Website tokens (chattermate.chat :root)
INK, LIME, PAPER, WHITE, MUTE = "#12150E", "#C9F24E", "#F5F6F0", "#FFFFFF", "#4A5142"


def hero_path(currency: str) -> Path:
    return OUT_DIR / f"hero-{currency.lower()}.png"


def _price(plan: dict, currency: str) -> tuple:
    """(big figure, small suffix) for one card."""
    symbol = "₹" if currency == "INR" else "$"
    amount = plan["inr"] if currency == "INR" else plan["usd"]
    if not amount:
        return f"{symbol}0", "forever"
    if currency == "INR":
        return f"₹{amount:,.0f}", "/mo + GST"
    return f"${amount:,.2f}", "/month"


def _card(name: str, label: str, plan: dict, currency: str, trial_days: int) -> str:
    figure, suffix = _price(plan, currency)
    tag = f"<i>{trial_days} days free</i>" if name == HIGHLIGHT else ""
    css = "plan hot" if name == HIGHLIGHT else "plan"
    return (f'<div class="{css}"><span>{escape(label)}{tag}</span>'
            f"<b>{escape(figure)}<small>{escape(suffix)}</small></b>"
            f'<em>{plan["max_messages"]:,} AI replies a month</em></div>')


def html(cfg, currency: str) -> str:
    cards = "".join(_card(name, label, cfg.plans[name], currency, cfg.trial_days()) for name, label in PLANS)
    return f"""<!doctype html><html><head><meta charset="utf-8">
<link href="{FONTS}" rel="stylesheet"><style>
*{{box-sizing:border-box;margin:0}}
body{{width:{WIDTH}px;height:{HEIGHT}px;background:{LIME};padding:20px;color:{INK}}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}
.plan{{background:{WHITE};border-radius:16px;box-shadow:0 0 0 2px {INK};padding:18px 20px;display:flex;flex-direction:column;gap:10px;height:163px}}
.plan.hot{{background:{INK};color:{PAPER}}}
.plan span{{font:500 18px/1 'JetBrains Mono',monospace;display:flex;justify-content:space-between;align-items:center}}
.plan i{{font-style:normal;background:{LIME};color:{INK};border-radius:999px;padding:6px 11px;font-size:14px;letter-spacing:.02em}}
.plan b{{font:800 64px/1 'Bricolage Grotesque',Impact,sans-serif;font-stretch:75%;letter-spacing:-.01em;margin-top:auto}}
.plan small{{font:500 16px/1 'JetBrains Mono',monospace;margin-left:6px;opacity:.75}}
.plan em{{font:500 16px/1.2 'JetBrains Mono',monospace;font-style:normal;color:{MUTE}}}
.plan.hot em{{color:{LIME}}}
</style></head><body>
<div class="grid">{cards}</div></body></html>"""


def render(cfg, currency: str) -> Path:
    out = hero_path(currency)
    with tempfile.TemporaryDirectory() as tmp:
        page = Path(tmp) / "hero.html"
        page.write_text(html(cfg, currency), encoding="utf-8")
        subprocess.run(
            [CHROME, "--headless=new", "--hide-scrollbars", "--disable-gpu", f"--window-size={WIDTH},{HEIGHT}",
             f"--force-device-scale-factor={SCALE}", "--virtual-time-budget=4000",
             f"--screenshot={out}", page.as_uri()],
            check=True, capture_output=True, timeout=60,
        )
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--catalog", type=Path, help="catalog export (defaults to the sample)")
    args = parser.parse_args()
    cfg = load_settings(args.catalog)
    OUT_DIR.mkdir(exist_ok=True)
    for currency in CURRENCIES:
        print(render(cfg, currency))


if __name__ == "__main__":
    main()
