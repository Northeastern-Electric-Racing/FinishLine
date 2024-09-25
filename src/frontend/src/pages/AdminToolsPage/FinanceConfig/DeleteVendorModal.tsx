import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Vendor } from 'shared';
import { useDeleteVendor } from '../../../hooks/finance.hooks';

interface DeleteVendorModalProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: Vendor;
  vendor: Vendor;
}

const DeleteVendorModal = ({ showModal, handleClose, defaultValues, vendor }: DeleteVendorModalProps) => {
  const toast = useToast();

  const schema = yup.object().shape({
    name: yup.string().required('Vendor Name is Required')
  });

  const { mutateAsync: deleteVendor } = useDeleteVendor(vendor.vendorId);

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

  const onFormSubmit = async () => {
    try {
      await deleteVendor;
      console.log('deleted');
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
      title={`Delete Vendor: ${vendor.name}`}
      reset={() => reset({ name: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={'delete-vendor-form'}
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

export default DeleteVendorModal;
