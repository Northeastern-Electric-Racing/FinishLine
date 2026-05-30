import { Draggable } from '@hello-pangea/dnd';
import { Construction, Folder, Delete, Schedule } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, Grid, Typography, IconButton } from '@mui/material';
import { useState } from 'react';
import { notGuest, Task, WbsNumber } from 'shared';
import { useDeleteTask, useEditTask, useEditTaskAssignees } from '../../../../../hooks/tasks.hooks';
import { useToast } from '../../../../../hooks/toasts.hooks';
import { useCurrentUser } from '../../../../../hooks/users.hooks';
import { datePipe, fullNamePipe } from '../../../../../utils/pipes';
import { EditTaskFormInput } from '../TaskFormModal';
import TaskModal from '../TaskModal';
import NERModal from '../../../../../components/NERModal';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../../../../utils/routes';
import { wbsPipe } from '../../../../../utils/pipes';

const wpColors = [
  { bg: 'rgba(55,138,221,0.15)', color: '#7dbef4' }, // blue
  { bg: 'rgba(127,119,221,0.15)', color: '#AFA9EC' }, // purple
  { bg: 'rgba(255,182,193,0.15)', color: '#F4A7B9' }, // rose
  { bg: 'rgba(79,172,254,0.15)', color: '#63C5DA' }, // cyan
  { bg: 'rgba(100,149,237,0.15)', color: '#93B5E1' }, // greyish blue
  { bg: 'rgba(147,112,219,0.15)', color: '#C9B1FF' }, // lavender
  { bg: 'rgba(176,196,222,0.15)', color: '#A8C0D6' }, // really greyish blue
  { bg: 'rgba(29,158,117,0.15)', color: '#5DCAA5' } // teal
];

export const TaskCard = ({
  task,
  index,
  wbsNum,
  onDeleteTask,
  onEditTask
}: {
  task: Task;
  index: number;
  wbsNum: WbsNumber;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}) => {
  const { mutateAsync: deleteTask } = useDeleteTask();
  const { mutateAsync: editTask } = useEditTask();
  const { mutateAsync: editTaskAssignees } = useEditTaskAssignees();

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
    labels,
    priority,
    startDate,
    wpWbsNum
  }: EditTaskFormInput) => {
    try {
      // uses the project's wbs element id as fallback if no wp was selected
      const targetWbsNum =
        wpWbsNum ?? (task.wbsNum.workPackageNumber !== 0 ? { ...wbsNum, workPackageNumber: 0 } : undefined);

      await editTask({
        taskId,
        notes,
        title,
        deadline,
        startDate,
        priority,
        labelIds: labels.map((l) => l.taskLabelId),
        wbsNum: targetWbsNum
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

  const priorityColor = task.priority === 'HIGH' ? '#ef4345' : task.priority === 'LOW' ? '#00ab41' : '#FFA500';
  const isOverdue = task.deadline != null && new Date(task.deadline) < new Date() && task.status !== 'DONE';
  const isWpTask = task.wbsNum.workPackageNumber !== 0;
  const isProjectContext = wbsNum.workPackageNumber === 0;
  const wpColor = wpColors[(task.wbsNum.workPackageNumber - 1) % wpColors.length];

  return (
    <>
      <TaskModal
        modalShow={showModal}
        task={task}
        onHide={() => setShowModal(false)}
        onSubmit={handleEditTask}
        hasEditPermissions={notGuest(user.role)}
        wbsNum={wbsNum}
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
                        sx={{ marginTop: 1, marginRight: 2, backgroundColor: 'rgba(255,255,255,0.08)' }}
                        icon={<Construction />}
                        label={
                          task.assignees.length === 0
                            ? 'No Assignees'
                            : task.assignees.map((assignee) => fullNamePipe(assignee)).join(', ')
                        }
                        size="medium"
                      />
                      {isWpTask && // render iff task does have associated wp
                        isProjectContext && ( // and if on project's task page, not wp's
                          <Chip
                            icon={<Folder sx={{ color: `${wpColor.color} !important` }} />}
                            label={task.wbsName}
                            size="medium"
                            component={RouterLink}
                            to={`${routes.PROJECTS}/${wbsPipe(task.wbsNum)}`}
                            clickable
                            sx={{
                              marginTop: 1,
                              backgroundColor: wpColor.bg,
                              color: wpColor.color,
                              fontWeight: 500,
                              maxWidth: 275 // truncates wtih ellipses if it gets too long
                            }}
                          />
                        )}
                      {task.labels.map((label) => (
                        <Chip
                          key={label.taskLabelId}
                          label={label.name}
                          size="medium"
                          sx={{
                            marginTop: 1,
                            marginRight: 1,
                            backgroundColor: label.colorHexCode,
                            color: 'white',
                            fontWeight: 500
                          }}
                        />
                      ))}
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
