import { Typography, Box, Icon, Card, CardContent } from '@mui/material';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import { useEffect } from 'react';
import { useHomePageContext } from '../../app/HomePageContext';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useGetImageUrl } from '../../hooks/onboarding.hook';
import FeaturedProjects from './components/FeaturedProjects';
import { useAllUsefulLinks } from '../../hooks/projects.hooks';
import { Stack } from '@mui/system';
import { routes } from '../../utils/routes';
import { NERButton } from '../../components/NERButton';

const IntroGuestHomePage = () => {
  const {
    data: organization,
    isLoading: organizationIsLoading,
    isError: organizationIsError,
    error: organizationError
  } = useCurrentOrganization();
  const { setCurrentHomePage } = useHomePageContext();

  useEffect(() => {
    setCurrentHomePage('guest');
  }, [setCurrentHomePage]);

  const {
    data: usefulLinks,
    isLoading: usefulLinksIsLoading,
    isError: usefulLinksIsError,
    error: usefulLinksError
  } = useAllUsefulLinks();

  const {
    data: finishlineImageUrl,
    isLoading: finishlineImageIsLoading,
    isError: finishlineImageIsError,
    error: finishlineImageError
  } = useGetImageUrl(organization?.platformLogoImageId ?? null);

  if (organizationIsError) {
    return <ErrorPage message={organizationError.message} />;
  }

  if (usefulLinksIsError) {
    return <ErrorPage message={usefulLinksError.message} />;
  }

  if (finishlineImageIsError) {
    return <ErrorPage message={finishlineImageError.message} />;
  }

  if (
    !finishlineImageUrl ||
    finishlineImageIsLoading ||
    !organization ||
    organizationIsLoading ||
    !usefulLinks ||
    usefulLinksIsLoading
  )
    return <LoadingIndicator />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2 }}>
      <Typography mt={2} variant="h4" sx={{ fontWeight: 'bold' }}>
        FinishLine By NER
      </Typography>
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: 480,
          bgcolor: 'grey.200',
          border: '1px solid',
          borderColor: 'grey.800',
          borderRadius: 1,
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        <Box
          component="img"
          src={finishlineImageUrl}
          alt="FinishLine logo"
          sx={{
            display: 'block',
            width: '100%',
            height: 'auto',
            objectFit: 'contain'
          }}
        />
      </Box>

      <Typography mt={2} align="center" sx={{ maxWidth: 560 }}>
        {organization.platformDescription}
      </Typography>
      <Box sx={{ mt: 2, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Stack direction="row" flexWrap="wrap" gap={2} useFlexGap justifyContent="center">
          {usefulLinks.map((link) => (
            <Link
              key={link.linkId}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
            >
              <Icon sx={{ fontSize: 22 }}>{link.linkType.iconName}</Icon>
            </Link>
          ))}
        </Stack>
      </Box>
      <Card
        component="section"
        sx={{
          mt: 3,
          width: '100%',
          maxWidth: 420,
          mx: 'auto',
          textAlign: 'center',
          boxShadow: 1
        }}
      >
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
            Are you a student interested in joining NER?
          </Typography>
          <RouterLink to={routes.HOME_PNM} style={{ textDecoration: 'none' }}>
            <NERButton variant="contained" size="medium">
              Learn more
            </NERButton>
          </RouterLink>
        </CardContent>
      </Card>

      <Box sx={{ width: '100%', mt: 3 }}>
        <FeaturedProjects />
      </Box>
    </Box>
  );
};

export default IntroGuestHomePage;
