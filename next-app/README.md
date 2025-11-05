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
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

## Scripts
```
npm run dev
npm run build
npm run start
npm run db:migrate
```

## Deployment Optimization (Vercel)
- Build command: defined in vercel.json (`cd next-app && npm ci && npm run build`)
- Install command: `npm ci`
- Environment Variables: configure in Vercel (NEXTAUTH_SECRET, NEXTAUTH_URL, POSTGRES_URL, SENTRY_DSN, NEXT_PUBLIC_API_BASE_URL)
- GitHub: set up automatic deployments from main branch
- Error logging: set SENTRY_DSN and wire SDK (or use `lib/server/logger.ts` as lightweight fallback)
- Images: use Next.js `<Image />` for optimization (see `app/page.tsx` example)
- Code splitting: dynamic imports for charts (see `app/page.tsx`)
- Rate limiting: simple token-bucket in `lib/server/rateLimit.ts` applied to APIs
- Preview deployments: test PRs before merge to main
- Domain & SSL: configure in Vercel Project → Domains


