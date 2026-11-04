"""Email blocks for this campaign, built on the welcome email's primitives.

The primitives in enterprise's email_templates/base.py use only the standard
library, so they are loaded straight from that file. Importing them through
`app.*` would pull in the ML stack, which once took prod down mid-campaign.

Each block carries its HTML and its plain-text twin, so the two versions of an
email can't drift. Callers escape recipient data with `esc` before it reaches a
block: a block takes trusted markup.
"""
import importlib.util
import os
import re
from html import escape, unescape
from pathlib import Path
from typing import List, NamedTuple, Optional, Sequence

BASE_PATH = Path("backend/app/enterprise/services/email_templates/base.py")
PAD_X = 32
GITHUB_LABEL = "GitHub"
OPEN_SOURCE_NOTE = "Prefer to run it yourself? ChatterMate is open source. Self-host it for free."
ACCOUNT_NOTE = "You're getting this because you have a ChatterMate account."


def find_base() -> Path:
    """EMAIL_BASE_PY, else the nearest checkout that has the enterprise submodule."""
    explicit = os.environ.get("EMAIL_BASE_PY")
    if explicit:
        return Path(explicit)
    for parent in Path(__file__).resolve().parents:
        if (parent / BASE_PATH).is_file():
            return parent / BASE_PATH
    raise SystemExit(f"Can't find {BASE_PATH}. Set EMAIL_BASE_PY to its path.")


def _load_base():
    spec = importlib.util.spec_from_file_location("email_base", find_base())
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


b = _load_base()

# Rounded corners on a table need separate borders; base.HEAD_STYLE collapses them.
_ROUNDED = ' style="border-collapse:separate; border-spacing:0;"'
# base.shell fixes the card at width="600", which overflows a phone. CSS width wins
# there; Outlook ignores max-width and keeps the attribute.
_CARD_STYLE = f'style="max-width:{b.BODY_WIDTH}px;'
_FLUID_CARD_STYLE = f'style="width:100%; max-width:{b.BODY_WIDTH}px;'


class Block(NamedTuple):
    html: str
    text: str


class Rendered(NamedTuple):
    subject: str
    preheader: str
    html: str
    text: str
    variant: str


def esc(value) -> str:
    return escape(str(value), quote=True)


def plain(markup: str) -> str:
    """Markup to text, keeping each link's address."""
    text = re.sub(r'<a [^>]*href="([^"]*)"[^>]*>(.*?)</a>', r"\2 (\1)", markup, flags=re.S)
    text = re.sub(r"<br\s*/?>", "\n", text)
    return unescape(re.sub(r"<[^>]+>", "", text)).strip()


def _cell(padding: str, inner: str) -> str:
    return f'{b.table_open()}<tr><td style="padding:{padding};">{inner}</td></tr></table>'


def _panel(style: str, rows: str) -> str:
    extra = f' style="{style} border-collapse:separate; border-spacing:0;"'
    return b.table_open(extra=extra) + rows + "</table>"


def strong(text: str) -> str:
    return f'<strong style="color:{b.TEXT_PRIMARY};">{text}</strong>'


def link(href: str, label: str) -> str:
    return f'<a href="{esc(href)}" target="_blank" style="color:{b.ACCENT};">{label}</a>'


def _eyebrow(label: str) -> str:
    """base.eyebrow, on a table that keeps its rounded corners."""
    pill = (
        f'<tr><td style="padding:6px 12px; border:1px solid {b.BLEND_CHIP_BORDER}; border-radius:999px; '
        f'background:{b.BLEND_CHIP_BG};">{b.dotted_label(label, b.ACCENT, b.ACCENT_SOFT)}</td></tr>'
    )
    return b.table_open(width="auto", extra=_ROUNDED) + pill + "</table>"


def headline(eyebrow: str, title: str) -> Block:
    h1 = (
        f'<h1 style="font-family:{b.FONT_DISPLAY}; font-weight:700; font-size:30px; line-height:1.12; '
        f'letter-spacing:-.03em; margin:18px 0 0; color:{b.TEXT_PRIMARY};">{title}</h1>'
    )
    return Block(_cell(f"30px {PAD_X}px 0", _eyebrow(eyebrow) + h1), plain(title))


def paragraphs(items: Sequence[str], top: int = 16) -> Block:
    body = "".join(
        f'<p style="font-size:16px; line-height:1.6; color:{b.TEXT_BODY}; margin:0 0 12px; '
        f'font-family:{b.FONT_SANS};">{item}</p>'
        for item in items
    )
    return Block(_cell(f"{top}px {PAD_X}px 0", body), "\n\n".join(plain(item) for item in items))


def checklist(items: Sequence[str]) -> Block:
    rows = ""
    for index, item in enumerate(items):
        rule = f"border-top:1px solid {b.BLEND_PANEL_BORDER};" if index else ""
        rows += (
            f'<tr><td width="20" valign="top" style="width:20px; padding:15px 0 15px 20px; {rule} '
            f'color:{b.ACCENT}; font-weight:700; font-size:15px; font-family:{b.FONT_SANS};">&#10003;</td>'
            f'<td valign="top" style="padding:15px 20px 15px 14px; {rule} font-size:15px; line-height:1.5; '
            f'color:{b.TEXT_BODY}; font-family:{b.FONT_SANS};">{item}</td></tr>'
        )
    panel = _panel(f"background:{b.PANEL_BG}; border:1px solid {b.BLEND_PANEL_BORDER}; border-radius:16px;", rows)
    return Block(_cell(f"8px {PAD_X}px 0", panel), "\n".join(f"- {plain(item)}" for item in items))


def highlight(label: str, title: str, body: str, href: str, cta: str) -> Block:
    inner = (
        f'<div style="font-family:{b.FONT_MONO}; font-size:11px; letter-spacing:.14em; color:{b.ACCENT};">{label}</div>'
        f'<div style="font-family:{b.FONT_DISPLAY}; font-size:22px; font-weight:700; line-height:1.2; '
        f'color:{b.TEXT_PRIMARY}; padding-top:8px;">{title}</div>'
        f'<p style="margin:8px 0 16px; font-size:15px; line-height:1.6; color:{b.TEXT_BODY}; '
        f'font-family:{b.FONT_SANS};">{body}</p>'
        f'{b.button(esc(href), cta, font_size=15, padding="13px 20px")}'
    )
    panel = _panel(
        f"background:{b.BLEND_MERGE_BG}; border:1px solid {b.BLEND_CODE_BORDER}; border-radius:16px;",
        f'<tr><td style="padding:22px;">{inner}</td></tr>',
    )
    return Block(_cell(f"20px {PAD_X}px 0", panel), f"{plain(title)}\n{plain(body)}\n{plain(cta)}: {href}")


def call_to_action(href: str, label: str) -> Block:
    return Block(_cell(f"10px {PAD_X}px 0", b.button(esc(href), label)), f"{plain(label)}: {href}")


def signoff() -> Block:
    inner = (
        f'<p style="margin:0; font-size:15px; line-height:1.6; color:{b.TEXT_BODY}; font-family:{b.FONT_SANS};">'
        f'Runix<br><span style="color:{b.TEXT_DIM};">ChatterMate</span></p>'
    )
    return Block(_cell(f"22px {PAD_X}px 30px", inner), "Runix\nChatterMate")


def _footer(dashboard_url: str, unsubscribe_url: str) -> str:
    unsubscribe = (
        f'<a href="{esc(unsubscribe_url)}" target="_blank" '
        f'style="color:{b.TEXT_BODY}; text-decoration:underline;">Unsubscribe</a>'
    )
    return b.footer(
        links=[("Docs", b.DOCS_URL), ("Dashboard", dashboard_url), (GITHUB_LABEL, b.GITHUB_URL),
               ("Support", f"mailto:{b.SUPPORT_EMAIL}")],
        notes=[f"{ACCOUNT_NOTE} {OPEN_SOURCE_NOTE}", unsubscribe],
    )


def document(*, subject: str, preheader: str, variant: str, blocks: List[Optional[Block]],
             dashboard_url: str, unsubscribe_url: str) -> Rendered:
    """`subject` and `preheader` are plain text; `blocks` may hold None for parts left out."""
    present = [block for block in blocks if block]
    shell = b.shell(
        preheader=esc(preheader),
        header_label="",
        content="".join(block.html for block in present),
        footer_html=_footer(dashboard_url, unsubscribe_url),
        title=esc(subject),
    )
    html = shell.replace(_CARD_STYLE, _FLUID_CARD_STYLE, 1)
    text = "\n\n".join(block.text for block in present)
    text += f"\n\n--\n{ACCOUNT_NOTE} {OPEN_SOURCE_NOTE}\nUnsubscribe: {unsubscribe_url}\n"
    return Rendered(subject, preheader, html, text, variant)
