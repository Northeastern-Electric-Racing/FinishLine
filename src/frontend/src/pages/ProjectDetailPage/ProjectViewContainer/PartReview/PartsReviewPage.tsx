import { Box } from '@mui/system';
import { Grid, FormGroup, FormControlLabel, Typography } from '@mui/material';
import { useState } from 'react';
import { useCurrentUser } from '../../../../hooks/users.hooks';
import { rankUserRole, Review_Status, PartTag, PartReviewRequest, User } from 'shared';
import NERSwitch from '../../../../components/NERSwitch';
import CommonMistakes from './CommonMistakes';
import { PartPreviewCard } from '../../../../components/PartPreviewCard';

const emptyUser: User = {
  userId: '',
  firstName: '',
  lastName: '',
  email: '',
  emailId: null,
  role: 'MEMBER',
  permissions: []
};

const emptyPartPreview = {
  partId: '',
  index: 0,
  commonName: '',
  description: '',
  status: Review_Status.IN_PROGRESS,
  tags: [],
  projectId: '',
  assignees: [],
  reviewRequests: [],
  createdAt: new Date(),
  userCreated: emptyUser,
  previewImageId: undefined
};

const fullUser: User = {
  userId: 'user1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  emailId: 'john@example.com',
  role: 'MEMBER',
  permissions: []
};

const fullPartPreview = {
  partId: '123',
  index: 1,
  commonName: 'Motor Mount',
  description: 'A sturdy mount for securing the motor in place',
  status: Review_Status.IN_REVIEW,
  tags: [
    {
      partTagId: '1',
      name: 'Mechanical',
      colorHexCode: '#FF0000'
    },
    {
      partTagId: '2',
      name: 'Critical',
      colorHexCode: '#00FF00'
    }
  ] as PartTag[],
  projectId: 'project-1',
  assignees: [
    {
      userId: 'user1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      emailId: 'john@example.com',
      role: 'MEMBER',
      permissions: []
    },
    {
      userId: 'user2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      emailId: 'jane@example.com',
      role: 'LEADERSHIP',
      permissions: []
    }
  ] as User[],
  reviewRequests: [
    {
      partReviewRequestId: 'req1',
      partId: '123',
      requester: {
        userId: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        emailId: 'john@example.com',
        role: 'MEMBER',
        permissions: []
      },
      reviewerRequested: {
        userId: 'user3',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@example.com',
        emailId: 'bob@example.com',
        role: 'HEAD',
        permissions: []
      },
      createdAt: new Date(),
      dateDeleted: undefined
    }
  ] as PartReviewRequest[],
  createdAt: new Date(),
  userCreated: fullUser,
  previewImageId: undefined
};

const PartsReviewPage = () => {
  const currentUser = useCurrentUser();
  const [showSubmissionGuide, setShowSubmissionGuide] = useState(() => {
    const userRole = currentUser.role;
    return rankUserRole(userRole) < rankUserRole('LEADERSHIP');
  });

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormGroup>
            <FormControlLabel
              label="View Submission Guide?"
              control={
                <NERSwitch
                  sx={{ m: 1 }}
                  checked={showSubmissionGuide}
                  onChange={() => setShowSubmissionGuide(!showSubmissionGuide)}
                />
              }
            />
          </FormGroup>
        </Grid>
        <Grid item xs={12}>
          {showSubmissionGuide ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h4">Submission Guide</Typography>
                <CommonMistakes />
                <PartPreviewCard partPreview={emptyPartPreview} />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Empty Part Preview
                </Typography>
                <PartPreviewCard partPreview={emptyPartPreview} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Full Part Preview
                </Typography>
                <PartPreviewCard partPreview={fullPartPreview} />
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default PartsReviewPage;
