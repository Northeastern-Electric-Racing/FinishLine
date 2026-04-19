import { Typography, useTheme } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useGetAllSponsors } from '../../hooks/finance.hooks';
import ErrorPage from '../ErrorPage';
import { Box } from '@mui/system';
import PageLayout from '../../components/PageLayout';
import { useGetImageUrl } from '../../hooks/onboarding.hook';

const SponsorImage: React.FC<{ logoImageId: string; name: string }> = ({ logoImageId, name }) => {
  const { data: imageUrl, isLoading, isError, error } = useGetImageUrl(logoImageId);

  if (isError) {
    return <ErrorPage message={error.message} />;
  }

  if (!imageUrl || isLoading) {
    return <LoadingIndicator />;
  }

  if (!imageUrl) return null;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
        p: 2,
        width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 11px)' }
      }}
    >
      <Box component="img" src={imageUrl} alt={name} sx={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain' }} />
    </Box>
  );
};

const GuestSponsorsPage: React.FC = () => {
  const theme = useTheme();
  const { data: sponsors, isLoading, isError, error } = useGetAllSponsors();
  if (isError) {
    return <ErrorPage message={error.message} />;
  }

  if (!sponsors || isLoading) {
    return <LoadingIndicator />;
  }

  const sorted = [...sponsors].sort((a, b) => {
    const aVal = a.tier?.minSupportValue ?? -Infinity;
    const bVal = b.tier?.minSupportValue ?? -Infinity;
    return bVal - aVal;
  });

  return (
    <PageLayout title="Sponsors">
      <Box>
        <Box sx={{ bgcolor: theme.palette.background.paper, borderRadius: 2, p: 2 }}>
          <Typography>
            We would not be able to put a competitive car on the track each year without the help of each and every one of
            our sponsors. Thank you for your support!
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
          {sorted.map(
            (sponsor) =>
              sponsor.logoImageId && (
                <SponsorImage key={sponsor.sponsorId} logoImageId={sponsor.logoImageId} name={sponsor.name} />
              )
          )}
        </Box>
      </Box>
    </PageLayout>
  );
};

export default GuestSponsorsPage;
