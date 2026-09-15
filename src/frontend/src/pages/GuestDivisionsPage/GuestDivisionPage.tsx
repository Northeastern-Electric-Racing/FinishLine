import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { Box, useMediaQuery } from '@mui/system';
import PageLayout from '../../components/PageLayout';
import { useAllTeamTypes } from '../../hooks/team-types.hooks';
import { Typography } from '@mui/material';
import GuestTeamCard from './GuestTeamCard';

const GuestDivisionPage: React.FC = () => {
  const isMobilePortrait = useMediaQuery('(max-width:480px)');
  const {
    isLoading: teamTypesIsLoading,
    isError: teamTypesIsError,
    data: allTeamTypes,
    error: teamTypesError
  } = useAllTeamTypes();

  if (teamTypesIsError) return <ErrorPage message={teamTypesError.message} />;
  if (teamTypesIsLoading || !allTeamTypes) return <LoadingIndicator />;

  if (allTeamTypes.length === 0) {
    return (
      <PageLayout title={'Divisions'}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh'
          }}
        >
          <Typography>No Teams Found!</Typography>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={'Divisions'}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobilePortrait ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobilePortrait ? 2 : 3,
          width: '100%',
          px: isMobilePortrait ? 1 : 0
        }}
      >
        {allTeamTypes.map((teamType) => (
          <GuestTeamCard key={teamType.teamTypeId} teamType={teamType} />
        ))}
      </Box>
    </PageLayout>
  );
};

export default GuestDivisionPage;
