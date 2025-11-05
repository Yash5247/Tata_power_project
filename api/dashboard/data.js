const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
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

module.exports = async (req, res) => {
  // Connect to DB
  await connectDB();

  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate connection number based on user ID
    const connectionNumber = `TPDL-2024-${user._id.toString().slice(-5)}`;

    // Mock dashboard data (in production, this would come from actual billing/usage database)
    const dashboardData = {
      connectionNumber,
      connectionStatus: 'Active',
      connectionType: 'Residential',
      address: '123, Sample Street, Mumbai - 400001', // This could be stored in user profile
      currentBill: {
        amount: 2450.75,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
        status: 'Pending',
        consumption: '850 kWh',
        billNumber: `BILL-${Date.now()}`,
      },
      lastPayment: {
        amount: 2300.50,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
        status: 'Paid',
        transactionId: `TXN-${Date.now() - 30 * 24 * 60 * 60 * 1000}`,
      },
      monthlyUsage: {
        current: 850,
        previous: 780,
        change: 8.97,
        unit: 'kWh',
      },
      user: {
        name: user.name,
        email: user.email,
      },
    };

    res.json(dashboardData);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Dashboard data error:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard data', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

