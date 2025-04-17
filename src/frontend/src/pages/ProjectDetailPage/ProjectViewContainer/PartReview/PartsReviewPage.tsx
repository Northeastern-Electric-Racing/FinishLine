import LoadingIndicator from '../../../../components/LoadingIndicator';
import { Box } from '@mui/system';
import { Grid, FormGroup, FormControlLabel, Typography } from '@mui/material';
import { useState } from 'react';
import { useCurrentUser } from '../../../../hooks/users.hooks';
import { rankUserRole } from 'shared';
import NERSwitch from '../../../../components/NERSwitch';
import CommonMistakes from './CommonMistakes';
import { Project } from 'shared';
import MyPartsUnderReview from './MyPartsUnderReview';

interface PartsReviewPageProps {
  project: Project;
}

const PartsReviewPage: React.FC<PartsReviewPageProps> = ({ project }) => {
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
          <Grid container spacing={3}>
            {/* The guide should be toggled off by default for admins, heads, and leads and toggled on for all other roles */}
            {showSubmissionGuide ? (
              <Grid item xs={12}>
                <Typography variant="h4">Submission Guide</Typography>
                <CommonMistakes />
                {/* Loading indicator will be replaced by a grid of all the part cards */}
              </Grid>
            ) : (
              <></>
            )}
            <MyPartsUnderReview project={project} />
            <LoadingIndicator />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PartsReviewPage;
