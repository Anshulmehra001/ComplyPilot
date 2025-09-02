import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const ToastNotification = ({ open, message, severity, handleClose }) => {
    return (
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }} variant="filled">
                {message}
            </Alert>
        </Snackbar>
    );
};
export default ToastNotification;