import { ClubAccount, ExpenseType } from 'shared';
import { ExpenseTypePayload } from '../../../hooks/finance.hooks';
import { Controller, useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { Checkbox, FormControl, FormLabel, FormHelperText, Autocomplete, TextField } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object().shape({
  code: yup.number().typeError('Account Code must be a number').required('Account Code is Required'),
  name: yup.string().required('Account Name is Required'),
  allowed: yup.boolean().required('Allowed is Required'),
  refundSource: yup.string().required('Refund Source is Required')
});

interface AccountCodeFormModalProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: ExpenseType;
  onSubmit: (data: ExpenseTypePayload) => void;
}

const AccountCodeFormModal = ({ showModal, handleClose, defaultValues, onSubmit }: AccountCodeFormModalProps) => {
  const toast = useToast();
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      code: defaultValues?.code,
      name: defaultValues?.name ?? '',
      allowed: defaultValues?.allowed ?? false,
      allowedRefundSources: defaultValues?.allowedRefundSources ?? []
    }
  });

  const onFormSubmit = async (data: ExpenseTypePayload) => {
    try {
      await onSubmit(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    handleClose();
  };

  const refundSourceToAutocompleteOption = (clubAccount: ClubAccount) => {
    return { id: clubAccount, label: `${clubAccount}` };
  };

  const refundSourceOptions = Object.values(ClubAccount).map(refundSourceToAutocompleteOption);

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title={!!defaultValues ? 'Edit Account Code' : 'Create Account Code'}
      reset={() => reset({ name: '', code: undefined, allowed: false })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-vendor-form' : 'create-vendor-form'}
      showCloseButton
    >
      <FormControl fullWidth>
        <FormLabel>Account Name</FormLabel>
        <ReactHookTextField name="name" control={control} fullWidth />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Refund Source</FormLabel>
        <Controller
          name="allowedRefundSources"
          control={control}
          render={({ field: { onChange, value: formValue } }) => (
            <Autocomplete
              isOptionEqualToValue={(option, value) => option.id === value.id}
              filterSelectedOptions
              multiple
              options={refundSourceOptions}
              getOptionLabel={(option) => option.label}
              onChange={(_, value) => onChange(value.map((v) => v.id))}
              value={formValue.map((v: string) => refundSourceOptions.find((o) => o.id === v)!)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  placeholder="Select Allowed Refund Source(s)"
                  error={!!errors.allowedRefundSources}
                />
              )}
            />
          )}
        />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Account Code</FormLabel>
        <ReactHookTextField name="code" control={control} fullWidth />
        <FormHelperText error>{errors.code?.message}</FormHelperText>
      </FormControl>
      <FormControl>
        <FormLabel>Allowed?</FormLabel>
        <Controller
          name="allowed"
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => {
            return <Checkbox onChange={onChange} checked={value} />;
          }}
        />
      </FormControl>
    </NERFormModal>
  );
};

export default AccountCodeFormModal;
