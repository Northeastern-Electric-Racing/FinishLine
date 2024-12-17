import { Typography, Box, IconButton, Checkbox, Button } from '@mui/material';
import { useState } from 'react';
import { KeyboardArrowRight, KeyboardArrowDown, Delete } from '@mui/icons-material';
import SubtaskSection from './SubtaskSection';
import EditIcon from '@mui/icons-material/Edit';
import { Checklist, isAdmin } from 'shared';
import { useCurrentUser } from '../../../hooks/users.hooks';

interface SubtaskProps {
  subtasks: Checklist[];
  parentTask: Checklist;
}

const Task: React.FC<SubtaskProps> = ({ subtasks, parentTask }) => {
  const currentUser = useCurrentUser();
  const [showSubtasks, setShowSubtasks] = useState(false);

  const toggleShowSubtasks = () => {
    setShowSubtasks((prev) => !prev);
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
          <Checkbox
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
          <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            {isAdmin(currentUser.role) && (
              <>
                <EditIcon sx={{ marginRight: '1vw', color: 'black' }} />
                <IconButton
                  sx={{
                    color: '#ef4345',
                    '&:hover': {
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <Delete sx={{ color: 'black' }} />
                </IconButton>
              </>
            )}
            <IconButton onClick={toggleShowSubtasks} sx={{ marginLeft: 'auto' }}>
              {showSubtasks ? <KeyboardArrowDown sx={{ color: 'black' }} /> : <KeyboardArrowRight sx={{ color: 'black' }} />}
            </IconButton>
          </Box>
        </Box>
      </Box>
      {showSubtasks && <SubtaskSection subtasks={subtasks} parentTask={parentTask} />}
    </Box>
  );
};

export default Task;
