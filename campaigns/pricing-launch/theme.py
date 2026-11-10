"""The light look for this campaign: the website's paper, ink and lime.

Standard library only, so it runs on the host with plain python3.

Email clients rarely load web fonts, so every family falls back to one that
ships with phones and desktops. Colours carry `color-scheme: light` so Apple
Mail keeps them; Gmail may still darken the page, and the ink borders keep
the cards readable when it does.
"""
from html import escape
from typing import List, Tuple

PAPER = "#F5F6F0"       # page
WHITE = "#FFFFFF"       # card
INK = "#12150E"         # text, borders, dark panel
BODY = "#2E3328"        # paragraphs
MUTE = "#4A5142"        # secondary text
FAINT = "#6B7262"       # fine print
STONE = "#E2E5D9"       # hairlines
LIME = "#C9F24E"        # button, highlight panel
LIME_SOFT = "#EEF8C9"   # checklist panel
MOSS = "#3F5600"        # links on white (lime is too pale to read there)

FONT_DISPLAY = "'Bricolage Grotesque','Arial Narrow','Helvetica Neue',Arial,sans-serif"
FONT_SANS = "'Instrument Sans',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
FONT_MONO = "'JetBrains Mono','SFMono-Regular',Menlo,Consolas,monospace"
FONT_LINK = ("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,700..800"
             "&family=Instrument+Sans:wght@400;600&family=JetBrains+Mono:wght@500&display=swap")

BODY_WIDTH = 600
SUPPORT_EMAIL = "support@chattermate.chat"
DOCS_URL = "https://docs.chattermate.chat"
GITHUB_URL = "https://github.com/chattermate/chattermate.chat"
LOGO_SIZE = 30

HEAD_STYLE = """
    *{ box-sizing:border-box; }
    html,body{ margin:0 !important; padding:0 !important; background:#F5F6F0; }
    a{ text-decoration:none; }
    img{ border:0; display:block; outline:none; }
    table{ border-collapse:collapse; }
    :root{ color-scheme:light; supported-color-schemes:light; }
"""


def table_open(extra: str = "", width: str = "100%") -> str:
    return (f'<table role="presentation" width="{width}" cellpadding="0" '
            f'cellspacing="0" border="0"{extra}>')


def button(href: str, label: str) -> str:
    """Lime pill with an ink outline, like the website's primary button."""
    return (f'<a href="{href}" target="_blank" style="display:inline-block; padding:14px 26px; background:{LIME}; '
            f'color:{INK}; border:2px solid {INK}; border-radius:999px; font-size:16px; font-weight:700; '
            f'font-family:{FONT_SANS};">{label} &rarr;</a>')


def header(logo_url: str, home_url: str) -> str:
    logo = (f'<img src="{escape(logo_url)}" width="{LOGO_SIZE}" height="{LOGO_SIZE}" alt="" '
            f'style="width:{LOGO_SIZE}px; height:{LOGO_SIZE}px; border-radius:8px;">')
    return f"""{table_open()}<tr>
      <td style="padding:20px 32px; border-bottom:2px solid {INK};">
        <a href="{escape(home_url)}" target="_blank">{table_open(width="auto")}<tr>
          <td valign="middle" width="{LOGO_SIZE}">{logo}</td>
          <td valign="middle" style="padding-left:10px; font-family:{FONT_DISPLAY}; font-weight:800; font-size:19px;
              letter-spacing:-.02em; color:{INK};">ChatterMate</td>
        </tr></table></a>
      </td></tr></table>"""


def footer(links: List[Tuple[str, str]], notes: List[str]) -> str:
    link_cells = "".join(
        f'<td style="padding-right:18px; font-size:13px; font-family:{FONT_SANS};">'
        f'<a href="{href}" target="_blank" style="color:{MUTE}; text-decoration:underline;">{label}</a></td>'
        for label, href in links
    )
    note_lines = "".join(
        f'<p style="font-size:12px; line-height:1.6; color:{FAINT}; margin:0 0 6px; font-family:{FONT_SANS};">{note}</p>'
        for note in notes
    )
    return f"""{table_open()}<tr>
      <td style="padding:24px 32px 30px; border-top:2px solid {INK}; background:{PAPER};">
        {table_open(width="auto")}<tr>{link_cells}</tr></table>
        <div style="height:14px; line-height:14px; font-size:0;">&nbsp;</div>
        {note_lines}
      </td></tr></table>"""


def shell(*, title: str, preheader: str, header_html: str, content: str, footer_html: str) -> str:
    """Page, a 600px white card with an ink outline, header, body and footer.
    The card shrinks on a phone: CSS width wins there, Outlook keeps the attribute."""
    card = (f' style="width:100%; max-width:{BODY_WIDTH}px; background:{WHITE}; border:2px solid {INK}; '
            f'border-radius:20px; overflow:hidden; border-collapse:separate; border-spacing:0;"')
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>{title}</title>
<link href="{FONT_LINK}" rel="stylesheet">
<style>{HEAD_STYLE}</style>
</head>
<body style="margin:0; padding:0; background:{PAPER};">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; color:{PAPER}; font-size:1px; line-height:1px;">{preheader}</div>
{table_open(extra=f' style="background:{PAPER};"')}
  <tr>
    <td align="center" style="padding:28px 12px; font-family:{FONT_SANS}; -webkit-font-smoothing:antialiased;">
      {table_open(width=str(BODY_WIDTH), extra=card)}
        <tr><td>{header_html}</td></tr>
        <tr><td>{content}</td></tr>
        <tr><td>{footer_html}</td></tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>"""
