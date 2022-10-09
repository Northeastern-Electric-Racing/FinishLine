/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageBlock from '../../layouts/PageBlock';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ProposedSolution } from 'shared';
import { useTheme } from '../../hooks/theme.hooks';

interface ProposedSolutionFormProps {
  description?: string;
  budgetImpact?: number;
  timelineImpact?: number;
  scopeImpact?: string;
  readOnly?: boolean;
  onAdd: (data: ProposedSolution) => void;
}

const styles = {
  white: {
    color: 'white'
  },
  black: {
    color: 'black'
  }
};

const schema = yup.object().shape({
  description: yup.string().required('Description is required'),
  budgetImpact: yup
    .number()
    .typeError('Budget Impact must be a number')
    .min(0, 'Budget Impact must be greater than or equal to $0')
    .required('Budget Impact is required')
    .integer('Budget Impact must be an integer'),
  scopeImpact: yup.string().required('Scope Impact is required'),
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
  scopeImpact,
  readOnly,
  onAdd
}) => {
  const { register, formState, handleSubmit } = useForm<ProposedSolution>({
    resolver: yupResolver(schema),
    defaultValues: { description, budgetImpact, timelineImpact, scopeImpact }
  });

  const theme = useTheme();

  return (
    <PageBlock title="" cardContainerStyle="mb-0">
      <Form
        id="individual-proposed-solution-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit(onAdd)(e);
        }}
      >
        <Row className="mx-2 justify-content-start">
          <Col lg={true}>
            <Form.Group controlId="formDescription" className="mx-2">
              {theme.name === 'DARK' ? (
                <Form.Label style={styles.white}>Description</Form.Label>
              ) : (
                <Form.Label style={styles.black}>Description</Form.Label>
              )}
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
              {theme.name === 'DARK' ? (
                <Form.Label style={styles.white}>Scope Impact</Form.Label>
              ) : (
                <Form.Label style={styles.black}>Scope Impact</Form.Label>
              )}
              <Form.Control
                as="textarea"
                rows={3}
                {...register('scopeImpact')}
                placeholder="What changes to the scope does this entail?"
                isInvalid={formState.errors.scopeImpact?.message !== undefined}
                readOnly={readOnly}
              />
              <Form.Control.Feedback type="invalid">
                {formState.errors.scopeImpact?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mx-2 justify-content-start">
          <Col lg={true}>
            <Row className="mx-2 justify-content-start">
              <Col lg={true} className="pl-0">
                <Form.Group controlId="formBudgetImpact">
                  {theme.name === 'DARK' ? (
                    <Form.Label style={styles.white}>Budget Impact</Form.Label>
                  ) : (
                    <Form.Label style={styles.black}>Budget Impact</Form.Label>
                  )}
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
                  {theme.name === 'DARK' ? (
                    <Form.Label style={styles.white}>Timeline Impact</Form.Label>
                  ) : (
                    <Form.Label style={styles.black}>Timeline Impact</Form.Label>
                  )}
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
            <Row className="mx-2 mt-4 justify-content-end">
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
  );
};

export default ProposedSolutionForm;
