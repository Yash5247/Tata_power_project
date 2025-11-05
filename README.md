# Login System with Social Authentication

A full-stack login system with email/password and Google authentication.

## Features

- Email/Password authentication
- Google OAuth integration
- JWT-based authentication
- Protected routes
- Modern UI with Material-UI
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google OAuth credentials (for Google login)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd client
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Server Configuration
   PORT=5000

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/login-system

   # Security
   JWT_SECRET=your-super-secret-jwt-key
   SESSION_SECRET=your-super-secret-session-key

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # File Upload Configuration
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=5242880  # 5MB in bytes
   ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png
   ```

4. Set up Google OAuth:
   - Go to the Google Cloud Console
   - Create a new project
   - Enable the Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - http://localhost:5000/api/auth/google/callback
     - http://localhost:3000

## Running the Application

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd client
   npm start
   ```

3. Open http://localhost:3000 in your browser

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   └── App.js        # Main App component
├── models/                # MongoDB models
├── routes/               # Express routes
├── server.js            # Express server
└── package.json         # Project dependencies
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes
- Secure session handling
- CORS enabled
- Environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 