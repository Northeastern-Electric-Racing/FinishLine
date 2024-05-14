/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Dispatch, SetStateAction } from 'react';
import { Box, IconButton } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface MonthSelectorProps {
  displayMonth: Date;
  setDisplayMonth: Dispatch<SetStateAction<Date>>;
}

const NextPreviousMonthButtons: React.FC<MonthSelectorProps> = ({ displayMonth, setDisplayMonth }) => {
  return (
    <Box>
      <IconButton
        size="small"
        color="primary"
        onClick={() => {
          displayMonth.setMonth(Number(displayMonth.getMonth() - 1));
          setDisplayMonth(new Date(displayMonth));
        }}
      >
        <ArrowBackIosIcon style={{ fontSize: '30px' }} />
      </IconButton>
      <IconButton
        size="small"
        color="primary"
        onClick={() => {
          displayMonth.setMonth(Number(displayMonth.getMonth() + 1));
          setDisplayMonth(new Date(displayMonth));
        }}
      >
        <ArrowForwardIosIcon style={{ fontSize: '30px' }} />
      </IconButton>
    </Box>
  );
};

export default NextPreviousMonthButtons;
