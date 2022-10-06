/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution } from 'shared';
import PageBlock from '../../layouts/PageBlock';
import { Badge, Button, Col, Container, Row } from 'react-bootstrap';
import { dollarsPipe, weeksPipe } from '../../utils/Pipes';
import styles from '../../stylesheets/pages/ChangeRequestDetailPage/ProposedSolutionView.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

interface ProposedSolutionViewProps {
  proposedSolution: ProposedSolution;
  showDeleteButton?: boolean;
  onDelete?: (proposedSolution: ProposedSolution) => void;
}

const ProposedSolutionView: React.FC<ProposedSolutionViewProps> = ({
  proposedSolution,
  showDeleteButton,
  onDelete
}) => {
  const spacer = 'mb-2';
  return (
    <PageBlock title="" cardContainerStyle="mb-1" cardBodyStyle="pt-1 pb-2">
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
          {showDeleteButton && onDelete !== undefined ? (
            <Button
              variant="danger"
              onClick={() => {
                onDelete(proposedSolution);
              }}
            >
              <FontAwesomeIcon icon={faTrash} size="lg" data-testid={'deleteIcon'} />
            </Button>
          ) : null}
        </Row>
        <Row className={spacer}>
          <Col>{proposedSolution.description}</Col>
        </Row>
        <Row className={spacer}>
          <b>Impact</b>
        </Row>
        <Row>
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
