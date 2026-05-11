import { Box, Typography, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { emDashPipe } from '../../../../utils/pipes';
import { formatDateOnly } from 'shared';

interface GanttToolTipProps {
  xCoordinate: number;
  yCoordinate: number;
  title: string;
  startDate?: Date;
  endDate?: Date;
  color?: string;
  upperRightDisplay: ReactNode;
  lowerRightDisplay: ReactNode;
}

const GanttToolTip: React.FC<GanttToolTipProps> = ({
  xCoordinate,
  yCoordinate,
  title,
  startDate,
  endDate,
  upperRightDisplay,
  lowerRightDisplay
}) => {
  const theme = useTheme();
  const tooltipWidth = 375;
  const horizontalPadding = 16;
  const left = Math.min(Math.max(horizontalPadding, xCoordinate + 12), window.innerWidth - tooltipWidth - horizontalPadding);

  return (
    <Box
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: `${yCoordinate + 20}px`,
        zIndex: 4,
        width: tooltipWidth
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
