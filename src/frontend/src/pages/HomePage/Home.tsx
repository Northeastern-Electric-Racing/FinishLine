/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Typography from '@mui/material/Typography';
import { useAuth } from '../../hooks/Auth.hooks';
import UsefulLinks from './UsefulLinks';
import WorkPackagesByTimelineStatus from './WorkPackagesByTimelineStatus';
import UpcomingDeadlines from './UpcomingDeadlines';

const Home: React.FC = () => {
  const auth = useAuth();
  return (
    <>
      <Typography variant="h3" sx={{ textAlign: 'center', pt: 3 }}>
        Welcome, {auth.user?.firstName}!
      </Typography>
      <UsefulLinks />
      <UpcomingDeadlines />
      <WorkPackagesByTimelineStatus />
    </>
  );
};

export default Home;
