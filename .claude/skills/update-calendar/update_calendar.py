#!/usr/bin/env python3
"""Deterministic rewrite of calendar.js + index.html for the sfczcalendar site.

The LLM (see SKILL.md) does the judgment: parse Ellen's email into a set of
months to remove from the visible grid and a set to add (with their Google
Drive links). This script does the mechanical, error-prone part: rewrite the
`calendarData` block in calendar.js and regenerate the month-card grid in
index.html, preserving exact formatting so diffs stay minimal.

Usage:
    update_calendar.py --repo <dir> \
        [--delete "May 2026,June 2026"] \
        [--add "November 2026=<url>,December 2026=<url>"] \
        [--dry-run]

Notes:
- --delete only removes the card from the visible grid; the archived URL in
  calendarData is left untouched (matches how the site has always worked).
- In --add, "=<url>" is optional. Omit it (just "November 2026") to add the
  card with a null link; clicking it shows the site's "not yet available"
  message until the real Drive link is filled in.
"""

import argparse
import re
import sys
from pathlib import Path

MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]
MONTH_INDEX = {m: i for i, m in enumerate(MONTHS)}


def parse_month_year(token):
    """'November 2026' -> ('November', '2026'). Case-insensitive month."""
    parts = token.strip().split()
    if len(parts) != 2:
        raise ValueError(f"expected 'Month YYYY', got {token!r}")
    month, year = parts[0].capitalize(), parts[1]
    if month not in MONTH_INDEX:
        raise ValueError(f"unknown month {month!r} in {token!r}")
    if not re.fullmatch(r"\d{4}", year):
        raise ValueError(f"expected 4-digit year in {token!r}")
    return month, year


def load_calendar_data(js_text):
    """Parse the calendarData literal into {year: {month: url_or_None}}.

    Ordered dicts (py3.7+) so we can round-trip years/months in file order.
    """
    m = re.search(r"const calendarData = \{(.*?)\n\};", js_text, re.S)
    if not m:
        raise SystemExit("could not find calendarData block in calendar.js")
    body = m.group(1)
    data = {}
    year = None
    for line in body.splitlines():
        ym = re.match(r'\s*"(\d{4})":\s*\{', line)
        if ym:
            year = ym.group(1)
            data[year] = {}
            continue
        em = re.match(r'\s*"([A-Za-z]+)":\s*(null|"([^"]*)")', line)
        if em and year is not None:
            month = em.group(1)
            url = None if em.group(2) == "null" else em.group(3)
            data[year][month] = url
    return data


def render_calendar_data(data):
    """Render {year: {month: url}} back into the calendarData literal block."""
    lines = ["const calendarData = {"]
    years = list(data.keys())
    for yi, year in enumerate(years):
        lines.append(f'    "{year}": {{')
        months = [m for m in MONTHS if m in data[year]]
        for mi, month in enumerate(months):
            url = data[year][month]
            val = "null" if url is None else f'"{url}"'
            comma = "" if mi == len(months) - 1 else ","
            lines.append(f'        "{month}": {val}{comma}')
        close = "}" if yi == len(years) - 1 else "},"
        lines.append(f"    {close}")
    lines.append("};")
    return "\n".join(lines)


CARD_TEMPLATE = """                <a href="#" class="calendar-link group">
                    <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 text-center border-2 border-transparent hover:border-purple-500 hover:scale-105">
                        <h3 class="font-bold text-purple-600 group-hover:text-green-600 text-lg">{label}</h3>
                        <p class="text-sm text-gray-500 mt-1">View PDF</p>
                    </div>
                </a>"""

GRID_RE = re.compile(
    r'(<div class="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">\n)'
    r'(.*?)'
    r'(\n            </div>)',
    re.S,
)


def load_visible(html_text):
    """Ordered list of (month, year) currently shown as grid cards."""
    m = GRID_RE.search(html_text)
    if not m:
        raise SystemExit("could not find month grid in index.html")
    visible = []
    for label in re.findall(r'text-lg">([A-Za-z]+ \d{4})</h3>', m.group(2)):
        month, year = parse_month_year(label)
        visible.append((month, year))
    return visible


def render_grid(html_text, visible):
    cards = "\n\n".join(
        CARD_TEMPLATE.format(label=f"{month} {year}") for month, year in visible
    )
    return GRID_RE.sub(lambda m: m.group(1) + cards + m.group(3), html_text)


def sort_key(item):
    month, year = item
    return (int(year), MONTH_INDEX[month])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", required=True, type=Path)
    ap.add_argument("--delete", default="", help="comma-separated 'Month YYYY'")
    ap.add_argument("--add", default="", help="comma-separated 'Month YYYY[=url]'")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    js_path = args.repo / "calendar.js"
    html_path = args.repo / "index.html"
    js_text = js_path.read_text()
    html_text = html_path.read_text()

    data = load_calendar_data(js_text)
    visible = load_visible(html_text)

    deletes = [parse_month_year(t) for t in args.delete.split(",") if t.strip()]

    adds = []
    for tok in args.add.split(","):
        tok = tok.strip()
        if not tok:
            continue
        my, _, url = tok.partition("=")
        adds.append((*parse_month_year(my), url.strip() or None))

    # Apply deletes: remove from the visible grid only.
    for month, year in deletes:
        if (month, year) not in visible:
            print(f"WARN: {month} {year} not currently visible; skipping delete",
                  file=sys.stderr)
        visible = [v for v in visible if v != (month, year)]

    # Apply adds: set the URL in the data store and show a card for it.
    for month, year, url in adds:
        data.setdefault(year, {})[month] = url
        if (month, year) not in visible:
            visible.append((month, year))

    visible.sort(key=sort_key)

    new_js = re.sub(
        r"const calendarData = \{.*?\n\};",
        lambda _: render_calendar_data(data),
        js_text,
        count=1,
        flags=re.S,
    )
    new_html = render_grid(html_text, visible)

    print("Visible grid ->", ", ".join(f"{m} {y}" for m, y in visible))
    for month, year, url in adds:
        state = "linked" if url else "NULL (needs Drive link)"
        print(f"  added   {month} {year}: {state}")
    for month, year in deletes:
        print(f"  removed {month} {year} from grid")

    if args.dry_run:
        print("\n[dry-run] no files written")
        return

    js_path.write_text(new_js)
    html_path.write_text(new_html)
    print("\nWrote calendar.js and index.html")


if __name__ == "__main__":
    main()
