import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import NERFormModal from '../../../components/NERFormModal';
import { Box, FormControl, FormLabel, MenuItem, Select, Typography } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useGetAllIndexCodes, useGetAllOtherProductReason } from '../../../hooks/finance.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { formatReasonName } from '../../../utils/reimbursement-request.utils';
import { CreateBudgetChangeRequestPayload } from '../../../hooks/change-requests.hooks';
import { createBudgetChangeRequest } from '../../../apis/change-requests.api';
import { useAuth } from '../../../hooks/auth.hooks';
import { ChangeRequestType } from 'shared';

const schema = yup.object().shape({
  category: yup.string().required('Reason is required'),
  updatedIndexCode: yup.string().required('Account is required'),
  updatedBudget: yup.number().positive('Amount must be positive').required('Amount is required')
});

interface EditBudgetInputs {
  category: string;
  updatedIndexCode: string;
  updatedBudget: number;
}

interface EditBudgetModalForReasonProps {
  showModal: boolean;
  handleClose: () => void;
}

export const EditBudgetModalForReason: React.FC<EditBudgetModalForReasonProps> = ({
  showModal,
  handleClose
}: EditBudgetModalForReasonProps) => {
  const {
    watch,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<EditBudgetInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      category: '',
      updatedIndexCode: '',
      updatedBudget: 0
    }
  });

  const currentCategoryId = watch('category');

  const auth = useAuth();

  const {
    data: indexCodes,
    isLoading: indexCodesIsLoading,
    isError: indexCodeIsError,
    error: indexCodeError
  } = useGetAllIndexCodes();

  const {
    data: otherReasons,
    isLoading: otherReasonsIsLoading,
    isError: otherReasonIsError,
    error: otherReasonError
  } = useGetAllOtherProductReason();

  if (!indexCodes || indexCodesIsLoading) {
    return <LoadingIndicator />;
  }
  if (indexCodeIsError) {
    return <ErrorPage message={indexCodeError.message} />;
  }

  if (!otherReasons || otherReasonsIsLoading) {
    return <LoadingIndicator />;
  }
  if (otherReasonIsError) {
    return <ErrorPage message={otherReasonError.message} />;
  }

  const onSubmit = async (data: EditBudgetInputs) => {
    if (!currentCategoryId) return;
    if (auth.user?.userId === undefined) throw new Error('Cannot create budget change request without being logged in');

    const currentCategory = otherReasons.find((reason) => reason.otherProductReasonId === currentCategoryId);
    if (!currentCategory) return;

    const payload: CreateBudgetChangeRequestPayload = {
      submitterId: auth.user?.userId,
      otherReasonId: currentCategoryId,
      proposedBudget: data.updatedBudget,
      type: ChangeRequestType.Budget
    };

    await createBudgetChangeRequest(payload.submitterId, payload.proposedBudget, payload.otherReasonId, undefined);

    handleClose();
  };

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      formId="edit-budget-form"
      title="Edit Budget"
      reset={() => reset()}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      cancelText="Cancel"
      submitText="Create Change Request"
      showCloseButton
    >
      <Box display="flex" flexDirection={'column'} minWidth={400}>
        <FormControl fullWidth>
          <FormLabel sx={{ alignSelf: 'start' }}>Category</FormLabel>
          <Controller
            control={control}
            name={'category'}
            render={({ field: { onChange, value } }) => (
              <Select
                displayEmpty
                value={value !== undefined ? value : ''}
                onChange={onChange}
                renderValue={(selected) => {
                  const selectedReason = otherReasons.find((r) => r.otherProductReasonId === selected);
                  return selectedReason ? (
                    formatReasonName(selectedReason.name)
                  ) : (
                    <Typography sx={{ color: 'gray' }}>Select category to allocate to</Typography>
                  );
                }}
                sx={{ height: 56, width: '100%', textAlign: 'left' }}
                fullWidth
                MenuProps={{
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right'
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                  }
                }}
              >
                {otherReasons.map((reason) => (
                  <MenuItem key={reason.otherProductReasonId} value={reason.otherProductReasonId}>
                    {formatReasonName(reason.name)}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>

        <FormControl fullWidth>
          <FormLabel sx={{ alignSelf: 'start' }}>Account</FormLabel>
          <Controller
            control={control}
            name={'updatedIndexCode'}
            render={({ field: { onChange, value } }) => (
              <Select
                displayEmpty
                value={value !== undefined ? value : ''}
                onChange={onChange}
                renderValue={(selected) => {
                  const code = indexCodes.find((c) => c.indexCodeId === selected);
                  return code ? code.name : <Typography sx={{ color: 'gray' }}>Select account</Typography>;
                }}
                sx={{ height: 56, width: '100%', textAlign: 'left' }}
                fullWidth
                MenuProps={{
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right'
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                  }
                }}
              >
                {indexCodes.map((code) => (
                  <MenuItem key={code.indexCodeId} value={code.indexCodeId}>
                    {code.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Amount</FormLabel>
          <ReactHookTextField
            placeholder={'New Amount'}
            name="updatedBudget"
            type="number"
            control={control}
            sx={{ width: 1 }}
            startAdornment={<AttachMoneyIcon />}
            errorMessage={errors.updatedBudget}
          />
        </FormControl>
      </Box>
    </NERFormModal>
  );
};
