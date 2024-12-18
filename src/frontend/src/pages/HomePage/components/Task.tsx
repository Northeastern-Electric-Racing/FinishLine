import { Typography, Box, IconButton, Checkbox } from '@mui/material';
import { useState } from 'react';
import { KeyboardArrowRight, KeyboardArrowDown, Delete } from '@mui/icons-material';
import SubtaskSection from './SubtaskSection';
import EditIcon from '@mui/icons-material/Edit';
import { Checklist } from 'shared';
import { GridDragIcon } from '@mui/x-data-grid';

interface SubtaskProps {
  subtasks: Checklist[];
  parentTask: Checklist;
  isAdmin?: boolean;
}

const Task: React.FC<SubtaskProps> = ({ subtasks, parentTask, isAdmin }) => {
  const [showSubtasks, setShowSubtasks] = useState(false);

  const toggleShowSubtasks = () => {
    setShowSubtasks((prev) => !prev);
  };

  return isAdmin ? (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          backgroundColor: '#CECECE',
          borderRadius: 0,
          padding: 1.5,
          alignContent: 'center',
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            sx={{
              color: '#ef4345',
              '&:hover': {
                backgroundColor: 'transparent'
              }
            }}
          >
            <GridDragIcon sx={{ color: 'black' }}></GridDragIcon>
          </IconButton>
          <Typography sx={{ color: 'black', fontWeight: 'bold' }}>{parentTask.name}</Typography>
          <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            {isAdmin && (
              <>
                <IconButton
                  sx={{
                    marginRight: '1vw',
                    color: '#ef4345',
                    '&:hover': {
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <EditIcon sx={{ color: 'black' }} />
                </IconButton>
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
      {showSubtasks && <SubtaskSection subtasks={subtasks} parentTask={parentTask} isAdmin={isAdmin} />}
    </Box>
  ) : (
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
