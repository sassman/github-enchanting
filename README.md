# Github Enchanting

<p align="center">
  <img src="chrome-extension/icons/icon128.png" alt="Github Enchanting icon" width="128" height="128"/>
</p>

A Chrome extension that adds Dependabot command shortcuts directly into the GitHub UI — on individual PRs and in bulk from the PR list.

## Features

### Dependabot Command Dropdown on PR Pages

When viewing a Dependabot pull request, a **Dependabot** dropdown button appears next to the reaction/emoji button in the first comment. Click it to instantly post any Dependabot command as a comment:

- Rebase, Recreate, Merge, Squash and merge
- Cancel merge, Reopen, Close
- Ignore this dependency / major / minor / patch version

No copy-pasting command strings — just pick from the menu and it's posted.

### Batch Commands on the PR List Page

Select multiple PRs using GitHub's built-in checkboxes on the pull request list page. A **Dependabot** dropdown appears next to the "X selected" label in the table header. Pick a command and it opens each selected PR in a new tab, automatically posting the chosen command on every Dependabot PR.

Non-Dependabot PRs are silently skipped.

## Installation (Local / Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/sassman/github-enchanting.git
   ```
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the `chrome-extension/` directory from this repository
6. Navigate to any Dependabot PR on GitHub — the dropdown should appear

## Project Structure

```
chrome-extension/
  manifest.json   — Extension manifest (Manifest V3)
  shared.js       — Shared command constants
  content.js      — PR page: dropdown injection + ?gh-enchant auto-comment
  list.js         — PR list page: batch command dropdown
  style.css       — All styles (PR page + list page)
  icons/          — Extension icons (SVG source + PNG at 16/48/128)
```

## License

MIT
