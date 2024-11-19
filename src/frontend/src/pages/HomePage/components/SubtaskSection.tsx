import { Typography, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { ChecklistItem } from 'shared';

const SubtaskSection: React.FC<{ subtasks: ChecklistItem[]; parentTask: ChecklistItem }> = ({ subtasks, parentTask }) => {
  const theme = useTheme();

  return (
    <Box sx={{ backgroundColor: 'gray', padding: 2, marginTop: -0.5, borderRadius: '0px 0px 10px 10px' }}>
      <Box>
        <Box sx={{ marginLeft: 10 }}>
          {subtasks.map((subtask) => (
            <Typography color={'black'}>{subtask.name}</Typography>
          ))}
        </Box>
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            height: '25%vh',
            width: '25vw'
          }}
        >
          <Typography color={'black'}>{parentTask.description}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SubtaskSection;
