/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageBlock from '../layouts/PageBlock';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

interface ProposedSolution {
  description: string;
  budget: number;
  timeline: number;
  scope: string;
}

interface ProposedSolutionFormProps {
  description?: string;
  budget?: number;
  timeline?: number;
  scope?: string;
  readOnly?: boolean;
  onAdd: (data: ProposedSolution) => void;
}

const schema = yup.object().shape({
  description: yup.string().required('Description is required'),
  budget: yup
    .number()
    .typeError('Budget must be a number')
    .min(0, 'Budget must be greater than or equal to $0')
    .required('Budget is required')
    .integer('Budget must be an integer'),
  scope: yup.string().required('Scope is required'),
  timeline: yup
    .number()
    .typeError('Timeline must be a number')
    .min(0, 'Timeline must be greater than or equal to 0 weeks')
    .required('Timeline is required')
    .integer('Timeline must be an integer')
});

const ProposedSolutionForm: React.FC<ProposedSolutionFormProps> = ({
  description,
  budget,
  timeline,
  scope,
  readOnly,
  onAdd
}) => {
  const { register, formState, handleSubmit } = useForm<ProposedSolution>({
    resolver: yupResolver(schema),
    defaultValues: { description, budget, timeline, scope }
  });

  return (
    <>
      <PageBlock title={readOnly ? 'Proposed Solution - Read Only' : 'Proposed Solution'}>
        <Form id="individual-proposed-solution-form" onSubmit={handleSubmit(onAdd)}>
          <Row className="mx-2 justify-content-start">
            <Col lg={true}>
              <Form.Group controlId="formDescription" className="mx-2">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  {...register('description')}
                  placeholder="Describe the proposed solution"
                  isInvalid={formState.errors.description?.message !== undefined}
                  readOnly={readOnly}
                />
                <Form.Control.Feedback type="invalid">
                  {formState.errors.description?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col lg={true}>
              <Form.Group controlId="formBudget" className="mx-2">
                <Form.Label>Budget</Form.Label>
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text>$</InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    {...register('budget')}
                    placeholder="$ needed"
                    isInvalid={formState.errors.budget?.message !== undefined}
                    readOnly={readOnly}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formState.errors.budget?.message}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
              <Form.Group controlId="formTimeline" className="mx-2">
                <Form.Label>Timeline</Form.Label>
                <InputGroup>
                  <Form.Control
                    {...register('timeline')}
                    placeholder="# needed"
                    isInvalid={formState.errors.timeline?.message !== undefined}
                    readOnly={readOnly}
                  />
                  <InputGroup.Append>
                    <InputGroup.Text>weeks</InputGroup.Text>
                  </InputGroup.Append>
                  <Form.Control.Feedback type="invalid">
                    {formState.errors.timeline?.message}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mx-2 justify-content-start">
            <Col lg={true}>
              <Form.Group controlId="formScope" className="mx-2">
                <Form.Label>Scope</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  {...register('scope')}
                  placeholder="Discuss the scope of the proposed solution"
                  isInvalid={formState.errors.scope?.message !== undefined}
                  readOnly={readOnly}
                />
                <Form.Control.Feedback type="invalid">
                  {formState.errors.scope?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mx-2 justify-content-start">
            {readOnly ? (
              ''
            ) : (
              <Button variant="success" type="submit">
                Add
              </Button>
            )}
          </Row>
        </Form>
      </PageBlock>
    </>
  );
};

export default ProposedSolutionForm;
