// app-ui.js
// Connection badge, keyboard shortcuts, simple error toasts

(function () {
  function setConnection(ok) {
    const el = document.getElementById('connectionStatus');
    if (!el) return;
    if (ok) {
      el.className = 'badge rounded-pill text-bg-success';
      el.textContent = 'Online';
    } else {
      el.className = 'badge rounded-pill text-bg-danger';
      el.textContent = 'Offline';
    }
  }

  function showErrorToast(msg) {
    if (!window.bootstrap) return;
    let container = document.getElementById('alertsToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'alertsToastContainer';
      container.className = 'toast-container position-fixed top-0 end-0 p-3';
      document.body.appendChild(container);
    }
    const toastEl = document.createElement('div');
    toastEl.className = 'toast align-items-center text-bg-danger border-0';
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${msg}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>`;
    container.appendChild(toastEl);
    new bootstrap.Toast(toastEl, { delay: 4000 }).show();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('connection-status', (e) => setConnection(!!e.detail?.ok));

    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        document.getElementById('btnRefresh')?.click();
      }
    });
  });

  // Basic validation helper
  window.validateResponse = function (obj, fields) {
    try {
      for (const f of fields) {
        if (obj[f] === undefined || obj[f] === null) throw new Error(`Missing field: ${f}`);
      }
      return true;
    } catch (e) {
      showErrorToast(e.message || 'Invalid data received');
      return false;
    }
  }
})();


