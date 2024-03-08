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
  // TODO change this to use Pagination instead of hardocding 50 years
  const years = [...Array(50).keys()].map((num) => (num + 2024).toString());

  return (
    <Box>
      <TextField
        select
        defaultValue={displayMonth.getMonth()}
        onChange={(event) => {
          displayMonth.setMonth(Number(event.target.value));
          setDisplayMonth(new Date(displayMonth));
        }}
      >
        {EnumToArray(months).map((month, index) => {
          return (
            <MenuItem key={month} value={index}>
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
        {years.map((year) => (
          <MenuItem key={year} value={year}>
            {year}
          </MenuItem>
        ))}
        ;
      </TextField>
    </Box>
  );
};

export default MonthSelector;
