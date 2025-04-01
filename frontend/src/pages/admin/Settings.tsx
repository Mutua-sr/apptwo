import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  styled,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import apiService from '../../services/apiService';

const Section = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

interface AppSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
  };
  chat: {
    maxMessageLength: number;
    allowFileSharing: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  moderation: {
    enableAutoModeration: boolean;
    profanityFilter: boolean;
    spamProtection: boolean;
    reportThreshold: number;
  };
  notifications: {
    enableEmailNotifications: boolean;
    enablePushNotifications: boolean;
    digestFrequency: 'daily' | 'weekly' | 'never';
  };
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
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

  const handleChange = (section: keyof AppSettings, key: string, value: any) => {
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
          <TextField
            label="Site Description"
            value={settings.general.siteDescription}
            onChange={(e) =>
              handleChange('general', 'siteDescription', e.target.value)
            }
            multiline
            rows={2}
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
          Chat Settings
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Maximum Message Length"
            type="number"
            value={settings.chat.maxMessageLength}
            onChange={(e) =>
              handleChange('chat', 'maxMessageLength', parseInt(e.target.value))
            }
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.chat.allowFileSharing}
                onChange={(e) =>
                  handleChange('chat', 'allowFileSharing', e.target.checked)
                }
              />
            }
            label="Allow File Sharing"
          />
          <TextField
            label="Maximum File Size (MB)"
            type="number"
            value={settings.chat.maxFileSize}
            onChange={(e) =>
              handleChange('chat', 'maxFileSize', parseInt(e.target.value))
            }
            fullWidth
          />
          <TextField
            label="Allowed File Types (comma-separated)"
            value={settings.chat.allowedFileTypes.join(', ')}
            onChange={(e) =>
              handleChange(
                'chat',
                'allowedFileTypes',
                e.target.value.split(',').map((type) => type.trim())
              )
            }
            fullWidth
          />
        </Box>
      </Section>

      <Section>
        <Typography variant="h6" gutterBottom>
          Moderation Settings
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.moderation.enableAutoModeration}
                onChange={(e) =>
                  handleChange(
                    'moderation',
                    'enableAutoModeration',
                    e.target.checked
                  )
                }
              />
            }
            label="Enable Auto-Moderation"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.moderation.profanityFilter}
                onChange={(e) =>
                  handleChange('moderation', 'profanityFilter', e.target.checked)
                }
              />
            }
            label="Profanity Filter"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.moderation.spamProtection}
                onChange={(e) =>
                  handleChange('moderation', 'spamProtection', e.target.checked)
                }
              />
            }
            label="Spam Protection"
          />
          <TextField
            label="Report Threshold"
            type="number"
            value={settings.moderation.reportThreshold}
            onChange={(e) =>
              handleChange(
                'moderation',
                'reportThreshold',
                parseInt(e.target.value)
              )
            }
            helperText="Number of reports before content is automatically hidden"
            fullWidth
          />
        </Box>
      </Section>

      <Section>
        <Typography variant="h6" gutterBottom>
          Notification Settings
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications.enableEmailNotifications}
                onChange={(e) =>
                  handleChange(
                    'notifications',
                    'enableEmailNotifications',
                    e.target.checked
                  )
                }
              />
            }
            label="Enable Email Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications.enablePushNotifications}
                onChange={(e) =>
                  handleChange(
                    'notifications',
                    'enablePushNotifications',
                    e.target.checked
                  )
                }
              />
            }
            label="Enable Push Notifications"
          />
          <TextField
            select
            label="Digest Frequency"
            value={settings.notifications.digestFrequency}
            onChange={(e) =>
              handleChange(
                'notifications',
                'digestFrequency',
                e.target.value as 'daily' | 'weekly' | 'never'
              )
            }
            fullWidth
            SelectProps={{
              native: true,
            }}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="never">Never</option>
          </TextField>
        </Box>
      </Section>
    </Box>
  );
};

export default Settings;