/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Container } from 'react-bootstrap';
import { useAuth } from '../../hooks/auth.hooks';
import UsefulLinks from './useful-links';
import WorkPackagesByTimelineStatus from './work-packages-by-timeline-status';
import UpcomingDeadlines from './upcoming-deadlines';
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
