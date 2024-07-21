import { Typography, Box } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { AuthenticatedUser } from 'shared';
import { NERButton } from '../../components/NERButton';
import React from 'react';

interface GuestHomePageProps {
  user: AuthenticatedUser;
}

interface ImageWithButtonProps {
  title: string;
  imageSrc: string;
  buttonText: string;
  buttonOnClick: () => void;
}

const ImageWithButton: React.FC<ImageWithButtonProps> = ({ title, imageSrc, buttonText, buttonOnClick }) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <Box component="img" src={imageSrc} alt={buttonText} sx={{ width: '100%', height: 'auto' }} />
      <Typography
        sx={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10
        }}
      >
        {title}
      </Typography>
      <NERButton
        onClick={buttonOnClick}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10
        }}
      >
        {buttonText}
      </NERButton>
    </Box>
  );
};

const Apply = () => (
  <Box sx={{ textAlign: 'center' }}>
    <ImageWithButton
      title="Spring 2025 Applications are Open!"
      imageSrc={`public/Apply.png`}
      buttonText="Apply Now"
      buttonOnClick={() => console.log('Apply Now clicked')}
    />
  </Box>
);

const Guest = () => (
  <Box sx={{ textAlign: 'center' }}>
    <ImageWithButton
      title="Explore Our Work as a Guest"
      imageSrc={`public/Guest.png`}
      buttonText="FinishLine"
      buttonOnClick={() => console.log('FinishLine clicked')}
    />
  </Box>
);

const GuestHomePage = ({ user }: GuestHomePageProps) => (
  <PageLayout title="Home" hidePageTitle>
    <Typography variant="h3" textAlign="center" sx={{ mt: 2, pt: 3 }}>
      {user ? `Welcome, ${user.firstName}!` : 'Welcome, Guest!'}
    </Typography>
    <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 4 }}>
      <Apply />
      <Guest />
    </Box>
  </PageLayout>
);

export default GuestHomePage;
