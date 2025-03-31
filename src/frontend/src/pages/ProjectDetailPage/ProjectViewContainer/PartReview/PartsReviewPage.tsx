import LoadingIndicator from '../../../../components/LoadingIndicator';
import { Box } from '@mui/system';
import { Grid, FormGroup, FormControlLabel, Typography } from '@mui/material';
import { useState } from 'react';
import { useCurrentUser } from '../../../../hooks/users.hooks';
import { rankUserRole } from 'shared';
import NERSwitch from '../../../../components/NERSwitch';
import FileDisplay from '../../../PartPage/components/FileDisplay';

const PartsReviewPage = () => {
  const currentUser = useCurrentUser();
  const [showSubmissionGuide, setShowSubmissionGuide] = useState(() => {
    const userRole = currentUser.role;
    return rankUserRole(userRole) < rankUserRole('LEADERSHIP');
  });

  const addPopup = (x: number, y: number, title: string, description: string) => {
    return;
  };

  return (
    <Box>
      <FileDisplay
        fileLink="test"
        popUps={[
          {
            partReviewPopupId: 'string',
            xCoord: 0.5,
            yCoord: 0.25,
            title: 'string',
            description: 'asdf',
            reviewId: 'string'
          }
        ]}
        addPopup={addPopup}
      />
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
