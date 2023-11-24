import { Control, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';
import NERFormModal from '../../../../../components/NERFormModal';
import { AssemblyFormInput } from './AssemblyForm';
import { FormControl, FormLabel } from '@mui/material';
import ReactHookTextField from '../../../../../components/ReactHookTextField';

export interface AssemblyFormViewProps {
  submitText: 'Add' | 'Edit';
  handleSubmit: UseFormHandleSubmit<AssemblyFormInput>;
  onSubmit: (payload: AssemblyFormInput) => void;
  onHide: () => void;
  control: Control<AssemblyFormInput, any>;
  errors: FieldErrors<AssemblyFormInput>;
  open: boolean;
}

const AssemblyFormView: React.FC<AssemblyFormViewProps> = ({
  submitText,
  handleSubmit,
  onSubmit,
  onHide,
  control,
  errors,
  open
}) => {
  return (
    <NERFormModal
      open={open}
      onHide={onHide}
      title={submitText + ' Assembly'}
      reset={() => {}}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId={submitText + '-assembly-form'}
      showCloseButton
    >
      <FormControl fullWidth sx={{ mb: '10px' }}>
        <FormLabel>Assembly Name</FormLabel>
        <ReactHookTextField
          control={control}
          name="name"
          errorMessage={errors.name}
          placeholder="Enter Assembly Name"
          sx={{ width: 1 }}
        />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>PDM File Name (optional)</FormLabel>
        <ReactHookTextField
          control={control}
          name="pdmFileName"
          errorMessage={errors.pdmFileName}
          placeholder="Enter PDM File Name"
          sx={{ width: 1 }}
        />
      </FormControl>
    </NERFormModal>
  );
};

export default AssemblyFormView;
