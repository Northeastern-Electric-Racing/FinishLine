import { Controller, useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/system';
import useFormPersist from 'react-hook-form-persist';
import { FormStorageKey } from '../../../utils/form';
import { Milestone } from 'shared/src/types/milestone-types';
import { CreateMilestonePayload } from '../../../hooks/recruitment.hooks';
import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';

interface MilestoneFormModalProps {
  open: boolean;
  handleClose: () => void;
  defaultValues?: Milestone;
  onSubmit: (data: CreateMilestonePayload) => Promise<Milestone>;
}

const schema = yup.object().shape({
  name: yup.string().required('Milestone is Required'),
  description: yup.string().required('Description is Required'),
  dateOfEvent: yup.date().required('Date of Event is Required')
});

const MilestoneFormModal: React.FC<MilestoneFormModalProps> = ({ open, handleClose, defaultValues, onSubmit }) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const onFormSubmit = async (data: CreateMilestonePayload) => {
    await onSubmit(data);
    handleClose();
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      dateOfEvent: defaultValues?.dateOfEvent ? new Date(defaultValues.dateOfEvent) : new Date()
    }
  });

  const formStorageKey = defaultValues ? FormStorageKey.EDIT_MILESTONE : FormStorageKey.CREATE_MILESTONE;

  useFormPersist(formStorageKey, {
    watch,
    setValue
  });

  const handleCancel = () => {
    reset({ name: '', description: '', dateOfEvent: new Date() });
    sessionStorage.removeItem(formStorageKey);
    handleClose();
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleCancel}
      title="New Milestone"
      reset={() => reset({ name: '', description: '', dateOfEvent: new Date() })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId="milestone-form"
      showCloseButton
    >
      <FormControl fullWidth>
        <FormLabel sx={{ alignSelf: 'start' }}>Milestone Date</FormLabel>
        <Controller
          name="dateOfEvent"
          control={control}
          render={({ field: { onChange, value } }) => (
            <DatePicker
              value={new Date(value)}
              open={datePickerOpen}
              onClose={() => setDatePickerOpen(false)}
              onOpen={() => setDatePickerOpen(true)}
              onChange={(newValue) => {
                onChange(newValue ? newValue : new Date());
              }}
              slotProps={{
                textField: {
                  error: !!errors.dateOfEvent,
                  helperText: errors.dateOfEvent?.message,
                  onClick: () => setDatePickerOpen(true),
                  inputProps: { readOnly: true },
                  fullWidth: true
                }
              }}
            />
          )}
        />
        <FormHelperText error>{errors.dateOfEvent?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Milestone*</FormLabel>
        <ReactHookTextField
          name="name"
          control={control}
          sx={{ width: 1 }}
          placeholder="Write the name of the milestone/event here"
        />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <Box style={{ display: 'flex', verticalAlign: 'middle', alignItems: 'center' }}>
          <FormLabel>Description*</FormLabel>
        </Box>
        <ReactHookTextField
          name="description"
          control={control}
          placeholder="Add additional information about or related to the milestone here."
        />
        <FormHelperText error>{errors.description?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default MilestoneFormModal;
