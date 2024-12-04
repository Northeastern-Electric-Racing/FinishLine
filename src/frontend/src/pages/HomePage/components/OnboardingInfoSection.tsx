import { Grid, Typography, ListItem, List, useTheme, Button } from '@mui/material';
import { Box } from '@mui/system';
import { useAllUsefulLinks } from '../../../hooks/projects.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

const OnboardingInfoSection: React.FC = () => {
  const theme = useTheme();
  const contacts: string[] = [
    'President - Allyson Kolesar kolesar.a@northeastern.edu',
    'Chief Mechanical Engineer - Max Boone boone.m@northeastern.edu',
    'Chief Software Engineer - Peyton Mckee mckee.p@northeastern.edu'
  ];

  const { data: links, isError: linksIsError, error: linksError, isLoading: linksIsLoading } = useAllUsefulLinks();

  if (!links || linksIsLoading) return <LoadingIndicator />;
  if (linksIsError) return <ErrorPage message={linksError?.message} />;

  return (
    <Grid container item sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Grid item>
        <Box
          sx={{
            backgroundColor: 'gray',
            height: '25vh',
            borderRadius: '10px',
            width: '100%'
          }}
        >
          <Typography variant="h5">Onboarding</Typography>
        </Box>
      </Grid>
      <Grid item>
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            height: '25vh',
            borderRadius: '10px',
            width: '100%',
            overflow: 'hidden',
            overflowY: 'scroll'
          }}
        >
          <Typography variant="h5" sx={{ mb: 3, px: 2, pt: 2 }}>
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
            height: '25vh',
            borderRadius: '10px',
            width: '100%',
            background: theme.palette.background.paper
          }}
        >
          <Typography variant="h5" ml={2} pt={2}>
            Questions?
          </Typography>
          <Typography sx={{ mt: 1, mb: -1, ml: 2 }}>Feel free to contact:</Typography>
          <List sx={{ listStyleType: 'disc', pl: 2 }}>
            {contacts.map((contact) => {
              return <ListItem sx={{ display: 'list-item', padding: 0, ml: 2 }}>{contact}</ListItem>;
            })}
          </List>
        </Box>
      </Grid>
    </Grid>
  );
};

export default OnboardingInfoSection;
