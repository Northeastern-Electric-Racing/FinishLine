import { Droppable } from '@hello-pangea/dnd';
import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { Project, Task, TaskStatus } from 'shared';
import { statusNames, TaskCard } from '.';
import { NERButton } from '../../../../../components/NERButton';
import { useCreateTask } from '../../../../../hooks/tasks.hooks';
import { useToast } from '../../../../../hooks/toasts.hooks';
import { transformDate } from '../../../../../utils/datetime.utils';
import TaskFormModal, { EditTaskFormInput } from '../TaskFormModal';

export const TaskColumn = ({ status, tasks, project }: { status: Task['status']; tasks: Task[]; project: Project }) => {
  const { mutateAsync: createTask } = useCreateTask(project.wbsNum);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const toast = useToast();

  const handleCreateTask = async ({ notes, title, deadline, assignees, priority }: EditTaskFormInput) => {
    try {
      await createTask({
        title,
        deadline: transformDate(deadline),
        priority,
        status: status as TaskStatus,
        assignees,
        notes
      });
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
          paddingTop: '8px',
          paddingBottom: '16px',
          backgroundColor: '#454545',
          marginLeft: '5px',
          borderRadius: '5px'
        }}
      >
        <Typography align="center" variant="h5">
          {statusNames[status]}
        </Typography>
        <NERButton
          sx={{ marginTop: '5px', backgroundColor: '#545454', width: 'calc(100% - 10px)', marginX: '5px' }}
          onClick={() => setShowCreateTaskModal(true)}
        >
          + Add A Task
        </NERButton>
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
                <TaskCard key={task.taskId} task={task} index={index} project={project} />
              ))}
              {droppableProvided.placeholder}
            </Box>
          )}
        </Droppable>
      </Box>
    </>
  );
};
