import { Typography, Box } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import ImageWithButton from './components/ImageWithButton';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useEffect, useState } from 'react';
import { useHomePageContext } from '../../app/HomePageContext';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import { downloadGoogleImage } from '../../apis/finance.api';
import { downloadImageFile } from '../../../../backend/src/utils/google-integration.utils';
import { imageDownloadUrl, imageFileUrl, imagePreviewUrl } from '../../utils/reimbursement-request.utils';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

const GuestHomePage = () => {
  const user = useCurrentUser();
  const history = useHistory();
  const { setOnGuestHomePage, setOnPNMHomePage } = useHomePageContext();
  const { data: organization, isError, error, isLoading } = useCurrentOrganization();

  const [applyInterestImage, setApplyInterestImage] = useState('');
  const [exploreAsGuestImage, setExploreAsGuestImage] = useState('');

  useEffect(() => {
    setOnGuestHomePage(true);
    setOnPNMHomePage(false);
  }, [setOnGuestHomePage, setOnPNMHomePage, organization]);

  if (!organization || isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  console.log(imagePreviewUrl(organization!.applyInterestImageId))
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
            imageSrc={`https://drive.google.com/thumbnail?id=${organization?.applyInterestImageId}&sz=w1000`}
            buttonText="Learn More"
            onClick={() => history.push(routes.HOME_PNM)}
          />
          <ImageWithButton
            title="Explore Our Work as a Guest"
            imageSrc={exploreAsGuestImage}
            buttonText="FinishLine"
            onClick={() => {
              setOnGuestHomePage(false);
              history.push(routes.HOME_MEMBER);
            }}
          />
        </Box>
      </Box>
    </PageLayout>
  );
};

export default GuestHomePage;
