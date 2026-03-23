// shared.js is loaded before this file (provides DEPENDABOT_COMMANDS)

const LIST_INJECTED_ID = 'github-enchanting-list-btn';

// ─── Selection helpers ───────────────────────────────────────────────────────

function getCheckedPRUrls() {
  const checkboxes = document.querySelectorAll(
    '.js-issues-list-check input[type="checkbox"]:checked, ' +
    '[data-bulk-actions-id] input[type="checkbox"]:checked, ' +
    '.js-issue-row input[type="checkbox"]:checked'
  );
  const urls = [];
  for (const cb of checkboxes) {
    const row = cb.closest('[id*="issue_"], .js-issue-row, [data-id]');
    if (!row) continue;
    const link = row.querySelector(
      'a[data-hovercard-type="pull_request"], ' +
      'a.js-navigation-open, ' +
      'a[id^="issue_"]'
    );
    if (link) urls.push(link.href);
  }
  return urls;
}

function findSelectionBar() {
  // GitHub shows a bar/label like "2 selected" in the table header when
  // checkboxes are checked
  const selectors = [
    '.table-list-header-toggle .btn-link.selected-count',
    '.js-check-all-container .js-selection-info',
    '[data-bulk-actions-id] .js-selection-info',
    '.table-list-triage .selected-count',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  // Fallback: look for text content matching "N selected"
  const candidates = document.querySelectorAll(
    '.table-list-header-toggle span, ' +
    '.js-check-all-container span, ' +
    '.table-list-header span'
  );
  for (const span of candidates) {
    if (/\d+\s+selected/i.test(span.textContent)) return span;
  }
  return null;
}

// ─── Dropdown construction ───────────────────────────────────────────────────

function createListDropdown() {
  const wrapper = document.createElement('span');
  wrapper.id = LIST_INJECTED_ID;
  wrapper.className = 'github-enchanting-wrapper github-enchanting-list-wrapper';

  const trigger = document.createElement('button');
  trigger.className = 'github-enchanting-trigger';
  trigger.setAttribute('aria-haspopup', 'true');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.innerHTML = `
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41
               M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
    <span>Dependabot</span>
    <svg aria-hidden="true" class="github-enchanting-caret" width="10" height="10"
         viewBox="0 0 16 16" fill="currentColor">
      <path d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25
               0 0011.396 7H4.604a.25.25 0 00-.177.427z"/>
    </svg>
  `;

  const menu = document.createElement('div');
  menu.className = 'github-enchanting-menu github-enchanting-list-menu';
  menu.setAttribute('role', 'menu');

  DEPENDABOT_COMMANDS.forEach(({ key, label }) => {
    const item = document.createElement('button');
    item.className = 'github-enchanting-item';
    item.setAttribute('role', 'menuitem');
    item.textContent = label;

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();
      const urls = getCheckedPRUrls();
      for (const url of urls) {
        const separator = url.includes('?') ? '&' : '?';
        window.open(
          url + separator + 'gh-enchant=' + encodeURIComponent(key),
          '_blank'
        );
      }
    });

    menu.appendChild(item);
  });

  wrapper.appendChild(trigger);
  wrapper.appendChild(menu);

  let outsideHandler = null;

  function openMenu() {
    menu.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    outsideHandler = (e) => {
      if (!wrapper.contains(e.target)) closeMenu();
    };
    setTimeout(() => document.addEventListener('click', outsideHandler), 0);
  }

  function closeMenu() {
    menu.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    if (outsideHandler) {
      document.removeEventListener('click', outsideHandler);
      outsideHandler = null;
    }
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });

  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  return wrapper;
}

// ─── Injection ───────────────────────────────────────────────────────────────

function injectListDropdown() {
  const existing = document.getElementById(LIST_INJECTED_ID);
  const bar = findSelectionBar();

  if (!bar) {
    // No selection bar visible — remove our button if it exists
    if (existing) existing.remove();
    return;
  }

  // Check if any PRs are actually selected
  const urls = getCheckedPRUrls();
  if (urls.length === 0) {
    if (existing) existing.remove();
    return;
  }

  // Already injected
  if (existing) return;

  const dropdown = createListDropdown();
  bar.insertAdjacentElement('afterend', dropdown);
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────

// Watch for checkbox changes and DOM updates
const listObserver = new MutationObserver(() => {
  injectListDropdown();
});

listObserver.observe(document.body, {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: ['checked', 'aria-checked'],
});

// Also listen for change events on checkboxes
document.addEventListener('change', (e) => {
  if (e.target.type === 'checkbox') {
    setTimeout(injectListDropdown, 100);
  }
});

// Initial run
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectListDropdown);
} else {
  injectListDropdown();
}
