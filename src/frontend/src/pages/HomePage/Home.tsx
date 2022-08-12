/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Container } from 'react-bootstrap';
import { useAuth } from '../../hooks/Auth.hooks';
import UsefulLinks from './UsefulLinks';
import WorkPackagesByTimelineStatus from './WorkPackagesByTimelineStatus';
import UpcomingDeadlines from './UpcomingDeadlines';
import styles from '../../stylesheets/pages/home.module.css';

const Home: React.FC = () => {
  const auth = useAuth();
  return (
    <Container fluid>
      <h1 className={styles.title}>Welcome, {auth.user?.firstName}!</h1>
      <UsefulLinks />
      <UpcomingDeadlines />
      <WorkPackagesByTimelineStatus />
    </Container>
  );
};

export default Home;
