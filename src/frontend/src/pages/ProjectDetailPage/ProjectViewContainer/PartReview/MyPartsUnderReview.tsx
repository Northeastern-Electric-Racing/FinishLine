import { useCurrentUser } from '../../../../hooks/users.hooks';
import { usePartsFromProject } from '../../../../hooks/part-review.hooks';
import { Project } from 'shared';
import { Box } from '@mui/system';
import { Grid, Typography } from '@mui/material';
import { wbsPipe } from 'shared';

interface MyPartsUnderReviewProps {
  project: Project;
}

const MyPartsUnderReview: React.FC<MyPartsUnderReviewProps> = ({ project }) => {
  const currentUser = useCurrentUser();
  const { wbsNum } = project;
  const { data } = usePartsFromProject(wbsPipe(wbsNum));

  // Filter parts assigned to the current user and not approved
  const partsUnderReview =
    data?.filter(
      (part) => part.assignees.map((assignee) => assignee.userId).includes(currentUser.userId) && part.status !== 'APPROVED'
    ) || [];

  // Show the list only if there are items to show
  if (partsUnderReview.length === 0) {
    return null;
  }

  return (
    <Grid item xs={12}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        My Parts Under Review ({partsUnderReview.length})
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
          {partsUnderReview.map((part) => (
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

export default MyPartsUnderReview;
