import LoadingIndicator from '../../../../components/LoadingIndicator';
import { Box, Stack } from '@mui/system';
import { Grid, FormGroup, FormControlLabel, Typography } from '@mui/material';
import { useState } from 'react';
import { useCurrentUser } from '../../../../hooks/users.hooks';
import { Project, rankUserRole, wbsPipe } from 'shared';
import NERSwitch from '../../../../components/NERSwitch';
import CommonMistakes from './CommonMistakes';
import { usePartsFromProject } from '../../../../hooks/part-review.hooks';
import ErrorPage from '../../../ErrorPage';
import PartReviewFAQs from './PartReviewFAQs';
import CreateMenu from './PartReviewComponents/PartFormModels/CreateMenu';
import { PartPreviewCard } from './PartReviewComponents/PartPreviewCard';

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
          {showSubmissionGuide && (
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
          )}
          <Typography variant="h4" sx={{ mb: 2 }}>
            {`Parts for ${project.name}`}
          </Typography>
          <Grid container spacing={3}>
            {/* sort parts by most recently created */}
            {parts
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((part, _index) => (
                <Grid item md={4} sm={6} xs={12}>
                  <PartPreviewCard
                    partPreview={part}
                    projectName={project.abbreviation ?? project.name}
                    redirectUrl={`/projects/${wbsPipe(project.wbsNum)}/part/${part.index}`}
                  />
                </Grid>
              ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PartsReviewPage;
