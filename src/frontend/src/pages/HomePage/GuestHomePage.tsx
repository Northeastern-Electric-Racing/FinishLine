import { Typography, Box } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { AuthenticatedUser } from 'shared';
import ImageWithButton from './components/ImageWithButton';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useEffect } from 'react';
import { useHomePageContext } from '../../app/HomePageContext';

const GuestHomePage = () => {
  const user = useCurrentUser();
  const history = useHistory();
  const { setOnGuestHomePage, setOnPNMHomePage } = useHomePageContext();

  useEffect(() => {
    setOnGuestHomePage(true);
    setOnPNMHomePage(false);
    console.log('test');
  }, []);

  return (
    <PageLayout title="Home" hidePageTitle>
      <Typography variant="h3" textAlign="center" sx={{ mt: 2, pt: 3 }}>
        {user ? `Welcome, ${user.firstName}!` : 'Welcome, Guest!'}
      </Typography>
      <Box sx={{ display: 'flex', mt: 4 }}>
        <Box sx={{ display: 'flex', padding: '50px', gap: 5 }}>
          <ImageWithButton
            title="Interested in applying"
            imageSrc={`/Apply.png`}
            buttonText="Learn More"
            onClick={() => history.push(routes.HOME_PNM)}
          />
          <ImageWithButton
            title="Explore Our Work as a Guest"
            imageSrc={`/Guest.png`}
            buttonText="FinishLine"
            onClick={() => {
              setOnGuestHomePage(false);
              history.push(routes.HOME);
            }}
          />
        </Box>
      </Box>
    </PageLayout>
  );
};
export default GuestHomePage;
