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
import { CaptureSummary, CaptureDetail, Labels, PointCloudInfo, BrickInfo } from '../types/api';
import InfoSection from './InfoSection';
import { Dialog, DialogContent } from "@mui/material";
import PointCloudViewer from './PointCloudViewer';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

interface MainContentProps {
  date: string;
  capture: CaptureSummary;
  nextCapture: CaptureSummary | null;
  onLabelsUpdated: () => void;
  onNextCapture: () => void;
}

const parseBrickInfo = (text: string) => {
  const lines = text.split('\n');
  const info: any = {};
  lines.forEach(line => {
    const [key, value] = line.split(':').map(part => part.trim());
    if (key && value) {
      const formattedKey = key.toLowerCase().replace(/ /g, '_');
      info[formattedKey] = isNaN(Number(value)) ? value : Number(value);
    }
  });
  return info as BrickInfo;
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
  const [pointCloudSnapshotUrl, setGetPointCloudSnapshotUrl] = useState<string | null>(null);
  const [labels, setLabels] = useState<Labels>({
    validity: '',
    color: '',
    shape: '',
    markings: '',
    correctColor: false,
    correctShape: false
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [brickInfo, setBrickInfo] = useState<BrickInfo | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  useEffect(() => {
    loadCaptureDetail();
  }, [date, capture.capture_id]);

  const handleOpen = (url: string, label: string) => {
    setSelectedUrl(url);
    setSelectedLabel(label);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUrl(null);
    setSelectedLabel(null);
  };

  const loadCaptureDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const detail = await apiService.getCaptureDetail(date, capture.capture_id);
      const brickInfoText = await apiService.getBrickInfo(date, capture.capture_id);
      const mappingColor = await apiService.getColorMapping();

      // Parse and convert brickInfoText to BrickInfo object
      const parsedBrickInfo = parseBrickInfo(brickInfoText);
      // Change the value of color_prediction based on color mapping
      if (parsedBrickInfo.color_prediction && mappingColor[parsedBrickInfo.color_prediction]) {
        const colorId = parsedBrickInfo.color_prediction;
        const colorData = mappingColor[String(colorId)];
        // Extract name and RGB if it's an object
        if (typeof colorData === 'object' && colorData !== null) {
          if ('name' in colorData) {
            parsedBrickInfo.color_prediction = (colorData as { name: string }).name;
          }
          if ('rgb' in colorData) {
            parsedBrickInfo.color_rgb = (colorData as { rgb: number[] }).rgb;
          }
        } else {
          parsedBrickInfo.color_prediction = colorData ?? "Unknown color";
        }
      }
      setBrickInfo(parsedBrickInfo);

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
          const snapshotUrl = apiService.getPointCloudSnapshotUrl(date, capture.capture_id);
          setPointCloudInfo({ ...pcInfo });
          setGetPointCloudSnapshotUrl(snapshotUrl);
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

  const handleLabelChange = (field: keyof Labels, value: string | boolean) => {
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
      <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 10 }}>
              <Typography variant="h5" gutterBottom>
                Capture: {capture.capture_id}
              </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }} sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Date: {date}
                {capture.has_labels && (
                  <Chip label="Checked" color="success" size="small" sx={{ ml: 1 }} />
                )}
              </Typography>
          </Grid>
      </Grid>

      {saveMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {saveMessage}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Images and Point cloud*/}
        <Grid size={{ xs: 12, md: 8 }}>

          <Grid container spacing={3}>
            {/* Images Section */}
            <Grid size={{ xs: 12, md: 12 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Camera Images
                </Typography>
                <Grid container spacing={2}>
                  {imageUrls.map(({ cameraId, url }) => (
                    <Grid size={{ xs: 12, md: 6 }} key={cameraId}>
                      <Card>
                        <CardMedia
                          component="img"
                          image={url}
                          alt={`${cameraId} Image`}
                          sx={{ height: 130, objectFit: 'contain' }}
                          onClick={() => handleOpen(url, cameraId)}
                          style={{ cursor: 'pointer'  }}
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

              
            </Grid>

            {captureDetail.point_cloud_exists && (
              <Grid size={{ xs: 12, md: 12 }}>
                <Paper sx={{ p: 2, mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Point Cloud Information
                  </Typography>
                  {pointCloudInfo ? (
                    <Card>
                        <CardMedia
                          component="img"
                          image={pointCloudSnapshotUrl || ''}
                          alt={`Point cloud Image`}
                          sx={{ height: 200, objectFit: 'contain' }}
                          onClick={() => handleOpen(pointCloudSnapshotUrl || '', `Point cloud Image`)}
                          style={{ cursor: 'pointer'  }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.removeAttribute('style');
                          }}
                        />
                  </Card>)
                  : (
                    <Typography color="text.secondary">Loading point cloud info...</Typography>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Info and buttons*/}
        <Grid size={{ xs: 12, md: 4 }}>
          {brickInfo && (
              <Paper sx={{ p: 2, mt: 2 }}>
              <InfoSection capture={brickInfo} />
              </Paper>
          )}
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Validation
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      style={{ backgroundColor: '#e0e0e0', color: 'black' }}
                      onClick={handleSaveAndNext}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : (
                        <>
                          ✅ Color
                          <br />
                          ✅ Shape
                        </>
                      )}
                    </Button>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      style={{ backgroundColor: '#e0e0e0', color: 'black' }}
                      onClick={handleSaveAndNext}
                      disabled={saving || !nextCapture}
                    >
                      {saving ? 'Saving...' : (
                        <>
                          ✅ Color 
                          <br />
                          ❌ Shape
                        </>
                      )}
                    </Button>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      style={{ backgroundColor: '#e0e0e0', color: 'black' }}
                      onClick={handleSaveAndNext}
                      disabled={saving || !nextCapture}
                    >
                      {saving ? 'Saving...' : (
                        <>
                          ❌ Color
                          <br />
                          ✅ Shape'
                          </>
                        )}
                    </Button>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      style={{ backgroundColor: '#e0e0e0', color: 'black' }}
                      onClick={handleSaveAndNext}
                      disabled={saving || !nextCapture}
                    >
                      {saving ? 'Saving...' : (
                        <>
                        ❌ Color 
                        <br />
                        ❌ Shape
                        </>
                      )}
                    </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>  
        </Grid>

      </Grid>

      {/* Modal with zoomed image */}
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogContent
          sx={{
            backgroundColor: "black",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {selectedUrl && (
            <img
              src={selectedUrl}
              alt={selectedLabel ?? ""}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

    </Box>
  );
};

export default MainContent;