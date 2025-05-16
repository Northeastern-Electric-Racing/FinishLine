import { Box } from '@mui/system';
import { Project, Review_Status, wbsPipe } from 'shared';
import { Grid, Typography } from '@mui/material';
import { usePartsFromProject } from '../../../hooks/part-review.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import EmptyPageBlockDisplay from '../../HomePage/components/EmptyPageBlockDisplay';
import React from 'react';
import ErrorPage from '../../ErrorPage';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

interface AllPartsUnderReview {
  project: Project;
}

const AllPartsUnderReviewContainer: React.FC<AllPartsUnderReview> = ({ project }) => {
  const { wbsNum } = project;
  const { data, isLoading, isError, error } = usePartsFromProject(wbsPipe(wbsNum));

  if (isLoading) {
    return <LoadingIndicator />;
  }
  if (isError) {
    return <ErrorPage message={error.message} />;
  }

  const parts = data?.filter((part) => part.status !== Review_Status.APPROVED) || [];

  if (parts.length === 0) {
    return (
      <EmptyPageBlockDisplay
        icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 70 }} />}
        heading={`You're all caught up!`}
        message={'There are no in progress parts on this project!'}
      />
    );
  }
  return (
    <Grid item xs={12}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        My Parts Under Review ({parts.length})
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
          {parts.map((part) => (
            // replace this with actual part under review component
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

export default AllPartsUnderReviewContainer;
