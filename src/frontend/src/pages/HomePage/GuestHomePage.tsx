import { Typography, Box } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { AuthenticatedUser } from 'shared';
import ImageWithButton from './ImageWithButton';
import React from 'react';

interface GuestHomePageProps {
  user: AuthenticatedUser;
}

const GuestHomePage = ({ user }: GuestHomePageProps) => (
  <PageLayout title="Home" hidePageTitle>
    <Typography variant="h3" textAlign="center" sx={{ mt: 2, pt: 3 }}>
      {user ? `Welcome, ${user.firstName}!` : 'Welcome, Guest!'}
    </Typography>
    <Box sx={{ display: 'flex', mt: 4 }}>
      <Box sx={{ display: 'flex', padding: '50px', gap: 5 }}>
        <ImageWithButton
          title="Spring 2025 Applications are Open!"
          imageSrc={`/Apply.png`}
          buttonText="Learn More"
          onClick={() => console.log('Apply Now clicked')}
        />
        <ImageWithButton
          title="Explore Our Work as a Guest"
          imageSrc={`/Guest.png`}
          buttonText="FinishLine"
          onClick={() => console.log('FinishLine clicked')}
        />
      </Box>
    </Box>
  </PageLayout>
);

export default GuestHomePage;
