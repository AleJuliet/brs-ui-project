/*
* This is the component that will render the section that shows information about a selected capture.
* It will show information such as trigger id, color prediction, photo timestamp, brick id, laser timestamp,
* super id and bucket number
* The input will come from the MainContent component as props.
*/
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { BrickInfo } from '../types/api';
import Grid from '@mui/material/Grid';

interface InfoSectionProps {
  capture: BrickInfo;
}

const InfoSection: React.FC<InfoSectionProps> = ({ capture }) => {
  // Convert RGB array (0-1 range) to CSS rgb string
  const rgbToCss = (rgb: number[]) => {
    if (!rgb || rgb.length !== 3) return 'rgb(128, 128, 128)';
    return `rgb(${Math.round(rgb[0] * 255)}, ${Math.round(rgb[1] * 255)}, ${Math.round(rgb[2] * 255)})`;
  };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Capture Information
      </Typography>
      <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body1">Color Prediction: {capture.color_prediction}</Typography>
              {capture.color_rgb && (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    backgroundColor: rgbToCss(capture.color_rgb),
                    border: '1px solid #ccc',
                    borderRadius: 1,
                  }}
                />
              )}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body1">Super ID: {capture.super_id}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body1">Bucket Number: {capture.bucket_number}</Typography>
          </Grid>
      </Grid>
    </Box>
  );
};

export default InfoSection;



