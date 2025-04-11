import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import { Typography, IconButton } from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import { Checklist } from 'shared';
import { GridDragIcon } from '@mui/x-data-grid';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import EditChecklistModal from './EditChecklistModal';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useDeleteChecklist } from '../../../../hooks/onboarding.hook';
import NERDeleteModal from '../../../../components/NERDeleteModal';
import AdminSubtaskSection from './AdminSubtaskSection';

interface AdminTaskProps {
  parentTask: Checklist;
}

const AdminTask: React.FC<AdminTaskProps> = ({ parentTask }) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Checklist | null>(null);
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

  const toggleShowSubtasks = () => {
    setShowSubtasks((prev) => !prev);
  };

  return (
    <Box sx={{ width: '100%', mb: 1 }}>
      <Box sx={{ width: '100%', mb: 2, p: 2, borderRadius: 3, boxShadow: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton>
            <GridDragIcon sx={{ color: 'black' }} />
          </IconButton>
          <Typography sx={{ color: 'black', fontWeight: 'bold', fontSize: '1.1em' }}>{parentTask.name}</Typography>
          <Box sx={{ ml: 'auto', display: 'flex' }}>
            <IconButton onClick={() => setTaskToDelete(parentTask)}>
              <RemoveCircleOutlineIcon sx={{ color: 'black' }} />
            </IconButton>
            <IconButton onClick={() => setShowEdit(true)}>
              <EditIcon sx={{ color: 'black' }} />
            </IconButton>
            <IconButton onClick={toggleShowSubtasks}>
              {showSubtasks ? <KeyboardArrowDown sx={{ color: 'black' }} /> : <KeyboardArrowRight sx={{ color: 'black' }} />}
            </IconButton>
          </Box>
        </Box>
        {showSubtasks && <AdminSubtaskSection parentTask={parentTask} />}
      </Box>
      {showEdit && (
        <EditChecklistModal
          open={showEdit}
          handleClose={() => setShowEdit(false)}
          teamId={parentTask.team?.teamId}
          teamTypeId={parentTask.teamType?.teamTypeId}
          defaultValues={parentTask}
        />
      )}
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
