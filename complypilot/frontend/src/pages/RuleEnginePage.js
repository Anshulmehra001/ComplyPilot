import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, CardActions, Switch, TextField, Modal, CircularProgress, IconButton, Paper, Tooltip, Chip } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useApi } from '../hooks/useApi';

const modalStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', md: 500 }, bgcolor: '#2D3748', color: '#F7FAFC', border: '2px solid #000', boxShadow: 24, p: 4, '& .MuiTextField-root': { '& .MuiInputBase-root': { color: '#F7FAFC' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4A5568' }, '& .MuiFormLabel-root': { color: '#A0AEC0' } } };

const RuleEnginePage = () => {
  const { data: rules, isLoading, fetchData: fetchRules } = useApi('/api/rules');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const [ruleName, setRuleName] = useState('');
  const [ruleDesc, setRuleDesc] = useState('');
  const { api } = useAuth();
  const { showToast } = useToast();

  const handleOpenModal = (rule = null) => { setCurrentRule(rule); setRuleName(rule ? rule.name : ''); setRuleDesc(rule ? rule.description : ''); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setCurrentRule(null); setRuleName(''); setRuleDesc(''); };

  const handleSaveRule = async () => {
    const ruleData = { name: ruleName, description: ruleDesc };
    try {
      if (currentRule) { await api.put(`/api/rules/${currentRule.id}`, ruleData); showToast('Rule updated', 'success'); }
      else { await api.post('/api/rules', ruleData); showToast('New rule created', 'success'); }
      handleCloseModal(); fetchRules();
    } catch (err) { showToast('Failed to save rule', 'error'); }
  };

  const handleToggleActive = async (rule) => {
    try {
      await api.put(`/api/rules/${rule.id}`, { ...rule, is_active: !rule.is_active });
      showToast('Rule status changed', 'info');
      fetchRules();
    } catch (err) { showToast('Failed to toggle status', 'error'); }
  };

  const handleDeleteRule = async (ruleId) => {
    if (window.confirm("Are you sure?")) {
      try { await api.delete(`/api/rules/${ruleId}`); showToast('Rule deleted', 'warning'); fetchRules(); }
      catch (err) { showToast('Failed to delete rule', 'error'); }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" color="inherit">Rule Engine Management</Typography>
        <Button variant="contained" onClick={() => handleOpenModal()}>+ Add New Rule</Button>
      </Box>
      {isLoading ? ( <CircularProgress /> )
       : rules.length > 0 ? (
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
          {rules.map(rule => (
            <Card key={rule.id} sx={{ bgcolor: '#2D3748', color: '#F7FAFC' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="h6">{rule.name}</Typography><Chip label={rule.rule_type} size="small" /></Box>
                <Typography sx={{ color: '#A0AEC0', mt: 1 }}>{rule.description}</Typography>
                <Box sx={{ mt: 2 }}><Typography>Threshold: <Typography component="span" sx={{ fontWeight: 'bold' }}>{rule.threshold.toLocaleString('en-IN')}</Typography></Typography></Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', p: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}><Typography>Active</Typography><Switch checked={rule.is_active} onChange={() => handleToggleActive(rule)} /></Box>
                <Box><Tooltip title="Delete Rule"><IconButton onClick={() => handleDeleteRule(rule.id)}><Delete sx={{ color: '#E53E3E' }} /></IconButton></Tooltip></Box>
              </CardActions>
            </Card>
          ))}
        </Box> )
       : ( <Paper sx={{ p: 4, textAlign: 'center' }}><Typography variant="h6">No rules found.</Typography></Paper> )}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6">{currentRule ? 'Edit Rule' : 'Add New Rule'}</Typography>
          <TextField label="Rule Name" fullWidth margin="normal" value={ruleName} onChange={(e) => setRuleName(e.target.value)} />
          <TextField label="Description" fullWidth margin="normal" multiline rows={3} value={ruleDesc} onChange={(e) => setRuleDesc(e.target.value)} />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleCloseModal}>Cancel</Button><Button variant="contained" onClick={handleSaveRule}>Save</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};
export default RuleEnginePage;