import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import { Grid, Typography, IconButton } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import { Checklist, TeamType } from 'shared';
import AdminTask from './AdminTask';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CreateChecklistModal from './CreateChecklistModal';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useDeleteChecklist, useReorderTasks } from '../../../../hooks/onboarding.hook';
import NERDeleteModal from '../../../../components/NERDeleteModal';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';

export const AdminChecklist: React.FC<{ parentChecklists: Checklist[]; checklistName?: string; teamType?: TeamType }> = ({
  parentChecklists,
  checklistName,
  teamType
}) => {
  const [showTasks, setShowTasks] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tasksToDelete, setTasksToDelete] = useState<Checklist[] | null>(null);
  const [localTasks, setLocalTasks] = useState(parentChecklists);

  const toggleShowTasks = () => {
    setShowTasks((prev) => !prev);
  };

  const toast = useToast();
  const { mutateAsync: deleteChecklist } = useDeleteChecklist();
  const { mutate: reorderTasks } = useReorderTasks();

  // Update local tasks when parentChecklists changes
  useEffect(() => {
    setLocalTasks(parentChecklists);
  }, [parentChecklists]);

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

  const onDragEnd: OnDragEndResponder = (result) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (destination.index === source.index) {
      return;
    }

    // Reorder locally
    const newTasks = Array.from(localTasks);
    const [removed] = newTasks.splice(source.index, 1);
    newTasks.splice(destination.index, 0, removed);

    setLocalTasks(newTasks);

    // Send to backend
    const taskIds = newTasks.map((task) => task.checklistId);
    reorderTasks(
      { taskIds },
      {
        onError: (error: any) => {
          toast.error(error.message || 'Failed to reorder tasks');
          setLocalTasks(parentChecklists); // Revert on error
        }
      }
    );
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
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="parent-tasks">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {localTasks.map((parentChecklist, index) => (
                        <Draggable key={parentChecklist.checklistId} draggableId={parentChecklist.checklistId} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <AdminTask parentTask={parentChecklist} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
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
          teamId={parentChecklists[0]?.team?.teamId}
          teamTypeId={teamType?.teamTypeId || parentChecklists[0]?.teamType?.teamTypeId}
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
