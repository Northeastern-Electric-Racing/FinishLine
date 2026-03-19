import { Box, FormControl, FormHelperText, Typography } from '@mui/material';
import NERFormModal from '../../../../components/NERFormModal';
import ReactHookTextField from '../../../../components/ReactHookTextField';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Shop } from 'shared';

export interface ShopFormValues {
  name: string;
  description: string;
}

const schema = yup.object({
  name: yup.string().required('Shop Name is required'),
  description: yup.string().required('Description is required')
});

export interface BaseShopModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ShopFormValues) => Promise<Shop | unknown> | Shop | unknown;
  initialValues?: ShopFormValues;
}

const defaultValues: ShopFormValues = {
  name: '',
  description: ''
};

const ShopModal: React.FC<BaseShopModalProps> = ({ open, onClose, onSubmit, initialValues }) => {
  const toast = useToast();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<ShopFormValues>({
    resolver: yupResolver(schema),
    defaultValues: initialValues || defaultValues
  });

  const onFormSubmit = async (data: ShopFormValues) => {
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
        toast.error('An error occurred while saving the shop');
      }
    }
  };

  const handleCancel = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleCancel}
      title={initialValues ? 'Edit Shop' : 'Create Shop'}
      reset={() => reset(initialValues || defaultValues)}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={initialValues ? 'edit-shop-form' : 'create-shop-form'}
      showCloseButton
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: 350 }}>
        <FormControl fullWidth>
          <Typography color="#ef4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Shop:*
          </Typography>
          <ReactHookTextField name="name" control={control} placeholder="Shop Name" fullWidth />
          <FormHelperText error>{errors.name?.message}</FormHelperText>
        </FormControl>

        <FormControl fullWidth>
          <Typography color="#ef4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Description:*
          </Typography>
          <ReactHookTextField
            name="description"
            control={control}
            placeholder="Enter description"
            fullWidth
            multiline
            rows={4}
          />
          <FormHelperText error>{errors.description?.message}</FormHelperText>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default ShopModal;
