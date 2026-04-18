import { Typography, useTheme } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useGetAllSponsors } from '../../hooks/finance.hooks';
import ErrorPage from '../ErrorPage';
import { Box } from '@mui/system';
import PageLayout from '../../components/PageLayout';

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
        {sorted.map((sponsor) => {
          return <Typography>{sponsor.name}</Typography>;
        })}
      </Box>
    </PageLayout>
  );
};

export default GuestSponsorsPage;
