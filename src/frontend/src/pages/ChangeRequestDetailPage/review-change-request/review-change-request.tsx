/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormInput } from '../review-change-request';

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

const ReviewChangeRequestsView: React.FC<ReviewChangeRequestViewProps> = ({
  crId,
  modalShow,
  onHide,
  onSubmit
}: ReviewChangeRequestViewProps) => {
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

  return (
    <Modal show={modalShow} onHide={onHide} centered>
      <Modal.Header
        className={'font-weight-bold'}
        closeButton
      >{`Review Change Request #${crId}`}</Modal.Header>
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
