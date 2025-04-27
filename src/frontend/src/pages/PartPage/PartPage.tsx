import { Box, Typography, Grid, Breadcrumbs } from '@mui/material';
import { Part, PartReview, PartSubmission, RoleEnum, User } from 'shared';
import PartSubmissionDetails, { partReviewExample1, partReviewExample2 } from './Components/PartSubmissionDetails';
import { useSinglePart } from '../../hooks/part-review.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useState } from 'react';
import PDFViewer from './Components/PdfDisplay';
import { useCurrentUser } from '../../hooks/users.hooks';

const getUsersLatestReview = (submission: PartSubmission, user: User): PartReview | null => {
  const reviews = submission.reviews.filter((review) => review.userCreated.userId === user.userId);
  if (reviews.length === 0) {
    return null;
  } else {
    return reviews[reviews.length - 1];
  }
};

const PartPage: React.FC = () => {
  const { isLoading: partIsLoading, isError: partIsError, data: part, error: partError } = useSinglePart('0.2.0', 100);
  const user = useCurrentUser();

  if (partIsError) return <ErrorPage message={partError.message} />;

  if (partIsLoading || !part) return <LoadingIndicator />;

  const initialPart = part.submissions.length != 0 ? part.submissions[0] : null;

  const [reviewMode, setReviewMode] = useState<boolean>(false);

  const [submission, setSubmission] = useState<PartSubmission | null>(initialPart);

  return (
    <Grid height={'100%'} display={'flex'} flexDirection={'row'}>
      <PDFViewer review={submission ? getUsersLatestReview(submission, user) : null} reviewMode={true} />
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
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
};

export default PartPage;
