import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { apiService } from '../services/api';
import { CaptureSummary } from '../types/api';
import MainContent from './MainContent';
import FilterSection from './FilterSection';

const DRAWER_WIDTH = 320;

const BRSApp: React.FC = () => {
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [captures, setCaptures] = useState<CaptureSummary[]>([]);
  const [selectedCapture, setSelectedCapture] = useState<CaptureSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dates on component mount
  useEffect(() => {
    loadDates();
  }, []);

  // Load captures when date changes
  useEffect(() => {
    if (selectedDate) {
      loadCaptures(selectedDate);
    }
  }, [selectedDate]);

  const loadDates = async () => {
    try {
      setLoading(true);
      const dateList = await apiService.getDates();
      setDates(dateList);
      if (dateList.length > 0 && !selectedDate) {
        setSelectedDate(dateList[0]); // Select most recent date
      }
    } catch (err) {
      setError(`Failed to load dates: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const loadCaptures = async (date: string) => {
    try {
      setLoading(true);
      const captureList = await apiService.getCaptures(date);
      setCaptures(captureList);
      setSelectedCapture(null); // Clear selected capture
    } catch (err) {
      setError(`Failed to load captures for ${date}: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedCapture(null);
  };

  const handleCaptureSelect = (capture: CaptureSummary) => {
    setSelectedCapture(capture);
  };

  const handleLabelsUpdated = () => {
    // Refresh the captures list to update label status
    if (selectedDate) {
      loadCaptures(selectedDate);
    }
  };

  const getNextCapture = (): CaptureSummary | null => {
    if (!selectedCapture || captures.length === 0) return null;
    const currentIndex = captures.findIndex(c => c.capture_id === selectedCapture.capture_id);
    return currentIndex < captures.length - 1 ? captures[currentIndex + 1] : null;
  };

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" component="h1">
            BRS Labelling Tool
          </Typography>
        </Box>
        <Divider />

        {error && (
          <Alert severity="error" sx={{ m: 1 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Filter Section */   }
        <FilterSection
          dates={dates}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />

        <Divider />

        {/* Captures List */}
        <Box sx={{ p: 1, flexGrow: 1, overflow: 'auto' }}>
          <Typography variant="subtitle2" sx={{ px: 1, py: 1, fontWeight: 'bold' }}>
            Captures {selectedDate && `(${captures.length})`}
          </Typography>
          <List dense>
            {captures.map((capture) => (
              <ListItem key={capture.capture_id} disablePadding>
                <ListItemButton
                  selected={selectedCapture?.capture_id === capture.capture_id}
                  onClick={() => handleCaptureSelect(capture)}
                  sx={{
                    borderLeft: capture.has_labels ? '4px solid #4caf50' : 'none',
                    ml: capture.has_labels ? 0 : '4px',
                  }}
                >
                  <ListItemText
                    primary={capture.capture_id}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          Images: {capture.image_count}
                          {capture.has_point_cloud && ' • PC'}
                        </Typography>
                        {capture.has_labels && (
                          <Chip
                            label="Labeled"
                            size="small"
                            color="success"
                            sx={{ mt: 0.5, fontSize: '0.6rem', height: 16 }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto' }}>
        {selectedDate && selectedCapture ? (
          <MainContent
            date={selectedDate}
            capture={selectedCapture}
            nextCapture={getNextCapture()}
            onLabelsUpdated={handleLabelsUpdated}
            onNextCapture={() => {
              const next = getNextCapture();
              if (next) handleCaptureSelect(next);
            }}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary',
            }}
          >
            <Typography variant="h6">
              {selectedDate ? 'Select a capture to review' : 'Select a date to start'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default BRSApp;