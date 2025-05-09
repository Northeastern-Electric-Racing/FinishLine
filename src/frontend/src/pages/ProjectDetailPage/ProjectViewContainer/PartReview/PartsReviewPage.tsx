import LoadingIndicator from '../../../../components/LoadingIndicator';
import { Box, Stack } from '@mui/system';
import { Grid, FormGroup, FormControlLabel, Typography, Link } from '@mui/material';
import { useState } from 'react';
import { useCurrentUser } from '../../../../hooks/users.hooks';
import { Project, rankUserRole, wbsPipe } from 'shared';
import NERSwitch from '../../../../components/NERSwitch';
import CommonMistakes from './CommonMistakes';
import { usePartsFromProject } from '../../../../hooks/part-review.hooks';
import ErrorPage from '../../../ErrorPage';
import { Link as RouterLink } from 'react-router-dom';
import PartReviewFAQs from './PartReviewFAQs';
import MyPartsUnderReview from './MyPartsUnderReview';
import PartsForMeToReview from './PartsForMeToReview';

const PartsReviewPage = ({ project }: { project: Project }) => {
  const currentUser = useCurrentUser();
  const [showSubmissionGuide, setShowSubmissionGuide] = useState(() => {
    const userRole = currentUser.role;
    return rankUserRole(userRole) < rankUserRole('LEADERSHIP');
  });
  const { data: parts, isLoading, isError, error } = usePartsFromProject(wbsPipe(project.wbsNum));

  if (isLoading || !parts) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

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
          <MyPartsUnderReview project={project} />
          <PartsForMeToReview project={project} />
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
