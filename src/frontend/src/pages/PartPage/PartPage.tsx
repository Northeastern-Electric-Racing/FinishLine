import { Box } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { Grid } from '@mui/system';

const PartPage: React.FC = () => {
  return (
    <PageLayout title="Part Review">
      <Grid>
        <Box>Part goes here</Box>
      </Grid>
    </PageLayout>
  );
};

export default PartPage;
