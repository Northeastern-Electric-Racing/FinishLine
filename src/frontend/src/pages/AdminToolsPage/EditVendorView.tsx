import { useForm } from 'react-hook-form';
import NERFormModal from '../../components/NERFormModal';
import { Vendor } from 'shared';
import { FormLabel } from '@mui/material';
import ReactHookTextField from '../../components/ReactHookTextField';

interface EditVendorViewProps {
  showModal: boolean;
  onHide: () => void;
  onSubmit: () => Promise<void>;
  vendor: Vendor;
}

const EditVendorView: React.FC<EditVendorViewProps> = ({ showModal, onHide, onSubmit, vendor }: EditVendorViewProps) => {
  const {
    handleSubmit,
    control,
    formState: { isValid },
    reset
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: vendor.name
    }
  });

  return (
    <NERFormModal
      open={showModal}
      onHide={onHide}
      title={`Edit Vendor`}
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="edit-vendor-form"
      disabled={!isValid}
      showCloseButton
    >
      <FormLabel>New Name</FormLabel>
      <ReactHookTextField name="name" control={control} fullWidth></ReactHookTextField>
    </NERFormModal>
  );
};

export default EditVendorView;
