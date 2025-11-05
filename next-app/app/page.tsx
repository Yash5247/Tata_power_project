import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Predictive Maintenance</h1>
      <p style={{ color: '#555', marginBottom: 24 }}>
        Fresh Next.js app. This will deploy cleanly on Vercel.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/api/hello">API: Hello</Link>
        <Link href="/api/sensor-data">API: Sensor Data</Link>
        <Link href="/api/predictions">API: Predictions</Link>
      </div>
    </main>
  );
}


