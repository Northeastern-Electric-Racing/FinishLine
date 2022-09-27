/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormInput } from './ReviewChangeRequest';
import { ChangeRequest, ProposedSolution, StandardChangeRequest } from 'shared';
import { useState } from 'react';
import ProposedSolutionSelectItem from './ProposedSolutionSelectItem';

interface ReviewChangeRequestViewProps {
  cr: ChangeRequest;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: FormInput) => Promise<void>;
}

const schema = yup.object().shape({
  reviewNotes: yup.string(),
  accepted: yup.boolean().required()
});

const ReviewChangeRequestsView: React.FC<ReviewChangeRequestViewProps> = ({
  cr,
  modalShow,
  onHide,
  onSubmit
}: ReviewChangeRequestViewProps) => {
  // const [solutions, setSolutions] = useState([]);
  const [selected, setSelected] = useState(-1);

  const { register, setValue, getFieldState, reset, handleSubmit } = useForm<FormInput>({
    resolver: yupResolver(schema)
  });

  /**
   * Register (or set registered field) to the appropriate boolean based on which action button was clicked
   * @param value true if review accepted, false if denied
   */
  const handleAcceptDeny = (value: boolean) => {
    getFieldState('accepted') ? setValue('accepted', value) : register('accepted', { value });
  };

  /**
   * Wrapper function for onSubmit so that form data is reset after submit
   */
  const onSubmitWrapper = async (data: FormInput) => {
    await onSubmit(data);
    reset({ reviewNotes: '' });
  };

  const overflow: object = {
    'overflow-y': 'scroll',
    'max-height': '300px'
  };

  const proposedSolutionStyle = {
    cursor: 'pointer',
    width: 'auto',
    margin: 'auto',
    display: 'block'
  };

  if (cr.type === 'ISSUE') {
    const issueCR = cr as StandardChangeRequest;
    return (
      <Modal
        show={modalShow}
        onHide={onHide}
        style={{ color: 'black' }}
        dialogClassName={'modaltheme'}
        centered
      >
        <Modal.Header
          className={'font-weight-bold'}
          closeButton
        >{`Review Change Request #${cr.crId}`}</Modal.Header>
        <Modal.Body>
          <Form id={'review-notes-form'} onSubmit={handleSubmit(onSubmitWrapper)}>
            <Form.Label>Select Proposed Solution</Form.Label>
          </Form>
          <div style={overflow}>
            {issueCR.proposedSolutions.map((solution: ProposedSolution, i: number) => {
              return (
                <div style={proposedSolutionStyle}>
                  <ProposedSolutionSelectItem
                    proposedSolution={solution}
                    selected={selected === i}
                    onClick={() => setSelected(i)}
                  />
                </div>
              );
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
            onClick={() => {
              selected > -1 ? handleAcceptDeny(true) : alert('Please select a proposed solution!');
            }}
          >
            Accept
          </Button>
          <Button
            className={'ml-3'}
            variant="danger"
            type="submit"
            form="review-notes-form"
            onClick={() => {
              selected > -1 ? handleAcceptDeny(false) : alert('Please select a proposed solution!');
            }}
          >
            Deny
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Modal show={modalShow} onHide={onHide} centered>
      <Modal.Header
        className={'font-weight-bold'}
        closeButton
      >{`Review Change Request #${cr.crId}`}</Modal.Header>
      <Modal.Body>
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
          onClick={() => handleAcceptDeny(true)}
        >
          Accept
        </Button>
        <Button
          className={'ml-3'}
          variant="danger"
          type="submit"
          form="review-notes-form"
          onClick={() => handleAcceptDeny(false)}
        >
          Deny
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReviewChangeRequestsView;
