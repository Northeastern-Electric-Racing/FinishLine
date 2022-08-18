/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageBlock from '../layouts/PageBlock';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

interface ProposedSolution {
  description: string;
  budgetImpact: number;
  timelineImpact: number;
  scope: string;
}

interface ProposedSolutionFormProps {
  description?: string;
  budgetImpact?: number;
  timelineImpact?: number;
  scope?: string;
  readOnly?: boolean;
  onAdd: (data: ProposedSolution) => void;
}

const schema = yup.object().shape({
  description: yup.string().required('Description is required'),
  budgetImpact: yup
    .number()
    .typeError('Budget Impact must be a number')
    .min(0, 'Budget Impact must be greater than or equal to $0')
    .required('Budget Impact is required')
    .integer('Budget Impact must be an integer'),
  scope: yup.string().required('Scope is required'),
  timelineImpact: yup
    .number()
    .typeError('Timeline must be a number')
    .min(0, 'Timeline must be greater than or equal to 0 weeks')
    .required('Timeline is required')
    .integer('Timeline must be an integer')
});

const ProposedSolutionForm: React.FC<ProposedSolutionFormProps> = ({
  description,
  budgetImpact,
  timelineImpact,
  scope,
  readOnly,
  onAdd
}) => {
  const { register, formState, handleSubmit } = useForm<ProposedSolution>({
    resolver: yupResolver(schema),
    defaultValues: { description, budgetImpact, timelineImpact, scope }
  });

  return (
    <>
      <PageBlock title={''}>
        <Form id="individual-proposed-solution-form" onSubmit={handleSubmit(onAdd)}>
          <Row className="mx-2 justify-content-start">
            <Col lg={true}>
              <Form.Group controlId="formDescription" className="mx-2">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...register('description')}
                  placeholder="Describe the proposed solution..."
                  isInvalid={formState.errors.description?.message !== undefined}
                  readOnly={readOnly}
                />
                <Form.Control.Feedback type="invalid">
                  {formState.errors.description?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col lg={true}>
              <Form.Group controlId="formScope" className="mx-2">
                <Form.Label>Scope</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...register('scope')}
                  placeholder="What changes to the scope does this entail?"
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
            <Col lg={true}>
              <Row className="mx-2 justify-content-start">
                <Col lg={true} className="pl-0">
                  <Form.Group controlId="formBudgetImpact">
                    <Form.Label>Budget Impact</Form.Label>
                    <InputGroup>
                      <InputGroup.Prepend>
                        <InputGroup.Text>$</InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control
                        {...register('budgetImpact')}
                        placeholder="$ needed"
                        isInvalid={formState.errors.budgetImpact?.message !== undefined}
                        readOnly={readOnly}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formState.errors.budgetImpact?.message}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col lg={true} className="pr-0">
                  <Form.Group controlId="formTimelineImpact">
                    <Form.Label>Timeline Impact</Form.Label>
                    <InputGroup>
                      <Form.Control
                        {...register('timelineImpact')}
                        placeholder="# needed"
                        isInvalid={formState.errors.timelineImpact?.message !== undefined}
                        readOnly={readOnly}
                      />
                      <InputGroup.Append>
                        <InputGroup.Text>weeks</InputGroup.Text>
                      </InputGroup.Append>
                      <Form.Control.Feedback type="invalid">
                        {formState.errors.timelineImpact?.message}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            </Col>
            <Col lg={true}>
              <Row className="mx-2 justify-content-end">
                {readOnly ? (
                  ''
                ) : (
                  <Button variant="success" type="submit">
                    Add
                  </Button>
                )}
              </Row>
            </Col>
          </Row>
        </Form>
      </PageBlock>
    </>
  );
};

export default ProposedSolutionForm;
