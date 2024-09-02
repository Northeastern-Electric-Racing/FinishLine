import { Typography, Box } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { AuthenticatedUser } from 'shared';
import ImageWithButton from './components/ImageWithButton';

interface GuestHomePageProps {
  user: AuthenticatedUser;
  setOnGuestHomePage: (e: boolean) => void;
  setOnPNMHomePage: (e: boolean) => void;
}

const GuestHomePage = ({ user, setOnGuestHomePage, setOnPNMHomePage }: GuestHomePageProps) => {
  const handleClickFinishline = () => {
    setOnPNMHomePage(false);
    setOnGuestHomePage(false);
  };

  const handleClickLearnMore = () => {
    setOnGuestHomePage(false);
    setOnPNMHomePage(true);
  };

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
            onClick={handleClickLearnMore}
          />
          <ImageWithButton
            title="Explore Our Work as a Guest"
            imageSrc={`/Guest.png`}
            buttonText="FinishLine"
            onClick={handleClickFinishline}
          />
        </Box>
      </Box>
    </PageLayout>
  );
};
export default GuestHomePage;
