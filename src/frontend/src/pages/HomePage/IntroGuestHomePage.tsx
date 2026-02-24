import { Typography, Box } from '@mui/material';
import PageLayout from '../../components/PageLayout';
// import { useHistory } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useEffect } from 'react';
import { useHomePageContext } from '../../app/HomePageContext';
// import { useCurrentOrganization } from '../../hooks/organizations.hooks';
// import LoadingIndicator from '../../components/LoadingIndicator';
// import ErrorPage from '../ErrorPage';
// import { useGetImageUrl } from '../../hooks/onboarding.hook';
import FeaturedProjects from './components/FeaturedProjects';

const IntroGuestHomePage = () => {
  const user = useCurrentUser();
  // const history = useHistory();
  // const {
  //   data: organization,
  //   isLoading: organizationIsLoading,
  //   isError: organizationIsError,
  //   error: organizationError
  // } = useCurrentOrganization();
  const { setCurrentHomePage } = useHomePageContext();

  // const {
  //   data: applyInterestImageUrl,
  //   isLoading: applyImageLoading,
  //   isError: applyImageIsError,
  //   error: applyImageError
  // } = useGetImageUrl(organization?.applyInterestImageId ?? null);
  // const {
  //   data: exploreGuestImageUrl,
  //   isLoading: exploreImageLoading,
  //   isError: exploreImageIsError,
  //   error: exploreImageError
  // } = useGetImageUrl(organization?.exploreAsGuestImageId ?? null);

  useEffect(() => {
    setCurrentHomePage('guest');
  }, [setCurrentHomePage]);

  // if (organizationIsError) {
  //   return <ErrorPage message={organizationError.message} />;
  // }
  // if (applyImageIsError) return <ErrorPage message={applyImageError.message} />;
  // if (exploreImageIsError) return <ErrorPage message={exploreImageError.message} />;

  // if (!organization || organizationIsLoading || applyImageLoading || exploreImageLoading) return <LoadingIndicator />;
  // if (!applyInterestImageUrl || !exploreGuestImageUrl) return <LoadingIndicator />;

  return (
    <PageLayout title="Home" hidePageTitle>
      <Typography variant="h3" textAlign="center" sx={{ mt: 2, pt: 3 }}>
        {user ? `Welcome, ${user.firstName}!` : 'Welcome, Guest!'}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: { xs: 'column', md: 'row' },
          mt: 4,
          padding: '20px',
          px: { xs: 1, sm: 2 },
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ width: '100%', minWidth: 0 }}>
          <FeaturedProjects />
        </Box>
      </Box>
    </PageLayout>
  );
};

export default IntroGuestHomePage;
