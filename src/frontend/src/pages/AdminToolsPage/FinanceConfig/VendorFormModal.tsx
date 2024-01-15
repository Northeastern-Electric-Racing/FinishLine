import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Vendor } from 'shared';
import { VendorTypePayload } from '../../../hooks/finance.hooks';

const schema = yup.object().shape({
  name: yup.string().required('Vendor Name is Required')
});

interface VenderFormModalProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: Vendor;
  onSubmit: (data: VendorTypePayload) => void;
}

const VendorFormModal = ({ showModal, handleClose, defaultValues, onSubmit }: VenderFormModalProps) => {
  const toast = useToast();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? ''
    }
  });

  const onFormSubmit = async (data: VendorTypePayload) => {
    try {
        await onSubmit(data);
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error.message);
        }
    }
    handleClose();
  };

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title={!!defaultValues ? 'Edit Vendor' : 'Create Vendor'}
      reset={() => reset({ name: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-vendor-form' : 'create-vendor-form'}
      showCloseButton
    >
      <FormControl>
        <FormLabel>Vendor Name</FormLabel>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default VendorFormModal;
