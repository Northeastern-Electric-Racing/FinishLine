import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { Box, useMediaQuery } from '@mui/system';
import PageLayout from '../../components/PageLayout';
import GuestSubteamCard from './GuestSubteamCard';
import { useAllTeams } from '../../hooks/teams.hooks';
import { useAllTeamTypes } from '../../hooks/team-types.hooks';
import { Typography } from '@mui/material';

interface GuestTeamPageProps {
  teamTypeId: string;
}

const GuestTeamPage: React.FC<GuestTeamPageProps> = ({ teamTypeId }) => {
  const isMobilePortrait = useMediaQuery('(max-width:480px)');
  const { isLoading: teamsIsLoading, isError: teamsIsError, data: allTeams, error: teamsError } = useAllTeams();
  const {
    isLoading: teamTypesIsLoading,
    isError: teamTypesIsError,
    data: allTeamTypes,
    error: teamTypesError
  } = useAllTeamTypes();

  if (teamsIsLoading || !allTeams || teamTypesIsLoading || !allTeamTypes) return <LoadingIndicator />;
  if (teamsIsError) return <ErrorPage message={teamsError.message} />;
  if (teamTypesIsError) return <ErrorPage message={teamTypesError.message} />;

  const teams = allTeams.filter((team) => team.teamType?.teamTypeId === teamTypeId);
  const teamTypeName = allTeamTypes.find((tt) => tt.teamTypeId === teamTypeId)?.name ?? '';

  if (teams.length === 0) {
    return (
      <PageLayout title={teamTypeName} previousPages={[{ name: 'Divisions', route: '/teams' }]}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh'
          }}
        >
          <Typography>No Teams found for this Division</Typography>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={teamTypeName} previousPages={[{ name: 'Divisions', route: '/teams' }]}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobilePortrait ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobilePortrait ? 2 : 3,
          width: '100%',
          px: isMobilePortrait ? 1 : 0
        }}
      >
        {teams.map((team) => (
          <GuestSubteamCard key={team.teamId} team={team} />
        ))}
      </Box>
    </PageLayout>
  );
};

export default GuestTeamPage;
