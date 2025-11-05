"use client";
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', { redirect: true, email, password, callbackUrl: '/' });
    if (res?.error) setError('Invalid credentials');
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg">
      <div className="w-full max-w-sm p-6 rounded-lg border bg-white dark:bg-dark-card dark:text-dark-text dark:border-dark-border shadow-card">
        <h1 className="text-lg font-semibold mb-4">Sign in</h1>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form className="space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="w-full rounded-md border px-3 py-2 dark:bg-slate-800 dark:border-slate-600" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input className="w-full rounded-md border px-3 py-2 dark:bg-slate-800 dark:border-slate-600" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button disabled={loading} className="btn btn-primary w-full" type="submit">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="mt-3 text-xs text-slate-500">
          <Link className="hover:underline" href="/">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}


