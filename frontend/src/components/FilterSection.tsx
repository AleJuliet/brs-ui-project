/*
* Thi is a the component for the filter section of the UI.
* It allows users to filter captures based on various criteria.
* So that it allows the user to go through the captures more easily.
* Initially it will filter by date, but more filters can be added later.
*/
import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';

interface FilterSectionProps {
  dates: string[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  dates,
  selectedDate,
  onDateSelect,
}) => {
  return (
    <Box sx={{ width: 300, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filter by Date
      </Typography>
        <List>
          {dates.map((date) => (
            <ListItem key={date} disablePadding>
              <ListItemButton
                selected={selectedDate === date}
                onClick={() => onDateSelect(date)}
              >
                <ListItemText primary={date} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
    </Box>
  );
};

export default FilterSection;