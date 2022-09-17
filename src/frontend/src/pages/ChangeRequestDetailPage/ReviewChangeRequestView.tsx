/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Button, ListGroup, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormInput } from './ReviewChangeRequest';
import styles from '../../stylesheets/components/ModalList.module.css';
import {
  ActivationChangeRequest,
  ChangeRequest,
  ChangeRequestType,
  ProposedSolution, StageGateChangeRequest,
  StandardChangeRequest,
  User
} from 'shared';

import PageBlock from '../../layouts/PageBlock';
import { Badge, Col, Container, Row } from 'react-bootstrap';
import { dollarsPipe, weeksPipe } from '../../utils/Pipes';
import { getChangeRequestByID } from 'backend/src/controllers/change-requests.controllers';
import { useEffect, useState } from 'react';
import ProposedSolutionForm from './ProposedSolutionForm';
import { C } from 'msw/lib/glossary-297d38ba';


interface ReviewChangeRequestViewProps {
  crId: number;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: FormInput) => Promise<void>;
}

const schema = yup.object().shape({
  reviewNotes: yup.string(),
  accepted: yup.boolean().required()
});

/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
interface ProposedSolutionViewProps {
  proposedSolution: ProposedSolution;
  selected: boolean;
  setter: any;
}

const ProposedSolutionView: React.FC<ProposedSolutionViewProps> = ({ proposedSolution , selected, setter}) => {
  const spacer = 'mb-2';

  return (
    <PageBlock
      title=""
    >
      <Container fluid style={{'color': '#FFFFFF'}}>
        <Row className={spacer} onClick={setter}>
            <b>Description</b>
            {selected ? <Badge variant="success" style={{'margin': '0 0 0 70%'}}>Selected</Badge>
              : <Badge variant="danger" style={{'margin': '0 0 0 70%'}}>Unselected</Badge>}
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
          <Col className={spacer} >
            <b>Scope Impact</b>
          </Col>
          <Col className={spacer}>{proposedSolution.scopeImpact}</Col>
        </Row>
      </Container>
    </PageBlock>
  );
};

const ReviewChangeRequestsView: React.FC<ReviewChangeRequestViewProps> = ({
  crId,
  modalShow,
  onHide,
  onSubmit,
}: ReviewChangeRequestViewProps) => {

  const [solutions, setSolutions] = useState([]);
  const [selected, setSelected] = useState(-1);

  const { register, setValue, getFieldState, reset, handleSubmit } = useForm<FormInput>({
    resolver: yupResolver(schema)
  });

  /**
   * Register (or set registered field) to the appropriate boolean based on which action button was clicked
   * @param value true if review accepted, false if denied
   */
  const handleAcceptDeny = (value: boolean, proposedSolutionIndex: number ) => {
    getFieldState('accepted') ? setValue('accepted', value) : register('accepted', { value });
  };

  /**
   * Wrapper function for onSubmit so that form data is reset after submit
   */
  const onSubmitWrapper = async (data: FormInput) => {
    await onSubmit(data);
    reset({ reviewNotes: '' });
  };

  const overflow : object = {
    'overflow-y': 'scroll',
    'max-height': '300px'
  }


  useEffect(() => {
    fetch('http://localhost:3001/change-requests/' + crId)
      .then(function(response) {
        // The response is a Response instance.
        // You parse the data into a useable format using `.json()`
        return response.json();
      }).then(function(data) {
      // `data` is the parsed version of the JSON returned from the above endpoint.
      setSolutions(data['proposedSolutions']);  // { "userId": 1, "id": 1, "title": "...", "body": "..." }
    });
  })

  return (
    <Modal show={modalShow} onHide={onHide} centered>
      <Modal.Header
        className={'font-weight-bold'}
        closeButton
      >{`Review Change Request #${crId}`}</Modal.Header>
      <Modal.Body>
        <Form id={'review-notes-form'} onSubmit={handleSubmit(onSubmitWrapper)}>
            <Form.Label>Select Proposed Solution</Form.Label>
        </Form>
        <div style={overflow}>

            {solutions.map((solution : ProposedSolution, i : number) => {
              return (<div style={{'cursor': 'pointer', 'width' : 'auto', 'margin' : 'auto', 'display' : 'block'}}>
                        <ProposedSolutionView proposedSolution={solution} selected={selected === i} setter={() => setSelected(i)} />
                      </div>)
            })}
        </div>

        <Form id={'review-notes-form'} onSubmit={handleSubmit(onSubmitWrapper)}>
          <Form.Group controlId="formReviewNotes">
            <Form.Label>Additional Comments</Form.Label>
            <Form.Control {...register('reviewNotes')} as="textarea" rows={3} cols={50} />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="success"
          type="submit"
          form="review-notes-form"
          onClick={() => {selected > -1 ? handleAcceptDeny(true, selected) : alert("Please select a proposed solution!")}}
        >
          Accept
        </Button>
        <Button
          className={'ml-3'}
          variant="danger"
          type="submit"
          form="review-notes-form"
          onClick={() => {selected > -1 ? handleAcceptDeny(false, selected) : alert("Please select a proposed solution!")}}
        >
          Deny
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReviewChangeRequestsView;
