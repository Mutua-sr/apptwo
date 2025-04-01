import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import {
  Assessment as ReportIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  Description as ExcelIcon
} from '@mui/icons-material';
import reportService, { ReportOptions } from '../../services/reportService';

const AdminDashboard: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [reportType, setReportType] = useState<'users' | 'classrooms' | 'communities' | 'activities'>('users');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'csv' | 'excel'>('pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportTypes = [
    { value: 'users', label: 'Users Report', description: 'User registration and activity statistics' },
    { value: 'classrooms', label: 'Classrooms Report', description: 'Classroom participation and engagement metrics' },
    { value: 'communities', label: 'Communities Report', description: 'Community growth and interaction data' },
    { value: 'activities', label: 'Activities Report', description: 'User actions and system events log' }
  ];

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const options: ReportOptions = {
        type: reportType,
        format: reportFormat,
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          end: new Date()
        }
      };
      
      const blob = await reportService.generateReport(options);
      const fileName = `${reportType}-report.${reportFormat}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setOpenDialog(false);
    } catch (err) {
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Reports Dashboard
      </Typography>

      <Grid container spacing={3}>
        {reportTypes.map((type) => (
          <Grid item xs={12} sm={6} md={3} key={type.value}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <Stack spacing={1}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReportIcon color="primary" />
                  {type.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {type.description}
                </Typography>
              </Stack>
              <Box sx={{ mt: 'auto', pt: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    setReportType(type.value as any);
                    setOpenDialog(true);
                  }}
                >
                  Generate Report
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Report Generation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Generate {reportTypes.find(t => t.value === reportType)?.label}</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
            {reportTypes.find(t => t.value === reportType)?.description}
          </Typography>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Format</InputLabel>
            <Select
              value={reportFormat}
              label="Format"
              onChange={(e) => setReportFormat(e.target.value as any)}
            >
              <MenuItem value="pdf">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PdfIcon /> PDF Format
                </Box>
              </MenuItem>
              <MenuItem value="csv">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CsvIcon /> CSV Format
                </Box>
              </MenuItem>
              <MenuItem value="excel">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ExcelIcon /> Excel Format
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Report will include data from the last 30 days
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleGenerateReport}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
          >
            {loading ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;