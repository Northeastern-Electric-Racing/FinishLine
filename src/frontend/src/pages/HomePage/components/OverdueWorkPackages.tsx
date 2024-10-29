import React from 'react';
import { AuthenticatedUser, isAdmin, Team, WorkPackage } from 'shared';
import ScrollablePageBlock from './ScrollablePageBlock';
import { Box, Stack, useTheme } from '@mui/material';
import WorkPackageCard from './WorkPackageCard';
import { useAllWorkPackages, useGetManyWorkPackages } from '../../../hooks/work-packages.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { daysOverdue } from '../../../utils/datetime.utils';

interface OverdueWorkPackagesViewProps {
  workPackages: WorkPackage[];
}

interface OverdueWorkPackagesProps {
  user: AuthenticatedUser;
}

const getAllWbsNumFromTeams = (teams: Team[]) => {
  const projects = teams.map((team) => team.projects).flat();
  const workPackages = projects.map((project) => project.workPackages).flat();
  return workPackages.map((wp) => wp.wbsNum);
};

const OverdueWorkPackagesView: React.FC<OverdueWorkPackagesViewProps> = ({ workPackages }) => {
  return (
    <ScrollablePageBlock>
      <Stack spacing={2} sx={{ mt: 10 }}>
        {workPackages.map((wp) => (
          <WorkPackageCard wp={wp} />
        ))}
      </Stack>
    </ScrollablePageBlock>
  );
};

const OverdueWorkPackages: React.FC<OverdueWorkPackagesProps> = ({ user }) => {
  const teamsAsLeadership = [...user.teamsAsHead, ...user.teamsAsLead];
  const { data: allWps, isLoading: isLoadingAllWps, isError: isErrorAllWps, error: errorAllWps } = useAllWorkPackages();
  const {
    data: teamWps,
    isLoading: isLoadingTeamWps,
    isError: isErrorTeamWps,
    error: errorTeamWps
  } = useGetManyWorkPackages(getAllWbsNumFromTeams(teamsAsLeadership));

  if (isLoadingAllWps || isLoadingTeamWps || !allWps || !teamWps) return <LoadingIndicator />;
  if (isErrorAllWps) return <ErrorPage message={errorAllWps.message} />;
  if (isErrorTeamWps) return <ErrorPage message={errorTeamWps.message} />;

  const displayedWps = isAdmin(user.role) ? allWps : teamWps;
  const overdueWps = displayedWps.filter((wp) => daysOverdue(wp.endDate) > 0);

  return <OverdueWorkPackagesView workPackages={overdueWps} />;
};

export default OverdueWorkPackages;
