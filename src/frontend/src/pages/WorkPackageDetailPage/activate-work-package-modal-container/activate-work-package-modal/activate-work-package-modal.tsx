/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { User, WbsNumber } from 'shared';
import { FormInput } from '../activate-work-package-modal-container';
import { fullNamePipe, wbsPipe } from '../../../../pipes';

interface ActivateWorkPackageModalProps {
  allUsers: User[];
  wbsNum: WbsNumber;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: FormInput) => Promise<void>;
}

const schema = yup.object().shape({
  projectLeadId: yup.number().required().min(0),
  projectManagerId: yup.number().required().min(0),
  startDate: yup.string().required(),
  confirmDetails: yup.boolean().required()
});

const ActivateWorkPackageModal: React.FC<ActivateWorkPackageModalProps> = ({
  allUsers,
  wbsNum,
  modalShow,
  onHide,
  onSubmit
}) => {
  const { register, reset, handleSubmit } = useForm<FormInput>({
    resolver: yupResolver(schema)
  });

  /**
   * Wrapper function for onSubmit so that form data is reset after submit
   */
  const onSubmitWrapper = async (data: FormInput) => {
    await onSubmit(data);
    reset({ projectLeadId: -1, projectManagerId: -1, startDate: '', confirmDetails: false });
  };

  return (
    <Modal show={modalShow} onHide={onHide} centered>
      <Modal.Header className={'font-weight-bold'} closeButton>{`Activate #${wbsPipe(
        wbsNum
      )}`}</Modal.Header>
      <Modal.Body>
        <Form id={'activate-work-package-form'} onSubmit={handleSubmit(onSubmitWrapper)}>
          <div className={'px-4'}>
            <Form.Group controlId="activateWPForm-StartDate">
              <Form.Label>Start Date (YYYY-MM-DD)</Form.Label>
              <Form.Control {...register('startDate')}></Form.Control>
            </Form.Group>

            <Form.Group controlId="activateWPForm-ProjectLead">
              <Form.Label>Project Lead</Form.Label>
              <Form.Control {...register('projectLeadId')} as="select" custom>
                <option key={-1} value={-1}></option>
                {allUsers.map((p) => (
                  <option key={p.userId} value={p.userId}>
                    {fullNamePipe(p)}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="activateWPForm-ProjectManager">
              <Form.Label>Project Manager</Form.Label>
              <Form.Control {...register('projectManagerId')} as="select" custom>
                <option key={-1} value={-1}></option>
                {allUsers.map((p) => (
                  <option key={p.userId} value={p.userId}>
                    {fullNamePipe(p)}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="activateWPForm-ConfirmDetails">
              Are the WP details correct?
              <Form.Check
                inline
                label="Yes"
                type={'radio'}
                id={`activateWPForm-ConfirmDetails-checkbox-yes`}
                aria-labelledby={`activateWPForm-ConfirmDetails`}
                value={1}
                {...register('confirmDetails')}
              />
              <Form.Check
                inline
                label="No"
                type={'radio'}
                id={`activateWPForm-ConfirmDetails-checkbox-no`}
                aria-labelledby={`activateWPForm-ConfirmDetails`}
                value={0}
                {...register('confirmDetails')}
              />
            </Form.Group>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className={'ml-3'}
          variant="secondary"
          form="activate-work-package-form"
          onClick={onHide}
        >
          Cancel
        </Button>
        <Button variant="success" type="submit" form="activate-work-package-form">
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ActivateWorkPackageModal;
