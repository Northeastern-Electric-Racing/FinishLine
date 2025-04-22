import { Control, FieldErrors, UseFormHandleSubmit, UseFormSetValue, UseFormReset } from 'react-hook-form';
import NERFormModal from '../../../../../components/NERFormModal';
import { FormControl, FormLabel } from '@mui/material';
import ReactHookTextField from '../../../../../components/ReactHookTextField';
import { ReviewFormInput } from './ReviewForm';

export interface ReviewFormViewProps {
  submitText: 'Add' | 'Edit';
  handleSubmit: UseFormHandleSubmit<ReviewFormInput>;
  onSubmit: (payload: ReviewFormInput) => void;
  onHide: () => void;
  control: Control<ReviewFormInput, any>;
  errors: FieldErrors<ReviewFormInput>;
  open: boolean;
  setValue: UseFormSetValue<ReviewFormInput>;
  reset: UseFormReset<ReviewFormInput>;
}

const ReviewFormView: React.FC<ReviewFormViewProps> = ({
  submitText,
  handleSubmit,
  onSubmit,
  onHide,
  control,
  errors,
  open,
  setValue,
  reset
}) => {
  return (
    <NERFormModal
      open={open}
      onHide={onHide}
      title={submitText + ' Review'}
      reset={() => {}}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId={submitText + '-review'}
      showCloseButton
    >
      <FormControl fullWidth>
        <FormLabel>Part</FormLabel>
      </FormControl>
      <FormControl fullWidth sx={{ mb: '10px' }}>
        <FormLabel>Part</FormLabel> //fix to be dropdown
        <ReactHookTextField control={control} name="Part" errorMessage={errors.partId} placeholder=" " sx={{ width: 1 }} />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Uploader Notes (optional)</FormLabel>
        <ReactHookTextField
          control={control}
          name="comments"
          errorMessage={errors.notes}
          placeholder="Any additional comments go here..."
          sx={{ width: 1 }}
        />
      </FormControl>
    </NERFormModal>
  );
};

export default ReviewFormView;
