import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardMedia,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Save as SaveIcon, NavigateNext as NextIcon } from '@mui/icons-material';
import { apiService } from '../services/api';
import { CaptureSummary, CaptureDetail, Labels, PointCloudInfo } from '../types/api';

interface MainContentProps {
  date: string;
  capture: CaptureSummary;
  nextCapture: CaptureSummary | null;
  onLabelsUpdated: () => void;
  onNextCapture: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  date,
  capture,
  nextCapture,
  onLabelsUpdated,
  onNextCapture,
}) => {
  const [captureDetail, setCaptureDetail] = useState<CaptureDetail | null>(null);
  const [pointCloudInfo, setPointCloudInfo] = useState<PointCloudInfo | null>(null);
  const [labels, setLabels] = useState<Labels>({
    validity: '',
    color: '',
    shape: '',
    markings: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    loadCaptureDetail();
  }, [date, capture.capture_id]);

  const loadCaptureDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const detail = await apiService.getCaptureDetail(date, capture.capture_id);
      setCaptureDetail(detail);
      
      // Load existing labels if they exist
      if (detail.manifest?.labels) {
        setLabels({
          validity: detail.manifest.labels.validity || '',
          color: detail.manifest.labels.color || '',
          shape: detail.manifest.labels.shape || '',
          markings: detail.manifest.labels.markings || '',
        });
      } else {
        // Reset labels for new capture
        setLabels({
          validity: '',
          color: '',
          shape: '',
          markings: '',
        });
      }
      
      // Load point cloud info if it exists
      if (detail.point_cloud_exists) {
        try {
          const pcInfo = await apiService.getPointCloudInfo(date, capture.capture_id);
          setPointCloudInfo(pcInfo);
        } catch (pcError) {
          console.warn('Failed to load point cloud info:', pcError);
          setPointCloudInfo({ exists: true });
        }
      } else {
        setPointCloudInfo(null);
      }
    } catch (err) {
      setError(`Failed to load capture detail: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLabelChange = (field: keyof Labels, value: string) => {
    setLabels(prev => ({ ...prev, [field]: value }));
    setSaveMessage(null); // Clear save message when editing
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      
      await apiService.updateLabels(date, capture.capture_id, labels);
      setSaveMessage('Labels saved successfully!');
      onLabelsUpdated();
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setError(`Failed to save labels: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async () => {
    await handleSave();
    if (nextCapture) {
      onNextCapture();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!captureDetail) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No capture detail available</Typography>
      </Box>
    );
  }

  const imageUrls = Object.entries(captureDetail.images).map(([cameraId, url]) => ({
    cameraId,
    url: apiService.getImageUrl(date, capture.capture_id, cameraId),
  }));

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Capture: {capture.capture_id}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Date: {date}
        {capture.has_labels && (
          <Chip label="Labeled" color="success" size="small" sx={{ ml: 1 }} />
        )}
      </Typography>

      {saveMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {saveMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Images Section */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Camera Images
            </Typography>
            <Grid container spacing={2}>
              {imageUrls.map(({ cameraId, url }) => (
                <Grid size={{ xs: 12, md: 4 }} key={cameraId}>
                  <Card>
                    <CardMedia
                      component="img"
                      image={url}
                      alt={`${cameraId} Image`}
                      sx={{ height: 200, objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.removeAttribute('style');
                      }}
                    />
                    <Box
                      sx={{
                        height: 200,
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.200',
                      }}
                    >
                      <Typography color="text.secondary">Image not available</Typography>
                    </Box>
                    <CardContent>
                      <Typography variant="subtitle2">{cameraId}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Point Cloud Section */}
          {captureDetail.point_cloud_exists && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Point Cloud Information
              </Typography>
              {pointCloudInfo ? (
                <Box>
                  <Typography variant="body2">
                    Status: <Chip label="Available" color="success" size="small" />
                  </Typography>
                  {pointCloudInfo.num_points !== undefined && (
                    <Typography variant="body2">
                      Points: {pointCloudInfo.num_points?.toLocaleString()}
                    </Typography>
                  )}
                  {pointCloudInfo.file_size !== undefined && (
                    <Typography variant="body2">
                      File Size: {(pointCloudInfo.file_size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography color="text.secondary">Loading point cloud info...</Typography>
              )}
            </Paper>
          )}
        </Grid>
     
      </Grid>
    </Box>
  );
};

export default MainContent;