const FIVE_SECONDS = 5000;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const now = new Date();
  // Simple synthetic generator with small noise
  const temperature = 60 + Math.random() * 10; // Celsius
  const vibration = 2 + Math.random() * 1; // mm/s
  const pressure = 5 + Math.random() * 0.5; // bar
  const current = 100 + Math.random() * 15; // A

  return res.json({
    timestamp: now.toISOString(),
    temperature: Number(temperature.toFixed(2)),
    vibration: Number(vibration.toFixed(2)),
    pressure: Number(pressure.toFixed(2)),
    current: Number(current.toFixed(2))
  });
};
