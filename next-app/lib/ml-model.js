// Lightweight RandomForest-style classifier and anomaly detection for serverless use.
// No heavy native deps; safe for Vercel serverless functions.

// NOTE: Public folder is read-only at runtime on Vercel. We'll attempt to write
// next-app/public/model.json for local/dev, and fall back to /tmp in prod.

let fs, path;
try {
  // Only available in Node (server). Guard for client-side import safety.
  fs = require('node:fs');
  path = require('node:path');
} catch (_) {}

const DEFAULT_FEATURES = ['temperature', 'vibration', 'pressure', 'current'];

function rng(seed) {
  // Simple LCG for reproducibility
  let s = seed >>> 0 || 123456789;
  return () => (s = (1664525 * s + 1013904223) >>> 0) / 0xffffffff;
}

function generateSyntheticData(numPoints = 1000, failureRate = 0.05, seed = 42) {
  const R = rng(seed);
  const data = [];
  const start = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days

  for (let i = 0; i < numPoints; i++) {
    const t = i / numPoints;
    const temperature = 60 + 5 * Math.sin(t * Math.PI * 10) + (R() - 0.5) * 2;
    const vibration = 2 + 0.6 * Math.sin(t * Math.PI * 5) + (R() - 0.5) * 0.3;
    const pressure = 5.2 + 0.4 * Math.cos(t * Math.PI * 4) + (R() - 0.5) * 0.2;
    const current = 108 + 8 * Math.sin(t * Math.PI * 7) + (R() - 0.5) * 3;

    // Inject anomalies with probability ~ failureRate
    const isAnomaly = R() < failureRate;
    const features = {
      temperature: temperature + (isAnomaly ? 8 + R() * 5 : 0),
      vibration: vibration + (isAnomaly ? 1 + R() * 0.8 : 0),
      pressure: pressure - (isAnomaly ? 0.8 + R() * 0.8 : 0),
      current: current + (isAnomaly ? 10 + R() * 8 : 0),
    };
    const label = isAnomaly ? 1 : (R() < failureRate * 0.2 ? 1 : 0);

    data.push({
      timestamp: new Date(start + (i * 30 * 24 * 60 * 60 * 1000) / numPoints).toISOString(),
      ...features,
      failure: label,
    });
  }
  return data;
}

// Train a forest of decision stumps (one-level trees) with bagging.
function trainRandomForest(points, { nTrees = 50, seed = 123 } = {}) {
  if (!Array.isArray(points) || points.length === 0) throw new Error('No training data');
  const R = rng(seed);
  const forest = [];

  for (let k = 0; k < nTrees; k++) {
    // Bootstrap sample indices
    const sample = [];
    for (let i = 0; i < points.length; i++) sample.push(points[(Math.random() * points.length) | 0]);

    // Choose random feature
    const feat = DEFAULT_FEATURES[(R() * DEFAULT_FEATURES.length) | 0];
    // Choose threshold as random quantile
    const vals = sample.map((p) => Number(p[feat])).sort((a, b) => a - b);
    const q = Math.min(0.95, Math.max(0.05, R()));
    const threshold = vals[Math.floor(q * (vals.length - 1))] ?? vals[Math.floor(vals.length / 2)];

    // Compute child class probabilities
    let leftPos = 0, leftTot = 0, rightPos = 0, rightTot = 0;
    for (const p of sample) {
      if (Number(p[feat]) <= threshold) { leftTot++; if (p.failure) leftPos++; }
      else { rightTot++; if (p.failure) rightPos++; }
    }
    const leftProb = leftTot ? leftPos / leftTot : 0.0;
    const rightProb = rightTot ? rightPos / rightTot : 0.0;

    forest.push({ feature: feat, threshold, leftProb, rightProb });
  }

  const model = { type: 'random-stump-forest', features: DEFAULT_FEATURES, trees: forest };
  return model;
}

function predict(model, point) {
  if (!model || !Array.isArray(model.trees)) throw new Error('Model not loaded');
  let sum = 0;
  for (const t of model.trees) {
    const v = Number(point[t.feature]);
    sum += v <= t.threshold ? t.leftProb : t.rightProb;
  }
  const failureProb = model.trees.length ? sum / model.trees.length : 0;
  const health = Math.max(0, Math.min(100, (1 - failureProb) * 100));
  return { failure_probability: failureProb, health_score: Number(health.toFixed(1)) };
}

// Simple rolling z-score anomaly detector for a time series of points.
function anomalyScores(series, window = 24) {
  const scores = [];
  const buf = [];
  function mean(arr) { return arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length); }
  function std(arr) { const m = mean(arr); return Math.sqrt(mean(arr.map(x => (x - m) ** 2))) || 1; }

  for (let i = 0; i < series.length; i++) {
    const p = series[i];
    buf.push(p);
    if (buf.length > window) buf.shift();
    const mT = mean(buf.map(b => Number(b.temperature)));
    const sT = std(buf.map(b => Number(b.temperature)));
    const mV = mean(buf.map(b => Number(b.vibration)));
    const sV = std(buf.map(b => Number(b.vibration)));
    const mP = mean(buf.map(b => Number(b.pressure)));
    const sP = std(buf.map(b => Number(b.pressure)));
    const mC = mean(buf.map(b => Number(b.current)));
    const sC = std(buf.map(b => Number(b.current)));

    const z = (
      Math.abs((Number(p.temperature) - mT) / sT) +
      Math.abs((Number(p.vibration) - mV) / sV) +
      Math.abs((Number(p.pressure) - mP) / sP) +
      Math.abs((Number(p.current) - mC) / sC)
    ) / 4;
    scores.push({ index: i, timestamp: p.timestamp, score: Number(z.toFixed(3)) });
  }
  return scores;
}

function trySaveModelJSON(model) {
  if (!fs || !path) return false;
  const publicPath = path.join(process.cwd(), 'next-app', 'public', 'model.json');
  try {
    fs.mkdirSync(path.dirname(publicPath), { recursive: true });
    fs.writeFileSync(publicPath, JSON.stringify(model));
    return true;
  } catch (_) {
    try {
      fs.writeFileSync(path.join('/tmp', 'model.json'), JSON.stringify(model));
      return true;
    } catch (_) { return false; }
  }
}

function loadModelJSON() {
  if (!fs || !path) return null;
  const candidates = [path.join('/tmp', 'model.json'), path.join(process.cwd(), 'next-app', 'public', 'model.json')];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (_) {}
  }
  return null;
}

function trainAndExport({ points, nTrees = 50 } = {}) {
  const data = points && Array.isArray(points) ? points : generateSyntheticData(1000, 0.05);
  const model = trainRandomForest(data, { nTrees });
  trySaveModelJSON(model);
  return model;
}

module.exports = {
  DEFAULT_FEATURES,
  generateSyntheticData,
  trainRandomForest,
  predict,
  anomalyScores,
  trainAndExport,
  loadModelJSON,
  trySaveModelJSON,
};


