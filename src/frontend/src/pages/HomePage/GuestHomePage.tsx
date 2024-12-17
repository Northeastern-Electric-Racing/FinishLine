import { Typography, Box } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import ImageWithButton from './components/ImageWithButton';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useEffect } from 'react';
import { useHomePageContext } from '../../app/HomePageContext';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useGetImageUrl } from '../../hooks/onboarding.hooks';

const GuestHomePage = () => {
  const user = useCurrentUser();
  const history = useHistory();
  const { data: organization, isError, error, isLoading } = useCurrentOrganization();
  const { setCurrentHomePage } = useHomePageContext();

  const {
    data: applyInterestImageUrl,
    isLoading: applyImageLoading,
    isError: applyImageError
  } = useGetImageUrl(organization?.applyInterestImageId ?? null);
  const {
    data: exploreGuestImageUrl,
    isLoading: exploreImageLoading,
    isError: exploreImageError
  } = useGetImageUrl(organization?.exploreAsGuestImageId ?? null);

  useEffect(() => {
    setCurrentHomePage('guest');
  }, [setCurrentHomePage]);

  if (!organization || isLoading || applyImageLoading || exploreImageLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;
  if (applyImageError) return <ErrorPage message="Error loading apply interest image" />;
  if (exploreImageError) return <ErrorPage message="Error loading explore as guest image" />;
  if (!applyInterestImageUrl || !exploreGuestImageUrl) throw new Error('Image URLs are undefined');

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
          padding: '20px'
        }}
      >
        <Box sx={{ display: 'flex', gap: 5 }}>
          <ImageWithButton
            title="Interested in applying"
            imageSrc={applyInterestImageUrl}
            buttonText="Learn More"
            onClick={() => history.push(routes.HOME_PNM)}
          />
          <ImageWithButton
            title="Explore Our Work as a Guest"
            imageSrc={exploreGuestImageUrl}
            buttonText="FinishLine"
            onClick={() => history.push(routes.HOME_MEMBER)}
          />
        </Box>
      </Box>
    </PageLayout>
  );
};

export default GuestHomePage;
