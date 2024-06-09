import { useMediaQuery, Typography, Theme } from '@mui/material';
import { Project } from 'shared';
import { TaskListContent } from './TaskListContent';

export const TaskList = ({ project }: { project: Project }) => {
  const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  return isSmall ? <FallbackForMobile /> : <TaskListContent project={project} />;
};

const FallbackForMobile = () => (
  <Typography mt={3} align="center">
    The Kanban board demo is not available on mobile
  </Typography>
);
