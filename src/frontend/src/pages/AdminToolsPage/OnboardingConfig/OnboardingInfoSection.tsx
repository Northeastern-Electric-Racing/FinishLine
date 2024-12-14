import { Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import UsefulLinksTable from './UsefulLinks/UsefulLinksTable';

const OnboardingInfoSection: React.FC = () => {
  return (
    <Grid container item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 4 }}>
      <Grid item>
        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.grey[600],
            height: '25vh',
            borderRadius: '10px',
            padding: '16px'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}
          >
            Onboarding
          </Typography>
        </Box>
      </Grid>
      <Grid item>
        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.grey[600],
            height: '25vh',
            borderRadius: '10px',
            padding: '16px'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}
          >
            Useful Links
          </Typography>
          <UsefulLinksTable />
        </Box>
      </Grid>
      <Grid item>
        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.grey[600],
            height: '25vh',
            borderRadius: '10px',
            padding: '16px'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}
          >
            Questions
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default OnboardingInfoSection;
