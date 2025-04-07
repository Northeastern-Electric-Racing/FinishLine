import LoadingIndicator from '../../../../components/LoadingIndicator';
import { Box } from '@mui/system';
import { Grid, FormGroup, FormControlLabel, Typography } from '@mui/material';
import { useState } from 'react';
import { useCurrentUser } from '../../../../hooks/users.hooks';
import { rankUserRole } from 'shared';
import NERSwitch from '../../../../components/NERSwitch';
import CommonMistakes from './CommonMistakes';
import PDFViewer from '../../../PartPage/components/PdfDisplay';

const PartsReviewPage = () => {
  const currentUser = useCurrentUser();
  const [showSubmissionGuide, setShowSubmissionGuide] = useState(() => {
    const userRole = currentUser.role;
    return rankUserRole(userRole) < rankUserRole('LEADERSHIP');
  });

  return (
    <Box>
      <PDFViewer
        reviewMode={true}
        reviewerName={'Carra Cing'}
        popUps={[
          {
            partReviewPopupId: '1',
            reviewId: '123',
            xCoord: 0.67,
            yCoord: 0.625,
            title: 'sample title',
            description:
              'here is a description about why this part is wrong. To fix this, someone should put something about how to change the part. to test a much longer description, one that would likely be longer than most that a reviewer would write, I will not ramble. What do you think is more cultureally significant, the bee movie, or bees themselves? There is no doubt that bees are more important overall, but I would argue that the impact of the bee movie, and the many iterations and memes surrounding it, have given it a unique position in society, and has attached a stigma bees could only dream of achieving '
          },
          {
            partReviewPopupId: '2',
            reviewId: '123',
            xCoord: 0.25,
            yCoord: 0.25,
            title: 'some other issue',
            description: 'a short desc'
          }
        ]}
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
