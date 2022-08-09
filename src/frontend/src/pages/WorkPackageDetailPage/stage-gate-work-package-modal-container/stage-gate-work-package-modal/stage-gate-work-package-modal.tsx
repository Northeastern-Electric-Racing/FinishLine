/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { WbsNumber } from 'shared';
import { FormInput } from '../stage-gate-work-package-modal-container';
import { wbsPipe } from '../../../../pipes';

interface StageGateWorkPackageModalProps {
  wbsNum: WbsNumber;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: FormInput) => Promise<void>;
}

const schema = yup.object().shape({
  leftoverBudget: yup.number().required().min(0),
  confirmDone: yup.boolean().required()
});

const StageGateWorkPackageModal: React.FC<StageGateWorkPackageModalProps> = ({
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
    reset({ leftoverBudget: 0, confirmDone: false });
  };

  return (
    <Modal show={modalShow} onHide={onHide} centered>
      <Modal.Header className={'font-weight-bold'} closeButton>{`Stage Gate #${wbsPipe(
        wbsNum
      )}`}</Modal.Header>
      <Modal.Body>
        <Form id={'stage-gate-work-package-form'} onSubmit={handleSubmit(onSubmitWrapper)}>
          <div className={'px-4'}>
            <Form.Group controlId="stageGateWPForm-LeftoverBudget">
              <Form.Label>Leftover Budget</Form.Label>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>$</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control {...register('leftoverBudget')}></Form.Control>
              </InputGroup>
            </Form.Group>

            <Form.Group controlId="stageGateWPForm-ConfirmDone">
              Is everything done?
              <ul>
                <li>Updated slide deck & documentation</li>
                <li>Creating any outstanding change requests</li>
                <li>Submitted all receipts to the procurement form</li>
                <li>Completed all Work Package expected activities</li>
                <li>Completed all Work Package deliverables</li>
                <li>Ensure rules compliance</li>
              </ul>
              <Form.Check
                inline
                label="Yes"
                type={'radio'}
                id={`stageGateWPForm-ConfirmDone-checkbox-yes`}
                aria-labelledby={`stageGateWPForm-ConfirmDone`}
                value={1}
                {...register('confirmDone')}
              />
              <Form.Check
                inline
                label="No"
                type={'radio'}
                id={`stageGateWPForm-ConfirmDone-checkbox-no`}
                aria-labelledby={`stageGateWPForm-ConfirmDone`}
                value={0}
                {...register('confirmDone')}
              />
            </Form.Group>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className={'ml-3'}
          variant="secondary"
          form="stage-gate-work-package-form"
          onClick={onHide}
        >
          Cancel
        </Button>
        <Button variant="success" type="submit" form="stage-gate-work-package-form">
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StageGateWorkPackageModal;
