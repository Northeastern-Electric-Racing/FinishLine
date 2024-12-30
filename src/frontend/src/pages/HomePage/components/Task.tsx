import { Typography, Box, IconButton, Checkbox } from '@mui/material';
import { useState, useEffect } from 'react';
import { KeyboardArrowRight, KeyboardArrowDown } from '@mui/icons-material';
import SubtaskSection from './SubtaskSection';
import { Checklist, User } from 'shared';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { useToggleChecklist } from '../../../hooks/onboarding.hook';

interface SubtaskProps {
  subtasks: Checklist[];
  parentTask: Checklist;
}

const Task: React.FC<SubtaskProps> = ({ subtasks, parentTask }) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const user = useCurrentUser();
  const { mutateAsync: toggleChecklist } = useToggleChecklist();

  const toggleShowSubtasks = () => {
    setShowSubtasks((prev) => !prev);
  };

  const handleCheckboxChange = async () => {
    try {
      const newCheckedState = !isChecked;
      setIsChecked(newCheckedState);
      await toggleChecklist(parentTask);
    } catch (error) {
      console.error('Error toggling checklist:', error);
      setIsChecked((prev) => !prev);
    }
  };

  useEffect(() => {
    const isUserChecked =
      Array.isArray(parentTask.usersChecked) &&
      parentTask.usersChecked.some((checkedUser: User) => checkedUser.userId === user.userId);

    setIsChecked(isUserChecked);
  }, [parentTask.usersChecked, user]);

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
          <Checkbox
            checked={isChecked}
            onChange={handleCheckboxChange}
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
