import React, { useEffect, useState } from 'react';
import ScrollablePageBlock from './ScrollablePageBlock';
import { AuthenticatedUser, Task, User } from 'shared';
import { useManyUserTasks, useUserTasks } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import TeamTaskCard from './TeamTaskCard';
import { Stack } from '@mui/material';
import { daysOverdue } from '../../../utils/datetime.utils';

interface MyTeamsOverdueTasksProps {
  user: AuthenticatedUser;
}

const MyTeamsOverdueTasks: React.FC<MyTeamsOverdueTasksProps> = ({ user }) => {
  const teamsAsHead = user.teamsAsHead ?? [];
  const teamsAsLead = user.teamsAsLead ?? [];
  const teamsAsLeadership = [...teamsAsHead, ...teamsAsLead];
  // converting to set for no duplicate members
  const allMembers = new Set(teamsAsLeadership.map((team) => team.members).flat());
  const { data: tasks, isLoading, isError, error } = useManyUserTasks([...allMembers].map((member) => member.userId));

  if (isLoading || !tasks) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  const overdueTasks = new Set(tasks.filter((task) => daysOverdue(new Date(task.deadline)) > 0));
  return (
    <ScrollablePageBlock title={`My Team's Overdue Tasks (${overdueTasks.size})`}>
      <Stack spacing={2}>
        {[...overdueTasks].map((task, index) => (
          <TeamTaskCard task={task} taskNumber={index + 1} />
        ))}
      </Stack>
    </ScrollablePageBlock>
  );
};

export default MyTeamsOverdueTasks;
