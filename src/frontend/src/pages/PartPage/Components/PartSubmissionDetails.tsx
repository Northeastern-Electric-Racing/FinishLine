import { Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { PartSubmission } from 'shared';

interface PartSubmissionProps {
  submission: PartSubmission;
}

const PartSubmissionDetails = ({ submission }: PartSubmissionProps) => {
  return (
    <Stack spacing={'4%'} alignItems="center" width="100%">
      <Typography sx={{ fontWeight: 'normal' }} variant="h5">
        Details for ${submission.name}:
      </Typography>

      <Typography variant="body1">
        Uploader: ${submission.userCreated.firstName} {submission.userCreated.lastName}
      </Typography>

      <Typography variant="body1">Uploader Notes: {submission.notes || 'There are no notes.'}</Typography>

      <Typography variant="body1">
        Reviewer Notes:
        {submission.reviews.length !== 0
          ? submission.reviews.map((review) => review.notes).join('\n')
          : 'There are no notes.'}
      </Typography>
    </Stack>
  );
};

export default PartSubmissionDetails;
