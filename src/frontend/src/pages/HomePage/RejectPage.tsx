import { Typography, Box } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { NERButton } from '../../components/NERButton';

const RejectPage = () => {
  return (
    <PageLayout title="Rejected" hidePageTitle>
      <Box
        sx={{
          padding: 4,
          pt: '2in'
        }}
      >
        <Typography
          variant="h3"
          marginLeft="auto"
          sx={{ marginTop: 2, textAlign: 'center', justifyContent: 'center', pt: 1, padding: 0, fontWeight: 1 }}
        >
          Thank you for your interest in NER and we are sad to see that you will not be joining us this semester. Our doors
          are always open if you choose to apply again and all the best!
        </Typography>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <NERButton variant="contained">Return to Home Page</NERButton>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default RejectPage;
