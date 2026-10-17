// assets/js/checklist.js
// Handles Revision Checklist curriculum loading, chapter status toggling, and completion metrics.

const StudyHubChecklist = {
  checklistsData: null,
  activeCurriculumId: 'cbse-class10-science',

  async init(basePath = '') {
    try {
      const paths = [
        `${basePath}data/checklists.json`,
        './data/checklists.json',
        '../data/checklists.json',
        '/data/checklists.json'
      ];
      let res = null;
      for (const p of paths) {
        try {
          const r = await fetch(p);
          if (r.ok) { res = r; break; }
        } catch (e) {}
      }
      if (!res) throw new Error('Could not load checklists.json');
      this.checklistsData = await res.json();
      this.bindControls();
      this.render();
    } catch (e) {
      console.error('Checklist initialization failed:', e);
    }
  },

  bindControls() {
    const selector = document.getElementById('curriculumSelector');
    if (!selector || !this.checklistsData) return;

    selector.innerHTML = (this.checklistsData.curricula || []).map(c => `
      <option value="${c.id}" ${c.id === this.activeCurriculumId ? 'selected' : ''}>
        ${escapeHtml(c.name)} (${c.totalChapters} Chapters)
      </option>
    `).join('');

    selector.addEventListener('change', (e) => {
      this.activeCurriculumId = e.target.value;
      this.render();
    });
  },

  render() {
    if (!this.checklistsData) return;
    const curriculum = (this.checklistsData.curricula || []).find(c => c.id === this.activeCurriculumId);
    if (!curriculum) return;

    const container = document.getElementById('checklistChaptersList');
    const titleEl = document.getElementById('checklistCurriculumTitle');
    const progressFill = document.getElementById('checklistProgressFill');
    const progressLabel = document.getElementById('checklistProgressLabel');
    const summaryText = document.getElementById('checklistSummaryText');

    if (titleEl) titleEl.textContent = curriculum.name;

    const savedProgress = StudyHubStorage.getChecklistProgress(curriculum.id);
    let completedCount = 0;
    let inProgressCount = 0;

    curriculum.chapters.forEach(ch => {
      const st = savedProgress[ch.id]?.status || 'not-started';
      if (st === 'completed') completedCount++;
      else if (st === 'in-progress') inProgressCount++;
    });

    const totalChapters = curriculum.chapters.length;
    const percent = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressLabel) progressLabel.textContent = `${percent}% Completed`;
    if (summaryText) {
      summaryText.textContent = `${completedCount} completed, ${inProgressCount} in progress, ${totalChapters - completedCount - inProgressCount} not started`;
    }

    if (!container) return;
    container.innerHTML = '';

    curriculum.chapters.forEach((ch, index) => {
      const status = savedProgress[ch.id]?.status || 'not-started';
      const card = document.createElement('div');
      card.className = `task-item-card ${status === 'completed' ? 'completed' : ''}`;
      card.style.cursor = 'default';

      const statusBadge = status === 'completed'
        ? '<span class="verification-badge" style="background:#ecfdf5; color:#065f46; border-color:#a7f3d0;">✓ Completed</span>'
        : (status === 'in-progress' 
          ? '<span class="dropdown-badge" style="background:#fef3c7; color:#b45309; border-color:#fde68a;">⏳ In Progress</span>'
          : '<span class="dropdown-badge">Not Started</span>');

      card.innerHTML = `
        <div style="font-weight: 700; color: var(--text-subtle); width: 24px; text-align: right; flex-shrink: 0; padding-top: 2px;">
          ${index + 1}.
        </div>
        <div class="task-info">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.35rem;">
            <div class="task-text" style="margin-bottom: 0;">${escapeHtml(ch.title)}</div>
            <div class="chapter-status-pill">${statusBadge}</div>
          </div>
          <div class="task-meta-line" style="margin-bottom: 0.5rem;">
            <span class="dropdown-badge">${escapeHtml(ch.subject)}</span>
            <span>${(ch.subtopics || []).length} key subtopics</span>
          </div>
          <div style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.4;">
            <strong>Key Focus:</strong> ${(ch.subtopics || []).map(s => escapeHtml(s)).join(' • ')}
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.35rem; flex-shrink: 0;">
          <button type="button" class="cycle-status-btn open-resource-btn" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;" title="Cycle between Not Started, In Progress, and Completed">
            Update Status
          </button>
        </div>
      `;

      const btn = card.querySelector('.cycle-status-btn');
      btn.addEventListener('click', () => {
        let nextStatus = 'in-progress';
        if (status === 'not-started') nextStatus = 'in-progress';
        else if (status === 'in-progress') nextStatus = 'completed';
        else if (status === 'completed') nextStatus = 'not-started';

        StudyHubStorage.setChapterStatus(curriculum.id, ch.id, nextStatus);
        this.render();
      });

      container.appendChild(card);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('curriculumSelector')) {
    StudyHubChecklist.init();
  }
});
