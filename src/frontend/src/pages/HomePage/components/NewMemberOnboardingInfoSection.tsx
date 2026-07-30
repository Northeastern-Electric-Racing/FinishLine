import { Grid } from '@mui/material';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import OnboardingBlock from '../../AdminToolsPage/OnboardingConfig/OnboardingBlock';
import NewMemberMilestonesWidget from './NewMemberMilestonesWidget';
import NewMemberEventsWidget from './NewMemberEventsWidget';
import NewMemberSlackWidget from './NewMemberSlackWidget';
import NewMemberUsefulLinksWidget from './NewMemberUsefulLinksWidget';
import NewMemberContactsWidget from './NewMemberContactsWidget';

interface NewMemberOnboardingInfoSectionProps {
  /** 'full' (default) shows every widget, for the new member dashboard. 'checklist' shows only
   * the onboarding block, useful links, and contacts, for the onboarding checklist page. */
  variant?: 'full' | 'checklist';
}

const NewMemberOnboardingInfoSection: React.FC<NewMemberOnboardingInfoSectionProps> = ({ variant = 'full' }) => {
  const {
    data: organization,
    isLoading: organizationIsLoading,
    isError: organizationIsError,
    error: organizationError
  } = useCurrentOrganization();

  if (organizationIsError) {
    return <ErrorPage message={organizationError.message} />;
  }

  if (!organization || organizationIsLoading) return <LoadingIndicator />;

  return (
    <Grid container item sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
      <OnboardingBlock organization={organization} />
      {variant === 'full' && (
        <>
          <Grid item sx={{ width: '100%' }}>
            <NewMemberEventsWidget />
          </Grid>
          <Grid item sx={{ width: '100%' }}>
            <NewMemberMilestonesWidget />
          </Grid>
          <Grid item sx={{ width: '100%' }}>
            <NewMemberSlackWidget />
          </Grid>
        </>
      )}
      {variant === 'checklist' && (
        <>
          <Grid item sx={{ width: '100%' }}>
            <NewMemberUsefulLinksWidget dashboardFlag="isOnOnboardingDashboard" />
          </Grid>
          <Grid item sx={{ width: '100%' }}>
            <NewMemberContactsWidget />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default NewMemberOnboardingInfoSection;
