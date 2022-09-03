/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Typography from '@mui/material/Typography';
import { Container } from 'react-bootstrap';
import { useAuth } from '../../hooks/Auth.hooks';
import UsefulLinks from './UsefulLinks';
import WorkPackagesByTimelineStatus from './WorkPackagesByTimelineStatus';
import UpcomingDeadlines from './UpcomingDeadlines';

const Home: React.FC = () => {
  const auth = useAuth();
  return (
    <Container fluid>
      <Typography variant="h4" sx={{ textAlign: 'center', paddingY: 2 }}>
        Welcome, {auth.user?.firstName}!
      </Typography>
      <UsefulLinks />
      <UpcomingDeadlines />
      <WorkPackagesByTimelineStatus />
    </Container>
  );
};

export default Home;
