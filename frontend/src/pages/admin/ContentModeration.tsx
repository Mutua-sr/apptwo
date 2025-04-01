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

interface Report {
  _id: string;
  type: 'post' | 'comment' | 'message';
  content: string;
  reportedBy: {
    id: string;
    name: string;
  };
  reportedUser: {
    id: string;
    name: string;
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  roomId: string;
  roomType: 'classroom' | 'community';
}

interface ViewReportDialogProps {
  open: boolean;
  report: Report | null;
  onClose: () => void;
  onAction: (action: 'approve' | 'reject' | 'delete') => Promise<void>;
}

const ViewReportDialog: React.FC<ViewReportDialogProps> = ({
  open,
  report,
  onClose,
  onAction,
}) => {
  if (!report) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>View Report</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Typography variant="subtitle2">Type</Typography>
          <Typography>{report.type}</Typography>

          <Typography variant="subtitle2">Content</Typography>
          <Typography>{report.content}</Typography>

          <Typography variant="subtitle2">Reported By</Typography>
          <Typography>{report.reportedBy.name}</Typography>

          <Typography variant="subtitle2">Reported User</Typography>
          <Typography>{report.reportedUser.name}</Typography>

          <Typography variant="subtitle2">Reason</Typography>
          <Typography>{report.reason}</Typography>

          <Typography variant="subtitle2">Status</Typography>
          <Chip
            label={report.status}
            color={
              report.status === 'approved'
                ? 'success'
                : report.status === 'rejected'
                ? 'error'
                : 'warning'
            }
            size="small"
          />

          <Typography variant="subtitle2">Date</Typography>
          <Typography>
            {new Date(report.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {report.status === 'pending' && (
          <>
            <Button
              onClick={() => onAction('approve')}
              variant="contained"
              color="success"
              startIcon={<ApproveIcon />}
            >
              Approve
            </Button>
            <Button
              onClick={() => onAction('reject')}
              variant="contained"
              color="error"
              startIcon={<RejectIcon />}
            >
              Reject
            </Button>
          </>
        )}
        <Button
          onClick={() => onAction('delete')}
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
        >
          Delete Content
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ContentModeration: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getReports({
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setReports(response.data.data.reports);
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

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleView = (report: Report) => {
    setSelectedReport(report);
    setDialogOpen(true);
  };

  const handleAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (!selectedReport) return;

    try {
      switch (action) {
        case 'approve':
          await apiService.admin.updateReport(selectedReport._id, 'approved');
          break;
        case 'reject':
          await apiService.admin.updateReport(selectedReport._id, 'rejected');
          break;
        case 'delete':
          // Handle content deletion based on type
          // This would need to be implemented in the API
          break;
      }
      fetchReports();
      setDialogOpen(false);
      setSelectedReport(null);
    } catch (err) {
      console.error('Error handling report action:', err);
      setError('Failed to process action');
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Content Moderation</Typography>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Status Filter"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Reports</MenuItem>
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
              <TableCell>Content</TableCell>
              <TableCell>Reported By</TableCell>
              <TableCell>Reported User</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report._id}>
                  <TableCell>
                    <Chip label={report.type} size="small" />
                  </TableCell>
                  <TableCell>
                    {report.content.length > 50
                      ? `${report.content.substring(0, 50)}...`
                      : report.content}
                  </TableCell>
                  <TableCell>{report.reportedBy.name}</TableCell>
                  <TableCell>{report.reportedUser.name}</TableCell>
                  <TableCell>
                    {report.reason.length > 30
                      ? `${report.reason.substring(0, 30)}...`
                      : report.reason}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      color={
                        report.status === 'approved'
                          ? 'success'
                          : report.status === 'rejected'
                          ? 'error'
                          : 'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleView(report)} size="small">
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={reports.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <ViewReportDialog
        open={dialogOpen}
        report={selectedReport}
        onClose={() => {
          setDialogOpen(false);
          setSelectedReport(null);
        }}
        onAction={handleAction}
      />
    </Box>
  );
};

export default ContentModeration;