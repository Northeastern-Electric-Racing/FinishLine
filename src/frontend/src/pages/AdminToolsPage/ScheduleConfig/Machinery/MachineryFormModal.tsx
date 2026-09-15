import { Box, FormControl, FormHelperText, Typography, MenuItem, Select, IconButton, Button } from '@mui/material';
import NERFormModal from '../../../../components/NERFormModal';
import ReactHookTextField from '../../../../components/ReactHookTextField';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useAllShops } from '../../../../hooks/calendar.hooks';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { Machinery } from 'shared';
import useFormPersist from 'react-hook-form-persist';
import { FormStorageKey } from '../../../../utils/form';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export interface ShopEntry {
  shopId: string;
  quantity: number;
}

export interface MachineryFormValues {
  machineName: string;
  shopEntries: ShopEntry[];
}

const createSchema = yup.object({
  machineName: yup.string().required('Machine Name is required'),
  shopEntries: yup
    .array()
    .of(
      yup.object({
        shopId: yup.string().required('Shop is required'),
        quantity: yup.number().required('Quantity is required').min(1, 'Quantity must be at least 1')
      })
    )
    .min(1, 'At least one shop is required')
});

const editSchema = yup.object({
  machineName: yup.string().required('Machine Name is required'),
  shopEntries: yup
    .array()
    .of(
      yup.object({
        shopId: yup.string().required('Shop is required'),
        quantity: yup.number().required('Quantity is required').min(0, 'Quantity cannot be negative')
      })
    )
    .required()
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

  const defaultValues: MachineryFormValues = { machineName: '', shopEntries: [{ shopId: '', quantity: 1 }] };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
    setValue
  } = useForm<MachineryFormValues>({
    resolver: yupResolver(initialValues ? editSchema : createSchema) as any,
    defaultValues: initialValues || defaultValues
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'shopEntries'
  });

  const formStorageKey = initialValues ? FormStorageKey.EDIT_MACHINERY : FormStorageKey.CREATE_MACHINERY;

  useFormPersist(formStorageKey, {
    watch,
    setValue
  });

  const onFormSubmit = async (data: MachineryFormValues) => {
    try {
      await onSubmit(data);
      onClose();
      if (!initialValues) {
        reset(defaultValues);
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error('An error occurred while saving the machinery');
      }
    }
  };

  const handleCancel = () => {
    reset(defaultValues);
    sessionStorage.removeItem(formStorageKey);
    onClose();
  };

  if (isLoading || !shops) return <LoadingIndicator />;

  const selectedShopIds = watch('shopEntries').map((entry) => entry.shopId);

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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: 400 }}>
        <FormControl fullWidth>
          <Typography color="#ef4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Machine:*
          </Typography>
          <ReactHookTextField name="machineName" control={control} placeholder="Machine Name" fullWidth />
          <FormHelperText error>{errors.machineName?.message}</FormHelperText>
        </FormControl>

        <Typography color="#ef4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20, mt: 1 }}>
          Shops:*
        </Typography>

        {fields.map((field, index) => {
          const availableShops = shops.filter(
            (shop) => shop.shopId === watch(`shopEntries.${index}.shopId`) || !selectedShopIds.includes(shop.shopId)
          );

          return (
            <Box key={field.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <FormControl sx={{ flex: 2 }}>
                <Controller
                  control={control}
                  name={`shopEntries.${index}.shopId`}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      value={value}
                      onChange={(event) => onChange(event.target.value)}
                      size="small"
                      sx={{ height: 40, width: '100%', textAlign: 'left' }}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select Shop
                      </MenuItem>
                      {availableShops.map((shop) => (
                        <MenuItem key={shop.shopId} value={shop.shopId}>
                          {shop.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText error>{errors.shopEntries?.[index]?.shopId?.message}</FormHelperText>
              </FormControl>

              <FormControl sx={{ flex: 1 }}>
                <ReactHookTextField
                  name={`shopEntries.${index}.quantity`}
                  control={control}
                  placeholder="Qty"
                  type="number"
                  fullWidth
                  sx={{ '& .MuiInputBase-root': { height: 40 } }}
                />
                <FormHelperText error>{errors.shopEntries?.[index]?.quantity?.message}</FormHelperText>
              </FormControl>

              {fields.length > 1 && (
                <IconButton size="small" onClick={() => remove(index)} sx={{ mt: 0.5 }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          );
        })}

        {errors.shopEntries?.message && <FormHelperText error>{errors.shopEntries.message}</FormHelperText>}

        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => append({ shopId: '', quantity: 1 })}
          disabled={fields.length >= shops.length}
          sx={{ alignSelf: 'flex-start', mt: 0.5 }}
        >
          Add Shop
        </Button>
      </Box>
    </NERFormModal>
  );
};

export default MachineryFormModal;
