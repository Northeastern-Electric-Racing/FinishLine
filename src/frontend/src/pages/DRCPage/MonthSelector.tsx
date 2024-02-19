import { Box, MenuItem, TextField } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';

interface MonthSelectorProps {
  displayMonth: Date;
  setDisplayMonth: Dispatch<SetStateAction<Date>>;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ displayMonth, setDisplayMonth }) => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  return (
    <Box>
      <TextField
        select
        variant="outlined"
        defaultValue={monthNames[displayMonth.getMonth()]}
        onChange={(event) => {
          displayMonth.setMonth(monthNames.indexOf(event.target.value));
          setDisplayMonth(new Date(displayMonth));
        }}
      >
        {monthNames.map((month) => (
          <MenuItem key={month} value={month}>
            {month}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        variant="outlined"
        defaultValue={displayMonth.getFullYear()}
        onChange={(event) => {
          displayMonth.setFullYear(Number.parseInt(event.target.value));
          setDisplayMonth(new Date(displayMonth));
        }}
      >
        {[...Array(10).keys()].map((num) => {
          const year = (num + 2024).toString();
          return (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          );
        })}
      </TextField>
    </Box>
  );
};

export default MonthSelector;
