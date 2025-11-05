# Tata Power - Predictive Maintenance Dashboard

## Quick Deploy to Vercel

This project is ready for Vercel deployment. The Next.js app is in the `next-app/` folder.

### Automatic Deployment
1. Push to GitHub
2. Vercel will auto-detect and deploy
3. The `vercel.json` configures the build to use `next-app/`

### Manual Deployment
If auto-detection fails, set in Vercel:
- **Root Directory**: `next-app`
- **Framework Preset**: Next.js
- **Build Command**: `npm ci && npm run build`
- **Output Directory**: `.next`

### Environment Variables (Optional)
Set these in Vercel for full functionality:
- `NEXTAUTH_SECRET` - Any random string
- `NEXTAUTH_URL` - Your Vercel app URL
- `POSTGRES_URL` - Vercel Postgres connection string (optional)

### First Visit
After deployment, visit your Vercel URL to see the dashboard.
