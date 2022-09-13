/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormInput } from './ReviewChangeRequest';
import { ChangeRequestType } from 'shared';

interface ReviewChangeRequestViewProps {
  crId: number;
  crType: ChangeRequestType;
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
  crType,
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
        {crType === ChangeRequestType.Activation && (
          <div>
            NOTE: Accepting this change request will cause the following actions to occur for the
            associated work package
            <ul>
              <li>Its status will be changed to ACTIVE</li>
              <li>The project lead will be updated to match the change request</li>
              <li>The project manager will be updated to match this change request</li>
              <li>TThe start date will be updated to match this change request</li>
            </ul>
          </div>
        )}
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
