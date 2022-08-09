/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Form, Row, Col, InputGroup, Button } from 'react-bootstrap';
import PageBlock from '../../../layouts/page-block';
import { EditableTextInputListUtils, FormStates } from '../create-wp-form';
import EditableTextInputList from '../../../components/editable-text-input-list';

interface CreateWPFormViewProps {
  states: FormStates;
  dependencies: string[];
  depUtils: EditableTextInputListUtils;
  expectedActivities: string[];
  eaUtils: EditableTextInputListUtils;
  deliverables: string[];
  delUtils: EditableTextInputListUtils;
  allowSubmit: boolean;
  onSubmit: (e: any) => void;
  onCancel: (e: any) => void;
}

const CreateWPFormView: React.FC<CreateWPFormViewProps> = ({
  states,
  dependencies,
  depUtils,
  expectedActivities,
  eaUtils,
  deliverables,
  delUtils,
  allowSubmit,
  onSubmit,
  onCancel
}) => {
  const { name, wbsNum, crId, startDate, duration } = states;
  return (
    <>
      <PageBlock title={'Create New Work Package'}>
        <Form onSubmit={onSubmit}>
          <Row>
            <Col>
              <Row>
                <Form.Group as={Col}>
                  <Form.Label htmlFor="wp-name">Work Package Name</Form.Label>
                  <Form.Control
                    id="wp-name"
                    name="name"
                    type="text"
                    onChange={(e) => name(e.target.value)}
                    required
                  ></Form.Control>
                </Form.Group>
              </Row>
              <Row>
                <Form.Group as={Col}>
                  <Form.Label htmlFor="project-wbs-num">Project WBS Number</Form.Label>
                  <Form.Control
                    id="project-wbs-num"
                    name="wbsNum"
                    type="text"
                    onChange={(e) => wbsNum(e.target.value)}
                    required
                  ></Form.Control>
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Label htmlFor="crId">Change Request ID</Form.Label>
                  <Form.Control
                    id="crId"
                    name="crId"
                    type="number"
                    min={1}
                    onChange={(e) => crId(parseInt(e.target.value))}
                    required
                  ></Form.Control>
                </Form.Group>
              </Row>
              <Row>
                <Form.Group as={Col}>
                  <Form.Label htmlFor="start-date">Start Date (YYYY-MM-DD)</Form.Label>
                  <Form.Control
                    id="start-date"
                    name="startDate"
                    aria-label={'start date input'}
                    type="date"
                    onChange={(e) => startDate(e.target.value)}
                    required
                  ></Form.Control>
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Label htmlFor="duration">Duration</Form.Label>
                  <InputGroup>
                    <Form.Control
                      id="duration"
                      name="duration"
                      aria-label={'duration'}
                      type="number"
                      min={0}
                      onChange={(e) => duration(parseInt(e.target.value))}
                      required
                    ></Form.Control>
                    <InputGroup.Text>Weeks</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Row>
              <Row>
                <Col>
                  <Form.Group>
                    <Form.Label htmlFor="dependencies-text-input-list">Dependencies</Form.Label>
                    <Form.Group id="dependencies-text-input-list">
                      <EditableTextInputList
                        items={dependencies}
                        add={depUtils.add}
                        remove={depUtils.remove}
                        update={depUtils.update}
                      />
                    </Form.Group>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group>
                    <Form.Label>Expected Activities</Form.Label>
                    <Form.Group id="ea-text-input-list">
                      <EditableTextInputList
                        items={expectedActivities}
                        add={eaUtils.add}
                        remove={eaUtils.remove}
                        update={eaUtils.update}
                      />
                    </Form.Group>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group>
                    <Form.Label htmlFor="deliverables-text-input-list">Deliverables</Form.Label>
                    <Form.Group id="deliverables-text-input-list">
                      <EditableTextInputList
                        items={deliverables}
                        add={delUtils.add}
                        remove={delUtils.remove}
                        update={delUtils.update}
                      />
                    </Form.Group>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
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

export default CreateWPFormView;
