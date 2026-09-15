import { Typography } from '@mui/material';
import { Box, useTheme } from '@mui/system';
import { Project, TaskPriority, TaskStatus } from 'shared';

const TaskCard = ({ task }: { task: any }) => {
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

export const GuestsTasksList = ({ project }: { project: Project }) => {
  const backLogTasks = project.tasks.filter((task) => task.status === TaskStatus.IN_BACKLOG);
  const inProgressTasks = project.tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS);
  const doneTasks = project.tasks.filter((task) => task.status === TaskStatus.DONE);

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
                <TaskCard task={task} />
              ))}
            </>
          )}
          {inProgressTasks.length > 0 && (
            <>
              <Typography variant="h5" sx={{ cursor: 'pointer', mb: 1 }}>
                In Progress
              </Typography>
              {inProgressTasks.map((task) => (
                <TaskCard task={task} />
              ))}
            </>
          )}
          {doneTasks.length > 0 && (
            <>
              <Typography variant="h5" sx={{ cursor: 'pointer', mb: 1 }}>
                Done
              </Typography>
              {doneTasks.map((task) => (
                <TaskCard task={task} />
              ))}
            </>
          )}
        </>
      )}
    </Box>
  );
};
