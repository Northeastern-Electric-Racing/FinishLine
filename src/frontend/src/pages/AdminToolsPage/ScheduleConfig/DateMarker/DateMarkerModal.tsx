import { Box, FormControl, FormHelperText, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import NERFormModal from '../../../../components/NERFormModal';
import ReactHookTextField from '../../../../components/ReactHookTextField';
import { useToast } from '../../../../hooks/toasts.hooks';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// TODO: replace with the shared DateMarker type once the date marker endpoints are added
export interface DateMarker {
  dateMarkerId: string;
  name: string;
  date: Date;
}

export interface DateMarkerFormValues {
  name: string;
  date: Date;
}

const schema = yup.object({
  name: yup.string().required('Name is required'),
  date: yup.date().required('Date is required')
});

export interface BaseDateMarkerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DateMarkerFormValues) => Promise<DateMarker | unknown> | DateMarker | unknown;
  initialValues?: DateMarkerFormValues;
}

const getDefaultValues = (): DateMarkerFormValues => ({
  name: '',
  date: new Date()
});

const DateMarkerModal: React.FC<BaseDateMarkerModalProps> = ({ open, onClose, onSubmit, initialValues }) => {
  const toast = useToast();

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
    try {
      await onSubmit(data);
      onClose();
      if (!initialValues) {
        reset(getDefaultValues());
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error('An error occurred while saving the date marker');
      }
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
                onChange={(newValue) => onChange(newValue ?? new Date())}
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
