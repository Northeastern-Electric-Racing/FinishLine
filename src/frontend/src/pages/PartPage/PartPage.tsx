import { Box, Typography, Grid, Breadcrumbs } from '@mui/material';
import PartHistoryView from './Components/PartHistoryView';
import { Part, PartReview, PartReviewRequest, PartSubmission, Review_Status, RoleEnum, User } from 'shared';
import PartSubmissionDetails, { partReviewExample1, partReviewExample2 } from './Components/PartSubmissionDetails';

const creator: User = {
  userId: '05',
  firstName: 'Mohit',
  lastName: 'Singhal',
  email: 'email',
  emailId: '',
  role: RoleEnum.ADMIN,
  permissions: []
};

const reviewer1: User = {
  userId: '04',
  firstName: 'Peter',
  lastName: 'Desnoyers',
  email: 'email',
  emailId: '',
  role: RoleEnum.ADMIN,
  permissions: []
};

const partReview1: PartReview = {
  partReviewId: '001',
  fileIds: [],
  notes: '',
  submissionId: '02',
  popUps: [],
  createdAt: new Date('2024-01-04T01:00:00Z'),
  completedAt: new Date('2024-01-05T01:00:00Z'),
  userCreated: reviewer1
};

const partSubmission1: PartSubmission = {
  partSubmissionId: '01',
  fileIds: [],
  name: 'Submission #1',
  notes: 'First Submission',
  partId: '00A',
  userCreated: creator,
  reviews: [partReview1],
  createdAt: new Date('2024-01-02T01:00:00Z')
};

const reviewReq1: PartReviewRequest = {
  partReviewRequestId: '000',
  partId: '00A',
  requester: creator,
  reviewerRequested: reviewer1,
  createdAt: new Date('2024-01-03T01:00:00Z')
};

const part1: Part = {
  partId: '00A',
  index: 1,
  commonName: 'PROJ_PartName_0000-00A',
  description: '',
  status: Review_Status.APPROVED,
  tags: [],
  projectId: '001',
  assignees: [],
  reviewRequests: [reviewReq1],
  createdAt: new Date('2024-01-01T01:00:00Z'),
  userCreated: creator,
  submissions: [partSubmission1]
};

const PartPage: React.FC = () => {
  return (
    <Box padding={4}>
      {/* This is where the breadcrumbs (series of links) will go */}
      <Breadcrumbs sx={{ mb: 2 }}></Breadcrumbs>
      {/* Need to query for the part title */}
      <Typography variant="h4" fontWeight="bold" mb={3}>
        [PROJ_PartName_PartNum]
      </Typography>
      <Grid container spacing={3}>
        {/* The code below will be replaced by the part preview */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: 'black',
              height: '75vh',
              width: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white'
            }}
          >
            <Typography color="white">No submission yet.</Typography>
          </Box>
        </Grid>

        {/* The code below will be replaced by the Overview, Details, and History components */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2} direction="column">
            <Grid item>
              <Box
                sx={{
                  backgroundColor: 'gray',
                  height: '24vh',
                  width: '50%',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <Typography>Overview</Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: 'gray',
                  height: '24vh',
                  width: '50%',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              ></Box>
              <Box>
                <PartSubmissionDetails
                  submission={{
                    partSubmissionId: '1',
                    userCreated: {
                      userId: '123',
                      email: 'john.doe@example.com',
                      emailId: 'john.doe@example.com',
                      role: RoleEnum.MEMBER,
                      permissions: [],
                      firstName: 'John',
                      lastName: 'Doe'
                    },
                    notes: 'This is a test note.',
                    reviews: [partReviewExample1, partReviewExample2],
                    fileIds: [],
                    name: 'Test Part Submission',
                    partId: '456',
                    createdAt: new Date()
                  }}
                />
              </Box>
              <Typography>History</Typography>
              <PartHistoryView part={part1}></PartHistoryView>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PartPage;
