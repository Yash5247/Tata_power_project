import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const Chart = dynamic(() => import('@/components/Chart'), { ssr: false, loading: () => <div className="skeleton-card" /> });

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
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="mb-2 text-sm text-slate-600">Lazy-loaded chart (code-splitting)</div>
          <Chart data={[{ name: 't0', value: 10 }, { name: 't1', value: 20 }]} />
        </div>
        <div className="card p-4">
          <div className="mb-2 text-sm text-slate-600">Optimized image</div>
          <Image src="/logo512.png" alt="Logo" width={128} height={128} />
        </div>
      </div>
    </main>
  );
}


