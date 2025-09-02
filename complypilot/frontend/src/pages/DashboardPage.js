import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Modal, CircularProgress, TextField, Divider, Select, MenuItem, FormControl } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useApi } from '../hooks/useApi';

const DashboardPage = () => {
  // THIS IS THE FIX: We use our robust useApi hook for BOTH data sources.
  const { data: alerts, isLoading: isLoadingAlerts, fetchData: fetchAlerts } = useApi('/api/alerts');
  const { data: summary, isLoading: isLoadingSummary, fetchData: fetchSummary } = useApi('/api/alerts/summary');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [watchlistReason, setWatchlistReason] = useState('');

  const { api } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleStatusChange = async (tradeId, newStatus) => {
    try {
      await api.put(`/api/alerts/${tradeId}`, { status: newStatus });
      showToast(`Alert #${tradeId} status updated successfully`, 'info');
      // After updating, we manually trigger a refresh of both data sources
      fetchAlerts();
      fetchSummary();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleAnalyzeAction = async (alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
    setModalTitle(`AI Analysis: Trade #${alert.id}`);
    setModalContent(<Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>);
    try {
      const res = await api.post('/api/analyze', alert);
      setModalContent(res.data.advice);
      setWatchlistReason(res.data.advice.split('\n')[1] || 'AI Recommended Review');
    } catch (err) {
      setModalContent("Failed to get AI analysis. Please ensure the LM Studio server is running.");
    }
  };

  const handleAddToWatchlist = async () => {
    if (!selectedAlert || !watchlistReason) {
      showToast('Please provide a reason for the watchlist.', 'warning');
      return;
    }
    try {
      await api.post('/api/watchlist', { client_id: selectedAlert.client_id, reason: watchlistReason });
      showToast(`Client ${selectedAlert.client_id} added to watchlist successfully!`, 'success');
      handleCloseModal();
      navigate('/watchlist');
    } catch (error) {
      showToast('Failed to add client to watchlist', 'error');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAlert(null);
    setWatchlistReason('');
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', md: 600 },
    bgcolor: '#2D3748',
    color: '#F7FAFC',
    border: '2px solid rgba(0,0,0,0.5)',
    boxShadow: 24,
    p: 4,
    borderRadius: '8px'
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#F7FAFC', fontWeight: 'bold' }}>
        Live Surveillance Dashboard
      </Typography>

      {/* --- THIS SECTION IS NOW FIXED --- */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2, my: 3 }}>
          <Paper sx={{ p: 2, bgcolor: '#2D3748', border: '1px solid #4A5568' }}>
              <Typography variant="h5" component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
                {isLoadingSummary ? '...' : summary.total_alerts}
              </Typography>
              <Typography variant="body2" sx={{ color: '#A0AEC0' }}>Total Active Alerts</Typography>
          </Paper>
          <Paper sx={{ p: 2, bgcolor: '#2D3748', border: '1px solid #4A5568' }}>
              <Typography variant="h5" component="div" sx={{ color: '#E53E3E', fontWeight: 'bold' }}>
                {isLoadingSummary ? '...' : summary.flagged}
              </Typography>
              <Typography variant="body2" sx={{ color: '#A0AEC0' }}>Flagged (Critical)</Typography>
          </Paper>
          <Paper sx={{ p: 2, bgcolor: '#2D3748', border: '1px solid #4A5568' }}>
              <Typography variant="h5" component="div" sx={{ color: '#DD6B20', fontWeight: 'bold' }}>
                {isLoadingSummary ? '...' : summary.in_review}
              </Typography>
              <Typography variant="body2" sx={{ color: '#A0AEC0' }}>In Review</Typography>
          </Paper>
          <Paper sx={{ p: 2, bgcolor: '#2D3748', border: '1px solid #4A5568' }}>
              <Typography variant="h5" component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
                {isLoadingSummary ? '...' : summary.high_risk_clients}
              </Typography>
              <Typography variant="body2" sx={{ color: '#A0AEC0' }}>Clients on Watchlist</Typography>
          </Paper>
      </Box>

      <Paper sx={{ width: '100%', bgcolor: '#2D3748' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Client ID', 'PAN', 'Symbol', 'Volume', 'Value (₹)', 'Status', 'Action'].map(h => (
                  <TableCell key={h} sx={{ color: '#A0AEC0', borderBottomColor: 'rgba(255, 255, 255, 0.12)' }} align={['Volume', 'Value (₹)'].includes(h) ? 'right' : 'left'}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingAlerts ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, border: 'none' }}><CircularProgress /></TableCell></TableRow>
              ) : alerts.length > 0 ? (
                alerts.map((row) => (
                  <TableRow key={row.id} hover sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.04)' } }}>
                    <TableCell sx={{ color: '#F7FAFC', borderBottomColor: 'rgba(255, 255, 255, 0.12)' }}>{row.client_id}</TableCell>
                    <TableCell sx={{ color: '#F7FAFC', borderBottomColor: 'rgba(255, 255, 255, 0.12)' }}>{row.pan}</TableCell>
                    <TableCell sx={{ color: '#F7FAFC', borderBottomColor: 'rgba(255, 255, 255, 0.12)' }}>{row.symbol}</TableCell>
                    <TableCell align="right" sx={{ color: '#F7FAFC', borderBottomColor: 'rgba(255, 255, 255, 0.12)' }}>{row.volume.toLocaleString('en-IN')}</TableCell>
                    <TableCell align="right" sx={{ color: '#F7FAFC', borderBottomColor: 'rgba(255, 255, 255, 0.12)' }}>{row.value.toLocaleString('en-IN')}</TableCell>
                    <TableCell sx={{ borderBottomColor: 'rgba(255, 255, 255, 0.12)' }}>
                      <FormControl size="small" variant="standard" sx={{ m: 1, minWidth: 100 }}>
                        <Select
                          value={row.status}
                          onChange={(e) => handleStatusChange(row.id, e.target.value)}
                          sx={{ color: row.status === 'Flagged' ? '#E53E3E' : row.status === 'Review' ? '#DD6B20' : '#F7FAFC', fontSize: '0.875rem', '& .MuiSvgIcon-root': { color: '#A0AEC0' } }}
                        >
                          <MenuItem value="Normal">Normal</MenuItem>
                          <MenuItem value="Review">Review</MenuItem>
                          <MenuItem value="Flagged">Flagged</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottomColor: 'rgba(255, 255, 255, 0.12)' }}>
                      <Button variant="contained" size="small" onClick={() => handleAnalyzeAction(row)}>Analyze</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ color: '#A0AEC0', py: 10, border: 'none' }}>
                    No active alerts found. The system is clear.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">{modalTitle}</Typography>
          <Box sx={{ mt: 2, p: 2, maxHeight: '40vh', overflowY: 'auto', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1, '& h4': { fontSize: '1.1rem', my: 1, fontWeight: 'bold' }, '& ol': { pl: 2 }, '& li': { mb: 0.5 } }}>
            {typeof modalContent === 'string' ? <ReactMarkdown>{modalContent}</ReactMarkdown> : modalContent}
          </Box>
          <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.12)' }} />
          <Typography variant="subtitle1">Take Action</Typography>
          <TextField
            label="Reason for Watchlist" fullWidth margin="normal" variant="outlined" value={watchlistReason} onChange={(e) => setWatchlistReason(e.target.value)}
            sx={{ '& .MuiInputBase-root': { color: '#F7FAFC' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4A5568' }, '& .MuiFormLabel-root': { color: '#A0AEC0' } }}
          />
          <Button variant="contained" onClick={handleAddToWatchlist}>Add Client to Watchlist</Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default DashboardPage;