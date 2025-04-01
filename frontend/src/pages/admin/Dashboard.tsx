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
  School as SchoolIcon,
  Group as GroupIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import apiService from '../../services/apiService';

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

interface DashboardStats {
  totalUsers: number;
  totalClassrooms: number;
  totalCommunities: number;
  totalMessages: number;
  activeUsers: number;
  pendingReports: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
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
            value={stats?.totalUsers || 0}
            icon={<PeopleIcon />}
            loading={loading}
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <StatCard
            title="Classrooms"
            value={stats?.totalClassrooms || 0}
            icon={<SchoolIcon />}
            loading={loading}
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <StatCard
            title="Communities"
            value={stats?.totalCommunities || 0}
            icon={<GroupIcon />}
            loading={loading}
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <StatCard
            title="Messages"
            value={stats?.totalMessages || 0}
            icon={<MessageIcon />}
            loading={loading}
          />
        </GridItem>
      </GridContainer>

      <GridContainer sx={{ mt: 3 }}>
        <GridItem xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Users
            </Typography>
            <Typography variant="h3">
              {loading ? <CircularProgress size={30} /> : stats?.activeUsers || 0}
            </Typography>
          </Paper>
        </GridItem>
        <GridItem xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Pending Reports
            </Typography>
            <Typography variant="h3" color={stats?.pendingReports ? 'error' : 'inherit'}>
              {loading ? <CircularProgress size={30} /> : stats?.pendingReports || 0}
            </Typography>
          </Paper>
        </GridItem>
      </GridContainer>
    </Box>
  );
};

export default Dashboard;