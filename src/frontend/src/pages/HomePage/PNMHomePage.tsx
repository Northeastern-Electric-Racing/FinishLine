import { Typography, Box, Grid } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import { useEffect, useState } from 'react';
import FAQsSection from './components/FAQsSection';
import TimelineSection from './components/TimelineSection';
import Tabs from '../../components/Tabs';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useHomePageContext } from '../../app/HomePageContext';
import { useAllTeamTypes } from '../../hooks/team-types.hooks';
import TeamTypeSection from './components/TeamTypeSection';

const PNMHomePage = () => {
  const {
    data: organization,
    isError: organizationIsError,
    error: organizationError,
    isLoading: organizationIsLoading
  } = useCurrentOrganization();
  const {
    data: teamTypes,
    isLoading: teamTypesIsLoading,
    isError: teamTypesIsError,
    error: teamTypesError
  } = useAllTeamTypes();

  const [recruitmentInfoTabValue, setRecruitmentInfoTabValue] = useState(0);
  const [teamTypeTabValue, setTeamTypeTabValue] = useState(0);
  const { setOnPNMHomePage, setOnGuestHomePage } = useHomePageContext();

  useEffect(() => {
    setOnPNMHomePage(true);
    setOnGuestHomePage(false);
  }, [setOnPNMHomePage, setOnGuestHomePage]);

  if (!organization || organizationIsLoading || !teamTypes || teamTypesIsLoading) return <LoadingIndicator />;
  if (organizationIsError) return <ErrorPage message={organizationError?.message} />;
  if (teamTypesIsError) return <ErrorPage message={teamTypesError?.message} />;

  const recruitmentInfoTabs = [
    { label: 'FAQs', component: <FAQsSection /> },
    { label: 'Timeline', component: <TimelineSection /> }
  ];

  const teamTypeTabs = teamTypes.map((teamType) => {
    return {
      label: teamType.name,
      component: <TeamTypeSection teamType={teamType} />
    };
  });

  return (
    <PageLayout title="Home" hidePageTitle>
      <Box sx={{ mt: 4, ml: 2 }}>
        <Grid container spacing={5}>
          <Grid item xs={7}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh'
              }}
            >
              <Box
                sx={{
                  flexGrow: 1,
                  flexBasis: '40%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h3">About NER</Typography>
                <Typography sx={{ mt: 4, fontSize: '1.2em' }}>{organization.description}</Typography>
              </Box>
              <Box
                sx={{
                  flexGrow: 1,
                  flexBasis: '60%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h3">Our Divisions</Typography>
                <Tabs tabs={teamTypeTabs} tabValue={teamTypeTabValue} setTabValue={setTeamTypeTabValue} />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={1} />
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
                <Tabs
                  tabs={recruitmentInfoTabs}
                  tabValue={recruitmentInfoTabValue}
                  setTabValue={setRecruitmentInfoTabValue}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageLayout>
  );
};

export default PNMHomePage;
