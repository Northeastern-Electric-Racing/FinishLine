import { Grid, Typography, Link, Box } from '@mui/material';
import PartReviewFAQs from './PartReviewFAQs';
import CommonMistakes from './CommonMistakes';
import { useGetPartReviewGuideLink } from '../../../../../hooks/organizations.hooks';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import ErrorPage from '../../../../ErrorPage';
import DescriptionIcon from '@mui/icons-material/Description';
import { usePartReviewSampleImageId } from '../../../../../hooks/part-review.hooks';
import { useGetImageUrl } from '../../../../../hooks/onboarding.hook';

const SubmissionGuide: React.FC = () => {
  const {
    data: guideLink,
    isLoading: guideLinkLoading,
    isError: guideLinkIsError,
    error: guideLinkError
  } = useGetPartReviewGuideLink();
  const {
    data: sampleImageId,
    isLoading: sampleImageLoading,
    isError: sampleImageIsError,
    error: sampleImageError
  } = usePartReviewSampleImageId();

  const { data: sampleImageUrl } = useGetImageUrl(sampleImageId ?? null);

  if (guideLinkLoading || sampleImageLoading) {
    return <LoadingIndicator />;
  }

  if (guideLinkIsError) {
    return <ErrorPage message="Error loading part review guide link." error={guideLinkError} />;
  }

  if (sampleImageIsError) {
    return <ErrorPage message="Error loading part review sample image." error={sampleImageError} />;
  }

  return (
    <Grid item container direction="column" spacing={3} sx={{ paddingTop: '10px' }}>
      <Typography variant="h4" sx={{ pl: 2 }}>
        Submission Guide
      </Typography>

      <Grid container spacing={3} sx={{ paddingTop: '10px' }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ pl: 2 }}>
            Sample Drawing
          </Typography>
          {sampleImageUrl ? (
            <Box
              component="img"
              sx={{
                width: '95%',
                display: 'block',
                alignItems: 'center',
                bgcolor: 'grey.800',
                height: '60vh',
                mx: 3,
                my: 1
              }}
              alt="Part Submission Sample Image"
              src={sampleImageUrl}
            />
          ) : (
            <Box
              sx={{
                width: '95%',
                display: 'block',
                alignItems: 'center',
                bgcolor: 'grey.800',
                height: '60vh',
                mx: 3,
                my: 1
              }}
            />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <PartReviewFAQs />

          {guideLink && (
            <Link
              href={guideLink}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                },
                mt: 2
              }}
            >
              <DescriptionIcon sx={{ color: 'white' }} />
              <span>Confluence Drawing Guide</span>
            </Link>
          )}

          <CommonMistakes />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SubmissionGuide;
