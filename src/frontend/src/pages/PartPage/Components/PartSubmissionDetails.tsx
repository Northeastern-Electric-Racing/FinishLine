import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { PartSubmission } from 'shared';

interface PartSubmissionProps {
  submission: PartSubmission;
}

const PartSubmissionDetails = ({ submission }: PartSubmissionProps) => {
  return (
    <Box display="flex" alignItems="center" width="50%" padding={2}>
      <Typography variant="h4">Details for Submission #{submission.partSubmissionId}:</Typography>

      <Typography variant="h6">
        Uploader:
        {submission.userCreated.firstName} {submission.userCreated.lastName}
      </Typography>

      <Typography variant="h6">
        Uploader Notes:
        {submission.notes || 'There are no notes.'}
      </Typography>

      <Typography variant="h6">
        Reviewer Notes:
        {submission.reviews.length !== 0
          ? submission.reviews.map((review) => review.notes).join(' ')
          : 'There are no notes.'}
      </Typography>
    </Box>
  );
};

export default PartSubmissionDetails;
