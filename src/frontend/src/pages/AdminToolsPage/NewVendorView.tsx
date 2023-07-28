import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import schema from 'yup/lib/schema';
import NERFormModal from '../../components/NERFormModal';
import { FormLabel } from '@mui/material';
import ReactHookTextField from '../../components/ReactHookTextField';

interface NewVendorViewProps {
  showModal: boolean;
  onHide: () => void;
  onSubmit: () => Promise<void>;
}

const NewVendorView: React.FC<NewVendorViewProps> = ({ showModal, onHide, onSubmit }: NewVendorViewProps) => {
  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset
  } = useForm({
    mode: 'onChange'
  });

  return (
    <NERFormModal
      open={showModal}
      onHide={onHide}
      title="New Vendor"
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="new-vendor-form"
      disabled={!isValid}
      showCloseButton
    >
      <FormLabel>Vendor Name</FormLabel>
      <ReactHookTextField name="vendor-name" control={control} sx={{ width: 1 }}></ReactHookTextField>
    </NERFormModal>
  );
};

export default NewVendorView;
