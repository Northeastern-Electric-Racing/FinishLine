import { yupResolver } from '@hookform/resolvers/yup';
import { FormControl, FormHelperText, FormLabel, MenuItem, Select } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Car } from 'shared';
import * as yup from 'yup';
import NERFormModal from '../../../components/NERFormModal';
import ReactHookTextField from '../../../components/ReactHookTextField';

const schema = yup.object().shape({
  name: yup.string().required('Project name is Required'),
  carNumber: yup.number().required('Car Number is Required')
});

interface AddGanttProjectModalProps {
  showModal: boolean;
  handleClose: () => void;
  addProject: (project: { name: string; carNumber: number }) => void;
  cars: Car[];
}

const AddGanttProjectModal: React.FC<AddGanttProjectModalProps> = ({ showModal, handleClose, addProject, cars }) => {
  const onSubmit = async (data: { name: string; carNumber: number }) => {
    addProject(data);
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
      carNumber: 0
    }
  });

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title="New Project"
      reset={() => reset({ name: '', carNumber: 0 })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="new-project-form"
      showCloseButton
    >
      <FormControl sx={{ marginRight: '10px' }}>
        <FormLabel>Project Name</FormLabel>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Car</FormLabel>
        <Controller
          name="carNumber"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Select error={!!errors.carNumber} value={value} onChange={onChange}>
              {cars &&
                cars.toReversed().map((car) => (
                  <MenuItem key={car.wbsElementId} value={car.wbsNum.carNumber}>
                    {car.name}
                  </MenuItem>
                ))}
            </Select>
          )}
        />
        <FormHelperText error>{errors.carNumber?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default AddGanttProjectModal;
