import { Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { Part_Review_Popup, PartSubmission } from 'shared';

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

// mock examples for testing

const partReviewPopUp1: Part_Review_Popup = {
  partReviewPopupId: '1',
  xCoord: 0.0,
  yCoord: 0.0,
  title: 'review 1 popup',
  description: 'description1',
  reviewId: '1'
};

const partReviewPopUp2: Part_Review_Popup = {
  partReviewPopupId: '2',
  xCoord: 0.0,
  yCoord: 0.0,
  title: 'review 2 popup',
  description: 'description2',
  reviewId: '1'
};

export const partReviewExample1 = {
  partReviewId: 'reviewId003',
  fileIds: ['file5', 'file6'],
  notes: 'this part submission is decent!!',
  submission: {
    connect: {
      partSubmissionId: '1'
    }
  },
  userCreated: {
    connect: { userId: '123' }
  },
  popUps: {
    connect: [partReviewPopUp1]
  },
  submissionId: '123',
  createdAt: new Date(2025, 6, 4)
};

export const partReviewExample2 = {
  partReviewId: 'reviewId004',
  fileIds: ['file7', 'file8'],
  notes: 'this part submission is terrible!!',
  submission: {
    connect: {
      partSubmissionId: '1'
    }
  },
  userCreated: {
    connect: { userId: '32' }
  },
  popUps: {
    connect: [partReviewPopUp2]
  },
  submissionId: '123',
  createdAt: new Date(2025, 5, 4)
};
