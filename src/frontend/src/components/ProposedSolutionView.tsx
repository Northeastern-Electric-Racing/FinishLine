/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution } from 'shared';

import PageBlock from '../layouts/PageBlock';
import { Badge, Col, Container, Row } from 'react-bootstrap';
import { dollarsPipe, weeksPipe } from '../utils/Pipes';
import { useTheme } from '../hooks/Theme.hooks';

interface ProposedSolutionViewProps {
  proposedSolution: ProposedSolution;
  selected: boolean;
  setter: any;
}

const ProposedSolutionView: React.FC<ProposedSolutionViewProps> = ({
  proposedSolution,
  selected,
  setter
}) => {
  const styles = {
    white: {
      color: 'white'
    },
    black: {
      color: 'black'
    }
  };

  const theme = useTheme().name === 'DARK' ? styles.white : styles.black;

  const spacer = 'mb-1';

  const component = (
    <PageBlock title="">
      <Container fluid style={theme}>
        <Row className={spacer} onClick={setter}>
          <b>Description</b>
          {selected ? (
            <Badge variant="success" style={{ margin: '0 0 0 65%' }}>
              Selected
            </Badge>
          ) : (
            <Badge variant="danger" style={{ margin: '0 0 0 65%' }}>
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
          <Col className={spacer}>
            <b>Scope Impact</b>
          </Col>
          <Col className={spacer}>{proposedSolution.scopeImpact}</Col>
        </Row>
      </Container>
    </PageBlock>
  );

  return selected ? component : <div style={{ opacity: 0.5 }}>{component}</div>;
};

export default ProposedSolutionView;
