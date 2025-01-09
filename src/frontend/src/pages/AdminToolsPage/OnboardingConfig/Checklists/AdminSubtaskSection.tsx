import { Typography, useTheme, Grid, IconButton } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import { Checklist, ChecklistPreview } from 'shared';
import { GridDragIcon } from '@mui/x-data-grid';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CreateSubtaskModal from './CreateSubtaskModal';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import NERDeleteModal from '../../../../components/NERDeleteModal';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useDeleteChecklist } from '../../../../hooks/onboarding.hook';
import EditSubtaskModal from './EditSubtaskModal';

interface AdminSubtaskSectionProps {
  parentTask: Checklist;
}

const AdminSubtaskSection: React.FC<AdminSubtaskSectionProps> = ({ parentTask }) => {
  const theme = useTheme();
  const toast = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<ChecklistPreview | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<ChecklistPreview | null>(null);

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

  const { subtasks } = parentTask;

  return (
    <Box sx={{ px: 5 }}>
      {subtasks.length > 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ mt: 1 }}>
              {subtasks.map((subtask) => (
                <Box
                  key={subtask.checklistId}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: 3,
                    mb: 1
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} sx={{ flex: 1 }}>
                    <IconButton>
                      <GridDragIcon sx={{ color: 'black' }} />
                    </IconButton>
                    <Typography color="black" fontWeight="bold">
                      {subtask.name} {subtask.isOptional && '(Optional)'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex' }}>
                    <IconButton onClick={() => setTaskToDelete(subtask)}>
                      <RemoveCircleOutlineIcon sx={{ color: 'black' }} />
                    </IconButton>
                    <IconButton onClick={() => setTaskToEdit(subtask)}>
                      <EditIcon sx={{ color: 'black' }} />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      )}
      {parentTask.descriptions.map((description) => (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            padding: 2,
            borderRadius: 3,
            marginTop: 1,
            marginBottom: 1
          }}
        >
          <Typography color={theme.palette.text.primary}>{description}</Typography>
        </Box>
      ))}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: -1 }}>
        <IconButton sx={{ color: 'red' }} onClick={() => setShowCreateModal(true)}>
          <AddCircleOutlineIcon sx={{ mr: 1 }} />
          <Typography>Add Subtask</Typography>
        </IconButton>
      </Box>
      {showCreateModal && (
        <CreateSubtaskModal
          open={showCreateModal}
          handleClose={() => setShowCreateModal(false)}
          parentChecklist={parentTask}
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
      {taskToEdit && (
        <EditSubtaskModal
          open={!!taskToEdit}
          handleClose={() => setTaskToEdit(null)}
          parentChecklist={parentTask}
          defaultValues={taskToEdit}
        />
      )}
    </Box>
  );
};

export default AdminSubtaskSection;
