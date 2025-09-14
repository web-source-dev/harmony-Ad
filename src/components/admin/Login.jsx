import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const isAuthenticated = login(password);
    if (isAuthenticated) {
      // Redirect to the page they were trying to access, or to dashboard
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      setError('Invalid password');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            textAlign: 'center',
            boxShadow: 'none',
            border: '1px solid #000',
            borderRadius: '10px',
            backgroundColor: '#fff',
            color: '#000',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <LockIcon color="primary" sx={{ fontSize: 48, mb: 2 , color: '#000'}} />
            <Typography variant="h5" component="h1" gutterBottom>
              Admin Login
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your password to access the admin dashboard
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoFocus
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3 , backgroundColor: '#000', color: '#fff'}}
            >
              Login
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
