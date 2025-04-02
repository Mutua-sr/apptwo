import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  styled,
} from '@mui/material';
import {
  People as PeopleIcon,
  Group as GroupIcon,
  Message as MessageIcon,
  Report as ReportIcon,
} from '@mui/icons-material';
import apiService from '../../services/apiService';
import type { AdminDashboardStats } from '../../types/api';

// Create styled components for Grid
const GridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  gridTemplateColumns: 'repeat(12, 1fr)',
}));

const GridItem = styled(Box)<{ xs?: number; sm?: number; md?: number }>(
  ({ theme, xs = 12, sm, md }) => ({
    gridColumn: `span ${xs}`,
    [theme.breakpoints.up('sm')]: {
      gridColumn: sm ? `span ${sm}` : undefined,
    },
    [theme.breakpoints.up('md')]: {
      gridColumn: md ? `span ${md}` : undefined,
    },
  })
);

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, loading }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ color: 'primary.main', mr: 2 }}>{icon}</Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      {loading ? (
        <CircularProgress size={20} />
      ) : (
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiService.admin.getDashboardStats();
        setStats(response.data.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <GridContainer>
        <GridItem xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats?.users.total || 0}
            icon={<PeopleIcon />}
            loading={loading}
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={stats?.users.active || 0}
            icon={<PeopleIcon />}
            loading={loading}
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <StatCard
            title="Communities"
            value={stats?.content.communities || 0}
            icon={<GroupIcon />}
            loading={loading}
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <StatCard
            title="Total Posts"
            value={stats?.content.posts || 0}
            icon={<MessageIcon />}
            loading={loading}
          />
        </GridItem>
      </GridContainer>

      <GridContainer sx={{ mt: 3 }}>
        <GridItem xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Daily Active Users
            </Typography>
            <Typography variant="h3">
              {loading ? <CircularProgress size={30} /> : stats?.engagement.dailyActiveUsers || 0}
            </Typography>
          </Paper>
        </GridItem>
        <GridItem xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Reports
            </Typography>
            <Typography variant="h3" color={stats?.content.reports.total ? 'error' : 'inherit'}>
              {loading ? <CircularProgress size={30} /> : stats?.content.reports.total || 0}
            </Typography>
          </Paper>
        </GridItem>
      </GridContainer>
    </Box>
  );
};

export default Dashboard;