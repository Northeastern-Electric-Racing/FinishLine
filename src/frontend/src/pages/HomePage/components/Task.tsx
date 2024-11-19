import { Typography, Box, IconButton } from '@mui/material';
import { useState } from 'react';
import { ChecklistItem } from 'shared';
import { KeyboardArrowRight, KeyboardArrowDown } from '@mui/icons-material';
import SubtaskSection from './SubtaskSection';

interface SubtaskProps {
  checklistItems: ChecklistItem[];
  parentTask: ChecklistItem;
}

const Task: React.FC<SubtaskProps> = ({ checklistItems, parentTask }) => {
  const subtasks = checklistItems.filter((task) => task.parentChecklistItemId === parentTask.checklistItemId);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const toggleShowSubtasks = () => {
    setShowSubtasks((prev) => !prev);
  };

  return (
    <Box sx={{ width: '85%' }}>
      <Box
        sx={{
          backgroundColor: showSubtasks ? 'white' : 'gray',
          borderRadius: 2,
          padding: 2,
          alignContent: 'center',
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ color: 'black', fontWeight: 'bold' }}>{parentTask.name}</Typography>
          <IconButton onClick={toggleShowSubtasks} sx={{ marginLeft: 'auto' }}>
            {showSubtasks ? <KeyboardArrowDown sx={{ color: 'black' }} /> : <KeyboardArrowRight sx={{ color: 'black' }} />}
          </IconButton>
        </Box>
      </Box>
      {showSubtasks && <SubtaskSection subtasks={subtasks} parentTask={parentTask} />}
    </Box>
  );
};

export default Task;
