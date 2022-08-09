/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ChangeRequestReason, ChangeRequestType, validateWBS } from 'shared';
import { routes } from '../../../routes';
import { FormInput } from '../create-change-request';
import PageTitle from '../../../layouts/page-title/page-title';
import PageBlock from '../../../layouts/page-block/page-block';

interface CreateChangeRequestViewProps {
  wbsNum: string;
  onSubmit: (data: FormInput) => Promise<void>;
}

const wbsTester = (wbsNum: string | undefined) => {
  if (!wbsNum) return false;
  try {
    validateWBS(wbsNum);
  } catch (error) {
    return false;
  }
  return true;
};

const schema = yup.object().shape({
  wbsNum: yup
    .string()
    .required('WBS number is required')
    .test('wbs-num-valid', 'WBS Number is not valid', wbsTester),
  type: yup.string().required('Type is required'),
  what: yup.string().required('What is required'),
  scopeImpact: yup.string().required('Scope Impact is required'),
  timelineImpact: yup
    .number()
    .typeError('Timeline Impact must be a number')
    .min(0, 'Timeline Impact must be greater than or equal to 0 weeks')
    .required('Timeline Impact is required'),
  budgetImpact: yup
    .number()
    .typeError('Budget Impact must be a number')
    .min(0, 'Budget Impact must be greater than or equal to $0')
    .required('Budget Impact is required'),
  why: yup
    .array()
    .min(1, 'At least one Why is required')
    .required('Why is required')
    .of(
      yup.object().shape({
        type: yup.string().required('Why Type is required'),
        explain: yup
          .string()
          .required('Why Explain is required')
          .when('type', {
            is: ChangeRequestReason.OtherProject,
            then: yup.string().test('wbs-num-valid', 'WBS Number is not valid', wbsTester)
          })
      })
    )
});

const CreateChangeRequestsView: React.FC<CreateChangeRequestViewProps> = ({ wbsNum, onSubmit }) => {
  const { register, handleSubmit, control, formState } = useForm<FormInput>({
    resolver: yupResolver(schema),
    defaultValues: { wbsNum, why: [{ type: ChangeRequestReason.Other, explain: '' }] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'why' });

  const permittedTypes = Object.values(ChangeRequestType).filter(
    (t) => t !== ChangeRequestType.Activation && t !== ChangeRequestType.StageGate
  );

  return (
    <>
      <PageTitle
        title={'New Change Request'}
        previousPages={[{ name: 'Change Requests', route: routes.CHANGE_REQUESTS }]}
      />
      <PageBlock title={''}>
        <Form id={'create-standard-change-request-form'} onSubmit={handleSubmit(onSubmit)}>
          <Row className="mx-2 justify-content-start">
            <Col md={5} lg={4} xl={4}>
              <Form.Group controlId="formWBSNumber" className="mx-2">
                <Form.Label>WBS Number</Form.Label>
                <Form.Control
                  {...register('wbsNum')}
                  placeholder="Project or Work Package WBS #"
                  isInvalid={formState.errors.wbsNum?.message !== undefined}
                />
                <Form.Control.Feedback type="invalid">
                  {formState.errors.wbsNum?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4} lg={4} xl={4}>
              <Form.Group controlId="formType" className="mx-2">
                <Form.Label>Type</Form.Label>
                <Form.Control
                  as="select"
                  {...register('type')}
                  isInvalid={formState.errors.type?.message !== undefined}
                  custom
                >
                  {permittedTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formState.errors.type?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mx-2 justify-content-start">
            <Col>
              <Form.Group controlId="formWhat" className="mx-2">
                <Form.Label>What</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  cols={50}
                  {...register('what')}
                  placeholder="What is the situation?"
                  isInvalid={formState.errors.what?.message !== undefined}
                />
                <Form.Control.Feedback type="invalid">
                  {formState.errors.what?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col sm={6} md={6} lg={6} xl={6}>
              <Form.Group controlId="formWhy" className="mx-2">
                <Form.Label>Why</Form.Label>
                {fields.map((field, index) => (
                  <InputGroup key={index} className="d-flex m-1">
                    <Form.Control
                      as="select"
                      {...register(`why.${index}.type` as const)}
                      isInvalid={formState.errors.why?.[index]?.type !== undefined}
                      custom
                    >
                      {Object.values(ChangeRequestReason).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Form.Control>
                    <Form.Control
                      {...register(`why.${index}.explain` as const)}
                      placeholder="Explain why"
                      isInvalid={formState.errors.why?.[index]?.explain?.message !== undefined}
                    />
                    <Button variant="danger" onClick={() => remove(index)}>
                      X
                    </Button>
                    <Form.Control.Feedback type="invalid" className="d-block">
                      {formState.errors.why?.[index]?.type}
                      {formState.errors.why?.[index]?.explain?.message}
                    </Form.Control.Feedback>
                  </InputGroup>
                ))}
                <Row className="px-2 justify-content-end">
                  <Button
                    variant="outline-secondary"
                    onClick={() => append({ type: ChangeRequestReason.Design, explain: '' })}
                  >
                    Add Reason
                  </Button>
                </Row>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mx-2 justify-content-start">
            <Col>
              <Form.Group controlId="formScopeImpact" className="mx-2">
                <Form.Label>Scope Impact</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  cols={50}
                  {...register('scopeImpact')}
                  placeholder="What do you think the impact to scope is?"
                  isInvalid={formState.errors.scopeImpact?.message !== undefined}
                />
                <Form.Control.Feedback type="invalid">
                  {formState.errors.scopeImpact?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col sm={4} md={4} lg={4} xl={4}>
              <Form.Group controlId="formTimelineImpact" className="mx-2">
                <Form.Label>Timeline Impact</Form.Label>
                <InputGroup>
                  <Form.Control
                    {...register('timelineImpact')}
                    placeholder="# needed"
                    isInvalid={formState.errors.timelineImpact?.message !== undefined}
                  />
                  <InputGroup.Append>
                    <InputGroup.Text>weeks</InputGroup.Text>
                  </InputGroup.Append>
                  <Form.Control.Feedback type="invalid">
                    {formState.errors.timelineImpact?.message}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              <Form.Group controlId="formBudgetImpact" className="mx-2">
                <Form.Label>Budget Impact</Form.Label>
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text>$</InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    {...register('budgetImpact')}
                    placeholder="$ needed"
                    isInvalid={formState.errors.budgetImpact?.message !== undefined}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formState.errors.budgetImpact?.message}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mx-2 justify-content-end">
            <Button variant="success" type="submit">
              Submit
            </Button>
          </Row>
        </Form>
      </PageBlock>
    </>
  );
};

export default CreateChangeRequestsView;
