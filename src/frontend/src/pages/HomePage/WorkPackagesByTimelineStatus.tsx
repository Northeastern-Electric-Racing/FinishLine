/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState, useEffect } from 'react';
import { Card, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { TimelineStatus, WbsElementStatus } from 'shared';
import { useTheme } from '../../hooks/Theme.hooks';
import { useAllWorkPackages } from '../../hooks/WorkPackages.hooks';
import { datePipe, wbsPipe, fullNamePipe, percentPipe } from '../../utils/Pipes';
import { routes } from '../../utils/Routes';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageBlock from '../../layouts/PageBlock';
import ErrorPage from '../ErrorPage';
import styles from '../../stylesheets/pages/home.module.css';

const WorkPackagesByTimelineStatus: React.FC = () => {
  const [timelineStatus, setTimelineStatus] = useState<TimelineStatus>(TimelineStatus.VeryBehind);
  const theme = useTheme();
  const workPackages = useAllWorkPackages({ status: WbsElementStatus.Active, timelineStatus });

  useEffect(() => {
    workPackages.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timelineStatus]);

  if (workPackages.isError) {
    return <ErrorPage message={workPackages.error.message} error={workPackages.error} />;
  }

  const fullDisplay = (
    <Row className="flex-nowrap overflow-auto justify-content-start">
      {workPackages.data?.length === 0
        ? `No ${timelineStatus} work packages`
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
                      {wp.expectedActivities.length} Expected Activities, {wp.deliverables.length}{' '}
                      Deliverables
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
      title={`Work Packages By Timeline Status (${workPackages.data?.length})`}
      headerRight={
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text id="selectTimelineStatus">Timeline Status</InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            as="select"
            aria-describedby="selectTimelineStatus"
            value={timelineStatus}
            onChange={(e) => setTimelineStatus(e.target.value as TimelineStatus)}
            custom
          >
            {Object.values(TimelineStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Form.Control>
        </InputGroup>
      }
    >
      <Container fluid>{workPackages.isLoading ? <LoadingIndicator /> : fullDisplay}</Container>
    </PageBlock>
  );
};

export default WorkPackagesByTimelineStatus;
