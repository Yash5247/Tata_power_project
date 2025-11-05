import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NewConnection = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    aadharNumber: '',
  });
  const [aadharFile, setAadharFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAadharFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        setError('Please upload a PDF, JPEG, or PNG file for Aadhar card');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Aadhar card file size should be less than 5MB');
        return;
      }
      setAadharFile(file);
      setError('');
    }
  };

  const handleSignatureFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('Please upload a JPEG or PNG file for signature');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Signature file size should be less than 2MB');
        return;
      }
      setSignatureFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate Aadhar number
    if (!/^\d{12}$/.test(formData.aadharNumber)) {
      setError('Please enter a valid 12-digit Aadhar number');
      setLoading(false);
      return;
    }

    if (!aadharFile || !signatureFile) {
      setError('Please upload both Aadhar card and signature');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('aadharNumber', formData.aadharNumber);
      formDataToSend.append('aadharDocument', aadharFile);
      formDataToSend.append('signatureDocument', signatureFile);

      // In a real application, this would send the data to your backend
      // For demo, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to TPADL website after successful submission
      window.location.href = 'https://www.tpadl.com/';
    } catch (err) {
      setError('Failed to submit application. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          marginBottom: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            New Connection Application
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Please fill in your details to apply for a new connection
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="aadharNumber"
                  label="Aadhar Card Number"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleChange}
                  inputProps={{ maxLength: 12 }}
                  helperText="Enter 12-digit Aadhar number"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <input
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    id="aadhar-file"
                    type="file"
                    onChange={handleAadharFileChange}
                  />
                  <label htmlFor="aadhar-file">
                    <Button
                      variant="outlined"
                      component="span"
                      fullWidth
                    >
                      Upload Aadhar Card Document
                    </Button>
                  </label>
                  {aadharFile && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected file: {aadharFile.name}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <input
                    accept=".jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    id="signature-file"
                    type="file"
                    onChange={handleSignatureFileChange}
                  />
                  <label htmlFor="signature-file">
                    <Button
                      variant="outlined"
                      component="span"
                      fullWidth
                    >
                      Upload Signature
                    </Button>
                  </label>
                  {signatureFile && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected file: {signatureFile.name}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Application'}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => window.location.href = 'https://www.tpadl.com/'}
            >
              Visit TPADL Website
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NewConnection; 