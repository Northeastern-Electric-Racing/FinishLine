import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import { Grid, Typography, IconButton } from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import { Checklist } from 'shared';
import AdminTask from './AdminTask';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CreateChecklistModal from './CreateChecklistModal';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useDeleteChecklist } from '../../../../hooks/onboarding.hook';
import NERDeleteModal from '../../../../components/NERDeleteModal';

export const AdminChecklist: React.FC<{ parentChecklists: Checklist[]; checklistName?: string }> = ({
  parentChecklists,
  checklistName
}) => {
  const [showTasks, setShowTasks] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tasksToDelete, setTasksToDelete] = useState<Checklist[] | null>(null);

  const toggleShowTasks = () => {
    setShowTasks((prev) => !prev);
  };

  const toast = useToast();
  const { mutateAsync: deleteChecklist } = useDeleteChecklist();

  const handleDelete = async () => {
    if (!tasksToDelete) return;

    try {
      for (const task of tasksToDelete) {
        await deleteChecklist(task.checklistId);
      }
      toast.success('All tasks deleted successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    setTasksToDelete(null);
  };

  return (
    <Box>
      <Grid container>
        <Grid item xs={12} padding={1}>
          <Box
            sx={{
              backgroundColor: showTasks ? 'white' : '#CECECE',
              padding: '2%',
              borderRadius: showTasks ? '10px 10px 0 0' : '10px',
              position: 'relative'
            }}
          >
            <Grid display="flex" alignItems="center" justifyContent="space-between">
              <Typography fontSize="2em" fontWeight="bold" color="black">
                {checklistName} Checklist
              </Typography>
              <Grid display="flex" alignItems="center">
                <IconButton onClick={() => setTasksToDelete(parentChecklists)}>
                  <RemoveCircleOutlineIcon sx={{ color: 'black' }} />
                </IconButton>
                <IconButton onClick={toggleShowTasks}>
                  {showTasks ? (
                    <KeyboardArrowDown sx={{ color: 'black' }} />
                  ) : (
                    <KeyboardArrowRight sx={{ color: 'black' }} />
                  )}
                </IconButton>
              </Grid>
            </Grid>
          </Box>
          {showTasks && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                backgroundColor: '#CECECE',
                padding: 1.5,
                alignContent: 'center',
                position: 'relative',
                borderRadius: '0px 0px 10px 10px'
              }}
            >
              {parentChecklists.map((parentChecklist) => (
                <AdminTask parentTask={parentChecklist} />
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <IconButton sx={{ color: 'red' }} onClick={() => setShowCreateModal(true)}>
                  <AddCircleOutlineIcon sx={{ mr: 1 }} />
                  <Typography sx={{ fontSize: '0.8em' }}>Add Task</Typography>
                </IconButton>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>

      {showCreateModal && (
        <CreateChecklistModal
          open={showCreateModal}
          handleClose={() => setShowCreateModal(false)}
          teamId={parentChecklists[0].team?.teamId}
          teamTypeId={parentChecklists[0].teamType?.teamTypeId}
        />
      )}
      {tasksToDelete && (
        <NERDeleteModal
          open={!!tasksToDelete}
          onHide={() => setTasksToDelete(null)}
          formId="delete-task-form"
          dataType="Checklist"
          onFormSubmit={() => handleDelete()}
        />
      )}
    </Box>
  );
};
