import { Control, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';
import NERFormModal from '../../../../../components/NERFormModal';
import { FormControl, FormLabel } from '@mui/material';
import ReactHookTextField from '../../../../../components/ReactHookTextField';
import { PartFormInput } from './PartForm';

export interface PartFormViewProps {
  submitText: 'Add' | 'Edit';
  handleSubmit: UseFormHandleSubmit<PartFormInput>;
  onSubmit: (payload: PartFormInput) => void;
  onHide: () => void;
  control: Control<PartFormInput, any>;
  errors: FieldErrors<PartFormInput>;
  open: boolean;
}

const PartFormView: React.FC<PartFormViewProps> = ({
  submitText,
  handleSubmit,
  onSubmit,
  onHide,
  control,
  errors,
  allParts,
  open,
  setValue
}) => {
  return (
    <NERFormModal
      open={open}
      onHide={onHide}
      title={submitText + ' Part'}
      reset={() => {}}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId={submitText + '-Part'}
      showCloseButton
    >
      <FormControl fullWidth>
        <FormLabel>Tags (Optional)</FormLabel>
      </FormControl>
      <FormControl fullWidth sx={{ mb: '10px' }}>
        <FormLabel>Common Name</FormLabel>
        <ReactHookTextField
          control={control}
          name="CommonName"
          errorMessage={errors.name}
          placeholder="Name..."
          sx={{ width: 1 }}
        />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Description (optional)</FormLabel>
        <ReactHookTextField
          control={control}
          name="Description"
          errorMessage={errors.notes}
          placeholder="Description of the part goes here..."
          sx={{ width: 1 }}
        />
      </FormControl>
    </NERFormModal>
  );
};

export default PartFormView;
