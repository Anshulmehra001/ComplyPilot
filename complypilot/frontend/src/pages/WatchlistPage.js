import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { useApi } from '../hooks/useApi';

const WatchlistPage = () => {
  // This now uses the clean, working, and restored useApi hook
  const { data: watchlist, isLoading } = useApi('/api/watchlist');

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#F7FAFC', fontWeight: 'bold' }}>
        Client Watchlist
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ color: '#A0AEC0' }}>
        Clients under special monitoring for compliance.
      </Typography>

      <Paper sx={{ width: '100%', mt: 3, bgcolor: '#2D3748' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#A0AEC0', borderBottomColor: 'rgba(255, 255, 255, 0.12)' }}>Client ID</TableCell>
                <TableCell sx={{ color: '#A0AEC0', borderBottomColor: 'rgba(255, 255, 255, 0.12)' }}>Reason for Watchlist</TableCell>
                <TableCell sx={{ color: '#A0AEC0', borderBottomColor: 'rgba(255, 255, 255, 0.12)' }}>Added By</TableCell>
                <TableCell sx={{ color: '#A0AEC0', borderBottomColor: 'rgba(255, 255, 255, 0.12)' }}>Added On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5, border: 'none' }}><CircularProgress /></TableCell></TableRow>
              ) : watchlist.length > 0 ? (
                watchlist.map((row) => (
                  <TableRow key={row.id} hover sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.04)' } }}>
                    <TableCell sx={{ color: '#F7FAFC', borderBottomColor: 'rgba(255, 255, 255, 0.12)' }}>{row.client_id}</TableCell>
                    <TableCell sx={{ color: '#F7FAFC', borderBottomColor: 'rgba(255, 255, 255, 0.12)', maxWidth: '400px' }}>{row.reason}</TableCell>
                    <TableCell sx={{ color: '#F7FAFC', borderBottomColor: 'rgba(255, 255, 255, 0.12)' }}>{row.added_by}</TableCell>
                    <TableCell sx={{ color: '#F7FAFC', borderBottomColor: 'rgba(255, 255, 255, 0.12)' }}>{new Date(row.added_on).toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ color: '#A0AEC0', py: 10, border: 'none' }}>
                    The watchlist is currently empty.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default WatchlistPage;