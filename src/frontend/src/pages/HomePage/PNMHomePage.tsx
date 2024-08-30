import { Typography, Box, Grid } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';

const PNMHomePage = () => {
  const { data: organization } = useCurrentOrganization();

  return (
    <PageLayout title="Home" hidePageTitle>
      <Box sx={{ mt: 4, ml: 2 }}>
        <Grid container spacing={5}>
          <Grid item xs={8}>
            <Box>
              <Typography variant="h3">About NER</Typography>
              <Typography sx={{ mt: 4, fontSize: '1.5em' }}>{organization?.description}</Typography>
            </Box>
          </Grid>

          <Grid item xs={4}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Typography variant="h3">Our Recruitment</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageLayout>
  );
};
export default PNMHomePage;
