const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('../../models/User');

// MongoDB Connection
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/login-system', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
  }
};

// Simplified multer for memory storage (Vercel-compatible)
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = async (req, res) => {
  // Connect to DB
  await connectDB();

  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Handle file upload
  upload.single('aadharDocument')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size should be less than 5MB' });
        }
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message });
    }

    try {
      const { email, password, name, aadharNumber } = req.body;
      
      // Validate required fields
      if (!email || !password || !name || !aadharNumber) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Validate Aadhar number format
      if (!/^\d{12}$/.test(aadharNumber)) {
        return res.status(400).json({ message: 'Invalid Aadhar number format' });
      }
      
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [
          { email },
          { aadharNumber }
        ]
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: existingUser.email === email ? 
            'Email already registered' : 
            'Aadhar number already registered' 
        });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Aadhar document is required' });
      }

      // Convert file to base64 for storage (simplified for Vercel)
      const fileBuffer = req.file.buffer;
      const base64File = fileBuffer.toString('base64');

      // Create new user
      const user = new User({
        email,
        password,
        name,
        aadharNumber,
        aadharDocument: {
          fileName: req.file.originalname,
          fileData: base64File,
          fileType: req.file.mimetype
        }
      });

      await user.save();

      // Generate JWT
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-jwt-secret',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: 'Error creating user', 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });
};
