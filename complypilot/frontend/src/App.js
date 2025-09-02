import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RuleEnginePage from './pages/RuleEnginePage';
import WatchlistPage from './pages/WatchlistPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import { Box, CssBaseline, Toolbar } from '@mui/material';

const MainLayout = ({ children }) => {
  const location = useLocation();
  if (location.pathname === '/login') {
    return (
      <Box sx={{ bgcolor: '#1A202C', minHeight: '100vh' }}>
        <CssBaseline />
        {children}
      </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: 'calc(100% - 240px)',
          bgcolor: '#1A202C',
          minHeight: '100vh',
          color: '#F7FAFC'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={ <ProtectedRoute> <DashboardPage /> </ProtectedRoute> } />
        <Route path="/rules" element={ <ProtectedRoute> <RuleEnginePage /> </ProtectedRoute> } />
        <Route path="/watchlist" element={ <ProtectedRoute> <WatchlistPage /> </ProtectedRoute> } />
        <Route path="/reports" element={ <ProtectedRoute> <ReportsPage /> </ProtectedRoute> } />
        <Route path="/settings" element={ <ProtectedRoute> <SettingsPage /> </ProtectedRoute> } />
      </Routes>
    </MainLayout>
  );
}
export default App;