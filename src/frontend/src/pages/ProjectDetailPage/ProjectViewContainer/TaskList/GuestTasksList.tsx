import { Typography } from '@mui/material';
import { Box, useTheme } from '@mui/system';
import { BaseTask, TaskPriority, TaskStatus, WbsNumber } from 'shared';
import { useFilterTasks } from '../../../../hooks/tasks.hooks';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import ErrorPage from '../../../ErrorPage';

const TaskCard = ({ task }: { task: Pick<BaseTask, 'title' | 'priority'> }) => {
  const theme = useTheme();
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.High:
        return '#ff0000';
      case TaskPriority.Medium:
        return '#ff9800';
      default:
        return '#4caf50';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        p: 2,
        mb: 1,
        backgroundColor: theme.palette.background.paper,
        width: '100%',
        borderRadius: 1
      }}
    >
      <Typography
        sx={{
          color: getPriorityColor(task.priority),
          fontWeight: 'bold',
          flexShrink: 0
        }}
      >
        {task.priority}
      </Typography>
      <Typography> - {task.title}</Typography>
    </Box>
  );
};

// the same tasks the desktop board shows for the project (its own and its work packages')
export const GuestsTasksList = ({ wbsNum }: { wbsNum: WbsNumber }) => {
  const { data: tasks, isLoading, isError, error } = useFilterTasks({ wbsNum, andMemberTeam: true });

  if (isError) return <ErrorPage message={error.message} />;
  if (isLoading || !tasks) return <LoadingIndicator />;

  const backLogTasks = tasks.filter((task) => task.status === TaskStatus.IN_BACKLOG);
  const inProgressTasks = tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS);
  const doneTasks = tasks.filter((task) => task.status === TaskStatus.DONE);

  return (
    <Box justifyContent="space-between" mt={3}>
      {backLogTasks.length === 0 && inProgressTasks.length === 0 && doneTasks.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
          This project has no tasks associated with it
        </Typography>
      ) : (
        <>
          {backLogTasks.length > 0 && (
            <>
              <Typography variant="h5" sx={{ cursor: 'pointer', mb: 1 }}>
                Back Log
              </Typography>
              {backLogTasks.map((task) => (
                <TaskCard key={task.taskId} task={task} />
              ))}
            </>
          )}
          {inProgressTasks.length > 0 && (
            <>
              <Typography variant="h5" sx={{ cursor: 'pointer', mb: 1 }}>
                In Progress
              </Typography>
              {inProgressTasks.map((task) => (
                <TaskCard key={task.taskId} task={task} />
              ))}
            </>
          )}
          {doneTasks.length > 0 && (
            <>
              <Typography variant="h5" sx={{ cursor: 'pointer', mb: 1 }}>
                Done
              </Typography>
              {doneTasks.map((task) => (
                <TaskCard key={task.taskId} task={task} />
              ))}
            </>
          )}
        </>
      )}
    </Box>
  );
};
