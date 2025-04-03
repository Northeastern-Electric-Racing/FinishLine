import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { PartSubmission } from 'shared';

interface PartSubmissionProps {
  submission: PartSubmission;
}

const PartSubmissionDetails = ({ submission }: PartSubmissionProps) => {
  return (
    <Box display="left" alignItems="center" width="100%" sx={{ flexDirection: 'column'}}>
      <Typography sx = {{fontWeight: "normal", marginBottom: '4%'}} variant="h5">Details for Submission #{submission.partSubmissionId}:</Typography>

      <Typography variant="body1" sx = {{marginBottom: '4%'}}>
        Uploader:
        {' ' + submission.userCreated.firstName + ' ' + submission.userCreated.lastName}
      </Typography>

      <Typography variant="body1" sx = {{marginBottom: '4%'}}>
        Uploader Notes:
        {' ' + submission.notes || 'There are no notes.'}
      </Typography>

      <Typography variant="body1" sx = {{marginBottom: '4%'}}>
        Reviewer Notes:{' '}
        {submission.reviews.length !== 0
          ? submission.reviews.map((review) => review.notes).join('  ')
          : 'There are no notes.'}
      </Typography>
    </Box>
  );
};

export default PartSubmissionDetails;
