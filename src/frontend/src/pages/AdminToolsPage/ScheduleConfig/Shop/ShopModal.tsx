import React from 'react';
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
  // Accept both branches: some returns were Promise<Shop>, others unknown
  onSubmit: (data: ShopFormValues) => Promise<Shop | unknown> | Shop | unknown;
  initialValues?: Partial<ShopFormValues>;
}

const ShopModal: React.FC<BaseShopModalProps> = ({ open, onClose, onSubmit, initialValues }) => {
  const toast = useToast();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<ShopFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: '', description: '' }
  });

  const frozenValuesRef = React.useRef<ShopFormValues>({ name: '', description: '' });

  React.useEffect(() => {
    if (open) {
      frozenValuesRef.current = {
        name: initialValues?.name ?? '',
        description: initialValues?.description ?? ''
      };
      reset(frozenValuesRef.current);
    } else {
      frozenValuesRef.current = { name: '', description: '' };
      reset(frozenValuesRef.current);
    }
  }, [open, initialValues, reset]);

  const computedTitle =
    frozenValuesRef.current.name !== '' || frozenValuesRef.current.description !== ''
      ? 'Edit Shop'
      : 'Create Shop';

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
      title={computedTitle}
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
