"use client";
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hello')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>Predictive Maintenance Dashboard</h1>
      <p>Status: {loading ? 'Loading...' : data ? 'Connected' : 'Error'}</p>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <div style={{ marginTop: 20 }}>
        <h2>Quick Links:</h2>
        <ul>
          <li><a href="/api/hello">API: Hello</a></li>
          <li><a href="/api/sensor-data">API: Sensor Data</a></li>
          <li><a href="/api/predict?temperature=72&vibration=3.2&pressure=5.3&current=116">API: Predict</a></li>
        </ul>
      </div>
    </div>
  );
}
