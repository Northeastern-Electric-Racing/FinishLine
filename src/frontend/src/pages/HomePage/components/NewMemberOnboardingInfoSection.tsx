import { Grid, Typography, ListItem, List, Link, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import OnboardingBlock from '../../AdminToolsPage/OnboardingConfig/OnboardingBlock';
import NewMemberMilestonesWidget from './NewMemberMilestonesWidget';
import NewMemberEventsWidget from './NewMemberEventsWidget';
import NewMemberSlackWidget from './NewMemberSlackWidget';
import NewMemberUsefulLinksWidget from './NewMemberUsefulLinksWidget';

interface NewMemberOnboardingInfoSectionProps {
  /** 'full' (default) shows every widget, for the new member dashboard. 'checklist' shows only
   * the onboarding block, useful links, and contacts, for the onboarding checklist page. */
  variant?: 'full' | 'checklist';
}

const NewMemberOnboardingInfoSection: React.FC<NewMemberOnboardingInfoSectionProps> = ({ variant = 'full' }) => {
  const theme = useTheme();
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
    <Grid container item sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <OnboardingBlock organization={organization} />
      {variant === 'full' && (
        <>
          <Grid item>
            <NewMemberEventsWidget />
          </Grid>
          <Grid item>
            <NewMemberMilestonesWidget />
          </Grid>
          <Grid item>
            <NewMemberSlackWidget />
          </Grid>
        </>
      )}
      <Grid item>
        <NewMemberUsefulLinksWidget
          dashboardFlag={variant === 'checklist' ? 'isOnOnboardingDashboard' : 'isOnNewMemberDashboard'}
        />
      </Grid>
      <Grid item>
        <Box
          sx={{
            height: '100%',
            borderRadius: '10px',
            width: '100%',
            background: theme.palette.background.paper
          }}
        >
          <Typography variant="h5" ml={2} pt={2}>
            Questions?
          </Typography>
          <Typography sx={{ mt: 1, ml: 2, fontWeight: 'bold' }}>Feel free to contact:</Typography>
          <List sx={{ listStyleType: 'disc', pl: 2 }}>
            {organization.contacts.map((contact) => {
              return (
                <ListItem key={`${contact.user.userId}-${contact.title}`} sx={{ display: 'list-item', padding: 0.5, ml: 2 }}>
                  {contact.user.firstName} {contact.user.lastName} - {contact.title}
                </ListItem>
              );
            })}
          </List>
          {organization.slackWorkspaceId && (
            <Typography sx={{ ml: 2, pb: 2 }}>
              You can find them on{' '}
              <Link
                href={`https://app.slack.com/client/${organization.slackWorkspaceId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Slack
              </Link>
            </Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default NewMemberOnboardingInfoSection;
