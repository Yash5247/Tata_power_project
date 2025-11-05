# Next.js (Vercel-ready) Predictive Maintenance Scaffold

## Stack
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- Axios + Recharts

## Structure
```
next-app/
  app/            # App Router pages & API
    api/
      hello/
      sensor-data/
      predictions/
  components/     # UI components
  lib/            # API clients, helpers
  public/         # Static assets
```

## Env
Create `.env.local` in next-app/ with:
```
NEXT_PUBLIC_API_BASE_URL=
POSTGRES_URL=
API_KEY=
```

## Scripts
```
npm run dev
npm run build
npm run start
npm run db:migrate
```


