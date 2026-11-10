"""Email blocks for this campaign, in the light theme (theme.py).

Contact constants come from enterprise's email_templates/base.py. It uses only
the standard library, so it is loaded straight from that file: importing it
through `app.*` would pull in the ML stack, which once took prod down mid-campaign.

Each block carries its HTML and its plain-text twin, so the two versions of an
email can't drift. Callers escape recipient data with `esc` before it reaches a
block: a block takes trusted markup.
"""
import importlib.util
import os
import re
import sys
import types
from html import escape, unescape
from pathlib import Path
from typing import List, NamedTuple, Optional, Sequence

import theme as t

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


def _module_from(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _provide_brand(base_path: Path) -> None:
    """base.py imports app.core.brand, a dict of logo colours. Importing it the
    normal way runs app/__init__.py, which starts the whole app and its ML
    stack. So brand.py is loaded on its own and registered under its name, with
    empty stand-ins for the packages above it."""
    if "app.core.brand" in sys.modules:
        return
    for package in ("app", "app.core"):
        sys.modules.setdefault(package, types.ModuleType(package))
    brand = _module_from("app.core.brand", base_path.parents[3] / "core" / "brand.py")
    sys.modules["app.core.brand"] = brand
    sys.modules["app.core"].brand = brand


def _load_base():
    path = find_base()
    if (path.parents[3] / "core" / "brand.py").is_file():
        _provide_brand(path)
    spec = importlib.util.spec_from_file_location("email_base", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


b = _load_base()

# Rounded corners on a table need separate borders.
_ROUNDED = ' style="border-collapse:separate; border-spacing:0;"'


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
    return f'{t.table_open()}<tr><td style="padding:{padding};">{inner}</td></tr></table>'


def _panel(style: str, rows: str) -> str:
    return t.table_open(extra=f' style="{style} border-collapse:separate; border-spacing:0;"') + rows + "</table>"


def strong(text: str) -> str:
    return f'<strong style="color:{t.INK};">{text}</strong>'


def code(text: str) -> str:
    """A promo code, set like a sticker so it stands out in a sentence."""
    return (f'<strong style="color:{t.INK}; background:{t.LIME}; padding:2px 7px; border-radius:6px; '
            f'font-family:{t.FONT_MONO}; font-size:.95em;">{text}</strong>')


def link(href: str, label: str) -> str:
    return (f'<a href="{esc(href)}" target="_blank" style="color:{t.MOSS}; text-decoration:underline; '
            f'font-weight:600;">{label}</a>')


def _eyebrow(label: str) -> str:
    pill = (f'<tr><td style="padding:6px 12px; background:{t.INK}; border-radius:999px; font-family:{t.FONT_MONO}; '
            f'font-size:11.5px; letter-spacing:.1em; color:{t.LIME}; white-space:nowrap;">{label}</td></tr>')
    return t.table_open(width="auto", extra=_ROUNDED) + pill + "</table>"


def headline(eyebrow: str, title: str) -> Block:
    h1 = (f'<h1 style="font-family:{t.FONT_DISPLAY}; font-weight:800; font-size:34px; line-height:1.05; '
          f'letter-spacing:-.02em; margin:16px 0 0; color:{t.INK};">{title}</h1>')
    return Block(_cell(f"28px {PAD_X}px 0", _eyebrow(eyebrow) + h1), plain(title))


def hero(src: str, alt: str, href: str) -> Block:
    """One linked image, full card width less the padding. Alt text carries
    the message when images are off; the text version leaves the image out."""
    width = t.BODY_WIDTH - 2 * PAD_X
    img = (f'<a href="{esc(href)}" target="_blank"><img src="{esc(src)}" width="{width}" alt="{esc(alt)}" '
           f'style="width:100%; max-width:{width}px; height:auto; border:2px solid {t.INK}; border-radius:16px; '
           f'font-family:{t.FONT_SANS}; font-size:14px; color:{t.INK};"></a>')
    return Block(_cell(f"22px {PAD_X}px 0", img), "")


def paragraphs(items: Sequence[str], top: int = 16) -> Block:
    body = "".join(
        f'<p style="font-size:16px; line-height:1.6; color:{t.BODY}; margin:0 0 12px; '
        f'font-family:{t.FONT_SANS};">{item}</p>'
        for item in items
    )
    return Block(_cell(f"{top}px {PAD_X}px 0", body), "\n\n".join(plain(item) for item in items))


def checklist(items: Sequence[str]) -> Block:
    rows = ""
    for index, item in enumerate(items):
        rule = f"border-top:1px solid {t.STONE};" if index else ""
        rows += (
            f'<tr><td width="22" valign="top" style="width:22px; padding:14px 0 14px 18px; {rule} '
            f'color:{t.INK}; font-weight:700; font-size:15px; font-family:{t.FONT_SANS};">&#10003;</td>'
            f'<td valign="top" style="padding:14px 18px 14px 12px; {rule} font-size:15px; line-height:1.5; '
            f'color:{t.BODY}; font-family:{t.FONT_SANS};">{item}</td></tr>'
        )
    panel = _panel(f"background:{t.WHITE}; border:2px solid {t.INK}; border-radius:16px;", rows)
    return Block(_cell(f"8px {PAD_X}px 0", panel), "\n".join(f"- {plain(item)}" for item in items))


def highlight(label: str, title: str, body: str, href: str, cta: str) -> Block:
    inner = (
        f'<div style="font-family:{t.FONT_MONO}; font-size:11.5px; letter-spacing:.12em; color:{t.INK};">{label}</div>'
        f'<div style="font-family:{t.FONT_DISPLAY}; font-size:24px; font-weight:800; line-height:1.15; '
        f'color:{t.INK}; padding-top:8px;">{title}</div>'
        f'<p style="margin:8px 0 18px; font-size:15px; line-height:1.6; color:{t.INK}; '
        f'font-family:{t.FONT_SANS};">{body}</p>'
        f'{t.button(esc(href), cta)}'
    )
    panel = _panel(f"background:{t.LIME_SOFT}; border:2px solid {t.INK}; border-radius:16px;",
                   f'<tr><td style="padding:22px;">{inner}</td></tr>')
    return Block(_cell(f"20px {PAD_X}px 0", panel), f"{plain(title)}\n{plain(body)}\n{plain(cta)}: {href}")


def call_to_action(href: str, label: str) -> Block:
    return Block(_cell(f"16px {PAD_X}px 0", t.button(esc(href), label)), f"{plain(label)}: {href}")


def signoff() -> Block:
    inner = (f'<p style="margin:0; font-size:15px; line-height:1.6; color:{t.BODY}; font-family:{t.FONT_SANS};">'
             f'Runix<br><span style="color:{t.FAINT};">ChatterMate</span></p>')
    return Block(_cell(f"22px {PAD_X}px 28px", inner), "Runix\nChatterMate")


def _footer(dashboard_url: str, unsubscribe_url: str) -> str:
    unsubscribe = (f'<a href="{esc(unsubscribe_url)}" target="_blank" '
                   f'style="color:{t.MUTE}; text-decoration:underline;">Unsubscribe</a>')
    return t.footer(
        links=[("Docs", b.DOCS_URL), ("Dashboard", dashboard_url), (GITHUB_LABEL, b.GITHUB_URL),
               ("Support", f"mailto:{b.SUPPORT_EMAIL}")],
        notes=[f"{ACCOUNT_NOTE} {OPEN_SOURCE_NOTE}", unsubscribe],
    )


def document(*, subject: str, preheader: str, variant: str, blocks: List[Optional[Block]],
             dashboard_url: str, unsubscribe_url: str, logo_url: str, home_url: str) -> Rendered:
    """`subject` and `preheader` are plain text; `blocks` may hold None for parts left out."""
    present = [block for block in blocks if block]
    html = t.shell(
        title=esc(subject),
        preheader=esc(preheader),
        header_html=t.header(logo_url, home_url),
        content="".join(block.html for block in present),
        footer_html=_footer(dashboard_url, unsubscribe_url),
    )
    text = "\n\n".join(block.text for block in present if block.text)
    text += f"\n\n--\n{ACCOUNT_NOTE} {OPEN_SOURCE_NOTE}\nUnsubscribe: {unsubscribe_url}\n"
    return Rendered(subject, preheader, html, text, variant)
