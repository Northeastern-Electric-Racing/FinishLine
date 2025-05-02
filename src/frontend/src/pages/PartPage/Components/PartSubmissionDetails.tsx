import { Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { PartSubmission, PartReview } from 'shared';
import DownloadButton from '../../../components/DownloadButton';

interface PartSubmissionProps {
  submission: PartSubmission;
  reviewIndex: number;
}

const PartSubmissionDetails = ({ submission, reviewIndex }: PartSubmissionProps) => {
  const reviewNotes = (reviews: PartReview[]): string => {
    if (reviewIndex !== -1) {
      return submission.reviews[reviewIndex].notes ?? 'There are no notes.';
    }
    if (reviews.length === 0) {
      return 'There are no notes.';
    }
    return '\n' + reviews.map((review) => '- ' + review.notes).join('\n');
  };

  return (
    <Stack spacing={2} alignItems="left" width="100%">
      <Typography variant="h4" mb={1}>
        Details for {submission.name} {reviewIndex !== -1 ? 'Review' : ''}
      </Typography>

      {reviewIndex !== -1 && submission.reviews[reviewIndex].fileIds.length !== 0 && (
        <Box>
          <Typography variant="body1">
            <b>Review Files: </b>
          </Typography>
          <Stack direction="row" spacing={1} mt={1}>
            {submission.reviews[reviewIndex].fileIds.length ? (
              submission.reviews[reviewIndex].fileIds.map((fileId, index) => (
                <Box key={fileId} display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">{`File #${index + 1}`}</Typography>
                  <DownloadButton fileId={fileId} filename={`Review_File${index + 1}`} />
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                No files uploaded yet.
              </Typography>
            )}
          </Stack>
        </Box>
      )}

      <Typography variant="body1">
        {reviewIndex !== -1 ? <b>Reviewer: </b> : <b>Uploader: </b>}
        {reviewIndex !== -1
          ? `${submission.reviews[reviewIndex].userCreated.firstName} ${submission.reviews[reviewIndex].userCreated.lastName}`
          : `${submission.userCreated.firstName} ${submission.userCreated.lastName}`}
      </Typography>

      {reviewIndex === -1 && (
        <Typography variant="body1">
          <b>Uploader Notes: </b>
          {submission.notes || 'There are no notes.'}
        </Typography>
      )}

      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
        <b>{reviewIndex === -1 ? 'Reviewer' : ''} Notes: </b>
        {reviewNotes(submission.reviews)}
      </Typography>
    </Stack>
  );
};

export default PartSubmissionDetails;
