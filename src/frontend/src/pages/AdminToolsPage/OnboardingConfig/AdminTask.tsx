import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import { Typography, IconButton } from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import { Checklist } from 'shared';
import SubtaskSection from '../../HomePage/components/SubtaskSection';
import { GridDragIcon } from '@mui/x-data-grid';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import EditIcon from '@mui/icons-material/Edit';

interface AdminTaskProps {
  parentTask: Checklist;
}

const AdminTask: React.FC<AdminTaskProps> = ({ parentTask }) => {
  const [showSubtasks, setShowSubtasks] = useState(false);

  const toggleShowSubtasks = () => {
    setShowSubtasks((prev) => !prev);
  };

  return (
    <Box sx={{ width: '100%', mb: 1 }}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton>
            <GridDragIcon sx={{ color: 'black' }} />
          </IconButton>
          <Typography sx={{ color: 'black', fontWeight: 'bold', fontSize: '1.1em' }}>{parentTask.name}</Typography>
          <Box sx={{ ml: 'auto' }}>
            <IconButton>
              <RemoveCircleOutlineIcon sx={{ color: 'black' }} />
            </IconButton>
            <IconButton>
              <EditIcon sx={{ color: 'black' }} />
            </IconButton>
            <IconButton onClick={toggleShowSubtasks} sx={{ marginLeft: 'auto' }}>
              {showSubtasks ? <KeyboardArrowDown sx={{ color: 'black' }} /> : <KeyboardArrowRight sx={{ color: 'black' }} />}
            </IconButton>
          </Box>
        </Box>
        {showSubtasks && <SubtaskSection parentTask={parentTask} isAdmin={true} />}
      </Box>
    </Box>
  );
};

export default AdminTask;
