// equipment.js
// Builds a dynamic equipment status table from /api/predictions

(function () {
  const TEN_SECONDS = 10000;

  function healthClass(score) {
    if (score > 80) return 'table-success';
    if (score >= 50) return 'table-warning';
    return 'table-danger';
  }

  function statusLabel(score) {
    if (score > 80) return 'Healthy';
    if (score >= 50) return 'At Risk';
    return 'Critical';
  }

  function equipmentTypeFromId(id) {
    // Simple deterministic mapping for demo (Pump/Turbine/Transformer)
    const types = ['Pump', 'Turbine', 'Transformer'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    return types[hash % types.length];
  }

  function lastMaintenanceDate(idx) {
    // Staggered last maintenance within the past 90 days
    const daysAgo = (idx * 7) % 90;
    const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  }

  async function fetchPredictions() {
    try {
      const res = await fetch('/api/predictions', { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error('Failed to fetch predictions');
      return await res.json();
    } catch {
      // Fallback mock data for static deployments
      const items = Array.from({ length: 10 }).map((_, i) => ({
        equipment_id: `EQ-${(i + 1).toString().padStart(3, '0')}`,
        health_score: Math.max(0, Math.min(100, 70 + (Math.random() * 40 - 20))),
        failure_probability: Math.random() * 0.5
      }));
      return { predictions: items };
    }
  }

  function renderTable(container, items, sortDesc = true) {
    if (!container) return;
    // Sort by health score
    items.sort((a, b) => sortDesc ? b.health_score - a.health_score : a.health_score - b.health_score);

    const table = document.createElement('table');
    table.className = 'table table-sm table-hover table-bordered align-middle mb-0';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Equipment ID</th>
        <th>Type</th>
        <th id="thHealth" role="button">Health Score</th>
        <th>Status</th>
        <th>Last Maintenance</th>
      </tr>`;

    const tbody = document.createElement('tbody');

    items.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.className = healthClass(item.health_score);

      const eqType = equipmentTypeFromId(item.equipment_id);
      const lastMaint = lastMaintenanceDate(idx);
      const isCritical = item.health_score < 50;

      const progress = `
        <div class="progress" role="progressbar" aria-valuenow="${Math.round(item.health_score)}" aria-valuemin="0" aria-valuemax="100" style="height: 12px;">
          <div class="progress-bar ${isCritical ? 'bg-danger' : (item.health_score >= 80 ? 'bg-success' : 'bg-warning')}" style="width: ${item.health_score}%;"></div>
        </div>`;

      tr.innerHTML = `
        <td class="fw-semibold">${item.equipment_id}</td>
        <td>${eqType}</td>
        <td style="min-width: 180px;">
          <div class="d-flex align-items-center gap-2">
            <span>${item.health_score.toFixed(1)}%</span>
            ${progress}
          </div>
        </td>
        <td>
          <span class="badge ${isCritical ? 'text-bg-danger' : (item.health_score >= 80 ? 'text-bg-success' : 'text-bg-warning')}">
            ${statusLabel(item.health_score)}
          </span>
          ${isCritical ? '<span class="badge text-bg-danger ms-1">Maintenance Due</span>' : ''}
        </td>
        <td>${lastMaint}</td>`;

      tr.addEventListener('click', () => {
        const modalEl = document.getElementById('equipmentDetailsModal');
        const content = document.getElementById('equipmentDetailsContent');
        if (content) {
          content.innerHTML = `
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <div class="border rounded p-3">
                  <h6 class="mb-2">Overview</h6>
                  <div><strong>ID:</strong> ${item.equipment_id}</div>
                  <div><strong>Type:</strong> ${eqType}</div>
                  <div><strong>Status:</strong> ${statusLabel(item.health_score)}</div>
                  <div><strong>Health Score:</strong> ${item.health_score.toFixed(1)}%</div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="border rounded p-3">
                  <h6 class="mb-2">Latest Metrics</h6>
                  <div><strong>Failure Probability:</strong> ${(item.failure_probability * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>`;
        }
        if (modalEl && window.bootstrap) {
          const modal = new bootstrap.Modal(modalEl);
          modal.show();
        }
      });

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    // Replace container content
    container.innerHTML = '';
    container.appendChild(table);

    // Add sorting behavior on header click
    const thHealth = thead.querySelector('#thHealth');
    let desc = true;
    thHealth?.addEventListener('click', () => {
      desc = !desc;
      renderTable(container, items.slice(), desc);
    });
  }

  function startLoop(container) {
    const poll = async () => {
      try {
        const data = await fetchPredictions();
        const items = (data?.predictions || []).map(p => ({
          equipment_id: p.equipment_id,
          health_score: Number(p.health_score),
          failure_probability: Number(p.failure_probability)
        }));
        renderTable(container, items);
      } catch (e) {
        // console.error(e);
      } finally {
        setTimeout(poll, TEN_SECONDS);
      }
    };
    poll();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('equipmentTable');
    if (!container) return;
    startLoop(container);
  });
})();


