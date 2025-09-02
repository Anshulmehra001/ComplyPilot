import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@complypilot.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      showToast('Failed to login. Please check your credentials.', 'error');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#F7FAFC', mb: 2 }}>ComplyPilot</Typography>
      <Paper component="form" onSubmit={handleSubmit} sx={{ padding: 4, width: '100%', maxWidth: 400, bgcolor: '#2D3748', color: '#F7FAFC', '& .MuiTextField-root': { '& .MuiInputBase-root': { color: '#F7FAFC' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4A5568' }, '& .MuiFormLabel-root': { color: '#A0AEC0' } } }}>
        <Typography variant="h5" align="center">Login</Typography>
        <TextField label="Email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 2, bgcolor: '#3182CE' }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
        </Button>
      </Paper>
    </Box>
  );
};
export default LoginPage;