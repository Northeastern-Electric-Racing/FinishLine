import React from 'react';
import ScrollablePageBlock from './ScrollablePageBlock';
import { AuthenticatedUser } from 'shared';
import { useManyUserTasks } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import TeamTaskCard from './TeamTaskCard';
import { Box } from '@mui/material';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { getOverdueTasks } from '../../../utils/task.utils';

interface MyTeamsOverdueTasksProps {
  user: AuthenticatedUser;
}

const NoOverdueTeamTaskDisplay: React.FC = () => {
  return (
    <Box
      sx={{
        height: `calc(50vh - 100px)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <EmptyPageBlockDisplay
        icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 128 }} />}
        heading={"You're team is all caught up!"}
        message={"You're team has no overdue tasks!"}
      />
    </Box>
  );
};

const MyTeamsOverdueTasks: React.FC<MyTeamsOverdueTasksProps> = ({ user }) => {
  const teamsAsHead = user.teamsAsHead ?? [];
  const teamsAsLead = user.teamsAsLead ?? [];
  const teamsAsLeadership = [...teamsAsHead, ...teamsAsLead];
  // converting to set for no duplicate members
  const allMembers = new Set(teamsAsLeadership.map((team) => team.members).flat());
  const { data: tasks, isLoading, isError, error } = useManyUserTasks([...allMembers].map((member) => member.userId));

  if (isLoading || !tasks) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  const overdueTasks = getOverdueTasks(tasks);

  return (
    <ScrollablePageBlock title={`My Team's Overdue Tasks (${overdueTasks.length})`} height={50}>
      {overdueTasks.length === 0 ? (
        <NoOverdueTeamTaskDisplay />
      ) : (
        overdueTasks.map((task, index) => <TeamTaskCard task={task} taskNumber={index + 1} />)
      )}
    </ScrollablePageBlock>
  );
};

export default MyTeamsOverdueTasks;
