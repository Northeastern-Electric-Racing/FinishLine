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

const GuestHomePage = () => {
  const user = useCurrentUser();
  const history = useHistory();
  const { setOnGuestHomePage, setOnPNMHomePage } = useHomePageContext();
  const { data: organization } = useCurrentOrganization();

  const [applyInterestImage, setApplyInterestImage] = useState('');
  const [exploreAsGuestImage, setExploreAsGuestImage] = useState('');

  useEffect(() => {
    setOnGuestHomePage(true);
    setOnPNMHomePage(false);

    const fetchImages = async () => {
      const applyBlob = await downloadImageFile(organization?.applyInterestImageId ?? '');
      const exploreBlob = await downloadImageFile(organization?.exploreAsGuestImageId ?? '');
      const applyImage = URL.createObjectURL(applyBlob);
      const exploreImage = URL.createObjectURL(exploreBlob);
      setApplyInterestImage(applyImage);
      setExploreAsGuestImage(exploreImage);
    };

    fetchImages();
  }, [setOnGuestHomePage, setOnPNMHomePage, organization]);

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
            imageSrc={applyInterestImage}
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
