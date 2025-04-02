import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Alert,
  CircularProgress,
  styled,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import apiService from '../../services/apiService';
import type { AdminSettings } from '../../types/admin';

const Section = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await apiService.admin.getSettings();
        setSettings(response.data.data);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await apiService.admin.updateSettings(settings);
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section: keyof AdminSettings, key: string, value: any) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    });
  };

  if (loading || !settings) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Settings</Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Section>
        <Typography variant="h6" gutterBottom>
          General Settings
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Site Name"
            value={settings.general.siteName}
            onChange={(e) => handleChange('general', 'siteName', e.target.value)}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.general.maintenanceMode}
                onChange={(e) =>
                  handleChange('general', 'maintenanceMode', e.target.checked)
                }
              />
            }
            label="Maintenance Mode"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.general.allowRegistration}
                onChange={(e) =>
                  handleChange('general', 'allowRegistration', e.target.checked)
                }
              />
            }
            label="Allow New Registrations"
          />
        </Box>
      </Section>

      <Section>
        <Typography variant="h6" gutterBottom>
          Security Settings
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Maximum Login Attempts"
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) =>
              handleChange('security', 'maxLoginAttempts', parseInt(e.target.value))
            }
            fullWidth
          />
          <TextField
            label="Session Timeout (minutes)"
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) =>
              handleChange('security', 'sessionTimeout', parseInt(e.target.value))
            }
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.security.requireEmailVerification}
                onChange={(e) =>
                  handleChange('security', 'requireEmailVerification', e.target.checked)
                }
              />
            }
            label="Require Email Verification"
          />
        </Box>
      </Section>

      <Section>
        <Typography variant="h6" gutterBottom>
          Content Settings
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.content.allowUserUploads}
                onChange={(e) =>
                  handleChange('content', 'allowUserUploads', e.target.checked)
                }
              />
            }
            label="Allow User Uploads"
          />
          <TextField
            label="Maximum Upload Size (MB)"
            type="number"
            value={settings.content.maxUploadSize}
            onChange={(e) =>
              handleChange('content', 'maxUploadSize', parseInt(e.target.value))
            }
            fullWidth
          />
          <TextField
            label="Allowed File Types (comma-separated)"
            value={settings.content.allowedFileTypes.join(', ')}
            onChange={(e) =>
              handleChange(
                'content',
                'allowedFileTypes',
                e.target.value.split(',').map((type) => type.trim())
              )
            }
            fullWidth
          />
        </Box>
      </Section>
    </Box>
  );
};

export default Settings;