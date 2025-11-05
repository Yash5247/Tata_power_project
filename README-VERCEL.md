# Vercel Deployment Instructions

## Root Directory Setting

In Vercel Dashboard:
1. Go to **Settings** → **General**
2. Find **Root Directory** field
3. Set it to: **(empty)** or just `.` (without the quotes)
4. **DO NOT** use `./` or `../` or any special characters
5. Save settings
6. Redeploy

## Current Structure

The Next.js app is at the **root level**:
```
/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── api/
├── package.json
├── next.config.js
└── tsconfig.json
```

The `next-app/` folder should be **ignored** by Vercel (it's in `.vercelignore`).

