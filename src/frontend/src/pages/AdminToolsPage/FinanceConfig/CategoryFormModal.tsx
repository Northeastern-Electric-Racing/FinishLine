import { AccountCode, IndexCode, OtherProductReason } from 'shared';
import NERFormModal from '../../../components/NERFormModal';
import { OtherProductReasonPayload, useGetAllAccountCodes, useGetAllIndexCodes } from '../../../hooks/finance.hooks';
import * as yup from 'yup';
import { useToast } from '../../../hooks/toasts.hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from '@mui/material/styles';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { FormControl, FormHelperText, FormLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import { codeAndRefundSourceName } from '../../../utils/pipes';
import ReactHookTextField from '../../../components/ReactHookTextField';
interface CategoryFormModalProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: OtherProductReason;
  onSubmit: (data: OtherProductReasonPayload) => void;
}

const schema = yup.object().shape({
  name: yup.string().required('Name is Required'),
  budget: yup.number().required('Budget is Required'),
  indexCodeId: yup.string().required('Index Code is Required'),
  accountCodeIds: yup.array().of(yup.string().required()).required('Account Code is Required')
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
      name: defaultValues?.name ?? '',
      budget: defaultValues?.budget ?? 0,
      indexCodeId: defaultValues?.indexCode.indexCodeId ?? '',
      accountCodeIds: defaultValues?.accountCodes.map((accountCode) => accountCode.accountCodeId) ?? []
    }
  });
  const theme = useTheme();

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
      <FormControl fullWidth>
        <FormLabel>Index Code</FormLabel>
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
            >
              {indexCodes.map((indexCode: IndexCode) => (
                <MenuItem key={indexCode.indexCodeId} value={indexCode.indexCodeId}>
                  {codeAndRefundSourceName(indexCode)}
                </MenuItem>
              ))}
            </Select>
          )}
        />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Account Code</FormLabel>
        <Controller
          name="accountCodeIds"
          control={control}
          render={({ field: { onChange, value: formValue } }) => (
            <Select
              multiple
              value={formValue}
              onChange={({ target: { value } }) => {
                onChange(typeof value === 'string' ? value.split(',') : value);
              }}
              input={<OutlinedInput />}
            >
              {accountCodes.map((accountCode: AccountCode) => (
                <MenuItem key={accountCode.accountCodeId} value={accountCode.accountCodeId}>
                  {accountCode.accountCodeId}
                </MenuItem>
              ))}
            </Select>
          )}
        />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Name</FormLabel>
        <ReactHookTextField name="name" control={control} fullWidth />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Budget</FormLabel>
        <ReactHookTextField name="budget" control={control} fullWidth />
        <FormHelperText error>{errors.budget?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default CategoryFormModal;
