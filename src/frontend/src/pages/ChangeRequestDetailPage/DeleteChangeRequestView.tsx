/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ChangeRequest } from 'shared';
import { FormControl, FormLabel, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import ReactHookTextField from '../../components/ReactHookTextField';
import NERFormModal from '../../components/NERFormModal';

interface DeleteChangeRequestViewProps {
  changeRequest: ChangeRequest;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: () => Promise<void>;
}

const DeleteChangeRequestView: React.FC<DeleteChangeRequestViewProps> = ({ changeRequest, modalShow, onHide, onSubmit }) => {
  const changeRequestIdTester = (identifier: string | undefined) =>
    identifier !== undefined && identifier === changeRequest.identifier.toString();

  const schema = yup.object().shape({
    identifier: yup.string().required().test('cr-identifier-test', 'Change Request ID does not match', changeRequestIdTester)
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      identifier: ''
    },
    mode: 'onChange'
  });

  return (
    <NERFormModal
      open={modalShow}
      onHide={onHide}
      title={`Delete Change Request #${changeRequest.identifier}`}
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="delete-cr-form"
      disabled={!isValid}
      showCloseButton
    >
      <Typography sx={{ marginBottom: '1rem' }}>
        Are you sure you want to delete Change Request #{changeRequest.identifier}?
      </Typography>
      <Typography sx={{ fontWeight: 'bold' }}>This action cannot be undone!</Typography>
      <FormControl>
        <FormLabel sx={{ marginTop: '1rem', marginBottom: '1rem' }}>
          To confirm deletion, please type in the ID number of this Change Request.
        </FormLabel>
        <ReactHookTextField
          control={control}
          name="identifier"
          errorMessage={errors.identifier}
          placeholder="Enter Change Request ID here"
          sx={{ width: 1 }}
          type="number"
        />
      </FormControl>
    </NERFormModal>
  );
};

export default DeleteChangeRequestView;
