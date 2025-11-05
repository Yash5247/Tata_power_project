# Quick Deployment Guide for Vercel

## Step 1: Environment Variables

Before deploying, set these environment variables in Vercel:

1. Go to your Vercel project → Settings → Environment Variables
2. Add these variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-random-secret-key-here
NODE_ENV=production
```

## Step 2: Deploy

### Option A: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Vercel will auto-detect the configuration

### Option B: Vercel CLI
```bash
npm i -g vercel
vercel
```

## What Changed?

✅ Express server converted to Vercel serverless functions in `api/` folder
✅ Frontend API calls updated to use relative paths (`/api/...`)
✅ File uploads simplified (stored as base64 in MongoDB)
✅ `vercel.json` configured for React + API routes
✅ React app set to build from `client/` directory

## File Structure

```
├── api/              # Serverless API functions
│   ├── auth/
│   │   ├── login.js
│   │   └── register.js
│   └── test.js
├── client/           # React frontend
├── models/           # MongoDB models
└── vercel.json       # Vercel config
```

## Testing

After deployment, test these endpoints:
- `https://your-app.vercel.app/api/test` - Should return `{"message": "API is working!"}`
- `https://your-app.vercel.app/` - Should show your React app

## Notes

- File uploads are stored as base64 in MongoDB (simplified for Vercel)
- For production, consider using cloud storage (AWS S3, Cloudinary)
- MongoDB connection is handled per serverless function
- Make sure MongoDB Atlas allows connections from Vercel IPs (whitelist 0.0.0.0/0)

