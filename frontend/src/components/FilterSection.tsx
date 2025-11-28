/*
* Thi is a the component for the filter section of the UI.
* For now is just a dropdown to select date.
* M more filters can be added later.
*/
import React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';

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
      <FormControl fullWidth>
        <InputLabel variant="standard" htmlFor="uncontrolled-native">
          Date
        </InputLabel>
        <NativeSelect
          id="date-select"
          value={selectedDate ?? ''} 
          inputProps={{
            name: 'date',
          }}
          onChange={(e) => onDateSelect(e.target.value)}
          >
            {dates.map((date) => (
              <option key={date} value={date}>{date}</option>
            ))}
          </NativeSelect>
      </FormControl>
    </Box>
  );
};

export default FilterSection;