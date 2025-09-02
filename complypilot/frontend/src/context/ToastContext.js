import React, { createContext, useState, useContext, useCallback } from 'react';
import ToastNotification from '../components/ToastNotification';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const showToast = useCallback((message, severity = 'success') => {
        setToast({ open: true, message, severity });
    }, []);
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setToast({ ...toast, open: false });
    };
    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastNotification open={toast.open} message={toast.message} severity={toast.severity} handleClose={handleClose} />
        </ToastContext.Provider>
    );
};