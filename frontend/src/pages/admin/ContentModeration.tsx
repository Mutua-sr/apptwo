import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Check as ApproveIcon,
  Block as RejectIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import { PaginatedResponse } from '../../types/api';
import { Report } from '../../types/admin';

interface ViewReportDialogProps {
  open: boolean;
  report: Report | null;
  onClose: () => void;
  onAction: (action: 'approve' | 'reject' | 'delete') => Promise<void>;
}

// Rest of the file content remains the same until fetchReports function

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

// Rest of the file content remains the same until TablePagination component

<TablePagination
  rowsPerPageOptions={[5, 10, 25]}
  component="div"
  count={totalCount}
  rowsPerPage={rowsPerPage}
  page={page}
  onPageChange={handleChangePage}
  onRowsPerPageChange={handleChangeRowsPerPage}
/>

// Rest of the file content remains the same