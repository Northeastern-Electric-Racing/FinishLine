/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Collapse, Col, Container, Row } from 'react-bootstrap';
import { WorkPackage } from 'shared';
import { weeksPipe, wbsPipe, listPipe, datePipe } from '../../../utils/Pipes';
import { useTheme } from '../../../hooks/theme.hooks';
import { routes } from '../../../utils/Routes';
import WbsStatus from '../../../components/WbsStatus';
import styles from '../../../stylesheets/pages/project-detail-page/work-package-summary.module.scss';

interface WorkPackageSummaryProps {
  workPackage: WorkPackage;
}

const WorkPackageSummary: React.FC<WorkPackageSummaryProps> = ({ workPackage }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const expectedActivitiesList = (
    <ul>
      {workPackage.expectedActivities.slice(0, 3).map((item, idx) => (
        <li key={idx}>{item.detail}</li>
      ))}
    </ul>
  );
  const numMoreExpectedActivities = workPackage.expectedActivities.length - 3;
  const deliverablesList = (
    <ul>
      {workPackage.deliverables.slice(0, 3).map((item, idx) => (
        <li key={idx}>{item.detail}</li>
      ))}
    </ul>
  );
  const numMoreDeliverables = workPackage.deliverables.length - 3;

  return (
    <Card bg={theme.cardBg} border={theme.cardBorder}>
      <Card.Header className={styles.header} onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className={'d-flex justify-content-between'}>
          <div className={'d-flex'}>
            <div className={'mr-3'}>{wbsPipe(workPackage.wbsNum)}</div>
            <Link to={`${routes.PROJECTS}/${wbsPipe(workPackage.wbsNum)}`}>{workPackage.name}</Link>
          </div>
          <div className={'d-flex'}>
            <div className={'mr-3'}>{<WbsStatus status={workPackage.status} />}</div>
            <div>{weeksPipe(workPackage.duration)}</div>
          </div>
        </div>
      </Card.Header>

      <Collapse in={open}>
        <div>
          <Card.Body>
            <Container fluid>
              <Row>
                <Col xs={12} md={6}>
                  <b>Dependencies:</b> {listPipe(workPackage.dependencies, wbsPipe)}
                </Col>
                <Col xs={6} md={4}>
                  <b>Start date:</b> {datePipe(workPackage.startDate)} <br />
                  <b>End Date:</b> {datePipe(workPackage.endDate)}
                </Col>
              </Row>
              <Row>
                <Col xs={12} md={6}>
                  <b>Expected Activities:</b> {expectedActivitiesList}
                  {numMoreExpectedActivities > 0 ? (
                    <Link to={`${routes.PROJECTS}/${wbsPipe(workPackage.wbsNum)}`}>
                      Show {numMoreExpectedActivities} more...
                    </Link>
                  ) : (
                    <></>
                  )}
                </Col>
                <Col xs={12} md={6}>
                  <b>Deliverables:</b> {deliverablesList}
                  {numMoreDeliverables > 0 ? (
                    <Link to={`${routes.PROJECTS}/${wbsPipe(workPackage.wbsNum)}`} className={styles.showMoreLink}>
                      Show {numMoreDeliverables} more...
                    </Link>
                  ) : (
                    <></>
                  )}
                </Col>
              </Row>
            </Container>
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  );
};

export default WorkPackageSummary;
