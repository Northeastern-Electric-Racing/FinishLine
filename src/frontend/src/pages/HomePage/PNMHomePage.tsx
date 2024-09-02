import { Typography, Box, Grid } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import { useState } from 'react';
import FAQsList from './FAQsList';
import Timeline from './components/Timeline';
import Tabs from '../../components/Tabs';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

const PNMHomePage = () => {
  const { data: organization, isError, error, isLoading } = useCurrentOrganization();

  // if (!organization) return <LoadingIndicator />;

  const [tabValue, setTabValue] = useState(0);
  const tabs = [
    { label: 'FAQs', component: <FAQsList /> },
    { label: 'Timeline', component: <Timeline /> }
  ];

  return (
    <PageLayout title="Home" hidePageTitle>
      <Box sx={{ mt: 4, ml: 2 }}>
        <Grid container spacing={5}>
          <Grid item xs={8}>
            <Box>
              <Typography variant="h3">About NER</Typography>
              <Typography sx={{ mt: 4, fontSize: '1.2em' }}>{organization?.description}</Typography>
            </Box>
          </Grid>

          <Grid item xs={4}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography sx={{ textAlign: 'center' }} variant="h3">
                Our Recruitment
              </Typography>
              <Box sx={{ mt: 4, mb: 2 }}>
                <Tabs tabs={tabs} tabValue={tabValue} setTabValue={setTabValue} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageLayout>
  );
};
export default PNMHomePage;
