import { Box, Typography } from '@mui/material';

interface GanttToolTipProps {
  xCoordinate: number;
  yCoordinate: number;
  title: string;
  startDate: Date;
  endDate: Date;
  color?: string;
}

const GanttToolTip: React.FC<GanttToolTipProps> = ({ xCoordinate, yCoordinate, title, startDate, endDate, color }) => (
  <Box
    style={{
      position: 'fixed',
      left: `${xCoordinate}px`,
      top: `${yCoordinate + 20}px`,
      padding: '10px',
      backgroundColor: color ? color : 'grey',
      borderRadius: '5px',
      zIndex: 1
    }}
  >
    <Box color={'black'}>
      <Typography>{title}</Typography>
      <Typography>Start: {startDate.toLocaleDateString()}</Typography>
      <Typography>End: {endDate.toLocaleDateString()}</Typography>
    </Box>
  </Box>
);

export default GanttToolTip;
