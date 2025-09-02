import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Button } from '@mui/material';
import { Download } from '@mui/icons-material';
import { useApi } from '../hooks/useApi';

const ReportsPage = () => {
  const { data: reports, isLoading } = useApi('/api/reports');

  return (
    <Box>
      <Typography variant="h4" color="inherit">Compliance Reports</Typography>
      <Paper sx={{ width: '100%', mt: 2, bgcolor: '#2D3748' }}>
        <TableContainer>
          <Table>
            <TableHead><TableRow>{['Report Name', 'Generated On', 'Action'].map(h => <TableCell key={h} sx={{ color: '#A0AEC0' }} align={h === 'Action' ? 'center' : 'left'}>{h}</TableCell>)}</TableRow></TableHead>
            <TableBody>
              {isLoading ? ( <TableRow><TableCell colSpan={3} align="center"><CircularProgress /></TableCell></TableRow> )
               : reports.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ color: '#F7FAFC' }}>{row.name}</TableCell>
                    <TableCell sx={{ color: '#F7FAFC' }}>{new Date(row.generated_on).toLocaleString('en-IN')}</TableCell>
                    <TableCell align="center"><Button variant="outlined" startIcon={<Download />} size="small" disabled>Download</Button></TableCell>
                  </TableRow> ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
export default ReportsPage;