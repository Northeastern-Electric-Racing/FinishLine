import { Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { PartSubmission, PartReview } from 'shared';
import DownloadButton from '../../../components/DownloadButton';
import LoadingIndicator from '../../../components/LoadingIndicator';

interface PartSubmissionProps {
  submission: PartSubmission;
}

const PartSubmissionDetails = ({ submission }: PartSubmissionProps) => {
  const reviewNotes = (reviews: PartReview[]) => {
    if (reviews.length === 0) {
      return <Typography variant="body1">No Reviews Yet.</Typography>;
    }
    if (reviews.filter((review) => review.notes).length === 0) {
      return <Typography variant="body1">There are no notes.</Typography>;
    }
    return (
      <Box>
        {reviews
          .filter((review) => review.notes)
          .map((review) => (
            <Typography key={review.partReviewId} variant="body1">
              - {review.notes}
            </Typography>
          ))}
      </Box>
    );
  };

  if (!submission) return <LoadingIndicator />;

  return (
    <Stack spacing={2} alignItems="left" width="100%">
      <Typography variant="h4" mb={1}>
        Details for {submission.name}
      </Typography>

      {submission.reviews.some((review) => review.fileIds.length !== 0) && (
        <Box>
          <Typography variant="body1">
            <b>Review Files: </b>
          </Typography>
          <Stack direction="row" spacing={1} mt={1}>
            {submission.reviews.map((review) =>
              review.fileIds.map((fileId, index) => (
                <Box key={fileId} display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">{`File #${index + 1}`}</Typography>
                  <DownloadButton fileId={fileId} filename={`Review_File${index + 1}`} />
                </Box>
              ))
            )}
          </Stack>
        </Box>
      )}

      <Typography variant="body1">
        <b>Uploader: </b> {`${submission.userCreated.firstName} ${submission.userCreated.lastName}`}
      </Typography>

      <Typography variant="body1">
        <b>Uploader Notes: </b>
        {submission.notes || 'There are no notes.'}
      </Typography>

      <Typography variant="body1">
        <b>
          Reviewer Notes: <br />
        </b>
        {reviewNotes(submission.reviews)}
      </Typography>
    </Stack>
  );
};

export default PartSubmissionDetails;
