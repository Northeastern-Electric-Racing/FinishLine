/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ChangeRequest } from 'shared';
import { FormControl, FormLabel, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { DeleteChangeRequestInputs } from './DeleteChangeRequest';
import ReactHookTextField from '../../components/ReactHookTextField';
import NERFormModal from '../../components/NERFormModal';

interface DeleteChangeRequestViewProps {
  changeRequest: ChangeRequest;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: DeleteChangeRequestInputs) => Promise<void>;
}

const DeleteChangeRequestView: React.FC<DeleteChangeRequestViewProps> = ({ changeRequest, modalShow, onHide, onSubmit }) => {
  const changeRequestIdTester = (crId: string | undefined) => crId !== undefined && crId === changeRequest.crId.toString();

  const schema = yup.object().shape({
    crId: yup.string().required().test('cr-id-test', 'Change Request ID does not match', changeRequestIdTester)
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      crId: ''
    },
    mode: 'onChange'
  });

  return (
    <NERFormModal
      open={modalShow}
      onHide={onHide}
      title={`Delete Change Request #${changeRequest.crId}`}
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="delete-cr-form"
      disabled={!isValid}
      showCloseButton
    >
      <Typography sx={{ marginBottom: '1rem' }}>
        Are you sure you want to delete Change Request #{changeRequest.crId}?
      </Typography>
      <Typography sx={{ fontWeight: 'bold' }}>This action cannot be undone!</Typography>
      <FormControl>
        <FormLabel sx={{ marginTop: '1rem', marginBottom: '1rem' }}>
          To confirm deletion, please type in the ID number of this Change Request.
        </FormLabel>
        <ReactHookTextField
          control={control}
          name="crId"
          errorMessage={errors.crId}
          placeholder="Enter Change Request ID here"
          sx={{ width: 1 }}
          type="number"
        />
      </FormControl>
    </NERFormModal>
  );
};

export default DeleteChangeRequestView;
