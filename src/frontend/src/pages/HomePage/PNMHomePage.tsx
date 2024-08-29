import { Typography, Box } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useCurrentOrganization } from '../../hooks/organizations.hooks';

const PNMHomePage = () => {
  const { data: organization } = useCurrentOrganization();

  return (
    <PageLayout title="Home" hidePageTitle>
      <Box sx={{ mt: 4, ml: 2 }}>
        <Typography variant="h3">About NER</Typography>
      </Box>
      <Box sx={{ mt: 5, ml: 2, width: '80%' }}>
        <Typography sx={{ fontSize: '1.5em' }}>{organization?.description}</Typography>
      </Box>
    </PageLayout>
  );
};
export default PNMHomePage;
