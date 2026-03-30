import { Draggable } from '@hello-pangea/dnd';
import { Construction, Delete, Schedule } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, Grid, Typography, IconButton } from '@mui/material';
import { useState } from 'react';
import { notGuest, Task, WorkPackage } from 'shared';
import { useDeleteTask, useEditTask, useEditTaskAssignees, useEditTaskWbsElement } from '../../../../../hooks/tasks.hooks';
import { useToast } from '../../../../../hooks/toasts.hooks';
import { useCurrentUser } from '../../../../../hooks/users.hooks';
import { datePipe, fullNamePipe } from '../../../../../utils/pipes';
import { EditTaskFormInput } from '../TaskFormModal';
import TaskModal from '../TaskModal';
import NERModal from '../../../../../components/NERModal';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../../../../utils/routes';
import { wbsPipe } from '../../../../../utils/pipes';

export const TaskCard = ({
  task,
  index,
  wbsElementId,
  onDeleteTask,
  onEditTask
}: {
  task: Task;
  index: number;
  wbsElementId: string;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}) => {
  const { mutateAsync: deleteTask } = useDeleteTask();
  const { mutateAsync: editTask } = useEditTask();
  const { mutateAsync: editTaskAssignees } = useEditTaskAssignees();
  const { mutateAsync: editTaskWbsElement } = useEditTaskWbsElement();

  const user = useCurrentUser();

  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteTask({ taskId: task.taskId });
      onDeleteTask(task.taskId);
      toast.success('Task deleted successfully!');
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Failed to delete Task: ' + error.message);
      }
    }
    setShowDeleteConfirm(false);
  };

  const handleEditTask = async ({
    taskId,
    notes,
    title,
    deadline,
    assignees,
    priority,
    startDate,
    wpWbsNum
  }: EditTaskFormInput) => {
    try {
      await editTask({
        taskId,
        notes,
        title,
        deadline,
        startDate,
        priority
      });

      let newTask = await editTaskAssignees({
        taskId,
        assignees
      });

      // check if wp changed first to avoid unnecessary api call
      const wpChanged = (wpWbsNum?.workPackageNumber ?? 0) !== task.wbsNum.workPackageNumber;
      if (wpChanged) {
        const targetWbsElementId = wpWbsNum
          ? workPackages?.find((wp) => wp.wbsNum.workPackageNumber === wpWbsNum.workPackageNumber)?.wbsElementId
          : wbsElementId;
        if (targetWbsElementId) {
          newTask = await editTaskWbsElement({ taskId, wbsElementId: targetWbsElementId });
        }
      }

      onEditTask(newTask);
      toast.success('Task edited successfully!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    setShowModal(false);
  };

  const priorityColor = task.priority === 'HIGH' ? '#ef4345' : task.priority === 'LOW' ? '#00ab41' : '#FFA500';
  const isOverdue = task.deadline != null && new Date(task.deadline) < new Date() && task.status !== 'DONE';
  const isWpTask = task.wbsNum.workPackageNumber !== 0;

  return (
    <>
      <TaskModal
        modalShow={showModal}
        task={task}
        onHide={() => setShowModal(false)}
        onSubmit={handleEditTask}
        hasEditPermissions={notGuest(user.role)}
      />
      <NERModal
        open={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        title="Warning!"
        cancelText="No"
        submitText="Yes"
        onSubmit={confirmDelete}
      >
        <Typography>Are you sure you want to delete the task "{task.title}"?</Typography>
        <Typography sx={{ fontWeight: 'bold', mt: 1 }}>This action cannot be undone!</Typography>
      </NERModal>
      <Draggable draggableId={String(task.taskId)} index={index}>
        {(provided, snapshot) => (
          <Box sx={{ marginBottom: 1 }} {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
            <div onClick={() => setShowModal(true)}>
              <Card
                sx={{
                  opacity: snapshot.isDragging ? 0.9 : 1,
                  transform: snapshot.isDragging ? 'rotate(-2deg)' : '',
                  borderRadius: '5px',
                  ...(isOverdue && { border: '2px solid #ef4345' })
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
                      <IconButton onClick={handleDelete} size="small">
                        <Delete />
                      </IconButton>
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
                      {isWpTask && // render iff task does have associated wp
                        workPackages && ( // and if on project's task page, not wp's
                          <Chip
                            label={task.wbsName}
                            size="medium"
                            component={RouterLink}
                            to={`${routes.PROJECTS}/${wbsPipe(task.wbsNum)}`}
                            clickable
                            sx={{
                              marginTop: 1,
                              backgroundColor: 'rgba(55, 138, 221, 0.15)',
                              color: '#7dbef4',
                              border: '1px solid rgba(55, 138, 221, 0.4)',
                              fontWeight: 500,
                              maxWidth: 300 // truncates wtih ellipses if it gets too long
                            }}
                          />
                        )}
                    </Grid>
                    <Grid item xs={12} lg={4} justifyContent={'right'}>
                      <Box alignItems={'center'} mt={1} justifyContent={'right'} display={'flex'} flexDirection={'column'}>
                        {task.startDate && (
                          <Box alignItems={'center'} justifyContent={'right'} display={'flex'} mb={0.5}>
                            <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                              Start: {datePipe(task.startDate)}
                            </Typography>
                          </Box>
                        )}
                        {task.deadline && (
                          <Box alignItems={'center'} justifyContent={'right'} display={'flex'}>
                            <Schedule sx={{ fontSize: 16, mr: 0.5, ...(isOverdue && { color: '#ef4345' }) }} />
                            <Typography
                              variant="body2"
                              sx={{ fontSize: '0.875rem', ...(isOverdue && { color: '#ef4345', fontWeight: 'bold' }) }}
                            >
                              Due: {datePipe(task.deadline)}
                            </Typography>
                          </Box>
                        )}
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
