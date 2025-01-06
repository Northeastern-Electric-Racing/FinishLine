import { Typography, Box } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { NERButton } from '../../components/NERButton';
import { useEffect } from 'react';
import { useHomePageContext } from '../../app/HomePageContext';
import { routes } from '../../utils/routes';
import { useHistory } from 'react-router-dom';
import TeamTypesSection from './components/TeamTypeSection';

const SelectSubteamPage = () => {
  const history = useHistory();
  const { setCurrentHomePage } = useHomePageContext();

  useEffect(() => {
    setCurrentHomePage('selectSubteam');
  }, [setCurrentHomePage]);

  return (
    <PageLayout title="Select Subteam" hidePageTitle>
      <Box
        sx={{
          padding: 4,
          pt: '2in'
        }}
      >
        <Typography
          variant="h3"
          marginLeft="auto"
          sx={{ marginTop: 2, textAlign: 'center', justifyContent: 'center', pt: 1, padding: 0, fontWeight: 1 }}
        >
          Select Subteam
        </Typography>
        <Typography
          variant="h5"
          marginLeft="auto"
          sx={{ marginTop: 2, textAlign: 'center', justifyContent: 'center', pt: 1, padding: 0, fontWeight: 1 }}
        >
          The application link has opened in a new tab. Please complete the application and return to this page to select a
          subteam.
        </Typography>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <TeamTypesSection onSelectSubteamPage={true} />
          <NERButton variant="contained" onClick={() => history.push(routes.HOME_GUEST)}>
            Return to Home Page
          </NERButton>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default SelectSubteamPage;
