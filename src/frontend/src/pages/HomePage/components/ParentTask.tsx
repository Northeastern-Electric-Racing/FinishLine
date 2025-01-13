import { Typography, Box, IconButton, Checkbox } from '@mui/material';
import { useState } from 'react';
import { KeyboardArrowRight, KeyboardArrowDown } from '@mui/icons-material';
import SubtaskSection from './SubtaskSection';
import { Checklist } from 'shared';
import { useToggleChecklist } from '../../../hooks/onboarding.hook';
import { useToast } from '../../../hooks/toasts.hooks';
import { isChecklistChecked } from '../../../utils/onboarding.utils';

interface ParentTaskProps {
  parentTask: Checklist;
  checkedChecklists?: Checklist[];
}

const ParentTask: React.FC<ParentTaskProps> = ({ parentTask, checkedChecklists }) => {
  const toast = useToast();
  const [showSubtasks, setShowSubtasks] = useState(false);
  const { mutateAsync: toggleChecklist } = useToggleChecklist();

  const toggleShowSubtasks = () => {
    setShowSubtasks((prev) => !prev);
  };

  const handleToggleChecklist = async () => {
    try {
      await toggleChecklist({ checklistId: parentTask.checklistId });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Box sx={{ width: '85%' }}>
      <Box
        sx={{
          backgroundColor: showSubtasks ? 'white' : '#CECECE',
          borderRadius: 2,
          padding: 1.5,
          alignContent: 'center',
          position: 'relative',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
          marginBottom: showSubtasks ? 0 : 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleToggleChecklist}>
            <Checkbox
              checked={isChecklistChecked(checkedChecklists, parentTask)}
              sx={{
                '& .MuiSvgIcon-root': {
                  fill: 'black',
                  backgroundColor: 'black',
                  borderRadius: 1
                },
                '&.Mui-checked .MuiSvgIcon-root': {
                  backgroundColor: 'white'
                },
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}
            />
          </IconButton>
          <Typography sx={{ color: 'black', fontWeight: 'bold' }}>{parentTask.name}</Typography>
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
