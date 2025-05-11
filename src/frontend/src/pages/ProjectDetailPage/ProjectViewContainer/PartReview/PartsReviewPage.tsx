import LoadingIndicator from '../../../../components/LoadingIndicator';
import { Box, Stack } from '@mui/system';
import { Grid, FormGroup, FormControlLabel, Typography, Link } from '@mui/material';
import { useState } from 'react';
import { useCurrentUser } from '../../../../hooks/users.hooks';
import { Project, rankUserRole, wbsPipe, Review_Status, Part } from 'shared';
import NERSwitch from '../../../../components/NERSwitch';
import CommonMistakes from './CommonMistakes';
import PartDisplay from '../../../PartPage/components/PartDisplay';
import { usePartsFromProject } from '../../../../hooks/part-review.hooks';
import ErrorPage from '../../../ErrorPage';
import { Link as RouterLink } from 'react-router-dom';
import PartReviewFAQs from './PartReviewFAQs';
import CreateMenu from './PartReviewComponents/PartFormModels/CreateMenu';

const PartsReviewPage = ({ project }: { project: Project }) => {
  const currentUser = useCurrentUser();
  const [showSubmissionGuide, setShowSubmissionGuide] = useState(() => {
    const userRole = currentUser.role;
    return rankUserRole(userRole) < rankUserRole('LEADERSHIP');
  });
  const { data: parts, isLoading, isError, error } = usePartsFromProject(wbsPipe(project.wbsNum));

  if (isLoading || !parts) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  // a sample part that i made to test a component
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

  const samplePart = createSamplePart('part-123', 'Attenuator');

  return (
    <Box>
      <PartDisplay part={samplePart} contentAmount="full"></PartDisplay>
      <PartDisplay part={samplePart} contentAmount="standard"></PartDisplay>
      <PartDisplay part={samplePart} contentAmount="compact"></PartDisplay>
      <CreateMenu wbsNum={project.wbsNum} partsInProject={parts} />
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
            <Grid item container direction="column" spacing={3} sx={{ paddingTop: '10px' }}>
              <Typography variant="h4" sx={{ pl: 2 }}>
                Submission Guide
              </Typography>

              <Grid container spacing={3} sx={{ paddingTop: '10px' }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ pl: 2 }}>
                    Sample Drawing
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <PartReviewFAQs />
                    <CommonMistakes />
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <LoadingIndicator /> /* Loading indicator will be replaced by a grid of all the part cards */
          )}
          {/* temporary test component to show that parts are being displayed */}
          <Stack>
            Parts for this project:
            {parts.map((part, _index) => (
              <Box>
                <Link component={RouterLink} to={`/projects/${wbsPipe(project.wbsNum)}/part/${part.index}`}>
                  index:{part.index}, commonName: {part.commonName}, status: {part.status}
                </Link>
              </Box>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PartsReviewPage;
