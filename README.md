# Predictive Maintenance Dashboard

AI-powered monitoring system for energy infrastructure.

## Features

- Real-time equipment monitoring
- Predictive maintenance alerts
- Equipment health status tracking
- System status dashboard

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Vercel** - Deployment platform

## Getting Started

### Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Deployment

This project is configured for automatic deployment on Vercel.

1. Connect your GitHub repository to Vercel
2. Vercel will auto-detect Next.js
3. Deploy automatically on every push to `main`

### Vercel Settings

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: Leave empty (uses root)
- **Build Command**: `npm run build` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

## Project Structure

```
/
├── app/
│   ├── page.tsx          # Main dashboard page
│   ├── layout.tsx        # Root layout
│   └── api/
│       └── status/       # API endpoint
├── package.json
├── vercel.json           # Vercel configuration
└── tsconfig.json         # TypeScript configuration
```

## API Endpoints

- `GET /api/status` - Returns system status and equipment statistics

## License

MIT
