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
    setCurrentHomePage('pnm');
  }, [setCurrentHomePage]);

  return (
    <PageLayout title="Select Subteam" hidePageTitle>
      <Box
        sx={{
          padding: 4,
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center', width: '60%' }}>
          <Typography
            variant="h3"
            sx={{ textAlign: 'center', fontWeight: 'bold', mb: 3 }}
          >
            Select Subteam
          </Typography>
          <Typography
            variant="h5"
            sx={{ textAlign: 'center', mb: 4 }}
          >
            The application link has opened in a new tab. Please complete the application and return to this page to select a subteam.
          </Typography>
          <TeamTypesSection onSelectSubteamPage={true} />
        </Box>

        <NERButton
          variant="contained"
          sx={{ mt: 4, fontSize: '1.3rem', alignSelf: 'center' }}
          onClick={() => history.push(routes.HOME_GUEST)}
        >
          Return to Home Page
        </NERButton>
      </Box>
    </PageLayout>
  );
};

export default SelectSubteamPage;
