import { FormControl } from '@mui/material';
import NERFormModal from '../../../components/NERFormModal';
import { useForm } from 'react-hook-form';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReactHookTextField from '../../../components/ReactHookTextField';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useToast } from '../../../hooks/toasts.hooks';
import { useReportRefund } from '../../../hooks/finance.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object().shape({
  refundAmount: yup
    .number()
    .required()
    .test('two decimals', 'Refund must be formatted as a dollar amount with at most two decimals', (value) => {
      if (!value) return false;
      return Math.floor(value * 100) === value * 100;
    })
    .typeError('The refund amount should be a valid number')
});

interface ReportRefundProps {
  modalShow: boolean;
  handleClose: () => void;
}

export interface ReportRefundInputs {
  newAccountCreditAmount: number;
}

const ReportRefundModal: React.FC<ReportRefundProps> = ({ modalShow, handleClose }: ReportRefundProps) => {
  const toast = useToast();
  const { isLoading, mutateAsync } = useReportRefund();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      refundAmount: ''
    },
    mode: 'onChange'
  });

  const handleConfirm = async (data: { refundAmount: number }) => {
    handleClose();
    try {
      await mutateAsync({ refundAmount: data.refundAmount * 100 });
      toast.success(`New Account Credit Amount #${data.refundAmount} Reported Successfully`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <NERFormModal
      open={modalShow}
      onHide={handleClose}
      title={'Report New Account Credit'}
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={handleConfirm}
      formId="reimbursement-form"
    >
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <FormControl>
          <ReactHookTextField
            name="refundAmount"
            control={control}
            sx={{
              width: 1,
              '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                display: 'none'
              }
            }}
            startAdornment={<AttachMoneyIcon />}
            errorMessage={errors.refundAmount}
          />
        </FormControl>
      )}
    </NERFormModal>
  );
};

export default ReportRefundModal;
