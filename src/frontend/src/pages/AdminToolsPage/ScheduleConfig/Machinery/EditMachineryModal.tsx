import { Box, FormControl, FormHelperText, Typography, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import NERFormModal from '../../../../components/NERFormModal';
import ReactHookTextField from '../../../../components/ReactHookTextField';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useAllShops } from '../../../../hooks/calendar.hooks';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useEffect } from 'react';

export interface EditMachineFormValues {
  machineName: string;
  shopId: string;
  quantity: number;
}

const schema = yup.object({
  shopId: yup.string().required('Shop is required'),
  machineName: yup.string().required('Machine Name is required'),
  quantity: yup.number().required('Quantity is required').min(1, 'Quantity must be at least 1')
});

interface EditMachineryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditMachineFormValues) => Promise<unknown> | unknown;
  initialValues?: EditMachineFormValues;
}

export const EditMachineryModal: React.FC<EditMachineryModalProps> = ({ open, onClose, onSubmit, initialValues }) => {
  const toast = useToast();
  const { isLoading, data: shops } = useAllShops();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<EditMachineFormValues>({
    resolver: yupResolver(schema),
    defaultValues: initialValues || { shopId: '', machineName: '', quantity: 1 }
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const onFormSubmit = async (data: EditMachineFormValues) => {
    try {
      await onSubmit(data);
    } catch (e: unknown) {
      if (e instanceof Error) toast.error(e.message);
    }
    onClose();
  };

  if (isLoading || !shops) return <LoadingIndicator />;

  return (
    <NERFormModal
      open={open}
      onHide={onClose}
      title="Edit Machine"
      reset={() => reset(initialValues || { shopId: '', machineName: '', quantity: 1 })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId="edit-machinery-form"
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
                onChange={(event: SelectChangeEvent<string>) => onChange(event.target.value)}
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
          <ReactHookTextField name="name" control={control} placeholder="Machine Name" fullWidth />
          <FormHelperText error>{errors.machineName?.message}</FormHelperText>
        </FormControl>

        <FormControl fullWidth>
          <Typography color="#ef4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            # of Machines:*
          </Typography>
          <Controller
            control={control}
            name="quantity"
            render={({ field: { onChange, value } }) => (
              <Select
                value={value.toString()}
                onChange={(event: SelectChangeEvent<string>) => onChange(parseInt(event.target.value))}
                size="small"
                sx={{ height: 56, width: '100%', textAlign: 'left' }}
                displayEmpty
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <MenuItem key={num} value={num.toString()}>
                    {num}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          <FormHelperText error>{errors.quantity?.message}</FormHelperText>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};
