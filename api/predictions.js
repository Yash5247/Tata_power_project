function computeRisk({ temperature, vibration, pressure, current }) {
  // Simple heuristic-based risk score (0-100)
  let score = 0;
  if (temperature > 70) score += (temperature - 70) * 2;
  if (vibration > 3) score += (vibration - 3) * 10;
  if (pressure > 5.4) score += (pressure - 5.4) * 50;
  if (current > 115) score += (current - 115) * 1.5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const metrics = {
      temperature: Number(body.temperature) || 65,
      vibration: Number(body.vibration) || 2.5,
      pressure: Number(body.pressure) || 5.2,
      current: Number(body.current) || 108
    };

    const risk = computeRisk(metrics);
    const status = risk >= 70 ? 'critical' : risk >= 40 ? 'warning' : 'healthy';
    const message = status === 'critical'
      ? 'High failure risk detected. Immediate inspection recommended.'
      : status === 'warning'
      ? 'Elevated risk detected. Schedule maintenance check.'
      : 'Operating within normal parameters.';

    return res.json({ risk, status, message, metrics });
  } catch (e) {
    return res.status(400).json({ message: 'Invalid request', error: String(e) });
  }
};
