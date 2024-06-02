import { yupResolver } from '@hookform/resolvers/yup';
import { FormControl, FormHelperText, FormLabel } from '@mui/material';
import { useForm } from 'react-hook-form';
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
}

const AddGanttProjectModal: React.FC<AddGanttProjectModalProps> = ({ showModal, handleClose, addProject }) => {
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
      reset={() => reset({ name: '' })}
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
      <FormControl>
        <FormLabel>Car Number</FormLabel>
        <ReactHookTextField name="carNumber" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.carNumber?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default AddGanttProjectModal;
