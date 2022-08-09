/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Button, Col, Form, Row } from 'react-bootstrap';
import PageBlock from '../../../layouts/page-block';
import { CreateProjectFormStates } from '../create-project-form';

interface CreateProjectFormViewProps {
  states: CreateProjectFormStates;
  allowSubmit: boolean;
  onCancel: (e: any) => void;
  onSubmit: (e: any) => void;
}

const CreateProjectFormView: React.FC<CreateProjectFormViewProps> = ({
  states,
  allowSubmit,
  onCancel,
  onSubmit
}) => {
  const { name, carNumber, crId, summary } = states;

  return (
    <>
      <PageBlock title={'Create New Project'}>
        <Form onSubmit={onSubmit}>
          <Row>
            <Col>
              <Row>
                <Form.Group as={Col} aria-required>
                  <Form.Label htmlFor="project-name">Project Name</Form.Label>
                  <Form.Control
                    id="project-name"
                    type="text"
                    placeholder="Enter project name..."
                    onChange={(e) => name(e.target.value)}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a project name.
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              <Row>
                <Form.Group as={Col} aria-required>
                  <Form.Label htmlFor="car-number">Car Number</Form.Label>
                  <Form.Control
                    id="car-number"
                    type="number"
                    min={0}
                    placeholder="Enter car number..."
                    onChange={(e) => carNumber(parseInt(e.target.value))}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid car number.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} aria-required>
                  <Form.Label htmlFor="cr-id">Change Request ID</Form.Label>
                  <Form.Control
                    id="cr-id"
                    type="number"
                    min={1}
                    placeholder="Enter change request ID..."
                    onChange={(e) => crId(parseInt(e.target.value))}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid change request ID.
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              <Row>
                <Form.Group as={Col} aria-required>
                  <Form.Label htmlFor="project-summary">Project Summary</Form.Label>
                  <Form.Control
                    id="project-summary"
                    as="textarea"
                    rows={4}
                    cols={50}
                    placeholder="Enter summary..."
                    onChange={(e) => summary(e.target.value)}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a project summary.
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              <Row>
                <Col className={'d-flex'}>
                  <Button
                    className={'mr-3'}
                    variant="primary"
                    type="submit"
                    disabled={!allowSubmit}
                  >
                    Create
                  </Button>
                  <Button variant="secondary" type="button" onClick={onCancel}>
                    Cancel
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </PageBlock>
    </>
  );
};

export default CreateProjectFormView;
