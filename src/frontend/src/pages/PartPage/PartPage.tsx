import { Box, Typography, Grid, Breadcrumbs } from '@mui/material';
import PartDisplay from './components/PartDisplay';
import { Part, Review_Status } from 'shared';

const PartPage: React.FC = () => {
  const createSamplePart = (partId: string, commonName: string): Part => ({
    partId,
    index: 1,
    commonName,
    description: 'High-precision part for industrial applications with heat-treated steel components and ceramic bearings.',
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
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          emailId: '',
          role: 'ADMIN',
          permissions: []
        },
        reviews: [],
        createdAt: new Date('2025-03-14T09:00:00Z')
      }
    ],
    status: Review_Status.IN_PROGRESS,
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

  const samplePart = createSamplePart('part-123', '2025-04-10T23:59:59Z');

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
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white'
            }}
          >
            <PartDisplay part={samplePart}></PartDisplay>
            {/*<Typography color="white">No submission yet.</Typography>*/}
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
                  width: '100%',
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
                  width: '100%',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <Typography>Details for Submission</Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: 'gray',
                  height: '24vh',
                  width: '100%',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <Typography>History</Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PartPage;
