/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution } from 'shared';
import PageBlock from '../../layouts/PageBlock';
import { Badge, Col, Container, Row } from 'react-bootstrap';
import { dollarsPipe, weeksPipe } from '../../utils/Pipes';
import styles from '../../stylesheets/pages/ChangeRequestDetailPage/ProposedSolutionView.module.css';

interface ProposedSolutionViewProps {
  proposedSolution: ProposedSolution;
}

const ProposedSolutionView: React.FC<ProposedSolutionViewProps> = ({ proposedSolution }) => {
  const spacer = 'mb-2';
  return (
    <PageBlock title="" cardContainerStyle="mb-0">
      <Container fluid>
        <Row className={spacer + ' ' + styles.descLabelContainer}>
          <b>Description</b>
          {proposedSolution.approved ? (
            <b>
              <Badge pill variant="success">
                Approved
              </Badge>
            </b>
          ) : null}
        </Row>
        <Row className={spacer}>
          <Col>{proposedSolution.description}</Col>
        </Row>
        <Row className={spacer}>
          <b>Impact</b>
        </Row>
        <Row className={spacer}>
          <Col className={spacer} xs={7} sm={6} md={4} lg={3} xl={2}>
            <b>Budget Impact</b>
          </Col>
          <Col className={spacer}>{dollarsPipe(proposedSolution.budgetImpact)}</Col>
        </Row>
        <Row>
          <Col className={spacer} xs={7} sm={6} md={4} lg={3} xl={2}>
            <b>Timeline Impact</b>
          </Col>
          <Col className={spacer}>{weeksPipe(proposedSolution.timelineImpact)}</Col>
        </Row>
        <Row>
          <Col className={spacer} md={4} lg={3} xl={2}>
            <b>Scope Impact</b>
          </Col>
          <Col className={spacer}>{proposedSolution.scopeImpact}</Col>
        </Row>
      </Container>
    </PageBlock>
  );
};

export default ProposedSolutionView;
