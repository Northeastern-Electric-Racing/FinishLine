import { useForm } from 'react-hook-form';
import NERFormModal from '../../components/NERFormModal';
import { Checkbox, FormLabel } from '@mui/material';
import ReactHookTextField from '../../components/ReactHookTextField';

interface NewAccountCodeViewProps {
  showModal: boolean;
  onHide: () => void;
  onSubmit: () => Promise<void>;
}

const NewAccountCodeView: React.FC<NewAccountCodeViewProps> = ({ showModal, onHide, onSubmit }: NewAccountCodeViewProps) => {
  const {
    handleSubmit,
    control,
    formState: { isValid },
    reset
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      accountName: '',
      accountCode: null,
      allowed: false
    }
  });

  return (
    <NERFormModal
      open={showModal}
      onHide={onHide}
      title="New Account Code"
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="new-account-code-form"
      disabled={!isValid}
      showCloseButton
    >
      <FormLabel>Account Name</FormLabel>
      <ReactHookTextField name="accountName" control={control} fullWidth />
      <FormLabel>Account Code</FormLabel>
      <ReactHookTextField name="accountCode" control={control} fullWidth />
      <FormLabel>Allowed?</FormLabel>
      <Checkbox name="allowed" />
    </NERFormModal>
  );
};

export default NewAccountCodeView;
