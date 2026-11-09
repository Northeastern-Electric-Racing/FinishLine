import { useMediaQuery, Theme } from '@mui/material';
import { ProjectDetail } from 'shared';
import { TaskListContent } from './TaskListContent';
import { GuestsTasksList } from '../GuestTasksList';

export const TaskList = ({ project, isGuest }: { project: ProjectDetail; isGuest: boolean }) => {
  const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  return isSmall || isGuest ? (
    <GuestsTasksList wbsNum={project.wbsNum} />
  ) : (
    <TaskListContent context="project" wbsNum={project.wbsNum} />
  );
};
