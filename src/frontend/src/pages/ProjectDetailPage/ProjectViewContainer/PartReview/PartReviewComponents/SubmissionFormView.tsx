import { Control, Controller, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';
import NERFormModal from '../../../../../components/NERFormModal';
import { FormControl, FormLabel } from '@mui/material';
import ReactHookTextField from '../../../../../components/ReactHookTextField';
import { SubmissionFormInput } from './SubmissionForm';
import NERAutocomplete from '../../../../../components/NERAutocomplete';
import { Box } from '@mui/system';

export interface SubmissionFormViewProps {
  submitText: 'Add' | 'Edit';
  handleSubmit: UseFormHandleSubmit<SubmissionFormInput>;
  onSubmit: (payload: SubmissionFormInput) => void;
  onHide: () => void;
  control: Control<SubmissionFormInput, any>;
  errors: FieldErrors<SubmissionFormInput>;
  open: boolean;
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
  setValue
}) => {
  return (
    <NERFormModal
      open={open}
      onHide={onHide}
      title={submitText + ' Submission'}
      reset={() => {}}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId={submitText + '-submission'}
      showCloseButton
    >
      <FormControl fullWidth>
        <FormLabel>
          Part
        </FormLabel>
        <Controller
          name="partName"
          control={control}
          render={({ field: { onChange, value } }) => {
            const mappedManufacturers = allParts
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(partsToAutocomplete);
            const onClear = () => {
              setValue('partName', '');
              onChange('');
            };
            return (
              <Box sx={{ alignItems: 'center' }}>
                <NERAutocomplete
                  sx={{ bgcolor: 'inherit' }}
                  id={'part'}
                  size="medium"
                  options={mappedManufacturers}
                  value={mappedManufacturers.find((part) => part.label === value) || null}
                  placeholder="Select Part"
                  onChange={(_event, newValue) => {
                    newValue ? onChange(newValue.id) : onClear();
                  }}
                />
              </Box>
            );
          }}
        />
      </FormControl>
      <FormControl fullWidth sx={{ mb: '10px' }}>
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
          name="pdmFileName"
          errorMessage={errors.notes}
          placeholder="Any additional comments go here..."
          sx={{ width: 1 }}
        />
      </FormControl>
    </NERFormModal>
  );
};

export default SubmissionFormView;
