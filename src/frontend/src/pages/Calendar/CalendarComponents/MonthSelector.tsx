import { Box, MenuItem, TextField } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { EnumToArray } from '../../../utils/design-review.utils';

interface MonthSelectorProps {
  displayMonth: Date;
  setDisplayMonth: Dispatch<SetStateAction<Date>>;
}

enum months {
  January,
  February,
  March,
  April,
  May,
  June,
  July,
  August,
  September,
  October,
  November,
  December
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ displayMonth, setDisplayMonth }) => {
  const getMonthName = (month: number) => {
    return months[month];
  };
  const getMonthNumber = (month: string) => {
    return EnumToArray(months).indexOf(month);
  };

  return (
    <Box>
      <TextField
        select
        defaultValue={getMonthName(displayMonth.getMonth())}
        onChange={(event) => {
          displayMonth.setMonth(getMonthNumber(event.target.value));
          setDisplayMonth(new Date(displayMonth));
        }}
      >
        {EnumToArray(months).map((month) => {
          console.log(month);
          return (
            <MenuItem key={month} value={month}>
              {month}
            </MenuItem>
          );
        })}
      </TextField>

      <TextField
        select
        defaultValue={displayMonth.getFullYear()}
        onChange={(event) => {
          displayMonth.setFullYear(Number.parseInt(event.target.value));
          setDisplayMonth(new Date(displayMonth));
        }}
      >
        {[...Array(50).keys()].map((num) => {
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
