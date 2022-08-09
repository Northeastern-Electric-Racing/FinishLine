/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Col, Container, Row } from 'react-bootstrap';
import { WorkPackage } from 'shared';
import { percentPipe, fullNamePipe, datePipe, weeksPipe } from '../../../../pipes';
import WbsStatus from '../../../../components/wbs-status/wbs-status';
import PageBlock from '../../../../layouts/page-block/page-block';

interface WorkPackageDetailsProps {
  workPackage: WorkPackage;
}

const WorkPackageDetails: React.FC<WorkPackageDetailsProps> = ({ workPackage }) => {
  const allColsStyle = 'mb-2';
  return (
    <PageBlock
      title={'Work Package Details'}
      headerRight={<WbsStatus status={workPackage.status} />}
    >
      <Container fluid>
        <Row>
          <Col className={allColsStyle} md={5} lg={4} xl={3}>
            <b>Project Lead:</b> {fullNamePipe(workPackage.projectLead)}
          </Col>
          <Col className={allColsStyle} md={6} lg={4} xl={3}>
            <b>Project Manager:</b> {fullNamePipe(workPackage.projectManager)}
          </Col>
          <Col className={allColsStyle} sm={4} md={4} lg={2} xl={2}>
            <b>Duration:</b> {weeksPipe(workPackage.duration)}
          </Col>
          <Col className={allColsStyle} sm={4} md={4} lg={4} xl={2}>
            <b>Start Date:</b> {datePipe(workPackage.startDate)}
          </Col>
          <Col className={allColsStyle} sm={4} md={4} lg={3} xl={2}>
            <b>End Date:</b> {datePipe(workPackage.endDate)}
          </Col>
        </Row>
        <Row>
          <Col className={allColsStyle} sm={4} md={4} lg={4} xl={3}>
            <b>Progress:</b> {percentPipe(workPackage.progress)}
          </Col>
          <Col className={allColsStyle} sm={4} md={4} lg={4} xl={3}>
            <b>Expected Progress:</b> {percentPipe(workPackage.expectedProgress)}
          </Col>
          <Col className={allColsStyle} sm={5} md={4} lg={4} xl={3}>
            <b>Timeline Status:</b> {workPackage.timelineStatus}
          </Col>
        </Row>
      </Container>
    </PageBlock>
  );
};

export default WorkPackageDetails;
