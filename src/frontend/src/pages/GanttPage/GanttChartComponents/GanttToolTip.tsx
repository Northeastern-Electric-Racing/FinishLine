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
const background = '#ef4345';

const GanttToolTip: React.FC<GanttToolTipProps> = ({ xCoordinate, yCoordinate, title, startDate, endDate, projectLead, projectManager }) => (
  <Box
    style={{
      position: 'fixed',
      left: `${xCoordinate}px`,
      top: `${yCoordinate + 20}px`,
      padding: '10px',
      backgroundColor: background,
      borderRadius: '5px',
      zIndex: 1
    }}
  >
    <Box color={'black'}>
      <Typography>{title}</Typography>
      <Typography>Start: {startDate.toLocaleDateString()}</Typography>
      <Typography>End: {endDate.toLocaleDateString()}</Typography>
      <Typography>Project Lead: {fullNamePipe(projectLead)}</Typography>
      <Typography>Project Manager: {fullNamePipe(projectManager)}</Typography>
    </Box>
  </Box>
);

export default GanttToolTip;
