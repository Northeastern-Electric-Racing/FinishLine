import { Box, Typography } from '@mui/material';
import { User } from 'shared';
import { fullNamePipe } from '../../../utils/pipes';

interface GanttToolTipProps {
  xCoordinate: number;
  yCoordinate: number;
  title: string;
  startDate: Date;
  endDate: Date;
  color?: string;
  projectLead?: User;
  projectManager?: User;
}

const GanttToolTip: React.FC<GanttToolTipProps> = ({
  xCoordinate,
  yCoordinate,
  title,
  startDate,
  endDate,
  projectLead,
  projectManager
}) => (
  <Box
    style={{
      position: 'fixed',
      left: `${xCoordinate}px`,
      top: `${yCoordinate + 20}px`,
      padding: '10px',
      backgroundColor: '#ef4345 ',
      borderRadius: '5px',
      zIndex: 1
    }}
  >
    <Box color={'white'}>
      <Typography>{title}</Typography>
      <Box display={'flex'} flexDirection={'row'}>
        <Typography marginRight={'10px'}>Start: {startDate.toLocaleDateString()}</Typography>
        <Typography>Project Lead: {fullNamePipe(projectLead)}</Typography>
      </Box>
      <Box display={'flex'} flexDirection={'row'}>
        <Typography marginRight={'10px'}>End: {endDate.toLocaleDateString()}</Typography>
        <Typography>Project Manager: {fullNamePipe(projectManager)}</Typography>
      </Box>
    </Box>
  </Box>
);

export default GanttToolTip;
