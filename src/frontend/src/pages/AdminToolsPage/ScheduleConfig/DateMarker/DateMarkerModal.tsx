import { Box, FormControl, FormHelperText, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import NERFormModal from '../../../../components/NERFormModal';
import ReactHookTextField from '../../../../components/ReactHookTextField';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

export interface DateMarkerFormValues {
  name: string;
  date: Date | null;
}

const schema: yup.ObjectSchema<DateMarkerFormValues> = yup.object({
  name: yup.string().required('Name is required'),
  date: yup.date().nullable().required('Date is required')
});

export interface BaseDateMarkerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DateMarkerFormValues) => Promise<void>;
  initialValues?: DateMarkerFormValues;
}

const getDefaultValues = (): DateMarkerFormValues => ({
  name: '',
  date: null
});

const DateMarkerModal: React.FC<BaseDateMarkerModalProps> = ({ open, onClose, onSubmit, initialValues }) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<DateMarkerFormValues>({
    resolver: yupResolver(schema),
    defaultValues: initialValues || getDefaultValues()
  });

  const onFormSubmit = async (data: DateMarkerFormValues) => {
    await onSubmit(data);
    onClose();
    if (!initialValues) {
      reset(getDefaultValues());
    }
  };

  const handleCancel = () => {
    reset(getDefaultValues());
    onClose();
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleCancel}
      title={initialValues ? 'Edit Date Marker' : 'Add Date Marker'}
      reset={() => reset(initialValues || getDefaultValues())}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={initialValues ? 'edit-date-marker-form' : 'create-date-marker-form'}
      showCloseButton
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: 350 }}>
        <FormControl fullWidth>
          <Typography color="#ef4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Name:*
          </Typography>
          <ReactHookTextField name="name" control={control} placeholder="Date Marker Name" fullWidth />
          <FormHelperText error>{errors.name?.message}</FormHelperText>
        </FormControl>

        <FormControl fullWidth>
          <Typography color="#ef4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Date:*
          </Typography>
          <Controller
            name="date"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                value={value ? new Date(value) : null}
                onChange={(newValue) => onChange(newValue)}
                slotProps={{ textField: { fullWidth: true, error: !!errors.date } }}
              />
            )}
          />
          <FormHelperText error>{errors.date?.message}</FormHelperText>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default DateMarkerModal;
