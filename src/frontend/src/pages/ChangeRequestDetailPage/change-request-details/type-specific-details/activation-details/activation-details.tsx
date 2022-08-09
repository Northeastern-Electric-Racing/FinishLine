/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Container, Row, Col } from 'react-bootstrap';
import { ActivationChangeRequest } from 'shared';
import { booleanPipe, datePipe, fullNamePipe } from '../../../../../pipes';
import PageBlock from '../../../../../layouts/page-block/page-block';

interface ActivationDetailsProps {
  cr: ActivationChangeRequest;
}

const ActivationDetails: React.FC<ActivationDetailsProps> = ({ cr }) => {
  const spacer = 'mb-2';
  return (
    <PageBlock title={'Activation Change Request Details'}>
      <Container fluid>
        <Row>
          <Col className={spacer} xs={6} sm={4} md={3} lg={3} xl={2}>
            <b>Project Lead</b>
          </Col>
          <Col className={spacer} xs={4} sm={6} md={3} lg={3} xl={2}>
            {fullNamePipe(cr.projectLead)}
          </Col>
          <Col className={spacer} xs={6} sm={4} md={3} lg={3} xl={2}>
            <b>Project Manager</b>
          </Col>
          <Col className={spacer} xs={4} sm={6} md={3} lg={3} xl={2}>
            {fullNamePipe(cr.projectManager)}
          </Col>
          <Col className={spacer} xs={6} sm={4} md={3} lg={3} xl={2}>
            <b>Start Date</b>
          </Col>
          <Col className={spacer} xs={4} sm={6} md={3} lg={3} xl={2}>
            {datePipe(cr.startDate)}
          </Col>
          <Col className={spacer} xs={6} sm={4} md={3} lg={3} xl={2}>
            <b>Confirm WP Details</b>
          </Col>
          <Col className={spacer} xs={4} sm={4} md={2} lg={2} xl={1}>
            {booleanPipe(cr.confirmDetails)}
          </Col>
        </Row>
      </Container>
    </PageBlock>
  );
};

export default ActivationDetails;
