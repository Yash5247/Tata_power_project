"use client";
import Link from 'next/link';
import React from 'react';

type Props = { children: React.ReactNode };

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Predictive Maintenance Dashboard</div>
          <div className="flex gap-4 text-sm">
            <Link className="hover:text-sky-600" href="/">Home</Link>
            <Link className="hover:text-sky-600" href="#equipment">Equipment</Link>
            <Link className="hover:text-sky-600" href="#alerts">Alerts</Link>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}


