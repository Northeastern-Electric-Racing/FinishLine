import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import { Typography, IconButton } from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import { Checklist } from 'shared';
import SubtaskSection from '../../HomePage/components/SubtaskSection';
import { GridDragIcon } from '@mui/x-data-grid';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import NERDeleteModal from '../../../components/NERDeleteModal';
import { useDeleteChecklist } from '../../../hooks/onboarding.hook';
import { useToast } from '../../../hooks/toasts.hooks';

interface AdminTaskProps {
  subtasks: Checklist[];
  parentTask: Checklist;
}

const AdminTask: React.FC<AdminTaskProps> = ({ subtasks, parentTask }) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Checklist | null>(null);

  const toggleShowSubtasks = () => {
    setShowSubtasks((prev) => !prev);
  };

  const toast = useToast();
  const { mutateAsync: deleteChecklist } = useDeleteChecklist();

  const handleDelete = async (taskId: string) => {
    try {
      await deleteChecklist(taskId);
      toast.success('Task deleted successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    setTaskToDelete(null);
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
            <IconButton onClick={() => setTaskToDelete(parentTask)}>
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
        {showSubtasks && <SubtaskSection subtasks={subtasks} parentTask={parentTask} isAdmin={true} />}
      </Box>
      {taskToDelete && (
        <NERDeleteModal
          open={!!taskToDelete}
          onHide={() => setTaskToDelete(null)}
          formId="delete-task-form"
          dataType="Task"
          onFormSubmit={() => handleDelete(taskToDelete.checklistId)}
        />
      )}
    </Box>
  );
};

export default AdminTask;
