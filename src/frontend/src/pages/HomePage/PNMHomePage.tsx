import { Typography, Box } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { AuthenticatedUser } from 'shared';
import ImageWithButton from './components/ImageWithButton';
import emitter from '../../app/EventBus';


const PNMHomePage = () => {

  return (
    <PageLayout title="Home" hidePageTitle>
      <Typography variant="h3" textAlign="center" sx={{ mt: 2, pt: 3 }}>
        About NER
      </Typography>
    </PageLayout>
  );
};
export default PNMHomePage;
