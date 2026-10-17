// assets/js/compare.js
// Handles side-by-side metadata comparison for up to 3 selected resources.

const StudyHubCompare = {
  async init(basePath = '') {
    await StudyHubCatalog.init(basePath);
    this.render();
    window.addEventListener('studyhub:compare-updated', () => this.render());
  },

  render() {
    const container = document.getElementById('compareTableContainer');
    const emptyNotice = document.getElementById('compareEmptyNotice');
    if (!container) return;

    const compareIds = StudyHubStorage.getCompareList();
    if (compareIds.length === 0) {
      if (container) container.style.display = 'none';
      if (emptyNotice) emptyNotice.style.display = 'block';
      return;
    }

    if (emptyNotice) emptyNotice.style.display = 'none';
    container.style.display = 'block';

    const items = compareIds.map(id => StudyHubCatalog.getById(id)).filter(Boolean);

    let html = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
        <p style="color: var(--text-muted); font-size: 0.9375rem;">
          Comparing <strong>${items.length}</strong> resource${items.length === 1 ? '' : 's'} (maximum 3).
        </p>
        <button type="button" id="clearAllCompareBtn" class="filter-reset-btn" style="cursor: pointer;">
          Clear All Comparison Items
        </button>
      </div>

      <div style="overflow-x: auto; border: 1px solid var(--border-default); border-radius: var(--radius-md); background: var(--bg-surface);">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9375rem; text-align: left;">
          <thead>
            <tr style="background: var(--bg-subtle); border-bottom: 2px solid var(--border-default);">
              <th style="padding: 1rem; width: 180px; font-weight: 700; color: var(--text-main);">Attribute</th>
              ${items.map(r => `
                <th style="padding: 1rem; min-width: 260px; font-weight: 700; color: var(--text-main); vertical-align: top;">
                  <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem;">
                    <span>${escapeHtml(r.title)}</span>
                    <button type="button" class="remove-compare-btn" data-id="${r.id}" style="color: var(--text-subtle); font-size: 1.1rem; line-height: 1; padding: 0 4px;" title="Remove from comparison">&times;</button>
                  </div>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--text-muted); background: var(--bg-subtle);">Resource Type</td>
              ${items.map(r => `<td style="padding: 0.85rem 1rem;"><span class="resource-type-badge">${escapeHtml(r.resourceType || 'Resource')}</span></td>`).join('')}
            </tr>
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--text-muted); background: var(--bg-subtle);">Subjects</td>
              ${items.map(r => `<td style="padding: 0.85rem 1rem;">${(r.subjects || []).map(s => `<span class="resource-tag">${escapeHtml(s)}</span>`).join(' ')}</td>`).join('')}
            </tr>
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--text-muted); background: var(--bg-subtle);">Target Classes / Exams</td>
              ${items.map(r => `
                <td style="padding: 0.85rem 1rem;">
                  ${(r.classes || []).map(c => `Class ${c}`).concat(r.exams || []).map(x => `<span class="dropdown-badge">${escapeHtml(x)}</span>`).join(' ')}
                </td>
              `).join('')}
            </tr>
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--text-muted); background: var(--bg-subtle);">Source Organization</td>
              ${items.map(r => `<td style="padding: 0.85rem 1rem; font-weight: 600;">${escapeHtml(r.sourceName)}</td>`).join('')}
            </tr>
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--text-muted); background: var(--bg-subtle);">Verification Status</td>
              ${items.map(r => `
                <td style="padding: 0.85rem 1rem;">
                  <span class="verification-badge">✓ ${escapeHtml(r.verificationStatus || 'Verified')}</span>
                  <div style="font-size: 0.75rem; color: var(--text-subtle); margin-top: 0.25rem;">Checked: ${escapeHtml(r.lastVerifiedDate || 'Recently')}</div>
                </td>
              `).join('')}
            </tr>
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--text-muted); background: var(--bg-subtle);">Language & Price</td>
              ${items.map(r => `<td style="padding: 0.85rem 1rem;">${escapeHtml(r.language || 'English')} • <strong style="color: #059669;">${escapeHtml(r.priceStatus || 'Free')}</strong></td>`).join('')}
            </tr>
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--text-muted); background: var(--bg-subtle);">Licensing / Access Type</td>
              ${items.map(r => `<td style="padding: 0.85rem 1rem; font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(r.licenseType || 'Public Official Access')}</td>`).join('')}
            </tr>
            <tr>
              <td style="padding: 1rem; font-weight: 600; color: var(--text-muted); background: var(--bg-subtle);">Original Action</td>
              ${items.map(r => `
                <td style="padding: 1rem;">
                  <a href="${escapeHtml(r.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="open-resource-btn" style="width: 100%; justify-content: center;">
                    Open Official Link
                  </a>
                </td>
              `).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;

    // Bind remove buttons
    container.querySelectorAll('.remove-compare-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        StudyHubStorage.toggleCompare(id);
      });
    });

    // Clear all button
    const clearBtn = container.querySelector('#clearAllCompareBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        StudyHubStorage.clearCompare();
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('compareTableContainer')) {
    StudyHubCompare.init();
  }
});
