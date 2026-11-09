/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useNow } from '../../../hooks/utils.hooks';

// the time has no seconds, so update once a minute
const CLOCK_TICK_MS = 60 * 1000;

const textSx = { color: 'white', fontWeight: 700, fontSize: '2cqw', lineHeight: 1 };

/**
 * The top row of the TV.
 * The date and time are on the right, in the TV's local time.
 */
const BayDashboardHeader: React.FC = () => {
  const now = dayjs(useNow(CLOCK_TICK_MS));

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        gap: '2cqw',
        mt: '-1cqw'
      }}
    >
      <Typography sx={textSx}>{now.format('ddd MMM D')}</Typography>
      <Typography sx={textSx}>{now.format('h:mm A')}</Typography>
    </Box>
  );
};

export default BayDashboardHeader;
