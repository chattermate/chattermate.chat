#!/usr/bin/env python3
"""Render every variant of the three emails to previews/, with an index page.

Samples are fictional and go to previews/. If data/winback.json exists, the real
win-back people go to previews/private/, which git ignores.
"""
import json
from html import escape
from pathlib import Path
from typing import List, NamedTuple, Optional

from blocks import Rendered
from catalog import HERE, Settings, load_settings
from emails import CAMPAIGNS

PREVIEW_UNSUBSCRIBE = "https://api.chattermate.chat/api/v1/enterprise/email/unsubscribe?t=preview"
PREVIEWS = HERE / "previews"
PRIVATE = PREVIEWS / "private"
SAMPLES = HERE / "samples"
REAL_WINBACK = HERE / "data" / "winback.json"
PREVIEW_TRIAL_END = "2026-12-06"


class Preview(NamedTuple):
    file: str
    label: str
    rendered: Rendered


def _rows(campaign: str) -> List[dict]:
    return json.loads((SAMPLES / f"{campaign}.sample.json").read_text(encoding="utf-8"))


def _render(campaign: str, row: dict, cfg: Settings) -> Rendered:
    return CAMPAIGNS[campaign].build(row, cfg, PREVIEW_UNSUBSCRIBE)


def _write(folder: Path, name: str, rendered: Rendered) -> None:
    folder.mkdir(exist_ok=True)
    (folder / f"{name}.html").write_text(rendered.html, encoding="utf-8")
    (folder / f"{name}.txt").write_text(f"Subject: {rendered.subject}\n\n{rendered.text}", encoding="utf-8")


def _sample_previews(cfg: Settings, no_offer: Settings) -> List[Preview]:
    legacy, comp = _rows("launch")
    same_price, below_growth = _rows("winback")
    low, high, channels, idle = _rows("free_change")
    return [
        Preview("1-launch", "Launch: existing free org, dollars", _render("launch", legacy, cfg)),
        Preview("1-launch-india", "Launch: existing free org on Indian time, rupees",
                _render("launch", {**legacy, "org_timezone": "Asia/Kolkata"}, cfg)),
        Preview("1-launch-comp-org", "Launch: org not on legacy Free, placeholder names", _render("launch", comp, cfg)),
        Preview("1-launch-no-offer", "Launch: without TRIAL30", _render("launch", legacy, no_offer)),
        Preview("2-winback-same-price", "Win-back: old price matches Growth", _render("winback", same_price, cfg)),
        Preview("2-winback-below-growth", "Win-back: old price below Growth", _render("winback", below_growth, cfg)),
        Preview("3-free-change-fits", "Free change: under the threshold", _render("free_change", low, cfg)),
        Preview("3-free-change-upsell", "Free change: above the threshold", _render("free_change", high, cfg)),
        Preview("3-free-change-channels", "Free change: has connected channels", _render("free_change", channels, cfg)),
        Preview("3-free-change-idle", "Free change: no replies last month", _render("free_change", idle, cfg)),
    ]


def _private_previews(cfg: Settings) -> List[Preview]:
    if not REAL_WINBACK.exists():
        return []
    previews = []
    for row in json.loads(REAL_WINBACK.read_text(encoding="utf-8")):
        slug = row["org_name"].lower().replace(" ", "-")
        filled = {"trial_end": PREVIEW_TRIAL_END, **{k: v for k, v in row.items() if v is not None}}
        previews.append(Preview(f"private/winback-{slug}", f"Win-back: {row['org_name']}", _render("winback", filled, cfg)))
    return previews


def _index(previews: List[Preview], title: str) -> str:
    cards = "".join(
        f'<section><h2>{escape(p.label)}</h2>'
        f'<p><b>Subject:</b> {escape(p.rendered.subject)}<br><b>Preheader:</b> {escape(p.rendered.preheader)}<br>'
        f'<a href="{escape(Path(p.file).name)}.txt">Plain text</a></p>'
        f'<iframe src="{escape(Path(p.file).name)}.html" title="{escape(p.label)}" loading="lazy"></iframe></section>'
        for p in previews
    )
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{escape(title)}</title>
<style>body{{margin:0;padding:24px 16px;background:#0B0C10;color:#E7EAF0;font:15px/1.5 system-ui,sans-serif}}
main{{display:flex;flex-wrap:wrap;gap:24px;justify-content:center}}section{{width:660px;max-width:100%}}
h1{{text-align:center}}h2{{font-size:17px;margin:0 0 6px}}a{{color:#C9F24E}}
iframe{{width:100%;height:1040px;border:1px solid #26282E;border-radius:12px;background:#07080B}}</style></head>
<body><h1>{escape(title)}</h1><main>{cards}</main></body></html>"""


def main(catalog: Optional[Path] = None) -> None:
    cfg = load_settings(catalog)
    previews = _sample_previews(cfg, load_settings(catalog, with_offer=False))
    private = _private_previews(cfg)
    for preview in previews + private:
        folder = PREVIEWS / Path(preview.file).parent
        _write(folder, Path(preview.file).name, preview.rendered)
    (PREVIEWS / "index.html").write_text(_index(previews, "Pricing emails: drafts"), encoding="utf-8")
    if private:
        (PRIVATE / "index.html").write_text(_index(private, "Win-back emails: real people"), encoding="utf-8")
    print(f"{len(previews)} sample previews, {len(private)} private previews in {PREVIEWS}")


if __name__ == "__main__":
    main()
