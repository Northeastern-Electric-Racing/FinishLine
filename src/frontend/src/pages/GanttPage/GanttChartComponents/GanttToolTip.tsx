import { Box, Typography, useTheme } from '@mui/material';
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
}) => {
  const theme = useTheme();
  return (
    <Box
      style={{
        position: 'fixed',
        left: `${xCoordinate}px`,
        top: `${yCoordinate + 20}px`,
        zIndex: 4
      }}
    >
      <Box color={'white'}>
        <Box sx={{ backgroundColor: '#ef4345', borderRadius: '5px 5px 0 0', padding: '5px 10px' }}>
          <Typography sx={{ fontSize: '1.2em', fontWeight: 'bold' }}>{title}</Typography>
        </Box>
        <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '0 0 5px 5px', padding: '5px 10px' }}>
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
    </Box>
  );
};

export default GanttToolTip;
