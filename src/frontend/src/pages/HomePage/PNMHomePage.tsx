import { Typography, Box, Grid } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import { useState } from 'react';
import FAQsSection from './components/FAQsSection';
import TimelineSection from './components/TimelineSection';
import Tabs from '../../components/Tabs';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

const PNMHomePage = () => {
  const { data: organization, isError, error, isLoading } = useCurrentOrganization();
  const [tabValue, setTabValue] = useState(0);

  if (!organization || isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const tabs = [
    { label: 'FAQs', component: <FAQsSection /> },
    { label: 'Timeline', component: <TimelineSection /> }
  ];

  return (
    <PageLayout title="Home" hidePageTitle>
      <Box sx={{ mt: 4, ml: 2 }}>
        <Grid container spacing={5}>
          <Grid item xs={8}>
            <Box>
              <Typography variant="h3">About NER</Typography>
              <Typography sx={{ mt: 4, fontSize: '1.2em' }}>{organization.description}</Typography>
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
