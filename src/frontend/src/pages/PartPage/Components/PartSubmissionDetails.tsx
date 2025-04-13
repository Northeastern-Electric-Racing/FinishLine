import { Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { PartSubmission, PartReview, RoleEnum } from 'shared';

interface PartSubmissionProps {
  submission: PartSubmission;
}

const reviewNotes = (reviews: PartReview[]): string => {
  if (reviews.length === 0) {
    return 'There are no notes.';
  } else {
    return '\n' + reviews.map((review) => '- ' + review.notes).join('\n');
  }
};

const PartSubmissionDetails = ({ submission }: PartSubmissionProps) => {
  return (
    <Stack spacing={'1%'} alignItems="left" width="100%">
      <Typography sx={{ fontWeight: 'normal' }} variant="h5">
        Details for {submission.name}:
      </Typography>

      <Typography variant="body1">
        <b>Uploader: </b>
        {submission.userCreated.firstName} {submission.userCreated.lastName}
      </Typography>

      <Typography variant="body1">
        <b>Uploader Notes: </b>
        {submission.notes || 'There are no notes.'}
      </Typography>

      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
        <b>Reviewer Notes: </b>
        {reviewNotes(submission.reviews)}
      </Typography>
    </Stack>
  );
};

export default PartSubmissionDetails;

export const partReviewExample1: PartReview = {
  partReviewId: 'reviewId001',
  fileIds: ['file1', 'file2'],
  notes: 'this part submission is decent!!',
  submissionId: '1',
  userCreated: {
    userId: '124',
    email: 'mark.andrews@example.com',
    emailId: 'mark.andrews@example.com',
    role: RoleEnum.MEMBER,
    permissions: [],
    firstName: 'Mark',
    lastName: 'Andrews'
  },
  popUps: [],
  createdAt: new Date(2025, 6, 4)
};

export const partReviewExample2: PartReview = {
  partReviewId: 'reviewId002',
  fileIds: ['file3', 'file4'],
  notes: 'this part submission is terrible!!',
  submissionId: '1',
  userCreated: {
    userId: '125',
    email: 'julia.williams@example.com',
    emailId: 'julia.williams@example.com',
    role: RoleEnum.MEMBER,
    permissions: [],
    firstName: 'Julia',
    lastName: 'Williams'
  },
  popUps: [],
  createdAt: new Date(2025, 3, 4)
};
