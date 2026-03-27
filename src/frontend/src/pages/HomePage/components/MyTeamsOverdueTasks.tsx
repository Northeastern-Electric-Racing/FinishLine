import React from 'react';
import ScrollablePageBlock from './ScrollablePageBlock';
import { AuthenticatedUser } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import TeamTaskCard from './TeamTaskCard';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { useOverdueTasksByTeamLeader } from '../../../hooks/tasks.hooks';

interface MyTeamsOverdueTasksProps {
  user: AuthenticatedUser;
}

const NoOverdueTeamTaskDisplay = () => {
  return (
    <EmptyPageBlockDisplay
      icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 128 }} />}
      heading={'Your team is all caught up!'}
      message={'Your team has no overdue tasks!'}
    />
  );
};

const MyTeamsOverdueTasks: React.FC<MyTeamsOverdueTasksProps> = ({ user }) => {
  const { data: overdueTasks, isLoading, isError, error } = useOverdueTasksByTeamLeader(user.userId);

  if (isLoading || !overdueTasks) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  return (
    <ScrollablePageBlock title={`My Team's Overdue Tasks (${overdueTasks.length})`}>
      {overdueTasks.length === 0 ? (
        <NoOverdueTeamTaskDisplay />
      ) : (
        overdueTasks.map((task, index) => <TeamTaskCard task={task} taskNumber={index + 1} />)
      )}
    </ScrollablePageBlock>
  );
};

export default MyTeamsOverdueTasks;
