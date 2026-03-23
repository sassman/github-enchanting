# Github Enchanting — Icon & Batch PR Commands

## Overview

Two additions to the Github Enchanting Chrome extension:
1. An extension icon (octocat-ish figure with a wizard wand)
2. A batch dependabot command feature on the PR list page

## 1. Extension Icon

- SVG source icon depicting a stylized octocat-like character holding a wizard wand
- Exported as PNG at 16x16, 48x48, and 128x128
- Added to `manifest.json` under the `"icons"` field

## 2. Batch PR Commands on PR List Page

### Content Script Scope

Add a second content script entry in `manifest.json` matching:
- `https://github.com/*/*/pulls`
- `https://github.com/*/*/pulls?*`

This injects a new script (`list.js`) and shared styles on the PR list page.

### UI: Inline Command Button

- When GitHub shows the "X selected" label in the PR table header (after checking PR checkboxes), the extension injects a "Dependabot" dropdown button directly next to that label.
- The dropdown is identical in appearance and commands to the existing single-PR dropdown.
- The button only appears when at least one checkbox is selected and disappears when selection is cleared.

### Behavior: Opening PRs with `?gh-enchant=<cmd>`

When the user picks a command from the batch dropdown:
1. Gather the URLs of all checked PR rows.
2. For each URL, open a new tab with `?gh-enchant=<cmd-key>` appended (e.g. `?gh-enchant=rebase`).

Command key mapping:
| Key | Command |
|---|---|
| `rebase` | `@dependabot rebase` |
| `recreate` | `@dependabot recreate` |
| `merge` | `@dependabot merge` |
| `squash-and-merge` | `@dependabot squash and merge` |
| `cancel-merge` | `@dependabot cancel merge` |
| `reopen` | `@dependabot reopen` |
| `close` | `@dependabot close` |
| `ignore-dependency` | `@dependabot ignore this dependency` |
| `ignore-major` | `@dependabot ignore this major version` |
| `ignore-minor` | `@dependabot ignore this minor version` |
| `ignore-patch` | `@dependabot ignore this patch version` |

## 3. PR Page: Auto-Comment on `gh-enchant` Param

The existing PR page content script (`content.js`) gains additional logic:
1. On load, check `URLSearchParams` for `gh-enchant`.
2. If present, verify this is a Dependabot PR using the existing `isDependabotPR()` check. If not a Dependabot PR, do nothing (ignore the param silently).
3. Map the key to the full command string.
4. Call `postComment(commandText)` automatically.
5. After successful posting, close the tab via `window.close()`.

No changes to the existing manual dropdown — it continues to work as before.

## File Changes Summary

| File | Change |
|---|---|
| `manifest.json` | Add icons, add list page content script entry |
| `content.js` | Add `gh-enchant` URL param detection and auto-post |
| `list.js` (new) | PR list page: detect selection, inject dropdown, open tabs |
| `style.css` | Shared styles (existing classes reused) + list-page-specific styles |
| `icons/` (new dir) | SVG source + PNG exports at 16/48/128 |
