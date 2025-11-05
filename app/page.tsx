export default function HomePage() {
  return (
    <div style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>Predictive Maintenance Dashboard</h1>
      <p>Welcome! The website is deployed and working.</p>
      <div style={{ marginTop: 20 }}>
        <h2>API Endpoints:</h2>
        <ul>
          <li><a href="/api/hello">/api/hello</a></li>
          <li><a href="/api/sensor-data">/api/sensor-data</a></li>
        </ul>
      </div>
    </div>
  );
}
