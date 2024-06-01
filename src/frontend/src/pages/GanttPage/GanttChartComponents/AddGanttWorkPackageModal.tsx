import { yupResolver } from '@hookform/resolvers/yup';
import { FormControl, FormHelperText, FormLabel, MenuItem, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { WorkPackageStage } from 'shared';
import * as yup from 'yup';
import NERFormModal from '../../../components/NERFormModal';
import ReactHookTextField from '../../../components/ReactHookTextField';

const schema = yup.object().shape({
  name: yup.string().required('Work Package name is Required')
});

interface AddGanttWorkPackageModalProps {
  showModal: boolean;
  handleClose: () => void;
  addWorkPackage: (workPackge: { name: string; stage?: WorkPackageStage }) => void;
}

const AddGanttWorkPackageModal: React.FC<AddGanttWorkPackageModalProps> = ({ showModal, handleClose, addWorkPackage }) => {
  const onSubmit = async (data: { name: string; stage: WorkPackageStage | 'NONE' }) => {
    addWorkPackage({
      ...data,
      stage: data.stage === 'NONE' ? undefined : data.stage
    });
    handleClose();
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      stage: 'NONE'
    }
  });

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title="New Work Package"
      reset={() => reset({ name: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="new-work-package-form"
      showCloseButton
    >
      <FormControl>
        <FormLabel>Name</FormLabel>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Work Package Stage</FormLabel>
        <Controller
          name="stage"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextField select onChange={onChange} value={value} fullWidth>
              <MenuItem value={'NONE'}>NONE</MenuItem>
              {Object.values(WorkPackageStage).map((stage) => (
                <MenuItem key={stage} value={stage}>
                  {stage}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </FormControl>
    </NERFormModal>
  );
};

export default AddGanttWorkPackageModal;
