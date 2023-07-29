import { Box, FormControl } from '@mui/material';
import NERFormModal from '../../components/NERFormModal';
import { useForm } from 'react-hook-form';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NERFailButton from '../../components/NERFailButton';
import NERSuccessButton from '../../components/NERSuccessButton';
import ReactHookTextField from '../../components/ReactHookTextField';
import { useHistory, useParams } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useToast } from '../../hooks/toasts.hooks';
import { useReportRefund } from '../../hooks/finance.hooks';

interface ReportRefundViewProps {
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: ReportRefundInputs) => Promise<void>;
}

const ReportRefundView: React.FC<ReportRefundViewProps> = ({ modalShow, onHide, onSubmit }) => {
  const {
    handleSubmit,
    control,
    formState: { isValid },
    reset
  } = useForm({
    mode: 'onChange'
  });

  return (
    <NERFormModal
      open={modalShow}
      onHide={onHide}
      title={'Report New Account Credit'}
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
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
        <Box sx={{ display: 'flex', flexDirection: 'row', mb: 1, paddingTop: 20 }}>
          <NERSuccessButton sx={{ mx: 1 }} type="submit" form="reimbursement-form" onClick={onSubmit}>
            Submit
          </NERSuccessButton>
          <NERFailButton sx={{ mx: 1 }} form="reimbursement-form" onClick={onHide} disabled={!isValid}>
            Cancel
          </NERFailButton>
        </Box>
      </FormControl>
    </NERFormModal>
  );
};

interface ReportRefundProps {
  modalShow: boolean;
  handleClose: () => void;
}

export interface ReportRefundInputs {
  newAccountCreditAmount: number;
}

const ReportRefund: React.FC<ReportRefundProps> = ({ modalShow, handleClose }: ReportRefundProps) => {
  const history = useHistory();
  const toast = useToast();
  const id = useParams<{ id: string }>().id;
  const { isLoading, isError, error, mutateAsync } = useReportRefund(id);

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

  return <ReportRefundView modalShow={modalShow} onHide={handleClose} onSubmit={handleConfirm} />;
};

export default ReportRefund;
