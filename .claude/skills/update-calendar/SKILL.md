---
name: update-calendar
description: Update the sfczcalendar.com Cajun/Zydeco dance calendar site from one of Ellen's emails - add and/or remove months. Use whenever Ellen (or the user) sends a request like "delete May, June, July and add November and December", "please take down the old months", "I uploaded the new calendar", or any add/remove-months change to this repo's index.html + calendar.js. Handles parsing the email, resolving the year, wiring the Google Drive links, and rewriting both files.
---

# Update the sfczcalendar dance calendar from Ellen's email

Ellen maintains sfczcalendar.com and emails PK roughly monthly to add newly
uploaded calendars and remove stale ones. This skill turns one of those emails
into the two file edits, ready for PK to review and commit.

## How the site works (the mental model)

Two files, two distinct jobs:

- **`calendar.js`** holds `calendarData` = `{ year -> { month -> GoogleDriveURL | null } }`.
  This is the persistent link store for every month, shown or not. A month is
  "available" when its value is a Drive URL; `null` means the click shows a
  "not yet available" message.
- **`index.html`** holds a grid of month cards - the *visible window* on the
  site. Each card's `<h3>` is `"Month YYYY"`; clicking it looks up the URL in
  `calendarData`. This grid is what Ellen means by "the website".

So the two verbs in her emails map cleanly:

- **"delete / take down / remove <months>"** = drop those cards from the grid
  in `index.html`. Leave their archived URL in `calendar.js` alone (that's how
  it has always worked - the link store is an archive).
- **"add <months>" / "I uploaded <months>"** = set that month's Google Drive
  URL in `calendar.js` **and** add a card to the grid.

Ellen uploads the PDFs to her shared Google Drive folder; the one manual step
that has never been automated is grabbing each new month's shareable "view"
link. You need those links to add a month properly.

## Steps

1. **Read the email and extract intent.** Produce two lists:
   - months to remove (e.g. `May 2026, June 2026, July 2026`)
   - months to add (e.g. `November 2026, December 2026`)

   **Resolve the year yourself** - Ellen almost never writes it. Use the email's
   context and today's date. Watch the year boundary: a request in December to
   "add January and February" means *next* year. Check the current `calendarData`
   in `calendar.js` to see which year is in play. If genuinely ambiguous, ask.

2. **Get the Drive links for the months being added.** For each added month you
   need Ellen's Google Drive "view" URL (looks like
   `https://drive.google.com/file/d/<FILE_ID>/view?usp=drive_link`).
   - If PK pasted the links in the request, use them.
   - Otherwise ask PK for them (one per added month). Do **not** invent a URL.
   - If PK wants the cards up now before the links are in hand, you may add a
     month with no URL (the card shows "not yet available" on click) - but say
     so explicitly and flag which months still need a link. Never present a
     null-linked month as done.

3. **Apply the change with the helper** (from the repo root):

   ```bash
   python .claude/skills/update-calendar/update_calendar.py --repo . \
       --delete "May 2026,June 2026,July 2026" \
       --add "November 2026=<nov-url>,December 2026=<dec-url>"
   ```

   - `--delete` / `--add` are each optional; use only what the email asks for.
   - In `--add`, `=<url>` is optional per month; omit it to add a null-linked
     card (per step 2).
   - Add `--dry-run` first to preview the resulting grid and link states without
     writing.

   The script rewrites the `calendarData` block and regenerates the grid in
   chronological order, matching the files' exact formatting so the diff stays
   tight.

4. **Verify.** Run `git diff` and confirm:
   - the removed months are gone from the grid,
   - each added month has a card **and** a real (non-null) URL in `calendarData`
     - unless you deliberately left it null per step 2,
   - no unrelated lines moved.
   Optionally open `index.html` in a browser to eyeball it.

5. **Report, don't push.** Summarize what changed (added/removed, any months
   still needing a link) and show the diff. Committing and pushing are PK's call
   - per his global rules, never push or touch the remote without an explicit
   per-action instruction. A local commit is fine only if PK asks.

## Reply to Ellen (optional)

If PK wants a reply drafted, keep it short and warm - she is unfailingly
grateful. Confirm what went up and came down, and note anything you need from
her (e.g. a missing Drive link).
