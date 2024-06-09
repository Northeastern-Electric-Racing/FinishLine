import { Draggable } from '@hello-pangea/dnd';
import { Construction, Schedule } from '@mui/icons-material';
import { Box, Card, CardActions, CardContent, Chip, Typography } from '@mui/material';
import { useState } from 'react';
import { isLeadership, Project, Task } from 'shared';
import NERFailButton from '../../../../../components/NERFailButton';
import { useDeleteTask, useEditTask, useEditTaskAssignees } from '../../../../../hooks/tasks.hooks';
import { useToast } from '../../../../../hooks/toasts.hooks';
import { useCurrentUser } from '../../../../../hooks/users.hooks';
import { datePipe, fullNamePipe } from '../../../../../utils/pipes';
import { isUserOnTeam } from '../../../../../utils/teams.utils';
import { EditTaskFormInput } from '../TaskFormModal';
import TaskModal from '../TaskModal';

export const TaskCard = ({ task, index, project }: { task: Task; index: number; project: Project }) => {
  const { mutateAsync: deleteTask } = useDeleteTask();
  const { mutateAsync: editTask } = useEditTask();
  const { mutateAsync: editTaskAssignees } = useEditTaskAssignees();

  const user = useCurrentUser();

  const toast = useToast();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteTask({ taskId: task.taskId });
      toast.success('Task deleted successfully!');
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Failed to delete Task: ' + error.message);
      }
    }
  };

  const handleEditTask = async ({ taskId, notes, title, deadline, assignees, priority }: EditTaskFormInput) => {
    try {
      await editTask({
        taskId,
        notes,
        title,
        deadline,
        priority
      });
      await editTaskAssignees({
        taskId,
        assignees
      });
      toast.success('Task edited successfully!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    setShowModal(false);
  };

  const editTaskPermissions = (task: Task): boolean => {
    return (
      (isLeadership(user.role) ||
        project.teams.some((team) => isUserOnTeam(team, user)) ||
        project.lead?.userId === user.userId ||
        project.manager?.userId === user.userId ||
        task.assignees.map((u) => u.userId).includes(user.userId) ||
        task.createdBy.userId === user.userId) ??
      false
    );
  };

  return (
    <>
      <TaskModal
        modalShow={showModal}
        task={task}
        teams={project.teams}
        onHide={() => setShowModal(false)}
        onSubmit={handleEditTask}
        hasEditPermissions={editTaskPermissions(task)}
      />
      <Draggable draggableId={String(task.taskId)} index={index}>
        {(provided, snapshot) => (
          <Box sx={{ marginBottom: 1 }} {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
            <div onClick={() => setShowModal(true)}>
              <Card
                sx={{
                  opacity: snapshot.isDragging ? 0.9 : 1,
                  transform: snapshot.isDragging ? 'rotate(-2deg)' : '',
                  borderRadius: '5px'
                }}
                elevation={snapshot.isDragging ? 3 : 1}
              >
                <CardContent>
                  <Typography variant="h5" component="div">
                    {task.title}
                  </Typography>
                  <Chip
                    sx={{ marginTop: 1, marginRight: 2 }}
                    icon={<Construction />}
                    label={task.assignees.map((assignee) => fullNamePipe(assignee)).join(', ')}
                    size="medium"
                  />
                  <Typography sx={{ mt: 1 }} variant="body2">
                    {task.notes}
                  </Typography>
                  <Box alignItems={'center'} mt={1} display={'flex'}>
                    <Schedule />
                    <Typography variant="body2">{datePipe(task.deadline)}</Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <div style={{ textAlign: 'right', width: '100%' }}>
                    <NERFailButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                    >
                      Delete
                    </NERFailButton>
                  </div>
                </CardActions>
              </Card>
            </div>
          </Box>
        )}
      </Draggable>
    </>
  );
};
