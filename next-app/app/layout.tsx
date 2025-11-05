export const metadata = {
  title: 'Tata Power - Predictive Maintenance',
  description: 'Live demo dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-dark-bg dark:text-dark-text">
        {children}
      </body>
    </html>
  );
}


