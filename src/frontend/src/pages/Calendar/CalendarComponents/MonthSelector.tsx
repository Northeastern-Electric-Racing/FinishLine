import { Box, MenuItem, TextField } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { EnumToArray, MONTH_NAMES } from '../../../utils/design-review.utils';

interface MonthSelectorProps {
  displayMonth: Date;
  setDisplayMonth: Dispatch<SetStateAction<Date>>;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ displayMonth, setDisplayMonth }) => {
  // TODO change this to use Pagination instead of hardocding 50 years
  const years = [...Array(50).keys()].map((num) => (num + 2024).toString());

  return (
    <Box>
      <TextField
        sx={{ paddingBottom: 0, marginTop: 0 }}
        select
        SelectProps={{ style: { padding: 0 } }}
        defaultValue={displayMonth.getMonth()}
        onChange={(event) => {
          displayMonth.setMonth(Number(event.target.value));
          setDisplayMonth(new Date(displayMonth));
        }}
      >
        {EnumToArray(MONTH_NAMES).map((month, index) => {
          return (
            <MenuItem key={month} value={index} sx={{ padding: 0 }}>
              {month}
            </MenuItem>
          );
        })}
      </TextField>

      <TextField
        select
        sx={{ marginLeft: 1, paddingBottom: 0, marginTop: 0 }}
        defaultValue={displayMonth.getFullYear()}
        onChange={(event) => {
          displayMonth.setFullYear(Number.parseInt(event.target.value));
          setDisplayMonth(new Date(displayMonth));
        }}
      >
        {years.map((year) => (
          <MenuItem key={year} value={year} sx={{ marginLeft: 1, padding: 0, marginTop: 0 }}>
            {year}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default MonthSelector;
