import { AccountCode, IndexCode, OtherProductReason } from 'shared';
import NERFormModal from '../../../components/NERFormModal';
import { OtherProductReasonPayload, useGetAllAccountCodes, useGetAllIndexCodes } from '../../../hooks/finance.hooks';
import * as yup from 'yup';
import { useToast } from '../../../hooks/toasts.hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { Box, FormControl, FormHelperText, MenuItem, OutlinedInput, Select, Typography } from '@mui/material';
import { codeAndRefundSourceName, displayEnum } from '../../../utils/pipes';
import ReactHookTextField from '../../../components/ReactHookTextField';

interface CategoryFormModalProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: OtherProductReason;
  onSubmit: (data: OtherProductReasonPayload) => void;
}

const schema = yup.object().shape({
  name: yup.string().required('Name is Required'),
  budget: yup.number().typeError('Budget must be a valid number').required('Budget is Required'),
  indexCodeId: yup.string().required('Index Code is Required'),
  accountCodeIds: yup
    .array()
    .of(yup.string().required())
    .required('Account Code is Required')
    .length(1, 'Account Code is Required')
});

const CategoryFormModal = ({ showModal, handleClose, defaultValues, onSubmit }: CategoryFormModalProps) => {
  const toast = useToast();
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<OtherProductReasonPayload>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name ? displayEnum(defaultValues?.name) : '',
      budget: defaultValues?.budget ?? 0,
      indexCodeId: defaultValues?.indexCode.indexCodeId ?? '',
      accountCodeIds: defaultValues?.accountCodes.map((accountCode) => accountCode.accountCodeId) ?? []
    }
  });

  const onFormSubmit = async (data: OtherProductReasonPayload) => {
    try {
      onSubmit(data);
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

  const {
    data: accountCodes,
    isLoading: accountCodesIsLoading,
    isError: accountCodesIsError,
    error: accountCodesError
  } = useGetAllAccountCodes();

  if (!indexCodes || indexCodesIsLoading || !accountCodes || accountCodesIsLoading) {
    return <LoadingIndicator />;
  }
  if (indexCodeIsError) {
    return <ErrorPage message={indexCodeError.message} />;
  }
  if (accountCodesIsError) {
    return <ErrorPage message={accountCodesError.message} />;
  }

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title={!!defaultValues ? 'Edit Category' : 'Add Category'}
      reset={() => reset({ name: '', budget: 0, indexCodeId: '', accountCodeIds: [] })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-category-form' : 'create-account-code-form'}
      showCloseButton
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: 300 }}>
        <FormControl fullWidth>
          <Typography color="#EF4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Index Code:*
          </Typography>
          <Controller
            name="indexCodeId"
            control={control}
            render={({ field: { onChange, value: formValue } }) => (
              <Select
                value={formValue}
                onChange={({ target: { value } }) => {
                  onChange(value);
                }}
                input={<OutlinedInput />}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <Typography style={{ color: '#aaa' }}>Select One</Typography>;
                  }
                  const selectedIndexCode = indexCodes.find((ic) => ic.indexCodeId === selected);
                  return selectedIndexCode ? codeAndRefundSourceName(selectedIndexCode) : '';
                }}
              >
                {indexCodes.map((indexCode: IndexCode) => (
                  <MenuItem key={indexCode.indexCodeId} value={indexCode.indexCodeId}>
                    {codeAndRefundSourceName(indexCode)}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          <FormHelperText error>{errors.indexCodeId?.message}</FormHelperText>
        </FormControl>
        <FormControl fullWidth>
          <Typography color="#EF4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Account Code:*
          </Typography>
          <Controller
            name="accountCodeIds"
            control={control}
            render={({ field: { onChange, value: formValue } }) => (
              <Select
                value={formValue}
                onChange={({ target: { value } }) => {
                  onChange(typeof value === 'string' ? value.split(',') : value);
                }}
                input={<OutlinedInput />}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected || selected.length === 0) {
                    return <Typography style={{ color: '#aaa' }}>Select One</Typography>;
                  }
                  const selectedAccountCode = accountCodes.find((ac) => ac.accountCodeId === selected[0]);
                  return selectedAccountCode ? `${selectedAccountCode.code} - ${selectedAccountCode.name}` : [];
                }}
              >
                {accountCodes.map((accountCode: AccountCode) => (
                  <MenuItem key={accountCode.accountCodeId} value={accountCode.accountCodeId}>
                    {accountCode.code} - {accountCode.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.accountCodeIds && <FormHelperText error>{errors.accountCodeIds.message}</FormHelperText>}
        </FormControl>
        <FormControl fullWidth>
          <Typography color="#EF4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Name:*
          </Typography>
          <ReactHookTextField name="name" control={control} placeholder="Enter Name" fullWidth />
          <FormHelperText error>{errors.name?.message}</FormHelperText>
        </FormControl>
        <FormControl fullWidth>
          <Typography color="#EF4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Budget:*
          </Typography>
          <ReactHookTextField name="budget" control={control} fullWidth />
          <FormHelperText error>{errors.budget?.message}</FormHelperText>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default CategoryFormModal;
