import { Droppable } from '@hello-pangea/dnd';
import { Box, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import { Project, Task, TaskStatus, TaskWithIndex } from 'shared';
import { statusNames, TaskCard } from '.';
import { NERButton } from '../../../../../components/NERButton';
import { useCreateTask } from '../../../../../hooks/tasks.hooks';
import { useToast } from '../../../../../hooks/toasts.hooks';
import { toDateString } from 'shared';
import TaskFormModal, { EditTaskFormInput } from '../TaskFormModal';

export const TaskColumn = ({
  status,
  tasks,
  project,
  equalizedHeight,
  isDragging,
  onEditTask,
  onDeleteTask,
  onAddTask,
  onHeightChange
}: {
  status: TaskStatus;
  tasks: TaskWithIndex[];
  project: Project;
  equalizedHeight: number;
  isDragging: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (task: Task) => void;
  onHeightChange: (height: number) => void;
}) => {
  const { mutateAsync: createTask } = useCreateTask();
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const toast = useToast();
  const theme = useTheme();

  const handleCreateTask = async ({ notes, title, deadline, assignees, priority, startDate }: EditTaskFormInput) => {
    try {
      const task = await createTask({
        wbsNum: project.wbsNum,
        title,
        deadline: deadline ? toDateString(deadline) : undefined,
        startDate: startDate ? toDateString(startDate) : undefined,
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

  return (
    <>
      <TaskFormModal
        onSubmit={handleCreateTask}
        onHide={() => setShowCreateTaskModal(false)}
        modalShow={showCreateTaskModal}
        teams={project.teams}
      />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '8px',
          paddingBottom: '16px',
          backgroundColor: theme.palette.background.paper,
          marginLeft: '5px',
          borderRadius: '5px',
          minHeight: isDragging ? `${equalizedHeight}px` : undefined
        }}
      >
        <Typography align="center" variant="h5">
          {statusNames[status]}
        </Typography>
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
        <Droppable droppableId={status}>
          {(droppableProvided, snapshot) => (
            <Box
              ref={(droppableBox: HTMLElement | null) => {
                droppableProvided.innerRef(droppableBox); // give dnd lib access to dom node
                if (!droppableBox) return;

                const observer = new ResizeObserver(() => {
                  onHeightChange(droppableBox.scrollHeight);
                });
                observer.observe(droppableBox);
                return () => observer.disconnect();
              }}
              {...droppableProvided.droppableProps}
              className={snapshot.isDraggingOver ? ' isDraggingOver' : ''}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 5,
                padding: '5px',
                flex: 1,
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
      </Box>
    </>
  );
};
