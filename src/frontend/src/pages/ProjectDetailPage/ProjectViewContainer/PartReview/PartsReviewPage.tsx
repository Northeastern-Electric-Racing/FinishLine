import LoadingIndicator from '../../../../components/LoadingIndicator';
import { Box } from '@mui/system';
import { Grid, FormGroup, FormControlLabel, Typography } from '@mui/material';
import { useState } from 'react';
import { useCurrentUser } from '../../../../hooks/users.hooks';
import { Project, rankUserRole } from 'shared';
import NERSwitch from '../../../../components/NERSwitch';
import CommonMistakes from './CommonMistakes';
import CreateMenu from './PartReviewComponents/CreateMenu';

const PartsReviewPage = ({ project }: { project: Project }) => {
  const currentUser = useCurrentUser();
  const [showSubmissionGuide, setShowSubmissionGuide] = useState(() => {
    const userRole = currentUser.role;
    return rankUserRole(userRole) < rankUserRole('LEADERSHIP');
  });

  return (
    <Box>
      <CreateMenu project={project}/>
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
