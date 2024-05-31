/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsNumber, wbsPipe } from 'shared';
import { FormControl, FormLabel, Typography } from '@mui/material';
import NERFormModal from '../../../components/NERFormModal';
import { useForm } from 'react-hook-form';
import ReactHookTextField from '../../../components/ReactHookTextField';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { DeleteWorkPackageInputs } from './DeleteWorkPackage';

interface DeleteWorkPackageViewProps {
  workPackage: WbsNumber;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: DeleteWorkPackageInputs) => Promise<void>;
}

const DeleteWorkPackageView: React.FC<DeleteWorkPackageViewProps> = ({ workPackage, modalShow, onHide, onSubmit }) => {
  const workPackageWbsTester = (wbsNum: string | undefined) => wbsNum !== undefined && wbsNum === wbsPipe(workPackage);

  const schema = yup.object().shape({
    wbsNum: yup.string().required().test('wp-wbs-test', 'Work Package WBS Number does not match', workPackageWbsTester)
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      wbsNum: ''
    },
    mode: 'onChange'
  });

  const onSubmitWrapper = async (data: DeleteWorkPackageInputs) => {
    await onSubmit(data);
  };

  return (
    <NERFormModal
      open={modalShow}
      onHide={onHide}
      title={`Delete Work Package #${wbsPipe(workPackage)}`}
      reset={() => reset({ wbsNum: '' })}
      submitText="Delete"
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmitWrapper}
      formId="delete-wp-form"
      showCloseButton
    >
      <Typography sx={{ marginBottom: '1rem' }}>
        Are you sure you want to delete Work Package #{wbsPipe(workPackage)}?
      </Typography>
      <Typography sx={{ fontWeight: 'bold' }}>This action cannot be undone!!!</Typography>
      <FormControl>
        <FormLabel sx={{ marginTop: '1rem', marginBottom: '1rem' }}>
          To confirm deletion, please type in the WBS number of this Work Package.
        </FormLabel>
        <ReactHookTextField
          control={control}
          name="wbsNum"
          errorMessage={errors.wbsNum}
          placeholder="Enter Work Package WBS # here"
          sx={{ width: 1 }}
          type="string"
        />
      </FormControl>
    </NERFormModal>
  );
};

export default DeleteWorkPackageView;
