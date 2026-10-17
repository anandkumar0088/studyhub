// assets/js/contact.js
// Handles client-side contact form validation and dispatches via mailto or explicit clipboard copy.

const StudyHubContact = {
  // Configurable contact email address
  DESTINATION_EMAIL: 'contact@studyhub.local',

  init() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmission(form);
    });

    const copyBtn = document.getElementById('copyMessageBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        this.copyToClipboard(form);
      });
    }
  },

  getFormData(form) {
    return {
      name: form.querySelector('#contactName').value.trim(),
      email: form.querySelector('#contactEmail').value.trim(),
      category: form.querySelector('#contactCategory').value,
      subject: form.querySelector('#contactSubject').value.trim(),
      message: form.querySelector('#contactMessage').value.trim()
    };
  },

  validate(data) {
    if (!data.name) return 'Please enter your full name.';
    if (!data.email || !data.email.includes('@')) return 'Please enter a valid email address.';
    if (!data.subject) return 'Please provide a subject line.';
    if (!data.message || data.message.length < 10) return 'Please write a message of at least 10 characters.';
    return null;
  },

  formatEmailBody(data) {
    return `Name: ${data.name}\nEmail: ${data.email}\nCategory: ${data.category}\n\nMessage:\n${data.message}\n\n---\nSent via StudyHub Educational Resource Discovery Platform (${window.location.origin})`;
  },

  handleSubmission(form) {
    const errorAlert = document.getElementById('contactErrorAlert');
    const noticeAlert = document.getElementById('contactNoticeAlert');
    if (errorAlert) errorAlert.style.display = 'none';

    const data = this.getFormData(form);
    const error = this.validate(data);

    if (error) {
      if (errorAlert) {
        errorAlert.textContent = error;
        errorAlert.style.display = 'block';
      } else {
        alert(error);
      }
      return;
    }

    const emailSubject = `[StudyHub - ${data.category}] ${data.subject}`;
    const emailBody = this.formatEmailBody(data);

    // Launch visitor's native email client with prefilled fields
    const mailtoUrl = `mailto:${encodeURIComponent(this.DESTINATION_EMAIL)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;

    if (noticeAlert) {
      noticeAlert.style.display = 'block';
    }
  },

  copyToClipboard(form) {
    const data = this.getFormData(form);
    const error = this.validate(data);
    const noticeAlert = document.getElementById('contactNoticeAlert');

    if (error) {
      alert(error);
      return;
    }

    const text = `To: ${this.DESTINATION_EMAIL}\nSubject: [StudyHub - ${data.category}] ${data.subject}\n\n${this.formatEmailBody(data)}`;

    navigator.clipboard.writeText(text).then(() => {
      alert('Message details copied to your clipboard! You can paste it into any email provider (Gmail, Outlook, Yahoo) to send.');
      if (noticeAlert) noticeAlert.style.display = 'block';
    }).catch(() => {
      alert('Failed to copy automatically. Please use the "Open in Email App" button.');
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('contactForm')) {
    StudyHubContact.init();
  }
});
