// assets/js/ui.js
// Shared UI behaviors, accessible mobile navigation, theme controls, bookmark badge updates, and card rendering.

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const StudyHubUI = {
  init() {
    this.setupThemeToggle();
    this.setupMobileMenu();
    this.updateBookmarkBadge();
    this.setupGlobalKeyboardShortcuts();
    this.setupLiveSearchInputs();

    // Listen to storage events
    window.addEventListener('studyhub:bookmarks-updated', () => {
      this.updateBookmarkBadge();
    });
    window.addEventListener('studyhub:theme-changed', (e) => {
      this.syncThemeUI(e.detail.theme);
    });
  },

  setupThemeToggle() {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const newTheme = StudyHubStorage.toggleTheme();
        this.syncThemeUI(newTheme);
      });
    });
    this.syncThemeUI(StudyHubStorage.getTheme());
  },

  syncThemeUI(theme) {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
      btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
      const iconContainer = btn.querySelector('.theme-icon-container');
      if (iconContainer) {
        if (theme === 'dark') {
          iconContainer.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          `;
        } else {
          iconContainer.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          `;
        }
      }
    });
  },

  setupMobileMenu() {
    const openBtn = document.querySelector('.mobile-menu-btn');
    const closeBtn = document.querySelector('.drawer-close-btn');
    const drawer = document.querySelector('.mobile-drawer');
    const overlay = document.querySelector('.mobile-drawer-overlay');

    if (!drawer || !overlay) return;

    const openDrawer = () => {
      drawer.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    };

    const closeDrawer = () => {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      if (openBtn) openBtn.focus();
    };

    if (openBtn) openBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    // Close drawer on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('active')) {
        closeDrawer();
      }
    });

    // Close when clicking internal links inside drawer
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });
  },

  updateBookmarkBadge() {
    const badges = document.querySelectorAll('.bookmark-count-badge');
    const count = StudyHubStorage.getBookmarks().length;
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  setupGlobalKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger if user is actively typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        if (e.key === 'Escape') {
          document.activeElement.blur();
        }
        return;
      }

      // '/' or 'Ctrl+K' focuses primary search input
      if (e.key === '/' || (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input-main');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        } else {
          // If on an article or legal page without a search input, redirect to search.html
          window.location.href = 'search.html';
        }
      }
    });
  },

  setupLiveSearchInputs() {
    const searchForms = document.querySelectorAll('.global-search-form');
    searchForms.forEach(form => {
      const input = form.querySelector('.search-input-main');
      const clearBtn = form.querySelector('.search-clear-btn');
      const dropdown = form.querySelector('.search-suggestions-dropdown');

      if (!input) return;

      let selectedIndex = -1;

      const updateClearBtn = () => {
        if (clearBtn) {
          clearBtn.style.display = input.value.trim().length > 0 ? 'flex' : 'none';
        }
      };

      input.addEventListener('input', () => {
        updateClearBtn();
        if (dropdown) {
          const val = input.value.trim();
          if (val.length >= 2) {
            const suggestions = StudyHubSearch.getSuggestions(StudyHubCatalog.getAll(), val, 6);
            if (suggestions.length > 0) {
              dropdown.innerHTML = suggestions.map((s, idx) => `
                <a href="${s.url}" class="suggestion-item" data-index="${idx}">
                  <div>
                    <strong>${escapeHtml(s.label)}</strong>
                    <div class="suggestion-meta">${escapeHtml(s.meta)}</div>
                  </div>
                  <span class="dropdown-badge">${escapeHtml(s.type)}</span>
                </a>
              `).join('');
              dropdown.style.display = 'block';
              selectedIndex = -1;
            } else {
              dropdown.style.display = 'none';
            }
          } else {
            dropdown.style.display = 'none';
          }
        }
      });

      // Clear button
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          input.value = '';
          updateClearBtn();
          if (dropdown) dropdown.style.display = 'none';
          input.focus();
          // Dispatch input event to refresh list if on search.html
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
      }

      // Keyboard navigation for suggestions
      input.addEventListener('keydown', (e) => {
        if (!dropdown || dropdown.style.display === 'none') return;
        const items = dropdown.querySelectorAll('.suggestion-item');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedIndex = (selectedIndex + 1) % items.length;
          items.forEach((item, idx) => item.classList.toggle('highlighted', idx === selectedIndex));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedIndex = (selectedIndex - 1 + items.length) % items.length;
          items.forEach((item, idx) => item.classList.toggle('highlighted', idx === selectedIndex));
        } else if (e.key === 'Enter') {
          if (selectedIndex >= 0 && items[selectedIndex]) {
            e.preventDefault();
            items[selectedIndex].click();
          }
        } else if (e.key === 'Escape') {
          dropdown.style.display = 'none';
          selectedIndex = -1;
        }
      });

      // Close suggestions on outside click
      document.addEventListener('click', (e) => {
        if (!form.contains(e.target) && dropdown) {
          dropdown.style.display = 'none';
        }
      });
    });
  },

  renderResourceCard(resource) {
    const isSaved = StudyHubStorage.isBookmarked(resource.id);
    const isCompared = StudyHubStorage.getCompareList().includes(resource.id);

    const card = document.createElement('article');
    card.className = 'resource-card';
    card.setAttribute('data-id', resource.id);

    const classesLabel = (resource.classes || []).length > 0 
      ? resource.classes.map(c => `Class ${c}`).join(', ') 
      : (resource.exams || []).join(', ');

    const subjectsLabel = (resource.subjects || []).join(', ');

    card.innerHTML = `
      <div class="resource-card-meta-top">
        <span class="resource-type-badge">${escapeHtml(resource.resourceType || 'Resource')}</span>
        <span class="verification-badge" title="Manually checked on ${escapeHtml(resource.lastVerifiedDate || 'Recently')}">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          ${escapeHtml(resource.verificationStatus || 'Verified Source')}
        </span>
      </div>

      <h3 class="resource-title">${escapeHtml(resource.title)}</h3>
      <p class="resource-description">${escapeHtml(resource.description)}</p>

      <div class="resource-tags-row">
        ${subjectsLabel ? `<span class="resource-tag">${escapeHtml(subjectsLabel)}</span>` : ''}
        ${classesLabel ? `<span class="resource-tag">${escapeHtml(classesLabel)}</span>` : ''}
        ${resource.board ? `<span class="resource-tag">${escapeHtml(resource.board)}</span>` : ''}
        ${resource.language ? `<span class="resource-tag">${escapeHtml(resource.language)}</span>` : ''}
        <span class="resource-tag">${escapeHtml(resource.priceStatus || 'Free')}</span>
      </div>

      <div class="resource-card-footer">
        <div class="resource-source-info">
          <span>Source:</span>
          <span class="resource-source-name">${escapeHtml(resource.sourceName)}</span>
          ${resource.lastVerifiedDate ? `<span>• Verified: ${escapeHtml(resource.lastVerifiedDate)}</span>` : ''}
        </div>

        <div class="resource-actions-group">
          <label class="compare-checkbox-label" title="Compare side-by-side with other resources">
            <input type="checkbox" class="compare-checkbox" ${isCompared ? 'checked' : ''}>
            <span>Compare</span>
          </label>

          <button type="button" class="bookmark-toggle-btn ${isSaved ? 'saved' : ''}" aria-label="${isSaved ? 'Remove from Bookmarks' : 'Save Resource'}" title="${isSaved ? 'Remove Bookmark' : 'Save to Bookmarks'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>

          <a href="${escapeHtml(resource.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="open-resource-btn" title="Open destination website in a new secure tab">
            <span>Open Original Resource</span>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </a>
        </div>
      </div>
    `;

    // Bookmark toggle listener
    const bookmarkBtn = card.querySelector('.bookmark-toggle-btn');
    bookmarkBtn.addEventListener('click', () => {
      const savedNow = StudyHubStorage.toggleBookmark(resource.id);
      bookmarkBtn.classList.toggle('saved', savedNow);
      bookmarkBtn.setAttribute('aria-label', savedNow ? 'Remove from Bookmarks' : 'Save Resource');
      bookmarkBtn.setAttribute('title', savedNow ? 'Remove Bookmark' : 'Save to Bookmarks');
      const svg = bookmarkBtn.querySelector('svg');
      if (svg) svg.setAttribute('fill', savedNow ? 'currentColor' : 'none');
    });

    // Record recently viewed on opening original resource
    const openBtn = card.querySelector('.open-resource-btn');
    openBtn.addEventListener('click', () => {
      StudyHubStorage.addRecent(resource.id);
    });

    // Compare checkbox toggle listener
    const compareCheckbox = card.querySelector('.compare-checkbox');
    compareCheckbox.addEventListener('change', () => {
      const isChecked = StudyHubStorage.toggleCompare(resource.id);
      compareCheckbox.checked = isChecked;
    });

    return card;
  }
};

// Auto-run UI setup on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  StudyHubUI.init();
});
