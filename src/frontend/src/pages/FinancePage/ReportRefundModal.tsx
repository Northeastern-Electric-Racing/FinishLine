import { FormControl } from '@mui/material';
import NERFormModal from '../../components/NERFormModal';
import { useForm } from 'react-hook-form';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReactHookTextField from '../../components/ReactHookTextField';
import { useHistory, useParams } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useToast } from '../../hooks/toasts.hooks';
import { useReportRefund } from '../../hooks/finance.hooks';

interface ReportRefundProps {
  modalShow: boolean;
  handleClose: () => void;
}

export interface ReportRefundInputs {
  newAccountCreditAmount: number;
}

const ReportRefundModal: React.FC<ReportRefundProps> = ({ modalShow, handleClose }: ReportRefundProps) => {
  const history = useHistory();
  const toast = useToast();
  const id = useParams<{ id: string }>().id;
  const { isLoading, isError, error, mutateAsync } = useReportRefund(id);

  const {
    handleSubmit,
    control,
    formState: { isValid },
    reset
  } = useForm({
    mode: 'onChange'
  });

  const handleConfirm = async ({ newAccountCreditAmount }: ReportRefundInputs) => {
    handleClose();
    await mutateAsync(newAccountCreditAmount).catch((error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    });
    history.goBack();
    toast.success(`New Account Credit Amount #${newAccountCreditAmount} Reported Successfully`);
  };

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <NERFormModal
      open={modalShow}
      onHide={handleClose}
      title={'Report New Account Credit'}
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={handleConfirm}
      formId="reimbursement-form"
      disabled={!isValid}
    >
      <FormControl>
        <ReactHookTextField
          name="newAccountCreditAmount"
          control={control}
          sx={{ width: 1 }}
          type="number"
          startAdornment={<AttachMoneyIcon />}
        />
      </FormControl>
    </NERFormModal>
  );
};

export default ReportRefundModal;
