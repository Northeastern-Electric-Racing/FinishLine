import { Box, Typography, Grid, Breadcrumbs } from '@mui/material';
import PartPageOverview from '../PartPage/components/PartPageOverview';
import { useSinglePart } from '../../hooks/part-review.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';

const PartPage: React.FC = () => {
  const { isLoading, data: part, isError, error } = useSinglePart();

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (isError || !part) {
    throw error;
  }

  return (
    <Box padding={4}>
      {/* This is where the breadcrumbs (series of links) will go */}
      <Breadcrumbs sx={{ mb: 2 }}></Breadcrumbs>

      {/* Need to query for the part title */}
      <Typography variant="h4" fontWeight="bold" mb={3}>
        [PROJ_PartName_PartNum]
      </Typography>

      <Grid container spacing={3}>
        {/* The code below will be replaced by the part preview */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: 'black',
              height: '75vh',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white'
            }}
          >
            <Typography color="white">No submission yet.</Typography>
          </Box>
        </Grid>

        {/* The code below will be replaced by the Overview, Details, and History components */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2} direction="column">
            <Grid item>
              {/* Added overview section */}
              <PartPageOverview part={part} />
              <Box
                sx={{
                  backgroundColor: 'gray',
                  height: '24vh',
                  width: '100%',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <Typography>Details for Submission</Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: 'gray',
                  height: '24vh',
                  width: '100%',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <Typography>History</Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PartPage;
