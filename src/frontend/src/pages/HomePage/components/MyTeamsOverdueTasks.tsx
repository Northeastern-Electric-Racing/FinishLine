import React, { useEffect, useState } from 'react';
import ScrollablePageBlock from './ScrollablePageBlock';
import { AuthenticatedUser, Task, User } from 'shared';
import { useUserTasks } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import TeamTaskCard from './TeamTaskCard';
import { Stack } from '@mui/material';
import { daysOverdue } from '../../../utils/datetime.utils';

interface MyTeamsOverdueTasksProps {
  user: AuthenticatedUser;
}

interface IndividualTaskCardsProps {
  member: User;
  overdueTasks: Set<Task>;
  setOverdueTasks: (overdueTasks: Set<Task>) => void;
}

const IndividualTaskCards: React.FC<IndividualTaskCardsProps> = ({ member, overdueTasks, setOverdueTasks }) => {
  const { data: tasks, isLoading, isError, error } = useUserTasks(member.userId);

  if (isLoading || !tasks) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  const individualOverdueTasks = new Set(tasks.filter((task) => daysOverdue(new Date(task.deadline)) > 0));
  setOverdueTasks(individualOverdueTasks);
  return (
    <Stack spacing={2}>
      {[...individualOverdueTasks.difference(overdueTasks)].map((task, index) => (
        <TeamTaskCard task={task} taskNumber={index + 1} />
      ))}
    </Stack>
  );
};

const MyTeamsOverdueTasks: React.FC<MyTeamsOverdueTasksProps> = ({ user }) => {
  const [overdueTasks, setOverdueTasks] = useState<Set<Task>>(new Set());
  const teamsAsHead = user.teamsAsHead ?? [];
  const teamsAsLead = user.teamsAsLead ?? [];
  const teamsAsLeadership = [...teamsAsHead, ...teamsAsLead];
  // converting to set for no duplicate members
  const allMembers = new Set(teamsAsLeadership.map((team) => team.members).flat());
  return (
    <ScrollablePageBlock title={`My Team's Overdue Tasks (${overdueTasks.size})`}>
      {[...allMembers].map((member) => (
        <IndividualTaskCards member={member} overdueTasks={overdueTasks} setOverdueTasks={setOverdueTasks} />
      ))}
    </ScrollablePageBlock>
  );
};

export default MyTeamsOverdueTasks;
