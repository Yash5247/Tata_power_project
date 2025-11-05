export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Predictive Maintenance Dashboard</title>
        <meta name="description" content="AI-powered predictive maintenance for energy infrastructure" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
