import React, { useState, useEffect } from 'react';
import {
  TablePagination,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import {
  Check as CheckIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import { Report } from '../../types/admin';
import { ApiResponse, PaginatedResponse } from '../../types/api';

const ContentModeration: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getReports({
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter === 'all' ? undefined : statusFilter as 'pending' | 'approved' | 'rejected',
      });

      if (response.data.success && response.data.data) {
        setReports(response.data.data.data);
        setTotalCount(response.data.data.meta.total);
      } else {
        setError('Failed to load reports: Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, rowsPerPage, statusFilter]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleActionReport = async (reportId: string, action: 'approve' | 'reject') => {
    try {
      await apiService.admin.handleReport(reportId, action);
      fetchReports();
    } catch (err) {
      console.error(`Error ${action}ing report:`, err);
      setError(`Failed to ${action} report`);
    }
  };

  if (loading && reports.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Content Moderation</Typography>
        <FormControl variant="outlined" style={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={handleStatusChange}
            label="Status"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report._id}>
                <TableCell>{report.type}</TableCell>
                <TableCell>{report.reason}</TableCell>
                <TableCell>{report.status}</TableCell>
                <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {report.status === 'pending' && (
                    <>
                      <IconButton
                        color="primary"
                        onClick={() => handleActionReport(report._id, 'approve')}
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleActionReport(report._id, 'reject')}
                      >
                        <ClearIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default ContentModeration;