/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution } from 'shared';
import { Badge, Col, Container, Row, Card } from 'react-bootstrap';
import { dollarsPipe, weeksPipe } from '../../utils/Pipes';

interface ProposedSolutionSelectItemProps {
  proposedSolution: ProposedSolution;
  selected: boolean;
  onClick: () => void;
}

const ProposedSolutionSelectItem: React.FC<ProposedSolutionSelectItemProps> = ({
  proposedSolution,
  selected,
  onClick: setter
}) => {
  const spacer = 'mb-1';

  const selectedStyle = { marginLeft: '66%', alignContent: 'right' };
  const unselectedStyle = { marginLeft: '65%', alignContent: 'auto' };

  const component = (
    <Card className={'mb-3'} bg={'light'} border={'dark'}>
      <Card.Body>
        <Container onClick={setter} fluid>
          <Row className={spacer}>
            <b>Description</b>
            {selected ? (
              <Badge className={'mr-3'} variant="success" style={selectedStyle}>
                Selected
              </Badge>
            ) : (
              <Badge variant="danger" style={unselectedStyle}>
                Unselected
              </Badge>
            )}
          </Row>
          <Row className={spacer}>
            <Col>{proposedSolution.description}</Col>
          </Row>
          <Row className={spacer}>
            <b>Impact</b>
          </Row>
          <Row>
            <Col className={spacer} xs={7} sm={6} md={4} lg={6} xl={6}>
              <b>Budget Impact</b>
            </Col>
            <Col className={spacer}>{dollarsPipe(proposedSolution.budgetImpact)}</Col>
          </Row>
          <Row>
            <Col className={spacer} xs={7} sm={6} md={4} lg={6} xl={6}>
              <b>Timeline Impact</b>
            </Col>
            <Col className={spacer}>{weeksPipe(proposedSolution.timelineImpact)}</Col>
          </Row>
          <Row>
            <Col className={spacer} xs={7} sm={6} md={4} lg={6} xl={6}>
              <b>Scope Impact</b>
            </Col>
            <Col className={spacer}>{proposedSolution.scopeImpact}</Col>
          </Row>
        </Container>
      </Card.Body>
    </Card>
  );

  return selected ? component : <div style={{ opacity: 0.5 }}>{component}</div>;
};

export default ProposedSolutionSelectItem;
