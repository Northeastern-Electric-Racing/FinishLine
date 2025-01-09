import { Box, Grid, Typography } from '@mui/material';
import { TeamType } from 'shared';
import { useGetImageUrl } from '../../../hooks/onboarding.hook';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAllTeamTypes, useToggleOnboardingUser } from '../../../hooks/team-types.hooks';
import ErrorPage from '../../ErrorPage';
import { useState } from 'react';
import Tabs from '../../../components/Tabs';
import { NERButton } from '../../../components/NERButton';
import NERModal from '../../../components/NERModal';
import { routes } from '../../../utils/routes';
import { useHistory } from 'react-router-dom';

interface TeamTypeSectionProps {
  teamType: TeamType;
  onSelectSubteamPage?: boolean;
}

const TeamTypesSection = ({ onSelectSubteamPage }: { onSelectSubteamPage?: boolean }) => {
  const [teamTypeTabValue, setTeamTypeTabValue] = useState(0);

  const {
    data: teamTypes,
    isLoading: teamTypesIsLoading,
    isError: teamTypesIsError,
    error: teamTypesError
  } = useAllTeamTypes();

  if (!teamTypes || teamTypesIsLoading) return <LoadingIndicator />;
  if (teamTypesIsError) return <ErrorPage message={teamTypesError?.message} />;

  const orderedTeamTypes = teamTypes.sort((a: TeamType, b: TeamType) => {
    return a.name.localeCompare(b.name);
  });

  const teamTypeTabs = orderedTeamTypes.map((teamType) => {
    return {
      label: teamType.name,
      component: <TeamTypeSection teamType={teamType} onSelectSubteamPage={onSelectSubteamPage} />
    };
  });

  return <Tabs tabs={teamTypeTabs} tabValue={teamTypeTabValue} setTabValue={setTeamTypeTabValue} />;
};

const TeamTypeSection = ({ teamType, onSelectSubteamPage = false }: TeamTypeSectionProps) => {
  const [showModal, setShowModal] = useState(false);
  const history = useHistory();
  const { data: imageUrl, isLoading: imageIsLoading } = useGetImageUrl(teamType.imageFileId);
  const { mutateAsync: toggleOnboardingUser, isLoading: toggleOnboardingIsLoading } = useToggleOnboardingUser();

  if (imageIsLoading || toggleOnboardingIsLoading) return <LoadingIndicator />;

  const handleSubmit = async () => {
    setShowModal(false);
    await toggleOnboardingUser(teamType.teamTypeId);
    history.push(routes.HOME_ONBOARDING, { teamType });
  };

  return (
    <Grid container spacing={4} alignItems="flex-start" sx={{ p: 2 }}>
      <Grid item xs={12} md={imageUrl ? 6 : 12}>
        {imageUrl && (
          <Box
            component="img"
            src={imageUrl}
            sx={{
              width: '30vw',
              height: 'auto',
              maxWidth: '400px',
              display: 'block',
              ml: '0'
            }}
          />
        )}
      </Grid>
      <Grid item xs={12} md={imageUrl ? 6 : 12}>
        <Box sx={{ p: 2 }}>
          <Typography sx={{ fontSize: '1.3em', textAlign: 'center' }}>{teamType.description}</Typography>
          {onSelectSubteamPage && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <NERButton variant="contained" onClick={() => setShowModal(true)}>
                Select
              </NERButton>
            </Box>
          )}
        </Box>
      </Grid>
      {showModal && (
        <NERModal open={showModal} onHide={() => setShowModal(false)} title="Select Subteam" onSubmit={handleSubmit}>
          Are you sure you want to join the {teamType.name} division?
        </NERModal>
      )}
    </Grid>
  );
};

export default TeamTypesSection;
