import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Vendor } from 'shared';
import { EditVendorPayload } from '../../../hooks/finance.hooks';

interface VenderFormModalProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: Vendor;
  onSubmit: (data: EditVendorPayload) => void;
  vendors: Vendor[];
}

const VendorFormModal = ({ showModal, handleClose, defaultValues, onSubmit, vendors }: VenderFormModalProps) => {
  const toast = useToast();

  const uniqueVendorTest = (name: string | undefined) =>
    name !== undefined && vendors !== undefined && !vendors.map((v) => v.name).includes(name);

  const schema = yup.object().shape({
    name: yup
      .string()
      .required('Vendor Name is Required')
      .test('unique-vendor-test', 'Vendor name must be unique', uniqueVendorTest)
  });

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

  const onFormSubmit = async (data: EditVendorPayload) => {
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
