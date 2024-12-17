import { Grid, Typography, ListItem, List, useTheme, Button } from '@mui/material';
import { Box } from '@mui/system';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import OnboardingBlock from '../../../components/OnboardingBlock';
import { useAllUsefulLinks } from '../../../hooks/projects.hooks';

const OnboardingInfoSection: React.FC = () => {
  const theme = useTheme();
  const {
    data: organization,
    isLoading: organizationIsLoading,
    isError: organizationIsError,
    error: organizationError
  } = useCurrentOrganization();

  const { data: links, isError: linksIsError, error: linksError, isLoading: linksIsLoading } = useAllUsefulLinks();

  if (organizationIsError) {
    return <ErrorPage message={organizationError.message} />;
  }

  if (linksIsError) return <ErrorPage message={linksError?.message} />;

  if (!organization || organizationIsLoading || !links || linksIsLoading) return <LoadingIndicator />;

  return (
    <Grid container item sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <OnboardingBlock organization={organization} />
      <Grid item>
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: '10px',
            width: '100%',
            overflow: 'hidden',
            overflowY: 'auto',
            paddingBottom: 2,
            minHeight: '150px'
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, px: 2, pt: 2 }}>
            Useful Links
          </Typography>
          <Grid container spacing={2} justifyContent="center" sx={{ px: 2 }}>
            {links.map((link) => {
              return (
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: '#616161',
                      color: 'white',
                      borderRadius: '10px',
                      height: '5vh',
                      '&:hover': { backgroundColor: '#ef4345' }
                    }}
                    href={link.url}
                    target="_blank"
                  >
                    {link.linkType.name}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </Box>
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
              return <ListItem sx={{ display: 'list-item', padding: 0.5, ml: 2 }}>{contact}</ListItem>;
            })}
          </List>
        </Box>
      </Grid>
    </Grid>
  );
};

export default OnboardingInfoSection;
