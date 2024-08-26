import { Droppable } from '@hello-pangea/dnd';
import { Box, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import { Project, Task, TaskStatus, TaskWithIndex } from 'shared';
import { statusNames, TaskCard } from '.';
import { NERButton } from '../../../../../components/NERButton';
import { useCreateTask } from '../../../../../hooks/tasks.hooks';
import { useToast } from '../../../../../hooks/toasts.hooks';
import { transformDate } from '../../../../../utils/datetime.utils';
import TaskFormModal, { EditTaskFormInput } from '../TaskFormModal';

export const TaskColumn = ({
  status,
  tasks,
  project,
  onEditTask,
  onDeleteTask,
  onAddTask
}: {
  status: Task['status'];
  tasks: TaskWithIndex[];
  project: Project;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (task: Task) => void;
}) => {
  const { mutateAsync: createTask } = useCreateTask(project.wbsNum);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const toast = useToast();
  const theme = useTheme();

  const handleCreateTask = async ({ notes, title, deadline, assignees, priority }: EditTaskFormInput) => {
    try {
      const task = await createTask({
        title,
        deadline: transformDate(deadline),
        priority,
        status: status as TaskStatus,
        assignees,
        notes
      });
      onAddTask(task);
      toast.success('Task Successfully Created!');
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 6000);
      }
    }
    setShowCreateTaskModal(false);
  };

  const taskTitle =
    status === TaskStatus.IN_BACKLOG
      ? 'New Backlog Task'
      : status === TaskStatus.IN_PROGRESS
      ? 'New In Progress Task'
      : 'New Done Task';

  return (
    <>
      <TaskFormModal
        onSubmit={handleCreateTask}
        onHide={() => setShowCreateTaskModal(false)}
        modalShow={showCreateTaskModal}
        teams={project.teams}
        title={taskTitle}
      />
      <Box
        sx={{
          flex: 1,
          paddingTop: '8px',
          paddingBottom: '16px',
          backgroundColor: theme.palette.background.paper,
          marginLeft: '5px',
          borderRadius: '5px'
        }}
      >
        <Typography align="center" variant="h5">
          {statusNames[status]}
        </Typography>
        <Droppable droppableId={status}>
          {(droppableProvided, snapshot) => (
            <Box
              ref={droppableProvided.innerRef}
              {...droppableProvided.droppableProps}
              className={snapshot.isDraggingOver ? ' isDraggingOver' : ''}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 5,
                padding: '5px',
                '&.isDraggingOver': {
                  bgcolor: '#dadadf'
                }
              }}
            >
              {tasks.map((task, index) => (
                <TaskCard
                  onDeleteTask={onDeleteTask}
                  onEditTask={onEditTask}
                  key={task.taskId}
                  task={task}
                  index={index}
                  project={project}
                />
              ))}
              {droppableProvided.placeholder}
            </Box>
          )}
        </Droppable>
        <NERButton
          sx={{
            marginTop: '5px',
            backgroundColor: theme.palette.secondary.contrastText,
            width: 'calc(100% - 10px)',
            marginX: '5px'
          }}
          onClick={() => setShowCreateTaskModal(true)}
        >
          + Add A Task
        </NERButton>
      </Box>
    </>
  );
};
