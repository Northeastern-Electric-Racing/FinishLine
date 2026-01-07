import { Typography, Box, IconButton, Checkbox, Tooltip } from '@mui/material';
import { useState } from 'react';
import { KeyboardArrowRight, KeyboardArrowDown } from '@mui/icons-material';
import SubtaskSection from './SubtaskSection';
import { Checklist } from 'shared';
import { isChecklistChecked } from '../../../utils/onboarding.utils';

interface ParentTaskProps {
  parentTask: Checklist;
  checkedChecklists?: Checklist[];
}

const ParentTask: React.FC<ParentTaskProps> = ({ parentTask, checkedChecklists }) => {
  const [showSubtasks, setShowSubtasks] = useState(true);

  const toggleShowSubtasks = () => {
    setShowSubtasks((prev) => !prev);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          backgroundColor: showSubtasks ? 'white' : '#CECECE',
          borderRadius: 2,
          alignContent: 'center',
          position: 'relative',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
          marginBottom: showSubtasks ? 0 : 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Please complete all subtasks to mark this task as completed" arrow placement="right">
            <Box sx={{ pointerEvents: 'none', padding: '8px' }}>
              <Checkbox
                checked={isChecklistChecked(checkedChecklists, parentTask)}
                disabled
                sx={{
                  '& .MuiSvgIcon-root': {
                    fill: 'rgba(0, 0, 0, 0.5)',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: 1
                  },
                  '&.Mui-checked .MuiSvgIcon-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    fill: 'rgba(0, 0, 0, 0.5)'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.6
                  }
                }}
              />
            </Box>
          </Tooltip>
          <Typography sx={{ color: 'black', fontWeight: 'bold' }}>{parentTask.content}</Typography>
          <IconButton onClick={toggleShowSubtasks} sx={{ marginLeft: 'auto' }}>
            {showSubtasks ? <KeyboardArrowDown sx={{ color: 'black' }} /> : <KeyboardArrowRight sx={{ color: 'black' }} />}
          </IconButton>
        </Box>
      </Box>
      {showSubtasks && <SubtaskSection parentTask={parentTask} checkedChecklists={checkedChecklists} />}
    </Box>
  );
};

export default ParentTask;
