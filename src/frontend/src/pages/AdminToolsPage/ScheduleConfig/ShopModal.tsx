import { Box, FormControl, FormHelperText, Typography } from '@mui/material';
import NERFormModal from '../../../components/NERFormModal';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';

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
  onSubmit: (data: ShopFormValues) => Promise<unknown> | unknown;
  initialValues?: Partial<ShopFormValues>;
  title: string;
}

const ShopModal: React.FC<BaseShopModalProps> = ({ open, onClose, onSubmit, initialValues, title }) => {
  const toast = useToast();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<ShopFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? ''
    }
  });

  // keep defaults in sync when switching between shops while the modal is open
  React.useEffect(() => {
    reset({
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? ''
    });
  }, [initialValues, reset]);

  const onFormSubmit = async (data: ShopFormValues) => {
    try {
      await onSubmit(data);
      onClose();
      reset({ name: '', description: '' });
    } catch (e: unknown) {
      if (e instanceof Error) toast.error(e.message);
    }
  };

  return (
    <NERFormModal
      open={open}
      onHide={() => {
        onClose();
        reset({ name: '', description: '' });
      }}
      title={title}
      reset={() => reset({ name: '', description: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId="shop-form"
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
          <ReactHookTextField name="description" control={control} placeholder="Enter description" fullWidth />
          <FormHelperText error>{errors.description?.message}</FormHelperText>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default ShopModal;
