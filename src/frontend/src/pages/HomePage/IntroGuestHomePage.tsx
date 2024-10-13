import { Typography, Box } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { AuthenticatedUser } from 'shared';
import ImageWithButton from './components/ImageWithButton';
import emitter from '../../app/EventBus';

interface IntroGuestHomePageProps {
  user: AuthenticatedUser;
  setOnMemberHomePage: (e: boolean) => void;
}

const IntroGuestHomePage = ({ user, setOnMemberHomePage }: IntroGuestHomePageProps) => {
  const handleClick = () => {
    emitter.emit('memberHomePage', true);
    setOnMemberHomePage(true);
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
            onClick={() => {}}
          />
          <ImageWithButton
            title="Explore Our Work as a Guest"
            imageSrc={`/Guest.png`}
            buttonText="FinishLine"
            onClick={handleClick}
          />
        </Box>
      </Box>
    </PageLayout>
  );
};
export default IntroGuestHomePage;