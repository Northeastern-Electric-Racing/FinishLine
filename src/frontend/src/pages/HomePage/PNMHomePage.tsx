import { Typography, Box } from '@mui/material';
import PageLayout from '../../components/PageLayout';

const PNMHomePage = () => {
  return (
    <PageLayout title="Home" hidePageTitle>
      <Box sx={{ mt: 4, ml: 2 }}>
        <Typography variant="h3">About NER</Typography>
      </Box>
    </PageLayout>
  );
};
export default PNMHomePage;
