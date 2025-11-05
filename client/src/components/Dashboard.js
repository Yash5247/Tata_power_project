import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Paper,
  Divider,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Power as PowerIcon,
  AccountCircle as AccountIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  TrendingUp as TrendingUpIcon,
  Bolt as BoltIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [riskState, setRiskState] = useState({ risk: 0, status: 'healthy', message: 'Initializing...' });
  const [dashboardData, setDashboardData] = useState({
    connectionNumber: 'TPDL-2024-12345',
    connectionStatus: 'Active',
    connectionType: 'Residential',
    address: '123, Sample Street, Mumbai - 400001',
    currentBill: {
      amount: 2450.75,
      dueDate: '2024-02-15',
      status: 'Pending',
      consumption: '850 kWh',
    },
    lastPayment: {
      amount: 2300.50,
      date: '2024-01-10',
      status: 'Paid',
    },
    monthlyUsage: {
      current: 850,
      previous: 780,
      change: 8.97,
    },
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    let timerId;
    const token = localStorage.getItem('token');
    if (!token) return;

    const poll = async () => {
      try {
        const { data: metrics } = await axios.get('/api/sensor-data');
        setLiveMetrics(metrics);
        const { data: pred } = await axios.post('/api/predictions', metrics, {
          headers: { 'Content-Type': 'application/json' }
        });
        setRiskState(pred);
      } catch (e) {
        // Keep previous values; surface a soft error
      } finally {
        timerId = setTimeout(poll, 5000);
      }
    };
    poll();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Get user from localStorage first
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // Fetch dashboard data from API
      try {
        const response = await axios.get('/api/dashboard/data', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDashboardData(response.data);
        if (response.data.user) {
          setUser(response.data.user);
        }
      } catch (apiError) {
        // If API fails, use stored user data
        if (!storedUser) {
          setUser({ name: 'User', email: 'user@example.com' });
        }
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handlePayBill = () => {
    // Navigate to payment page or open payment modal
    alert('Payment functionality will be implemented soon');
  };

  const handleNewConnection = () => {
    navigate('/new-connection');
  };

  const handleViewBills = () => {
    alert('Bill history will be available soon');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Welcome back, {user?.name || 'User'}!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your Tata Power connection and services
          </Typography>
        </Box>
        <Box>
          <IconButton onClick={handleLogout} color="error" sx={{ mr: 1 }}>
            <LogoutIcon />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {(error || riskState?.status === 'warning' || riskState?.status === 'critical') && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error || `${riskState.message} (Risk: ${riskState.risk}%)`}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Connection Status Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PowerIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Connection Status</Typography>
                  <Chip
                    label={dashboardData.connectionStatus}
                    color="success"
                    size="small"
                    icon={<CheckCircleIcon />}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Connection Number
              </Typography>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {dashboardData.connectionNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                Connection Type
              </Typography>
              <Typography variant="body1">
                {dashboardData.connectionType}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {dashboardData.address}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Bill Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%', bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ReceiptIcon sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h6">Current Bill</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Due: {new Date(dashboardData.currentBill.dueDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                ₹{dashboardData.currentBill.amount.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                Consumption: {dashboardData.currentBill.consumption}
              </Typography>
              <Chip
                label={dashboardData.currentBill.status}
                color="warning"
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Button
                fullWidth
                variant="contained"
                sx={{
                  mt: 2,
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                }}
                onClick={handlePayBill}
              >
                Pay Now
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Usage Statistics Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Monthly Usage</Typography>
                  <Typography variant="body2" color="text.secondary">
                    This Month
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {dashboardData.monthlyUsage.current} kWh
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                  {dashboardData.monthlyUsage.change}% increase
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  vs last month
                </Typography>
              </Box>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<BoltIcon />}
                sx={{ mt: 2 }}
                onClick={handleViewBills}
              >
                View Usage History
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Metrics Card */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Live Equipment Health</Typography>
                <Chip
                  label={`Status: ${riskState.status.toUpperCase()} • Risk ${riskState.risk}%`}
                  color={riskState.status === 'critical' ? 'error' : riskState.status === 'warning' ? 'warning' : 'success'}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">Temperature</Typography>
                    <Typography variant="h6">{liveMetrics?.temperature ?? '--'} °C</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">Vibration</Typography>
                    <Typography variant="h6">{liveMetrics?.vibration ?? '--'} mm/s</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">Pressure</Typography>
                    <Typography variant="h6">{liveMetrics?.pressure ?? '--'} bar</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">Current</Typography>
                    <Typography variant="h6">{liveMetrics?.current ?? '--'} A</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ReceiptIcon />}
                    onClick={handleViewBills}
                    sx={{ py: 2 }}
                  >
                    View Bills
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PowerIcon />}
                    onClick={handleNewConnection}
                    sx={{ py: 2 }}
                  >
                    New Connection
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={() => navigate('/verify-mobile')}
                    sx={{ py: 2 }}
                  >
                    Service Request
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AccountIcon />}
                    onClick={() => alert('Profile settings coming soon')}
                    sx={{ py: 2 }}
                  >
                    Profile Settings
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Last Payment
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Amount Paid
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    ₹{dashboardData.lastPayment.amount.toLocaleString()}
                  </Typography>
                </Box>
                <Chip
                  label={dashboardData.lastPayment.status}
                  color="success"
                  size="small"
                  icon={<CheckCircleIcon />}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Paid on: {new Date(dashboardData.lastPayment.date).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {user?.name || 'N/A'}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {user?.email || 'N/A'}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => alert('Edit profile coming soon')}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
