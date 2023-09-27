import { ClubAccount, ExpenseType } from 'shared';
import { ExpenseTypePayload } from '../../../hooks/finance.hooks';
import { Controller, useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { Checkbox, FormControl, FormLabel, ListItemText, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object().shape({
  code: yup.number().required('Account Code is Required'),
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
    formState: { isValid },
    reset
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      code: defaultValues?.code,
      name: defaultValues?.name ?? '',
      allowed: defaultValues?.allowed ?? false,
      allowedRefundSources: defaultValues?.allowedRefundSources ?? []
    }
  });

  const [refundSourcesMultiSelect, setRefundSourcesMultiSelect] = React.useState<ClubAccount[]>([]);
  const handleChange = (event: SelectChangeEvent<typeof refundSourcesMultiSelect>) => {
    const {
      target: { value }
    } = event;
    setRefundSourcesMultiSelect(typeof value === 'string' ? value.split(',') : value);
  };

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

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title={!!defaultValues ? 'Edit Account Code' : 'Create Account Code'}
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-vendor-form' : 'create-vendor-form'}
      disabled={!isValid}
      showCloseButton
    >
      <FormControl fullWidth>
        <FormLabel>Account Name</FormLabel>
        <ReactHookTextField name="name" control={control} fullWidth />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Refund Source</FormLabel>
        <Select
          name="allowedRefundSources"
          multiple
          value={refundSourcesMultiSelect}
          onChange={handleChange}
          renderValue={(selected) => selected.join(', ')}
        >
          {refundSourcesMultiSelect.map((account) => (
            <MenuItem key={account} value={account}>
              <Checkbox checked={refundSourcesMultiSelect.indexOf(account) > -1} />
              <ListItemText primary={account} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Account Code</FormLabel>
        <ReactHookTextField name="code" control={control} fullWidth />
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
