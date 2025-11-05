# Vercel Deployment Guide

This project has been configured for deployment on Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. MongoDB database (MongoDB Atlas recommended for production)
3. Node.js installed locally (for testing)

## Deployment Steps

### 1. Set up MongoDB

- Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
- Create a new cluster
- Get your connection string (MONGODB_URI)
- Whitelist IP addresses (0.0.0.0/0 for Vercel)

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts and set environment variables when asked

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: Leave as default
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install && cd client && npm install`

### 3. Set Environment Variables

In your Vercel project settings, add these environment variables:

- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A random secret key for JWT tokens
- `SESSION_SECRET` - A random secret key for sessions (optional)
- `NODE_ENV` - Set to `production`

### 4. Project Structure

```
├── api/              # Serverless functions
│   ├── auth/
│   │   ├── login.js
│   │   └── register.js
│   └── test.js
├── client/           # React frontend
│   ├── src/
│   └── package.json
├── models/           # MongoDB models
├── vercel.json       # Vercel configuration
└── package.json      # Root dependencies
```

## Important Notes

1. **File Uploads**: File uploads are stored as base64 in MongoDB (simplified for Vercel). For production, consider using cloud storage (AWS S3, Cloudinary, etc.)

2. **Database**: MongoDB connection is handled per serverless function. Connection pooling is handled automatically by Vercel.

3. **API Routes**: API routes are available at `/api/*` endpoints

4. **Frontend**: React app is served as static files with client-side routing

## Testing Locally

1. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   ```

2. Create `.env` file in root:
   ```env
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## Troubleshooting

- **Build fails**: Check that all dependencies are in `package.json`
- **API routes not working**: Verify `vercel.json` configuration
- **Database connection issues**: Check MongoDB Atlas IP whitelist
- **File upload errors**: Check file size limits (5MB)

## Next Steps

- Set up MongoDB Atlas for production database
- Configure Google OAuth (if needed)
- Set up cloud storage for file uploads
- Add error monitoring (Sentry, etc.)
- Set up custom domain

