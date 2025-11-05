// alerts.js
// Polls /api/alerts and manages alerts UI (panel + toasts)

(function () {
  const POLL_MS = 3000;
  const STORAGE_KEY = 'dismissed_alert_ids_v1';

  const severityToClass = {
    info: 'text-bg-primary',
    warning: 'text-bg-warning',
    critical: 'text-bg-danger'
  };

  function getDismissed() {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    } catch { return new Set(); }
  }

  function addDismissed(id) {
    const set = getDismissed();
    set.add(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  }

  function alertId(alert) {
    // Use equipment_id + timestamp + severity to identify uniqueness
    return `${alert.equipment_id || 'NA'}_${alert.timestamp || ''}_${alert.severity || ''}`;
  }

  function ensureToastContainer() {
    let container = document.getElementById('alertsToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'alertsToastContainer';
      container.className = 'toast-container position-fixed top-0 end-0 p-3';
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(alert) {
    if (!window.bootstrap) return;
    const container = ensureToastContainer();
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center border-0 ${severityToClass[alert.severity] || 'text-bg-secondary'}`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <strong>${(alert.severity || 'info').toUpperCase()}</strong>: ${alert.message || 'Alert'}
          <div class="small opacity-75">${alert.equipment_id || ''} • ${alert.timestamp || ''}</div>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>`;
    container.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 5000 });
    toast.show();
  }

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine'; o.frequency.value = 880; // A5
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      o.start(); o.stop(ctx.currentTime + 0.32);
    } catch {}
  }

  function renderPanel(container, alerts, dismissed) {
    if (!container) return;
    if (!alerts.length) {
      container.innerHTML = '<div class="text-secondary">No alerts</div>';
      return;
    }

    const list = document.createElement('div');
    list.className = 'list-group';

    alerts.forEach((a) => {
      const id = alertId(a);
      if (dismissed.has(id)) return; // skip dismissed
      const item = document.createElement('div');
      item.className = 'list-group-item d-flex justify-content-between align-items-start';
      item.innerHTML = `
        <div class="ms-2 me-auto">
          <div class="fw-semibold">${a.equipment_id || 'Equipment'}</div>
          <div class="small">${a.timestamp || ''} • ${a.message || 'Alert'}</div>
          <span class="badge ${severityToClass[a.severity] || 'text-bg-secondary'} mt-2">${(a.severity || 'info').toUpperCase()}</span>
        </div>
        <button class="btn btn-sm btn-outline-light">Dismiss</button>
      `;
      const btn = item.querySelector('button');
      btn?.addEventListener('click', () => {
        addDismissed(id);
        item.remove();
        if (!list.querySelector('.list-group-item')) container.innerHTML = '<div class="text-secondary">No alerts</div>';
      });
      list.appendChild(item);
    });

    container.innerHTML = '';
    container.appendChild(list);
  }

  async function fetchAlerts() {
    try {
      const res = await fetch('/api/alerts', { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error('Failed to fetch alerts');
      return await res.json();
    } catch {
      // Fallback: no alerts or a sample warning to show UI works
      return { alerts: [] };
    }
  }

  function startLoop(container) {
    const shown = new Set();
    const loop = async () => {
      try {
        const data = await fetchAlerts();
        const alerts = Array.isArray(data?.alerts) ? data.alerts : [];
        const dismissed = getDismissed();
        renderPanel(container, alerts, dismissed);

        // Toast only for new critical alerts
        alerts.forEach(a => {
          const id = alertId(a);
          if (a.severity === 'critical' && !shown.has(id) && !dismissed.has(id)) {
            shown.add(id);
            showToast(a);
            playBeep();
          }
        });
      } catch (e) {
        // console.error(e);
      } finally {
        setTimeout(loop, POLL_MS);
      }
    };
    loop();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const panel = document.getElementById('alertsPanel');
    if (!panel) return;
    startLoop(panel);
  });
})();


