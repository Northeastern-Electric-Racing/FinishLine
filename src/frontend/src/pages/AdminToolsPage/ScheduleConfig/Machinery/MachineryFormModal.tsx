import { Box, FormControl, FormHelperText, Typography, MenuItem, Select } from '@mui/material';
import NERFormModal from '../../../../components/NERFormModal';
import ReactHookTextField from '../../../../components/ReactHookTextField';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useAllShops } from '../../../../hooks/calendar.hooks';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useEffect } from 'react';
import { Machinery } from 'shared';
import useFormPersist from 'react-hook-form-persist';
import { FormStorageKey } from '../../../../utils/form';

export interface MachineryFormValues {
  shopId: string;
  machineName: string;
  quantity: number;
}

const createSchema = yup.object({
  shopId: yup.string().required('Shop is required'),
  machineName: yup.string().required('Machine Name is required'),
  quantity: yup.number().required('Quantity is required').min(1, 'Quantity must be at least 1')
});

const editSchema = yup.object({
  shopId: yup.string().required('Shop is required'),
  machineName: yup.string().required('Machine Name is required'),
  quantity: yup.number().required('Quantity is required').min(0, 'Quantity cannot be negative')
});

interface MachineryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MachineryFormValues) => Promise<Machinery>;
  initialValues?: MachineryFormValues;
}

export const MachineryFormModal: React.FC<MachineryFormModalProps> = ({ open, onClose, onSubmit, initialValues }) => {
  const toast = useToast();
  const { isLoading, data: shops } = useAllShops();

  const defaultValues = { shopId: '', machineName: '', quantity: 1 };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
    setValue
  } = useForm<MachineryFormValues>({
    resolver: yupResolver(initialValues ? editSchema : createSchema),
    defaultValues: initialValues || defaultValues
  });

  const formStorageKey = initialValues ? FormStorageKey.EDIT_MACHINERY : FormStorageKey.CREATE_MACHINERY;

  useFormPersist(formStorageKey, {
    watch,
    setValue
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const onFormSubmit = async (data: MachineryFormValues) => {
    try {
      await onSubmit(data);
      // Only close and reset on success
      onClose();
      if (!initialValues) {
        reset(defaultValues);
      }
    } catch (e: unknown) {
      // Show error but don't close modal
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error('An error occurred while saving the machinery');
      }
      // Don't close modal on error so user can fix and retry
    }
  };

  const handleCancel = () => {
    reset(defaultValues);
    sessionStorage.removeItem(formStorageKey);
    onClose();
  };

  if (isLoading || !shops) return <LoadingIndicator />;

  return (
    <NERFormModal
      open={open}
      onHide={handleCancel}
      title={initialValues ? 'Edit Machine' : 'Add Machine:'}
      reset={() => reset(initialValues || defaultValues)}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={initialValues ? 'edit-machinery-form' : 'create-machinery-form'}
      showCloseButton
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: 350 }}>
        <FormControl fullWidth>
          <Typography color="#ef4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Shop:*
          </Typography>
          <Controller
            control={control}
            name="shopId"
            render={({ field: { onChange, value } }) => (
              <Select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                size="small"
                sx={{ height: 56, width: '100%', textAlign: 'left' }}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Shop
                </MenuItem>
                {shops.map((shop) => (
                  <MenuItem key={shop.shopId} value={shop.shopId}>
                    {shop.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          <FormHelperText error>{errors.shopId?.message}</FormHelperText>
        </FormControl>

        <FormControl fullWidth>
          <Typography color="#ef4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Machine:*
          </Typography>
          <ReactHookTextField name="machineName" control={control} placeholder="Machine Name" fullWidth />
          <FormHelperText error>{errors.machineName?.message}</FormHelperText>
        </FormControl>

        <FormControl fullWidth>
          <Typography color="#ef4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            # of Machines:*
          </Typography>
          <ReactHookTextField name="quantity" control={control} placeholder="Number of machines" type="number" fullWidth />
          <FormHelperText error>{errors.quantity?.message}</FormHelperText>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default MachineryFormModal;
