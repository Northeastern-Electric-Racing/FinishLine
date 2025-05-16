import { IndexCode, AccountCode } from 'shared';
import { AccountCodePayload, useGetAllIndexCodes } from '../../../hooks/finance.hooks';
import { Controller, useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { Checkbox, FormControl, FormHelperText, Select, MenuItem, OutlinedInput, Box, Typography } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { codeAndRefundSourceName } from '../../../utils/pipes';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';

const schema = yup.object().shape({
  code: yup.number().typeError('Account Code must be a number').required('Account Code is Required'),
  name: yup.string().required('Account Name is Required'),
  amount: yup.number().optional(),
  allowed: yup.boolean().required('Allowed is Required'),
  indexCodeIds: yup.array().of(yup.string().required()).required()
});

interface AccountCodeFormModalProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: AccountCode;
  onSubmit: (data: AccountCodePayload) => void;
}

const AccountCodeFormModal = ({ showModal, handleClose, defaultValues, onSubmit }: AccountCodeFormModalProps) => {
  const toast = useToast();
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<AccountCodePayload>({
    resolver: yupResolver(schema),
    defaultValues: {
      code: defaultValues?.code,
      name: defaultValues?.name ?? '',
      amount: defaultValues?.amount ?? undefined,
      allowed: defaultValues?.allowed ?? false,
      indexCodeIds: defaultValues?.indexCodes.map((indexCode) => indexCode.indexCodeId) ?? []
    }
  });

  const onFormSubmit = async (data: AccountCodePayload) => {
    try {
      await onSubmit(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    handleClose();
  };

  const {
    data: indexCodes,
    isLoading: indexCodesIsLoading,
    isError: indexCodeIsError,
    error: indexCodeError
  } = useGetAllIndexCodes();

  if (!indexCodes || indexCodesIsLoading) {
    return <LoadingIndicator />;
  }
  if (indexCodeIsError) {
    return <ErrorPage message={indexCodeError.message} />;
  }

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title={!!defaultValues ? 'Edit Account Code' : 'Add Account Code'}
      reset={() => reset({ name: '', code: undefined, allowed: false, indexCodeIds: [] })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-account-code-form' : 'create-account-code-form'}
      showCloseButton
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: 350 }}>
        <FormControl fullWidth>
          <Typography color="#EF4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Index Code(s):*
          </Typography>
          <Controller
            name="indexCodeIds"
            control={control}
            render={({ field: { onChange, value: formValue } }) => (
              <Select
                multiple
                value={formValue}
                onChange={({ target: { value } }) => {
                  onChange(typeof value === 'string' ? value.split(',') : value);
                }}
                input={<OutlinedInput />}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected || selected.length === 0) {
                    return (
                      <Typography component="span" sx={{ color: '#aaa' }}>
                        Select Index Code(s)
                      </Typography>
                    );
                  }

                  const selectedLabels = indexCodes
                    .filter((code) => selected.includes(code.indexCodeId))
                    .map((code) => codeAndRefundSourceName(code))
                    .join(', ');

                  return selectedLabels;
                }}
              >
                {indexCodes.map((refundSource: IndexCode) => (
                  <MenuItem key={refundSource.indexCodeId} value={refundSource.indexCodeId}>
                    {codeAndRefundSourceName(refundSource)}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>
        <FormControl fullWidth>
          <Typography color="#EF4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Account Code:*
          </Typography>
          <ReactHookTextField name="code" control={control} placeholder="Enter Account Code" fullWidth />
          <FormHelperText error>{errors.code?.message}</FormHelperText>
        </FormControl>
        <FormControl fullWidth>
          <Typography color="#EF4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Description:*
          </Typography>
          <ReactHookTextField name="name" control={control} placeholder="Enter Description" fullWidth />
          <FormHelperText error>{errors.name?.message}</FormHelperText>
        </FormControl>
        <FormControl fullWidth>
          <Typography color="#EF4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Amount:
          </Typography>
          <ReactHookTextField name="amount" control={control} placeholder="Enter Amount" fullWidth />
          <FormHelperText error>{errors.amount?.message}</FormHelperText>
        </FormControl>
        <FormControl fullWidth>
          <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
            <Typography color="#EF4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
              Allowed?
            </Typography>
            <Controller
              name="allowed"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => {
                return <Checkbox onChange={onChange} checked={value} />;
              }}
            />
          </Box>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default AccountCodeFormModal;
