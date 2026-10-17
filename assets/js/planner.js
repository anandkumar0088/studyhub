// assets/js/planner.js
// Handles Study Planner task creation, completion toggling, deletion, filtering, and progress statistics.

const StudyHubPlanner = {
  currentFilter: 'all', // 'all' | 'pending' | 'completed'

  init() {
    this.bindEvents();
    this.render();
    window.addEventListener('studyhub:planner-updated', () => this.render());
  },

  bindEvents() {
    const form = document.getElementById('plannerForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const subject = document.getElementById('taskSubject').value.trim();
        const text = document.getElementById('taskDescription').value.trim();
        const dueDate = document.getElementById('taskDueDate').value;
        const priority = document.getElementById('taskPriority').value;

        if (!text) {
          alert('Please enter a task description.');
          return;
        }

        StudyHubStorage.addPlannerTask({ subject, text, dueDate, priority });
        form.reset();
        document.getElementById('taskSubject').focus();
      });
    }

    // Filter tabs
    const filterButtons = document.querySelectorAll('.planner-filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.getAttribute('data-filter') || 'all';
        this.render();
      });
    });
  },

  render() {
    const tasksContainer = document.getElementById('plannerTasksList');
    if (!tasksContainer) return;

    const allTasks = StudyHubStorage.getPlannerTasks();
    const totalCount = allTasks.length;
    const completedCount = allTasks.filter(t => t.completed).length;
    const pendingCount = totalCount - completedCount;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Update stats bar
    const progressFill = document.getElementById('plannerProgressFill');
    const progressLabel = document.getElementById('plannerProgressLabel');
    const statsSummary = document.getElementById('plannerStatsSummary');

    if (progressFill) progressFill.style.width = `${progressPercent}%`;
    if (progressLabel) progressLabel.textContent = `${progressPercent}% Completed`;
    if (statsSummary) {
      statsSummary.textContent = `${completedCount} completed of ${totalCount} task${totalCount === 1 ? '' : 's'} (${pendingCount} pending)`;
    }

    // Filter tasks
    let visibleTasks = allTasks;
    if (this.currentFilter === 'pending') {
      visibleTasks = allTasks.filter(t => !t.completed);
    } else if (this.currentFilter === 'completed') {
      visibleTasks = allTasks.filter(t => t.completed);
    }

    if (visibleTasks.length === 0) {
      tasksContainer.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-state-title">No tasks found</div>
          <p class="empty-state-text">
            ${this.currentFilter === 'completed' 
              ? 'You have not marked any study tasks as completed yet.' 
              : 'Add your first study task above to track your revisions, chapters, and deadlines.'}
          </p>
        </div>
      `;
      return;
    }

    tasksContainer.innerHTML = '';
    visibleTasks.forEach(task => {
      const card = document.createElement('div');
      card.className = `task-item-card ${task.completed ? 'completed' : ''}`;

      const priorityBadgeClass = task.priority === 'High' 
        ? 'style="color: #dc2626; font-weight: 700;"' 
        : (task.priority === 'Medium' ? 'style="color: #d97706; font-weight: 600;"' : 'style="color: #4b5563;"');

      card.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task complete">
        <div class="task-info">
          <div class="task-text">${escapeHtml(task.text)}</div>
          <div class="task-meta-line">
            <span class="dropdown-badge">${escapeHtml(task.subject)}</span>
            <span ${priorityBadgeClass}>${escapeHtml(task.priority)} Priority</span>
            ${task.dueDate ? `<span>Due: ${escapeHtml(task.dueDate)}</span>` : ''}
          </div>
        </div>
        <button type="button" class="task-delete-btn" aria-label="Delete task" title="Delete task">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;

      // Checkbox listener
      const checkbox = card.querySelector('.task-checkbox');
      checkbox.addEventListener('change', () => {
        StudyHubStorage.toggleTaskCompleted(task.id);
      });

      // Delete listener
      const deleteBtn = card.querySelector('.task-delete-btn');
      deleteBtn.addEventListener('click', () => {
        if (confirm(`Delete task "${task.text}"?`)) {
          StudyHubStorage.deleteTask(task.id);
        }
      });

      tasksContainer.appendChild(card);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('plannerForm')) {
    StudyHubPlanner.init();
  }
});
