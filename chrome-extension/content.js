// shared.js is loaded before this file (provides DEPENDABOT_COMMANDS, getCommandByKey)

const INJECTED_ID = 'github-enchanting-btn';

// ─── Detection ──────────────────────────────────────────────────────────────

function isDependabotPR() {
  // Check PR branch name (most reliable)
  const headRef = document.querySelector(
    '.head-ref, [class*="head-ref"], ' +
    'css-truncate-target[data-value], ' +
    'span.commit-ref:not(.base-ref)'
  );
  if (headRef && /dependabot/i.test(headRef.textContent)) return true;

  // Check PR author link
  const authorLinks = document.querySelectorAll('a.author, a[data-hovercard-type="user"]');
  for (const a of authorLinks) {
    if (/dependabot/i.test(a.getAttribute('href') || '') ||
        /dependabot/i.test(a.textContent)) return true;
  }

  // Check page URL branch param as fallback
  if (/dependabot/i.test(document.title)) return true;

  // Check the first comment's author
  const firstAuthor = document.querySelector(
    '.js-comment-container .author, ' +
    '.timeline-comment:first-of-type .author'
  );
  if (firstAuthor && /dependabot/i.test(firstAuthor.textContent)) return true;

  return false;
}

// ─── DOM helpers ─────────────────────────────────────────────────────────────

/**
 * Finds the emoji/reaction button in the first PR comment, so we can insert
 * our dropdown directly after it inside the same flex row.
 * Returns { anchor, parent } where anchor is the element to insert after.
 */
function findInjectionTarget() {
  // Walk only through the first PR comment container
  const containers = [
    document.querySelector('.js-comment-container'),
    document.querySelector('.timeline-comment'),
    document.querySelector('[data-target="issue-body.container"]'),
  ].filter(Boolean);

  for (const container of containers) {
    // The emoji/add-reaction button - several possible selectors across GH versions
    const emojiSelectors = [
      'button[aria-label*="Add your reaction" i]',
      'button[aria-label*="reaction" i]',
      'button[aria-label*="emoji" i]',
      'details.js-reaction-popover-container > summary',
      '[data-target="reactions-menu.buttonContainer"]',
      '.js-reactions-container',
      '.comment-reactions',
    ];

    for (const sel of emojiSelectors) {
      const el = container.querySelector(sel);
      if (el) {
        // We want the topmost element that sits directly in the row
        // Walk up until parent is a flex/inline-flex row
        let anchor = el;
        let parent = el.parentElement;
        while (parent && parent !== container) {
          const display = getComputedStyle(parent).display;
          if (display === 'flex' || display === 'inline-flex') {
            // parent is the row — anchor is the child inside this row
            return { anchor, parent };
          }
          anchor = parent;
          parent = parent.parentElement;
        }
        // Fallback: just insert after el inside its direct parent
        return { anchor: el, parent: el.parentElement };
      }
    }
  }

  return null;
}

// ─── Comment posting ─────────────────────────────────────────────────────────

function setReactValue(textarea, value) {
  // Bypass React's synthetic event system
  const desc = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype, 'value'
  );
  desc.set.call(textarea, value);
  textarea.dispatchEvent(new Event('input',  { bubbles: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true }));
}

async function postComment(commandText) {
  // Find the new-comment textarea at the bottom of the page
  const textarea = document.querySelector(
    '#new_comment_field, ' +
    'textarea[name="comment[body]"], ' +
    'textarea.js-comment-field, ' +
    'textarea[aria-label*="comment" i]'
  );

  if (!textarea) {
    alert('⚠️ Github Enchanting: Could not find the comment box.\nPlease scroll down and type the command manually:\n\n' + commandText);
    return;
  }

  // Scroll to and focus the textarea
  textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
  textarea.focus();

  // Set value in a React-compatible way
  setReactValue(textarea, commandText);

  // Give React a moment to catch up
  await new Promise(r => setTimeout(r, 350));

  // Find the submit button in the new-comment form
  const submitBtn = document.querySelector(
    '#new_comment_form button[type="submit"], ' +
    '.js-new-comment-form button[type="submit"], ' +
    'button.js-comment-submit-button, ' +
    '.discussion-timeline-actions button[type="submit"]'
  );

  if (!submitBtn) {
    alert('⚠️ Github Enchanting: Comment pre-filled but could not auto-submit.\nPlease click the "Comment" button to post:\n\n' + commandText);
    return;
  }

  submitBtn.click();
}

// ─── UI construction ─────────────────────────────────────────────────────────

function createDropdown() {
  const wrapper = document.createElement('span');
  wrapper.id = INJECTED_ID;
  wrapper.className = 'github-enchanting-wrapper';

  // Trigger button
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

  // Dropdown menu
  const menu = document.createElement('div');
  menu.className = 'github-enchanting-menu';
  menu.setAttribute('role', 'menu');

  DEPENDABOT_COMMANDS.forEach(({ label, command }) => {
    const item = document.createElement('button');
    item.className = 'github-enchanting-item';
    item.setAttribute('role', 'menuitem');
    item.setAttribute('title', command);
    item.textContent = label;

    item.addEventListener('click', async (e) => {
      e.stopPropagation();
      closeMenu();
      await postComment(command);
    });

    menu.appendChild(item);
  });

  wrapper.appendChild(trigger);
  wrapper.appendChild(menu);

  // Toggle open/close
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

  // Close on Escape
  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  return wrapper;
}

// ─── Injection ───────────────────────────────────────────────────────────────

function inject() {
  if (!window.location.pathname.includes('/pull/')) return;
  if (document.getElementById(INJECTED_ID)) return;
  if (!isDependabotPR()) return;

  const target = findInjectionTarget();
  if (!target) return;

  const dropdown = createDropdown();

  // Insert directly after the emoji anchor, inside the same flex row
  const { anchor, parent } = target;
  if (parent) {
    parent.insertBefore(dropdown, anchor.nextSibling);
  } else {
    anchor.insertAdjacentElement('afterend', dropdown);
  }
}

// ─── Auto-comment via URL param ──────────────────────────────────────────────

async function handleEnchantParam() {
  const params = new URLSearchParams(window.location.search);
  const cmdKey = params.get('gh-enchant');
  if (!cmdKey) return;

  // Only process if this is a Dependabot PR
  if (!isDependabotPR()) return;

  const commandText = getCommandByKey(cmdKey);
  if (!commandText) return;

  // Wait for the comment form to be available
  await new Promise(r => setTimeout(r, 1500));

  await postComment(commandText);

  // Close the tab after posting
  setTimeout(() => window.close(), 1000);
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────

let lastUrl = location.href;
let retryTimer = null;

function tryInject() {
  inject();
  // Retry a few times in case DOM loads slowly
  let attempts = 0;
  clearInterval(retryTimer);
  retryTimer = setInterval(() => {
    if (document.getElementById(INJECTED_ID) || attempts++ > 8) {
      clearInterval(retryTimer);
      return;
    }
    inject();
  }, 800);
}

// Handle GitHub's SPA navigation (Turbo/PJAX)
const navObserver = new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    if (currentUrl.includes('/pull/')) {
      setTimeout(tryInject, 600);
    }
  }
});

navObserver.observe(document.documentElement, {
  subtree: false,
  childList: true,
});

// Also watch for the PR body to appear (lazy-loaded)
const domObserver = new MutationObserver(() => {
  if (!document.getElementById(INJECTED_ID) && isDependabotPR()) {
    inject();
  }
});

domObserver.observe(document.body, {
  subtree: true,
  childList: true,
});

// Initial run
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    tryInject();
    handleEnchantParam();
  });
} else {
  tryInject();
  handleEnchantParam();
}
