import { useMediaQuery, Theme } from '@mui/material';
import { Project } from 'shared';
import { TaskListContent } from './TaskListContent';
import { GuestsTasksList } from '../GuestTasksList';

export const TaskList = ({ project, isGuest }: { project: Project; isGuest: boolean }) => {
  const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  return isSmall || isGuest ? (
    <GuestsTasksList project={project} />
  ) : (
    <TaskListContent
      tasks={project.tasks}
      wbsNum={project.wbsNum}
      wbsElementId={project.wbsElementId}
      workPackages={project.workPackages}
    />
  );
};
