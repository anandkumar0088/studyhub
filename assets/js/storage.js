// assets/js/storage.js
// Handles localStorage persistence for Bookmarks, Recently Viewed, Study Planner, Revision Checklist, and Theme Preference.

const StudyHubStorage = {
  KEYS: {
    BOOKMARKS: 'studyhub_bookmarks_v1',
    RECENT: 'studyhub_recent_v1',
    PLANNER: 'studyhub_planner_v1',
    CHECKLISTS: 'studyhub_checklists_v1',
    THEME: 'studyhub_theme_v1',
    COMPARE: 'studyhub_compare_v1'
  },

  // --- THEME ---
  getTheme() {
    try {
      const saved = localStorage.getItem(this.KEYS.THEME);
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  },

  setTheme(theme) {
    try {
      localStorage.setItem(this.KEYS.THEME, theme);
      document.documentElement.setAttribute('data-theme', theme);
      window.dispatchEvent(new CustomEvent('studyhub:theme-changed', { detail: { theme } }));
    } catch (e) {
      console.warn('Unable to persist theme to localStorage', e);
    }
  },

  toggleTheme() {
    const current = this.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  },

  // --- BOOKMARKS ---
  getBookmarks() {
    try {
      const raw = localStorage.getItem(this.KEYS.BOOKMARKS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  isBookmarked(id) {
    const list = this.getBookmarks();
    return list.includes(id);
  },

  toggleBookmark(id) {
    let list = this.getBookmarks();
    let isSaved = false;
    if (list.includes(id)) {
      list = list.filter(item => item !== id);
      isSaved = false;
    } else {
      list.unshift(id);
      isSaved = true;
    }
    try {
      localStorage.setItem(this.KEYS.BOOKMARKS, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('studyhub:bookmarks-updated', { detail: { count: list.length, id, isSaved } }));
    } catch (e) {
      console.warn('Storage quota exceeded or disabled', e);
    }
    return isSaved;
  },

  exportBookmarksJSON(fullResources = []) {
    const savedIds = this.getBookmarks();
    const exportData = fullResources.filter(r => savedIds.includes(r.id));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyhub-saved-resources-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportBookmarksCSV(fullResources = []) {
    const savedIds = this.getBookmarks();
    const items = fullResources.filter(r => savedIds.includes(r.id));
    const headers = ['ID', 'Title', 'Subject', 'Classes', 'Exams', 'ResourceType', 'SourceName', 'SourceURL', 'License'];
    const rows = items.map(item => [
      `"${item.id}"`,
      `"${(item.title || '').replace(/"/g, '""')}"`,
      `"${(item.subjects || []).join('; ')}"`,
      `"${(item.classes || []).join('; ')}"`,
      `"${(item.exams || []).join('; ')}"`,
      `"${item.resourceType || ''}"`,
      `"${item.sourceName || ''}"`,
      `"${item.sourceUrl || ''}"`,
      `"${item.licenseType || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyhub-saved-resources-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // --- RECENTLY VIEWED ---
  getRecent() {
    try {
      const raw = localStorage.getItem(this.KEYS.RECENT);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  addRecent(id) {
    if (!id) return;
    let list = this.getRecent();
    list = list.filter(item => item !== id);
    list.unshift(id);
    if (list.length > 20) list = list.slice(0, 20);
    try {
      localStorage.setItem(this.KEYS.RECENT, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('studyhub:recent-updated'));
    } catch (e) {}
  },

  clearRecent() {
    try {
      localStorage.removeItem(this.KEYS.RECENT);
      window.dispatchEvent(new CustomEvent('studyhub:recent-updated'));
    } catch (e) {}
  },

  // --- STUDY PLANNER ---
  getPlannerTasks() {
    try {
      const raw = localStorage.getItem(this.KEYS.PLANNER);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  addPlannerTask(task) {
    const tasks = this.getPlannerTasks();
    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      subject: task.subject || 'General',
      text: task.text || '',
      dueDate: task.dueDate || '',
      priority: task.priority || 'Medium',
      completed: false,
      createdAt: new Date().toISOString()
    };
    tasks.unshift(newTask);
    try {
      localStorage.setItem(this.KEYS.PLANNER, JSON.stringify(tasks));
      window.dispatchEvent(new CustomEvent('studyhub:planner-updated'));
    } catch (e) {}
    return newTask;
  },

  toggleTaskCompleted(taskId) {
    const tasks = this.getPlannerTasks().map(t => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null };
      }
      return t;
    });
    try {
      localStorage.setItem(this.KEYS.PLANNER, JSON.stringify(tasks));
      window.dispatchEvent(new CustomEvent('studyhub:planner-updated'));
    } catch (e) {}
    return tasks;
  },

  deleteTask(taskId) {
    const tasks = this.getPlannerTasks().filter(t => t.id !== taskId);
    try {
      localStorage.setItem(this.KEYS.PLANNER, JSON.stringify(tasks));
      window.dispatchEvent(new CustomEvent('studyhub:planner-updated'));
    } catch (e) {}
    return tasks;
  },

  // --- REVISION CHECKLIST ---
  getChecklistProgress(curriculumId) {
    try {
      const raw = localStorage.getItem(this.KEYS.CHECKLISTS);
      const all = raw ? JSON.parse(raw) : {};
      return all[curriculumId] || {};
    } catch (e) {
      return {};
    }
  },

  setChapterStatus(curriculumId, chapterId, status) {
    // status: 'not-started' | 'in-progress' | 'completed'
    try {
      const raw = localStorage.getItem(this.KEYS.CHECKLISTS);
      const all = raw ? JSON.parse(raw) : {};
      if (!all[curriculumId]) all[curriculumId] = {};
      all[curriculumId][chapterId] = {
        status: status,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(this.KEYS.CHECKLISTS, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('studyhub:checklist-updated', { detail: { curriculumId, chapterId, status } }));
    } catch (e) {}
  },

  // --- COMPARISON LIST ---
  getCompareList() {
    try {
      const raw = localStorage.getItem(this.KEYS.COMPARE);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  toggleCompare(id) {
    let list = this.getCompareList();
    if (list.includes(id)) {
      list = list.filter(item => item !== id);
    } else {
      if (list.length >= 3) {
        alert('You can compare a maximum of 3 resources at a time. Remove one first.');
        return false;
      }
      list.push(id);
    }
    try {
      localStorage.setItem(this.KEYS.COMPARE, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('studyhub:compare-updated', { detail: { count: list.length, list } }));
    } catch (e) {}
    return list.includes(id);
  },

  clearCompare() {
    try {
      localStorage.removeItem(this.KEYS.COMPARE);
      window.dispatchEvent(new CustomEvent('studyhub:compare-updated', { detail: { count: 0, list: [] } }));
    } catch (e) {}
  }
};

// Initialise theme immediately to prevent FOUC (flash of unstyled content)
(function initTheme() {
  const theme = StudyHubStorage.getTheme();
  document.documentElement.setAttribute('data-theme', theme);
})();
