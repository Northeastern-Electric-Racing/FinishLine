import { ExpenseType } from 'shared';
import NERFormModal from '../../components/NERFormModal';
import { Controller, useForm } from 'react-hook-form';
import ReactHookTextField from '../../components/ReactHookTextField';
import { Checkbox, FormLabel } from '@mui/material';

interface EditAccountCodeViewProps {
  showModal: boolean;
  onHide: () => void;
  onSubmit: () => Promise<void>;
  accountCode: ExpenseType;
}

const EditAccountCodeView: React.FC<EditAccountCodeViewProps> = ({
  showModal,
  onHide,
  onSubmit,
  accountCode
}: EditAccountCodeViewProps) => {
  const {
    handleSubmit,
    control,
    formState: { isValid },
    reset
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: accountCode.name,
      code: accountCode.code,
      allowed: accountCode.allowed
    }
  });

  return (
    <NERFormModal
      open={showModal}
      onHide={onHide}
      title={'Edit Account Code'}
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="edit-vendor-form"
      disabled={!isValid}
      showCloseButton
    >
      <FormLabel>Account Name</FormLabel>
      <ReactHookTextField name="name" control={control} fullWidth></ReactHookTextField>
      <FormLabel>Account Code</FormLabel>
      <ReactHookTextField name="code" control={control} fullWidth></ReactHookTextField>
      <FormLabel>Allowed?</FormLabel>
      <Controller
        name="allowed"
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => {
          return <Checkbox required id={`allowed-input`} onChange={onChange} checked={value} />;
        }}
      ></Controller>
    </NERFormModal>
  );
};

export default EditAccountCodeView;
