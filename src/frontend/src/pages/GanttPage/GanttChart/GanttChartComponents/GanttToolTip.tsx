import { Box, Typography, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { emDashPipe } from '../../../../utils/pipes';
import { formatDateOnly } from 'shared';

interface GanttToolTipProps {
  yCoordinate: number;
  title: string;
  startDate?: Date;
  endDate?: Date;
  color?: string;
  upperRightDisplay: ReactNode;
  lowerRightDisplay: ReactNode;
}

const GanttToolTip: React.FC<GanttToolTipProps> = ({
  yCoordinate,
  title,
  startDate,
  endDate,
  upperRightDisplay,
  lowerRightDisplay
}) => {
  const theme = useTheme();
  const xCoordinate = window.innerWidth - 375 - 35;
  return (
    <Box
      style={{
        position: 'fixed',
        left: `${xCoordinate}px`,
        top: `${yCoordinate + 20}px`,
        zIndex: 4,
        width: 375
      }}
    >
      <Box color={'white'}>
        <Box sx={{ backgroundColor: '#ef4345', borderRadius: '5px 5px 0 0', padding: '5px 10px' }}>
          <Typography sx={{ fontSize: '1.2em', fontWeight: 'bold' }}>{title}</Typography>
        </Box>
        <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '0 0 5px 5px', padding: '5px 10px' }}>
          <Box display={'flex'} flexDirection={'row'}>
            <Typography color={theme.palette.text.primary} marginRight={'10px'}>
              Start: {startDate ? formatDateOnly(startDate) : emDashPipe('')}
            </Typography>
            {upperRightDisplay}
          </Box>
          <Box display={'flex'} flexDirection={'row'}>
            <Typography color={theme.palette.text.primary} marginRight={'10px'}>
              End: {endDate ? formatDateOnly(endDate) : emDashPipe('')}
            </Typography>
            {lowerRightDisplay}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default GanttToolTip;
