import { Grid, Typography, ListItem, List, useTheme } from '@mui/material';
import { Box } from '@mui/system';

const InfoBlock: React.FC = () => {
  const theme = useTheme();
  const contacts: string[] = [
    'President - Allyson Kolesar kolesar.a@northeastern.edu',
    'Chief Mechanical Engineer - Max Boone boone.m@northeastern.edu',
    'Chief Software Engineer - Peyton Mckee mckee.p@northeastern.edu'
  ];

  return (
    <Grid container item sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
            Onboarding
          </Typography>
          <Typography sx={{ mt: 1, mb: -1, ml: 2 }}>
            Thank you for applying to Northeastern Electric Racing! After reviewing your application, we are very excited to
            officially welcome you to our team.
          </Typography>
        </Box>
      </Grid>
      <Grid item>
        <Box
          sx={{
            backgroundColor: 'gray',
            height: '25vh',
            borderRadius: '10px',
            width: '100%'
          }}
        >
          <Typography variant="h5">Useful Links</Typography>
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

export default InfoBlock;
