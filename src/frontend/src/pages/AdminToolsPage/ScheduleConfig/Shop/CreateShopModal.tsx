import { Box, FormControl, FormHelperText, Typography } from '@mui/material';
import NERFormModal from '../../../../components/NERFormModal';
import ReactHookTextField from '../../../../components/ReactHookTextField';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Shop } from 'shared';

export interface CreateShopFormValues {
  name: string;
  description: string;
}

const schema = yup.object({
  name: yup.string().required('Shop Name is required'),
  description: yup.string().required('Description is required')
});

interface CreateShopModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateShopFormValues) => Promise<Shop>;
}

export const CreateShopModal: React.FC<CreateShopModalProps> = ({ open, onClose, onSubmit }) => {
  const toast = useToast();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<CreateShopFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: '', description: '' }
  });

  const onFormSubmit = async (data: CreateShopFormValues) => {
    try {
      await onSubmit(data);
    } catch (e: unknown) {
      if (e instanceof Error) toast.error(e.message);
    }
    onClose();
    reset({ name: '', description: '' });
  };

  return (
    <NERFormModal
      open={open}
      onHide={onClose}
      title="Add Shop:"
      reset={() => reset({ name: '', description: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId="create-shop-form"
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
export default CreateShopModal;
