// assets/js/timer.js
// Precision Study Timer using monotonic Date.now() elapsed calculation to prevent tab throttling drift,
// with synthesized Web Audio chimes and configurable focus/break intervals.

const StudyHubTimer = {
  modes: {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  },

  currentMode: 'focus',
  totalSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  isRunning: false,
  timerInterval: null,
  targetEndTime: null,
  sessionsCompleted: 0,

  init() {
    this.bindControls();
    this.updateDisplay();
  },

  bindControls() {
    const playPauseBtn = document.getElementById('timerToggleBtn');
    const resetBtn = document.getElementById('timerResetBtn');
    const modeButtons = document.querySelectorAll('.timer-mode-btn');
    const customTimeBtn = document.getElementById('customTimeBtn');

    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        if (this.isRunning) this.pause();
        else this.start();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset());
    }

    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        if (mode && this.modes[mode]) {
          modeButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.setMode(mode);
        }
      });
    });

    if (customTimeBtn) {
      customTimeBtn.addEventListener('click', () => {
        const input = prompt('Enter custom focus duration in minutes (1–120):', '30');
        if (input) {
          const mins = parseInt(input, 10);
          if (!isNaN(mins) && mins >= 1 && mins <= 120) {
            this.modes.custom = mins * 60;
            this.setMode('custom');
            modeButtons.forEach(b => b.classList.remove('active'));
            customTimeBtn.classList.add('active');
          } else {
            alert('Please enter a valid number between 1 and 120 minutes.');
          }
        }
      });
    }
  },

  setMode(mode) {
    this.pause();
    this.currentMode = mode;
    this.totalSeconds = this.modes[mode] || 25 * 60;
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplay();
  },

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.targetEndTime = Date.now() + (this.remainingSeconds * 1000);

    const toggleBtn = document.getElementById('timerToggleBtn');
    if (toggleBtn) {
      toggleBtn.textContent = 'Pause';
      toggleBtn.style.backgroundColor = 'var(--brand-amber-dark)';
    }

    this.timerInterval = setInterval(() => {
      const now = Date.now();
      const msLeft = Math.max(0, this.targetEndTime - now);
      this.remainingSeconds = Math.ceil(msLeft / 1000);

      this.updateDisplay();

      if (msLeft <= 0) {
        this.completeSession();
      }
    }, 250);
  },

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.timerInterval);
    this.timerInterval = null;

    const toggleBtn = document.getElementById('timerToggleBtn');
    if (toggleBtn) {
      toggleBtn.textContent = 'Start';
      toggleBtn.style.backgroundColor = 'var(--brand-navy)';
    }
  },

  reset() {
    this.pause();
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplay();
  },

  completeSession() {
    this.pause();
    this.playAudioChime();

    if (this.currentMode === 'focus' || this.currentMode === 'custom') {
      this.sessionsCompleted++;
      const counter = document.getElementById('sessionsCompletedCount');
      if (counter) counter.textContent = this.sessionsCompleted;
      alert('Focus session complete! Great work. Time for a well-deserved short break.');
    } else {
      alert('Break complete! Ready to begin your next focus session?');
    }

    this.reset();
  },

  updateDisplay() {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const displayEl = document.getElementById('timerDisplay');
    if (displayEl) displayEl.textContent = formatted;

    // Update document title with remaining time for convenience
    if (this.isRunning) {
      document.title = `(${formatted}) StudyHub Focus Timer`;
    } else {
      document.title = 'StudyHub Focus Timer — Precision Pomodoro & Study Intervals';
    }
  },

  playAudioChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Soft harmonic chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3); // E5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.5); // G5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('timerDisplay')) {
    StudyHubTimer.init();
  }
});
