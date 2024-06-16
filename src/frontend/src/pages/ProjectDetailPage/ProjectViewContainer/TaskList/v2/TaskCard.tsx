import { Draggable } from '@hello-pangea/dnd';
import { Construction, Delete, Schedule } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material';
import { useState } from 'react';
import { isLeadership, Project, Task } from 'shared';
import { useDeleteTask, useEditTask, useEditTaskAssignees } from '../../../../../hooks/tasks.hooks';
import { useToast } from '../../../../../hooks/toasts.hooks';
import { useCurrentUser } from '../../../../../hooks/users.hooks';
import { datePipe, fullNamePipe } from '../../../../../utils/pipes';
import { isUserOnTeam } from '../../../../../utils/teams.utils';
import { EditTaskFormInput } from '../TaskFormModal';
import TaskModal from '../TaskModal';

export const TaskCard = ({
  task,
  index,
  project,
  onDeleteTask,
  onEditTask
}: {
  task: Task;
  index: number;
  project: Project;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}) => {
  const { mutateAsync: deleteTask } = useDeleteTask();
  const { mutateAsync: editTask } = useEditTask();
  const { mutateAsync: editTaskAssignees } = useEditTaskAssignees();

  const user = useCurrentUser();

  const toast = useToast();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteTask({ taskId: task.taskId });
      onDeleteTask(task.taskId);
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
      const newTask = await editTaskAssignees({
        taskId,
        assignees
      });
      onEditTask(newTask);
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

  const priorityColor = task.priority === 'HIGH' ? '#ef4345' : task.priority === 'LOW' ? '#00ab41' : '#FFA500';

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
                  <Grid container>
                    <Grid item xs={11}>
                      <Typography variant="h5" component="div">
                        {task.title}
                      </Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <Delete onClick={handleDelete} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1" color={priorityColor}>
                        {task.priority}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} lg={8}>
                      <Chip
                        sx={{ marginTop: 1, marginRight: 2 }}
                        icon={<Construction />}
                        label={
                          task.assignees.length === 0
                            ? 'No Assignees'
                            : task.assignees.map((assignee) => fullNamePipe(assignee)).join(', ')
                        }
                        size="medium"
                      />
                    </Grid>
                    <Grid item xs={12} lg={4} justifyContent={'right'}>
                      <Box alignItems={'center'} mt={1} justifyContent={'right'} display={'flex'}>
                        <Schedule />
                        <Typography variant="body2">{datePipe(task.deadline)}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </div>
          </Box>
        )}
      </Draggable>
    </>
  );
};
