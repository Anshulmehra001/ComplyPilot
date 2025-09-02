import React, { useState } from 'react';
import {
Box, Typography, Paper, TextField, Button, Divider, Switch, FormControlLabel, Grid, Avatar
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
// Helper to get initials from email for the Avatar
const getInitials = (email) => {
if (!email) return '?';
const parts = email.split('@');
return parts[0].substring(0, 2).toUpperCase();
};
const SettingsPage = () => {
const { user } = useAuth();
const { showToast } = useToast();
// State for the Notification toggles
const [emailNotifications, setEmailNotifications] = useState(true);
const handleNotificationChange = (setter, value) => {
setter(value);
// Simulate an API call to save the preference
showToast('Notification settings have been saved successfully!', 'success');
};
const textFieldStyles = {
'& .MuiInputBase-root': { color: '#F7FAFC' },
'& .MuiOutlinedInput-notchedOutline': { borderColor: '#4A5568' },
'& .MuiFormLabel-root': { color: '#A0AEC0' },
};
return (
<Box>
<Typography variant="h4" gutterBottom sx={{ color: '#F7FAFC', fontWeight: 'bold' }}>
Settings & Preferences
</Typography>
<Grid container spacing={3} sx={{ mt: 1 }}>

    {/* --- LEFT COLUMN: User Profile & Notifications --- */}
    <Grid item xs={12} md={6}>
      <Paper sx={{ p: 3, bgcolor: '#2D3748', color: '#F7FAFC', height: '100%' }}>
        <Typography variant="h6" gutterBottom>User Profile</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: '#3182CE', width: 56, height: 56, fontSize: '1.5rem', mr: 2 }}>
            {getInitials(user)}
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Compliance Officer</Typography>
            <Typography variant="body2" sx={{ color: '#A0AEC0' }}>{user || 'loading...'}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.12)' }} />

        <Typography variant="h6" gutterBottom>Notifications</Typography>
        <Box>
          <FormControlLabel
            control={
              <Switch
                color="primary"
                checked={emailNotifications}
                onChange={(e) => handleNotificationChange(setEmailNotifications, e.target.checked)}
              />
            }
            label="Enable Email Notifications for Critical Alerts"
            sx={{ color: '#A0AEC0' }}
          />
          <Typography variant="caption" display="block" sx={{ color: '#A0AEC0', pl: 4 }}>
            Emails will be sent to your registered address.
          </Typography>
        </Box>
      </Paper>
    </Grid>

    {/* --- RIGHT COLUMN: Security & Application --- */}
    <Grid item xs={12} md={6}>
      <Paper sx={{ p: 3, bgcolor: '#2D3748', color: '#F7FAFC', height: '100%' }}>
        <Typography variant="h6" gutterBottom>Security</Typography>
        <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
          For security reasons, password changes and multi-factor authentication setup are handled by your system administrator. Please contact IT for assistance.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" disabled>Change Password</Button>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.12)' }} />

        <Typography variant="h6" gutterBottom>Application Preferences</Typography>
        <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
          Future settings, such as theme selection (Light/Dark), data retention policies, and API integrations, will be configured here.
        </Typography>
      </Paper>
    </Grid>

  </Grid>
</Box>
);
};
export default SettingsPage;