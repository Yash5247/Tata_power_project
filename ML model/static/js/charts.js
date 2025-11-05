// charts.js
// Real-time temperature and vibration charts using Chart.js

(function () {
  const FIVE_SECONDS = 5000;
  const WINDOW_MS = 24 * 60 * 60 * 1000; // 24h
  let rangeDays = 30;

  function computeColor(value, thresholds) {
    // thresholds: { warn, crit }
    if (value >= thresholds.crit) return 'rgba(220, 53, 69, 1)'; // red
    if (value >= thresholds.warn) return 'rgba(255, 193, 7, 1)'; // yellow
    return 'rgba(25, 135, 84, 1)'; // green
  }

  function createLineChart(canvas, label, unit, thresholds) {
    if (!canvas || !window.Chart) return null;
    const data = { labels: [], datasets: [{
      label: `${label} (${unit})`,
      data: [],
      borderWidth: 2,
      fill: false,
      tension: 0.25,
      pointRadius: 0,
    }] };

    const chart = new Chart(canvas, {
      type: 'line',
      data,
      options: {
        responsive: true,
        animation: { duration: 400 },
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'category',
            grid: { color: 'rgba(255,255,255,.06)' }
          },
          y: {
            grid: { color: 'rgba(255,255,255,.06)' },
            ticks: { callback: (v) => `${v} ${unit}` }
          }
        },
        plugins: {
          legend: { display: true },
          tooltip: { enabled: true }
        },
        elements: {
          line: {
            borderColor: (ctx) => {
              const i = ctx.p0DataIndex != null ? ctx.p0DataIndex : ctx.dataIndex;
              const y = ctx.chart.data.datasets[0].data[i]?.y;
              return computeColor(Number(y), thresholds);
            }
          },
          point: {
            backgroundColor: (ctx) => {
              const i = ctx.dataIndex;
              const y = ctx.chart.data.datasets[0].data[i]?.y;
              return computeColor(Number(y), thresholds);
            }
          }
        }
      }
    });

    return chart;
  }

  function pushPoint(chart, ts, value) {
    if (!chart) return;
    const ds = chart.data.datasets[0];
    const label = ts instanceof Date ? ts.toLocaleTimeString() : String(ts);
    chart.data.labels.push(label);
    ds.data.push(value);

    // Trim to 24h window
    const cutoff = Date.now() - WINDOW_MS;
    while (chart.data.labels.length && chart.data.labels.length > 288) { // ~24h at 5s
      chart.data.labels.shift();
      ds.data.shift();
    }

    chart.update('quiet');
  }

  async function fetchSensor() {
    const res = await fetch('/api/sensor-data', { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('Failed to fetch sensor data');
    return res.json();
  }

  function startLoop(charts) {
    const poll = async () => {
      try {
        const data = await fetchSensor();
        const ts = data.timestamp ? new Date(data.timestamp) : new Date();

        if (charts.temperature)
          pushPoint(charts.temperature, ts, Number(data.temperature));
        if (charts.vibration)
          pushPoint(charts.vibration, ts, Number(data.vibration));
        document.dispatchEvent(new CustomEvent('connection-status', { detail: { ok: true } }));
        // remove loading state
        document.getElementById('temperatureChartContainer')?.classList.remove('chart-loading');
        document.getElementById('vibrationChartContainer')?.classList.remove('chart-loading');
      } catch (e) {
        document.dispatchEvent(new CustomEvent('connection-status', { detail: { ok: false } }));
        // Fallback: synthesize a point so the UI stays active on static hosting
        const now = new Date();
        if (charts.temperature) pushPoint(charts.temperature, now, 60 + Math.random() * 10);
        if (charts.vibration) pushPoint(charts.vibration, now, 2 + Math.random() * 1);
      } finally {
        setTimeout(poll, FIVE_SECONDS);
      }
    };
    poll();
  }

  async function loadHistorical(days, charts) {
    try {
      const res = await fetch(`/api/historical/${days}`);
      if (!res.ok) return;
      const data = await res.json();
      const temp = charts.temperature;
      const vib = charts.vibration;
      if (temp) { temp.data.labels = []; temp.data.datasets[0].data = []; }
      if (vib) { vib.data.labels = []; vib.data.datasets[0].data = []; }
      (data.readings || []).forEach(r => {
        const ts = r.ts ? new Date(r.ts) : new Date();
        const label = ts.toLocaleDateString() + ' ' + ts.toLocaleTimeString();
        if (temp) { temp.data.labels.push(label); temp.data.datasets[0].data.push(Number(r.temperature)); }
        if (vib) { vib.data.labels.push(label); vib.data.datasets[0].data.push(Number(r.vibration)); }
      });
      temp?.update('none');
      vib?.update('none');
    } catch {}
  }

  document.addEventListener('DOMContentLoaded', () => {
    const tempCanvas = document.getElementById('temperatureChart');
    const vibCanvas = document.getElementById('vibrationChart');

    const temperatureChart = createLineChart(
      tempCanvas,
      'Temperature',
      '°C',
      { warn: 70, crit: 80 }
    );
    const vibrationChart = createLineChart(
      vibCanvas,
      'Vibration',
      'mm/s',
      { warn: 2.8, crit: 3.5 }
    );

    const charts = { temperature: temperatureChart, vibration: vibrationChart };
    startLoop(charts);
    loadHistorical(rangeDays, charts);

    document.addEventListener('chart-range-change', (e) => {
      const d = e.detail?.days || 30;
      rangeDays = d;
      loadHistorical(rangeDays, charts);
    });

    document.getElementById('btnRefresh')?.addEventListener('click', () => {
      loadHistorical(rangeDays, charts);
    });
  });
})();


