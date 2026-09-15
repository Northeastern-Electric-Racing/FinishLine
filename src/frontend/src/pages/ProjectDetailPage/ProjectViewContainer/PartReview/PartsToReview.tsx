import { Project, PartPreview } from 'shared';
import { Box } from '@mui/system';
import { Grid, Typography } from '@mui/material';
import { wbsPipe } from 'shared';
import PartDisplay from '../../../PartPage/PartPageComponents/PartDisplay';

interface PartsToReviewProps {
  project: Project;
  parts: PartPreview[];
  formatStyle: 'compact' | 'standard' | 'full';
  title: string;
}

const MyPartsUnderReview: React.FC<PartsToReviewProps> = ({ project, parts, formatStyle, title }) => {
  return (
    <Grid item xs={12} md={formatStyle === 'full' ? 12 : formatStyle === 'standard' ? 6 : 4}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        {title} ({parts.length})
      </Typography>
      <Box
        sx={{
          padding: '8px',
          borderRadius: '8px',
          backgroundColor: '#333333'
        }}
      >
        <Grid display="flex" justifyContent="space-between" ml={2} mt={1} mr={3}>
          <Grid
            item
            sx={{
              mb: 1,
              display: 'flex',
              justifyContent: 'center',
              width: '175px'
            }}
          >
            <Typography variant="body1">Part Name</Typography>
          </Grid>

          {formatStyle !== 'compact' && (
            <Grid
              item
              sx={{
                width: '175px',
                mb: 1,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Typography variant="body1">Assignee(s)</Typography>
            </Grid>
          )}

          {formatStyle !== 'compact' && (
            <Grid
              item
              sx={{
                width: '175px',
                mb: 1,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Typography variant="body1">Reviewer(s)</Typography>
            </Grid>
          )}

          {formatStyle === 'full' && (
            <Grid
              sx={{
                width: '175px',
                mb: 1,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Typography variant="body1">Latest Submission From</Typography>
            </Grid>
          )}

          {formatStyle === 'full' && (
            <Grid
              sx={{
                width: '175px',
                mb: 1,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Typography variant="body1">Latest Review From</Typography>
            </Grid>
          )}

          <Grid
            sx={{
              width: '125px',
              mb: 1,
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Typography variant="body1">Review Status</Typography>
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
        <Grid>
          {parts.map((part) => (
            <PartDisplay index={part.index} wbsNum={wbsPipe(project.wbsNum)} formatStyle={formatStyle} />
          ))}
        </Grid>
      </Box>
    </Grid>
  );
};

export default MyPartsUnderReview;
