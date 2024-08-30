import { Typography, Box, Grid } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import { useState } from 'react';
import FAQsList from './FAQsList';
import Timeline from './components/Timeline';
import Tabs from '../../components/Tabs';

const PNMHomePage = () => {
  const { data: organization } = useCurrentOrganization();
  const [tabValue, setTabValue] = useState(0);
  const tabs = [
    { label: 'FAQs', value: 0 },
    { label: 'Timeline', value: 1 }
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
              {tabValue === 0 ? <FAQsList /> : <Timeline />}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageLayout>
  );
};
export default PNMHomePage;
