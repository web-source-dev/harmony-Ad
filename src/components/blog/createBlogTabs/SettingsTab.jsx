import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Chip,
  Grid,
  Paper,
  useTheme,
  RadioGroup,
  Radio,
  FormLabel,
  InputAdornment,
  Checkbox,
} from '@mui/material';
import { 
  Settings, 
  Schedule, 
  Language, 
  History,
  CalendarMonth,
  AccessTime
} from '@mui/icons-material';

const SettingsTab = ({
  isActive,
  setIsActive,
  status,
  setStatus,
  language,
  setLanguage,
  scheduledFor,
  setScheduledFor,
  revisions,
  wordCount,
  estimatedReadTime,
}) => {
  const theme = useTheme();
  const [showSchedule, setShowSchedule] = useState(!!scheduledFor);
  
  // Update showSchedule when status changes to scheduled
  React.useEffect(() => {
    if (status === 'scheduled') {
      setShowSchedule(true);
    }
  }, [status]);
  
  // Format date for the datetime-local input
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };
  
  // Handle schedule date change
  const handleScheduleChange = (e) => {
    setScheduledFor(e.target.value ? new Date(e.target.value) : null);
  };

  // Handle schedule checkbox change
  const handleScheduleCheckboxChange = (e) => {
    setShowSchedule(e.target.checked);
    if (e.target.checked) {
      setScheduledFor(null);
      setStatus('scheduled');
    } else {
      setScheduledFor(null);
      setStatus('draft');
    }
  };
  
  return (
    <Box>
      <Typography 
        variant="subtitle1" 
        sx={{ 
          mb: 3,
          fontWeight: 600,
          color: theme.palette.text.primary,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Settings fontSize="small" />
        Advanced Settings
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 3 }}>
              Publishing Settings
            </Typography>
            
            {/* Status Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel component="legend" sx={{ mb: 1, color: theme.palette.text.primary }}>Status</FormLabel>
              <RadioGroup
                row
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <FormControlLabel 
                  value="draft" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Draft
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="published" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Published
                      <Chip 
                        label="LIVE" 
                        size="small" 
                        sx={{ 
                          ml: 1, 
                          bgcolor: theme.palette.success.main,
                          color: 'white',
                          height: 20,
                          fontSize: '0.625rem'
                        }} 
                      />
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="archived" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Archived
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="scheduled" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Scheduled
                    </Box>
                  } 
                />
              </RadioGroup>
            </FormControl>
            
            {/* Schedule Checkbox and Input */}
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showSchedule}
                    onChange={handleScheduleCheckboxChange}
                    color="primary"
                  />
                }
                label={
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <Schedule fontSize="small" />
                    Schedule Publication
                  </Typography>
                }
              />
              
              {showSchedule && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="Publish Date & Time"
                    type="datetime-local"
                    value={formatDateForInput(scheduledFor)}
                    onChange={handleScheduleChange}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarMonth fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    If set, the post will automatically change to published status at the specified time.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <History fontSize="small" />
              Content Statistics
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: 3, 
                mb: 3,
                p: 2,
                borderRadius: '10px',
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.03)'
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span>Word Count</span>
                </Typography>
                <Typography variant="h5" fontWeight={500}>{wordCount}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTime fontSize="inherit" />
                  <span>Read Time</span>
                </Typography>
                <Typography variant="h5" fontWeight={500}>
                  {estimatedReadTime} {estimatedReadTime === 1 ? 'min' : 'mins'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsTab; 