import { Control, Controller, FieldErrors, UseFormHandleSubmit, UseFormSetValue, UseFormReset } from 'react-hook-form';
import NERFormModal from '../../../../../components/NERFormModal';
import { FormControl, FormLabel } from '@mui/material';
import ReactHookTextField from '../../../../../components/ReactHookTextField';
import NERAutocomplete from '../../../../../components/NERAutocomplete';
import { Box } from '@mui/system';
import { SubmissionFormInput } from './SubmissionForm';

export interface SubmissionFormViewProps {
  submitText: 'Add' | 'Edit';
  handleSubmit: UseFormHandleSubmit<SubmissionFormInput>;
  onSubmit: (payload: SubmissionFormInput) => void;
  onHide: () => void;
  control: Control<SubmissionFormInput, any>;
  errors: FieldErrors<SubmissionFormInput>;
  open: boolean;
  allParts: { id: string; name: string }[]; //fix
  setValue: UseFormSetValue<SubmissionFormInput>;
  reset: UseFormReset<SubmissionFormInput>;
}

const SubmissionFormView: React.FC<SubmissionFormViewProps> = ({
  submitText,
  handleSubmit,
  onSubmit,
  onHide,
  control,
  errors,
  allParts,
  open,
  setValue,
  reset
}) => {
  const partOptions = allParts.map((part) => ({
    id: part.id,
    label: part.name
  })); //fix

  return (
    <NERFormModal
      open={open}
      onHide={() => {
        reset();
        onHide();
      }}
      title={submitText + ' Submission'}
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId={submitText + '-submission'}
      showCloseButton
    >
      <Box display="flex" flexDirection="column" gap={2}>
        <FormControl fullWidth>
          <FormLabel>Part</FormLabel>
          <Controller
            name="partId"
            control={control}
            render={({ field: { onChange, value } }) => (
              <NERAutocomplete
                id="part"
                size="medium"
                options={partOptions}
                placeholder="Select Part"
                value={partOptions.find((p) => p.id === value) || null}
                onChange={(_e, newValue) => {
                  onChange(newValue?.id || '');
                }}
              />
            )}
          />
        </FormControl>

        <FormControl fullWidth>
          <FormLabel>Submission Name</FormLabel>
          <ReactHookTextField
            control={control}
            name="name"
            errorMessage={errors.name}
            placeholder="Name..."
            sx={{ width: 1 }}
          />
        </FormControl>

        <FormControl fullWidth>
          <FormLabel>Uploader Notes (optional)</FormLabel>
          <ReactHookTextField
            control={control}
            name="notes"
            errorMessage={errors.notes}
            placeholder="Any additional comments go here..."
            sx={{ width: 1 }}
          />
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default SubmissionFormView;
