/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid } from '@mui/material';
import { useMemo } from 'react';
import { TeamWithProjects } from 'shared';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllTeamsWithProjects } from '../../hooks/teams.hooks';
import ErrorPage from '../ErrorPage';
import TeamSummary from './TeamSummary';
import PageLayout from '../../components/PageLayout';

const TeamsPage: React.FC = () => {
  const { data: teams, isLoading, isError, error } = useAllTeamsWithProjects();

  const [activeTeams, archivedTeams] = useMemo(() => {
    const active: TeamWithProjects[] = [];
    const archived: TeamWithProjects[] = [];
    (teams ?? []).forEach((team) => (team.dateArchived ? archived : active).push(team));
    return [active, archived];
  }, [teams]);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !teams) return <LoadingIndicator />;

  return (
    <>
      <PageLayout title="Teams">
        <Grid container spacing={2}>
          {activeTeams.map((team) => (
            <Grid item key={team.teamId}>
              <TeamSummary team={team} />
            </Grid>
          ))}
        </Grid>
      </PageLayout>
      <PageLayout useTitleForHelmet={false} title="Archived Teams">
        <Grid container spacing={2}>
          {archivedTeams.map((archivedTeam) => (
            <Grid item key={archivedTeam.teamId}>
              <TeamSummary team={archivedTeam} />
            </Grid>
          ))}
        </Grid>
      </PageLayout>
    </>
  );
};

export default TeamsPage;
