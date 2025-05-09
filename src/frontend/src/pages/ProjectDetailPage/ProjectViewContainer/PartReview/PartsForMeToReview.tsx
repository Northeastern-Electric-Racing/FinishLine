import { useCurrentUser } from '../../../../hooks/users.hooks';
import { usePartsFromProject } from '../../../../hooks/part-review.hooks';
import { Project } from 'shared';
import { Box } from '@mui/system';
import { Grid, Typography } from '@mui/material';
import { wbsPipe } from 'shared';

interface PartsForMeToReviewProps {
  project: Project;
}

const PartsForMeToReview: React.FC<PartsForMeToReviewProps> = ({ project }) => {
  const currentUser = useCurrentUser();
  const { wbsNum } = project;
  const { data } = usePartsFromProject(wbsPipe(wbsNum));

  // Filter parts only if the current user is set as a reviewer and they have not reviewed the most recent submission
  const partsToReview =
    data?.filter(
      (part) =>
        part.reviewRequests.some((req) => req.reviewerRequested.userId === currentUser.userId) &&
        part.status !== 'REVIEWED' &&
        part.status !== 'APPROVED'
    ) || [];

  // Show the list only if there are items to show
  if (partsToReview.length === 0) {
    return null;
  }

  return (
    <Grid item xs={12}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        My Parts Under Review ({partsToReview.length})
      </Typography>
      <Box
        sx={{
          maxHeight: '200px',
          maxWidth: '100%',
          padding: '8px',
          borderRadius: '8px',
          backgroundColor: '#333333'
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs={6} sm={3} md={2} display={{ xs: 'block', sm: 'block', md: 'block' }}>
            <Typography variant="body1" sx={{ ml: 2 }}>
              Part Name
            </Typography>
          </Grid>
          <Grid item sm={3} md={2} display={{ xs: 'none', sm: 'block', md: 'block' }}>
            <Typography variant="body1" sx={{ ml: 2 }}>
              Assignee(s)
            </Typography>
          </Grid>
          <Grid item sm={3} md={2} display={{ xs: 'none', sm: 'block', md: 'block' }}>
            <Typography variant="body1" sx={{ ml: 2 }}>
              Reviewer(s)
            </Typography>
          </Grid>
          <Grid item sm={3} md={2} display={{ xs: 'none', sm: 'none', md: 'block' }}>
            <Typography variant="body1" sx={{ ml: 2 }}>
              Latest Submission From
            </Typography>
          </Grid>
          <Grid item sm={3} md={2} display={{ xs: 'none', sm: 'none', md: 'block' }}>
            <Typography variant="body1" sx={{ ml: 2 }}>
              Latest Review From
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3} md={2} display={{ xs: 'block', sm: 'block', md: 'block' }}>
            <Typography variant="body1" sx={{ ml: 2 }}>
              Review Status
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Box
        sx={{
          backgroundColor: '#222222',
          maxHeight: '200px',
          maxWidth: '100%',
          overflowY: 'scroll',
          padding: '8px',
          borderRadius: '8px',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#c44546',
            borderRadius: '4px'
          }
        }}
      >
        <Grid container spacing={1}>
          {partsToReview.map((part) => (
            // Replace below with the actual part preview component
            <Grid item xs={12} key={part.partId}>
              <Box
                sx={{
                  backgroundColor: '#3f3f3f',
                  borderRadius: '8px',
                  padding: '16px'
                }}
              >
                <Typography variant="h6">{part.commonName}</Typography>
                <Typography variant="body2">{part.description}</Typography>
                <Typography variant="body2">Status: {part.status}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Grid>
  );
};

export default PartsForMeToReview;
