/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Col, Container, Row } from 'react-bootstrap';
import { StageGateChangeRequest } from 'shared';
import { booleanPipe, dollarsPipe } from '../../../../../pipes';
import PageBlock from '../../../../../layouts/page-block/page-block';

interface StageGateDetailsProps {
  cr: StageGateChangeRequest;
}

const StageGateDetails: React.FC<StageGateDetailsProps> = ({ cr }) => {
  const spacer = 'mb-2';
  return (
    <PageBlock title={'Stage Gate Change Request Details'}>
      <Container fluid>
        <Row>
          <Col className={spacer} xs={6} sm={6} md={3} lg={3} xl={2}>
            <b>Leftover Budget</b>
          </Col>
          <Col className={spacer} xs={4} sm={4} md={3} lg={3} xl={1}>
            {dollarsPipe(cr.leftoverBudget)}
          </Col>
          <Col className={spacer} xs={6} sm={6} md={4} lg={3} xl={3}>
            <b>Confirm WP Completed</b>
          </Col>
          <Col className={spacer} xs={4} sm={4} md={2} lg={3} xl={1}>
            {booleanPipe(cr.confirmDone)}
          </Col>
        </Row>
      </Container>
    </PageBlock>
  );
};

export default StageGateDetails;
