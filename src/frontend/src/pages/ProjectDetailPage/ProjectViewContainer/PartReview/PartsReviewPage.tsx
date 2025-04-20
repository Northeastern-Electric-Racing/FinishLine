import LoadingIndicator from '../../../../components/LoadingIndicator';
import { Box } from '@mui/system';
import { Grid, FormGroup, FormControlLabel, Typography } from '@mui/material';
import { useState } from 'react';
import { useCurrentUser } from '../../../../hooks/users.hooks';
import { rankUserRole } from 'shared';
import NERSwitch from '../../../../components/NERSwitch';
import CommonMistakes from './CommonMistakes';
import PartDisplay from '../../../PartPage/components/PartDisplay';
import { Review_Status } from 'shared';
import { Part } from 'shared';
import { useSinglePart } from '../../../../hooks/part-review.hooks';

const PartsReviewPage = () => {
  const currentUser = useCurrentUser();
  const [showSubmissionGuide, setShowSubmissionGuide] = useState(() => {
    const userRole = currentUser.role;
    return rankUserRole(userRole) < rankUserRole('LEADERSHIP');
  });

  const createSamplePart = (partId: string, commonName: string): Part => ({
    partId,
    index: 1,
    commonName,
    description: '',
    previewImageId: '/api/placeholder/400/240',
    projectId: 'proj-1',
    assignees: [
      {
        userId: 'user-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        emailId: '',
        role: 'ADMIN',
        permissions: []
      },

      {
        userId: 'user-3',
        firstName: 'May',
        lastName: 'Gonzalez',
        email: 'johnson@example.com',
        emailId: '',
        role: 'ADMIN',
        permissions: []
      }
    ],
    createdAt: new Date('2025-03-14T09:00:00Z'),
    /*userCreatedId: 'user-1',*/
    userCreated: {
      userId: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      emailId: '',
      role: 'ADMIN',
      permissions: []
    },
    submissions: [
      {
        partSubmissionId: '',
        fileIds: [''],
        name: 'this part',
        partId: '',
        userCreated: {
          userId: 'user-1',
          firstName: 'Henry',
          lastName: 'Miller',
          email: 'john@example.com',
          emailId: '',
          role: 'ADMIN',
          permissions: []
        },
        reviews: [
          {
            partReviewId: '917249',
            fileIds: [],
            notes: 'jkasd',
            submissionId: 'ksdfk',
            popUps: [],
            completedAt: new Date(),
            createdAt: new Date(),
            userCreated: {
              userId: 'user-1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              emailId: '',
              role: 'ADMIN',
              permissions: []
            }
          },
          {
            partReviewId: '20384',
            fileIds: [],
            notes: 'jkasd',
            submissionId: '23529',
            popUps: [],
            completedAt: new Date(),
            createdAt: new Date(),
            userCreated: {
              userId: 'user-2',
              firstName: 'Greg',
              lastName: 'Smith',
              email: 'greg@example.com',
              emailId: '',
              role: 'ADMIN',
              permissions: []
            }
          }
        ],
        createdAt: new Date('2025-03-14T09:00:00Z')
      },
      {
        partSubmissionId: '',
        fileIds: [''],
        name: 'this part',
        partId: '',
        userCreated: {
          userId: 'user-1',
          firstName: 'Joe',
          lastName: 'Lee',
          email: 'john@example.com',
          emailId: '',
          role: 'ADMIN',
          permissions: []
        },
        reviews: [
          {
            partReviewId: '917249',
            fileIds: [],
            notes: 'jkasd',
            submissionId: 'ksdfk',
            popUps: [],
            completedAt: new Date(),
            createdAt: new Date(),
            userCreated: {
              userId: 'user-1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              emailId: '',
              role: 'ADMIN',
              permissions: []
            }
          },
          {
            partReviewId: '20384',
            fileIds: [],
            notes: 'jkasd',
            submissionId: '23529',
            popUps: [],
            completedAt: new Date(),
            createdAt: new Date(),
            userCreated: {
              userId: 'user-2',
              firstName: 'Greg',
              lastName: 'Smith',
              email: 'greg@example.com',
              emailId: '',
              role: 'ADMIN',
              permissions: []
            }
          }
        ],
        createdAt: new Date('2024-03-14T09:00:00Z')
      }
    ],
    status: Review_Status.READY_FOR_REVIEW,
    tags: [],
    reviewRequests: [
      {
        partReviewRequestId: '',
        partId: '',
        requester: {
          userId: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          emailId: '',
          role: 'ADMIN',
          permissions: []
        },
        reviewerRequested: {
          userId: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          emailId: '',
          role: 'ADMIN',
          permissions: []
        },
        createdAt: new Date('2025-03-14T09:00:00Z')
      }
    ]
  });

  const samplePart = createSamplePart('part-123', 'Impact Attenuator');
  const { isLoading, data: part, isError, error } = useSinglePart();

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (isError || !part) {
    throw error;
  }

  return (
    <Box>
      <PartDisplay part={part} screenSize="large"></PartDisplay>
      <PartDisplay part={part} screenSize="medium"></PartDisplay>
      <PartDisplay part={part} screenSize="small"></PartDisplay>
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
          {/* The guide should be toggled off by default for admins, heads, and leads and toggled on for all other roles */}

          {showSubmissionGuide ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h4">Submission Guide</Typography>
                <CommonMistakes />
                {/* Submission Guide components will go here */}
                <LoadingIndicator />
                {/* Loading indicator will be replaced by a grid of all the part cards */}
              </Grid>
            </Grid>
          ) : (
            <LoadingIndicator /> /* Loading indicator will be replaced by a grid of all the part cards */
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default PartsReviewPage;
