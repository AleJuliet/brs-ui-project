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

interface InfoSectionProps {
  capture: BrickInfo;
}

const InfoSection: React.FC<InfoSectionProps> = ({ capture }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Capture Information
      </Typography>
      <Typography variant="body1">Color Prediction: {capture.color_prediction}</Typography>
      <Typography variant="body1">Super ID: {capture.super_id}</Typography>
      <Typography variant="body1">Bucket Number: {capture.bucket_number}</Typography>
    </Box>
  );
};

export default InfoSection;



