import { Typography, Box, IconButton, Checkbox } from '@mui/material';
import { useState, useEffect } from 'react';
import { KeyboardArrowRight, KeyboardArrowDown } from '@mui/icons-material';
import SubtaskSection from './SubtaskSection';
import { Checklist } from 'shared';
import { useCurrentUser } from '../../../hooks/users.hooks'; 

interface SubtaskProps {
  subtasks: Checklist[];
  parentTask: Checklist;
}

const Task: React.FC<SubtaskProps> = ({ subtasks, parentTask }) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const user = useCurrentUser();  

  console.log(parentTask)

  const toggleShowSubtasks = () => {
    setShowSubtasks((prev) => !prev);
  };

  const handleCheckboxChange = () => {
    setIsChecked((prev) => {
      const newCheckedState = !prev;
      if (newCheckedState) {
        if (!parentTask.usersChecked.includes(user)) {
          parentTask.usersChecked.push(user);
        }
      } else {
        parentTask.usersChecked = parentTask.usersChecked.filter((checkedUser) => checkedUser !== user);
      }
      return newCheckedState;
    });
  };

  useEffect(() => {
    setIsChecked(parentTask.usersChecked.includes(user));
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
