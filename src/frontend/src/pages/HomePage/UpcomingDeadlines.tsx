/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { Card, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { WbsElementStatus } from 'shared';
import { useTheme } from '../../hooks/theme.hooks';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import { datePipe, wbsPipe, fullNamePipe, percentPipe } from '../../utils/Pipes';
import { routes } from '../../utils/Routes';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageBlock from '../../layouts/PageBlock';
import ErrorPage from '../ErrorPage';
import styles from '../../stylesheets/pages/home.module.css';

const UpcomingDeadlines: React.FC = () => {
  const [daysUntilDeadline, setDaysUntilDeadline] = useState<string>('14');
  const theme = useTheme();
  const workPackages = useAllWorkPackages({ status: WbsElementStatus.Active, daysUntilDeadline });

  if (workPackages.isError) {
    return <ErrorPage message={workPackages.error.message} error={workPackages.error} />;
  }

  const fullDisplay = (
    <Row className="flex-nowrap overflow-auto justify-content-start">
      {workPackages.data?.length === 0
        ? 'No upcoming deadlines'
        : workPackages.data?.map((wp) => (
            <Card
              className={styles.horizontalScrollCard}
              key={wbsPipe(wp.wbsNum)}
              border={theme.cardBorder}
              bg={theme.cardBg}
            >
              <Card.Body className="p-3">
                <Card.Title className="mb-2">
                  <Link to={`${routes.PROJECTS}/${wbsPipe(wp.wbsNum)}`}>
                    {wbsPipe(wp.wbsNum)} - {wp.name}
                  </Link>
                </Card.Title>
                <Card.Text>
                  <Container fluid>
                    <Row className="pb-1">End Date: {datePipe(wp.endDate)}</Row>
                    <Row className="pb-1">
                      Progress: {percentPipe(wp.progress)}, {wp.timelineStatus}
                    </Row>
                    <Row className="pb-1">Engineering Lead: {fullNamePipe(wp.projectLead)}</Row>
                    <Row className="pb-1">Project Manager: {fullNamePipe(wp.projectManager)}</Row>
                    <Row>
                      {wp.expectedActivities.length} Expected Activities, {wp.deliverables.length} Deliverables
                    </Row>
                  </Container>
                </Card.Text>
              </Card.Body>
            </Card>
          ))}
    </Row>
  );

  return (
    <PageBlock
      title={`Upcoming Deadlines (${workPackages.data?.length})`}
      headerRight={
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>Next</InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control custom as="select" value={daysUntilDeadline} onChange={(e) => setDaysUntilDeadline(e.target.value)}>
            {['1', '2', '5', '7', '14', '21', '30'].map((days) => (
              <option key={days} value={days}>
                {days}
              </option>
            ))}
          </Form.Control>
          <InputGroup.Append>
            <InputGroup.Text>Days</InputGroup.Text>
          </InputGroup.Append>
        </InputGroup>
      }
    >
      <Container fluid>{workPackages.isLoading ? <LoadingIndicator /> : fullDisplay}</Container>
    </PageBlock>
  );
};

export default UpcomingDeadlines;
